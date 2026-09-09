const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const path = require("path");
const settings = require("./settings");
const { commands, loadCommands } = require("./lib/commands");
const { handleMessage } = require("./lib/messageHandler");
const { handleGroupParticipantsUpdate } = require("./lib/groupEvents");
const { readDb } = require("./lib/db");

// ======================================================
// DATABASE
// ======================================================

const dbPath = path.join(__dirname, "database.json");

if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(
        dbPath,
        JSON.stringify({
            antilink: [],
            autoreact: false,
            autoread: false,
            mode: "public",
            autostatus: false
        }, null, 2)
    );
}

// ======================================================
// LOAD COMMANDS
// ======================================================

loadCommands();

// ======================================================
// START BOT (session propriétaire, fixe, comme avant)
// ======================================================

async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        printQRInTerminal: false
    });

    // ==================================================
    // PAIRING CODE
    // ==================================================

    if (!sock.authState.creds.registered) {
        const ownerPhone = settings.ownerNumber.replace(/[^0-9]/g, "");
        console.log(`\n🔄 Requesting pairing code for: ${ownerPhone}...`);

        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(ownerPhone);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n✅ YOUR PAIRING CODE: ${code}\n`);
            } catch (err) {
                console.log(`❌ Pairing Error: ${err.message}`);
            }
        }, 5000);
    }

    // ==================================================
    // SAVE CREDENTIALS
    // ==================================================

    sock.ev.on("creds.update", saveCreds);

    // ==================================================
    // AUTO STATUS VIEW + REACTION
    // ==================================================

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const m = chatUpdate.messages?.[0];
            if (!m || !m.message) return;
            if (m.key.remoteJid !== "status@broadcast") return;

            console.log(`📸 Status detected from: ${m.key.participant || m.participant || "unknown"}`);

            const dbPath = path.join(__dirname, "database.json");
            let db = { autostatus: false };
            if (fs.existsSync(dbPath)) {
                try { db = { ...db, ...JSON.parse(fs.readFileSync(dbPath, "utf8")) }; } catch {}
            }
            if (!db.autostatus) {
                console.log(`⏸️ Autostatus is OFF, skipping.`);
                return;
            }

            const participant = m.key.participant || m.participant;
            if (!participant) {
                console.log(`⚠️ No participant found on status message, cannot react.`);
                return;
            }

            try {
                await sock.readMessages([m.key]);
            } catch (readError) {
                console.error(`⚠️ readMessages failed (non-blocking): ${readError.message}`);
            }

            const emojis = ["💙", "💚", "💛", "💜", "🩷", "🩶"];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

            try {
                await sock.sendMessage("status@broadcast", {
                    react: { text: randomEmoji, key: m.key }
                }, { statusJidList: [participant] });
                console.log(`✅ Reacted to status with ${randomEmoji}`);
            } catch (reactError) {
                console.error(`❌ Failed to react to status: ${reactError.message}`);
            }

        } catch (error) {
            console.error(`Auto Status Error: ${error.message}`);
        }
    });

    // ==================================================
    // CONNECTION UPDATE
    // ==================================================

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const statusCode = lastDisconnect?.error?.output?.statusCode;

            if (statusCode !== DisconnectReason.loggedOut) {
                console.log("🔄 Connection closed. Reconnecting...");
                setTimeout(() => { startBot(); }, 3000);
            } else {
                console.log("❌ WhatsApp logged out.");
            }

        } else if (connection === "open") {
            const ownerJid = settings.ownerNumber.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

            console.log("\n🎊 MICHAEL SCOFIELD MD IS CONNECTED!");

            try {
                await sock.sendMessage(ownerJid, {
                    image: { url: "https://files.catbox.moe/vv674d.jpg" },
                    caption:
                        `╭━━━〔 🤖 *MICHAEL SCOFIELD MD STATUS* 〕━━━⬣\n` +
                        `┃ ✨ *Bot:* Online & Ready!\n` +
                        `┃ 🚀 *Status:* Fully Connected\n` +
                        `┃ ⚡ *Mode:* Active\n` +
                        `┃ 📦 *Commands:* ${Object.keys(commands).length}\n` +
                        `╰━━━━━━━━━━━━━━━━━━━━⬣`
                });
                console.log("✅ Connection message sent to owner.");
            } catch (error) {
                console.error(`❌ Owner notification error: ${error.message}`);
            }
        }
    });

    // ==================================================
    // GROUP EVENTS (welcome / goodbye / antibot)
    // ==================================================

    sock.ev.on("group-participants.update", (update) => handleGroupParticipantsUpdate(sock, update));

    // ==================================================
    // ANTICALL (rejette automatiquement les appels entrants)
    // ==================================================

    sock.ev.on("call", async (calls) => {
        try {
            const db = readDb();
            if (!db.anticall) return;
            for (const call of calls) {
                if (call.status === "offer") {
                    await sock.rejectCall(call.id, call.from);
                }
            }
        } catch (error) {
            console.error(`AntiCall Error: ${error.message}`);
        }
    });

    // ==================================================
    // MESSAGE HANDLER (partagé avec pairing-api.js)
    // ==================================================

    sock.ev.on("messages.upsert", (chatUpdate) => handleMessage(sock, chatUpdate));

    return sock;
}

// ======================================================
// START
// ======================================================

startBot().catch(error => {
    console.error("❌ FATAL BOT ERROR:", error);
});

// ======================================================
// PAIRING API (serveur web pour le site — sessions multi-numéros)
// ======================================================

try {
    require("./pairing-api");
} catch (error) {
    console.error(`❌ Failed to start pairing-api: ${error.message}`);
}
