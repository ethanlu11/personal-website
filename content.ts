// All site copy and links live here. Edit this file to update the site;
// components read from it and shouldn't need to change.

import type { SocialIconName } from "@/components/SocialIcon";

export type Link = { label: string; href: string };

// A square org logo, LinkedIn-style. Images live in /public/logos.
// `bg` fills the tile behind the image; `cover` fills the tile edge to edge
// (for square artwork). With no `src`, the tile shows `initials` instead.
export type Logo = { src?: string; bg?: string; cover?: boolean; initials?: string };

const logos = {
  ey: { src: "/logos/ey-parthenon-square.png", bg: "#2e2e38", cover: true },
  nysw: { src: "/logos/nysw.png", bg: "#000000" },
  be1space: { src: "/logos/be1space.png", bg: "#000000" },
  jollibee: { src: "/logos/jollibee.png", bg: "#ffffff", cover: true },
  nyuHsrn: { src: "/logos/nyu-hsrn.png", bg: "#ffffff", cover: true },
  nyuPmc: { src: "/logos/nyu-pmc.jpg", bg: "#222222", cover: true },
  techAtNyu: { src: "/logos/tech-at-nyu.jpg", bg: "#000000", cover: true },
  eze: { src: "/logos/ezetracking.png", bg: "#f3f2ee", cover: true },
} satisfies Record<string, Logo>;

export const site = {
  name: "Ethan Lu",
  title: "Ethan Lu",
  description:
    "Junior at NYU studying Business Technology Management. Builder from Cebu, Philippines, based in New York.",
  // Used for absolute Open Graph URLs. Update once you have a custom domain.
  url: process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000",
};

export const hero = {
  // Portraits beside the globe, in /public/photos, shown as airplane windows.
  // `position` picks the crop and `zoom` (optional) moves in on that spot, for
  // shots taken from farther back.
  photos: [
    { src: "/photos/ethan-park.jpg", alt: "Ethan Lu in a navy polo under the trees in a park", position: "50% 12%" },
    { src: "/photos/ethan-suit.jpg", alt: "Ethan Lu in a black suit by floor-to-ceiling windows", position: "50% 42%", zoom: 1.3 },
  ],
};

// Pins on the hero globe. Latitude north and longitude east are positive.
export const globePins: { label: string; lat: number; lon: number }[] = [
  { label: "Cebu", lat: 10.3157, lon: 123.8854 },
  { label: "New York", lat: 40.7128, lon: -74.006 },
];

export const about = [
  "Hi, I'm Ethan, a junior at NYU studying Business Technology Management, with minors in Math and Financial Risk Engineering. I grew up in Cebu, Philippines, and am now building in New York City.",
  "I like figuring out the problems people actually have and turning them into products that are worth using. I'm especially interested in talking to users, digging into the why behind a problem, and working from there to figure out what to build. If you have a problem you've been thinking about or an idea you want to explore, feel free to reach out. I'd love to figure it out and build something together!",
];

// Big cover panel above each Currently card: an image filling the panel,
// optionally with a logo centered on top.
export type Cover = { src: string; bg: string; logo?: string };

export const currently: {
  role: string;
  org: string;
  cover: Cover;
  description: string;
  links: Link[];
}[] = [
  {
    role: "Director & Host",
    org: "Grab a Slice",
    cover: { src: "/covers/grab-a-slice.png", bg: "#f6f1e7" },
    description:
      "Street-style content and a New York Startup Week podcast about the people shaping the IRL economy.",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/grabaslice_nyc/" },
    ],
  },
  {
    role: "Launching",
    org: "NY Startup Week",
    cover: { src: "/covers/nysw-map.jpg", bg: "#1c1c1c", logo: "/logos/nysw.png" },
    description:
      "A decentralized, citywide event series connecting NYC startups, VCs, founders, and universities. Launching in the spring of 2027.",
    links: [
      { label: "nysw.org", href: "https://nysw.org" },
      { label: "Instagram", href: "https://www.instagram.com/nystartupweek/" },
    ],
  },
];

// Roles from the resume (Oct 2026). Each gets a 1-2 sentence description.
export type Role = {
  org: string;
  logo: Logo;
  role: string;
  dates: string;
  description: string;
};

