import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <h1 className="text-6xl font-bold text-accent">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-foreground">Page not found</h2>
      <p className="mt-2 text-foreground-secondary max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 inline-flex h-10 items-center rounded-xl bg-accent px-6 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}
