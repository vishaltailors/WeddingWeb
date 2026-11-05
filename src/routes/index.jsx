import BagiSvg from "../assets/images/bagi.svg?react";
import morningHallMapCard from "../assets/images/morning-hall-map-card.jpg";
import nightHallMapCard from "../assets/images/night-hall-map-card.jpg";
import morningPheraImage from "../assets/images/wedding-morning-phera-view.jpg";
import morningImage from "../assets/images/wedding-morning-view.jpg";
import nightPheraImage from "../assets/images/wedding-night-phera-view.jpg";
import nightImage from "../assets/images/wedding-night-view.jpg";
import Ganesha from "../ganesha";
import InvitationCover from "../invitation-cover";
import MusicPlayer from "../music-player";
import { fetchInvitation, normalizeInviteToken } from "../supabase";
import { applyTheme, getStoredTheme, storeTheme } from "../theme";
import ThemeMenu from "../theme-menu";
import { getWedding, normalizeSide } from "../wedding";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Flower2,
  Heart,
  MapPin,
  Menu,
  Music2,
  Share2,
  Sun,
  X,
} from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  validateSearch: (search) => ({
    side: normalizeSide(search.side),
    invite: normalizeInviteToken(search.invite),
  }),
  component: Index,
});

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
};
const links = [
  { href: "#our-story", label: "Our story" },
  { href: "#celebrations", label: "The celebrations" },
  { href: "#venue", label: "The venue" },
];
const MotionDiv = motion.div;
const MotionNav = motion.nav;
const MotionArticle = motion.article;

function Ornament({ className = "" }) {
  return (
    <div className={`ornament ${className}`} aria-hidden="true">
      <span />
      <Flower2 size={22} strokeWidth={1.2} />
      <span />
    </div>
  );
}

function HorseDrawnCarriage({ size = 35 }) {
  return (
    <BagiSvg
      width={size * (1042 / 522)}
      height={size}
      aria-hidden="true"
      focusable="false"
    />
  );
}

function Lotus({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 76"
      fill="none"
      aria-hidden="true"
    >
      <path d="M50 64C29 46 34 23 50 8c16 15 21 38 0 56Z" />
      <path d="M50 64C25 62 13 42 15 22c23 2 37 18 35 42Zm0 0c25-2 37-22 35-42-23 2-37 18-35 42Z" />
      <path d="M50 64C27 73 8 58 5 42c20-4 36 5 45 22Zm0 0c23 9 42-6 45-22-20-4-36 5-45 22Z" />
      <path d="M26 71h48M50 8V2" />
    </svg>
  );
}

function getRemaining(date) {
  const difference = Math.max(0, new Date(date).getTime() - Date.now());
  return {
    days: Math.floor(difference / 86400000),
    hours: Math.floor(difference / 3600000) % 24,
    minutes: Math.floor(difference / 60000) % 60,
    seconds: Math.floor(difference / 1000) % 60,
  };
}

function Countdown({ date }) {
  const [remaining, setRemaining] = useState(() => getRemaining(date));
  useEffect(() => {
    const timer = setInterval(() => setRemaining(getRemaining(date)), 1000);
    return () => clearInterval(timer);
  }, [date]);
  const arrived = Object.values(remaining).every((value) => value === 0);
  return (
    <section className="countdown-section" aria-label="Wedding countdown">
      <MotionDiv className="countdown-intro" {...reveal}>
        <span className="eyebrow">EVERY MOMENT BRINGS US CLOSER</span>
        <h2>
          {arrived ? "Our forever has begun." : "Counting down to forever."}
        </h2>
      </MotionDiv>
      <MotionDiv className="countdown" {...reveal}>
        {Object.entries(remaining).map(([label, value]) => (
          <div className="countdown-unit" key={label}>
            <span className="countdown-number">
              {String(value).padStart(2, "0")}
            </span>
            <span className="countdown-label">{label}</span>
          </div>
        ))}
      </MotionDiv>
      <div className="countdown-flower" aria-hidden="true">
        <Flower2 strokeWidth={0.65} />
      </div>
    </section>
  );
}

