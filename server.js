/* =============================================================================
 * RIFT PROTOCOL — online multiplayer relay/lobby server
 * -----------------------------------------------------------------------------
 * Node.js + Express (static file serving) + Socket.io (realtime relay).
 * Pure relay + room manager: the game engine lives in the client. The server
 * never resolves a turn — it only routes lobby state, chat, and game-action
 * deltas between the two players in a room.
 *
 * INSTALL
 *   npm init -y                       (already provided: package.json)
 *   npm install express socket.io
 *
 * RUN (local)
 *   node server.js                    (serves on http://localhost:3000)
 *
 * RAILWAY DEPLOY
 *   1. Push this folder to a GitHub repo.
 *   2. Connect the repo to Railway (railway.app → New Project → Deploy from GitHub).
 *   3. Railway auto-detects Node and runs "node server.js" (the start script).
 *   4. Set the PORT environment variable in the Railway dashboard if needed
 *      (Railway injects PORT automatically; this server honors process.env.PORT).
 *   5. Copy the Railway public URL (e.g. https://your-app.up.railway.app) and set
 *      it as RIFT_SERVER_URL at the top of the gf-ui script in rift_protocol.html.
 *   6. Set FEEDBACK_WEBHOOK_URL in the Railway dashboard (Variables) to your
 *      Discord webhook. It stays server-side only — the client never sees it and
 *      it is never committed. If unset, the /api/feedback endpoint returns 503
 *      and the in-game feedback form shows a graceful "unavailable" message.
 * ========================================================================== */

const path = require('path');
const http = require('http');
const fs = require('fs');
const express = require('express');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const LOG_DIR = path.join(__dirname, 'logs');   // opt-in multiplayer session logs land here

const app = express();
// Behind Railway's proxy → trust the first hop so req.ip is the real client IP
// (needed for per-IP rate limiting on the feedback endpoint).
app.set('trust proxy', 1);

/* ---- feedback proxy (server-side; keeps the Discord webhook OFF the client) ----
   The browser POSTs raw feedback fields to /api/feedback; the server validates,
   rate-limits, and forwards a Discord embed using FEEDBACK_WEBHOOK_URL — which
   lives ONLY in the server environment and is never shipped to the client or the
   repo. Anti-spam: per-IP + global sliding-window limits, a honeypot field, tight
   size caps, and allowed_mentions disabled so message text can never ping. */
const FEEDBACK_WEBHOOK_URL = process.env.FEEDBACK_WEBHOOK_URL || '';
const FB = { ipMax: 5, ipWindowMs: 10 * 60 * 1000, globalMax: 100, globalWindowMs: 10 * 60 * 1000, maxBody: 16 * 1024 };
const fbIpHits = new Map();   // ip -> [timestamps]
let fbGlobalHits = [];        // [timestamps]
function fbPrune(arr, windowMs, now) { const cut = now - windowMs; let i = 0; while (i < arr.length && arr[i] < cut) i++; return i ? arr.slice(i) : arr; }
function fbRateLimited(ip) {
  const now = Date.now();
  fbGlobalHits = fbPrune(fbGlobalHits, FB.globalWindowMs, now);
  if (fbGlobalHits.length >= FB.globalMax) return true;                 // protect Discord from any flood
  let hits = fbPrune(fbIpHits.get(ip) || [], FB.ipWindowMs, now);
  if (hits.length >= FB.ipMax) { fbIpHits.set(ip, hits); return true; } // per-IP cap
  hits.push(now); fbIpHits.set(ip, hits);
  fbGlobalHits.push(now);
  return false;
}
// periodic cleanup so idle IP buckets don't accumulate in memory
const fbCleanup = setInterval(() => {
  const now = Date.now();
  for (const [ip, arr] of fbIpHits) { const p = fbPrune(arr, FB.ipWindowMs, now); if (p.length) fbIpHits.set(ip, p); else fbIpHits.delete(ip); }
}, 5 * 60 * 1000);
if (fbCleanup.unref) fbCleanup.unref();
const fbStr = (v, max) => String(v == null ? '' : v).slice(0, max);

