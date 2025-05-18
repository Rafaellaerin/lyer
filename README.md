
```markdown
# **Lyer - Discord Bot**

Lyer is a simple Discord bot built using **[discord.js](https://discord.js.org/)**. It offers essential features for server management and logging.

---

## **Requirements**

Make sure you have the following tools installed and set up:

1. **Node.js** (version **18** or higher) - [Download here](https://nodejs.org/).
2. A **Bot Token** generated in the [Discord Developer Portal](https://discord.com/developers/applications).
3. **Client ID** (Application ID) and **Server ID** (Guild ID).

---

## **Installation**

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/lyer-bot.git
   cd lyer-bot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

---

## **Configuration**

1. Locate the **`.env.example`** file in the root directory.
2. Rename it to **`.env`**:
   ```bash
   mv .env.example .env
   ```

3. Open the `.env` file and add your bot credentials:
   ```env
   TOKEN=your_bot_token_here       # Your bot token
   CLIENT_ID=your_client_id_here   # Your application ID
   GUILD_ID=your_guild_id_here     # Your server (guild) ID
   ```

---

## **Starting the Bot**

To start the bot, run the following command:

```bash
npm start
```

If everything is set up correctly, you will see the following message in your terminal:

```bash
Bot is online! Logged in as YourBot#1234
```

---

## **Project Structure**

```plaintext
src/
│-- commands/           # Bot commands
│-- data/               # Configuration and log files
│-- utils/              # Utility scripts
│-- index.js            # Main bot file
.env.example            # Environment variable template
package.json            # Project configuration and dependencies
README.md               # Documentation
```

---

## **Available Scripts**

- **Start the bot**:
   ```bash
   npm start
   ```

- **Clear registered commands**:
   ```bash
   npm run clear
   ```

---

## **License**

This project is licensed under the **ISC** license. You are free to use, modify, and distribute it.

---

## **Contact**

If you have any questions or need support:

- **GitHub**: [https://github.com/your-username](https://github.com/your-username)
```

---

### **Instructions**:
1. Save this content into a file named **`README.md`** in your project’s root folder.
2. Replace placeholders like `your-username` and `your_bot_token_here` with your actual information.

This file provides a clean, professional guide for setting up and running your Discord bot. 🚀# lyer
