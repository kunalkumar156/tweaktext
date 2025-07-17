import { app, globalShortcut, clipboard, Tray, Menu } from "electron";
import path from "path";
import dotenv from "dotenv";
import { keyboard, Key } from "@nut-tree-fork/nut-js";
import { cleanWithGemini } from "./utils/gemini";

// Load env variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

let tray: InstanceType<typeof Tray> | null = null;

// Optional delay util
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

app.whenReady().then(() => {
  // Setup tray icon
  const trayIconPath = path.resolve(__dirname, "../assets/trayIcon.png");
  tray = new Tray(trayIconPath);

  const contextMenu = Menu.buildFromTemplate([
    { label: "Quit", click: () => app.quit() },
  ]);

  tray.setToolTip("Gemini Refiner");
  tray.setContextMenu(contextMenu);

  // Register shortcut
  globalShortcut.register("CommandOrControl+Shift+E", async () => {
    const raw = clipboard.readText().trim();
    if (!raw) return;

    console.log("📋 Original text from clipboard:", raw);

    const refined = await cleanWithGemini(raw);
    const output = refined || raw; // fallback if Gemini fails

    clipboard.writeText(output);
    console.log("📋 Clipboard updated with:", output);

    console.log("🧪 Final clipboard before paste:", clipboard.readText());

    // 👇 Delay + simulate Cmd+V
    setTimeout(async () => {
      try {
        await keyboard.pressKey(Key.LeftMeta); // or LeftControl for Windows
        await keyboard.type(Key.V);
        await keyboard.releaseKey(Key.LeftMeta);
        console.log("⌨️ Simulated paste with nut.js");
      } catch (err) {
        console.error("❌ Failed to simulate paste:", err);
      }
    }, 300);
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

// My name is Kishor.
