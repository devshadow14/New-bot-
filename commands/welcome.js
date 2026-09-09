const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.json');

function getDb() {
    try {
        if (fs.existsSync(dbPath)) return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch {}
    return {};
}

function saveDb(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = async (sock, m, args) => {
    const chatId = m.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');

    if (!isGroup) {
        return await sock.sendMessage(chatId, {
            text: `❌ This command is only for groups!`
        }, { quoted: m });
    }

    const option = args[0]?.toLowerCase();

    if (!option || (option !== 'on' && option !== 'off')) {
        return await sock.sendMessage(chatId, {
            text:
                `❌ *Usage:* \`.welcome on\` or \`.welcome off\`\n\n` +
                `💡 *Example:* \`.welcome on\``
        }, { quoted: m });
    }

    const db = getDb();
    if (!db.groups) db.groups = {};
    if (!db.groups[chatId]) db.groups[chatId] = {};

    db.groups[chatId].welcome = (option === 'on');
    saveDb(db);

    await sock.sendMessage(chatId, {
        text: option === 'on'
            ? `✅ *Welcome enabled!* New members will receive a welcome message.`
            : `❌ *Welcome disabled!* No more welcome messages.`
    }, { quoted: m });
};
