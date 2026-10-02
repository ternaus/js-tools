import createClient from "@ternaus/openapi-fetch";
import type { paths } from "./v1";

const client = createClient<paths>({ baseUrl: "https://catfact.ninja/" });
export default client;
