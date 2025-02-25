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

// Crear un menú principal
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
    'Double Register', // Nueva opción para verificar el servidor
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

// Crear un input de texto (inicialmente oculto)
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

// Crear un cuadro de texto para mostrar los prints
const logBox = blessed.box({
  top: 'center',
  left: 'center',
  width: '80%',
  height: '50%',
  hidden: true, // Ocultar inicialmente
  border: {
    type: 'line',
  },
  scrollable: true, // Permitir desplazamiento
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

// Crear un elemento de texto para mostrar el estado del bot
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

// Añadir elementos a la pantalla
screen.append(titleArt);
screen.append(menu);
screen.append(input);
screen.append(logBox);
screen.append(botStatus);

// Enfocar el menú inicialmente
menu.focus();

// Renderizar la pantalla
screen.render();

// Función para actualizar el estado del bot
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

// Función para mostrar notificaciones
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

  // Ocultar el mensaje después de 2 segundos
  setTimeout(() => {
    message.destroy();
    screen.render();
  }, 2000);
}

// Función para verificar si el servidor tiene doble registro
function checkServerAuth(server, port) {
  return new Promise((resolve) => {
    const client = net.createConnection({ host: server, port }, () => {
      client.end();
      resolve(false); // Si se conecta, no tiene doble registro
    });

    client.on('error', (err) => {
      resolve(true); // Si hay error, probablemente tiene doble registro
    });
  });
}

// Función para redirigir los prints al cuadro de texto
function redirectLogsToBox() {
  const originalLog = console.log;
  console.log = (message) => {
    logBox.insertLine(0, message); // Agregar el mensaje al cuadro
    screen.render();
    originalLog(message); // También imprimir en la consola original
  };
}

// Manejar la selección del menú
menu.on('select', async (item, index) => {
  const selectedOption = item.content;

  if (selectedOption === 'Start Attack') {
    // Mostrar el cuadro de logs y redirigir los prints
    logBox.show();
    logBox.setContent(''); // Limpiar el contenido anterior
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

  }else if(selectedOption === 'Double Register'){
    if(!bot_config.doubleRegister){
      notification("Doble register set up");
    }else{
      notification("Single password register set up");
    }
  } 
  else if (selectedOption === 'Set Bot Name') {
    menu.hide();
    state = 4;
    input.setLabel('NAME:');
    input.show();
    input.focus();
    screen.render();
  } else if (selectedOption === 'Check Server Auth') {
    if (!bot_config.server || !bot_config.port) {
      notification('Primero configura la IP y el puerto.');
      return;
    }

    const hasAuth = await checkServerAuth(bot_config.server, bot_config.port);
    notification(hasAuth ? 'El servidor tiene doble registro.' : 'El servidor no tiene doble registro.');
  } else if (selectedOption === 'Exit') {
    process.exit(0);
  } else {
    notification(`Opción seleccionada: ${selectedOption}`);
  }
});

// Manejar la entrada de texto
input.on('submit', (value) => {
  input.hide();
  input.clearValue();
  menu.show();
  menu.focus();
  screen.render();

  if (state === 0) {
    bot_config.server = value;
    notification(`IP ingresada: ${bot_config.server}`);
  } else if (state === 1) {
    bot_config.port = parseInt(value, 10);
    notification(`Puerto ingresado: ${bot_config.port}`);
  } else if (state === 2) {
    bot_config.message = value;
    notification(`Mensaje ingresado: ${bot_config.message}`);
  } else if (state === 3) {
    bot_config.count = parseInt(value, 10);
    notification(`Contador ingresado: ${bot_config.count}`);
  } else if (state === 4) {
    bot_config.name = value;
    notification(`Nombre del bot ingresado: ${bot_config.name}`);
  }else {
    notification('No se editó nada');
  }
  state = -1;
  updateBotStatus();
});

// Manejar la tecla Escape para volver al menú
input.key(['escape'], () => {
  input.hide();
  input.clearValue();
  menu.show();
  menu.focus();
  screen.render();
});

// Manejar la tecla Q para salir
screen.key(['q', 'C-c'], () => {
  process.exit(0);
});
