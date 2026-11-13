const configuredApiUrls = [
  import.meta.env.VITE_API_BASE_URL,
  import.meta.env.VITE_API_URL,
].filter((value) => typeof value === "string" && value.trim());

const isLoopbackUrl = (value) => {
  try {
    return ["localhost", "127.0.0.1", "::1"].includes(new URL(value).hostname);
  } catch {
    return false;
  }
};

const configuredApiUrl = import.meta.env.PROD
  ? configuredApiUrls.find((value) => !isLoopbackUrl(value))
  : configuredApiUrls[0];

const fallbackApiUrl = import.meta.env.PROD
  ? "https://driveeasy-backend.vercel.app"
  : "http://localhost:5000";

export const API_BASE_URL = (configuredApiUrl || fallbackApiUrl).replace(/\/+$/, "");