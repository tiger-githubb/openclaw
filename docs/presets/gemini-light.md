---
title: "Gemini Light Preset"
description: "Run OpenClaw with only Telegram and WhatsApp, powered exclusively by Gemini CLI"
---

# Gemini Light Preset

The **gemini-light** preset configures OpenClaw as a lightweight agent that uses
only **Telegram** and **WhatsApp** as messaging channels and **Gemini CLI** as the
exclusive AI provider. This is ideal for users who have a Google subscription and
do not want to pay for additional AI services.

## What It Does

When applied, the preset:

1. **Sets the default model** to `google-gemini-cli/gemini-3.1-pro-preview`
   (Gemini 3.1 Pro via Google Code Assist OAuth).
2. **Denies all channel plugins** except Telegram and WhatsApp, so only those
   two channels are active.

Your existing configuration (gateway mode, session settings, etc.) is preserved;
the preset only merges the keys it defines.

## Prerequisites

- A Google account with an active subscription (Google One AI Premium or
  Google Workspace with Gemini access).
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) installed:
  ```bash
  npm install -g @google/gemini-cli
  ```
- A Telegram bot token (from [@BotFather](https://t.me/BotFather)).
- A phone with WhatsApp for web pairing.

## Quick Start

### 1. Apply the Preset

```bash
openclaw config preset apply gemini-light
```

### 2. Enable and Authenticate the Gemini CLI Provider

```bash
openclaw plugins enable google-gemini-cli-auth
openclaw models auth login --provider google-gemini-cli --set-default
```

This opens a browser for Google OAuth. Sign in with the account that has your
Gemini subscription.

### 3. Configure Telegram

```bash
openclaw config set channels.telegram.accounts.main.botToken "<your-bot-token>"
```

### 4. Pair WhatsApp

```bash
openclaw channels pair whatsapp
```

Follow the QR code instructions to link your WhatsApp account.

### 5. Start the Gateway

```bash
openclaw gateway run
```

Your agent is now live on Telegram and WhatsApp, powered exclusively by Gemini.

## Listing Available Presets

```bash
openclaw config preset list
```

## Reverting

To undo the preset, remove the deny list and restore your preferred model:

```bash
openclaw config unset plugins.deny
openclaw config unset agents.defaults.model
```

Then restart the gateway.
