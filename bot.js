const TOKEN = '8758006870:AAG6sNdJ7dvBKdEP0lzgH_MCK-DvcET7_pU';
const CALL_URL = 'https://telegram-call-glow.lovable.app';
const API = `https://api.telegram.org/bot${TOKEN}`;

async function sendRequest(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function sendScheduleMenu(chatId) {
  await sendRequest('sendMessage', {
    chat_id: chatId,
    text: '📅 *Escolha o horário da sua chamada de vídeo:*',
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🟢 AGORA', callback_data: 'hora_agora' }],
        [
          { text: 'em 1h', callback_data: 'hora_1' },
          { text: 'em 2h', callback_data: 'hora_2' }
        ],
        [
          { text: 'em 3h', callback_data: 'hora_3' },
          { text: 'em 4h', callback_data: 'hora_4' }
        ],
        [
          { text: 'em 5h', callback_data: 'hora_5' },
          { text: 'em 6h', callback_data: 'hora_6' }
        ],
        [
          { text: 'em 7h', callback_data: 'hora_7' },
          { text: 'em 8h', callback_data: 'hora_8' }
        ]
      ]
    }
  });
}

async function sendCallReady(chatId, label) {
  const text = label === 'agora'
    ? '📹 *Sua chamada de vídeo está pronta!*\n\nClique no botão abaixo para iniciar:'
    : `📹 *Chamada de vídeo agendada para em ${label}!*\n\nClique no botão abaixo quando estiver na hora: ❤️`;

  await sendRequest('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        {
          text: '📹 Iniciar Chamada',
          web_app: { url: CALL_URL }
        }
      ]]
    }
  });
}

async function handleUpdate(update) {
  // Comando /start
  if (update.message?.text === '/start') {
    const name = update.message.from.first_name || 'amor';
    await sendRequest('sendMessage', {
      chat_id: update.message.chat.id,
      text: `Oi ${name} 🖤\n\nEstou te esperando para nossa chamada de vídeo...\n\nEscolha o melhor horário para você:`,
    });
    await sendScheduleMenu(update.message.chat.id);
    return;
  }

  // Callback dos botões de horário
  if (update.callback_query) {
    const data = update.callback_query.data;
    const chatId = update.callback_query.message.chat.id;

    await sendRequest('answerCallbackQuery', {
      callback_query_id: update.callback_query.id
    });

    const labels = {
      hora_agora: 'agora',
      hora_1: '1h',
      hora_2: '2h',
      hora_3: '3h',
      hora_4: '4h',
      hora_5: '5h',
      hora_6: '6h',
      hora_7: '7h',
      hora_8: '8h',
    };

    if (labels[data]) {
      await sendCallReady(chatId, labels[data]);
    }
  }
}

// Long polling
async function poll(offset = 0) {
  try {
    const res = await fetch(`${API}/getUpdates?offset=${offset}&timeout=30`);
    const data = await res.json();

    if (data.result?.length) {
      for (const update of data.result) {
        await handleUpdate(update);
        offset = update.update_id + 1;
      }
    }
  } catch (e) {
    console.error('Erro:', e.message);
  }

  setTimeout(() => poll(offset), 1000);
}

console.log('🤖 Bot iniciado! Aguardando mensagens...');
poll();
