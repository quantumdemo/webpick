/* Shared bot protection for anonymous forms. Message contents stay with Sitepeel.
   Tokens work once: every request that asks gets its own, in order. A check that neither
   finishes nor asks the visitor anything is restarted, so nobody is told to "finish" a
   check they never saw. */
(() => {
  let apiLoad;
  function loadApi(){
    if(window.turnstile)return Promise.resolve();
    if(!apiLoad)apiLoad=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      const fail=()=>{clearTimeout(timer);script.remove();apiLoad=null;reject(Error('The security check could not load. Check your connection and try again.'));};
      const timer=setTimeout(fail,12000);
      script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
      script.onload=()=>{clearTimeout(timer);window.turnstile?resolve():fail();};script.onerror=fail;
      document.head.append(script);
    });
    return apiLoad;
  }
  window.SitepeelFormProtection={create(form,action){
    const container=form.querySelector('[data-form-challenge]'),shell=container.closest('.ft-challenge');
    // The check shows as a pop-up: it lives on <body> so no section can cover it or scroll
    // over it, and it follows the form's busy state (the page locks while it shows).
    if(shell){
      if(shell.parentElement!==document.body)document.body.append(shell);
      const sync=()=>shell.classList.toggle('busy',form.hasAttribute('data-busy'));
      sync();new MutationObserver(sync).observe(form,{attributes:true,attributeFilter:['data-busy']});
    }
    let widget,token='',preparing,done=false,sitekey,widgetSize,observer,interactive=false,restarts=0,watch=null,solving=0;
    const waiters=[];
    const setInteractive=on=>{interactive=on;container.dataset.interactive=String(on);shell?.setAttribute('aria-hidden',String(!on));};
    setInteractive(false);
    // Ask Turnstile for a new token (the last one was used, expired or stuck).
    function refresh(){token='';solving=performance.now();if(widget!==undefined&&!done)try{window.turnstile.reset(widget);}catch{}}
    function failAll(error){clearTimeout(watch);watch=null;while(waiters.length){waiters.shift().reject(error);}}
    // A token goes to the oldest request waiting, and the next one starts at once
    // (for the next request in line, or ready for the next run).
    function deliver(value){
      restarts=0;
      const next=waiters.shift();
      if(!next){token=value;return;}
      next.resolve(value);
      refresh();
      if(!waiters.length){clearTimeout(watch);watch=null;}
    }
    // Restart a check that has worked 15 s without a result or a question (up to twice),
    // and give up with a clear message only after 50 s, or after 2 minutes while the
    // visitor has a check to do.
    function tick(){
      watch=null;
      if(done||!waiters.length)return;
      const age=performance.now()-waiters[0].since;
      if(interactive){if(age>120000)return failAll(Error('Please finish the security check and try again.'));}
      else if(age>50000)return failAll(Error('The security check didn’t finish. Please try again.'));
      else if(widget!==undefined&&restarts<2&&performance.now()-solving>15000){restarts++;refresh();}
      watch=setTimeout(tick,1000);
    }
    async function prepare(){
      if(done||widget!==undefined)return;
      if(!preparing)preparing=(async()=>{
        const [response]=await Promise.all([fetch('/api/forms/options',{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(12000)}),loadApi()]);
        const options=await response.json();
        if(!response.ok||!options.ok||!options.sitekey)throw Error('The security check is temporarily unavailable. Please try again shortly.');
        if(done)return;
        sitekey=options.sitekey;
        const render=()=>{
          const size=(container.clientWidth||form.clientWidth)>=300?'flexible':'compact';
          if(done||(widget!==undefined&&size===widgetSize))return;
          if(widget!==undefined){window.turnstile.remove(widget);token='';}
          widgetSize=size;solving=performance.now();
          widget=window.turnstile.render(container,{
          sitekey,action,theme:'dark',size,appearance:'interaction-only','response-field':false,
          callback:value=>{setInteractive(false);deliver(value);},
          'before-interactive-callback':()=>setInteractive(true),
          'after-interactive-callback':()=>setInteractive(false),
          'expired-callback':()=>{token='';},
          'timeout-callback':()=>{token='';setInteractive(false);if(waiters.length)refresh();},
          'error-callback':()=>{token='';setInteractive(false);if(waiters.length){if(restarts<2){restarts++;setTimeout(refresh,800);}else failAll(Error('The security check could not finish. Please try again.'));}return true;}
          });
        };
        render();observer=new ResizeObserver(render);observer.observe(form);
      })().finally(()=>{preparing=null;});
      return preparing;
    }
    // Start early: on focus, or as soon as the pointer is over the form (Safari doesn't
    // focus buttons on click, so example buttons would otherwise start it late).
    const early=()=>{void prepare().catch(()=>{});};
    form.addEventListener('focusin',early,{once:true});
    form.addEventListener('pointerover',early,{once:true});
    return {
      // Each call returns a token nobody else gets; the next one is made right away.
      async token(){
        await prepare();
        if(token){const value=token;refresh();return value;}
        return new Promise((resolve,reject)=>{waiters.push({resolve,reject,since:performance.now()});if(!watch)watch=setTimeout(tick,1000);});
      },
      // Kept for callers: token() already starts the next token as it hands one out.
      reset(){},
      destroy(){done=true;token='';observer?.disconnect();failAll(Error('Form completed.'));if(widget!==undefined)window.turnstile.remove(widget);container.replaceChildren();setInteractive(false);}
    };
  }};
})();
