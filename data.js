// ─── storage keys ───────────────────────────────────────────
const K = {
  albums:   'aotd_albums',
  settings: 'aotd_settings',
  listened: 'aotd_listened',   // { [albumId]: { rating, review, date } }
};

// ─── defaults ───────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  siteTitle:    'Album of the Day',
  interval:     1,          // days between rotation
  customFields: [],         // [{key, label}]
  allTags:      ['Jazz','Folk','Rock','Indie Rock','Post-Punk','Krautrock',
                 'Slowcore','Art Rock','Prog Rock','Electronic','Lo-Fi',
                 'Punk','Psych','Ambient','Noise','Experimental','Dub',
                 'Glam Rock','Math Rock','Shoegaze','Dream Pop','Avant-Garde',
                 'Bossa Nova','Classical','Alt-Country','Funk','New Wave'],
};

const DEFAULT_ALBUMS = [
  {id:'a1',artist:'Fishmans',title:'Uchu Nippon Setagaya',tags:['Dub','Psych'],note:'I love this album. Uchū Nippon Setagaya (Japanese: 宇宙 日本 世田谷, lit. Space Japan Setagaya) is the seventh and final studio album by Japanese band Fishmans, released on July 24, 1997 on Polydor Records.',fields:{}},
  {id:'a2',artist:'BCNR',title:'Ants From Up There',tags:['Post-Punk','Indie Rock'],note:'I love this album.',fields:{}},
  {id:'a3',artist:'King Crimson',title:'Red',tags:['Prog Rock'],note:'I love this album.',fields:{}},
  {id:'a4',artist:'Miles Davis',title:'In A Silent Way',tags:['Jazz'],note:'I love this album.',fields:{}},
  {id:'a5',artist:'Elliott Smith',title:'XO',tags:['Indie Rock','Lo-Fi'],note:'I love this album.',fields:{}},
  {id:'a6',artist:'Godspeed You! Black Emperor',title:'F#A#∞',tags:['Post-Rock','Experimental'],note:'I love this album.',fields:{}},
  {id:'a7',artist:'Can',title:'Tago Mago',tags:['Krautrock','Experimental'],note:'I love this album.',fields:{}},
  {id:'a8',artist:'Nick Drake',title:'Pink Moon',tags:['Folk'],note:'I love this album.',fields:{}},
];

// ─── helpers ────────────────────────────────────────────────
function load(key, fallback) {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
  catch(e) { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); return true; }
  catch(e) { return false; }
}

function getAlbums()   { return load(K.albums,   DEFAULT_ALBUMS); }
function getSettings() { return load(K.settings, DEFAULT_SETTINGS); }
function getListened() { return load(K.listened, {}); }

function saveAlbums(a)   { save(K.albums,   a); }
function saveSettings(s) { save(K.settings, s); }
function saveListened(l) { save(K.listened, l); }

function mergeSettings(patch) {
  const s = getSettings();
  saveSettings(Object.assign({}, DEFAULT_SETTINGS, s, patch));
}

function uid() { return 'a' + Date.now() + Math.random().toString(36).slice(2,6); }

// ─── daily pick ─────────────────────────────────────────────
function seeded(n) {
  let s = n;
  s = ((s >>> 16) ^ s) * 0x45d9f3b;
  s = ((s >>> 16) ^ s) * 0x45d9f3b;
  return Math.abs((s >>> 16) ^ s);
}

function getDailyAlbum() {
  const settings = getSettings();
  const interval = Math.max(1, parseInt(settings.interval) || 1);
  const pool = getAlbums().filter(a => {
    const listened = getListened();
    return !listened[a.id];          // exclude already-heard
  });
  if (!pool.length) return null;
  const day = Math.floor(Date.now() / (86400000 * interval));
  return pool[seeded(day) % pool.length];
}
