export const siteConfig = {
  name: "KYMIZ",
  description: "KYMIZ — Plataforma SaaS avanzada para equipos modernos",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://kymiz.vercel.app",
  ogImage: "/og.png",
  links: {
    twitter: "https://twitter.com/kymiz",
    github: "https://github.com/kymiz",
  },
} as const;

export type SiteConfig = typeof siteConfig;
