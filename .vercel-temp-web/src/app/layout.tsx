import type { Metadata } from "next";
import { AppSessionProvider } from "@/components/session-provider";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://classroom-informatika.vercel.app'),
  title: "Classroom Informatika | SMA Wahidiyah Kediri",
  description: "Sistem penilaian mata pelajaran Informatika dengan upload tugas ZIP, lingkungan kode interaktif berbasis Monaco Editor, dan penilaian otomatis untuk SMA Wahidiyah Kediri.",
  keywords: [
    "Classroom Informatika",
    "SMA Wahidiyah Kediri",
    "sistem penilaian informatika",
    "upload tugas ZIP",
    "preview kode",
    "penilaian otomatis",
    "Monaco Editor",
    "HTML CSS JavaScript",
    "learning management system",
    "pendidikan informatika",
    "SMA Wahidiyah",
    "Kediri"
  ],
  authors: [{ name: "SMA Wahidiyah Kediri" }],
  creator: "Classroom Informatika | SMA Wahidiyah Kediri",
  publisher: "SMA Wahidiyah Kediri",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://classroom-informatika.vercel.app",
    title: "Classroom Informatika | SMA Wahidiyah Kediri",
    description: "Sistem penilaian mata pelajaran Informatika dengan upload tugas ZIP, lingkungan kode interaktif berbasis Monaco Editor, dan penilaian otomatis",
    siteName: "Classroom Informatika",
    images: [
      {
        url: "/og-classroom.jpg",
        width: 1200,
        height: 630,
        alt: "Classroom Informatika - SMA Wahidiyah Kediri"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Classroom Informatika | SMA Wahidiyah Kediri", 
    description: "Sistem penilaian mata pelajaran Informatika dengan upload tugas ZIP, lingkungan kode interaktif berbasis Monaco Editor, dan penilaian otomatis",
    images: ["/og-classroom.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  verification: {
    google: "classroom-informatika-verification"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">
        <AppSessionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AppSessionProvider>
      </body>
    </html>
  );
}
