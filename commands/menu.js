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
        "🏠 MAIN": ["autobio", "menu", "setprefix", "setmenustyle", "pair", "pairsessions", "revokepair", "repo", "ping", "alive", "runtime"],
        "🤖 AI": ["llamacoder", "llama", "deepaimodels", "nanobanana", "txt2video", "veo3", "nanoblend", "chatbot", "gpt", "blackbox", "gemini", "claudepro", "deepai", "meta", "letmegpt", "flux", "unlimitedai"],
        "📥 DOWNLOADER": ["instagram", "mediafire", "facebook", "ytmp3", "play", "playvideo", "ytmp4", "twitter", "pinterest", "spotify", "tiktok", "threads", "soundcloud", "mfdl", "aio"],
        "ℹ️ INFO": ["google", "pinsearch", "lyrics", "wikipedia", "weather", "getid", "groupinfo", "scores", "livescore", "define", "listpair", "adminid", "jid", "owner"],
        "🛠️ TOOLS": ["togif", "gifreact", "catbox", "upload", "viewonce", "tgsticker", "neko", "bible", "uguu", "tocartoon", "toimage", "alightgen", "tiktokboost", "waifu", "ssweb", "shorturl", "translate", "meme", "waifu2", "fact", "quote", "calc", "roll", "flip", "choose", "qr", "currency", "sticker", "take", "telegram"],
        "🎭 FUN": ["joke", "truth", "dare", "roast", "lurk", "shoot", "sleep", "clap", "shrug", "stare", "wave", "poke", "confused", "smile", "peck", "wink", "sip", "blush", "smug", "tickle", "yeet", "think", "highfive", "feed", "wag", "bite", "teehee", "shocked", "bleh", "bored", "nom", "nya", "yawn", "facepalm", "cuddle", "kickgif", "happy", "carry", "hug", "kabedon", "baka", "bonk", "pat", "angry", "spin", "shake", "run", "nod", "nope", "kiss", "dance", "punch", "handshake", "slap", "cry", "lappillow", "pout", "blowkiss", "handhold", "salute", "thumbsup", "laughgif", "tableflip", "actionslist"],
        "👥 GROUP-ADMIN": ["welcome", "goodbye", "setwelcome", "setgoodbye", "gcstatus", "tagall", "hidetag", "mute", "unmute", "muteuser", "unmuteuser", "unmuteall", "setgcname", "setgcpic", "groupdesc", "link", "revokelink", "lockinfo", "unlockinfo", "getpp", "setpp", "promote", "demote", "kick", "kickall", "kickall2", "kicknum", "promoteall", "demoteall", "acceptall", "rejectall", "kickadmin", "unlock", "opentime", "closetime", "block", "unblock", "left", "vcf"],
        "🛡️ GROUP-SECURITY": ["antidelete", "antiedit", "antisticker", "antigroupmention", "antilink", "antigif", "antinum", "antispam", "antibot", "autoreact", "anticall", "mode", "security", "resetsettings"],
        "👑 OWNER": ["newgroup", "sudoadd", "delsudo", "listsudo", "ban", "unban", "banlist", "addcase", "delcase", "listcase", "addreply", "delreply", "listreply", "reply", "setbotname", "setbotimg", "broadcaster"],
        "📁 GAMES": ["riddle", "animequiz"],
        "📁 LOGO": ["1917", "arena", "blackpink", "devil", "fire", "glitch", "hacker", "ice", "impressive", "leaves", "light", "matrix", "metallic", "neon", "purple", "sand", "snow", "thunder", "logolist"]
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
            caption: menu
        }, { quoted: m });

    } catch (e) {
        console.error(`Menu Error: ${e.message}`);
    }
};