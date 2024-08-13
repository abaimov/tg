require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const registrationUrl = process.env.REGISTRATION_AND_LOGIN;
const premiumChanel = process.env.PREMIUM_CHANEL;
const dbPath = process.env.DB_SHEETS_PATH;
const token = process.env.TOKEN;

const IMAGEPATH =
    "https://drive.google.com/u/0/drive-viewer/AKGpihZhfjXvN6O9ZdoIzOM-ZkLfMNCZx1h0yiCuYyTKDnK41iGpMlmbOXBTRwAYHnXiVt6SkkEqL5VD4y2NRQSTyrabkM_xCXZSe6Y=s1600-rw-v1";

const saveUser = async (user) => {
    try {
        const response = await fetch(dbPath, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        });

        if (!response.ok) {
            throw new Error(
                `Ошибка при сохранении пользователя: ${response.statusText}`
            );
        }

        console.log("Пользователь успешно сохранен");
    } catch (error) {
        console.error("Ошибка при попытке сохранить данные пользователя:", error);
    }
};
const validateUser = async (id) => {
    try {
        const response = await fetch("https://sheetdb.io/api/v1/9r9b3flxo3dvn", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(
                `Ошибка при получении данных пользователя: ${response.statusText}`
            );
        }
        const userData = await response.json();
        if (userData.length) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.error("Ошибка при попытке получить данные пользователя:", error);
        return null;
    }
};

const bot = new TelegramBot(token, {polling: true});

const CALLBACK_DATA = {
    BOT_FEATURES: "bot_features",
};

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    const userId = msg.from.id;
    const firstName = msg.from.first_name;
    const username = msg.from.username;
    const languageCode = msg.from.language_code;

    const user = {
        userId,
        firstName,
        nickname: username,
        languageCode,
        date: new Date(Date.now()).toLocaleString("ru-RU"),
    };

    const userInBase = await validateUser(userId);
    console.log("userInBase", userInBase);
    if (!userInBase) {
        await saveUser(user);
    }

    if (text === "/start") {
        await bot.sendPhoto(chatId, IMAGEPATH, {
            caption:
                "Этот бот - полная замена официального сайта 1win в России и странах СНГ \n" +
                "\n" +
                "Мы вывели казино на новый уровень, теперь можно играть в любимые слоты прямо в телеграмме 🎰\n" +
                "\n" +
                "Нажимайте на кнопку Регистрация",
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
                    // [{text: 'Акции и Бонусы ✈️', web_app: {url: registrationWithBonus}}],
                    // [{text: 'Регистрация с Промокодом 🚀', web_app: {url: registrationWithBonus}}],
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
});

// Handle callback queries
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
});
