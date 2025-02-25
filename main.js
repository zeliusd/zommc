const blessed = require('blessed');
const { generateBots } = require('./mineflayer');
const net = require('net');

let state = -1;
const screen = blessed.screen({
  smartCSR: true,
  title: 'ZOMSPAM BOT',
});

let bot_config = {
  name: "ZOMBOT",
  server: "",
  port: 25565,
  message: "",
  count: 0,
  doubleRegister: false,
};

const asciiArt = `
▗▄▄▄▄▖ ▗▄▖ ▗▖  ▗▖ ▗▄▄▖▗▄▄▖  ▗▄▖ ▗▖  ▗▖
   ▗▞▘▐▌ ▐▌▐▛▚▞▜▌▐▌   ▐▌ ▐▌▐▌ ▐▌▐▛▚▞▜▌
 ▗▞▘  ▐▌ ▐▌▐▌  ▐▌ ▝▀▚▖▐▛▀▘ ▐▛▀▜▌▐▌  ▐▌
▐▙▄▄▄▖▝▚▄▞▘▐▌  ▐▌▗▄▄▞▘▐▌   ▐▌ ▐▌▐▌  ▐▌
`;

const titleArt = blessed.text({
  top: 1,
  left: 'center',
  content: asciiArt,
  style: {
    fg: 'red',
  },
});

const menu = blessed.list({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  items: [
    'Start Attack',
    'Set IP ADDRESS',
    'Set PORT',
    'Set Spam Message',
    'Set COUNT',
    'Set Bot Name',
    'Double Register',
    'Exit',
  ],
  keys: true,
  vi: true,
  style: {
    selected: {
      bg: 'red',
    },
  },
});

const input = blessed.textbox({
  top: 'center',
  left: 'center',
  width: '50%',
  height: 3,
  hidden: true,
  border: {
    type: 'line',
  },
  mouse: true,
  inputOnFocus: true,
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: 'red',
    },
  },
});

const logBox = blessed.box({
  top: 'center',
  left: 'center',
  width: '80%',
  height: '50%',
  hidden: true,
  border: {
    type: 'line',
  },
  scrollable: true,
  keys: true,
  mouse: true,
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: 'red',
    },
  },
});

const botStatus = blessed.text({
  bottom: 0,
  left: 0,
  width: '100%',
  height: 3,
  content: 'BOT CONFIG:\nServer: -  Port: -  Message: - Count: - Name: -',
  style: {
    fg: 'white',
  },
});

screen.append(titleArt);
screen.append(menu);
screen.append(input);
screen.append(logBox);
screen.append(botStatus);

menu.focus();
screen.render();

function updateBotStatus() {
  botStatus.setContent(
    `BOT CONFIG:\n` +
    `Server: ${bot_config.server || '-'} ` +
    `Port: ${bot_config.port || '-'} ` +
    `Message: ${bot_config.message || '-'} ` +
    `Count: ${bot_config.count || '-'} ` +
    `Name: ${bot_config.name || '-'}`
  );
  screen.render();
}

function notification(content) {
  const message = blessed.message({
    parent: screen,
    top: screen.height - 6,
    left: 'center',
    width: '50%',
    height: 3,
    content: content,
    style: {
      bg: 'green',
    },
  });

  setTimeout(() => {
    message.destroy();
    screen.render();
  }, 2000);
}

function checkServerAuth(server, port) {
  return new Promise((resolve) => {
    const client = net.createConnection({ host: server, port }, () => {
      client.end();
      resolve(false);
    });

    client.on('error', (err) => {
      resolve(true);
    });
  });
}

function redirectLogsToBox() {
  const originalLog = console.log;
  console.log = (message) => {
    logBox.insertLine(0, message);
    screen.render();
    originalLog(message);
  };
}

menu.on('select', async (item, index) => {
  const selectedOption = item.content;

  if (selectedOption === 'Start Attack') {
    logBox.show();
    logBox.setContent('');
    redirectLogsToBox();
    generateBots(bot_config);
  } else if (selectedOption === 'Set IP ADDRESS') {
    menu.hide();
    state = 0;
    input.setLabel('IP:');
    input.show();
    input.focus();
    screen.render();
  } else if (selectedOption === 'Set PORT') {
    menu.hide();
    state = 1;
    input.setLabel('PORT:');
    input.show();
    input.focus();
    screen.render();
  } else if (selectedOption === 'Set Spam Message') {
    menu.hide();
    state = 2;
    input.setLabel('MESSAGE:');
    input.show();
    input.focus();
    screen.render();
  } else if (selectedOption === 'Set COUNT') {
    menu.hide();
    state = 3;
    input.setLabel('COUNT:');
    input.show();
    input.focus();
    screen.render();
  } else if (selectedOption === 'Double Register') {
    if (!bot_config.doubleRegister) {
      notification("Double register set up");
    } else {
      notification("Single password register set up");
    }
  } else if (selectedOption === 'Set Bot Name') {
    menu.hide();
    state = 4;
    input.setLabel('NAME:');
    input.show();
    input.focus();
    screen.render();
  } else if (selectedOption === 'Check Server Auth') {
    if (!bot_config.server || !bot_config.port) {
      notification('First configure the IP and port.');
      return;
    }

    const hasAuth = await checkServerAuth(bot_config.server, bot_config.port);
    notification(hasAuth ? 'The server has double registration.' : 'The server does not have double registration.');
  } else if (selectedOption === 'Exit') {
    process.exit(0);
  } else {
    notification(`Selected option: ${selectedOption}`);
  }
});

input.on('submit', (value) => {
  input.hide();
  input.clearValue();
  menu.show();
  menu.focus();
  screen.render();

  if (state === 0) {
    bot_config.server = value;
    notification(`IP entered: ${bot_config.server}`);
  } else if (state === 1) {
    bot_config.port = parseInt(value, 10);
    notification(`Port entered: ${bot_config.port}`);
  } else if (state === 2) {
    bot_config.message = value;
    notification(`Message entered: ${bot_config.message}`);
  } else if (state === 3) {
    bot_config.count = parseInt(value, 10);
    notification(`Count entered: ${bot_config.count}`);
  } else if (state === 4) {
    bot_config.name = value;
    notification(`Bot name entered: ${bot_config.name}`);
  } else {
    notification('Nothing was edited');
  }
  state = -1;
  updateBotStatus();
});

input.key(['escape'], () => {
  input.hide();
  input.clearValue();
  menu.show();
  menu.focus();
  screen.render();
});

screen.key(['q', 'C-c'], () => {
  process.exit(0);
});
