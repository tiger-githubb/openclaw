import type { OpenClawConfig } from "./types.openclaw.js";

/**
 * A preset is a named partial configuration that can be applied on top of
 * an existing config to quickly set up a specific use case.
 */
export type ConfigPreset = {
  /** Unique preset identifier (kebab-case). */
  id: string;
  /** Human-readable name. */
  name: string;
  /** Short description shown in `config preset list`. */
  description: string;
  /** Partial config merged into the user's existing config. */
  config: OpenClawConfig;
};

/**
 * Gemini-light preset: Telegram + WhatsApp channels with Gemini CLI as the
 * exclusive AI provider.  Designed for users who have a Google subscription
 * and want to avoid paying for additional AI services.
 */
const geminiLight: ConfigPreset = {
  id: "gemini-light",
  name: "Gemini Light",
  description: "Telegram + WhatsApp only, powered exclusively by Gemini CLI (Google subscription)",
  config: {
    plugins: {
      deny: [
        "discord",
        "slack",
        "signal",
        "imessage",
        "bluebubbles",
        "irc",
        "googlechat",
        "line",
        "msteams",
        "nostr",
        "matrix",
        "zalo",
        "zalouser",
        "feishu",
        "mattermost",
        "nextcloud-talk",
        "twitch",
        "tlon",
      ],
    },
    agents: {
      defaults: {
        model: {
          primary: "google-gemini-cli/gemini-3.1-pro-preview",
        },
      },
    },
  },
};

/** All built-in presets keyed by id. */
export const PRESETS: ReadonlyMap<string, ConfigPreset> = new Map([[geminiLight.id, geminiLight]]);

/**
 * Deep-merge a preset's config into an existing resolved config object.
 * Arrays are replaced (not concatenated) so deny-lists stay exact.
 */
export function applyPreset(
  base: Record<string, unknown>,
  preset: ConfigPreset,
): Record<string, unknown> {
  return deepMerge(base, preset.config as Record<string, unknown>);
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = result[key];
    if (
      srcVal !== null &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal) &&
      tgtVal !== null &&
      typeof tgtVal === "object" &&
      !Array.isArray(tgtVal)
    ) {
      result[key] = deepMerge(tgtVal as Record<string, unknown>, srcVal as Record<string, unknown>);
    } else {
      result[key] = srcVal;
    }
  }
  return result;
}
