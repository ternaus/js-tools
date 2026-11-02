import createClient from "@ternaus/openapi-fetch";
import type { paths } from "./v1";

const client = createClient<paths>({ baseUrl: process.env.CAT_FACT_API_URL?.trim() || "https://catfact.ninja/" });
export default client;
