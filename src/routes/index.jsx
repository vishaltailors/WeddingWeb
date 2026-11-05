import BagiSvg from "../assets/images/bagi.svg?react";
import morningHallMapCard from "../assets/images/morning-hall-map-card.jpg";
import nightHallMapCard from "../assets/images/night-hall-map-card.jpg";
import morningPheraImage from "../assets/images/wedding-morning-phera-view.jpg";
import morningImage from "../assets/images/wedding-morning-view.jpg";
import nightPheraImage from "../assets/images/wedding-night-phera-view.jpg";
import nightImage from "../assets/images/wedding-night-view.jpg";
import { applyTheme, getStoredTheme, storeTheme } from "../theme";
import ThemeMenu from "../theme-menu";
import MusicPlayer from "../music-player";
import { fetchInvitation, normalizeInviteToken } from "../supabase";
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

function Ganesha({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 786 908"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="M291.292 870.648C276.211 871.484 261.1 871.647 246.004 871.137C238.405 870.93 230.819 870.142 223.25 869.462C173.537 864.997 120.031 851.776 79.8876 820.711C74.4247 816.483 68.971 812.085 64.2452 807.027C48.1283 789.776 37.6501 768.138 38.4906 744.134C39.1878 724.222 47.5733 704.353 62.2729 690.686C74.2329 679.567 87.6241 673.154 103.288 669.045C106.527 668.196 109.495 666.988 112.824 666.434C129.981 663.577 144.01 665.228 160.794 669.381C198.706 678.763 225.609 697.124 258.995 715.704C268.868 721.198 279.207 726.45 289.405 731.299C295.833 734.355 302.729 736.827 309.404 739.284C313.637 740.842 317.775 742.743 322.058 744.15C333.273 747.835 345.864 750.045 357.581 751.325C384.203 754.235 412.858 751.797 438.572 744.151C458.708 738.164 482.592 727.045 500.929 716.668C548.62 689.679 587.973 657.2 646.361 659.451C674.075 660.519 697.752 669.744 716.78 690.429C727.017 701.558 734.754 717.64 736.734 732.766C737.645 739.726 737.414 747.349 737.1 754.351C736.838 760.203 735.542 765.738 733.915 771.336C727.471 793.5 713.772 807.334 697.101 822.351C693.956 825.184 689.795 827.101 686.325 829.561C673.873 838.391 661.322 844.087 647.071 849.561C643.475 850.943 639.978 852.653 636.334 853.894C625.655 857.534 614.814 860.085 603.802 862.469C563.342 871.227 527.768 872.367 486.572 870.315C486.571 869.989 486.725 869.335 486.792 868.983C487.7 867.988 489.115 867.917 490.497 867.648L496.841 867.465C500.498 867.398 504.342 867.012 508.017 866.815C551.405 864.48 591.88 858.555 632.508 842.56C650.059 835.452 666.366 825.592 680.815 813.352C698.73 797.912 709.85 776.042 711.771 752.468C713.042 734.869 706.306 712.626 694.596 699.493C674.23 676.582 641.313 672.088 612.673 678.516C597.761 682.667 581.456 687.502 567.52 694.239C542.856 706.162 519.358 721.296 494.65 732.966C451.802 753.204 401.906 767.377 354.234 760.825C350.599 760.325 346.855 759.193 343.231 758.544C314.471 753.78 287.581 742.221 262.464 727.723C258.118 725.216 253.389 723.036 249.066 720.515C222.407 704.97 195.687 689.103 165.26 682.156C158.1 680.508 151.109 678.834 143.761 678.512C67.5383 675.168 39.4079 748.852 91.0323 802.1C97.075 808.333 101.674 811.875 108.67 817.05C129.282 832.298 152.637 842.576 177.176 849.706C181.052 850.778 185.251 853.053 189.133 853.912C215.443 859.732 244.005 864.678 270.948 866.046C274.175 866.336 289.188 867.698 291.606 868.803L292.202 869.697C291.716 870.514 292.064 870.256 291.292 870.648Z"
      />
      <path
        fill="currentColor"
        d="M609.312 243.81C586.061 235.347 547.626 240.631 525.604 250.694C479.086 271.743 448.328 316.274 436.25 364.823C427.774 398.896 427.189 435.3 442.924 467.51C455.992 494.26 482.741 514.262 506.826 530.474C520.509 539.685 533.787 548.109 544.073 561.498C557.962 580.338 563.34 603.925 555.196 626.316C549.441 642.138 542.551 654.369 528.361 663.904C523.048 667.577 521.616 669.483 514.857 672.744C490.904 684.082 463.399 685.314 438.528 676.164C417.723 668.725 400.068 651.137 390.161 631.667C387.706 626.842 382.93 621.093 382.928 615.389L383.487 615.33C387.371 618.991 391.933 629.898 396.532 635.828C412.769 656.77 441.931 671.55 468.557 670.461C484.876 669.295 505.389 661.769 516.912 650.177C530.369 636.637 533.553 623.335 533.282 605.139C532.99 569.121 499.889 549.42 473.611 531.674C457.676 520.914 439.17 505.601 427.8 489.887C407.937 462.435 403.234 426.484 406.456 393.469C411.002 349.083 429.83 307.372 460.112 274.605C466.473 267.655 472.615 263.054 479.639 257.367C521.658 223.351 577.547 215.306 629.16 228.635C634.503 230.014 640.085 231.897 645.579 232.837C631.449 246.593 623.298 253.881 615.454 272.499C594.777 321.579 609.482 390.16 553.921 419.024C544.246 424.049 534.747 428.256 523.684 429.328C521.971 429.242 521.062 429.367 519.62 428.552C525.793 426.478 531.665 425.121 537.659 422.51C596.902 396.709 582.805 329.622 594.418 278.604C597.52 264.977 604.191 256.196 609.312 243.81Z"
      />
      <path
        fill="currentColor"
        d="M264.298 229.053C270.289 231.547 285.013 245.18 289.586 250.245C347.135 314.103 314.241 403.886 344.978 478.057C366.831 530.791 408.039 542.79 456.158 563.091C470.06 568.956 485.066 578.688 490.866 593.258C499.724 615.509 487.002 634.061 466.08 642.23C464.398 642.836 459.594 643.731 458.151 642.678C459.324 641.059 464.927 640.667 468.481 638.08C476.31 632.383 480.937 629.433 483.303 619.969C491.703 586.373 447.232 572.425 423.594 563.123C412.164 558.569 400.929 553.487 389.817 548.205C353.305 530.848 328.412 496.996 318.654 458.135C310.774 426.756 310.322 390.763 308.592 358.326C306.534 319.736 303.477 281.501 279.962 248.949C275.327 242.506 268.736 236.275 264.598 229.548L264.298 229.053Z"
      />
      <path
        fill="currentColor"
        d="M153.221 218.762C169.621 217.734 180.541 218.176 196.344 221.817C214.392 225.974 225.823 229.651 241.214 240.097C270.184 259.758 285.45 286.475 291.194 320.548C292.145 325.876 292.82 331.25 293.215 336.648C293.621 342.458 294.501 377.875 291.949 381.461C290.111 380.073 288.776 364.497 288.571 361.119C283.686 280.514 223.079 215.768 136.061 239.612C138.549 245.661 142.756 249.668 145.521 255.961C151.759 267.504 159.196 289.734 160.683 302.623C164.006 331.441 164.073 359.341 181.86 384.198C191.58 397.781 208.784 408.084 225.12 411.386C230.766 412.527 237.489 412.347 243.484 413.243C214.617 416.58 190.381 410.734 170.364 388.954C146.252 362.72 148.66 330.322 140.858 298.109C133.818 269.042 124.685 249.928 99.7862 232.435C108.588 226.705 142.016 219.633 153.221 218.762Z"
      />
      <path
        fill="currentColor"
        d="M372.435 21.0824C373.25 21.8248 379.191 36.9711 380.395 39.4693C382.886 44.6398 386.032 49.9652 388.726 55.0058C398.798 73.8508 407.698 101.58 390.958 119.261C385.745 124.787 378.908 126.272 371.481 126.345C333.284 121.882 341.562 76.7508 356.749 54.4839C358.071 52.5446 359.092 49.6462 360.329 47.7503C365.404 39.9708 367.999 28.6039 372.435 21.0824Z"
      />
      <path
        fill="currentColor"
        d="M186.938 461.1L187.33 461.658C180.14 468.206 173.412 472.808 166.831 478.548C158.401 485.902 147.44 496.556 139.878 504.793C121.128 525.216 100.81 556.735 100.633 585.235C100.547 599.012 105.636 613.206 115.814 622.385C127.356 632.793 146.204 635.328 161.172 633.628C166.948 632.973 172.061 631.032 177.626 630.932L178.351 630.924C171.78 634.01 165.299 636.466 158.549 639.087C149.687 642.417 126.749 642.422 117.99 638.754C103.339 632.62 92.1972 626.135 85.5255 611.169C78.3384 595.215 79.868 571.124 86.608 555.409C102.449 518.472 136.976 488.639 171.695 469.654C177.023 466.741 181.252 463.637 186.938 461.1Z"
      />
      <path
        fill="currentColor"
        d="M366.356 182.858C393.699 181.916 420.21 185.606 447.354 187.083C454.219 187.457 465.13 186.694 466.565 195.987C467.218 200.221 459.672 204.042 456.309 204.212C430.631 205.317 404.109 201.272 378.575 201.262C370.185 201.284 361.778 201.26 353.397 201.712C339.585 202.457 287.777 207.844 278.419 200.37C277.09 199.309 276.619 198.126 276.503 196.444C276.33 193.939 276.847 191.094 278.704 189.263C280.261 187.728 283.123 187.583 285.198 187.357C294.471 186.348 304.026 186.928 313.353 186.385C323.36 185.802 333.365 184.598 343.368 183.854C351.008 183.285 358.699 183.124 366.356 182.858Z"
      />
      <path
        fill="currentColor"
        d="M363.76 140.767C364.484 140.727 365.208 140.691 365.933 140.661C382.251 139.988 398.192 142.471 414.742 143.171C423.098 143.525 443.094 147.147 432.203 160.282C428.777 164.412 417.877 163.142 412.449 163.042C401.828 162.845 390.946 161.995 380.19 161.742C366.647 161.408 353.134 162.731 339.629 163.043C332.253 163.213 321.338 164.448 314.451 162.622C312.05 160.444 309.619 157.856 309.296 154.478C308.443 150.057 315.705 144.872 319.858 144.347C333.365 142.64 350.3 141.245 363.76 140.767Z"
      />
      <path
        fill="currentColor"
        d="M675.377 513.909C689.485 533.262 698.279 555.307 694.537 579.634C687.298 626.697 634.77 650.994 592.942 631.019C597.462 631.613 604.655 633.473 608.65 633.535C645.864 634.113 674.007 610.085 677.621 572.383C679.51 552.668 675.376 536.92 666.377 519.234C669.043 519.672 675.075 519.434 678.024 519.4C676.49 517.334 675.789 516.447 675.377 513.909Z"
      />
      <path
        fill="currentColor"
        d="M342.705 250.802C346.62 255.422 349.381 268.804 355 274.222C360.136 279.174 362.238 285.055 370.709 285.871C384.185 287.17 392.269 274.597 397.07 263.907C398.244 261.258 400.209 253.224 401.916 251.883C403.53 253.77 402.262 263.721 401.955 266.153C398.744 281.833 393.772 302.383 373.715 303.239C365.925 303.572 360.674 299.711 355.305 294.532C345.373 284.954 342.815 263.931 342.705 250.802Z"
      />
      <path
        fill="currentColor"
        d="M607.793 463.067C612.914 464.7 631.579 475.103 636.257 478.152C647.315 485.361 668.984 502.428 675.377 513.909C675.789 516.447 676.49 517.334 678.024 519.4C675.075 519.434 669.043 519.672 666.377 519.234C657.688 503.282 640.572 486.22 625.622 475.852C619.887 471.875 613.54 468.423 607.497 464.23L607.793 463.067Z"
      />
      <path
        fill="currentColor"
        d="M372.962 233.044C374.424 235.621 377.617 245.009 378.652 248.05C380.582 253.724 382.187 264.299 379.023 269.781C377.128 273.063 375.728 273.189 372.337 274.161C371.06 274.032 367.087 272.845 366.386 272.064C360.032 264.985 368.634 238.507 372.962 233.044Z"
      />
      <path
        fill="currentColor"
        d="M306.74 472.917C309.883 476.18 316.15 495.532 319.748 500.781C326.143 510.111 332.289 519.355 340.589 527.273C344.365 530.876 348.302 533.969 351.894 537.443C348.064 537.293 339.61 530.514 336.431 527.916C319.585 514.146 308.714 494.712 306.74 472.917Z"
      />
      <path
        fill="currentColor"
        d="M270.948 866.046C278.787 865.971 286.558 866.252 294.322 866.234C303.903 866.211 309.476 865.629 319.147 867.03C308.1 869.037 302.301 869.809 291.292 870.648C292.064 870.256 291.716 870.514 292.202 869.697L291.606 868.803C289.188 867.698 274.175 866.336 270.948 866.046Z"
      />
      <path
        fill="currentColor"
        d="M460.328 866.609C472.216 865.594 484.969 866.427 496.841 867.465L490.497 867.648C489.115 867.917 487.7 867.988 486.792 868.983C486.725 869.335 486.571 869.989 486.572 870.315C484.312 870.339 482.957 870.193 480.752 869.947C475.57 870.062 465.583 867.804 460.328 866.609Z"
      />
      <path
        fill="currentColor"
        d="M480.752 869.947C483.098 867.409 487.273 867.67 490.497 867.648C489.115 867.917 487.7 867.988 486.792 868.983C486.725 869.335 486.571 869.989 486.572 870.315C484.312 870.339 482.957 870.193 480.752 869.947Z"
      />
      <path
        fill="currentColor"
        d="M607.497 464.23C604.875 462.775 602.709 461.993 600.354 460.041C602.649 460.681 605.744 461.864 607.793 463.067L607.497 464.23Z"
      />
      <path
        fill="currentColor"
        d="M519.62 428.552C521.062 429.367 521.971 429.242 523.684 429.328C521.214 429.64 516.161 429.755 513.809 429.123C515.457 428.53 517.801 428.612 519.62 428.552Z"
      />
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
  const [invitation, setInvitation] = useState(null);
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
      <a className="skip-link" href="#main">
        Skip to invitation
      </a>
      <header className="site-header">
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

      <main id="main">
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
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15 }}
          >
            <div className="hero-blessing">
              <Ganesha className="hero-ganesha" />
              <span>श्री गणेशाय नमः</span>
            </div>
            {invitation && (
              <MotionDiv
                className="hero-guest"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.35 }}
              >
                <span className="hero-guest-label">An invitation for</span>
                <p className="hero-guest-name">{invitation.name}</p>
                {invitation.message && (
                  <p className="hero-guest-message">{invitation.message}</p>
                )}
              </MotionDiv>
            )}
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
      <footer className="site-footer">
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
      <MusicPlayer />
    </MotionConfig>
  );
}
