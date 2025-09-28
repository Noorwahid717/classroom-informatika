export function Spotlight() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-48 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/40 blur-3xl" />
    </div>
  );
}
