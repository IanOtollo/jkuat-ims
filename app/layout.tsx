import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/lib/auth/context";
import { ToastProvider } from "@/components/ui/Toast";
import { getProfile } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "JKUAT IMS | Emergency Incident Management",
  description: "Official security operations terminal for Jomo Kenyatta University of Agriculture and Technology.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfile();

  return (
    <html lang="en">
      <body className="antialiased selection:bg-accent selection:text-background">
        <ToastProvider>
          <AuthProvider initialProfile={profile}>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
