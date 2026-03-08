// Global offscreen document path
const OFFSCREEN_DOCUMENT_PATH = '/src/offscreen/offscreen.html';

async function setupOffscreenDocument(path) {
    // Check if it already exists
    const hasOffscreen = await chrome.offscreen.hasDocument();
    if (hasOffscreen) return;

    // Create the offscreen document if it doesn't exist
    await chrome.offscreen.createDocument({
        url: path,
        reasons: ['WORKERS'],
        justification: 'Run Wllama WebAssembly which requires DOM and Web Worker access',
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "PROCESS_TEXT") {
        (async () => {
            try {
                // Ensure the offscreen document is ready
                await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);

                // Forward the request to the offscreen document
                console.log("📨 Sending text to offscreen document for processing...");
                
                // Wait briefly for the offscreen script to finish injecting and registering its listener
                await new Promise(resolve => setTimeout(resolve, 500)); 
                
                const response = await chrome.runtime.sendMessage({
                    target: 'offscreen',
                    action: 'PROCESS_TEXT',
                    text: request.text,
                });

                if (response && response.success) {
                    chrome.runtime.sendMessage({ 
                        action: "AI_RESULT", 
                        result: response.result 
                    });
                } else {
                    throw new Error(response ? response.error : "Unknown offscreen error");
                }
            } catch (error) {
                console.error("❌ AI Relay Error Details:", error);
                chrome.runtime.sendMessage({ 
                    action: "AI_RESULT", 
                    result: "AI Error: " + error.message
                });
            }
        })();
    }
});