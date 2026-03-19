import { env } from "@/lib/env";
import type { CreateClientConfig } from "./generated/client.gen";

const BASE_URL = "https://api4.thetvdb.com/v4";

let cachedToken: string | null = null;

const getToken = async (): Promise<string | null> => {
  if (cachedToken) return cachedToken;

  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      apikey: env.TVDB_API_KEY,
      pin: "123456",
    }),
  });
  const data = await response.json();
  cachedToken = data.data?.token ?? null;
  return cachedToken;
};

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  auth: async () => {
    const token = await getToken();

    if (!token) {
      throw new Error("Failed to get token");
    }

    return token;
  },
  baseUrl: BASE_URL,
});
