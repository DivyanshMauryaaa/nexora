import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindForge",
  description: "Documents, tasks and more, all in one place. Empowered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} cz-shortcut-listen="false">
          <header className="flex border-b border-gray-200 justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
                <Link href="/" className="text-lg font-[600] hover:text-blue-700 cursor-pointer">Create</Link>
                <Link href="/dashboard" className="text-lg font-[600] hover:text-blue-700 cursor-pointer">Dashboard</Link>
                <Link href="/tasks" className="text-lg font-[600] hover:text-indigo-700 cursor-pointer">Tasks</Link>
                <UserButton />
            </SignedIn>
          </header>

          {children}

        </body>
      </html>
    </ClerkProvider>
  );
}
