const settings = require("../settings");
const fs = require("fs");
const path = require("path");
const { readDb } = require("../lib/db");

module.exports = async (sock, m, args) => {
    const pushName = m.pushName || m.senderPn || (m.sender ? m.sender.split('@')[0] : "User");
    const chatId = m.key.remoteJid;
    const prefix = settings.prefix || ".";

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
    const db = readDb();

    const categories = {
        "🏠 GENERAL": ["ping", "alive", "menu", "system", "settings", "jid", "getdp", "winfo", "chr", "pair", "vv", "vv2", "save", "font", "fancy", "readmore", "forward", "send", "autostatus", "autolike", "telegram", "help", "runtime", "gstatut", "jidnewsletter", "fb", "repo", "owner", "bot_info"],
        "📥 DOWNLOAD": ["play", "igdl", "twitter", "video"],
        "🔄 CONVERT": ["sticker", "tourl", "toimg", "clear"],
        "🎮 FUN": ["kaydo"],
        "👥 GROUP": ["add", "antilink", "antilinkaction", "demote", "goodbye", "welcome", "hidetag", "kick", "kickall", "kickall2", "link", "gclink", "promote", "tagall", "mute", "unmute", "pin", "gcinfo", "groupstatus", "warn", "warnlist", "resetwarn", "antibad", "antispam", "antimention", "antidelete", "antibot", "anticall", "open", "close", "delete"],
        "☘️ BUG MENU": ["forceclose", "invis-oom", "invis-oom2", "sql-memory", "ofmcrsl", "pl"],
        "👑 OWNER": ["block", "unblock", "leave", "join", "setpp", "setpp2", "bc", "deleteme", "setprefix", "mode"],
        "⚙️ SETTINGS": ["autoreact", "autoread", "autotyping", "upload"]
    };

    const categorizedCommands = new Set(Object.values(categories).flat());
    const otherCommands = commandList.filter(cmd => !categorizedCommands.has(cmd));
    if (otherCommands.length > 0) {
        categories["✨ OTHER"] = otherCommands;
    }

    let menuCategoriesText = "";
    for (const [catName, cmds] of Object.entries(categories)) {
        const activeCmdsInCat = cmds.filter(cmd => commandList.includes(cmd));
        if (activeCmdsInCat.length === 0) continue;

        const formattedCmds = activeCmdsInCat.map(cmd => `*┋ ⬡ ${cmd}*`).join("\n");
        menuCategoriesText += `\n\`『 ${catName} 』\`\n╭───────────────────⊷\n${formattedCmds}\n╰───────────────────⊷\n`;
    }

    try {
        await sock.sendMessage(chatId, { text: "⚡ Loading menu..." }, { quoted: m });

        const menu = `
*╭┈───〔 ${settings.botName} 〕┈───⊷*
*├▢ 🤖 ᴏᴡɴᴇʀ:* ${settings.ownerName}
*├▢ 👤 ᴜsᴇʀ:* ${pushName}
*├▢ 📜 ᴄᴏᴍᴍᴀɴᴅs:* ${totalCommands}
*├▢ ⏱️ ʀᴜɴᴛɪᴍᴇ:* ${uptime}
*├▢ 📦 ᴘʀᴇғɪx:* ${prefix}
*├▢ ⚙️ ᴍᴏᴅᴇ:* ${db.mode || "public"}
*├▢ 🏷️ ᴠᴇʀsɪᴏɴ:* ${settings.version}
*╰───────────────────⊷*
${menuCategoriesText}
> *©️ powered by ${settings.ownerName}*
    `.trim();

        await sock.sendMessage(chatId, { text: menu }, { quoted: m });

    } catch (e) {
        console.error(`Menu Error: ${e.message}`);
    }
};
