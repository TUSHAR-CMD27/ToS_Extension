import { pipeline, env } from '@huggingface/transformers';

// We want to download the model dynamically from HuggingFace to avoid extension package size limits and memory issues
env.allowLocalModels = false;
env.allowRemoteModels = true; // Let it fetch ONNX models

// Instruct the environment to point to my locally bundled ONNX WASM binaries 
// so Chrome Manifest V3 CSP doesn't kill it for dynamically fetching scripts from JSDelivr
env.backends.onnx.wasm.wasmPaths = chrome.runtime.getURL('wasm/');

let classifier = null;

const getModel = async () => {
    if (classifier === null) {
        console.log("🚀 Loading Llama 3.2 1B model into WebGPU...");
        
        try {
            // Using a known, fast, heavily quantized ONNX model optimized for WebGPU
            classifier = await pipeline('text-generation', 'onnx-community/Llama-3.2-1B-Instruct', {
                device: 'webgpu',
                dtype: 'q4', // 4-bit quantization for minimal memory
                progress_callback: (x) => {
                    let progressStr = x.status;
                    if (x.name) progressStr += ` ${x.name}`;
                    if (x.status === 'progress' && x.total) {
                        progressStr += ` (${Math.round((x.loaded / x.total) * 100)}%)`;
                    }
                    console.log(progressStr);
                    chrome.runtime.sendMessage({
                        action: 'AI_PROGRESS',
                        progress: progressStr
                    });
                }
            });
            console.log("✅ ONNX Model Loaded via WebGPU!");
            chrome.runtime.sendMessage({ action: 'MODEL_READY' });
        } catch (error) {
            console.error("❌ WebGPU model loading failed:", error);
            classifier = null;
            throw error;
        }
    }
    return classifier;
};

// Listen for messages from the service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.target !== "offscreen") return false;

    if (request.action === "PROCESS_TEXT") {
        (async () => {
            try {
                const ai = await getModel();
                
                const messages = [
                    { role: 'system', content: 'You are a concise legal AI assistant. Analyze the terms of service below and respond EXACTLY in this format:\nRisk Rating: [Low|Medium|High]\nSummary: [one or two sentences]\nDark Patterns: [bullet points or "None found."]' },
                    { role: 'user', content: request.text }
                ];

                const output = await ai(messages, {
                    max_new_tokens: 80,
                    temperature: 0.1,
                    do_sample: false,
                });

                sendResponse({ success: true, result: output[0].generated_text.at(-1).content });
            } catch (error) {
                console.error("❌ Offscreen AI Error Details:", error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true; // Keep listener alive
    }
    return false;
});
