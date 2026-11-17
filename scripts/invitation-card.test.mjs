import assert from "node:assert/strict";
import test from "node:test";
import { renderInvitationCard } from "../src/invitation-card.js";
import { createTranslator } from "../src/i18n.js";
import { getWedding } from "../src/wedding.js";

function recordingCanvas() {
  const draws = [];
  const stack = [];
  const state = { textAlign: "start", font: "", fillStyle: "" };
  const ctx = new Proxy(state, {
    get(target, key) {
      if (key === "save") return () => stack.push({ ...state });
      if (key === "restore") return () => Object.assign(state, stack.pop());
      if (key === "measureText")
        return (text) => ({ width: [...text].length * 7 });
      if (key === "fillText")
        return (text, x, y) => draws.push({ text, x, y, ...state });
      if (key === "createLinearGradient")
        return () => ({ addColorStop() {} });
      return key in target ? target[key] : () => {};
    },
  });
  return { getContext: () => ctx, draws };
}

test("card headings stay centered and Gujarati is drawn as complete text", () => {
  const previous = globalThis.document;
  globalThis.document = { createElement: recordingCanvas };
  try {
    for (const side of ["groom", "bride"]) {
      for (const language of ["en", "gu"]) {
        const wedding = getWedding(side, language);
        const t = createTranslator(language);
        const canvas = renderInvitationCard(wedding, language);
        for (const text of [
          `${wedding.firstName} & ${wedding.secondName}`,
          wedding.venue,
          wedding.location,
          `${wedding.firstInitial} & ${wedding.secondInitial}`,
        ]) {
          const draw = canvas.draws.find((entry) => entry.text === text);
          assert.ok(draw, `Missing heading: ${text}`);
          assert.equal(draw.textAlign, "center", text);
          assert.equal(draw.x, 480, text);
        }
        if (language === "gu") {
          for (const key of [
            "SHUBH VIVAH",
            "THE CELEBRATIONS",
            "WITH LOVE, FROM OUR FAMILIES TO YOURS",
          ]) {
            const matches = canvas.draws.filter((draw) => draw.text === t(key));
            assert.equal(matches.length, 1, `${key} must be shaped in one run`);
            assert.equal(matches[0].textAlign, "center");
          }
        }
        for (const event of wedding.events) {
          const draw = canvas.draws.find((entry) => entry.text === event.name);
          assert.equal(draw.textAlign, "left");
          assert.equal(draw.x, 100);
        }
        const homeVenue = canvas.draws.find(
          (draw) => draw.text === wedding.homeVenue,
        );
        const homeAddress = canvas.draws.find(
          (draw) => draw.text === wedding.homeAddress,
        );
        assert.ok(homeVenue, "Haldi must show the family's home");
        assert.ok(homeAddress, "Haldi must show the placeholder address");
        assert.equal(homeVenue.textAlign, "left");
        assert.ok(homeAddress.y > homeVenue.y);
        assert.ok(
          homeAddress.y <
            canvas.draws.find(
              (draw) => draw.text === wedding.events[1].name,
            ).y,
          "Home address must remain within the Haldi entry",
        );
        assert.ok(canvas.draws.every((draw) => draw.y < canvas.height / 2 - 40));
      }
    }
  } finally {
    if (previous === undefined) delete globalThis.document;
    else globalThis.document = previous;
  }
});
