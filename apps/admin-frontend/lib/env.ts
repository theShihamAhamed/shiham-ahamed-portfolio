import { z } from "zod";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const parsedApiUrl = z.string().url().safeParse(configuredApiUrl ?? "http://localhost:5000");

if (!parsedApiUrl.success) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL must be a valid URL.");
}

const apiUrl = new URL(parsedApiUrl.data);

if (apiUrl.protocol !== "http:" && apiUrl.protocol !== "https:") {
  throw new Error("NEXT_PUBLIC_API_BASE_URL must use http or https.");
}

if (
  process.env.VERCEL_ENV === "production" &&
  (!configuredApiUrl || apiUrl.hostname === "localhost" || apiUrl.hostname === "127.0.0.1")
) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL must point to the production API.");
}

apiUrl.pathname = apiUrl.pathname.replace(/\/+$/, "");
apiUrl.search = "";
apiUrl.hash = "";

export const publicEnv = {
  apiBaseUrl: apiUrl.toString().replace(/\/$/, ""),
};
