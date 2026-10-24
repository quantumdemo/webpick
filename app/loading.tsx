export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-zinc-400 font-medium">Loading WebPicks Studio...</p>
    </div>
  );
}
