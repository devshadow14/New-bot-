const sharp = require("sharp");

const STYLES = {
    "1917":       { bg: "#2b1d0e", grad: ["#c9a15a", "#5c3a1e"], font: "Georgia, serif", filter: "sepia" },
    "arena":      { bg: "#0a0a0a", grad: ["#ffffff", "#888888"], font: "Impact, sans-serif", filter: "none" },
    "blackpink":  { bg: "#000000", grad: ["#ff2d95", "#000000"], font: "Georgia, serif", filter: "none" },
    "devil":      { bg: "#0d0000", grad: ["#ff0000", "#3a0000"], font: "Impact, sans-serif", filter: "glow-red" },
    "fire":       { bg: "#100500", grad: ["#ffcc00", "#ff3300"], font: "Impact, sans-serif", filter: "glow-orange" },
    "glitch":     { bg: "#000000", grad: ["#00fff9", "#ff00c8"], font: "monospace", filter: "glitch" },
    "hacker":     { bg: "#000000", grad: ["#00ff00", "#003300"], font: "monospace", filter: "glow-green" },
    "ice":        { bg: "#001a2b", grad: ["#aeefff", "#3399cc"], font: "Arial, sans-serif", filter: "glow-blue" },
    "impressive": { bg: "#1a1300", grad: ["#ffd700", "#8a6d00"], font: "Georgia, serif", filter: "glow-gold" },
    "leaves":     { bg: "#04170a", grad: ["#7CFC00", "#0b5d1e"], font: "Georgia, serif", filter: "glow-green" },
    "light":      { bg: "#111111", grad: ["#ffffff", "#cccccc"], font: "Arial, sans-serif", filter: "glow-white" },
    "matrix":     { bg: "#000000", grad: ["#00ff41", "#003b00"], font: "monospace", filter: "glow-green" },
    "metallic":   { bg: "#1c1c1c", grad: ["#e0e0e0", "#4a4a4a"], font: "Arial, sans-serif", filter: "none" },
    "neon":       { bg: "#0a0014", grad: ["#ff00ff", "#00ffff"], font: "Arial, sans-serif", filter: "glow-pink" },
    "purple":     { bg: "#0d0018", grad: ["#b266ff", "#4b0082"], font: "Georgia, serif", filter: "glow-purple" },
    "sand":       { bg: "#2b2005", grad: ["#f2d16b", "#8a6d1a"], font: "Georgia, serif", filter: "none" },
    "snow":       { bg: "#0a1a2b", grad: ["#ffffff", "#aee2ff"], font: "Arial, sans-serif", filter: "glow-white" },
    "thunder":    { bg: "#050510", grad: ["#fff700", "#4d4d00"], font: "Impact, sans-serif", filter: "glow-yellow" },
};

function buildSvg(text, style) {
    const s = STYLES[style];
    const safeText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const glow = s.filter.startsWith("glow-") ? s.filter.replace("glow-", "") : null;

    return `
    <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${s.grad[0]}"/>
          <stop offset="100%" stop-color="${s.grad[1]}"/>
        </linearGradient>
        ${glow ? `
        <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>` : ""}
      </defs>
      <rect width="800" height="400" fill="${s.bg}"/>
      <text x="400" y="220" font-family="${s.font}" font-size="${Math.max(38, 130 - safeText.length * 4)}"
            font-weight="bold" fill="url(#grad)" text-anchor="middle" dominant-baseline="middle"
            ${glow ? 'filter="url(#glowFilter)"' : ""}>${safeText}</text>
    </svg>`;
}

async function generateLogo(text, style) {
    if (!STYLES[style]) throw new Error(`Style "${style}" inconnu.`);
    const svg = buildSvg(text.slice(0, 20), style);
    return await sharp(Buffer.from(svg)).png().toBuffer();
}

module.exports = { generateLogo, STYLES };
