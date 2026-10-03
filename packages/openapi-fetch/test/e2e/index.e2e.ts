import { type Page, test } from "@playwright/test";

// note: these tests load Chrome, Firefox, and Safari in Playwright to test a browser-realistic runtime.
// the frontend is prepared via Vite to create a production-accurate app (and throw add’l type errors)
// the backend is mocked here, in Playwright

test("basic", async ({ page }) => {
  await mockAPI(page);

  page.on("pageerror", (error) => {
    throw error;
  });

  await page.goto("/");

  await page.waitForSelector('[data-status="success"]');
});

/** Mock API */
async function mockAPI(page: Page) {
  await Promise.all([
    page.route("/api/v1/get", (route) => route.fulfill({ status: 200, body: JSON.stringify({ message: "success" }) })),
    page.route("/api/v1/post", (route) => route.fulfill({ status: 200, body: JSON.stringify({ message: "success" }) })),
    page.route("/api/v1/multi-form", (route) =>
      route.fulfill({ status: 200, body: JSON.stringify({ message: "success" }) }),
    ),
  ]);
}
