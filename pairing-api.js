const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const { handleMessage } = require("./lib/messageHandler");
const { handleGroupParticipantsUpdate } = require("./lib/groupEvents");
const { readDb } = require("./lib/db");
const { getAnticall } = require("./lib/instanceSettings");
const { handleBotConnected } = require("./lib/onConnect");

const PORT = process.env.PORT || 20025;
const app = express();
app.use(cors());
app.use(express.json());

const sessionsDir = path.join(__dirname, "sessions_web");
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, { recursive: true });

// number -> { sock, status: 'pending' | 'connected' }
const activeConnections = new Map();

async function createWebSession(number) {
    const sessionPath = path.join(sessionsDir, number);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        printQRInTerminal: false
    });

    activeConnections.set(number, { sock, status: "pending" });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        const entry = activeConnections.get(number);

        if (connection === "open") {
            if (entry) entry.status = "connected";
            console.log(`✅ Web session connected: ${number}`);
            handleBotConnected(sock, `web:${number}`).catch(e => console.error(`onConnect error: ${e.message}`));

        } else if (connection === "close") {
            const statusCode = lastDisconnect?.error?.output?.statusCode;

            if (statusCode === DisconnectReason.loggedOut) {
                console.log(`🔒 Logged out from web session: ${number}`);
                activeConnections.delete(number);
                fs.rmSync(sessionPath, { recursive: true, force: true });
            } else {
                console.log(`🔄 Web session ${number} disconnected, retrying...`);
                if (entry) entry.status = "pending";
                setTimeout(() => createWebSession(number).catch(() => {}), 3000);
            }
        }
    });

    sock.ev.on("messages.upsert", (chatUpdate) => handleMessage(sock, chatUpdate));
    sock.ev.on("group-participants.update", (update) => handleGroupParticipantsUpdate(sock, update));

    sock.ev.on("call", async (calls) => {
        try {
            const db = readDb();
            if (!getAnticall(sock)) return;
            for (const call of calls) {
                if (call.status === "offer") {
                    await sock.rejectCall(call.id, call.from);
                }
            }
        } catch (error) {
            console.error(`AntiCall Error: ${error.message}`);
        }
    });

    return sock;
}

// ======================================================
// POST /api/pair  { number }
// ======================================================
app.post("/api/pair", async (req, res) => {
    try {
        const number = String(req.body?.number || "").replace(/[^0-9]/g, "");

        if (!number || number.length < 8) {
            return res.status(400).json({ success: false, message: "Numéro invalide." });
        }

        const existing = activeConnections.get(number);
        if (existing?.status === "connected") {
            return res.json({ success: true, message: "Déjà connecté.", isNewUser: false });
        }

        const sock = await createWebSession(number);

        // Laisse le temps au socket de s'initialiser avant de demander le code
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const pairingCode = await sock.requestPairingCode(number);

        res.json({
            success: true,
            pairingCode,
            message: "Code généré avec succès."
        });

    } catch (error) {
        console.error(`❌ Error generating pairing code: ${error.message}`);
        res.status(500).json({ success: false, message: error.message || "Erreur serveur." });
    }
});

// ======================================================
// GET /api/status/:number
// ======================================================
app.get("/api/status/:number", (req, res) => {
    const number = req.params.number.replace(/[^0-9]/g, "");
    const entry = activeConnections.get(number);
    res.json({ status: entry?.status === "connected" ? "connected" : "pending" });
});

// ======================================================
// DELETE /api/session/:number
// ======================================================
app.delete("/api/session/:number", async (req, res) => {
    const number = req.params.number.replace(/[^0-9]/g, "");
    const entry = activeConnections.get(number);

    if (!entry) {
        return res.status(404).json({ success: false, message: "Aucune session active pour ce numéro." });
    }

    try {
        await entry.sock.logout();
    } catch (e) {
        try { entry.sock.ws.close(); } catch (e2) {}
    }

    activeConnections.delete(number);
    fs.rmSync(path.join(sessionsDir, number), { recursive: true, force: true });
    res.json({ success: true });
});

// ======================================================
// GET /api/stats
// ======================================================
app.get("/api/stats", (req, res) => {
    const count = [...activeConnections.values()].filter(e => e.status === "connected").length;
    res.json({ count });
});

// ======================================================
// Health check (préserve le comportement de l'ancien uptime server)
// ======================================================
app.get("/", (req, res) => {
    res.type("text/plain").send("MICHAEL SCOFIELD MD IS ONLINE");
});

async function requestPairingForNumber(number) {
    const existing = activeConnections.get(number);
    if (existing?.status === "connected") {
        return { success: true, alreadyConnected: true };
    }

    const sock = await createWebSession(number);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const pairingCode = await sock.requestPairingCode(number);
    return { success: true, pairingCode };
}

// ======================================================
// RECONNEXION AUTOMATIQUE DES SESSIONS EXISTANTES AU DÉMARRAGE
// ======================================================
async function reconnectExistingSessions() {
    let folders = [];
    try {
        folders = fs.readdirSync(sessionsDir).filter(f => {
            return fs.statSync(path.join(sessionsDir, f)).isDirectory();
        });
    } catch (e) {
        console.error(`❌ Error reading sessions_web folder: ${e.message}`);
        return;
    }

    if (folders.length === 0) {
        console.log("ℹ️ Aucune session web existante à reconnecter.");
        return;
    }

    console.log(`🔄 Reconnexion de ${folders.length} session(s) web existante(s)...`);

    for (const number of folders) {
        try {
            const sock = await createWebSession(number);

            // Si les identifiants ne sont pas valides (pairing jamais terminé), on nettoie
            setTimeout(() => {
                const entry = activeConnections.get(number);
                if (entry && !sock.authState.creds.registered && entry.status !== "connected") {
                    console.log(`🧹 Session ${number} jamais finalisée, nettoyage...`);
                    activeConnections.delete(number);
                    fs.rmSync(path.join(sessionsDir, number), { recursive: true, force: true });
                }
            }, 15000);

        } catch (error) {
            console.error(`❌ Impossible de reconnecter la session ${number}: ${error.message}`);
        }

        // Petit délai entre chaque reconnexion pour éviter de spammer WhatsApp
        await new Promise(r => setTimeout(r, 1500));
    }
}

app.listen(PORT, () => {
    console.log(`🌐 Pairing API running on port ${PORT}`);
    reconnectExistingSessions();
});

function listActiveSessions() {
    return [...activeConnections.entries()]
        .filter(([, entry]) => entry.status === "connected")
        .map(([number]) => number);
}

module.exports = { requestPairingForNumber, listActiveSessions };
