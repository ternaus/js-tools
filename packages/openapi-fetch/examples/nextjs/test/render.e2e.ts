import { expect, test } from "@playwright/test";
import fact from "./fact.json" with { type: "json" };

test("server-renders the API response and hydrates its visibility control", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));

  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  expect(await response?.text()).toContain(fact.fact);
  await expect(page.locator("pre code")).toHaveText(JSON.stringify(fact, undefined, 2));
  await page.getByRole("button", { name: "Hide response" }).click();
  await expect(page.locator("pre")).toBeHidden();
  await page.getByRole("button", { name: "Show response" }).click();
  await expect(page.locator("pre code")).toBeVisible();
  expect(errors).toEqual([]);
});

test("uses the default API URL when the environment variable is empty", async () => {
  const previous = process.env.CAT_FACT_API_URL;
  process.env.CAT_FACT_API_URL = "";
  try {
    const { default: client } = await import("../lib/api/index");
    expect(client.baseUrl).toBe("https://catfact.ninja");
  } finally {
    if (previous === undefined) {
      delete process.env.CAT_FACT_API_URL;
    } else {
      process.env.CAT_FACT_API_URL = previous;
    }
  }
});
