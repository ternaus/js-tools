"use client";

import { useId, useState } from "react";
import type { components } from "../lib/api/v1";

export default function FactResponse({ fact }: { fact: components["schemas"]["CatFact"] | undefined }) {
  const [visible, setVisible] = useState(true);
  const responseId = useId();

  return (
    <div>
      <button
        type="button"
        aria-expanded={visible}
        aria-controls={responseId}
        onClick={() => setVisible((value) => !value)}
        style={{ minHeight: 44, padding: "8px 12px" }}
      >
        {visible ? "Hide response" : "Show response"}
      </button>
      <pre id={responseId} hidden={!visible} style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
        <code>{JSON.stringify(fact, undefined, 2)}</code>
      </pre>
    </div>
  );
}
