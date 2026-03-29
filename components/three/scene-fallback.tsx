export function SceneFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-purple/5 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-accent-purple-light/3 blur-2xl" />
    </div>
  )
}
