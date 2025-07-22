"use client";

import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

export default function AppHeader() {
  return (
    <header className="w-full py-4 border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          <span className="text-xl font-bold text-blue-600">MediCare</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 text-sm text-gray-700 font-medium">
            <Link href="/">Home</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/about">About</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>

          {/* Clerk User Avatar Dropdown */}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
