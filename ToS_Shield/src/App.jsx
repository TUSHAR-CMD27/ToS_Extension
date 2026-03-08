import React, { useState, useEffect } from 'react';
import './App.css';
import Speedometer from './Speedometer';

function App() {
  const [status, setStatus] = useState("Ready to Scan");
  const [result, setResult] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [modelJustReady, setModelJustReady] = useState(false);
  const [risk, setRisk] = useState("");

  const startScan = async () => {
    setIsScanning(true);
    setResult("");
    setRisk("");
    setModelJustReady(false);
    setStatus("Scanning page...");
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_TEXT" }, (response) => {
      if (response && response.text) {
          setStatus("AI is analyzing...");
          chrome.runtime.sendMessage({ action: "PROCESS_TEXT", text: response.text });
      } else {
          setIsScanning(false);
          setStatus("Failed to extract text from this page.");
      }
    });
  };

  useEffect(() => {
    const listener = (message) => {
      if (message.action === "AI_PROGRESS") {
        setIsDownloading(true);
        const prog = message.progress || "";
        if (prog.includes("initiate")) setStatus("Initializing model...");
        else if (prog.includes("download")) setStatus("Downloading AI model (one-time)...");
        else if (prog.includes("progress")) setStatus("Downloading... " + (prog.match(/\(\d+%\)/)?.[0] || ""));
        else if (prog.includes("done") || prog.includes("load")) setStatus("Loading model into GPU...");
        else setStatus(prog);

      } else if (message.action === "MODEL_READY") {
        setIsDownloading(false);
        setIsScanning(false);
        setModelJustReady(true);
        setStatus("Model ready!");

      } else if (message.action === "AI_RESULT") {
        const textOutput = message.result || "";
        
       
        const riskMatch = textOutput.match(/Risk Rating:\s*(Low|Medium|High)/i);
        if (riskMatch) {
          setRisk(riskMatch[1]);
        } else if (/\bhigh\b/i.test(textOutput)) {
          setRisk("High");
        } else if (/\blow\b/i.test(textOutput)) {
          setRisk("Low");
        } else {
          setRisk("Medium");
        }

        setResult(textOutput);
        setStatus("Analysis Complete");
        setIsScanning(false);
        setIsDownloading(false);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  return (
    <div className="popup-container">
      <h1 className="app-title">ToS Shield</h1>

      
      {modelJustReady && (
        <div className="notice-box">
          <p>✅ <strong>Model downloaded!</strong> This is a one-time process.</p>
          <p>Please <strong>close &amp; reopen</strong> this extension, then click <em>Scan Current Page</em>.</p>
        </div>
      )}

      {/* Dynamic Loaders */}
      {isScanning && !modelJustReady && (
        <div className="loader-container">
          <div className="spinner"></div>
          <p className={isDownloading ? "status" : "status pulsing-text"}>
            {status}
          </p>
          {isDownloading && (
            <p className="hint-text">This only happens once ☕</p>
          )}
        </div>
      )}

      {/* Default idle status */}
      {!isScanning && !result && !modelJustReady && (
        <p className="status">{status}</p>
      )}

      <button 
        className="scan-btn" 
        onClick={startScan}
        disabled={isScanning || modelJustReady}
        style={{ opacity: (isScanning || modelJustReady) ? 0.65 : 1 }}
      >
        {isScanning ? "Processing..." : "Scan Current Page"}
      </button>

      {result && !isScanning && (
        <React.Fragment>
          <Speedometer risk={risk} />
          <div className="result-box">
            <strong>AI Analysis:</strong>
            <p>{result}</p>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

export default App;