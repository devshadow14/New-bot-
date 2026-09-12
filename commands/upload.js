const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const FormData = require("form-data");
const fetch = require("node-fetch");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const type = quoted ? Object.keys(quoted).find(k => ["imageMessage", "videoMessage", "audioMessage", "documentMessage"].includes(k)) : null;

    if (!type) {
        return await sock.sendMessage(from, { text: "❌ Cite une image, vidéo, audio ou document avec `.upload`" }, { quoted: m });
    }

    const mediaTypeMap = { imageMessage: "image", videoMessage: "video", audioMessage: "audio", documentMessage: "document" };
    const extMap = { imageMessage: "jpg", videoMessage: "mp4", audioMessage: "mp3", documentMessage: "pdf" };

    try {
        const stream = await downloadContentFromMessage(quoted[type], mediaTypeMap[type]);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("fileToUpload", buffer, { filename: `upload.${extMap[type]}` });

        const response = await fetch("https://catbox.moe/user/api.php", { method: "POST", body: form });
        const url = await response.text();

        if (!url.startsWith("http")) throw new Error(url);

        await sock.sendMessage(from, {
            text: `╭━━━〔 ✅ *UPLOAD* 〕━━━⬣\n┃ ${url.trim()}\n╰━━━━━━━━━━━━━━━━━━━━⬣`
        }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur d'upload: ${error.message}` }, { quoted: m });
    }
};
