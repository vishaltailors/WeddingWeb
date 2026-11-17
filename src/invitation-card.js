import { createTranslator, formatDigits, normalizeLanguage } from "./i18n.js";
import { getWedding } from "./wedding.js";

const COLOR = {
  paper: "#fcfaf5",
  ink: "#4d3834",
  muted: "#8a7d72",
  wine: "#743b40",
  gold: "#ad8950",
  line: "#e3d9c8",
};

const WIDTH = 960;
const SCALE = 2;
const MARGIN = 100;
const CONTENT_WIDTH = WIDTH - MARGIN * 2;
const CENTER = WIDTH / 2;
const OUTER_FRAME = 24;
const INNER_FRAME = 36;

// Vertical rhythm, in card units. Kept as constants so the measured height and
// the painted card can never drift apart.
const HEADER_HEIGHT = 470;
const NAME_BLOCK = 38;
const META_BLOCK = 24;
const DESCRIPTION_GAP = 10;
const DESCRIPTION_LINE = 22;
const DRESS_BLOCK = 30;
const EVENT_GAP = 24;
const NOTE_BLOCK = 48;
const FOOTER_HEIGHT = 172;

const serif = (size, style = "normal") =>
  `${style} ${size}px "Cormorant Garamond", "Noto Serif Gujarati", Georgia, serif`;
const sans = (size, weight = 400) =>
  `${weight} ${size}px "DM Sans", "Noto Sans Gujarati", system-ui, sans-serif`;

const DESCRIPTION_FONT = sans(14);

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of String(text).split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Draws letter-spaced text and returns its width, so small-caps labels can be centred. */
function drawTracked(ctx, text, { x = CENTER, y, tracking = 0, font, color, align = "center" }) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  // Indic scripts must be shaped as a complete run, including vowel marks.
  if (/[\u0080-\uffff]/u.test(text)) {
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    const total = ctx.measureText(text).width;
    ctx.restore();
    return total;
  }
  const chars = [...String(text)];
  const widths = chars.map((char) => ctx.measureText(char).width);
  const total =
    widths.reduce((sum, width) => sum + width, 0) + tracking * (chars.length - 1);
  let cursor =
    align === "center" ? x - total / 2 : align === "right" ? x - total : x;
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  chars.forEach((char, index) => {
    ctx.fillText(char, cursor, y);
    cursor += widths[index] + tracking;
  });
  ctx.restore();
  return total;
}

function drawFlourish(ctx, y, width = 280) {
  ctx.strokeStyle = COLOR.gold;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CENTER - width / 2, y);
  ctx.lineTo(CENTER - 28, y);
  ctx.moveTo(CENTER + 28, y);
  ctx.lineTo(CENTER + width / 2, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(CENTER, y - 7);
  ctx.quadraticCurveTo(CENTER + 13, y, CENTER, y + 7);
  ctx.quadraticCurveTo(CENTER - 13, y, CENTER, y - 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(CENTER, y, 2.2, 0, Math.PI * 2);
  ctx.fillStyle = COLOR.gold;
  ctx.fill();
}

function eventHeight(event) {
  return (
    NAME_BLOCK +
    META_BLOCK +
    DESCRIPTION_GAP +
    event.locationLines.length * DESCRIPTION_LINE +
    (event.locationLines.length ? DESCRIPTION_GAP : 0) +
    event.lines.length * DESCRIPTION_LINE +
    DRESS_BLOCK +
    EVENT_GAP
  );
}

function dateLine(date, language) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })
    .format(new Date(date))
    .split("/")
    .map((part) => formatDigits(part, language))
    .join(" · ");
}

