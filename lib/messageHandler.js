const fs = require("fs");
const path = require("path");
const settings = require("../settings");
const { commands } = require("./commands");
const { readDb, writeDb, getGroupConfig, dbPath } = require("./db");
const { addWarning } = require("./warnings");
const { getPrefix, setPrefix, getMode, setMode } = require("./instanceSettings");

const DEFAULT_BADWORDS = ["putain", "connard", "salope", "enculé", "bitch", "fuck", "nigger"];

// ======================================================
// ANTIDELETE : cache mémoire des messages récents
// ======================================================
const messageCache = new Map(); // id -> { chatId, sender, text, timestamp }
const CACHE_TTL = 15 * 60 * 1000;

function cacheMessage(m, body) {
    if (!m.key?.id) return;
    messageCache.set(m.key.id, {
        chatId: m.key.remoteJid,
        sender: m.key.participant || m.key.remoteJid,
        text: body || "[média]",
        timestamp: Date.now()
    });
    if (messageCache.size > 500) {
        const cutoff = Date.now() - CACHE_TTL;
        for (const [k, v] of messageCache) if (v.timestamp < cutoff) messageCache.delete(k);
    }
}

// ======================================================
// ANTISPAM : suivi mémoire des messages par utilisateur
// ======================================================
const spamTracker = new Map(); // "chatId:sender" -> timestamps[]
const SPAM_WINDOW_MS = 7000;
const SPAM_MAX_MESSAGES = 6;

function isSpamming(chatId, sender) {
    const key = `${chatId}:${sender}`;
    const now = Date.now();
    const timestamps = (spamTracker.get(key) || []).filter(t => now - t < SPAM_WINDOW_MS);
    timestamps.push(now);
    spamTracker.set(key, timestamps);
    return timestamps.length > SPAM_MAX_MESSAGES;
}

