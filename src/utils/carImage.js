import { API_BASE_URL } from "../config";

export function getCarImageUrl(image) {
  if (!image) return "";
  if (/^(https?:|data:|blob:)/i.test(image)) return image;

  return new URL(image, API_BASE_URL).href;
}
