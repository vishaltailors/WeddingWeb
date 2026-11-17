import { createTranslator, normalizeLanguage } from "./i18n.js";

const sharedWedding = {
  date: "2026-12-12T16:00:00+05:30",
  endDate: "2026-12-12T23:00:00+05:30",
  dateLabel: "12 December 2026",
  venue: "SMC Community Hall",
  location: "Jahangirpura, Surat, Gujarat",
  area: "Jahangirpura",
  city: "Surat",
  region: "Gujarat",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=SMC+Community+Hall+Jahangirpura+Surat",
};

export const weddingSides = {
  groom: {
    ...sharedWedding,
    firstName: "Vishal",
    secondName: "Krishi",
    homeVenue: "At Vishal's home",
    homeAddress:
      "5, Harihar Park, App. Asopalav Apartment, Causeway Road, Tadwadi, Surat",
    events: [
      {
        name: "Haldi",
        atHome: true,
        subtitle: "A little sunshine, a lot of love",
        date: "10 December",
        time: "4:00 PM",
        icon: "sun",
        description:
          "Let’s celebrate Vishal with golden hues, happy hearts, and a beautiful mess of turmeric.",
        dress: "Dress in shades of yellow",
        tone: "yellow",
      },
      {
        name: "Grah Shanti",
        subtitle: "Sacred prayers, blessings for a new beginning",
        date: "11 December",
        time: "9:30 AM",
        icon: "flower",
        description:
          "Join Vishal's family for sacred prayers as we seek peace, harmony, and blessings for the journey ahead. Lunch/banquet will be served at 12:30 PM.",
        dress: "Traditional Indian attire",
        tone: "rose",
      },
      {
        name: "Ring Ceremony & Sangeet",
        subtitle: "A promise forever, a night to remember",
        date: "11 December",
        time: "7:00 PM",
        icon: "music",
        description:
          "Join Vishal’s family as we exchange rings, then dance the night away to our favourite melodies.",
        dress: "Bring your festive best",
        tone: "green",
      },
      {
        name: "The Baraat Begins",
        subtitle: "The groom's grand procession",
        date: "12 December",
        time: "5:00 PM",
        icon: "carriage",
        description:
          "From Vishal's house to SMC Community Hall - join the celebration as the groom makes his way to the wedding venue.",
        dress: "Traditional Indian attire",
        tone: "rose",
      },
      {
        name: "The Wedding",
        subtitle: "Seven steps. One forever.",
        date: "12 December",
        time: "9:00 PM",
        icon: "flower",
        description:
          "Join us as Vishal weds Krishi and we take our pheras, surrounded by the people who mean the most.",
        dress: "Traditional Indian attire",
        tone: "rose",
      },
    ],
  },
  bride: {
    ...sharedWedding,
    firstName: "Krishi",
    secondName: "Vishal",
    homeVenue: "At Krishi's home",
    homeAddress: "24, Bhagyalaxmi Row House, Jahangirpura, Surat, Gujarat",
    events: [
      {
        name: "Haldi",
        atHome: true,
        subtitle: "A little sunshine, a lot of love",
        date: "10 December",
        time: "2:00 PM",
        icon: "sun",
        description:
          "Let’s celebrate Krishi with golden hues, happy hearts, and a beautiful mess of turmeric.",
        dress: "Dress in shades of purple",
        tone: "purple",
      },
      {
        name: "Ring Ceremony & Sangeet",
        subtitle: "A promise forever, a night to remember",
        date: "11 December",
        time: "7:00 PM",
        icon: "music",
        description:
          "Join Krishi’s family as we exchange rings, then dance the night away to our favourite melodies.",
        dress: "Bring your festive best",
        tone: "green",
      },
      {
        name: "Grah Shanti",
        subtitle: "Sacred prayers, blessings for a new beginning",
        date: "12 December",
        time: "1:00 PM",
        icon: "flower",
        description:
          "Join Krishi's family for sacred prayers as we seek peace, harmony, and blessings for the journey ahead.",
        dress: "Traditional Indian attire",
        tone: "rose",
      },
      {
        name: "The Wedding",
        subtitle: "Seven steps. One forever.",
        date: "12 December",
        time: "9:00 PM",
        icon: "flower",
        description:
          "Join us as Krishi weds Vishal and we take our pheras, surrounded by the people who mean the most.",
        dress: "Traditional Indian attire",
        tone: "rose",
      },
    ],
  },
};

export function normalizeSide(side) {
  return side === "bride" ? "bride" : "groom";
}

export function getWedding(side, language = "en") {
  const selectedSide = normalizeSide(side);
  const source = weddingSides[selectedSide];
  const t = createTranslator(normalizeLanguage(language));
  const details = {
    ...source,
    ...Object.fromEntries(
      [
        "firstName",
        "secondName",
        "dateLabel",
        "venue",
        "location",
        "area",
        "city",
        "region",
        "homeVenue",
        "homeAddress",
      ].map((key) => [key, t(source[key])]),
    ),
    events: source.events.map((event) => ({
      ...event,
      ...(event.atHome && {
        venue: t(source.homeVenue),
        address: t(source.homeAddress),
      }),
      ...Object.fromEntries(
        ["name", "subtitle", "date", "time", "description", "dress"].map(
          (key) => [key, t(event[key])],
        ),
      ),
    })),
  };
  return {
    ...details,
    side: selectedSide,
    firstInitial: source.firstName[0],
    secondInitial: source.secondName[0],
    couple: `${details.firstName} & ${details.secondName}`,
    coupleNames: t("{{first}} and {{second}}", {
      first: details.firstName,
      second: details.secondName,
    }),
    title: t("{{first}} Weds {{second}}", {
      first: details.firstName,
      second: details.secondName,
    }),
    slug: `${source.firstName.toLowerCase()}-and-${source.secondName.toLowerCase()}`,
  };
}
