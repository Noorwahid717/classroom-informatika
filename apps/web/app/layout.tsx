import "@total-typescript/ts-reset";
import "../styles/globals.css";
import type { Metadata } from "next";
import { ReactQueryProvider } from "../components/react-query-provider";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "../components/ui/toaster";
import { AuthProvider } from "../components/auth-provider";
import { auth } from "../auth";

export const metadata: Metadata = {
  title: "Classroom Informatika",
  description: "Portal pembelajaran internal untuk kelas informatika",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Classroom Informatika",
    description: "Portal pembelajaran internal untuk kelas informatika",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Classroom Informatika"
      }
    ]
  }
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SentryProviders>
          <AuthProvider session={session}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <ReactQueryProvider>
                {children}
                <Toaster />
              </ReactQueryProvider>
            </ThemeProvider>
          </AuthProvider>
        </SentryProviders>
      </body>
    </html>
  );
}

let sentryInitPromise: Promise<void> | null = null;

function ensureSentryInitialized() {
  if (sentryInitPromise || process.env.NEXT_RUNTIME === "edge") {
    return;
  }
  sentryInitPromise = import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0
    });
  });
}

function SentryProviders({ children }: { children: React.ReactNode }) {
  ensureSentryInitialized();
  return <>{children}</>;
}
