import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "FTL iMeeting",
  description: "Meeting room booking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-gray-100 font-sans antialiased">
        <Providers>
          <Navbar />
          <Sidebar />
          <main className="ml-16 mt-14 min-h-[calc(100vh-3.5rem)] p-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
