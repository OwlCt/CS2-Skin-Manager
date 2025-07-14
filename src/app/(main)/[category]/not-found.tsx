import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
        <span className="text-4xl">🔍</span>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">
        Category Not Found
      </h1>

      <p className="text-muted-foreground mb-6 max-w-md">
        The requested category doesn't exist or has no weapons available.
      </p>

      <Link
        href="/"
        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
