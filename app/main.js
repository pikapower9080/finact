import { app, BrowserWindow, ipcMain } from "electron";
import Store from "electron-store";
import path from "path";
import express from "express";
import expressWs from "express-ws";

const config = new Store();
const server = express();
expressWs(server);

const __dirname = path.dirname(new URL(import.meta.url).pathname);

let win;
let playbackState = {
  state: { playing: false },
  queue: []
};
let connectedSockets = [];

function createWindow() {
  let options = {
    width: 1200,
    height: 800,
    minWidth: 400,
    minHeight: 400,
    darkTheme: true,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
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

ipcMain.on("message-from-renderer", async (event, data) => {
  data = JSON.parse(data);
  if (data.type) {
    switch (data.type) {
      case "quit":
        app.quit();
        break;
      case "playback-state-changed":
        playbackState = { state: data.state, queue: data.queue };
        connectedSockets.forEach((socket) => {
          socket.send(
            JSON.stringify({
              type: "playback-state",
              state: playbackState.state,
              queue: playbackState.queue
            })
          );
        });
        break;
      case "playback-progress":
        if (playbackState.state) {
          playbackState.state.position = data.position;
          connectedSockets.forEach((socket) => {
            if (socket && socket.readyState === 1) {
              socket.send(
                JSON.stringify({
                  type: "playback-progress",
                  position: playbackState.state.position
                })
              );
            }
          });
        }
        break;
      default:
        console.warn("Received message of unknown type: ", data.type);
        break;
    }
  }
});

// Playback server
const apiDocs = {
  "/full": "Returns the playback state and queue",
  "/state": "Returns the playback state",
  "/queue": "Returns the playback queue",
  "/basicQueue": "Returns the queue with basic item info"
};

server.get("/", (req, res) => {
  res.json(apiDocs);
});
server.get("/full", (req, res) => {
  res.json({
    state: playbackState.state,
    queue: playbackState.queue
  });
});
server.get("/state", (req, res) => {
  res.json({
    state: playbackState.state
  });
});
server.get("/queue", (req, res) => {
  res.json({
    queue: playbackState.queue
  });
});
server.get("/basicQueue", (_, res) => {
  res.json({
    queue: {
      index: playbackState.queue?.index,
      items: playbackState.queue.items?.map((item) => {
        return {
          Id: item.Id,
          Name: item.Name
        };
      })
    }
  });
});

server.ws("/", (ws, req) => {
  let index;
  connectedSockets.push(ws);
  index = connectedSockets.length - 1;
  console.log(`WebSocket connection ${index} opened from ${req.ip}`);
  ws.send(
    JSON.stringify({
      type: "playback-state",
      state: playbackState.state,
      queue: playbackState.queue
    })
  );
  ws.on("close", () => {
    console.log(`WebSocket connection ${index} closed`);
    delete connectedSockets[index];
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin" && !process.env.NODE_ENV == "dev") {
    app.quit();
  }
});

server.listen(8514, "0.0.0.0", (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log("Playback server listening on port 8514");
  }
});
