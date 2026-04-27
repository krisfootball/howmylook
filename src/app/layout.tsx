import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FlowRedirect } from "@/components/flow-redirect";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HowMyLook",
  description: "Quick outfit feedback with yes or no voting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <FlowRedirect />
        {children}
      </body>
    </html>
  );
}
