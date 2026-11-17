import { handlePersonalImage } from "../scripts/personal-preview.mjs";

export default async function handler(req, res) {
  await handlePersonalImage(req, res);
}
