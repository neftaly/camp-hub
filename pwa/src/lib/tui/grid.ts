import type { Cell, Color, ColorRun } from "./types";

export class Grid {
  readonly width: number;
  readonly height: number;
  private cells: Cell[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cells = Array.from({ length: width * height }, () => ({
      char: " ",
      color: "text" as Color,
    }));
  }

  get(col: number, row: number): Cell {
    if (col < 0 || col >= this.width || row < 0 || row >= this.height) {
      return { char: " ", color: "text" };
    }
    return this.cells[row * this.width + col]!;
  }

  set(col: number, row: number, char: string, color?: Color): void {
    if (col < 0 || col >= this.width || row < 0 || row >= this.height) return;
    this.cells[row * this.width + col] = { char, color: color ?? "text" };
  }

  /** Write a string horizontally starting at (col, row). Returns chars actually written. */
  writeString(col: number, row: number, text: string, color?: Color): number {
    let written = 0;
    for (let i = 0; i < text.length; i++) {
      const targetCol = col + i;
      if (targetCol >= this.width) break;
      if (targetCol < 0) continue;
      this.set(targetCol, row, text[i]!, color);
      written++;
    }
    return written;
  }

  /** Plain text representation (for test assertions) */
  toString(): string {
    const rows: string[] = [];
    for (let row = 0; row < this.height; row++) {
      let line = "";
      for (let col = 0; col < this.width; col++) {
        line += this.get(col, row).char;
      }
      rows.push(line);
    }
    return rows.join("\n");
  }

  /** Group cells into color runs per row (for React span rendering) */
  toColorRuns(): ColorRun[][] {
    const result: ColorRun[][] = [];
    for (let row = 0; row < this.height; row++) {
      const runs: ColorRun[] = [];
      let currentText = "";
      let currentColor: Color = "text";

      for (let col = 0; col < this.width; col++) {
        const cell = this.get(col, row);
        if (col === 0) {
          currentText = cell.char;
          currentColor = cell.color;
        } else if (cell.color === currentColor) {
          currentText += cell.char;
        } else {
          runs.push({ text: currentText, color: currentColor });
          currentText = cell.char;
          currentColor = cell.color;
        }
      }
      if (currentText.length > 0) {
        runs.push({ text: currentText, color: currentColor });
      }
      result.push(runs);
    }
    return result;
  }
}
