import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import invariant from "tiny-invariant";
import { Configuration, OpenAIApi } from "openai";
import { brotliCompressSync } from "zlib";

config();
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const token = process.env.TELEGRAM_BOT_TOKEN;
const openai = new OpenAIApi(configuration);

invariant(token, "Couldn't read the token the enviroment variable");

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  const baseCompletion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${msg.text}.\n`,
    temperature: 0.7,
    max_tokens: 800,
  });

  const chatId = msg.chat.id;
  const text = msg.text;
  const basePromptOuput = baseCompletion.data.choices.pop();

  if (text === "start") {
    bot.sendMessage(
      chatId,
      "Hi, I'm a bot that can generate text for you, just send me a message and I'll try to generate a text for you"
    );
  }

  if (!basePromptOuput?.text) {
    return bot.sendMessage(
      chatId,
      "please try again, AI couldn't send the data"
    );
  }

  bot.sendMessage(chatId, basePromptOuput?.text);
});

bot.on("error", (err) => console.log(err));
