# 🛡️ ToS Shield

**ToS Shield** is a Chrome extension that uses on-device AI to instantly analyze Terms of Service agreements and tell you how risky they are — before you click "I Agree."

No data leaves your device. No servers. Just your browser, your GPU, and the truth.

---

## ✨ Features

- **AI-Powered Analysis** — Uses a locally-cached LLM (Llama 3.2 1B via WebGPU) to read and summarize ToS documents in seconds.
- **Risk Speedometer** — A visual gauge that swings from 🟢 Low to 🟡 Medium to 🔴 High based on the AI's judgment.
- **Dark Pattern Detection** — Surfaces hidden clauses, auto-renewals, data-sharing traps, and other shady practices.
- **100% On-Device** — The AI model runs entirely in your browser using WebGPU. Your text is never sent to any external server.
- **One-Time Download** — The AI model (~800MB) is downloaded once and cached permanently. After that, it's instant.

---

## 🚀 Getting Started

### Prerequisites
- Google Chrome (v113+) or Brave — with WebGPU enabled
- Node.js (v18+) and npm

### Installation (Development)

```bash
git clone https://github.com/your-username/tos-shield.git
cd tos-shield/ToS_Shield
npm install
npm run build
```

Then load the `dist/` folder as an unpacked extension in Chrome:
1. Go to `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load Unpacked** → select the `dist/` folder

### First Run
The first time you click **Scan Current Page**, the extension will download the AI model (~800MB). A progress indicator will keep you updated.

> ☕ This download only happens **once**. After it completes, you'll be prompted to **close and reopen** the extension before running your first analysis.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| UI | React + Vite |
| AI Engine | [Transformers.js](https://huggingface.co/docs/transformers.js/) v3 |
| Model | `onnx-community/Llama-3.2-1B-Instruct` (4-bit quantized) |
| Inference | WebGPU (GPU-accelerated, in-browser) |
| Extension API | Chrome Manifest V3 + Offscreen Documents API |

---

## 📁 Project Structure

```
ToS_Shield/
├── public/
│   ├── manifest.json       # Chrome extension manifest
│   └── wasm/               # Local ONNX runtime WASM binaries
├── src/
│   ├── App.jsx             # Popup UI
│   ├── App.css             # Styles (theme: #FBF6F6 / #D96868)
│   ├── Speedometer.jsx     # Animated risk gauge component
│   ├── background.js       # Service worker + offscreen relay
│   ├── content.js          # Page text extractor
│   └── offscreen/
│       ├── offscreen.html  # Offscreen document host
│       └── offscreen.js    # WebGPU AI inference worker
└── vite.config.js
```

---

## ⚙️ How It Works

1. You click **Scan Current Page** in the popup.
2. The content script extracts the visible text from the page (first 3000 characters).
3. The background service worker creates an **Offscreen Document** (a hidden browser tab with full DOM access).
4. Inside the offscreen document, `Transformers.js` loads the Llama model into your GPU via WebGPU.
5. The AI analyzes the text and returns a structured response:
   ```
   Risk Rating: High
   Summary: ...
   Dark Patterns: ...
   ```
6. The risk rating drives the speedometer needle; the full analysis is shown below.

---

## 🔐 Privacy

- No analytics, no telemetry, no tracking.
- Text from pages is **never sent to any server**.
- The AI model runs locally on your machine via WebGPU.
- The model is cached by your browser in its standard storage — you can clear it via `chrome://settings/siteData`.

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.
