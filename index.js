const TelegramBot = require('node-telegram-bot-api');
const token = "7302018267:AAHMGwEykO6dcfhvoo63namXkuCZ0_o9_no";
const bot = new TelegramBot(token, {polling: true});
const webAppUrl = 'https://1win-global-pro.com/bonus500';
const imgPATH = "https://liquipedia.net/commons/images/thumb/2/24/1win_2024_lightmode.png/600px-1win_2024_lightmode.png"
const dbPath = "https://sheetdb.io/api/v1/9r9b3flxo3dvn"

const saveUser = async (user) => {
    try {
        const response = await fetch(dbPath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if (!response.ok) {
            throw new Error(`Ошибка при сохранении пользователя: ${response.statusText}`);
        }

        console.log('Пользователь успешно сохранен');
    } catch (error) {
        console.error('Ошибка при попытке сохранить данные пользователя:', error);
    }
}

const validateUser = async (id) => {
    try {
        const url = `${dbPath}`; // Предполагаем, что API поддерживает поиск по ID
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Ошибка при получении данных пользователя: ${response.statusText}`);
        }
        const userData = await response.json();

        if (!userData.length) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.error('Ошибка при попытке получить данные пользователя:', error);
        return false;
    }
}


bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text

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
    }

    const userInBase = await validateUser(userId)
    if (!userInBase) {
        await saveUser(user)
    }

    if (text === '/start') {
        await bot.sendPhoto(chatId, imgPATH, {
            caption: 'Этот бот - полная замена официального сайта 1win в России и странах СНГ \n' +
                '\n' +
                'Мы вывели казино на новый уровень, теперь можно играть в любимые слоты прямо в телеграмме 🎰\n' +
                '\n' +
                'Нажимайте на кнопку Регистрация и получите Бонус + 500% к депозиту и 30% кэшбэк на казино 💸',
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Что умеет этот бот? 🤖', web_app: {url: webAppUrl}}],
                    [{text: 'Акции и Бонусы ✈️', web_app: {url: webAppUrl}}],
                    [{text: 'Регистрация с Промокодом 🚀', web_app: {url: webAppUrl}}],
                    [{text: 'Подписаться на канал 1win Premium 😍', web_app: {url: webAppUrl}}],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
            }
        });
    }
});