app.post('/api/feedback', express.json({ limit: FB.maxBody }), async (req, res) => {
  try {
    if (!FEEDBACK_WEBHOOK_URL) return res.status(503).json({ error: 'Feedback is not configured.' });
    const b = req.body || {};
    if (b.hp) return res.status(204).end();                            // honeypot tripped → silently drop (looks like success)
    const type = fbStr(b.type, 40).trim();
    const area = fbStr(b.area, 60).trim();
    const message = fbStr(b.message, 1000).trim();
    const name = fbStr(b.name, 60).trim();
    const email = fbStr(b.email, 100).trim();
    const version = fbStr(b.version, 20).trim();
    if (!type || !area || message.length < 30) return res.status(400).json({ error: 'Invalid feedback.' });
    const ip = String(req.ip || '');
    if (fbRateLimited(ip)) return res.status(429).json({ error: 'Too many submissions — please try again later.' });
    const d = new Date(), pad = (n) => String(n).padStart(2, '0');
    const ts = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
    const payload = {
      allowed_mentions: { parse: [] },                                 // message text can never @ping
      embeds: [{
        title: (type + ' — ' + area).slice(0, 256),
        description: message.slice(0, 4000),
        color: type === 'Bug Report' ? 15158332 : 3447003,
        fields: [
          { name: 'Name', value: (name || 'Not provided').slice(0, 1024), inline: true },
          { name: 'Email', value: (email || 'Not provided').slice(0, 1024), inline: true },
          { name: 'Submitted', value: ts, inline: false },
        ],
        footer: { text: ('RIFT PROTOCOL Feedback' + (version ? ' · v' + version : '')).slice(0, 2048) },
      }],
    };
    const resp = await fetch(FEEDBACK_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (resp && resp.ok) return res.status(204).end();
    return res.status(502).json({ error: 'Upstream error.' });
  } catch (e) { return res.status(500).json({ error: 'Server error.' }); }
});

// Serve the game (and its art) statically from this directory.
app.use(express.static(__dirname));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'rift_protocol.html')));

const server = http.createServer(app);
// pingInterval/pingTimeout are generous so a briefly backgrounded (timer-throttled)
// tab isn't dropped mid-match. Detecting a real dead socket a little slower is a
// fine trade for a turn-based game.
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingInterval: 25000,
  pingTimeout: 60000,
});

/* ---- opt-in session logging (client → server → file) ----------------------
   The browser can't write files, so a recording client emits `mp-log` events and
   the server appends them (plus its own lifecycle events) to logs/mp-<code>-<ts>.log
   — one file per room, readable from the GenreFighters/logs folder. */
function logStamp() {
  const d = new Date(), p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
}
function safeJson(x) { try { return JSON.stringify(x); } catch (e) { return '[unserializable]'; } }
function ensureLogFile(room) {
  if (room.logFile) return room.logFile;
  try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch (e) {}
  room.logFile = path.join(LOG_DIR, `mp-${room.code}-${logStamp()}.log`);
  return room.logFile;
}
function roomLog(room, who, line) {
  if (!room || !room.recording) return;
  try { fs.appendFileSync(ensureLogFile(room), `${new Date().toISOString()} [${who}] ${line}\n`); } catch (e) {}
}

/* ---- room registry ------------------------------------------------------- */
// code -> room. See shape in create-room handler.
const rooms = Object.create(null);

