import { describe, it, expect } from "vitest";
import {
  getCategoryBase,
  getCategoryI18nKey,
  getCommandType,
  getCommandTypeI18nKey,
  getBasicsOrder,
} from "@/lib/categories";

describe("getCategoryBase", () => {
  it("returns the base category before slash", () => {
    expect(getCategoryBase("commands/Player")).toBe("commands");
    expect(getCategoryBase("basics/1")).toBe("basics");
  });

  it("returns the full string when no slash", () => {
    expect(getCategoryBase("commands")).toBe("commands");
    expect(getCategoryBase("examples")).toBe("examples");
  });

  it("returns empty string for undefined", () => {
    expect(getCategoryBase(undefined)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(getCategoryBase("")).toBe("");
  });
});

describe("getCategoryI18nKey", () => {
  it("returns correct i18n key for known categories", () => {
    expect(getCategoryI18nKey("commands/Player")).toBe("doc.filterCommands");
    expect(getCategoryI18nKey("basics/1")).toBe("doc.filterBasics");
  });

  it("returns undefined for unknown categories", () => {
    expect(getCategoryI18nKey("unknown/stuff")).toBeUndefined();
    expect(getCategoryI18nKey("examples")).toBeUndefined();
  });

  it("returns undefined for undefined input", () => {
    expect(getCategoryI18nKey(undefined)).toBeUndefined();
  });
});

describe("getCommandType", () => {
  it("returns sub-category for commands", () => {
    expect(getCommandType("commands/Player")).toBe("Player");
    expect(getCommandType("commands/Entity")).toBe("Entity");
  });

  it("returns undefined for non-commands category", () => {
    expect(getCommandType("basics/1")).toBeUndefined();
    expect(getCommandType("examples")).toBeUndefined();
  });

  it("returns undefined for undefined input", () => {
    expect(getCommandType(undefined)).toBeUndefined();
  });
});

describe("getCommandTypeI18nKey", () => {
  it("returns constructed i18n key with PascalCase preserved", () => {
    expect(getCommandTypeI18nKey("commands/Player")).toBe("doc.typePlayer");
    expect(getCommandTypeI18nKey("commands/World")).toBe("doc.typeWorld");
  });

  it("returns undefined for non-commands", () => {
    expect(getCommandTypeI18nKey("basics/1")).toBeUndefined();
  });
});

describe("getBasicsOrder", () => {
  it("returns the sub-category as number for basics", () => {
    expect(getBasicsOrder("basics/1")).toBe(1);
    expect(getBasicsOrder("basics/5")).toBe(5);
    expect(getBasicsOrder("basics/0")).toBe(0);
  });

  it("returns Infinity for non-basics", () => {
    expect(getBasicsOrder("commands/Player")).toBe(Infinity);
  });

  it("returns Infinity for basics without sub-category", () => {
    expect(getBasicsOrder("basics")).toBe(Infinity);
  });

  it("returns Infinity for undefined input", () => {
    expect(getBasicsOrder(undefined)).toBe(Infinity);
  });
});