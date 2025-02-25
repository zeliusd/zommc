const mineflayer = require('mineflayer');

const joinMessage = "/register pepe1234"; 
const joinMessage2 = "/register pelon1234 pelon1234"
const disconnectDelay = 2000;           

function generateRandomName(name) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < 4; i++) {
    name += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return name;
}

// Función para crear un bot
function createBot(botConfig) {
  const bot = mineflayer.createBot({
    host: botConfig.server,
    port: botConfig.port,
    username: generateRandomName(botConfig.name),
  });

  bot.on('login', () => {
    console.log(`${bot.username} se ha conectado.`);
    botConfig.doubleRegister ? bot.chat(joinMessage2) : bot.chat(joinMessage);


    setTimeout(() => {
      bot.chat(botConfig.message);
      console.log(`${bot.username} send a message`);
      
      setTimeout(() => bot.end(), 1000);
    }, disconnectDelay);
  });

  bot.on('end', () => {
    console.log(`${bot.username} se ha desconectado.`);
  });

  bot.on('error', (err) => {
    console.error(`${bot.username} encontró un error:`, err);
  });
}


function generateBots(botConfig) {
  for (let i = 1; i <= botConfig.count; i++) {
    const botName = generateRandomName();
    setTimeout(() => createBot(botConfig), i * 5000); // Conectar un bot cada 5 segundos
  }  
}
module.exports = {
  generateBots,
  createBot,
  generateRandomName,
};
