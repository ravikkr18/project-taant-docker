import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LocationWrapper from "@/components/LocationWrapper";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Premium Store - Modern E-Commerce Experience",
  description: "A beautiful, full-width e-commerce store inspired by storefrontui.io",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="w-full">
          <AuthProvider>
            <LocationWrapper>
              <Header />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
            </LocationWrapper>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}