"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function Navbar() {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/pricing" as const, label: t("pricing") },
    { href: "/blog" as const, label: t("blog") },
    { href: "/about" as const, label: t("about") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <nav className="section-container flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-black tracking-widest text-white">
          KYMIZ
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Link href="/login" className="btn-ghost text-sm px-4 py-2">
            {t("login")}
          </Link>
          <Link href="/register" className="btn-primary text-sm px-4 py-2">
            {t("getStarted")}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={t("openMenu")}
        >
          <span className={`h-0.5 w-6 bg-white transition-all ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-6 bg-white transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 bg-white transition-all ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-6 md:hidden">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-gray-400 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/login" className="btn-ghost text-center text-sm px-4 py-2">
              {t("login")}
            </Link>
            <Link href="/register" className="btn-primary text-center text-sm">
              {t("getStarted")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
