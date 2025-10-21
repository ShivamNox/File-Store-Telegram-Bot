# 📁 File Store Telegram Bot

A simple and efficient Node.js Telegram bot to **store files** and generate **permanent shareable links**. Easily upload files via Telegram and share them through unique URLs.

---

## ✨ Features

- 📤 Upload and store files via Telegram
- 🔗 Get permanent download/share links
- ⚡ Fast, lightweight, and easy to deploy
- 🔒 Safe and secure file handling
- 🆓 Completely free and open-source

---

## 🚀 Live Bot

Try the bot live here: [@YourBotUsername](https://t.me/YourBotUsername)  
> *(Replace with your actual bot username)*

---

## 📂 Project Structure

```

📁 File-Store-Telegram-Bot/
├── 📁 commands/                  # All bot command modules
│   ├── commands.js              # Possibly a command handler or aggregator
│   ├── disclaimer.js            # Handles /disclaimer command
│   ├── settings.js              # Handles /settings command
│   └── start.js                 # Handles /start command
│
├── bot.js                       # Main bot logic and entry point
├── config.js                    # Bot configuration (or use .env)
├── package.json                 # Project metadata and dependencies
├── package-lock.json            # Lock file for npm
├── README.md                    # Project documentation
└── .gitignore                   # Ignored files for git (e.g., node_modules, .env)

````

---

## 🛠️ Installation & Setup

### 📦 Requirements

- Node.js v16+ and npm
- Telegram Bot Token from [@BotFather](https://t.me/BotFather)
- Optional: A public server or hosting platform (for link access)

---

### ⚙️ Getting Started

1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/File-Store-Telegram-Bot.git
cd File-Store-Telegram-Bot
````

2. **Install Dependencies**

```bash
npm install
```

3. **Configure Environment**

Create a `.env` file in the root directory:

```env
BOT_TOKEN=your_telegram_bot_token
MONGO_URI=you_mongoDB_URI
OWNER_ID=Owner_ID (Your Telegram ID)
START_IMAGE_URL=A_image_url
```

4. **Run the Bot**

```bash
node bot.js
```

> You’re up and running! 🎉

---

## 🧑‍💻 Deployment

You can deploy the bot on:

* **VPS** (using PM2, forever, or screen)
* **Render**, **Railway**, or **Heroku** (Node buildpack)
* **Glitch/Replit** (for small-scale usage)

---

## 🔐 Environment Variables

| Variable           | Description                     |
| ------------------ | ------------------------------- |
| `BOT_TOKEN`        | Your Telegram bot token         |
| `MONGO_URI`        | MongoDB URI                     |
| `OWNER_ID`         | Bot Owner ID                    |
| `START_IMAGE_URL`  | A Image Url                     |                |

---

## 📸 Preview

> *Add a screenshot or GIF here to show the bot in action*
> Example:

![Bot Screenshot](https://your-image-link.com/screenshot.png)

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork this repo, make changes, and submit a pull request.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙋‍♂️ Support

If you like this project, give it a ⭐ on GitHub and share it!
For help or suggestions, feel
