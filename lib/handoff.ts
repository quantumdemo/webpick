export interface HandoffPayload {
  id: string;
  url: string;
  title: string;
  extractedAt: string;
  designMd: string;
  tokens: any;
  components: any;
  prompts: any;
  assets: any;
  wcagReport: any;
  techStack: any;
  slopReport?: any;
  needVision?: any;
}

const STORAGE_KEY = 'webpicks-handoff';

export function saveHandoff(payload: HandoffPayload): void {
  if (typeof window === 'undefined') return;
  try {
    const data = {
      ...payload,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save handoff to localStorage', err);
  }
}

export function loadHandoff(id?: string): HandoffPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (id && data.id !== id) return null;
    return data;
  } catch (err) {
    console.warn('Failed to load handoff from localStorage', err);
    return null;
  }
}
