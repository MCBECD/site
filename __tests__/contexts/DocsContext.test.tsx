import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DocsProvider, useDocs, type DocIndexEntry } from "@/contexts/DocsContext";

function Consumer() {
  const { index, docMap } = useDocs();
  return (
    <div>
      <span data-testid="count">{index.length}</span>
      <span data-testid="map-size">{docMap.size}</span>
      <span data-testid="first-title">{index[0]?.title}</span>
      <span data-testid="get-by-id">{docMap.get("cmd/give")?.title ?? "not found"}</span>
    </div>
  );
}

const MOCK_INDEX: DocIndexEntry[] = [
  { id: "cmd/give", title: "give 命令", category: "commands" },
  { id: "cmd/tp", title: "tp 命令", category: "commands" },
  { id: "cmd/say", title: "say 命令", category: "commands" },
];

describe("DocsContext", () => {
  it("provides index array and docMap", () => {
    render(
      <DocsProvider index={MOCK_INDEX}>
        <Consumer />
      </DocsProvider>,
    );
    expect(screen.getByTestId("count").textContent).toBe("3");
    expect(screen.getByTestId("map-size").textContent).toBe("3");
  });

  it("docMap allows O(1) lookup by id", () => {
    function LookupConsumer() {
      const { docMap } = useDocs();
      return <span data-testid="result">{docMap.get("cmd/give")?.title ?? "not found"}</span>;
    }
    render(
      <DocsProvider index={MOCK_INDEX}>
        <LookupConsumer />
      </DocsProvider>,
    );
    expect(screen.getByTestId("result").textContent).toBe("give 命令");
  });

  it("returns not found for missing doc id", () => {
    function MissingConsumer() {
      const { docMap } = useDocs();
      return <span>{docMap.get("nonexistent")?.title ?? "not found"}</span>;
    }
    render(
      <DocsProvider index={MOCK_INDEX}>
        <MissingConsumer />
      </DocsProvider>,
    );
    expect(screen.getByText("not found")).toBeInTheDocument();
  });

  it("keeps hidden documents in the index (filtering happens in the list view)", () => {
    const index: DocIndexEntry[] = [
      { id: "a", title: "Visible A", category: "test" },
      { id: "b", title: "Hidden B", category: "test" },
      { id: "c", title: "Visible C", category: "test" },
    ];

    function FilterConsumer() {
      const { index: entries, docMap } = useDocs();
      return (
        <div>
          <span data-testid="visible-count">{entries.length}</span>
          <span data-testid="map-size">{docMap.size}</span>
          <span data-testid="map-has-hidden">{docMap.has("b") ? "yes" : "no"}</span>
        </div>
      );
    }

    render(
      <DocsProvider index={index}>
        <FilterConsumer />
      </DocsProvider>,
    );

    expect(screen.getByTestId("visible-count").textContent).toBe("3");
    expect(screen.getByTestId("map-size").textContent).toBe("3");
    expect(screen.getByTestId("map-has-hidden").textContent).toBe("yes");
  });

  it("only carries id/title/category — full metadata must not reach the client boundary", () => {
    function KeysConsumer() {
      const { index } = useDocs();
      return <span data-testid="keys">{Object.keys(index[0]!).sort().join(",")}</span>;
    }
    render(
      <DocsProvider index={MOCK_INDEX}>
        <KeysConsumer />
      </DocsProvider>,
    );
    expect(screen.getByTestId("keys").textContent).toBe("category,id,title");
  });

  it("throws when useDocs is called outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow("useDocs must be used within DocsProvider");
    spy.mockRestore();
  });
});
