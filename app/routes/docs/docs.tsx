import { Link, Outlet } from "@remix-run/react";

export default function DocsLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <nav className="w-64 border-r p-4 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Klint Docs</h1>
        </div>

        <div className="space-y-6">
          <Section title="Getting Started">
            <NavLink to="/docs">Introduction</NavLink>
            <NavLink to="/docs/installation">Installation</NavLink>
            <NavLink to="/docs/quickstart">Quick Start</NavLink>
            <NavLink to="/docs/examples/basic">Test Link</NavLink>
          </Section>

          <Section title="Core Concepts">
            <NavLink to="/docs/canvas">Canvas</NavLink>
            <NavLink to="/doc/typography">Typography</NavLink>
            <NavLink to="/docs/colors">Colors</NavLink>
          </Section>

          <Section title="Plugins">
            <NavLink to="/docs/plugins/animation">Animation</NavLink>
            <NavLink to="/docs/plugins/effects">Effects</NavLink>
          </Section>

          <Section title="Examples">
            <NavLink to="/docs/examples/basic">Basic Usage</NavLink>
            <NavLink to="/docs/examples/advanced">Advanced</NavLink>
          </Section>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-500">{title}</h2>
      <div className="space-y-1 ml-2">{children}</div>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="block text-sm hover:text-blue-500 transition-colors"
    >
      {children}
    </Link>
  );
}
