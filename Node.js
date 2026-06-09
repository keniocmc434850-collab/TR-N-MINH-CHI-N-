const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');

// --- 1. CẤU HÌNH ---
const BOT_TOKEN = 'TOKEN_CUA_BAN'; 
const ADMIN_IDS = [8126773907];    
const CHATS_FILE = 'chats.json';

const bot = new Telegraf(BOT_TOKEN);
const userState = new Map();

// --- 2. HÀM HỖ TRỢ ---
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

// --- 3. MIDDLEWARE & BẢO MẬT ---
bot.use(async (ctx, next) => {
    if (ctx.chat) saveChat(ctx.chat.id);
    
    // Logic Admin thêm kênh
    if (ctx.message && userState.get(ctx.from?.id) === 'adding_chat') {
        if (ctx.message.forward_from_chat) {
            saveChat(ctx.message.forward_from_chat.id);
            userState.set(ctx.from.id, 'idle');
            return ctx.reply(`✅ Đã thêm kênh ID: ${ctx.message.forward_from_chat.id}`);
        }
    }

    // Anti-Crack & Spam (Chỉ cho User, Admin được miễn trừ)
    if (!ctx.message || ADMIN_IDS.includes(ctx.from?.id)) return next();
    
    const text = ctx.message.text || ctx.message.caption || '';
    if (/(crack|hack|keygen|patch|https?:\/\/|t\.me\/)/i.test(text)) {
        try { await ctx.deleteMessage(); } catch (e) {}
        return;
    }
    return next();
});

// --- 4. MODERATION (MUTE/UNMUTE/BAN) ---
// Yêu cầu: Bot phải là Admin trong nhóm đó
bot.command('mute', async (ctx) => {
    if (!ADMIN_IDS.includes(ctx.from.id)) return;
    if (!ctx.message.reply_to_message) return ctx.reply("❌ Vui lòng Reply tin nhắn của người cần Mute.");
    try {
        await ctx.telegram.restrictChatMember(ctx.chat.id, ctx.message.reply_to_message.from.id, {
            permissions: { can_send_messages: false }
        });
        ctx.reply(`🔇 Đã Mute: ${ctx.message.reply_to_message.from.first_name}`);
    } catch (e) { ctx.reply("❌ Lỗi: Không thể mute (Bot thiếu quyền admin hoặc user là admin)"); }
});

bot.command('unmute', async (ctx) => {
    if (!ADMIN_IDS.includes(ctx.from.id)) return;
    if (!ctx.message.reply_to_message) return ctx.reply("❌ Vui lòng Reply tin nhắn của người cần Unmute.");
    try {
        await ctx.telegram.restrictChatMember(ctx.chat.id, ctx.message.reply_to_message.from.id, {
            permissions: { can_send_messages: true, can_send_media_messages: true, can_send_polls: true, can_send_other_messages: true }
        });
        ctx.reply(`🔊 Đã Unmute: ${ctx.message.reply_to_message.from.first_name}`);
    } catch (e) { ctx.reply("❌ Lỗi: Không thể unmute"); }
});

bot.command('ban', async (ctx) => {
    if (!ADMIN_IDS.includes(ctx.from.id)) return;
    if (!ctx.message.reply_to_message) return ctx.reply("❌ Vui lòng Reply tin nhắn của người cần Ban.");
    try {
        await ctx.telegram.banChatMember(ctx.chat.id, ctx.message.reply_to_message.from.id);
        ctx.reply(`🚫 Đã Ban: ${ctx.message.reply_to_message.from.first_name}`);
    } catch (e) { ctx.reply("❌ Lỗi: Không thể ban"); }
});

// --- 5. MENU & GIAO DIỆN ---
const showMenu = (ctx, isEdit = false) => {
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🎮 Danh sách Game', 'game_list')],
        [Markup.button.callback('💰 Bảng giá Dịch vụ', 'price_main')],
        [Markup.button.url('🔑 Mua Key Tự Động', 'https://t.me/Kenios_mc_bot')],
        [Markup.button.url('🌐 Xem tất cả dịch vụ', 'https://linkbio.co/KENIOS')]
    ]);
    const msg = '🛠 **CỬA HÀNG KELIOS HAX**\nChọn dịch vụ bên dưới:';
    if (isEdit) ctx.editMessageText(msg, keyboard);
    else ctx.reply(msg, keyboard);
};

