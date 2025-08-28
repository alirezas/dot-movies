import { env } from "@/lib/env";
import type { CreateClientConfig } from "./generated/client.gen";

const BASE_URL = "https://api4.thetvdb.com/v4";

const getToken = async (): Promise<string | null> => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      apikey: env.NEXT_PUBLIC_TVDB_API_KEY,
      pin: "123456",
    }),
  });
  const data = await response.json();
  return data.data?.token ?? null;
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
