import { Readable } from "node:stream";
import openapiTS from "../src/index.js";

describe("Invalid schemas", () => {
  test("rejects stream read errors", async () => {
    const failure = new Error("schema read failed");
    const stream = new Readable({
      read() {
        this.destroy(failure);
      },
    });
    await expect(openapiTS(stream)).rejects.toBe(failure);
  });

  test("Swagger 2.0 throws", async () => {
    await expect(() => openapiTS({ swagger: "2.0" } as any)).rejects.toThrowError(
      "Unsupported Swagger version: 2.x. Use OpenAPI 3.x instead.",
    );
  });

  test("OpenAPI < 3 throws", async () => {
    await expect(() =>
      openapiTS({
        openapi: "2.0",
        info: { title: "Test", version: "1.0" },
      }),
    ).rejects.toThrowError("Unsupported OpenAPI version: 2.0");
  });

  test.each(["3.2.0", "3.10.0", "4.0.0"])("rejects unsupported OpenAPI %s before generation", async (openapi) => {
    await expect(
      openapiTS({ openapi, info: { title: "Unsupported version", version: "1" }, paths: {} }),
    ).rejects.toThrowError(`Unsupported OpenAPI version: ${openapi}`);
  });

  test("Other missing required fields", async () => {
    await expect(() => openapiTS({} as any)).rejects.toThrowError("Unsupported schema format, expected `openapi: 3.x`");
  });

  test("Unresolved $ref error messages", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(() =>
      openapiTS({
        openapi: "3.1.0",
        info: { title: "test", version: "1.0" },
        components: {
          schemas: {
            Pet: {
              type: "object",
              properties: {
                category: { $ref: "#/components/schemas/NonExistingSchema" },
                type: { $ref: "#/components/schemas/AnotherSchema" },
              },
            },
          },
        },
      }),
    ).rejects.toThrowError("Can't resolve $ref at #/components/schemas/Pet/properties/type");

    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Can't resolve $ref at #/components/schemas/Pet/properties/category"),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Can't resolve $ref at #/components/schemas/Pet/properties/type"),
    );
  });
});
