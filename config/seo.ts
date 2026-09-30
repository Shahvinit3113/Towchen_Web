import { Metadata } from "next";
import { siteConfig } from "./site";

interface MetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrlRelative?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title,
  description = siteConfig.description,
  keywords = [
    "towing service",
    "roadside assistance",
    "24/7 tow truck",
    "flatbed towing",
    "battery jumpstart",
    "emergency vehicle recovery",
    "puncture repair",
    "car breakdown assistance",
  ],
  canonicalUrlRelative = "",
  ogImage = siteConfig.ogImage,
  noIndex = false,
}: MetadataProps = {}): Metadata {
  const fullTitle = title
    ? `${title} | ${siteConfig.name} 24/7 Roadside Network`
    : `${siteConfig.name} - 24/7 On-Demand Towing & Roadside Assistance`;

  const canonicalUrl = `${siteConfig.url}${canonicalUrlRelative}`;

  return {
    title: fullTitle,
    description,
    keywords,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
      creator: "@towchain",
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EmergencyService",
    name: siteConfig.name,
    image: siteConfig.ogImage,
    url: siteConfig.url,
    telephone: siteConfig.emergencyPhoneRaw,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.headquarters.address,
      addressLocality: siteConfig.headquarters.city,
      addressRegion: siteConfig.headquarters.state,
      postalCode: siteConfig.headquarters.postalCode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 28.4986,
      longitude: 77.0878,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    areaServed: [
      "Delhi NCR",
      "Mumbai",
      "Bengaluru",
      "Hyderabad",
      "Pune",
      "Chennai",
    ],
  };
}

export function generateFaqSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateServiceSchema(
  service: { title: string; fullDesc: string; basePrice: number }
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.fullDesc,
    provider: {
      "@type": "EmergencyService",
      name: siteConfig.name,
      telephone: siteConfig.emergencyPhoneRaw,
    },
    offers: {
      "@type": "Offer",
      price: service.basePrice,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };
}
