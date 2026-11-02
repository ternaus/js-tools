import client from "../lib/api";
import FactResponse from "./fact-response";

async function getFact() {
  return await client.GET("/fact", {
    params: {
      query: { max_length: 500 },
    },
  });
}

export default async function Home() {
  const fact = await getFact();

  return fact.error ? <div>There was an error: {fact.error.message}</div> : <FactResponse fact={fact.data} />;
}