export const experience: Role[] = [
  {
    org: "EY-Parthenon",
    logo: logos.ey,
    role: "Strategy Intern",
    dates: "Jun – Aug 2026",
    description:
      "Designed the onboarding and identity-verification flow that moved 12M+ users onto a single app after a $280B digital wallet's acquisition of a retail bank, cutting onboarding drop-off by 23%. Also benchmarked 6 digital banks and led 8 build-vs-buy decisions for core banking, lending, and wallet systems.",
  },
  {
    org: "New York Startup Week",
    logo: logos.nysw,
    role: "Co-Founder",
    dates: "May 2026 – Present",
    description:
      "Leading a 12-person team launching a decentralized event series connecting NYC startups, VCs, founders, and universities. Secured 40+ startup and VC partners and $350K+ in sponsorships toward a $1M goal.",
  },
  {
    org: "Be1Space",
    logo: logos.be1space,
    role: "Product Manager",
    dates: "Jan – May 2026",
    description:
      "Led product for a multi-campus study space finder web application, shipping an MVP in 8 weeks from 20+ student interviews across NYU, Columbia, and Fordham. University-specific filters grew monthly active usage 35% over 5 months.",
  },
  {
    org: "NYU High Speed Research Network",
    logo: logos.nyuHsrn,
    role: "Business Analyst",
    dates: "Dec 2025 – Present",
    description:
      "Built a centralized database of 1,000+ alumni and member records and piloted 4 tools that cut recruitment screening time from 3 days to 1 across 6 research departments.",
  },
  {
    org: "Jollibee Group",
    logo: logos.jollibee,
    role: "Product and Systems Optimization Intern",
    dates: "Jun – Aug 2025",
    description:
      "Built an internal demand forecasting tool that replaced manual inventory tracking, improving forecast accuracy 28% and cutting dinner stockouts 19%. Owned pricing and promotions for 24 high-margin SKUs, lifting gross margin 6.2%.",
  },
  {
    org: "EZETracking",
    logo: logos.eze,
    role: "Product Developer",
    dates: "May – Aug 2025",
    description:
      "Launched a job-tracking web app that reached ~100 users in its first 4 months. Redesigned onboarding to cut time-to-first-tracked-application 42% and lift account creation from 17% to 54%.",
  },
];

export const campusInvolvement: Role[] = [
  {
    org: "Tech@NYU",
    logo: logos.techAtNyu,
    role: "Startup Week Lead, prev. Product Manager",
    dates: "Jan 2026 – Present",
    description:
      "Started as a Product Manager, then led NYU Startup Week. Saw a gap beyond campus, which led to launching NY Startup Week, targeting the whole NYC and East Coast startup ecosystem.",
  },
  {
    org: "NYU Product Management Club",
    logo: logos.nyuPmc,
    role: "Director of Outreach, prev. Director of Mentorship",
    dates: "Dec 2025 – Present",
    description:
      "Secured 35+ speakers for weekly panels, growing attendance 103% across 14 events and club membership 32%. Before that, built the mentorship program from scratch, pairing 18 PM mentors with mentees.",
  },
];

// Projects show as boarding passes (components/BoardingPass.tsx). `code` is the
// project's three-letter "airport code" on the pass; `tail` is its logo, white on
// transparent, painted on the plane's tail (in /public/logos); `role` and `year` are
// optional ticket fields; `kind` is the ticket class. Each description is a list
// of paragraphs.
export type Project = {
  title: string;
  code: string;
  tail: string;
  description: string[];
  href: string;
  kind: string;
  role?: string;
  year?: string;
};

export const projects: Project[] = [
  {
    title: "Be1Space",
    code: "BE1",
    tail: "/logos/be1space.png",
    description: [
      "Find your perfect space. A study space finder for students that surfaces cafes, libraries, coworking spots, and lounges near NYU.",
      "Filter by WiFi, quiet, price, NYU discounts, and whether laptops are OK.",
    ],
    href: "https://be1space.vercel.app/",
    kind: "Web app",
    role: "Product Manager",
    year: "2026",
  },
  {
    title: "LedgerLine",
    code: "LDG",
    tail: "/logos/ledgerline.png",
    description: [
      "Company spend by team, by person, by subscription. Tracks spend per employee and flags departed employees who are still being billed, with what each one costs every month and the total wasted so far.",
      "A review queue handles unassigned charges on shared cards, with a best guess at who owns each one.",
    ],
    href: "https://ledgerline-spend.vercel.app/",
    kind: "Web app",
  },
];

// The Connect row, shown as icons in this order. Icons available: x, github,
// linkedin, medium, substack, resume, email (see components/SocialIcon.tsx).
// Email links open in place; everything else opens in a new tab.
export const contact: {
  heading: string;
  body: string;
  links: { label: string; href: string; icon: SocialIconName }[];
} = {
  heading: "Let's build it together!",
  body: "Feel free to reach out by email or LinkedIn, or grab my resume.",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/robertethanlu/", icon: "linkedin" },
    { label: "GitHub", href: "https://github.com/ethanlu11", icon: "github" },
    { label: "Resume", href: "/resume.pdf", icon: "resume" },
    { label: "Email", href: "mailto:ethan.lu@nyu.edu", icon: "email" },
  ],
};
