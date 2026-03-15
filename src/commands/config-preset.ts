import { readConfigFileSnapshot, writeConfigFile } from "../config/config.js";
import { PRESETS, applyPreset } from "../config/presets.js";
import { danger, info, success } from "../globals.js";
import type { RuntimeEnv } from "../runtime.js";
import { defaultRuntime } from "../runtime.js";
import { theme } from "../terminal/theme.js";

export async function runConfigPresetList(opts: { runtime?: RuntimeEnv } = {}): Promise<void> {
  const runtime = opts.runtime ?? defaultRuntime;
  if (PRESETS.size === 0) {
    runtime.log(theme.muted("No presets available."));
    return;
  }
  runtime.log(theme.heading("Available presets:\n"));
  for (const preset of PRESETS.values()) {
    runtime.log(`  ${theme.accent(preset.id)}  ${theme.muted("-")}  ${preset.description}`);
  }
  runtime.log("");
  runtime.log(theme.muted(`Apply with: openclaw config preset apply <id>`));
}

export async function runConfigPresetApply(opts: {
  presetId: string;
  runtime?: RuntimeEnv;
}): Promise<void> {
  const runtime = opts.runtime ?? defaultRuntime;
  const preset = PRESETS.get(opts.presetId);
  if (!preset) {
    runtime.error(danger(`Unknown preset: ${opts.presetId}`));
    runtime.error(
      theme.muted(`Run ${theme.command("openclaw config preset list")} to see available presets.`),
    );
    runtime.exit(1);
    return;
  }

  const snapshot = await readConfigFileSnapshot();
  if (!snapshot.valid && snapshot.exists) {
    runtime.error(danger("Config file has validation errors. Fix them before applying a preset."));
    runtime.exit(1);
    return;
  }

  const base = structuredClone(snapshot.resolved ?? {}) as Record<string, unknown>;
  const merged = applyPreset(base, preset);

  await writeConfigFile(merged);
  runtime.log(success(`Applied preset "${preset.name}".`));
  runtime.log("");
  runtime.log(info("Next steps:"));
  if (opts.presetId === "gemini-light") {
    runtime.log(`  1. Enable the Gemini CLI auth plugin:`);
    runtime.log(`     ${theme.command("openclaw plugins enable google-gemini-cli-auth")}`);
    runtime.log(`  2. Authenticate with your Google account:`);
    runtime.log(
      `     ${theme.command("openclaw models auth login --provider google-gemini-cli --set-default")}`,
    );
    runtime.log(`  3. Set your Telegram bot token:`);
    runtime.log(
      `     ${theme.command('openclaw config set channels.telegram.accounts.main.botToken "<token>"')}`,
    );
    runtime.log(`  4. Configure WhatsApp (web pairing):`);
    runtime.log(`     ${theme.command("openclaw channels pair whatsapp")}`);
    runtime.log(`  5. Restart the gateway:`);
    runtime.log(`     ${theme.command("openclaw gateway restart")}`);
  } else {
    runtime.log(`  Restart the gateway to apply: ${theme.command("openclaw gateway restart")}`);
  }
}
