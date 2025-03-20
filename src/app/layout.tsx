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
  title: "TestGem",
  description: "Test papers empowered by AI.... Click to learn more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <header className="flex border-b justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <Link href="/" className="text-lg font-[600] hover:text-indigo-700 cursor-pointer">Create</Link>
              <Link href="/dashboard" className="text-lg font-[600] hover:text-indigo-700 cursor-pointer">Dashboard</Link>
              {/* <Link href="/interactiveTest" className="text-lg font-[600] hover:text-indigo-700 cursor-pointer">Interactive Tests</Link>  - Currently in development*/}
              <UserButton />
            </SignedIn>
          </header>

          {children}
          
        </body>
      </html>
    </ClerkProvider>
  );
}
