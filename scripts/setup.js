const readline = require('readline');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const Store = require('electron-store');

// Initialize settings store
const store = new Store({
  encryptionKey: 'universal-chat-aggregator-secure-key'
});

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ensure config directory exists
const configDir = path.join(process.env.APPDATA || (process.platform === 'darwin' ? 
  path.join(process.env.HOME, 'Library/Application Support') : 
  path.join(process.env.HOME, '.config')), 'universal-chat-aggregator');

if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Main setup process
console.log('========================================');
console.log('Universal Chat Aggregator - Setup Wizard');
console.log('========================================');
console.log('This wizard will help you connect to your messaging platforms.');
console.log('You can skip any platform by pressing Enter when prompted.');
console.log('');

// Platform setup functions
async function setupWhatsApp() {
  console.log('== WhatsApp Setup ==');
  console.log('WhatsApp will be connected via WhatsApp Web in the application.');
  console.log('You will need to scan a QR code when you first launch the app.');
  
  return new Promise(resolve => {
    rl.question('Would you like to enable WhatsApp integration? (Y/n): ', (answer) => {
      const enable = answer.toLowerCase() !== 'n';
      store.set('platforms.whatsapp.enabled', enable);
      console.log(enable ? 'WhatsApp integration enabled.' : 'WhatsApp integration disabled.');
      console.log('');
      resolve();
    });
  });
}

async function setupTelegram() {
  console.log('== Telegram Setup ==');
  console.log('To connect Telegram, you need an API ID and API Hash from Telegram.');
  console.log('Visit https://my.telegram.org/apps and create a new application to get these.');
  
  return new Promise(resolve => {
    rl.question('Do you have a Telegram API ID and Hash? (Y/n): ', (answer) => {
      if (answer.toLowerCase() !== 'n') {
        rl.question('Enter your Telegram API ID: ', (apiId) => {
          rl.question('Enter your Telegram API Hash: ', (apiHash) => {
            if (apiId && apiHash) {
              store.set('platforms.telegram.enabled', true);
              store.set('platforms.telegram.apiId', apiId);
              store.set('platforms.telegram.apiHash', apiHash);
              console.log('Telegram integration enabled.');
            } else {
              store.set('platforms.telegram.enabled', false);
              console.log('Telegram integration disabled due to missing credentials.');
            }
            console.log('');
            resolve();
          });
        });
      } else {
        store.set('platforms.telegram.enabled', false);
        console.log('Telegram integration disabled.');
        console.log('');
        resolve();
      }
    });
  });
}

async function setupDiscord() {
  console.log('== Discord Setup ==');
  console.log('For Discord integration, you can use either:');
  console.log('1. A user account (not recommended by Discord)');
  console.log('2. A bot token (recommended, requires creating a bot at https://discord.com/developers)');
  
  return new Promise(resolve => {
    rl.question('Would you like to set up Discord integration? (Y/n): ', (answer) => {
      if (answer.toLowerCase() !== 'n') {
        rl.question('Do you want to use a bot token (b) or user token (u)? (b/u): ', (tokenType) => {
          const isBotToken = tokenType.toLowerCase() !== 'u';
          
          rl.question(`Enter your Discord ${isBotToken ? 'bot' : 'user'} token: `, (token) => {
            if (token) {
              store.set('platforms.discord.enabled', true);
              store.set('platforms.discord.tokenType', isBotToken ? 'bot' : 'user');
              store.set('platforms.discord.token', token);
              console.log('Discord integration enabled.');
            } else {
              store.set('platforms.discord.enabled', false);
              console.log('Discord integration disabled due to missing token.');
            }
            console.log('');
            resolve();
          });
        });
      } else {
        store.set('platforms.discord.enabled', false);
        console.log('Discord integration disabled.');
        console.log('');
        resolve();
      }
    });
  });
}

async function setupSlack() {
  console.log('== Slack Setup ==');
  console.log('For Slack integration, you need to create a Slack app and obtain an OAuth token.');
  console.log('Visit https://api.slack.com/apps to create a new app.');
  
  return new Promise(resolve => {
    rl.question('Would you like to set up Slack integration? (Y/n): ', (answer) => {
      if (answer.toLowerCase() !== 'n') {
        rl.question('Enter your Slack OAuth token: ', (token) => {
          if (token) {
            store.set('platforms.slack.enabled', true);
            store.set('platforms.slack.token', token);
            console.log('Slack integration enabled.');
          } else {
            store.set('platforms.slack.enabled', false);
            console.log('Slack integration disabled due to missing token.');
          }
          console.log('');
          resolve();
        });
      } else {
        store.set('platforms.slack.enabled', false);
        console.log('Slack integration disabled.');
        console.log('');
        resolve();
      }
    });
  });
}

async function setupMessenger() {
  console.log('== Facebook Messenger Setup ==');
  console.log('Messenger integration requires Facebook authentication in the application.');
  console.log('You will be prompted to log in when you first use the app.');
  
  return new Promise(resolve => {
    rl.question('Would you like to enable Messenger integration? (Y/n): ', (answer) => {
      const enable = answer.toLowerCase() !== 'n';
      store.set('platforms.messenger.enabled', enable);
      console.log(enable ? 'Messenger integration enabled.' : 'Messenger integration disabled.');
      console.log('');
      resolve();
    });
  });
}

// Run the setup process
async function runSetup() {
  try {
    // General settings
    console.log('== General Settings ==');
    rl.question('Enter your display name: ', async (name) => {
      store.set('user.name', name || 'User');
      
      // Run platform setups
      await setupWhatsApp();
      await setupTelegram();
      await setupDiscord();
      await setupSlack();
      await setupMessenger();
      
      console.log('Setup completed successfully!');
      console.log('You can now start the application using:');
      console.log('npm start');
      console.log('');
      
      rl.close();
    });
  } catch (error) {
    console.error('Setup failed:', error);
    rl.close();
  }
}

// Start setup
runSetup();