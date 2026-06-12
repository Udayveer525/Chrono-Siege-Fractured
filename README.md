# CHRONO SIEGE: FRACTURED

**Chrono Siege: Fractured** is a futuristic, sci-fi Tower Defense game built entirely in vanilla JavaScript and HTML5 using the **Phaser 3** engine. 

You play as the last Chrono Commander. The Chrono Core—a machine designed to stabilize time across realities—has fractured. Now, alternate timelines are bleeding into ours, and you must hold the line to preserve our reality.

## 🚀 Features

*   **Classic Tower Defense Mechanics:** Place, upgrade, and sell towers to defend the core against waves of enemies.
*   **4 Distinct Tower Types:**
    *   **PULSE:** Balanced all-rounder.
    *   **STORM:** High fire rate, low damage. Shreds light enemies.
    *   **TITAN:** High damage, slow fire. Destroys heavily armored tanks.
    *   **APEX:** Extreme range sniper. Prioritizes the highest HP targets.
*   **5 Unique Enemy Types:** Ranging from fast Runners to massive, unstoppable Colossi.
*   **Orbital Strike Ability:** A devastating tactical nuke from orbit to clear out overwhelming waves.
*   **Story-Driven Campaign:** 5 Acts of progressively difficult levels, complete with rich lore, cinematic sequences, and unlocking mechanics.
*   **Custom Map Editor (Internal):** A built-in grid-based map editor to design custom winding paths for new levels.
*   **Persistent Progress:** Game progress, volume settings, and high scores are saved locally in the browser.

## 🛠️ Built With

*   [Phaser 3](https://phaser.io/) - HTML5 Game Framework
*   **Vanilla JavaScript (ES6 Modules)** - No bundlers (Webpack/Vite) required!
*   **HTML/CSS** - Minimal footprint, pure canvas rendering.

## 🎮 How to Play Locally

Because this game uses standard ES6 Modules (`import`/`export`), it cannot be run directly by double-clicking the `index.html` file due to browser security restrictions (CORS). You must run it through a local web server.

### Option 1: Using Node.js (npx)
If you have Node installed, simply open your terminal in the project folder and run:
```bash
npx serve .
```
Then open `http://localhost:3000` in your browser.

### Option 2: Using Python
If you have Python installed, run:
```bash
python -m http.server
```
Then open `http://localhost:8000` in your browser.

### Option 3: VS Code Live Server
If you use Visual Studio Code, simply install the "Live Server" extension, right-click `index.html`, and select **Open with Live Server**.

## 🌐 Deployment

The game is perfectly suited for zero-configuration static hosting platforms like **Vercel**, **Cloudflare Pages**, or **GitHub Pages**. 

A `vercel.json` file is already included in the repository to aggressively cache the `assets/` directory (audio, sprites, etc.) for optimal loading times.

To deploy on Vercel:
1. Push this code to a GitHub repository.
2. Import the repository into your Vercel dashboard.
3. Deploy! (No build command needed).

## 📄 License

This project is intended as a personal portfolio piece and indie experiment. Feel free to explore the code, fork it, and learn from it!
