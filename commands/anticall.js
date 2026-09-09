const settings = require("../settings");
const { readDb, writeDb } = require("../lib/db");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, "");
    const isOwner = sender.includes(ownerNumber) || m.key.fromMe;

    if (!isOwner) {
        return await sock.sendMessage(from, { text: "❌ *Access Denied:* Seul le propriétaire peut utiliser cette commande." }, { quoted: m });
    }

    const choice = (args[0] || "").toLowerCase();
    if (choice !== "on" && choice !== "off") {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.anticall on` ou `.anticall off`" }, { quoted: m });
    }

    const db = readDb();
    db.anticall = (choice === "on");
    writeDb(db);

    await sock.sendMessage(from, {
        text: `📵 *AntiCall (global):* ${choice === "on" ? "Activé ✅ - tous les appels seront rejetés automatiquement" : "Désactivé ❌"}`
    }, { quoted: m });
};
