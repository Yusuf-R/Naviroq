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
            <head>
                <link href='https://api.mapbox.com/mapbox-gl-js/v2.8.1/mapbox-gl.css' rel='stylesheet' />
            </head>

            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <ReactQueryProvider>
                    {children}
                </ReactQueryProvider>
                <Toaster
                    richColors
                    duration={4000}
                    position="top-right"
                    reverseOrder={false}
                    closeOnClick
                    expand={true}
                />
            </body>
        </html>
    );
}