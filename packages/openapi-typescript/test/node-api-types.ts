import openapiTS, { astToString } from "../src/index.js";

astToString(
  await openapiTS({
    openapi: "3.1.0",
    info: { title: "API", version: "1" },
    paths: {},
  }),
);

// @ts-expect-error the generator rejects numeric input
openapiTS(42);
// @ts-expect-error enum accepts a boolean
openapiTS("schema.yaml", { enum: "yes" });
// @ts-expect-error AST printing requires an array of nodes
astToString("not nodes");
