import Link from "next/link";

export default function AdminLayout({ children }) {
  // Common button class to ensure consistent height and styling
  const navLinkClass =
    "inline-flex items-center px-3 py-2 h-10 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link
            href="/admin/dashboard"
            className="text-2xl font-bold text-gray-900"
          >
            Admin Dashboard
          </Link>
          <div className="space-x-4">
            <Link href="/admin/dashboard" className={navLinkClass}>
              Dashboard
            </Link>
            <Link href="/admin/products" className={navLinkClass}>
              Products
            </Link>
            <Link href="/admin/orders" className={navLinkClass}>
              View Orders
            </Link>
            <Link href="/admin/users" className={navLinkClass}>
              Users
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}