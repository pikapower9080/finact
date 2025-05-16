const { contextBridge, ipcRenderer } = require("electron");

const platformNames = {
  darwin: "macOS",
  win32: "Windows",
  linux: "Linux",
  freebsd: "FreeBSD",
  openbsd: "OpenBSD",
  sunos: "Solaris",
  android: "Android"
};

contextBridge.exposeInMainWorld("electron", {
  sendMessage: (message) => ipcRenderer.send("message-from-renderer", message),
  onMessage: (callback) => ipcRenderer.on("reply-from-main", (event, arg) => callback(arg)),
  platform: platformNames[process.platform] || process.platform,
  isDev: process.env.NODE_ENV === "dev"
});
