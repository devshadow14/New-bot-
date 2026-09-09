const os = require("os");
const settings = require("../settings");
const { commands } = require("../lib/commands");

function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
}

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;

    const text =
        `╭━━━〔 🤖 *${settings.botName}* 〕━━━⬣\n` +
        `┃ 👤 *Owner:* ${settings.ownerName}\n` +
        `┃ 🔧 *Prefix:* ${settings.prefix}\n` +
        `┃ 📦 *Commands:* ${Object.keys(commands).length}\n` +
        `┃ ⏱️ *Uptime:* ${formatUptime(process.uptime())}\n` +
        `┃ 🟢 *Node.js:* ${process.version}\n` +
        `┃ 💾 *Platform:* ${os.platform()}\n` +
        `┃ 📌 *Version:* ${settings.version}\n` +
        `╰━━━━━━━━━━━━━━━━━━━━⬣`;

    await sock.sendMessage(from, { text }, { quoted: m });
};
