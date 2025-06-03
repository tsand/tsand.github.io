import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    title: "Theisen Sanders - Software Engineer",
    description:
        "Personal portfolio of Theisen Sanders, a software engineer specializing in full-stack development and cloud architecture.",
    keywords: [
        "software engineer",
        "full stack developer",
        "cloud architecture",
        "web development",
        "Theisen Sanders",
    ],
    authors: [{ name: "Theisen Sanders", url: "https://theisensanders.com" }],
    creator: "Theisen Sanders",
    openGraph: {
        title: "Theisen Sanders - Software Engineer",
        description: "Personal portfolio of Theisen Sanders, Software Engineer",
        url: "https://theisensanders.com",
        siteName: "Theisen Sanders Portfolio",
        type: "website",
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: "Theisen Sanders - Software Engineer",
        description: "Personal portfolio of Theisen Sanders",
    },
    icons: {
        icon: "/favicon.svg",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
