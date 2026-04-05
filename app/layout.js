import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import Link from "next/link";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
import {
  Instagram,
  Twitter,
  Linkedin,
  ArrowRight,
  Mail,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "AI Coach",
    template: "%s | AI Coach",
  },
  description: "An AI Career Coach App",
};

const footerLinks = {
  Product: [
    { href: "/dashboard", label: "Industry Insights" },
    { href: "/resume", label: "Resume Builder" },
    { href: "/ai-cover-letter", label: "Cover Letters" },
    { href: "/interview", label: "Interview Prep" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/careers", label: "Careers" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ],
  Support: [
    { href: "/help", label: "Help Center" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group inline-flex items-center gap-2 text-sm text-white/65 transition-colors hover:text-white"
            >
              <span>{item.label}</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterFeature({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-medium text-white">{title}</p>
      <p className="mt-1 text-xs leading-6 text-white/60">{description}</p>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <ClerkProvider appearance={{ baseTheme: dark }}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.08),transparent_24%)]">
              <Header />
              <main className="flex-1 pt-20">{children}</main>

              <footer className="relative mt-16 overflow-hidden border-t border-white/10 bg-neutral-950/95">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),transparent_28%)]" />
                <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-8">
                  <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
                    <div className="space-y-6">
                      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
                        <Sparkles className="h-3.5 w-3.5" />
                        Sensi AI
                      </div>

                      <div className="max-w-xl space-y-4">
                        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                          Build your career with an AI assistant that feels polished and reliable.
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                          Get personalized industry insights, craft stronger resumes,
                          generate tailored cover letters, and practice interviews in
                          one focused workflow.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          href="/dashboard"
                          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.02] hover:bg-white/90"
                        >
                          Explore Dashboard
                          <ArrowRight className="h-4 w-4" />
                        </Link>

                        <Link
                          href="/contact"
                          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
                        >
                          <Mail className="h-4 w-4" />
                          Contact Support
                        </Link>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <FooterFeature
                          icon={ShieldCheck}
                          title="Secure by default"
                          description="Authenticated flows and guarded actions."
                        />
                        <FooterFeature
                          icon={Sparkles}
                          title="AI-powered tools"
                          description="Resume, cover letter, and interview help."
                        />
                        <FooterFeature
                          icon={Mail}
                          title="Support ready"
                          description="Built for clear user guidance and quick help."
                        />
                      </div>
                    </div>

                    <div className="grid gap-10 sm:grid-cols-3 lg:pt-4">
                      {Object.entries(footerLinks).map(([title, links]) => (
                        <FooterColumn key={title} title={title} links={links} />
                      ))}
                    </div>
                  </div>

                  <div className="my-10 border-t border-white/10" />

                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-white/60">
                        &copy; {new Date().getFullYear()} Sensi AI. All rights reserved.
                      </p>
                      <p className="text-xs text-white/40">
                        Designed for a focused, production-grade career workflow.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                      <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Twitter"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                      <a
                        href="https://www.linkedin.com/in/arun-kumar-singh-19334a29b/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </footer>

              <Toaster richColors />
            </div>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
