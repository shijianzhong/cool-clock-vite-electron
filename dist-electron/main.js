import { app, BrowserWindow, ipcMain, screen } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
let winStartPosition = { x: 0, y: 0 };
let mouseStartPosition = { x: 0, y: 0 };
let movingInterval = null;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    frame: false,
    transparent: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    console.log("did-finish-load");
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  ipcMain.on("window-move-open", (_event, value) => {
    windowMove(win, value);
  });
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
const windowMove = (win2, canMoving) => {
  if (canMoving) {
    const winPosition = win2.getPosition();
    winStartPosition = { x: winPosition[0], y: winPosition[1] };
    mouseStartPosition = screen.getCursorScreenPoint();
    if (movingInterval) {
      clearInterval(movingInterval);
    }
    movingInterval = setInterval(() => {
      const cursorPosition = screen.getCursorScreenPoint();
      const x = winStartPosition.x + cursorPosition.x - mouseStartPosition.x;
      const y = winStartPosition.y + cursorPosition.y - mouseStartPosition.y;
      win2.setPosition(x, y, true);
    }, 0);
  } else {
    clearInterval(movingInterval);
    movingInterval = null;
  }
};
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
