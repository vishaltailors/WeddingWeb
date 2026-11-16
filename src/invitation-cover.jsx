import Ganesha from "./ganesha";
import { formatDigits, useLanguage } from "./i18n";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useState } from "react";

const MotionDiv = motion.div;
const MotionButton = motion.button;
const MotionSpan = motion.span;
const MotionP = motion.p;

const ease = [0.22, 1, 0.36, 1];

// Deterministic pseudo-random values keep the sparkle field stable between renders.
function seeded(index, salt) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

const sparkles = Array.from({ length: 38 }, (_, index) => ({
  left: seeded(index, 1) * 100,
  size: 1.2 + seeded(index, 2) * 2.8,
  duration: 10 + seeded(index, 3) * 14,
  delay: -seeded(index, 4) * 24,
  drift: (seeded(index, 5) - 0.5) * 120,
  glow: 0.35 + seeded(index, 6) * 0.65,
}));

const faceItem = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.1, ease },
  },
};

const faceList = {
  hidden: {},
  shown: { transition: { delayChildren: 0.75, staggerChildren: 0.13 } },
};

const guestWords = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09 } },
};

function Mandala({ className }) {
  return (
    <svg className={className} viewBox="-100 -100 200 200" aria-hidden="true">
      <circle r="98" />
      <circle r="94" strokeDasharray="1 3" />
      {Array.from({ length: 32 }, (_, index) => (
        <path
          key={`outer-${index}`}
          d="M0-92C7-80 7-66 0-56C-7-66-7-80 0-92Z"
          transform={`rotate(${index * 11.25})`}
        />
      ))}
      <circle r="54" />
      {Array.from({ length: 16 }, (_, index) => (
        <path
          key={`inner-${index}`}
          d="M0-52C13-43 13-28 0-20C-13-28-13-43 0-52Z"
          transform={`rotate(${index * 22.5})`}
        />
      ))}
      <circle r="18" />
      <circle r="10" strokeDasharray="1 2" />
    </svg>
  );
}

