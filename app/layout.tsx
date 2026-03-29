import { Navbar } from "@/components/Navbar";
import { NoticeBar } from "@/components/NoticeBar";
import { getSiteSettings } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trade With Experts",
  description: "NIFTY50 institutional-style trading proof and community platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const notice = settings.find((entry) => entry.key === "notice_text")?.value ?? "Proof-first trading. Updates every day.";

  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  let isAdmin = false;
  if (user?.id) {
    const { data } = await client.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);

    isAdmin = Boolean(data?.is_admin) || adminEmails.includes((user.email ?? "").toLowerCase());
  }

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#080808] text-white">
        <NoticeBar text={notice} />
        <Navbar isLoggedIn={Boolean(user)} isAdmin={isAdmin} />
        <div className="pt-6">{children}</div>
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ? (
          <Script
            defer
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