function paintCard(ctx, { data, events, t, language, height }) {
  const paper = ctx.createLinearGradient(0, 0, 0, height);
  paper.addColorStop(0, "#faf6ed");
  paper.addColorStop(0.45, COLOR.paper);
  paper.addColorStop(1, "#f9f4ea");
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, WIDTH, height);

  ctx.textBaseline = "alphabetic";
  ctx.strokeStyle = "#ad895099";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    OUTER_FRAME,
    OUTER_FRAME,
    WIDTH - OUTER_FRAME * 2,
    height - OUTER_FRAME * 2,
  );
  ctx.strokeStyle = COLOR.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(
    INNER_FRAME,
    INNER_FRAME,
    WIDTH - INNER_FRAME * 2,
    height - INNER_FRAME * 2,
  );
  ctx.fillStyle = COLOR.gold;
  for (const [x, y] of [
    [INNER_FRAME, INNER_FRAME],
    [WIDTH - INNER_FRAME, INNER_FRAME],
    [INNER_FRAME, height - INNER_FRAME],
    [WIDTH - INNER_FRAME, height - INNER_FRAME],
  ]) {
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Heading block: blessing, eyebrow, couple, date, venue.
  ctx.textAlign = "center";
  ctx.font = sans(15);
  ctx.fillStyle = COLOR.wine;
  ctx.fillText(t("॥ श्री गणेशाय नमः ॥"), CENTER, 124);
  drawTracked(ctx, t("SHUBH VIVAH"), {
    y: 164,
    tracking: 6,
    font: sans(12, 600),
    color: COLOR.gold,
  });
  ctx.font = serif(74);
  ctx.fillStyle = COLOR.wine;
  ctx.fillText(`${data.firstName} & ${data.secondName}`, CENTER, 240);
  drawTracked(ctx, dateLine(data.date, language), {
    y: 280,
    tracking: 4,
    font: sans(15),
    color: COLOR.muted,
  });
  drawFlourish(ctx, 318);
  ctx.font = serif(27);
  ctx.fillStyle = COLOR.ink;
  ctx.fillText(data.venue, CENTER, 366);
  ctx.font = sans(14);
  ctx.fillStyle = COLOR.muted;
  ctx.fillText(data.location, CENTER, 394);
  drawTracked(ctx, t("THE CELEBRATIONS"), {
    y: 444,
    tracking: 5,
    font: sans(12, 600),
    color: COLOR.gold,
  });

  // One entry per celebration, with its date, time, dress code and note.
  let y = HEADER_HEIGHT;
  events.forEach((event, index) => {
    if (index > 0) {
      ctx.strokeStyle = COLOR.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(MARGIN, y - EVENT_GAP / 2);
      ctx.lineTo(WIDTH - MARGIN, y - EVENT_GAP / 2);
      ctx.stroke();
    }
    ctx.textAlign = "left";
    ctx.font = serif(30);
    ctx.fillStyle = COLOR.wine;
    ctx.fillText(event.name, MARGIN, y + 24);
    y += NAME_BLOCK;

    ctx.font = sans(13.5, 500);
    ctx.fillStyle = COLOR.gold;
    ctx.fillText(`${event.date} · ${event.time}`, MARGIN, y + 15);
    y += META_BLOCK + DESCRIPTION_GAP;

    ctx.font = DESCRIPTION_FONT;
    ctx.fillStyle = COLOR.wine;
    event.locationLines.forEach((line, lineIndex) => {
      ctx.fillText(line, MARGIN, y + 17 + lineIndex * DESCRIPTION_LINE);
    });
    if (event.locationLines.length) {
      y += event.locationLines.length * DESCRIPTION_LINE + DESCRIPTION_GAP;
    }

    ctx.fillStyle = COLOR.ink;
    event.lines.forEach((line, lineIndex) => {
      ctx.fillText(line, MARGIN, y + 17 + lineIndex * DESCRIPTION_LINE);
    });
    y += event.lines.length * DESCRIPTION_LINE;

    ctx.beginPath();
    ctx.moveTo(MARGIN + 4, y + 13);
    ctx.lineTo(MARGIN + 8, y + 17);
    ctx.lineTo(MARGIN + 4, y + 21);
    ctx.lineTo(MARGIN, y + 17);
    ctx.closePath();
    ctx.fillStyle = COLOR.gold;
    ctx.fill();
    ctx.font = sans(13, 500);
    ctx.fillStyle = COLOR.wine;
    ctx.fillText(`${t("Dress code")}: ${event.dress}`, MARGIN + 20, y + 22);
    y += DRESS_BLOCK + EVENT_GAP;
  });

  ctx.textAlign = "center";
  ctx.font = sans(13);
  ctx.fillStyle = COLOR.muted;
  ctx.fillText(
    t("All celebrations except Haldi at {{venue}}, {{area}}", {
      venue: data.venue,
      area: data.area,
    }),
    CENTER,
    y + 26,
  );

  const footerY = y + NOTE_BLOCK;
  drawFlourish(ctx, footerY + 28, 220);
  drawTracked(ctx, t("WITH LOVE, FROM OUR FAMILIES TO YOURS"), {
    y: footerY + 68,
    tracking: 4,
    font: sans(11.5, 600),
    color: COLOR.gold,
  });
  ctx.font = serif(34);
  ctx.fillStyle = COLOR.wine;
  ctx.fillText(
    `${data.firstInitial} & ${data.secondInitial}`,
    CENTER,
    footerY + 118,
  );
}

