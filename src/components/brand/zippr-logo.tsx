export function ZipprLogo({ className = "" }: { className?: string }) {
  return (
    <h1
      className={`select-none font-black tracking-tighter text-white ${className}`}
      style={{ letterSpacing: "-0.12em" }}
    >
      <span className="inline-block scale-x-[0.72] origin-center">z</span>
      <span className="inline-block scale-x-[0.78] origin-center">i</span>
      <span className="inline-block scale-x-[0.85] origin-center">p</span>
      <span className="inline-block scale-x-[0.92] origin-center">p</span>
      <span className="inline-block scale-x-100 origin-center text-violet-light">r</span>
      <span className="inline-block scale-x-[0.92] origin-center">.</span>
      <span className="inline-block scale-x-[0.85] origin-center">i</span>
      <span className="inline-block scale-x-[0.78] origin-center">n</span>
      <span className="inline-block scale-x-[0.72] origin-center">k</span>
    </h1>
  );
}
