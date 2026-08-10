import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DocsProvider, useDocs } from "@/contexts/DocsContext";
import type { DocMeta } from "@/lib/docs";

function Consumer() {
  const { docs, docMap } = useDocs();
  return (
    <div>
      <span data-testid="count">{docs.length}</span>
      <span data-testid="map-size">{docMap.size}</span>
      <span data-testid="first-title">{docs[0]?.title}</span>
      <span data-testid="get-by-id">{docMap.get("cmd/give")?.title ?? "not found"}</span>
    </div>
  );
}

const MOCK_DOCS: DocMeta[] = [
  { id: "cmd/give", title: "give 命令", description: "给予物品", tags: ["物品"], author: "MCBECD", updatedAt: "2025-01-01" },
  { id: "cmd/tp", title: "tp 命令", description: "传送玩家", tags: ["传送"] },
  { id: "cmd/say", title: "say 命令" },
];

describe("DocsContext", () => {
  it("provides docs array and docMap", () => {
    render(
      <DocsProvider docs={MOCK_DOCS}>
        <Consumer />
      </DocsProvider>,
    );
    expect(screen.getByTestId("count").textContent).toBe("3");
    expect(screen.getByTestId("map-size").textContent).toBe("3");
  });

  it("docMap allows O(1) lookup by id", () => {
    render(
      <DocsProvider docs={MOCK_DOCS}>
        <Consumer />
      </DocsProvider>,
    );
    expect(screen.getByTestId("get-by-id").textContent).toBe("give 命令");
  });

  it("returns not found for missing doc id", () => {
    function MissingConsumer() {
      const { docMap } = useDocs();
      return <span>{docMap.get("nonexistent")?.title ?? "not found"}</span>;
    }
    render(
      <DocsProvider docs={MOCK_DOCS}>
        <MissingConsumer />
      </DocsProvider>,
    );
    expect(screen.getByText("not found")).toBeInTheDocument();
  });

  it("throws when useDocs is called outside provider", () => {
    // Suppress console.error for the React error boundary
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow("useDocs must be used within DocsProvider");
    spy.mockRestore();
  });
});
