import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";
import stripAnsi from "strip-ansi";
import type { TestCase } from "./test-helpers.js";

const root = new URL("../", import.meta.url);
const cwd = fileURLToPath(root);
const cmd = "./bin/cli.js";
const TIMEOUT = 10_000;

describe("CLI", () => {
  test.each([
    { name: "API-specific decorators", ignored: false },
    { name: "ignored lint findings", ignored: true },
  ])("honors $name", async ({ ignored }) => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "openapi-config-"));
    const spec = {
      openapi: "3.1.0",
      info: { title: "Redocly configuration", version: "1" },
      paths: {
        "/keep": { get: { operationId: "keep", responses: { 200: { description: "OK" } } } },
        "/hide": { get: { operationId: ignored ? "keep" : "hide", responses: { 200: { description: "OK" } } } },
      },
    };
    const config = ignored
      ? { rules: { "operation-operationId-unique": "error" } }
      : {
          apis: {
            main: {
              root: "spec.json",
              "x-openapi-ts": { output: "out.ts" },
              decorators: { "filter-in": { property: "operationId", value: ["keep"] } },
            },
          },
        };
    try {
      fs.writeFileSync(path.join(directory, "spec.json"), JSON.stringify(spec));
      fs.writeFileSync(path.join(directory, "redocly.yaml"), JSON.stringify(config));
      if (ignored) {
        fs.writeFileSync(
          path.join(directory, ".redocly.lint-ignore.yaml"),
          JSON.stringify({
            "spec.json": { "operation-operationId-unique": ["#/paths/~1hide/get/keep"] },
          }),
        );
      }
      const args = ["--redocly", "redocly.yaml", ...(ignored ? ["spec.json", "-o", "out.ts"] : [])];
      const result = await execa(fileURLToPath(new URL("bin/cli.js", root)), args, {
        cwd: directory,
        input: "",
        reject: false,
        timeout: TIMEOUT,
      });
      expect(result.exitCode).toBe(0);
      const output = fs.readFileSync(path.join(directory, "out.ts"), "utf8");
      expect(output).toContain('"/keep"');
      expect(output.includes('"/hide"')).toBe(ignored);
      if (ignored) {
        fs.rmSync(path.join(directory, ".redocly.lint-ignore.yaml"));
        const rejected = await execa(fileURLToPath(new URL("bin/cli.js", root)), args, {
          cwd: directory,
          input: "",
          reject: false,
          timeout: TIMEOUT,
        });
        expect(rejected.exitCode).not.toBe(0);
        expect(rejected.stderr).toContain("unique `operationId`");
      }
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
  test("rejects unknown options", async () => {
    const result = await execa(cmd, ["--unknown-option", "./test/fixtures/examples/simple-example.yaml"], {
      cwd,
      reject: false,
    });
    expect(result.exitCode).not.toBe(0);
    expect(stripAnsi(result.stderr)).toContain("Unknown option: unknown-option");
  });

  const tests: TestCase<any, any>[] = [
    [
      "small schema",
      {
        given: ["./test/fixtures/examples/simple-example.yaml"],
        want: new URL("./test/fixtures/examples/simple-example.ts", root),
      },
    ],
    [
      "enum root types filtering",
      {
        given: [
          "./test/fixtures/examples/enum-root-types.yaml",
          "--root-types",
          "--root-types-no-schema-prefix",
          "--enum",
        ],
        want: new URL("./test/fixtures/examples/enum-root-types.ts", root),
      },
    ],
  ];

  for (const [testName, { given, want, ci }] of tests) {
    test.skipIf(ci?.skipIf)(
      testName,
      async () => {
        const { stdout } = await execa(cmd, given, { cwd, stripFinalNewline: false });
        if (want instanceof URL) {
          await expect(stdout).toMatchFileSnapshot(fileURLToPath(want));
        } else {
          expect(stdout).toBe(`${want}\n`);
        }
      },
      ci?.timeout,
    );
  }

  test(
    "stdin",
    async () => {
      const input = fs.readFileSync(new URL("./test/fixtures/examples/simple-example.yaml", root));
      const { stdout } = await execa(cmd, { input, cwd, stripFinalNewline: false });
      await expect(stdout).toMatchFileSnapshot(
        fileURLToPath(new URL("./test/fixtures/examples/simple-example.ts", root)),
      );
    },
    TIMEOUT,
  );

  describe("flags", () => {
    test(
      "accepts a kebab-case boolean flag before the input filename",
      async () => {
        const input = "./test/fixtures/examples/simple-example.yaml";
        const { stdout: expected } = await execa(cmd, [input, "--enum-values"], { cwd });
        const { stdout } = await execa(cmd, ["--enum-values", input], { cwd, input: "", timeout: TIMEOUT });
        expect(stdout).toBe(expected);
        expect(stdout).toMatch(/export const \w+Values:/);
      },
      TIMEOUT,
    );

    test("--help", async () => {
      const { stdout } = await execa(cmd, ["--help"], { cwd });
      expect(stdout).toEqual(expect.stringMatching(/^Usage\n\s+\$ openapi-typescript \[input\] \[options\]/));
    });

    test("--version", async () => {
      const { stdout } = await execa(cmd, ["--version"], { cwd });
      expect(stdout).toEqual(expect.stringMatching(/^v[\d.]+(-.*)?$/));
    });

    test(
      "--properties-required-by-default",
      async () => {
        const { stdout } = await execa(
          cmd,
          ["--properties-required-by-default=true", "./test/fixtures/examples/simple-example.yaml"],
          {
            cwd,
            stripFinalNewline: false,
          },
        );
        await expect(stdout).toMatchFileSnapshot(
          fileURLToPath(new URL("./test/fixtures/examples/simple-example-required.ts", root)),
        );
      },
      TIMEOUT,
    );
  });

  describe("Redocly config", () => {
    test.skipIf(os.platform() === "win32")("automatic config", async () => {
      const cwd = new URL("./fixtures/redocly/", import.meta.url);

      await execa("../../../bin/cli.js", {
        cwd: fileURLToPath(cwd),
      });
      for (const schema of ["a", "b", "c"]) {
        await expect(fs.readFileSync(new URL(`./output/${schema}.ts`, cwd), "utf8")).toMatchFileSnapshot(
          fileURLToPath(new URL("../examples/simple-example.ts", cwd)),
        );
      }
    });

    test("--redocly config", async () => {
      await execa(cmd, ["--redocly", "test/fixtures/redocly-flag/redocly.yaml"], {
        cwd,
      });
      for (const schema of ["a", "b", "c"]) {
        await expect(
          fs.readFileSync(new URL(`./test/fixtures/redocly-flag/output/${schema}.ts`, root), "utf8"),
        ).toMatchFileSnapshot(fileURLToPath(new URL("./test/fixtures/examples/simple-example.ts", root)));
      }
    });

    test("--redocly explicit config path", async () => {
      const altOutput = new URL("./test/fixtures/redocly-flag/output-alt/", root);
      fs.rmSync(altOutput, { recursive: true, force: true });

      await execa(cmd, ["--redocly", "test/fixtures/redocly-flag/redocly.alt.yaml"], {
        cwd,
      });

      for (const schema of ["a", "b", "c"]) {
        await expect(
          fs.readFileSync(new URL(`./test/fixtures/redocly-flag/output-alt/${schema}.ts`, root), "utf8"),
        ).toMatchFileSnapshot(fileURLToPath(new URL("./test/fixtures/examples/simple-example.ts", root)));
      }
    });

    test.skipIf(os.platform() === "win32")("lint error", async () => {
      const cwd = new URL("./fixtures/redocly-lint-error", import.meta.url);

      try {
        await execa("../../../bin/cli.js", {
          cwd: fileURLToPath(cwd),
        });
        throw new Error("Linting should have thrown an error");
      } catch (err) {
        expect(stripAnsi(String(err))).toMatch(/✘ {2}Servers must be present/);
      }
    });
  });
});