/** Paints the downloadable invitation card and returns the canvas holding it. */
export function renderInvitationCard(wedding, language) {
  const lang = normalizeLanguage(language);
  const t = createTranslator(lang);
  const data = getWedding(wedding.side, lang);
  const measure = document.createElement("canvas").getContext("2d");
  measure.font = DESCRIPTION_FONT;
  const events = data.events.map((event) => ({
    ...event,
    locationLines: event.atHome
      ? [
          ...wrapText(measure, event.venue, CONTENT_WIDTH),
          ...wrapText(measure, event.address, CONTENT_WIDTH),
        ]
      : [],
    lines: wrapText(measure, event.description, CONTENT_WIDTH),
  }));
  const height =
    HEADER_HEIGHT +
    events.reduce((sum, event) => sum + eventHeight(event), 0) +
    NOTE_BLOCK +
    FOOTER_HEIGHT;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH * SCALE;
  canvas.height = height * SCALE;
  const ctx = canvas.getContext("2d");
  ctx.scale(SCALE, SCALE);
  paintCard(ctx, { data, events, t, language: lang, height });
  return canvas;
}

/** Renders the card as a PNG and hands it to the browser's download flow. */
export async function downloadInvitationCard(wedding, language) {
  const lang = normalizeLanguage(language);
  if (document.fonts) {
    const data = getWedding(wedding.side, lang);
    const t = createTranslator(lang);
    const sample = [
      data.firstName,
      data.secondName,
      data.venue,
      data.location,
      data.homeVenue,
      data.homeAddress,
      t("॥ श्री गणेशाय नमः ॥"),
      t("SHUBH VIVAH"),
      t("THE CELEBRATIONS"),
      t("WITH LOVE, FROM OUR FAMILIES TO YOURS"),
      t("Dress code"),
      ...data.events.flatMap((event) => [
        event.name, event.date, event.time, event.description, event.dress,
      ]),
    ].join(" ");
    const faces = [
      `400 14px "DM Sans"`,
      `500 14px "DM Sans"`,
      `600 12px "DM Sans"`,
      `400 30px "Cormorant Garamond"`,
      `400 15px "Noto Sans Gujarati"`,
      `500 15px "Noto Sans Gujarati"`,
      `600 15px "Noto Sans Gujarati"`,
      `400 30px "Noto Serif Gujarati"`,
    ];
    await Promise.all([
      document.fonts.ready,
      ...faces.map((face) => document.fonts.load(face, sample)),
    ]).catch(() => {});
  }

  const canvas = renderInvitationCard(wedding, lang);
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${wedding.slug}-invitation-${lang}.png`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
