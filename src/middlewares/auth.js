const { ADMIN_IDS } = require('../config');

const antiSpam = async (ctx, next) => {
    // Logic thêm kênh (Admin)
    if (ctx.message && ctx.userState?.get(ctx.from?.id) === 'adding_chat') {
        // ... logic thêm kênh ...
        return next();
    }

    // Anti-Crack
    if (!ctx.message || ADMIN_IDS.includes(ctx.from?.id)) return next();
    const text = ctx.message.text || ctx.message.caption || '';
    if (/(crack|hack|keygen|patch|https?:\/\/|t\.me\/)/i.test(text)) {
        try { await ctx.deleteMessage(); } catch (e) {}
        return;
    }
    return next();
};

module.exports = { antiSpam };
