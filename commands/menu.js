const settings = require("../settings");
const fs = require("fs");
const path = require("path");
const { readDb } = require("../lib/db");
const { getPrefix, getMode } = require("../lib/instanceSettings");

module.exports = async (sock, m, args) => {
    const pushName = m.pushName || m.senderPn || (m.sender ? m.sender.split('@')[0] : "User");
    const chatId = m.key.remoteJid;

    function runtime(seconds) {
        seconds = Number(seconds);
        var d = Math.floor(seconds / (3600 * 24));
        var h = Math.floor(seconds % (3600 * 24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 60);
        return `${d > 0 ? d + "d " : ""}${h > 0 ? h + "h " : ""}${m > 0 ? m + "m " : ""}${s}s`;
    }

    const uptime = runtime(process.uptime());

    // 💾 RAM
    const usedMemory = (process.memoryUsage().rss / 1024 / 1024 / 1024).toFixed(2);
    const totalMemory = (require("os").totalmem() / 1024 / 1024 / 1024).toFixed(2);

    // 🕒 TIME
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    let commandList = [];
    try {
        const commandsDir = path.join(__dirname, "../commands");
        if (fs.existsSync(commandsDir)) {
            commandList = fs.readdirSync(commandsDir)
                .filter(file => file.endsWith(".js"))
                .map(file => file.replace(".js", "").toLowerCase());
        }
    } catch (e) {
        console.error(`Error reading commands folder: ${e.message}`);
    }

    const totalCommands = commandList.length;

    const categories = {
        "🏠 MAIN": ["menu", "ping", "alive", "runtime", "pair", "repo", "system", "settings", "owner", "bot_info", "setprefix", "mode", "telegram", "gstatut", "jidnewsletter", "fb", "help"],
        "ℹ️ INFO": ["jid", "getdp", "winfo", "chr"],
        "🛠️ TOOLS": ["sticker", "tourl", "toimg", "upload", "qrcode", "translate", "tts", "font", "fancy", "readmore", "save", "vv", "vv2", "forward", "send", "clear"],
        "🎭 FUN": ["kaydo", "angry", "happy", "heart", "sad", "shy", "moon", "confused", "joke", "fact", "quote", "roll", "coin", "8ball", "ship", "compliment", "roast", "pick", "rate", "boom", "bomb"],
        "📥 DOWNLOADER": ["play", "igdl", "twitter", "video"],
        "👥 GROUP-ADMIN": ["welcome", "goodbye", "tagall", "hidetag", "mute", "unmute", "link", "gclink", "promote", "demote", "kick", "kickall", "kickall2", "setpp2", "add", "gcinfo", "groupstatus", "pin", "warn", "warnlist", "resetwarn", "open", "close", "delete"],
        "🛡️ GROUP-SECURITY": ["antidelete", "antibad", "antibot", "antilink", "antilinkaction", "antispam", "antimention", "anticall", "autoreact", "autoread", "autotyping", "autostatus", "autolike"],
        "👑 OWNER": ["block", "unblock", "setpp", "bc", "deleteme", "leave", "bye", "join"],
        "🚫 BAN": Array.from({ length: 20 }, (_, i) => `ban${i + 1}`),
        "☘️ BUG MENU": ["forceclose", "invis-oom", "invis-oom2", "sql-memory", "ofmcrsl", "pl"]
    };

    const categorizedCommands = new Set(Object.values(categories).flat());
    const otherCommands = commandList.filter(cmd => !categorizedCommands.has(cmd));
    if (otherCommands.length > 0) {
        categories["✨ OTHER"] = otherCommands;
    }

    let menuCategoriesText = "";
    for (const [catName, cmds] of Object.entries(categories)) {
        const activeCmdsInCat = cmds.filter(cmd => commandList.includes(cmd)).sort();
        if (activeCmdsInCat.length === 0) continue;

        const formattedCmds = activeCmdsInCat.map(cmd => `│ • ${cmd}`).join("\n");
        menuCategoriesText += `\n╭─${catName}\n${formattedCmds}\n╰───────────────⭓\n`;
    }

    try {
        await sock.sendMessage(chatId, { text: "🌹 Loading menu bot..." }, { quoted: m });

        const menu = `
╭───────────────⭓
│ 👤 User : ${pushName}
│ ⏱ Runtime : ${uptime}
│ 🕒 Time : ${time}
│ 💾 RAM : ${usedMemory} / ${totalMemory} GB
│ ⚙️ Prefix : [ ${getPrefix(sock)} ]
│ 📦 Commands : ${totalCommands}
│ 🌐 Mode : ${getMode(sock)}
╰───────────────⭓
${menuCategoriesText}
🌹 *DEV MICHAEL SCOFIELD* 🌹
    `.trim();

        await sock.sendMessage(chatId, {
            image: { url: "https://files.catbox.moe/99l8s6.png" },
            caption: menu,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363430627819748@newsletter",
                    newsletterName: settings.botName,
                    serverMessageId: -1
                }
            }
        }, { quoted: m });

    } catch (e) {
        console.error(`Menu Error: ${e.message}`);
    }
};
