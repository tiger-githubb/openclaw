import { describe, expect, it } from "vitest";
import { applyPreset, PRESETS } from "./presets.js";

describe("presets", () => {
  it("has a gemini-light preset", () => {
    const preset = PRESETS.get("gemini-light");
    expect(preset).toBeDefined();
    expect(preset!.id).toBe("gemini-light");
    expect(preset!.name).toBe("Gemini Light");
  });

  it("gemini-light sets primary model to gemini-cli provider", () => {
    const preset = PRESETS.get("gemini-light")!;
    const agents = preset.config.agents as Record<string, unknown>;
    const defaults = agents.defaults as Record<string, unknown>;
    const model = defaults.model as Record<string, unknown>;
    expect(model.primary).toBe("google-gemini-cli/gemini-3.1-pro-preview");
  });

  it("gemini-light denies non-telegram/whatsapp channel plugins", () => {
    const preset = PRESETS.get("gemini-light")!;
    const deny = preset.config.plugins!.deny!;
    expect(deny).toContain("discord");
    expect(deny).toContain("slack");
    expect(deny).toContain("signal");
    expect(deny).not.toContain("telegram");
    expect(deny).not.toContain("whatsapp");
  });
});

describe("applyPreset", () => {
  it("merges preset config into base", () => {
    const base = { plugins: { enabled: true } } as Record<string, unknown>;
    const preset = PRESETS.get("gemini-light")!;
    const result = applyPreset(base, preset);
    const plugins = result.plugins as Record<string, unknown>;
    expect(plugins.enabled).toBe(true);
    expect(plugins.deny).toBeDefined();
    expect(Array.isArray(plugins.deny)).toBe(true);
  });

  it("preserves existing config keys not in preset", () => {
    const base = {
      gateway: { mode: "local" },
      channels: { telegram: { accounts: { main: { botToken: "tok" } } } },
    } as Record<string, unknown>;
    const preset = PRESETS.get("gemini-light")!;
    const result = applyPreset(base, preset);
    const gw = result.gateway as Record<string, unknown>;
    expect(gw.mode).toBe("local");
    const channels = result.channels as Record<string, unknown>;
    const tg = channels.telegram as Record<string, unknown>;
    const accounts = tg.accounts as Record<string, unknown>;
    const main = accounts.main as Record<string, unknown>;
    expect(main.botToken).toBe("tok");
  });

  it("replaces arrays instead of concatenating", () => {
    const base = { plugins: { deny: ["old-plugin"] } } as Record<string, unknown>;
    const preset = PRESETS.get("gemini-light")!;
    const result = applyPreset(base, preset);
    const plugins = result.plugins as Record<string, unknown>;
    const deny = plugins.deny as string[];
    expect(deny).not.toContain("old-plugin");
    expect(deny).toContain("discord");
  });

  it("does not mutate the base object", () => {
    const base = { plugins: { enabled: true } } as Record<string, unknown>;
    const preset = PRESETS.get("gemini-light")!;
    applyPreset(base, preset);
    expect((base.plugins as Record<string, unknown>).deny).toBeUndefined();
  });
});
