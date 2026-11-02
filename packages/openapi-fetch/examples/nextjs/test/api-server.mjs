import { createServer } from "node:http";
import fact from "./fact.json" with { type: "json" };

createServer((request, response) => {
  if (request.method !== "GET" || request.url !== "/fact?max_length=500") {
    response.writeHead(400).end();
    return;
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(fact));
}).listen(4175, "127.0.0.1");
