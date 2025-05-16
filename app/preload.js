const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  sendMessage: (message) => ipcRenderer.send("message-from-renderer", message),
  onMessage: (callback) => ipcRenderer.on("reply-from-main", (event, arg) => callback(arg))
});
