"use client";

import { LogoutButton } from "@/components/LogoutButton";
import { isMarketOpenIST } from "@/lib/market";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/live", label: "Live" },
  { href: "/", label: "Home" },
  { href: "/proof/daily", label: "Daily Trades" },
  { href: "/proof/monthly", label: "Monthly" },
  { href: "/community", label: "Community" },
];

type NavbarProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
};

export function Navbar({ isLoggedIn, isAdmin }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const marketOpen = isMarketOpenIST();

  return (
    <header className="sticky top-8 z-40 border-b border-white/10 bg-[#080808]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-white">
          <Image src="/twe-logo.png" alt="Trade With Experts logo" width={42} height={24} className="h-7 w-auto" priority />
          <span className="font-heading text-xl font-bold tracking-wide">Trade With Experts</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-zinc-300 transition hover:text-white">
              {item.label}
              {item.href === "/live" ? (
                <span
                  className={`ml-2 inline-block h-2 w-2 rounded-full ${marketOpen ? "animate-pulse bg-[#00FF7F]" : "bg-zinc-500"}`}
                />
              ) : null}
            </Link>
          ))}

          {isAdmin ? <Link href="/admin" className="text-sm text-zinc-300 transition hover:text-white">Admin</Link> : null}
          {isLoggedIn ? <Link href="/profile" className="text-sm text-zinc-300 transition hover:text-white">Profile</Link> : null}
          {!isLoggedIn ? <Link href="/login" className="text-sm text-zinc-300 transition hover:text-white">Login</Link> : null}
          {!isLoggedIn ? <Link href="/register" className="rounded-full border border-[#00AAFF]/50 px-3 py-1 text-sm text-[#9cddff]">Sign Up</Link> : null}
          {isLoggedIn ? <LogoutButton className="text-sm text-zinc-300 transition hover:text-white" /> : null}
        </nav>

        <button
          aria-label="Toggle navigation"
          className="rounded-md border border-white/20 p-2 text-white md:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open ? (
        <nav className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-300 transition hover:text-white"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin ? (
            <Link href="/admin" className="text-sm text-zinc-300 transition hover:text-white" onClick={() => setOpen(false)}>
              Admin
            </Link>
          ) : null}
          {isLoggedIn ? (
            <Link href="/profile" className="text-sm text-zinc-300 transition hover:text-white" onClick={() => setOpen(false)}>
              Profile
            </Link>
          ) : null}
          {!isLoggedIn ? (
            <Link href="/login" className="text-sm text-zinc-300 transition hover:text-white" onClick={() => setOpen(false)}>
              Login
            </Link>
          ) : null}
          {!isLoggedIn ? (
            <Link href="/register" className="text-sm text-zinc-300 transition hover:text-white" onClick={() => setOpen(false)}>
              Sign Up
            </Link>
          ) : null}
          {isLoggedIn ? (
            <LogoutButton
              className="text-left text-sm text-zinc-300 transition hover:text-white"
              onDone={() => setOpen(false)}
            />
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}
