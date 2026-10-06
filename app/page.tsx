import { about, campusInvolvement, contact, currently, experience, globePins, hero, projects, site, type Role } from "@/content";
import Image from "next/image";
import BoardingPass from "@/components/BoardingPass";
import ChartBackground from "@/components/ChartBackground";
import ExternalLink, { Arrow } from "@/components/ExternalLink";
import Mark from "@/components/Mark";
import OrgLogo from "@/components/OrgLogo";
import SocialIcon from "@/components/SocialIcon";
import FitName from "@/components/FitName";
import HeroPhoto from "@/components/HeroPhoto";
import InteractiveGlobe from "@/components/InteractiveGlobe";
import ThemeCord from "@/components/ThemeCord";
import SiteNav from "@/components/SiteNav";
import Tabs from "@/components/Tabs";
import ThemeToggle from "@/components/ThemeToggle";

function Section({
  id,
  index,
  label,
  children,
}: {
  id: string;
  index: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-label`}
      className="grid scroll-mt-16 gap-6 border-t border-line py-14 md:grid-cols-[180px_1fr] md:gap-10 md:py-20 lg:grid-cols-[240px_1fr]"
    >
      <h2
        id={`${id}-label`}
        className="font-mono text-sm font-bold uppercase tracking-normal text-accent md:pt-1 md:text-base"
      >
        <span aria-hidden="true">{index} / </span>
        {label}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

// Dates on the left, then the logo, then the org in blue over the role, with a
// short description below. A ", prev. X" role adds a quieter "Prev. X" line for the earlier role.
function RoleList({ roles }: { roles: Role[] }) {
  return (
    <ol className="space-y-8 md:space-y-9">
      {roles.map((r) => {
        const [role, prev] = r.role.split(", prev. ");
        return (
          <li
            key={`${r.org}-${r.role}`}
            className="grid grid-cols-[48px_1fr] gap-x-4 gap-y-2 md:grid-cols-[130px_52px_1fr] md:gap-x-6"
          >
            <p className="col-span-2 text-sm text-muted md:col-span-1 md:pt-0.5 md:text-base md:tracking-[-0.02em]">
              {r.dates}
            </p>
            <OrgLogo logo={r.logo} size={52} />
            <div className="min-w-0">
              <h3 className="text-lg leading-tight font-medium tracking-[-0.03em] text-accent md:text-[1.375rem]">
                {r.org}
              </h3>
              <p className="mt-0.5 leading-snug md:text-[1.0625rem]">{role}</p>
              {prev && <p className="text-sm text-muted">Prev. {prev}</p>}
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{r.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// An icon link from contact.links, icon only unless showLabel. Email opens in
// place; the rest open in a new tab.
function IconLink({
  link,
  size,
  showLabel = false,
  labelClassName = "text-lg font-medium",
}: {
  link: (typeof contact.links)[number];
  size?: number;
  showLabel?: boolean;
  labelClassName?: string;
}) {
  const props = {
    href: link.href,
    title: link.label,
    className: "-m-2 flex items-center gap-2.5 rounded-md p-2 text-fg transition-colors hover:text-accent",
  };
  const body = (
    <>
      <SocialIcon name={link.icon} size={size} />
      <span className={showLabel ? labelClassName : "sr-only"}>{link.label}</span>
    </>
  );
  return link.href.startsWith("mailto:") ? <a {...props}>{body}</a> : <ExternalLink {...props}>{body}</ExternalLink>;
}

// Every section, in page order: feeds the top nav.
const sections = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "currently", label: "Currently" },
  { id: "contact", label: "Connect" },
];

// The About sign-off lists profiles as icons, then the email address, then the resume.
const findMe = contact.links.filter((l) => l.icon !== "resume" && l.icon !== "email");
const email = contact.links.find((l) => l.icon === "email");
const resume = contact.links.find((l) => l.icon === "resume");

export default function Home() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
      <ChartBackground />
      {/* The cord hangs from the top of the window and stays there as you scroll, so
          it can be pulled from anywhere on the page. Its anchor spans the whole
          window so the cord hangs near the right edge rather than the content's. */}
      <div className="fixed inset-x-0 top-0 z-50 h-0">
        <ThemeCord />
      </div>
      {/* Sticky, with a frosted background bled to the window edges so the chart
          behind the page fades under it. Right padding keeps the links clear of
          the cord. */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-6 pr-14 before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:bg-bg/75 before:backdrop-blur-md sm:pr-20 min-[84rem]:pr-0">
        <a href="#top" className="-m-1 shrink-0 rounded-md p-1 text-fg">
          <Mark size={40} />
          <span className="sr-only">{site.name}, back to top</span>
        </a>
        <SiteNav sections={sections} resume={resume?.href ?? "/resume.pdf"} />
      </header>

      <main id="top">
        <div className="pt-16 pb-14 md:pt-0 md:pb-20">
          <div className="fit-name-wrap">
            <FitName as="h1" text={site.name} />
          </div>
          {/* Portraits on the left, the globe on the right, centered on each other.
              The second photo sits lower so the two read as a pair. */}
          <div className="mt-10 grid items-center gap-10 md:mt-3 md:grid-cols-[auto_minmax(0,1fr)] md:gap-8">
            <div className="flex items-start gap-3 md:translate-x-12 md:-translate-y-6 md:gap-5">
              {/* Each portrait is the view out of an airplane window (components/HeroPhoto.tsx). */}
              {hero.photos.map((photo, i) => (
                <div
                  key={photo.src}
                  className={`w-[min(44vw,260px)] md:w-[clamp(170px,19vw,240px)] ${i === 1 ? "mt-10 md:mt-16" : ""}`}
                >
                  <HeroPhoto photo={photo} index={i} />
                </div>
              ))}
            </div>
            <InteractiveGlobe
              pins={globePins}
              className="hero-globe order-first mx-auto w-[min(100%,440px)] md:order-none md:mr-0 md:max-w-full md:justify-self-end"
            />
          </div>
        </div>

        <Section id="about" index="01" label="About">
          <div className="max-w-3xl space-y-6 text-lg leading-[1.45] md:text-[1.375rem]">
            {about.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
            {/* Places to find me: profile icons, then the email address spelled out. */}
            <p className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span>Find me on</span>
              {findMe.map((l) => (
                <IconLink key={l.href} link={l} size={22} />
              ))}
              {email && (
                <span>
                  or email{" "}
                  <a
                    href={email.href}
                    className="underline decoration-line decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                  >
                    {email.href.replace("mailto:", "")}
                  </a>
                </span>
              )}
            </p>
            {resume && (
              <p className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span>Feel free to take a look at my</span>
                <IconLink link={resume} size={22} showLabel labelClassName="font-medium" />
              </p>
            )}
          </div>
        </Section>

        <Section id="projects" index="02" label="Projects">
          <ul className="space-y-5">
            {projects.map((p, i) => (
              <li key={p.href}>
                <BoardingPass project={p} index={i} />
              </li>
            ))}
          </ul>
        </Section>

        <Section id="experience" index="03" label="Experience">
          <Tabs
            tabs={[
              { label: "Professional", content: <RoleList roles={experience} /> },
              { label: "Campus Involvement", content: <RoleList roles={campusInvolvement} /> },
            ]}
          />
        </Section>

        <Section id="currently" index="04" label="Currently">
          <ul className="grid gap-10 sm:grid-cols-2">
            {currently.map((item) => (
              <li key={item.org}>
                <div
                  className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-lg"
                  style={{ background: item.cover.bg }}
                >
                  <Image
                    src={item.cover.src}
                    alt={item.cover.logo ? "" : `${item.org} logo`}
                    fill
                    sizes="(min-width: 640px) 40vw, 100vw"
                    className="object-cover"
                  />
                  {item.cover.logo && (
                    <Image
                      src={item.cover.logo}
                      alt={`${item.org} logo`}
                      width={480}
                      height={84}
                      className="relative w-1/2 object-contain"
                    />
                  )}
                </div>
                <h3 className="mt-5 text-2xl font-medium tracking-[-0.03em]">{item.org}</h3>
                <p className="mt-1 text-lg text-muted">{item.role}</p>
                <p className="mt-2 leading-relaxed text-muted">{item.description}</p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {item.links.map((l) => (
                    <li key={l.href}>
                      <ExternalLink
                        href={l.href}
                        aria-label={`${item.org} on ${l.label} (opens in a new tab)`}
                        className="inline-flex items-center gap-1 text-sm font-medium underline decoration-line decoration-1 underline-offset-4 transition-colors hover:decoration-fg"
                      >
                        {l.label}
                        <Arrow />
                      </ExternalLink>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="contact" index="05" label="Connect">
          <h3 className="max-w-2xl text-3xl font-medium leading-[1.05] tracking-[-0.04em] md:text-5xl">
            {contact.heading}
          </h3>
          <p className="mt-4 text-muted">{contact.body}</p>
          <ul className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            {contact.links.map((l) => (
              <li key={l.href}>
                <IconLink link={l} showLabel={l.icon === "resume"} />
              </li>
            ))}
          </ul>
        </Section>
      </main>

      <footer className="border-t border-line pt-8 pb-6">
        <div className="flex flex-col gap-4 font-mono text-xs uppercase tracking-normal text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <Mark size={16} className="text-fg" />© {new Date().getFullYear()} {site.name}
          </p>
          <div className="flex items-center gap-4">
            <p className="hidden sm:block">
              Pull the cord or press <kbd className="font-bold text-fg">D</kbd>
            </p>
            <ThemeToggle />
          </div>
        </div>
        <div className="fit-name-wrap mt-16 md:mt-24" aria-hidden="true">
          <FitName text={site.name} />
        </div>
      </footer>
    </div>
  );
}
