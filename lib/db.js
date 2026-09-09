const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "database.json");

function readDb() {
    let db = { antilink: [], autoreact: false, autoread: false, mode: "public", autostatus: false, anticall: false, badwords: [], groups: {} };
    if (fs.existsSync(dbPath)) {
        try {
            const loaded = JSON.parse(fs.readFileSync(dbPath, "utf8"));
            db = { ...db, ...loaded };
        } catch {
            // keep defaults
        }
    }
    if (!db.groups) db.groups = {};
    return db;
}

function writeDb(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function getGroupConfig(db, chatId) {
    if (!db.groups[chatId]) db.groups[chatId] = {};
    return db.groups[chatId];
}

module.exports = { readDb, writeDb, getGroupConfig, dbPath };