// An uneven, poured-wax outline: a circle with a few overlapping wobbles, smoothed into curves.
const waxOutline = (() => {
  const points = Array.from({ length: 48 }, (_, index) => {
    const angle = (index / 48) * Math.PI * 2;
    const radius =
      47 +
      2.4 * Math.sin(angle * 3 + 0.6) +
      1.6 * Math.sin(angle * 5 + 2.1) +
      1.1 * Math.sin(angle * 9 + 4) +
      (seeded(index, 9) - 0.5) * 1.6;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius];
  });
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const format = ([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`;
  let path = `M${format(mid(points.at(-1), points[0]))}`;
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    path += `Q${format(point)} ${format(mid(point, next))}`;
  });
  return `${path}Z`;
})();

function WaxSeal({ wedding }) {
  const monogram = (
    <>
      {wedding.firstInitial}
      <tspan className="cover-wax-amp" dx="1" dy="-1">
        &
      </tspan>
      <tspan dx="1" dy="1">
        {wedding.secondInitial}
      </tspan>
    </>
  );
  return (
    <svg className="cover-wax" viewBox="-54 -54 108 108" aria-hidden="true">
      <defs>
        <radialGradient id="wax-body" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#e2525a" />
          <stop offset="38%" stopColor="#b11f2a" />
          <stop offset="78%" stopColor="#7c0d16" />
          <stop offset="100%" stopColor="#4d050b" />
        </radialGradient>
        <radialGradient id="wax-well" cx="58%" cy="64%" r="70%">
          <stop offset="0%" stopColor="#b4232d" />
          <stop offset="70%" stopColor="#8e1520" />
          <stop offset="100%" stopColor="#5e0810" />
        </radialGradient>
        <linearGradient id="wax-lip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3d0308" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#3d0308" stopOpacity="0" />
          <stop offset="100%" stopColor="#ff9a9a" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="wax-gloss" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={waxOutline} fill="url(#wax-body)" />
      {/* the soft bulge of wax pushed outward by the stamp */}
      <circle
        r="40"
        fill="none"
        stroke="#ff8c8c"
        strokeOpacity="0.28"
        strokeWidth="2.4"
      />
      <circle r="35" fill="url(#wax-well)" />
      <circle r="35" fill="none" stroke="url(#wax-lip)" strokeWidth="2.2" />
      <circle
        r="30.5"
        fill="none"
        stroke="#3d0308"
        strokeOpacity="0.45"
        strokeWidth="0.7"
      />
      <circle
        r="28.2"
        fill="none"
        stroke="#ff9d9d"
        strokeOpacity="0.35"
        strokeWidth="0.9"
        strokeDasharray="0.2 2.6"
        strokeLinecap="round"
      />
      <g className="cover-wax-mono" textAnchor="middle">
        <text x="-0.9" y="6.9" fill="#ffb4b0" fillOpacity="0.75">
          {monogram}
        </text>
        <text x="1" y="9.1" fill="#2e0105" fillOpacity="0.9">
          {monogram}
        </text>
        <text x="0" y="8" fill="#c12d38">
          {monogram}
        </text>
      </g>
      <ellipse
        cx="-19"
        cy="-26"
        rx="15"
        ry="7"
        fill="url(#wax-gloss)"
        transform="rotate(-32 -19 -26)"
      />
      <ellipse
        cx="26"
        cy="27"
        rx="5"
        ry="2.4"
        fill="url(#wax-gloss)"
        opacity="0.45"
        transform="rotate(-40 26 27)"
      />
    </svg>
  );
}

// Card-relative coordinates (the card is 100 × 152). Two loose wraps sag
// unevenly across the card and cross beneath the seal at (50, 136), and the
// knot's tails slip out from under the wax and hang past the card's edge.
const twineStrands = [
  "M-1.5 129.4C14 131.2 31 135.6 50 137.4C66 138.9 85 136.4 101.5 133",
  "M-1.5 136.2C16 135.3 34 133.1 50 132.7C67.5 132.3 84 129.6 101.5 127.4",
  "M46.6 142.6C45.2 148.4 40.6 151.6 38.1 156.4C36.8 159 37.6 161.6 40.2 161.1",
  "M53.4 142.2C55.6 147.6 59.5 150.2 60.7 155.3C61.3 157.8 60.4 159.7 58.4 159.4",
];

// Loose fibres fraying from the cut ends of each tail.
const twineFibres = [
  "M40.2 161.1l1.5-.4M40.2 161.1l1.2.9M40.2 161.1l.5 1.3",
  "M58.4 159.4l-1.5-.1M58.4 159.4l-1 1M58.4 159.4l-.2 1.4",
];

/** A two-ply cotton cord tied around the card and pinned down by the seal. */
function Twine() {
  return (
    <svg
      className="cover-twine"
      viewBox="0 0 100 152"
      fill="none"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <defs>
        <filter id="twine-shadow" x="-10%" y="-10%" width="120%" height="140%">
          <feGaussianBlur stdDeviation="0.55" />
        </filter>
      </defs>
      <g
        stroke="#1a0306"
        strokeOpacity="0.55"
        strokeWidth="1.5"
        transform="translate(0.45 1.05)"
        filter="url(#twine-shadow)"
      >
        {twineStrands.map((strand) => (
          <path key={strand} d={strand} />
        ))}
      </g>
      {twineStrands.map((strand) => (
        <g key={strand}>
          <path d={strand} stroke="#b58c4c" strokeWidth="1.2" />
          {/* alternating dark and light dashes read as the twist of the plies */}
          <path
            d={strand}
            stroke="#6f4d22"
            strokeOpacity="0.6"
            strokeWidth="1.2"
            strokeLinecap="butt"
            strokeDasharray="0.28 0.72"
          />
          <path
            d={strand}
            stroke="#f6e2ad"
            strokeOpacity="0.7"
            strokeWidth="0.42"
            strokeDasharray="0.46 0.54"
            strokeDashoffset="0.55"
            transform="translate(0 -0.2)"
          />
        </g>
      ))}
      <g stroke="#c9a462" strokeWidth="0.22" strokeOpacity="0.85">
        {twineFibres.map((fibre) => (
          <path key={fibre} d={fibre} />
        ))}
      </g>
    </svg>
  );
}

function Flourish() {
  return (
    <svg className="cover-flourish" viewBox="0 0 120 12" aria-hidden="true">
      <path d="M2 6h40M78 6h40" />
      <path d="M46 6c4-5 10-5 14 0 4 5 10 5 14 0-4-5-10-5-14 0-4 5-10 5-14 0Z" />
      <circle cx="60" cy="6" r="1.6" />
    </svg>
  );
}

/** The printed front of the card. */
function CardFace({ wedding, guest, pending, glare }) {
  const { t, language } = useLanguage();
  const dateParts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })
    .format(new Date(wedding.date))
    .split("/")
    .map((part) => formatDigits(part, language));

  return (
    <MotionDiv
      className="cover-face"
      variants={faceList}
      initial="hidden"
      animate="shown"
    >
      <span className="cover-frame" />
      <span className="cover-sheen" />
      <MotionSpan className="cover-glare" style={{ background: glare }} />

      <MotionDiv className="cover-blessing" variants={faceItem}>
        <Ganesha className="cover-ganesha" />
        <span>{t("॥ श्री गणेशाय नमः ॥")}</span>
      </MotionDiv>
      <MotionP className="cover-eyebrow" variants={faceItem}>
        {t("SHUBH VIVAH")}
      </MotionP>
      <MotionP className="cover-couple" id="cover-title" variants={faceItem}>
        {wedding.firstName}
        <span className="cover-amp">&</span>
        {wedding.secondName}
      </MotionP>
      <MotionP className="cover-date" variants={faceItem}>
        {dateParts.join(" · ")}
      </MotionP>
      <MotionDiv variants={faceItem}>
        <Flourish />
      </MotionDiv>
      <MotionP className="cover-eyebrow" variants={faceItem}>
        {t("CORDIALLY INVITING")}
      </MotionP>
      <MotionDiv className="cover-guest-block" variants={faceItem}>
        {pending ? (
          <span className="cover-guest-pending" />
        ) : (
          <MotionP
            key={guest.name}
            className="cover-guest"
            variants={guestWords}
            initial="hidden"
            animate="shown"
          >
            {guest.name.split(/\s+/).map((word, index) => (
              <MotionSpan
                key={`${word}-${index}`}
                className="cover-guest-word"
                variants={faceItem}
              >
                {word}
              </MotionSpan>
            ))}
          </MotionP>
        )}
        {!pending && (
          <MotionP
            key={guest.message}
            className="cover-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          >
            {guest.message}
          </MotionP>
        )}
      </MotionDiv>
    </MotionDiv>
  );
}

/**
 * A full-screen kankotri shown before the site. Pressing the wax seal warms
 * the card with a soft glow, then the cover dissolves into the invitation
 * underneath.
 */
export default function InvitationCover({
  wedding,
  invitation,
  pending,
  onOpen,
}) {
  const { t } = useLanguage();
  const [opening, setOpening] = useState(false);
  const reduceMotion = useReducedMotion();
  const tiltX = useSpring(0, { stiffness: 90, damping: 20 });
  const tiltY = useSpring(0, { stiffness: 90, damping: 20 });
  const rotateX = useTransform(tiltY, (value) => value * -7);
  const rotateY = useTransform(tiltX, (value) => value * 9);
  const glareX = useTransform(tiltX, (value) => `${50 + value * 45}%`);
  const glareY = useTransform(tiltY, (value) => `${35 + value * 40}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, #ffe9b84a, transparent 48%)`;

  const guest = invitation
    ? {
        name: invitation.name,
        message:
          invitation.message ||
          t("Your presence would make our celebration complete."),
      }
    : {
        name: t("You & Your Family"),
        message: t(
          "With the blessings of our elders, we request the pleasure of your company.",
        ),
      };

  // The page underneath must not scroll while the card is closed.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, []);

  function handlePointerMove(event) {
    if (reduceMotion || opening || event.pointerType !== "mouse") return;
    tiltX.set((event.clientX / window.innerWidth - 0.5) * 2);
    tiltY.set((event.clientY / window.innerHeight - 0.5) * 2);
  }

  function open() {
    if (opening) return;
    tiltX.set(0);
    tiltY.set(0);
    setOpening(true);
  }

  return (
    <MotionDiv
      className="cover"
      data-opening={opening || undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cover-title"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        tiltX.set(0);
        tiltY.set(0);
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
    >
      <div className="cover-backdrop" aria-hidden="true">
        <span className="cover-orb one" />
        <span className="cover-orb two" />
        <span className="cover-rays" />
        <MotionDiv
          className="cover-mandala-wrap"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.4, ease }}
        >
          <Mandala className="cover-mandala" />
        </MotionDiv>
        <div className="cover-sparkles">
          {sparkles.map((sparkle, index) => (
            <span
              key={index}
              style={{
                "--left": `${sparkle.left}%`,
                "--size": `${sparkle.size}px`,
                "--duration": `${sparkle.duration}s`,
                "--delay": `${sparkle.delay}s`,
                "--drift": `${sparkle.drift}px`,
                "--glow": sparkle.glow,
              }}
            />
          ))}
        </div>
        <span className="cover-grain" />
        <span className="cover-vignette" />
      </div>

      <MotionP
        className="cover-kicker"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: opening ? 0 : 1, y: 0 }}
        transition={{
          duration: opening ? 0.6 : 1.2,
          delay: opening ? 0 : 0.4,
          ease,
        }}
      >
        <i /> {t("A WEDDING INVITATION")} <i />
      </MotionP>

      <MotionDiv
        className="cover-stage"
        initial={{ opacity: 0, y: 48, rotateX: 16 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        exit={{
          opacity: 0,
          scale: 1.03,
          filter: "blur(6px)",
          transition: { duration: 0.9, ease: "easeInOut" },
        }}
        transition={{ duration: 1.5, delay: 0.15, ease }}
      >
        <MotionDiv
          className="cover-card"
          style={{ rotateX, rotateY }}
          animate={{ scale: opening ? 1.015 : 1 }}
          transition={{ duration: 1.4, ease }}
          onClick={open}
        >
          <div className="cover-paper">
            <CardFace
              wedding={wedding}
              guest={guest}
              pending={pending}
              glare={glare}
            />
            <MotionSpan
              className="cover-card-glow"
              aria-hidden="true"
              initial={false}
              animate={{ opacity: opening ? 1 : 0 }}
              transition={{ duration: 1.2, ease }}
            />
          </div>
          <Twine />

          <MotionSpan
            className="cover-seal-glow"
            aria-hidden="true"
            initial={false}
            animate={
              opening
                ? { opacity: [0, 0.95, 0.7], scale: [0.5, 1.6, 2.4] }
                : { opacity: 0, scale: 0.5 }
            }
            transition={{ duration: 1.4, ease: "easeOut" }}
            onAnimationComplete={() => {
              if (opening) onOpen();
            }}
          />
          <MotionButton
            className="cover-seal"
            type="button"
            aria-label={t("Open the invitation from {{couple}}", {
              couple: wedding.coupleNames,
            })}
            onClick={open}
            disabled={opening}
            transition={
              opening
                ? { duration: 1, ease }
                : { type: "spring", stiffness: 210, damping: 17, delay: 1.9 }
            }
            whileHover={opening ? undefined : { scale: 1.06, rotate: -3 }}
            whileTap={opening ? undefined : { scale: 0.93 }}
          >
            <WaxSeal wedding={wedding} />
          </MotionButton>
        </MotionDiv>

        <MotionP
          className="cover-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: opening ? 0 : 1 }}
          transition={{ duration: opening ? 0.5 : 1, delay: opening ? 0 : 2.6 }}
        >
          {t("Tap the seal to open your invitation")}
        </MotionP>
      </MotionDiv>
    </MotionDiv>
  );
}