function saveDate(wedding) {
  const format = (date) =>
    new Date(date)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${wedding.coupleNames}//Wedding Invitation//EN`,
    "BEGIN:VEVENT",
    "UID:vishal-krishi-wedding-2026@invitation",
    `DTSTAMP:${format(new Date())}`,
    `DTSTART:${format(wedding.date)}`,
    `DTEND:${format(wedding.endDate)}`,
    `SUMMARY:${wedding.couple} — Wedding`,
    `LOCATION:${wedding.venue}\\, ${wedding.location.replaceAll(",", "\\,")}`,
    `DESCRIPTION:Join us to celebrate the wedding of ${wedding.coupleNames}.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob([calendar], { type: "text/calendar;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${wedding.slug}-wedding.ics`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Index() {
  const { side, invite } = Route.useSearch();
  const wedding = getWedding(side);
  // undefined while a guest's invitation is still loading, null when there is none.
  const [invitation, setInvitation] = useState(undefined);
  const [coverOpen, setCoverOpen] = useState(true);
  const dateParts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })
    .format(new Date(wedding.date))
    .split("/");
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareState, setShareState] = useState("");
  const [theme, setTheme] = useState(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState(
    () => document.documentElement.dataset.theme,
  );

  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => setResolvedTheme(applyTheme(theme));
    updateTheme();
    systemTheme.addEventListener("change", updateTheme);
    return () => systemTheme.removeEventListener("change", updateTheme);
  }, [theme]);

  function changeTheme(value) {
    storeTheme(value);
    setTheme(value);
  }

  // Guest details are read from the database on each page load, so any edit
  // saved in the admin page appears the next time this invitation refreshes.
  useEffect(() => {
    if (!invite) {
      setInvitation(null);
      return;
    }
    let active = true;
    setInvitation(undefined);
    fetchInvitation(invite, side).then((resolved) => {
      if (active) setInvitation(resolved);
    });
    return () => {
      active = false;
    };
  }, [invite, side]);

  useEffect(() => {
    document.title = `${wedding.title} | A Beautiful Beginning`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        `With hearts full of love, ${wedding.coupleNames} invite you to celebrate their beautiful beginning. Discover the celebrations, wedding venue, and countdown to forever.`,
      );
  }, [wedding.title, wedding.coupleNames]);

  useEffect(() => {
    if (!menuOpen) return;
    const onEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (!shareState) return;
    const timer = setTimeout(() => setShareState(""), 4000);
    return () => clearTimeout(timer);
  }, [shareState]);

  async function shareInvitation() {
    const url = new URL(window.location.href);
    url.hash = "";
    url.searchParams.set("side", side);
    if (!invitation) url.searchParams.delete("invite");
    const data = {
      title: wedding.title,
      text: `Join us for our wedding on ${wedding.dateLabel}.`,
      url: url.href,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        setShareState("Invitation link copied");
      }
    } catch (error) {
      if (error.name !== "AbortError")
        setShareState("Copy the invitation link from your address bar.");
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {coverOpen && (
          <InvitationCover
            wedding={wedding}
            invitation={invitation}
            pending={Boolean(invite) && invitation === undefined}
            onOpen={() => setCoverOpen(false)}
          />
        )}
      </AnimatePresence>
      <a className="skip-link" href="#main" inert={coverOpen}>
        Skip to invitation
      </a>
      <header className="site-header" inert={coverOpen}>
        <a
          className="monogram"
          href="#home"
          aria-label={`${wedding.coupleNames} home`}
        >
          {wedding.firstInitial}
          <span>&</span>
          {wedding.secondInitial}
          <span className="monogram-dot">.</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <ThemeMenu theme={theme} onChange={changeTheme} />
          <button className="calendar-button" onClick={() => saveDate(wedding)}>
            <CalendarDays size={15} /> <span>Save the date</span>
          </button>
          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <MotionNav
              id="mobile-nav"
              className="mobile-nav"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                  <ArrowUpRight size={17} />
                </a>
              ))}
            </MotionNav>
          )}
        </AnimatePresence>
      </header>

      <main id="main" inert={coverOpen}>
        <section className="hero" id="home">
          <div className="hero-art" aria-hidden="true">
            <img
              className="day-art"
              src={morningImage}
              alt=""
              fetchPriority="high"
            />
            <img className="night-art" src={nightImage} alt="" />
            <div className="hero-art-shade" />
          </div>
          <MotionDiv
            className="hero-content"
            initial={{ opacity: 0, y: 20 }}
            animate={coverOpen ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.45 }}
          >
            <div className="hero-blessing">
              <Ganesha className="hero-ganesha" />
              <span>श्री गणेशाय नमः</span>
            </div>
            <p className="eyebrow hero-eyebrow">
              TWO HEARTS. TWO FAMILIES. ONE BEAUTIFUL BEGINNING.
            </p>
            <h1>
              <span>{wedding.firstName}</span>
              <span className="weds">
                <i />
                <span>weds</span>
                <i />
              </span>
              <span>
                {wedding.secondName}
                <span className="name-period">.</span>
              </span>
            </h1>
            <p className="hero-description">
              With hearts full of love and the blessings of our families, we
              invite you to be a part of our forever.
            </p>
            <div className="hero-date">
              <span className="date-line" />
              <span>
                {dateParts[0]} <span className="date-dot">·</span>{" "}
                {dateParts[1]} <span className="date-dot">·</span>{" "}
                {dateParts[2]}
              </span>
              <span className="date-line" />
            </div>
            <p className="hero-location">
              {wedding.city.toUpperCase()}, {wedding.region.toUpperCase()}
            </p>
            <a className="button primary-button" href="#celebrations">
              You’re invited <ArrowUpRight size={17} />
            </a>
            <span className="hero-note">
              A celebration of love, and all of you.
            </span>
          </MotionDiv>
          <a className="hero-scroll" href="#our-story">
            <span>THE BEGINNING OF FOREVER</span>
            <ArrowDown size={15} />
          </a>
          <span className="art-caption">
            A little tradition. A little magic. A lifetime of love.
          </span>
        </section>

        <Countdown key={wedding.date} date={wedding.date} />

        <section className="story-section section" id="our-story">
          <MotionDiv className="story-visual" {...reveal}>
            <div className="story-image-frame">
              <img
                src={
                  resolvedTheme === "dark" ? nightPheraImage : morningPheraImage
                }
                alt={`An illustration of ${wedding.coupleNames} exchanging garlands beneath a flower-covered wedding mandap`}
                loading="lazy"
              />
            </div>
            <div className="story-seal">
              <Heart size={18} strokeWidth={1.2} />
              <span>MEANT TO BE</span>
              <span>
                {wedding.firstInitial} + {wedding.secondInitial}
              </span>
            </div>
            <span className="image-footnote">
              A new chapter, written together.
            </span>
          </MotionDiv>
          <MotionDiv className="story-content" {...reveal}>
            <span className="eyebrow">OUR BEAUTIFUL BEGINNING</span>
            <h2>
              A little destiny.
              <br />A whole lot of <em>love.</em>
            </h2>
            <Ornament />
            <p>
              It all began on <strong>27th July 2025</strong>, when two
              strangers met for the very first time, knowing little about each
              other and even less about the beautiful journey that lay ahead. We
              started with a simple "Hello," shared a little about ourselves,
              and spent around half an hour talking before heading back to our
              respective homes. Little did we know that this simple meeting was
              the beginning of something special.
            </p>
            <p>
              A few days later, over dinner at a restaurant, we talked about our
              lives, our families, our friends, and the dreams we hoped to
              fulfil. Somewhere between those conversations and shared smiles,
              we felt a quiet certainty that maybe, this was going to be
              something special. There was no grand movie moment — just a simple
              feeling that we could be good together.
            </p>
            <p>
              As more meetings followed and our families grew closer, that
              little feeling turned into something we both wanted to hold on to.
              And on <strong>24th August 2025</strong>, we made it official,
              choosing to begin our journey together.
            </p>
            <p>
              Some connections feel as though they were always meant to be. Ours
              is a story of two hearts finding a home in each other, two
              families coming together, and a beautiful new chapter waiting to
              unfold.
            </p>
            <div className="couple-signature">
              {wedding.firstName} <span>&</span> {wedding.secondName}
            </div>
          </MotionDiv>
        </section>

        <section className="celebrations-section section" id="celebrations">
          <MotionDiv className="section-heading" {...reveal}>
            <span className="eyebrow">LET THE FESTIVITIES BEGIN</span>
            <h2>
              One love. <em>So many celebrations.</em>
            </h2>
            <p>
              A little colour, a little dancing, and memories for a lifetime.
            </p>
            <Ornament />
          </MotionDiv>
          <div className="event-grid" data-event-count={wedding.events.length}>
            {wedding.events.map((event, index) => {
              const Icon = {
                sun: Sun,
                music: Music2,
                flower: Flower2,
                carriage: HorseDrawnCarriage,
              }[event.icon];
              return (
                <MotionArticle
                  className={`event-card ${event.tone}`}
                  key={event.name}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: index * 0.12 }}
                >
                  <span className="event-number">0{index + 1}</span>
                  <div className="event-icon">
                    <Icon size={35} strokeWidth={1} />
                  </div>
                  <p className="event-subtitle">{event.subtitle}</p>
                  <h3>{event.name}</h3>
                  <div className="event-divider" />
                  <div className="event-date">
                    <CalendarDays size={14} />
                    <span>
                      {event.date} {dateParts[2]}
                    </span>
                  </div>
                  <div className="event-date">
                    <Clock3 size={14} />
                    <span>{event.time} onwards</span>
                  </div>
                  <p className="event-description">{event.description}</p>
                  <span className="dress-code">{event.dress}</span>
                </MotionArticle>
              );
            })}
          </div>
          <p className="celebrations-note">
            <MapPin size={14} /> All celebrations except Haldi at{" "}
            {wedding.venue}, {wedding.area} <span>·</span> Times in IST
          </p>
        </section>

        <section className="quote-section">
          <MotionDiv {...reveal}>
            <Lotus className="quote-lotus" />
            <p>
              “Together is a beautiful
              <br />
              place to <em>be.</em>”
            </p>
            <span className="eyebrow">TWO SOULS. SEVEN VOWS. ONE JOURNEY.</span>
          </MotionDiv>
          <Flower2 className="quote-flower left" aria-hidden="true" />
          <Flower2 className="quote-flower right" aria-hidden="true" />
        </section>

        <section className="venue-section section" id="venue">
          <MotionDiv className="venue-content" {...reveal}>
            <span className="eyebrow">WHERE OUR FOREVER BEGINS</span>
            <h2>
              A place for love.
              <br />
              <em>A space for all of us.</em>
            </h2>
            <p>
              Meet us beneath the flowers, where familiar faces, warm embraces,
              and a little wedding magic await.
            </p>
            <div className="venue-address">
              <MapPin size={23} strokeWidth={1.3} />
              <div>
                <h3>{wedding.venue}</h3>
                <p>{wedding.location}</p>
              </div>
            </div>
            <a
              className="button primary-button"
              href={wedding.mapsUrl}
              target="_blank"
              rel="noreferrer"
            >
              Get directions <ArrowUpRight size={17} />
            </a>
            <p className="venue-note">We can’t wait to welcome you.</p>
          </MotionDiv>
          <MotionDiv className="venue-card" {...reveal}>
            <div className="venue-illustration">
              <img
                src={
                  resolvedTheme === "dark"
                    ? nightHallMapCard
                    : morningHallMapCard
                }
                alt={`The floral mandap at ${wedding.venue}, ${wedding.area}`}
                loading="lazy"
              />
            </div>
            <div className="venue-card-caption">
              <div>
                <span className="eyebrow">THE WEDDING VENUE</span>
                <h3>Meet us in {wedding.city}</h3>
              </div>
              <a
                href={wedding.mapsUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open venue in Google Maps"
              >
                <ArrowUpRight size={24} />
              </a>
            </div>
          </MotionDiv>
        </section>

        <section className="closing-section">
          <MotionDiv {...reveal}>
            <Ornament />
            <span className="eyebrow">
              WITH LOVE, FROM OUR FAMILIES TO YOURS
            </span>
            <h2>
              Our day is more beautiful
              <br />
              <em>with you in it.</em>
            </h2>
            <p>
              Your presence is the greatest gift.
              <br />
              Come with your blessings. Leave with beautiful memories.
            </p>
            <button
              className="button primary-button"
              onClick={() => saveDate(wedding)}
            >
              <CalendarDays size={16} /> Save our date
            </button>
            <button className="share-button" onClick={shareInvitation}>
              {shareState === "Invitation link copied" ? (
                <Check size={15} />
              ) : (
                <Share2 size={15} />
              )}{" "}
              Share the invitation
            </button>
            <div className="share-status" role="status">
              {shareState}
            </div>
          </MotionDiv>
        </section>
      </main>
      <footer className="site-footer" inert={coverOpen}>
        <a className="monogram" href="#home" aria-label="Back to top">
          {wedding.firstInitial}
          <span>&</span>
          {wedding.secondInitial}
          <span className="monogram-dot">.</span>
        </a>
        <p>Made with love, for a lifetime of it.</p>
        <span>
          {wedding.dateLabel.toUpperCase()} <Heart size={12} />
        </span>
      </footer>
      <div inert={coverOpen}>
        <MusicPlayer />
      </div>
    </MotionConfig>
  );
}
