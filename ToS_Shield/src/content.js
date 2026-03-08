console.log("🛡️ ToS Shield: Content Script Active");

// This function looks for the most relevant text on the page
const extractPageText = () => {
    // We target the main content areas to avoid ads/navbars
    const mainContent = document.querySelector('main') || document.body;
    const text = mainContent.innerText;
    
    // We only take the first 3000 characters for the AI to process quickly
    return text.substring(0, 3000);
};

// Listen for messages from the Popup UI
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "EXTRACT_TEXT") {
        const text = extractPageText();
        console.log("📑 Text extracted, sending to background...");
        sendResponse({ text: text });
    }
});