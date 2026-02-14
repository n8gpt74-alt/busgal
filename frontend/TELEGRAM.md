# Запуск Telegram Mini App

## Предварительные требования

1. Telegram бот (создайте через @BotFather)
2. Публичный URL для приложения (ngrok, Vercel и т.д.)

## Настройка бота

### 1. Создайте бота в Telegram
1. Откройте @BotFather в Telegram
2. Отправьте /newbot
3. Следуйте инструкциям, получите токен бота

### 2. Настройте Menu Button
1. В @BotFather отправьте /mybots
2. Выберите вашего бота
3. Нажмите Bot Settings → Menu Button → Configure Menu Button
4. Отправьте URL вашего приложения (например: https://your-app.vercel.app)
5. Введите название кнопки (например: "Бухгалтер")

### 3. Добавьте бота в список приложений
1. В @BotFather выберите вашего бота
2. App Settings → Create App Link
3. Выберите ваш бот
4. Введите URL: https://your-app.vercel.app

## Деплой

### Vercel (рекомендуется)
```bash
npm install -g vercel
vercel
```

### Получение публичного URL
После деплоя вы получите URL вида: https://your-project.vercel.app

### Локальная разработка с ngrok
```bash
ngrok http 3000
```
Получите URL типа https://abc123.ngrok.io и используйте его

## Использование

1. Откройте бота в Telegram
2. Нажмите кнопку меню (три линии) или кнопку в меню
3. Приложение откроется внутри Telegram

## Структура Telegram Mini App

Приложение автоматически определяет, запущено ли оно в Telegram:
- Если в Telegram: использует native UI Telegram
- Если в браузере: стандартный веб-интерфейс

## Функции Telegram

- Haptic Feedback при нажатиях
- Нативные уведомления
- Тема оформления Telegram
- Кнопка "Назад"
