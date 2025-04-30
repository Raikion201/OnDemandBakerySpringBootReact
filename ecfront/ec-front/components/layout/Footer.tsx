import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 md:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-base font-medium">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:underline">All Products</Link></li>
              <li><Link href="#" className="hover:underline">Featured Items</Link></li>
              <li><Link href="#" className="hover:underline">New Arrivals</Link></li>
              <li><Link href="#" className="hover:underline">Special Offers</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-base font-medium">About</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:underline">Our Story</Link></li>
              <li><Link href="#" className="hover:underline">Blog</Link></li>
              <li><Link href="#" className="hover:underline">Testimonials</Link></li>
              <li><Link href="#" className="hover:underline">Careers</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-base font-medium">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:underline">Contact Us</Link></li>
              <li><Link href="#" className="hover:underline">FAQs</Link></li>
              <li><Link href="#" className="hover:underline">Shipping & Returns</Link></li>
              <li><Link href="#" className="hover:underline">Track Your Order</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-base font-medium">Connect With Us</h3>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Link>
            </div>
            <div className="space-y-2 text-sm">
              <p>Contact: info@bakedelights.com</p>
              <p>Phone: (555) 123-4567</p>
            </div>
          </div>
        </div>
        <div className="border-t pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2023 BakeDelights. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="#" className="text-muted-foreground hover:underline">Privacy Policy</Link>
            <Link href="#" className="text-muted-foreground hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
