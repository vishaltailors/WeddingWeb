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
    events: [
      {
        name: "Haldi",
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
    events: [
      {
        name: "Haldi",
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

export function getWedding(side) {
  const selectedSide = normalizeSide(side);
  const details = weddingSides[selectedSide];
  return {
    ...details,
    side: selectedSide,
    firstInitial: details.firstName[0],
    secondInitial: details.secondName[0],
    couple: `${details.firstName} & ${details.secondName}`,
    coupleNames: `${details.firstName} and ${details.secondName}`,
    title: `${details.firstName} Weds ${details.secondName}`,
    slug: `${details.firstName.toLowerCase()}-and-${details.secondName.toLowerCase()}`,
  };
}
