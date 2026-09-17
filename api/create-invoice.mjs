import { randomUUID } from 'node:crypto';

const products = {
  plus: { name: 'Proxima+', kopecks: 12000 },
  plusplus: { name: 'Proxima++', kopecks: 32000 },
  plusplusplus: { name: 'Proxima+++', kopecks: 85000 },
  'meteors-400': { name: '400 метеоров', kopecks: 8500 },
  'meteors-2500': { name: '2 500 метеоров', kopecks: 43000 },
  'meteors-5500': { name: '5 500 метеоров', kopecks: 86000 },
  'meteors-32000': { name: '32 000 метеоров', kopecks: 430000 },
  'meteors-70000': { name: '70 000 метеоров', kopecks: 860000 }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Метод не поддерживается.' });
  const product = products[req.body?.productId];
  const nickname = String(req.body?.nickname || '').trim();
  if (!product) return res.status(400).json({ error: 'Товар не найден.' });
  if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) return res.status(400).json({ error: 'Введите корректный Minecraft-ник (3–16 символов).' });
  if (!process.env.MILLIDA_API_KEY) return res.status(503).json({ error: 'Оплата пока не настроена.' });

  try {
    const response = await fetch('https://api.millida.net/v2/merchant/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.MILLIDA_API_KEY}` },
      body: JSON.stringify({
        externalId: `proxima-${randomUUID()}`,
        amountKopecks: product.kopecks,
        description: `${product.name} для PROXIMA`,
        playerNickname: nickname
      })
    });
    const invoice = await response.json();
    if (!response.ok || !invoice.paymentUrl) return res.status(502).json({ error: invoice.message || 'Millida не создала счёт. Проверьте API-ключ.' });
    return res.status(200).json({ paymentUrl: invoice.paymentUrl });
  } catch {
    return res.status(502).json({ error: 'Не удалось связаться с Millida.' });
  }
}
