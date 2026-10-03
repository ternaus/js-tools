import createClient from "../../../src/index.js";
import type { paths } from "./schemas/e2e.js";

const client = createClient<paths>({
  baseUrl: "/api/v1",
});

async function testGet() {
  const { data } = await client.GET("/get");
  if (data?.message !== "success") {
    throw new Error("/get: No data");
  }
}

async function testPost() {
  const { data } = await client.POST("/post", { body: { message: "POST" } });
  if (data?.message !== "success") {
    throw new Error("/post: No data");
  }
}

async function testMultiForm() {
  const { data } = await client.POST("/multi-form", {
    body: {
      message: "Form",
      file: new File(["Hello, World!"], "hello.txt") as unknown as string,
    },
  });
  if (data?.message !== "success") {
    throw new Error("/multi-form: No data");
  }
}

Promise.all([testGet(), testPost(), testMultiForm()]).then(() => {
  const div = document.createElement("div");
  div.setAttribute("data-status", "success");
  div.textContent = "Success";
  document.body.appendChild(div);
});
