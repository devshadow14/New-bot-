const os = require("os");

function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}

function formatBytes(bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const text =
        `╭━━━〔 🖥️ *SYSTEM INFO* 〕━━━⬣\n` +
        `┃ ⚙️ Platform: ${os.platform()} (${os.arch()})\n` +
        `┃ 🧩 CPU: ${os.cpus()[0]?.model || "Unknown"}\n` +
        `┃ 🔢 Cores: ${os.cpus().length}\n` +
        `┃ 💾 RAM: ${formatBytes(usedMem)} / ${formatBytes(totalMem)}\n` +
        `┃ ⏱️ Bot Uptime: ${formatUptime(process.uptime())}\n` +
        `┃ ⏱️ System Uptime: ${formatUptime(os.uptime())}\n` +
        `┃ 🟢 Node.js: ${process.version}\n` +
        `╰━━━━━━━━━━━━━━━━━━━━⬣`;

    await sock.sendMessage(from, { text }, { quoted: m });
};
