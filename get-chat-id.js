// Telegram Chat ID Helper
// Run this in your browser console after messaging your bot

const BOT_TOKEN = '8366110415:AAGqQ0qoae1fHF7-lCSt6e1isjoOFrqG3ys';

async function getChatId() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
    const data = await response.json();
    
    if (data.ok && data.result.length > 0) {
      const chatId = data.result[data.result.length - 1].message.chat.id;
      console.log('Your Chat ID:', chatId);
      return chatId;
    } else {
      console.log('No messages found. Please send a message to your bot first.');
      return null;
    }
  } catch (error) {
    console.error('Error getting chat ID:', error);
  }
}

// Call this function
getChatId();