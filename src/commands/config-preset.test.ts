import { describe, expect, it, vi } from "vitest";
import { runConfigPresetList, runConfigPresetApply } from "./config-preset.js";

describe("runConfigPresetList", () => {
  it("lists available presets without error", async () => {
    const logs: string[] = [];
    const runtime = {
      log: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
      error: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
      exit: vi.fn(),
    };
    await runConfigPresetList({ runtime });
    const output = logs.join("\n");
    expect(output).toContain("gemini-light");
    expect(output).toContain("Gemini");
    expect(runtime.exit).not.toHaveBeenCalled();
  });
});

describe("runConfigPresetApply", () => {
  it("rejects an unknown preset id", async () => {
    const logs: string[] = [];
    const runtime = {
      log: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
      error: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
      exit: vi.fn(),
    };
    await runConfigPresetApply({ presetId: "does-not-exist", runtime });
    const output = logs.join("\n");
    expect(output).toContain("Unknown preset");
    expect(runtime.exit).toHaveBeenCalledWith(1);
  });
});
