const configuredApiUrls = [
  import.meta.env.VITE_API_BASE_URL,
  import.meta.env.VITE_API_URL,
].filter((value) => typeof value === "string" && value.trim());

const normalizeApiUrl = (value) => {
  try {
    const url = new URL(
      value.includes("://")
        ? value
        : `${import.meta.env.PROD ? "https" : "http"}://${value}`
    );
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.origin;
  } catch {
    return null;
  }
};

const configuredApiUrl = import.meta.env.PROD
  ? "https://driveeasy-backend.vercel.app"
  : configuredApiUrls.map(normalizeApiUrl).find(Boolean) || "http://localhost:5000";

export const API_BASE_URL = configuredApiUrl;