async function handleMessage(sock, { messages, type }) {
    try {
        if (type !== "notify") return;

        const m = messages?.[0];
        if (!m || !m.message) return;

        const from = m.key.remoteJid;
        if (!from || from === "status@broadcast") return;

        const globalDb = readDb();

        // ANTIDELETE : détection d'une suppression de message
        if (m.message.protocolMessage?.type === 0 /* REVOKE */) {
            const revokedId = m.message.protocolMessage.key?.id;
            const groupConfig = getGroupConfig(globalDb, from);

            if (groupConfig.antidelete && revokedId) {
                const cached = messageCache.get(revokedId);
                if (cached) {
                    try {
                        await sock.sendMessage(from, {
                            text: `🗑️ *Message supprimé détecté*\n👤 *De:* @${cached.sender.split("@")[0]}\n💬 *Contenu:* ${cached.text}`,
                            mentions: [cached.sender]
                        });
                    } catch (e) {
                        console.error(`AntiDelete Error: ${e.message}`);
                    }
                }
            }
            return;
        }

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

        // Cache pour l'antidelete (même les messages sans texte, utile pour resend basique)
        cacheMessage(m, body);

        if (!body) return;

        const prefix = getPrefix(sock);
        const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, "");
        const isOwner = sender.includes(ownerNumber) || m.key.fromMe;

        // MODE (public/private)
        const botMode = getMode(sock);
        if (botMode === "private" && !isOwner) {
            if (body.startsWith(prefix)) {
                try {
                    await sock.sendMessage(from, { react: { text: "🔒", key: m.key } });
                } catch (e) {
                    console.error(`Reaction Error: ${e.message}`);
                }
            }
            return;
        }

        let groupConfig = isGroup ? getGroupConfig(globalDb, from) : {};
        let isSenderAdmin = false;
        let isBotAdmin = false;

        if (isGroup && (groupConfig.antibad || groupConfig.antispam || groupConfig.antimention || (Array.isArray(globalDb.antilink) && globalDb.antilink.includes(from)))) {
            try {
                const metadata = await sock.groupMetadata(from);
                const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);
                const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
                isBotAdmin = admins.includes(botId);
                isSenderAdmin = admins.includes(sender);
            } catch (e) {
                console.error(`GroupMetadata Error: ${e.message}`);
            }
        }

        // ANTIBAD (mots interdits)
        if (isGroup && groupConfig.antibad && !isSenderAdmin && !isOwner && isBotAdmin) {
            const badwords = globalDb.badwords?.length ? globalDb.badwords : DEFAULT_BADWORDS;
            const lowerBody = body.toLowerCase();
            if (badwords.some(w => lowerBody.includes(w.toLowerCase()))) {
                try {
                    await sock.sendMessage(from, { delete: m.key });
                    const { count, kicked } = addWarning(from, sender);
                    if (kicked) {
                        await sock.groupParticipantsUpdate(from, [sender], "remove");
                        await sock.sendMessage(from, { text: `🚫 @${sender.split("@")[0]} expulsé (3 avertissements - langage interdit).`, mentions: [sender] });
                    } else {
                        await sock.sendMessage(from, { text: `🚫 *Mot interdit détecté !* @${sender.split("@")[0]} (${count}/3 avertissements)`, mentions: [sender] });
                    }
                } catch (e) { console.error(`AntiBad Error: ${e.message}`); }
                return;
            }
        }

        // ANTISPAM
        if (isGroup && groupConfig.antispam && !isSenderAdmin && !isOwner && isBotAdmin) {
            if (isSpamming(from, sender)) {
                try {
                    await sock.sendMessage(from, { delete: m.key });
                    const { count, kicked } = addWarning(from, sender);
                    if (kicked) {
                        await sock.groupParticipantsUpdate(from, [sender], "remove");
                        await sock.sendMessage(from, { text: `🚫 @${sender.split("@")[0]} expulsé (spam répété).`, mentions: [sender] });
                    } else {
                        await sock.sendMessage(from, { text: `⏱️ *Spam détecté !* @${sender.split("@")[0]}, ralentis (${count}/3).`, mentions: [sender] });
                    }
                } catch (e) { console.error(`AntiSpam Error: ${e.message}`); }
                return;
            }
        }

        // ANTIMENTION (mention bombing)
        const mentionedList = m.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (isGroup && groupConfig.antimention && !isSenderAdmin && !isOwner && isBotAdmin && mentionedList.length > 5) {
            try {
                await sock.sendMessage(from, { delete: m.key });
                const { count, kicked } = addWarning(from, sender);
                if (kicked) {
                    await sock.groupParticipantsUpdate(from, [sender], "remove");
                    await sock.sendMessage(from, { text: `🚫 @${sender.split("@")[0]} expulsé (mention bombing).`, mentions: [sender] });
                } else {
                    await sock.sendMessage(from, { text: `🚫 *Trop de mentions !* @${sender.split("@")[0]} (${count}/3)`, mentions: [sender] });
                }
            } catch (e) { console.error(`AntiMention Error: ${e.message}`); }
            return;
        }

        // ANTILINK
        if (isGroup && Array.isArray(globalDb.antilink) && globalDb.antilink.includes(from)) {
            const linkRegex = /chat\.whatsapp\.com\/|https?:\/\/\S+/i;
            if (linkRegex.test(body) && !isSenderAdmin && !isOwner) {
                try {
                    const action = groupConfig.antilinkAction || "warn";

                    // On tente toujours de supprimer le message (WhatsApp refusera
                    // simplement si le bot n'est pas admin, capturé par le catch).
                    try {
                        await sock.sendMessage(from, { delete: m.key });
                    } catch (delError) {
                        console.error(`AntiLink Delete Error: ${delError.message}`);
                    }

                    if (action === "kick") {
                        await sock.groupParticipantsUpdate(from, [sender], "remove");
                        await sock.sendMessage(from, { text: `🚫 @${sender.split("@")[0]} expulsé (lien interdit).`, mentions: [sender] });
                    } else if (action === "delete") {
                        await sock.sendMessage(from, {
                            text: `🚫 *Lien supprimé !*\n@${sender.split("@")[0]}, les liens ne sont pas autorisés ici.`,
                            mentions: [sender]
                        });
                    } else {
                        // "warn" par défaut : supprime + avertit avec compteur X/3
                        const { count, kicked } = addWarning(from, sender);
                        if (kicked) {
                            await sock.groupParticipantsUpdate(from, [sender], "remove");
                            await sock.sendMessage(from, { text: `🚫 @${sender.split("@")[0]} expulsé (3 avertissements - lien).`, mentions: [sender] });
                        } else {
                            await sock.sendMessage(from, { text: `🚫 *Lien supprimé !* @${sender.split("@")[0]} averti (${count}/3)`, mentions: [sender] });
                        }
                    }
                } catch (error) {
                    console.error(`AntiLink Error: ${error.message}`);
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
            if (!isOwner && !isSenderAdmin) {
                return await sock.sendMessage(from, { text: "╭━━━〔 ❌ *ACCESS DENIED* 〕━━━⬣\n┃ Réservé aux admins ou au owner.\n╰━━━━━━━━━━━━━━━━━━━━⬣" }, { quoted: m });
            }
            const db = readDb();
            if (!Array.isArray(db.antilink)) db.antilink = [];

            if (args[0] === "on") {
                if (!db.antilink.includes(from)) db.antilink.push(from);
                writeDb(db);
                return await sock.sendMessage(from, { text: "╭━━━〔 🛡️ *ANTILINK* 〕━━━⬣\n┃ Activé ✅\n╰━━━━━━━━━━━━━━━━━━━━⬣" }, { quoted: m });
            } else if (args[0] === "off") {
                db.antilink = db.antilink.filter(id => id !== from);
                writeDb(db);
                return await sock.sendMessage(from, { text: "╭━━━〔 🛡️ *ANTILINK* 〕━━━⬣\n┃ Désactivé ❌\n╰━━━━━━━━━━━━━━━━━━━━⬣" }, { quoted: m });
            } else {
                return await sock.sendMessage(from, { text: `❌ *Usage:* \`${prefix}antilink on/off\`` }, { quoted: m });
            }
        }

        // SETPREFIX (propre à cette session/numéro, n'affecte plus les autres)
        if (commandName === "setprefix") {
            if (!isOwner) {
                return await sock.sendMessage(from, { text: "╭━━━〔 ❌ *ACCESS DENIED* 〕━━━⬣\n┃ Réservé au propriétaire.\n╰━━━━━━━━━━━━━━━━━━━━⬣" }, { quoted: m });
            }
            if (!args[0]) {
                return await sock.sendMessage(from, { text: `❌ *Usage:* \`${prefix}setprefix [new_prefix]\`\n💡 *Example:* \`${prefix}setprefix !\`` }, { quoted: m });
            }
            const newPrefix = args[0];
            try {
                setPrefix(sock, newPrefix);
                return await sock.sendMessage(from, { text: `╭━━━〔 ✅ *PREFIX* 〕━━━⬣\n┃ Changé sur: \`${newPrefix}\`\n╰━━━━━━━━━━━━━━━━━━━━⬣` }, { quoted: m });
            } catch (error) {
                return await sock.sendMessage(from, { text: "❌ *Error:* Failed to update prefix." }, { quoted: m });
            }
        }

        // MODE (propre à cette session/numéro, n'affecte plus les autres)
        if (commandName === "mode") {
            if (!isOwner) {
                return await sock.sendMessage(from, { text: "╭━━━〔 ❌ *ACCESS DENIED* 〕━━━⬣\n┃ Réservé au propriétaire.\n╰━━━━━━━━━━━━━━━━━━━━⬣" }, { quoted: m });
            }
            const choice = (args[0] || "").toLowerCase();
            if (choice !== "public" && choice !== "private") {
                return await sock.sendMessage(from, { text: `❌ *Usage:* \`${prefix}mode public\` ou \`${prefix}mode private\`\n\n📌 *Mode actuel:* ${botMode}` }, { quoted: m });
            }
            setMode(sock, choice);
            return await sock.sendMessage(from, { text: `╭━━━〔 ⚙️ *MODE* 〕━━━⬣\n┃ Changé sur: \`${choice}\`\n╰━━━━━━━━━━━━━━━━━━━━⬣` }, { quoted: m });
        }

        // COMMAND ALIASES
        const aliases = {
            "ig": "igdl", "instagram": "igdl",
            "song": "play", "mp3": "play",
            "mp4": "video", "yt": "video",
            "gclink": "link"
        };
        const resolvedCommand = aliases[commandName] || commandName;

        // COMMAND EXECUTION
        if (commands[resolvedCommand]) {
            try {
                await sock.sendMessage(from, { react: { text: "⚡", key: m.key } });
            } catch (e) {
                console.error(`Reaction Error: ${e.message}`);
            }
            try {
                await commands[resolvedCommand](sock, m, args);
            } catch (error) {
                console.error(`❌ Command Error (${resolvedCommand}): ${error.message}`);
            }
        } else {
            try {
                await sock.sendMessage(from, { react: { text: "❓", key: m.key } });
            } catch (e) {
                console.error(`Reaction Error: ${e.message}`);
            }
        }

    } catch (error) {
        console.error(`❌ Message Handler Error: ${error.message}`);
    }
}

module.exports = { handleMessage };