const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function makeCode() {
  let code;
  do {
    code = '';
    for (let i = 0; i < 4; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  } while (rooms[code]); // regenerate on collision → codes are unique
  return code;
}

// public view of a room (no raw socket ids leaked beyond what the client needs)
function publicHost(room) {
  if (!room.host) return null;
  return { username: room.host.username, team: room.host.team || null,
           mapKey: room.host.mapKey || null, timer: room.host.timer || null };
}
function publicJoiner(room) {
  if (!room.joiner) return null;
  return { username: room.joiner.username, team: room.joiner.team || null };
}
function lobbyPayload(room) {
  return {
    host: publicHost(room),
    joiner: publicJoiner(room),
    mapKey: room.host ? (room.host.mapKey || null) : null,
    timer: room.host ? (room.host.timer || null) : null,
    hostReady: !!room.hostReady,
    joinerReady: !!room.joinerReady,
    state: room.state,
  };
}

function findRoomBySocket(socketId) {
  for (const code in rooms) {
    const r = rooms[code];
    if ((r.host && r.host.socketId === socketId) || (r.joiner && r.joiner.socketId === socketId)) return r;
  }
  return null;
}
function roleInRoom(room, socketId) {
  if (room.host && room.host.socketId === socketId) return 'host';
  if (room.joiner && room.joiner.socketId === socketId) return 'joiner';
  return null;
}
function otherSocketId(room, socketId) {
  if (!room) return null;
  if (room.host && room.host.socketId === socketId) return room.joiner ? room.joiner.socketId : null;
  if (room.joiner && room.joiner.socketId === socketId) return room.host ? room.host.socketId : null;
  return null;
}
function deleteRoom(room) {
  if (room) { clearRoomTimer(room); if (rooms[room.code]) delete rooms[room.code]; }
}
function clearRoomTimer(room) {
  if (room && room.timerHandle) { clearTimeout(room.timerHandle); room.timerHandle = null; room.deadline = null; }
}

/* ---- socket wiring -------------------------------------------------------- */
io.on('connection', (socket) => {

  socket.on('create-room', (payload) => {
    try {
      const username = sanitizeName(payload && payload.username);
      if (!username) return;
      const code = makeCode();
      rooms[code] = {
        code,
        host: { socketId: socket.id, username, team: null, mapKey: null, timer: null },
        joiner: null,
        hostReady: false,
        joinerReady: false,
        state: 'waiting',
        timerHandle: null, deadline: null,           // server-authoritative turn timer
        recording: !!socket.recording, logFile: null, // opt-in logging
      };
      socket.join(code);
      socket.emit('room-created', { code });
      roomLog(rooms[code], 'server', `room ${code} created by host "${username}"`);
    } catch (e) { /* never crash on a bad message */ }
  });

  socket.on('join-room', (payload) => {
    try {
      const code = String((payload && payload.code) || '').toUpperCase().trim();
      const username = sanitizeName(payload && payload.username);
      if (!username) return;
      const room = rooms[code];
      if (!room) { socket.emit('join-error', { message: 'Room not found.' }); return; }
      if (room.joiner || room.state === 'abandoned') { socket.emit('join-error', { message: 'Room is full.' }); return; }
      room.joiner = { socketId: socket.id, username, team: null };
      room.state = 'lobby';
      if (socket.recording) room.recording = true;
      socket.join(code);
      io.to(room.host.socketId).emit('player-joined', { username });
      io.to(code).emit('lobby-update', lobbyPayload(room));
      roomLog(room, 'server', `joiner "${username}" joined room ${code}`);
    } catch (e) { /* ignore */ }
  });

  socket.on('update-selection', (payload) => {
    try {
      const room = findRoomBySocket(socket.id);
      if (!room || !payload) return;
      const role = roleInRoom(room, socket.id);
      if (role === 'host') {
        if ('team' in payload) room.host.team = payload.team || null;
        if ('mapKey' in payload) room.host.mapKey = payload.mapKey || null;
        if ('timer' in payload) room.host.timer = payload.timer || null;
      } else if (role === 'joiner' && room.joiner) {
        if ('team' in payload) room.joiner.team = payload.team || null;
      }
      io.to(room.code).emit('lobby-update', lobbyPayload(room));
    } catch (e) { /* ignore */ }
  });

  socket.on('player-ready', (payload) => {
    try {
      const room = findRoomBySocket(socket.id);
      if (!room) return;
      const role = roleInRoom(room, socket.id);
      const ready = !!(payload && payload.ready);
      if (role === 'host') room.hostReady = ready;
      else if (role === 'joiner') room.joinerReady = ready;
      io.to(room.code).emit('lobby-update', lobbyPayload(room));
    } catch (e) { /* ignore */ }
  });

  socket.on('start-match', () => {
    try {
      const room = findRoomBySocket(socket.id);
      if (!room) return;
      if (roleInRoom(room, socket.id) !== 'host') return;      // host only
      if (!room.hostReady || !room.joinerReady) return;        // both must be ready
      if (!room.joiner) return;
      room.state = 'match';
      io.to(room.code).emit('match-started', {
        host: publicHost(room),
        joiner: publicJoiner(room),
        mapKey: room.host.mapKey || null,
        timer: room.host.timer || null,
      });
      roomLog(room, 'server', `match started (map ${room.host.mapKey || 'random'}, timer ${room.host.timer || 'none'})`);
    } catch (e) { /* ignore */ }
  });

  socket.on('game-action', (payload) => {
    try {
      const room = findRoomBySocket(socket.id);
      if (!room || !payload) return;
      const target = otherSocketId(room, socket.id);
      if (target) io.to(target).emit('game-action', { action: payload.action });
    } catch (e) { /* ignore */ }
  });

  socket.on('chat-message', (payload) => {
    try {
      const room = findRoomBySocket(socket.id);
      if (!room || !payload) return;
      const role = roleInRoom(room, socket.id);
      const username = role === 'host' ? room.host.username : (room.joiner ? room.joiner.username : 'Operative');
      let message = String(payload.message == null ? '' : payload.message);
      if (!message.trim()) return;
      if (message.length > 200) message = message.slice(0, 200);
      io.to(room.code).emit('chat-message', { username, message, timestamp: Date.now() });
    } catch (e) { /* ignore */ }
  });

  // turn timer — server-authoritative so a throttled host tab can't stall the clock.
  // Host calls turn-begin at the start of each selection round; server broadcasts a
  // deadline and fires turn-timeout itself; turn-resolved cancels it when the round ends.
  socket.on('turn-begin', () => {
    try {
      const room = findRoomBySocket(socket.id);
      if (!room || room.state !== 'match' || roleInRoom(room, socket.id) !== 'host') return;
      clearRoomTimer(room);
      const t = (room.host && typeof room.host.timer === 'number') ? room.host.timer : 0;
      if (t <= 0) return;   // No Limit
      room.deadline = Date.now() + t * 1000;
      io.to(room.code).emit('turn-timer', { deadline: room.deadline, duration: t });
      roomLog(room, 'server', `turn timer started (${t}s)`);
      room.timerHandle = setTimeout(() => {
        try { room.timerHandle = null; room.deadline = null; io.to(room.code).emit('turn-timeout', {}); roomLog(room, 'server', 'turn-timeout fired'); } catch (e) {}
      }, t * 1000);
    } catch (e) {}
  });
  socket.on('turn-resolved', () => {
    try { const room = findRoomBySocket(socket.id); if (room && roleInRoom(room, socket.id) === 'host') clearRoomTimer(room); } catch (e) {}
  });

  // logging: a client toggles recording; mp-log lines are appended to the room file.
  socket.on('log-record', (p) => {
    try {
      socket.recording = !!(p && p.enabled);
      const room = findRoomBySocket(socket.id);
      if (room && socket.recording) { room.recording = true; roomLog(room, 'server', `recording enabled by ${roleInRoom(room, socket.id) || 'socket'}`); }
    } catch (e) {}
  });
  socket.on('mp-log', (p) => {
    try {
      const room = findRoomBySocket(socket.id);
      if (!room || !room.recording || !p) return;
      const who = (p.role || '?') + '/' + (p.name || '?');
      const data = (p.data != null) ? ' ' + safeJson(p.data) : '';
      roomLog(room, who, `${p.tag || ''} ${p.msg || ''}${data}`);
    } catch (e) {}
  });

  socket.on('disconnect', () => {
    try {
      const room = findRoomBySocket(socket.id);
      if (!room) return;
      clearRoomTimer(room);
      roomLog(room, 'server', `${roleInRoom(room, socket.id) || 'socket'} disconnected (state ${room.state})`);
      const remaining = otherSocketId(room, socket.id);
      if (room.state === 'lobby') {
        if (remaining) io.to(remaining).emit('player-disconnected',
          { message: 'Your opponent disconnected. Returning to menu.' });
        deleteRoom(room);
      } else if (room.state === 'match') {
        room.state = 'abandoned';
        if (remaining) io.to(remaining).emit('match-abandoned',
          { message: 'Your opponent has disconnected. Returning to menu.' });
        deleteRoom(room);
      } else { // "waiting" (or anything else) → silent cleanup
        deleteRoom(room);
      }
    } catch (e) { /* ignore */ }
  });
});

function sanitizeName(name) {
  if (name == null) return '';
  let s = String(name).trim();
  if (s.length > 20) s = s.slice(0, 20);
  return s;
}

server.listen(PORT, () => {
  console.log(`RIFT PROTOCOL server listening on :${PORT}`);
});