bot.command('menu', (ctx) => showMenu(ctx));
bot.action('menu_main', (ctx) => showMenu(ctx, true));

// Callback Game/Price...
bot.action('game_list', (ctx) => ctx.editMessageText('🎮 **DANH SÁCH GAME**\n- PUBG Mobile (IOS/Android)\n- Liên Quân Mobile', Markup.inlineKeyboard([[Markup.button.callback('⬅️ Quay lại', 'menu_main')]])));

bot.action('price_main', (ctx) => ctx.editMessageText('💰 **CHỌN DANH MỤC GIÁ**', Markup.inlineKeyboard([
    [Markup.button.callback('📱 PUBG IOS', 'price_ios')], [Markup.button.callback('🤖 PUBG ANDROID', 'price_adr')],
    [Markup.button.callback('⚔️ LIÊN QUÂN', 'price_lq')], [Markup.button.callback('⬅️ Menu', 'menu_main')]
])));

bot.action('price_ios', (ctx) => ctx.editMessageText('📱 **PUBG IOS**\n💎 VNHAX: 600K/T - 300K/Tuần\n💎 OASIS VIP: 800K/T - 400K/Tuần', Markup.inlineKeyboard([[Markup.button.callback('⬅️ Quay lại', 'price_main')]])));
bot.action('price_adr', (ctx) => ctx.editMessageText('🤖 **PUBG ANDROID**\n💰 ZOLO: 500K/T - 250K/Tuần\n💰 ROOT: 650K/Tháng', Markup.inlineKeyboard([[Markup.button.callback('⬅️ Quay lại', 'price_main')]])));
bot.action('price_lq', (ctx) => ctx.editMessageText('⚔️ **LIÊN QUÂN**\n💰 Bản thường: 250K/T - 120K/Tuần\n🔥 HYPER: 350K/T - 150K/Tuần', Markup.inlineKeyboard([[Markup.button.callback('⬅️ Quay lại', 'price_main')]])));

// --- 6. QUẢN TRỊ ADMIN ---
bot.command('admin', (ctx) => {
    if (!ADMIN_IDS.includes(ctx.from.id)) return;
    ctx.reply('🛠 **MENU QUẢN TRỊ**', Markup.inlineKeyboard([
        [Markup.button.callback('➕ Thêm kênh', 'admin_add')],
        [Markup.button.callback('📢 Phát sóng', 'admin_broadcast')]
    ]));
});

bot.action('admin_add', (ctx) => { userState.set(ctx.from.id, 'adding_chat'); ctx.editMessageText('📩 Forward 1 tin nhắn từ kênh vào đây.'); });
bot.action('admin_broadcast', (ctx) => { userState.set(ctx.from.id, 'broadcasting'); ctx.editMessageText('📢 Gửi nội dung phát sóng.'); });

bot.on('message', async (ctx) => {
    if (userState.get(ctx.from?.id) === 'broadcasting') {
        const chats = getSavedChats();
        for (const chatId of chats) {
            try {
                if (ctx.message.photo) await bot.telegram.sendPhoto(chatId, ctx.message.photo[0].file_id, { caption: ctx.message.caption });
                else await bot.telegram.sendMessage(chatId, ctx.message.text);
            } catch (e) {}
        }
        userState.set(ctx.from.id, 'idle');
        ctx.reply('✅ Đã phát sóng!');
    }
});

setInterval(async () => {
    const chats = getSavedChats();
    for (const chatId of chats) {
        try { await bot.telegram.sendMessage(chatId, "📢 MUA HÀNG TỰ ĐỘNG: https://t.me/Kenios_mc_bot"); } catch (e) {}
    }
}, 2 * 60 * 60 * 1000);

bot.launch().then(() => console.log("🚀 BOT KELIOS ĐÃ CHẠY HOÀN CHỈNH!"));
