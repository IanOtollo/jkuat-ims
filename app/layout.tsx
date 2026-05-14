import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/lib/auth/context";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "JKUAT IMS | Emergency Incident Management",
  description: "Official security operations terminal for Jomo Kenyatta University of Agriculture and Technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-accent selection:text-background">
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
