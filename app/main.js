import { app, BrowserWindow } from "electron";
import Store from "electron-store";
import path from "path";

const config = new Store();

const __dirname = path.dirname(new URL(import.meta.url).pathname);

let win;

function createWindow() {
  let options = {
    width: 1200,
    height: 800,
    minWidth: 400,
    minHeight: 400,
    darkTheme: true,
    show: true
  };
  Object.assign(options, config.get("windowBounds"));

  win = new BrowserWindow(options);
  if (process.env.NODE_ENV === "dev") {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  } else {
    win.loadFile(path.join(__dirname, "../build/dist/index.html"));
  }

  win.once("ready-to-show", win.show);

  win.on("close", () => {
    config.set("windowBounds", win.getBounds());
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });
