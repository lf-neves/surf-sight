import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ApolloClientWrapper } from "@/lib/ApolloWrapper";
import { StoreProvider } from "@/lib/StoreProvider";
import { AuthProvider } from "@/lib/auth/useCurrentUser";

export const metadata: Metadata = {
  title: "SurfSight Dashboard Design",
  description: "Surf conditions dashboard",
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <StoreProvider>
          <ApolloClientWrapper>
            <AuthProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </AuthProvider>
          </ApolloClientWrapper>
        </StoreProvider>
      </body>
    </html>
  );
}
