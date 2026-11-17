import { handlePersonalPreview } from "../scripts/personal-preview.mjs";

export default async function handler(req, res) {
  await handlePersonalPreview(req, res);
}
