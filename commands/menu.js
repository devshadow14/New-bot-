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
        "🏠 GENERAL": ["ping", "alive", "menu", "system", "settings", "jid", "getdp", "winfo", "chr", "pair", "vv", "vv2", "save", "font", "fancy", "readmore", "forward", "send", "autostatus", "autolike", "telegram", "help", "runtime", "gstatut", "jidnewsletter", "fb", "repo", "owner", "bot_info"],
        "📥 DOWNLOAD": ["play", "igdl", "twitter", "video"],
        "🔄 CONVERT": ["sticker", "tourl", "toimg", "clear", "qrcode", "translate", "tts"],
        "🎮 FUN": ["kaydo", "angry", "happy", "heart", "sad", "shy", "moon", "confused", "joke", "fact", "quote", "roll", "coin", "8ball", "ship", "compliment", "roast", "pick", "rate", "boom", "bomb"],
        "👥 GROUP": ["add", "antilink", "antilinkaction", "demote", "goodbye", "welcome", "hidetag", "kick", "kickall", "kickall2", "link", "gclink", "promote", "tagall", "mute", "unmute", "pin", "gcinfo", "groupstatus", "warn", "warnlist", "resetwarn", "antibad", "antispam", "antimention", "antidelete", "antibot", "anticall", "open", "close", "delete"],
        "☘️ BUG MENU": ["forceclose", "invis-oom", "invis-oom2", "sql-memory", "ofmcrsl", "pl"],
        "👑 OWNER": ["block", "unblock", "leave", "bye", "join", "setpp", "setpp2", "bc", "deleteme", "setprefix", "mode"],
        "⚙️ SETTINGS": ["autoreact", "autoread", "autotyping", "upload"],
        "🚫 BAN": Array.from({length: 20}, (_, i) => `ban${i + 1}`)
    };

    const categorizedCommands = new Set(Object.values(categories).flat());
    const otherCommands = commandList.filter(cmd => !categorizedCommands.has(cmd));
    if (otherCommands.length > 0) {
        categories["✨ OTHER"] = otherCommands;
    }

    const DIVIDER = "▭".repeat(22);

    let menuCategoriesText = "";
    for (const [catName, cmds] of Object.entries(categories)) {
        const activeCmdsInCat = cmds.filter(cmd => commandList.includes(cmd)).sort();
        if (activeCmdsInCat.length === 0) continue;

        const formattedCmds = activeCmdsInCat.map(cmd => `   ◈ ${getPrefix(sock)}${cmd}`).join("\n");
        menuCategoriesText += `\n┌─⟢ *${catName}* (${activeCmdsInCat.length})\n${formattedCmds}\n└${DIVIDER}\n`;
    }

    try {
        await sock.sendMessage(chatId, { text: "⚡ Chargement du menu..." }, { quoted: m });

        const menu = `
✦───────────────────✦
     ⚡ *${settings.botName}* ⚡
✦───────────────────✦

 👤  ᴜᴛɪʟɪsᴀᴛᴇᴜʀ  ›  *${pushName}*
 👑  ᴏᴡɴᴇʀ       ›  *${settings.ownerName}*
 📦  ᴘʀᴇꜰɪx      ›  *${getPrefix(sock)}*
 ⚙️  ᴍᴏᴅᴇ        ›  *${getMode(sock)}*
 📜  ᴄᴏᴍᴍᴀɴᴅs    ›  *${totalCommands}*
 ⏱️  ʀᴜɴᴛɪᴍᴇ     ›  *${uptime}*
 🏷️  ᴠᴇʀsɪᴏɴ     ›  *${settings.version}*

✦───────────────────✦
${menuCategoriesText}
✦───────────────────✦
   ✨ *Powered by ${settings.ownerName}* ✨
✦───────────────────✦
    `.trim();

        await sock.sendMessage(chatId, {
            image: { url: "https://files.catbox.moe/99l8s6.png" },
            caption: menu
        }, { quoted: m });

    } catch (e) {
        console.error(`Menu Error: ${e.message}`);
    }
};
