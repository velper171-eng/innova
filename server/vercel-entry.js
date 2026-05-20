import http from "http";

let handler = null;
let loadError = null;

try {
  console.log("Vercel Entry: Importing server.js...");
  const appModule = await import("./server.js");
  handler = appModule.default;
  console.log("Vercel Entry: server.js loaded successfully.");
} catch (err) {
  loadError = err;
  console.error("Vercel Entry: Failed to load server.js:", err);
}

export default function (req, res) {
  if (loadError) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "error",
      message: "Failed to load server.js during Vercel startup",
      error: loadError.message || String(loadError),
      stack: loadError.stack || null
    }));
    return;
  }
  
  if (handler) {
    return handler(req, res);
  }
  
  res.writeHead(500, { "Content-Type": "text/plain" });
  res.end("Server handler not initialized");
}
