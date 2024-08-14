require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const registrationUrl = process.env.REGISTRATION_AND_LOGIN;
const premiumChanel = process.env.PREMIUM_CHANEL;
const token = process.env.TOKEN;
const fileName = process.env.FILE
const IMAGEPATH = process.env.IMGPATH

const CALLBACK_DATA = {
    BOT_FEATURES: "bot_features",
};

// Проверка и создание файла, если его нет
function checkAndCreateFile() {
    if (!fs.existsSync(fileName)) {
        // Если файла нет, создаем его с начальной структурой
        fs.writeFileSync(fileName, 'Total users: 0\n', 'utf8');
    }
}

// Загрузка данных пользователей из файла
function loadUserData() {
    checkAndCreateFile(); // Проверяем и создаем файл, если нужно

    try {
        const data = fs.readFileSync(fileName, 'utf8');
        const lines = data.split('\n').filter(Boolean);

        // Первая строка — это количество пользователей
        const countLine = lines[0] || 'Total users: 0';
        const count = parseInt(countLine.split(': ')[1], 10) || 0;
        const users = lines.slice(1); // Все строки, кроме первой

        return {users, count};
    } catch (err) {
        console.error("Ошибка при попытке загрузить данные пользователя:", err);
        return {users: [], count: 0};
    }
}

// Сохранение данных пользователей в файл
function saveUserData(users, count) {
    const data = `Total users: ${count}\n` + users.join('\n') + '\n';
    fs.writeFileSync(fileName, data, 'utf8');
}

const bot = new TelegramBot(token, {polling: true});

// Обрабатываем команду /start
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    const userId = msg.from.id;
    const firstName = msg.from.first_name;
    const username = msg.from.username || "Никнейм не установлен";
    const languageCode = msg.from.language_code;

    const user = {
        userId,
        firstName,
        nickname: username,
        languageCode,
        date: new Date(Date.now()).toLocaleString("ru-RU"),
    };

    const {users, count} = loadUserData();
    const userRecord = `${userId} | ${username} | ${user.date}`;

    if (!users.some(line => line.startsWith(String(userId)))) {
        users.push(userRecord);
        const updatedCount = count + 1;
        saveUserData(users, updatedCount);
    }

    if (text === "/start") {
        await bot.sendPhoto(chatId, IMAGEPATH, {
            caption:
                "Этот бот - полная замена официального сайта 1win в России и странах СНГ \n" +
                "\n" +
                "Мы вывели казино на новый уровень, теперь можно играть в любимые слоты прямо в телеграмме 🎰\n" +
                "\n" +
                "Нажимайте на кнопку Регистрация и получите Бонус + 500% к депозиту и 30% кэшбэк на казино 💸",
            reply_markup: {
                inline_keyboard: [
                    [{text: "Регистрация 🗂️", web_app: {url: registrationUrl}}],
                    [{text: "Войти 🔐", web_app: {url: registrationUrl}}],
                    [
                        {
                            text: "Что умеет этот бот? 🤖",
                            callback_data: CALLBACK_DATA.BOT_FEATURES,
                        },
                    ],
                    [
                        {
                            text: "Подписаться на канал 1win Premium 😍",
                            url: premiumChanel,
                        },
                    ],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
    }

    if (text === "/count=ebdf4515") {
        const {count} = loadUserData();
        await bot.sendMessage(chatId, `total count: ${count}`);
    }
});

// Обрабатываем callback queries
bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const callbackData = query.data;

    if (callbackData === CALLBACK_DATA.BOT_FEATURES) {
        await bot.sendPhoto(chatId, IMAGEPATH, {
            caption:
                "Что умеет этот бот ?\n" +
                "\n" +
                "Официальный бот от компании 1win \n" +
                "🤖 Бот создан для безопасного использования казино в Telegram. \n" +
                "✅ Теперь вы можете играть в любимые слоты прямо тут\n" +
                "✅ Для этого нажмите кнопку регистрация внизу экрана\n" +
                "✅ Пройдите регистрацию и наслаждайтесь игровым процессом \n" +
                "\n" +
                "Все данные данные защищены🛡",
            reply_markup: {
                inline_keyboard: [
                    [{text: "Регистрация 🗂️", web_app: {url: registrationUrl}}],
                    [{text: "Войти 🔐", web_app: {url: registrationUrl}}],
                    [
                        {
                            text: "Подписаться на канал 1win Premium 😍",
                            url: premiumChanel,
                        },
                    ],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
    } else if (callbackData === CALLBACK_DATA.SECRET_COMMAND) {
        const {count} = loadUserData();
        await bot.sendMessage(chatId, `Общее количество уникальных пользователей, которые нажали /start: ${count}`);
    }
});
