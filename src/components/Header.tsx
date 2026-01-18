export default function Header() {
  return (
    <header className="py-6 border-b border-neutral-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
        <span className="text-sm font-semibold text-neutral-900">Afterhours</span>
        <nav className="flex gap-4 text-sm text-neutral-600">
          <a href="/">Overview</a>
          <a href="/pricing">Pricing</a>
          <a href="/trial">Start Trial</a>
        </nav>
      </div>
    </header>
  );
}
