import {
  app,
  globalShortcut,
  clipboard,
  Tray,
  Menu,
  Notification,
} from "electron";
import path from "path";
import dotenv from "dotenv";
import { keyboard, Key } from "@nut-tree-fork/nut-js";
import { cleanWithGemini } from "./utils/gemini";
import AutoLaunch from "electron-auto-launch";

// 🧪 Enable auto-launch on startup

const tweakAutoLauncher = new AutoLaunch({ name: "Tweak" });
tweakAutoLauncher.enable().catch((err) => {
  console.warn("⚠️ Auto-launch failed or denied:", err);
});

// ✅ Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

let tray: Tray | null = null;

// 💤 Optional delay util
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

app.whenReady().then(() => {
  // 🖼️ Resolve tray icon path safely for dev and prod
  const trayIconPath = app.isPackaged
    ? path.join(process.resourcesPath, "assets", "trayIcon.png")
    : path.join(__dirname, "..", "assets", "trayIcon.png");

  console.log("🧭 Tray icon path:", trayIconPath);

  try {
    tray = new Tray(trayIconPath);

    const contextMenu = Menu.buildFromTemplate([
      { label: "Quit", click: () => app.quit() },
    ]);

    tray.setToolTip("Gemini Refiner");
    tray.setContextMenu(contextMenu);
  } catch (err) {
    console.error("❌ Failed to create tray icon:", err);
  }

  // 🍎 Hide Dock icon (macOS only)
  if (process.platform === "darwin" && app.dock) {
    app.dock.hide();
  }

  // 🛎️ Notify user app is running
  new Notification({
    title: "Tweak is running",
    body: "Use Cmd+Shift+E to enhance your writing!",
  }).show();

  // 🎯 Register the global shortcut
  const shortcutRegistered = globalShortcut.register(
    "CommandOrControl+Shift+E",
    async () => {
      const raw = clipboard.readText().trim();
      if (!raw) return;

      const refined = await cleanWithGemini(raw);
      const output = refined || raw;

      clipboard.writeText(output);

      try {
        await sleep(300); // Slight delay to ensure clipboard updates
        await keyboard.pressKey(Key.LeftMeta); // Mac: Cmd key
        await keyboard.type(Key.V);
        await keyboard.releaseKey(Key.LeftMeta);
        console.log("⌨️ Simulated paste");
      } catch (err) {
        console.error("❌ Failed to simulate paste:", err);
      }
    },
  );

  if (!shortcutRegistered) {
    console.error("❌ Global shortcut registration failed!");
  }
});

// 🧹 Cleanup on exit
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
