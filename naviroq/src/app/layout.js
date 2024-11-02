"use client";
import ReactQueryProvider from "@/components/ReactQuery/ReactQueryProvider";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
        <Toaster
          richColors
          duration={2000}
          position="top-right"
          reverseOrder={false}
          closeOnClick
        />
      </body>
    </html>
  );
}
