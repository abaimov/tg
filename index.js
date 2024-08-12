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
        console.log(userData);


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


const sendNotification = async (chatId, message) => {
    try {
        await bot.sendMessage(chatId, message);
        console.log(`Сообщение отправлено пользователю с chatId: ${chatId}`);
    } catch (error) {
        console.error('Ошибка при отправке уведомления:', error);
    }
};
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
            caption: 'ВЫБЕРИТЕ ТИП ИГРЫ',
            reply_markup: {
                keyboard: [
                    [{text: '🎮 ИГРАТЬ И ВЫИГРЫВАТЬ', web_app: {url: webAppUrl}}]
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
            }
        });
        setTimeout(() => {
            sendNotification(chatId, 'Напоминание о важном событии!');
        }, 60000);

        console.log(`Пользователь ${firstName} ${languageCode} (${username || 'без имени пользователя'}) с ID ${userId} нажал /start.`);
    }

});