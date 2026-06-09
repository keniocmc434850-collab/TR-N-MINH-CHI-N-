const fs = require('fs');
const CHATS_FILE = 'chats.json';

const getSavedChats = () => {
    if (!fs.existsSync(CHATS_FILE)) return [];
    return JSON.parse(fs.readFileSync(CHATS_FILE, 'utf8'));
};

const saveChat = (chatId) => {
    let chats = getSavedChats();
    if (!chats.includes(chatId)) {
        chats.push(chatId);
        fs.writeFileSync(CHATS_FILE, JSON.stringify(chats));
    }
};

module.exports = { getSavedChats, saveChat };
