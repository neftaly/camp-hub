import { describe, it, expect } from "vitest";
import { Grid } from "../grid";

describe("Grid", () => {
  it("creates an empty grid filled with spaces", () => {
    const grid = new Grid(5, 2);
    expect(grid.toString()).toBe("     \n     ");
  });

  it("set/get a cell", () => {
    const grid = new Grid(3, 1);
    grid.set(1, 0, "X", "accent");
    const cell = grid.get(1, 0);
    expect(cell.char).toBe("X");
    expect(cell.color).toBe("accent");
  });

  it("get returns default cell for unset position", () => {
    const grid = new Grid(3, 1);
    const cell = grid.get(0, 0);
    expect(cell.char).toBe(" ");
    expect(cell.color).toBe("text");
  });

  it("writeString writes characters horizontally", () => {
    const grid = new Grid(10, 1);
    const written = grid.writeString(2, 0, "Hello", "accent");
    expect(written).toBe(5);
    expect(grid.toString()).toBe("  Hello   ");
    expect(grid.get(2, 0).color).toBe("accent");
    expect(grid.get(6, 0).color).toBe("accent");
  });

  it("writeString clips at right edge", () => {
    const grid = new Grid(5, 1);
    const written = grid.writeString(3, 0, "Hello", "text");
    expect(written).toBe(2);
    expect(grid.toString()).toBe("   He");
  });

  it("writeString ignores out-of-bounds start", () => {
    const grid = new Grid(5, 1);
    const written = grid.writeString(5, 0, "Hi", "text");
    expect(written).toBe(0);
    expect(grid.toString()).toBe("     ");
  });

  it("set ignores out-of-bounds coordinates", () => {
    const grid = new Grid(3, 2);
    // Should not throw
    grid.set(-1, 0, "X");
    grid.set(0, -1, "X");
    grid.set(3, 0, "X");
    grid.set(0, 2, "X");
    expect(grid.toString()).toBe("   \n   ");
  });

  it("toColorRuns merges adjacent cells with same color", () => {
    const grid = new Grid(6, 1);
    grid.writeString(0, 0, "AB", "accent");
    grid.writeString(2, 0, "CD", "label");
    grid.writeString(4, 0, "EF", "label");

    const runs = grid.toColorRuns();
    expect(runs).toHaveLength(1); // one row
    expect(runs[0]).toEqual([
      { text: "AB", color: "accent" },
      { text: "CDEF", color: "label" },
    ]);
  });

  it("toColorRuns handles multiple rows", () => {
    const grid = new Grid(3, 2);
    grid.writeString(0, 0, "AAA", "accent");
    grid.writeString(0, 1, "BBB", "dim");

    const runs = grid.toColorRuns();
    expect(runs).toHaveLength(2);
    expect(runs[0]).toEqual([{ text: "AAA", color: "accent" }]);
    expect(runs[1]).toEqual([{ text: "BBB", color: "dim" }]);
  });

  it("toColorRuns produces single run for uniform color", () => {
    const grid = new Grid(4, 1);
    // All default "text" color
    const runs = grid.toColorRuns();
    expect(runs[0]).toEqual([{ text: "    ", color: "text" }]);
  });
});
