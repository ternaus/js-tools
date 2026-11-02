import { expect, test } from "@playwright/test";
import fact from "./fact.json" with { type: "json" };

test("renders the typed API response in the production HTML", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));

  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  expect(await response?.text()).toContain(fact.fact);
  await expect(page.locator("pre code")).toHaveText(JSON.stringify(fact, undefined, 2));
  expect(errors).toEqual([]);
});
