import { useEffect } from "react";
import { useLocation } from "wouter";

const SITE_URL = "https://abhay-nobles-project.vercel.app";
const SITE_NAME = "Shri Abhay Nobles Senior Secondary School";
const DEFAULT_IMAGE = `${SITE_URL}/opengraph.jpg`;

type SeoConfig = {
  title: string;
  description: string;
  path: string;
  robots?: string;
  type?: "website" | "article";
  image?: string;
  schema?: Record<string, unknown> | Record<string, unknown>[];
};

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    document.head.appendChild(tag);
  }
  Object.entries(attrs).forEach(([key, value]) => tag!.setAttribute(key, value));
}

function upsertLink(rel: string, href: string) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!tag) {
    tag = document.createElement("link");
    tag.rel = rel;
    document.head.appendChild(tag);
  }
  tag.href = href;
}

function setStructuredData(schema?: SeoConfig["schema"]) {
  const existing = document.getElementById("seo-structured-data");
  if (!schema) {
    existing?.remove();
    return;
  }

  const script = existing ?? document.createElement("script");
  script.id = "seo-structured-data";
  script.setAttribute("type", "application/ld+json");
  script.textContent = JSON.stringify(schema);
  if (!existing) {
    document.head.appendChild(script);
  }
}

function getSeo(pathname: string): SeoConfig {
  const homepageSchema = [
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/school-logo.jpg`,
      image: DEFAULT_IMAGE,
      email: "shriabhaynoble@gmail.com",
      telephone: "+91-9413078545",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Near Ganpat Colony",
        addressLocality: "Takhatgarh",
        addressRegion: "Rajasthan",
        postalCode: "306901",
        addressCountry: "IN",
      },
      sameAs: ["https://maps.app.goo.gl/JiNJ5UtsD7LEBxrn7"],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Are admissions open at Shri Abhay Nobles Senior Secondary School?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Admissions are open for the current academic session, and parents can submit an enquiry or request the prospectus online.",
          },
        },
        {
          "@type": "Question",
          name: "Where is Shri Abhay Nobles Senior Secondary School located?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The school is located near Ganpat Colony, Takhatgarh, Rajasthan 306901, India.",
          },
        },
        {
          "@type": "Question",
          name: "Which board curriculum does the school follow?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The school highlights RBSE-based education along with academics, facilities, sports, and student development.",
          },
        },
      ],
    },
  ];

  if (pathname === "/gallery") {
    return {
      title: `School Photo Gallery | ${SITE_NAME}`,
      description:
        "Explore campus life, school events, sports, and cultural activities at Shri Abhay Nobles Senior Secondary School in Takhatgarh, Rajasthan.",
      path: "/gallery",
      type: "website",
      schema: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
            name: "School Photo Gallery",
            url: `${SITE_URL}/gallery`,
            about: SITE_NAME,
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Gallery", item: `${SITE_URL}/gallery` },
            ],
          },
        ],
      },
    };
  }

  if (pathname === "/teacher/login") {
    return {
      title: `Teacher Login | ${SITE_NAME}`,
      description: "Teacher portal login for Shri Abhay Nobles Senior Secondary School.",
      path: "/teacher/login",
      robots: "noindex, nofollow",
    };
  }

  if (pathname === "/teacher/dashboard") {
    return {
      title: `Teacher Dashboard | ${SITE_NAME}`,
      description: "Teacher dashboard for Shri Abhay Nobles Senior Secondary School.",
      path: "/teacher/dashboard",
      robots: "noindex, nofollow",
    };
  }

  if (pathname === "/student/portal") {
    return {
      title: `Student Portal | ${SITE_NAME}`,
      description: "Student portal for Shri Abhay Nobles Senior Secondary School.",
      path: "/student/portal",
      robots: "noindex, nofollow",
    };
  }

  if (pathname === "/admin/login") {
    return {
      title: `Admin Login | ${SITE_NAME}`,
      description: "Admin portal login for Shri Abhay Nobles Senior Secondary School.",
      path: "/admin/login",
      robots: "noindex, nofollow",
    };
  }

  if (pathname === "/admin/dashboard") {
    return {
      title: `Admin Dashboard | ${SITE_NAME}`,
      description: "Admin dashboard for Shri Abhay Nobles Senior Secondary School.",
      path: "/admin/dashboard",
      robots: "noindex, nofollow",
    };
  }

  if (pathname !== "/") {
    return {
      title: `Page Not Found | ${SITE_NAME}`,
      description: "The page you are looking for could not be found.",
      path: pathname,
      robots: "noindex, nofollow",
    };
  }

  return {
    title: `${SITE_NAME} | Best RBSE School in Takhatgarh, Rajasthan`,
    description:
      "Shri Abhay Nobles Senior Secondary School offers RBSE-based education, admissions, academics, facilities, sports, and student development in Takhatgarh, Rajasthan.",
    path: "/",
    type: "website",
    schema: homepageSchema,
  };
}

export function SeoManager() {
  const [location] = useLocation();

  useEffect(() => {
    const seo = getSeo(location);
    const canonicalUrl = `${SITE_URL}${seo.path}`;
    const title = seo.title;
    const description = seo.description;
    const robots = seo.robots ?? "index, follow, max-image-preview:large";
    const image = seo.image ?? DEFAULT_IMAGE;

    document.documentElement.lang = "en";
    document.title = title;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: seo.type ?? "website" });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_NAME });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
    upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: "en_IN" });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
    upsertLink("canonical", canonicalUrl);
    setStructuredData(seo.schema);
  }, [location]);

  return null;
}
