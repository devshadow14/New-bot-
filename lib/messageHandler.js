const fs = require("fs");
const path = require("path");
const settings = require("../settings");
const { commands } = require("./commands");

const dbPath = path.join(__dirname, "..", "database.json");

function readDb() {
    let db = { antilink: [], autoreact: false, autoread: false, mode: "public" };
    if (fs.existsSync(dbPath)) {
        try {
            db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        } catch {
            // keep defaults
        }
    }
    return db;
}

async function handleMessage(sock, { messages, type }) {
    try {
        if (type !== "notify") return;

        const m = messages?.[0];
        if (!m || !m.message) return;

        const from = m.key.remoteJid;
        if (!from || from === "status@broadcast") return;

        const globalDb = readDb();

        // AUTOREAD
        if (globalDb.autoread) {
            try { await sock.readMessages([m.key]); } catch (e) { console.error(`AutoRead Error: ${e.message}`); }
        }

        // AUTOREACT
        if (globalDb.autoreact) {
            try {
                const emojis = ["💚", "🔥", "✨", "🙌", "💯", "👑", "🚀", "😍", "⚡", "💎"];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(from, { react: { text: randomEmoji, key: m.key } });
            } catch (e) { console.error(`AutoReact Error: ${e.message}`); }
        }

        const isGroup = from.endsWith("@g.us");
        const sender = m.key.participant || m.key.remoteJid;

        const body =
            m.message.conversation ||
            m.message.extendedTextMessage?.text ||
            m.message.imageMessage?.caption ||
            m.message.videoMessage?.caption ||
            m.message.documentMessage?.caption ||
            "";

        if (!body) return;

        const prefix = settings.prefix || ".";
        const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, "");
        const isOwner = sender.includes(ownerNumber) || m.key.fromMe;

        // MODE (public/private)
        const botMode = globalDb.mode || "public";
        if (botMode === "private" && !isOwner) return;

        // ANTILINK
        if (isGroup && body) {
            const db = readDb();
            if (Array.isArray(db.antilink) && db.antilink.includes(from)) {
                const linkRegex = /chat\.whatsapp\.com\/|https?:\/\//i;
                if (linkRegex.test(body)) {
                    try {
                        const metadata = await sock.groupMetadata(from);
                        const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);
                        const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
                        const isBotAdmin = admins.includes(botId);
                        const isSenderAdmin = admins.includes(sender);

                        if (!isSenderAdmin && !isOwner && isBotAdmin) {
                            await sock.sendMessage(from, { delete: m.key });
                            await sock.sendMessage(from, {
                                text: `🚫 *Link Detected!*\n\n@${sender.split("@")[0]}, links are not allowed here!`,
                                mentions: [sender]
                            });
                        }
                    } catch (error) {
                        console.error(`AntiLink Error: ${error.message}`);
                    }
                }
            }
        }

        // PREFIX CHECK
        if (!body.startsWith(prefix)) return;

        const input = body.slice(prefix.length).trim();
        if (!input) return;

        const parts = input.split(/\s+/);
        const commandName = parts.shift().toLowerCase();
        const args = parts;

        // ANTILINK COMMAND
        if (commandName === "antilink") {
            if (!isOwner) {
                return await sock.sendMessage(from, { text: "❌ *Access Denied:* Only the Bot Owner can use this command." }, { quoted: m });
            }
            const db = readDb();
            if (!Array.isArray(db.antilink)) db.antilink = [];

            if (args[0] === "on") {
                if (!db.antilink.includes(from)) db.antilink.push(from);
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                return await sock.sendMessage(from, { text: "🛡️ *AntiLink System:* Activated! ✅" }, { quoted: m });
            } else if (args[0] === "off") {
                db.antilink = db.antilink.filter(id => id !== from);
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                return await sock.sendMessage(from, { text: "🛡️ *AntiLink System:* Deactivated! ❌" }, { quoted: m });
            } else {
                return await sock.sendMessage(from, { text: `❌ *Usage:* \`${prefix}antilink on/off\`` }, { quoted: m });
            }
        }

        // SETPREFIX (note: rewrites settings.js globally, same as original RIFT-MD behavior)
        if (commandName === "setprefix") {
            if (!isOwner) {
                return await sock.sendMessage(from, { text: "❌ *Access Denied:* Only the Bot Owner can use this command." }, { quoted: m });
            }
            if (!args[0]) {
                return await sock.sendMessage(from, { text: `❌ *Usage:* \`${prefix}setprefix [new_prefix]\`\n💡 *Example:* \`${prefix}setprefix !\`` }, { quoted: m });
            }
            const newPrefix = args[0];
            try {
                const settingsPath = path.join(__dirname, "..", "settings.js");
                let settingsContent = fs.readFileSync(settingsPath, "utf8");
                settingsContent = settingsContent.replace(/prefix:\s*["'`].*?["'`]/, `prefix: "${newPrefix}"`);
                fs.writeFileSync(settingsPath, settingsContent, "utf8");
                settings.prefix = newPrefix;
                return await sock.sendMessage(from, { text: `✅ *Prefix successfully changed to:* \`${newPrefix}\`` }, { quoted: m });
            } catch (error) {
                return await sock.sendMessage(from, { text: "❌ *Error:* Failed to update settings.js" }, { quoted: m });
            }
        }

        // COMMAND ALIASES
        const aliases = {
            "ig": "igdl", "instagram": "igdl",
            "song": "play", "mp3": "play",
            "mp4": "video", "yt": "video"
        };
        const resolvedCommand = aliases[commandName] || commandName;

        // COMMAND EXECUTION
        if (commands[resolvedCommand]) {
            try {
                await commands[resolvedCommand](sock, m, args);
            } catch (error) {
                console.error(`❌ Command Error (${resolvedCommand}): ${error.message}`);
            }
        }

    } catch (error) {
        console.error(`❌ Message Handler Error: ${error.message}`);
    }
}

module.exports = { handleMessage };
