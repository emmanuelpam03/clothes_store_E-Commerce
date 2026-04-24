import { describe, expect, it } from "vitest";
import { parseStoredColor } from "./colors";

describe("parseStoredColor", () => {
  it.each([
    ["Black#111827", { name: "Black", value: "#111827" }],
    ["Black:#111827", { name: "Black", value: "#111827" }],
    ["Black: #111827", { name: "Black", value: "#111827" }],
    ["#111827", { name: "#111827", value: "#111827" }],
    ["Black", { name: "Black", value: "Black" }],
    ["Black (111827)", { name: "Black", value: "#111827" }],
    ["Black (#111827)", { name: "Black", value: "#111827" }],
    ["Black #111827", { name: "Black", value: "#111827" }],
    ["Grey", { name: "Grey", value: "Grey" }],
    ["Gray#9ca3af", { name: "Gray", value: "#9ca3af" }],
    ["", { name: "", value: "" }],
  ])("parses %s", (input, expected) => {
    expect(parseStoredColor(input)).toEqual(expected);
  });
});
