import net from 'node:net';

function varInt(value) {
  const bytes = [];
  do { let byte = value & 0x7f; value >>>= 7; if (value) byte |= 0x80; bytes.push(byte); } while (value);
  return Buffer.from(bytes);
}
function readVarInt(buffer, offset = 0) {
  let value = 0, shift = 0, index = offset;
  while (index < buffer.length) { const byte = buffer[index++]; value |= (byte & 0x7f) << shift; if (!(byte & 0x80)) return [value, index]; shift += 7; }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Метод не поддерживается.' });
  const status = await new Promise(resolve => {
    const socket = net.createConnection({ host: 'proxima.play.ski', port: 25565 });
    let bytes = Buffer.alloc(0), done = false;
    const finish = value => { if (!done) { done = true; socket.destroy(); resolve(value); } };
    socket.setTimeout(5_000, () => finish({ online: false, players: 0, maxPlayers: 0 }));
    socket.on('error', () => finish({ online: false, players: 0, maxPlayers: 0 }));
    socket.on('connect', () => {
      const host = Buffer.from('proxima.play.ski');
      const packet = Buffer.concat([varInt(0), varInt(771), varInt(host.length), host, Buffer.from([0x63, 0xdd]), varInt(1)]);
      socket.write(Buffer.concat([varInt(packet.length), packet]));
      socket.write(Buffer.from([0x01, 0x00]));
    });
    socket.on('data', chunk => {
      bytes = Buffer.concat([bytes, chunk]);
      try {
        const packet = readVarInt(bytes); if (!packet || bytes.length < packet[1] + packet[0]) return;
        const packetId = readVarInt(bytes, packet[1]);
        const text = readVarInt(bytes, packetId[1]);
        const data = JSON.parse(bytes.subarray(text[1], text[1] + text[0]).toString());
        finish({ online: true, players: data.players?.online || 0, maxPlayers: data.players?.max || 0 });
      } catch { finish({ online: false, players: 0, maxPlayers: 0 }); }
    });
  });
  res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=30');
  return res.status(200).json(status);
}
