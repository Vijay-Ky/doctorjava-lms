import RefCapture from '@/components/RefCapture';
import Script from "next/script";
import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.doctorjava.tech"),
  title: {
    default: "Doctor Java Technologies | Java Full Stack Training in Bangalore",
    template: "%s | Doctor Java Technologies",
  },
  icons: {
    icon: [
      { url: "/logo-icon.webp", type: "image/webp" },
      { url: "/logo-icon.png", type: "image/png" },
    ],
    apple: "/logo-icon.png",
    shortcut: "/logo-icon.png",
  },
  description:
    "India's premium Java Full Stack + AI training institute. 9+ years of experience, 6,000+ students trained, placement-focused mentorship in Bangalore. Learn. Build. Deploy. Succeed.",
  keywords: [
    "Java Full Stack course Bangalore",
    "Doctor Java Technologies",
    "Java training institute",
    "Spring Boot course",
    "Full Stack Developer training",
    "placement guarantee Java course",
  ],
  authors: [{ name: "Doctor Java Technologies" }],
  openGraph: {
    title: "Doctor Java Technologies | Become an Industry-Ready Java Full Stack Developer",
    description:
      "9+ years of experience. 6,000+ students trained. Placement-focused Java Full Stack + AI program in Bangalore.",
    url: "https://www.doctorjava.tech",
    siteName: "Doctor Java Technologies",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Doctor Java Technologies",
    description:
      "India's premium Java Full Stack + AI training institute. Learn. Build. Deploy. Succeed.",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Doctor Java Technologies",
  description:
    "Premium Java Full Stack and AI training institute in Bangalore with 9+ years of experience and 6,000+ students trained.",
  url: "https://www.doctorjava.tech",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bangalore",
    addressRegion: "Karnataka",
    addressCountry: "IN",
  },
  sameAs: [
    "https://www.linkedin.com/company/doctor-java-technologies",
    "https://www.youtube.com/@doctorjavatechnologies",
    "https://www.instagram.com/doctorjavatechnologies",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased">
        <SmoothScroll><RefCapture />{children}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" /></SmoothScroll>
      </body>
    </html>
  );
}
