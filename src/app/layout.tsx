import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import React from 'react';
// import {StrictMode} from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

export const metadata: Metadata = {
  metadataBase: new URL('https://oldschoolgame.vercel.app'),
  title: "Old School Game",
  description: "Step back in time with Old School Game, where classic games meet modern-day brain training! Sharpen your mind and have fun with nostalgic games, all designed to boost your cognitive power and keep your brain in top shape.l",
  openGraph:{
    type: "website",
    url: "https://oldschoolgame.vercel.app/",
    title: "Old School Game",
    description: "Step back in time with Old School Game, where classic games meet modern-day brain training! Sharpen your mind and have fun with nostalgic games, all designed to boost your cognitive power and keep your brain in top shape.",
    siteName: "Old School Game",
    images: [{   url: "/oldschoolgame.webp",   }],
  },
  twitter:{
    card: "summary_large_image",
    site: "https://oldschoolgame.vercel.app/",
    creator: "Old School Game",
    description:"Step back in time with Old School Game, where classic games meet modern-day brain training! Sharpen your mind and have fun with nostalgic games, all designed to boost your cognitive power and keep your brain in top shape.",
    images: "/oldschoolgame.webp"
  }

};

export default function RootLayout( {
  children,
}: Readonly <{
  children: React.ReactNode;
}> ) {

  

    return (
    <html lang="en">
    <body className={`${geistSans.variable} ${geistMono.variable}`}>

    {/*<StrictMode>*/}
    <main>


      <Navbar/>

      {children}
      <div className="paperOverlay"></div>

      <Footer/>
    </main>
    {/*</StrictMode>*/}

    </body>
    </html>
    );
}

