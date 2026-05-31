import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-indigo-800 text-white shadow-md">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold hover:text-sky-200">
            🐦 Bird Finder
          </Link>

          <div className="flex gap-6">
            <Link href="/" className="hover:text-sky-200 font-medium">
              Home
            </Link>
            <Link href="/birds" className="hover:text-sky-200 font-medium">
              Birds
            </Link>
            <Link href="/favorites" className="hover:text-sky-200 font-medium">
              Favorites
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
