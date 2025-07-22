import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import Link from "next/link";
import { dark } from '@clerk/themes';
import { Toaster } from "sonner";
import { Instagram, Twitter, Linkedin } from "lucide-react";


const inter=Inter({subsets: ["latin"]});

export const metadata = {
  title: "AI Coach",
  description: "An AI Career Coach App",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
    appearance={{
      baseTheme:dark,
    }}
    >
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className}`}
        >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
            >
            {/* header */}
            <Header/>
            <main className="min-h-screen">{children}</main>
            <Toaster richColors/>
            {/* footer */}
  <footer className="bg-neutral-900 text-gray-300 pt-12 pb-8 px-4 mt-16">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-y-10 md:gap-x-16">

            {/* Branding */}
            <div className="md:ml-12">
              <h2 className="text-2xl font-bold text-white mb-3">Sensi AI</h2>
              <p className="text-sm leading-relaxed">
                Your personal AI career coach. Get smart guidance, build resume,
                and take interview quizzes — all powered by AI.
              </p>
            </div>

            {/* Product Links */}
            <div className="md:ml-20">
      <h3 className="text-lg font-semibold text-white mb-2">Product</h3>
      <ul className="text-sm space-y-1">
        <li><Link href="/features" className="hover:text-white transition">Features</Link></li>
        <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
        <li><Link href="/demo" className="hover:text-white transition">Live Demo</Link></li>
        <li><Link href="/download" className="hover:text-white transition">Get Started</Link></li>
      </ul>
    </div>

            {/* Company Info */}
            <div className="md:ml-8">
              <h3 className="text-lg font-semibold text-white mb-2">Company</h3>
              <ul className="text-sm space-y-1">
                <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white transition">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Support</h3>
              <ul className="text-sm space-y-1">
                <li><Link href="/help" className="hover:text-white transition">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><a href="mailto:support@sensi-ai.com" className="hover:text-white transition">Email Support</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 my-6"></div>

          {/* Bottom Bar */}
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-sm text-gray-500 px-4">
  <p className="mb-3">© 2025 Sensi AI. All rights reserved.</p>
  <div className="flex space-x-4">
    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
      <Instagram className="w-5 h-5" />
    </a>
    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
      <Twitter className="w-5 h-5" />
    </a>
    <a href="https://www.linkedin.com/in/arun-kumar-singh-19334a29b/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
      <Linkedin className="w-5 h-5" />
    </a>
  </div>
</div>
        </footer>

          </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
