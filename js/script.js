(function () {
'use strict';

;(function () {
  var id = '__critical_app_styles__';
  if (document.getElementById(id)) return;
  function go() {
    var target = document.head || document.body || document.documentElement;
    if (!target) return;
    var s = document.createElement('style');
    s.id = id;
    s.textContent = '/* placeholder — real styles injected here */';
    target.appendChild(s);
  }
  if (document.body || document.head) go();
  else document.addEventListener('DOMContentLoaded', go, { once: true });
})();

var _memoryStore = {};
var _realStore = null;
(function() {
  try {
    var testKey = '__storage_test_' + Date.now();
    localStorage.setItem(testKey, '1');
    var v = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    if (v === '1') { _realStore = localStorage; return; }
  } catch(e) {}
  try {
    var testKey2 = '__storage_test_' + Date.now();
    sessionStorage.setItem(testKey2, '1');
    var v2 = sessionStorage.getItem(testKey2);
    sessionStorage.removeItem(testKey2);
    if (v2 === '1') { _realStore = sessionStorage; return; }
  } catch(e2) {}
  console.warn('[STORAGE] localStorage и sessionStorage недоступны, используется memory store');
  _realStore = null;
})();

function storageGet(key) {
    if (_realStore) {
        try { var v = _realStore.getItem(key); if (v !== null) return v; } catch(e) {}
    }
    return _memoryStore[key] !== undefined ? _memoryStore[key] : null;
}
function storageSet(key, val) {
    if (_realStore) try { _realStore.setItem(key, val); } catch(e) {}
    _memoryStore[key] = val;
}
function storageRemove(key) {
    if (_realStore) try { _realStore.removeItem(key); } catch(e) {}
    delete _memoryStore[key];
}
async function requireAuth() {
    var session = getSession();
    if (!session || !session.token) {
        logout();
        showToast('Требуется авторизация');
        return false;
    }

    var result = await verifySession(session);

    if (!result.ok) {
        if (result.offline) {
            showToast('Сервер недоступен — редактирование запрещено');
        } else {
            clearSession();
            showLoginScreen();
            showToast('Сессия истекла');
        }
        return false;
    }
    var serverData = result.data || {};
    state.canEdit = !!serverData.canEdit;
    document.body.classList.toggle('can-edit', !!serverData.canEdit);

    return true;
}

var API_URL  = 'https://api.glent1754.workers.dev';
var AUTH_URL = 'https://red-brook-b76e.glent1754.workers.dev';
var FALLBACK_AVATAR = 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg';

var CACHE_TTL = { members: 120000, stats: 120000, suspects: 120000, topics: 60000 };

var API_TIMEOUT  = 15000;
var AUTH_TIMEOUT = 15000;
var MAX_RETRIES  = 3;
var RETRY_DELAY  = 2000;

var _ratestamps = [];
var RATE_WINDOW = 10000;
var RATE_MAX    = 60;

function checkRate() {
    var now = Date.now();
    _ratestamps = _ratestamps.filter(function(t) { return now - t < RATE_WINDOW; });
    if (_ratestamps.length >= RATE_MAX) return false;
    _ratestamps.push(now);
    return true;
}

var STORAGE_KEYS = {
    session:    'union_session',
    avatars:    'union_avatars',
    background: 'union_selected_background'
};

var SENIOR_ROLES = ['Старший следящий', 'Зам главы следящих', 'Глава следящих'];
var VALID_RANKS = ['intern', 'moderator', 'operator', 'admin', 'senior_admin', 'assistant', 'sudo_curator', 'curator'];
var VALID_ROLES = ['Следящий', 'Старший следящий', 'Зам главы следящих', 'Глава следящих'];
var VALID_STATUSES = ['watching', 'warned'];
var VALID_GROUPS = ['terms', 'profession_rules', 'admin_rules', 'situations'];
var VALID_DIFFS = ['easy', 'medium', 'hard'];

var RANK_CONFIG = {
    curator: { 
        icon: 'https://i.imgur.com/iBqJyzD.png', 
        label: 'curator', 
        color: 'rgb(111, 82, 112)' 
    },
    sudo_curator: { 
        icon: 'https://i.imgur.com/iBqJyzD.png', 
        label: 'sudo_curator', 
        color: '#a7a7a7' 
    },
    assistant: { 
        icon: 'https://i.imgur.com/k97E04n.png', 
        label: 'assistant', 
        color: '#fffb00' 
    },
    senior_admin: { 
        icon: 'https://i.imgur.com/t8SEUoK.png', 
        label: 'senior_admin', 
        color: '#d400ff' 
    },
    admin: { 
        icon: 'https://i.imgur.com/nUYtbop.png', 
        label: 'admin', 
        color: '#ff0505' 
    },
    operator: { 
        icon: 'https://i.imgur.com/mcjtY12.png', 
        label: 'operator', 
        color: '#35c589' 
    },
    moderator: { 
        icon: 'https://i.imgur.com/g2wPdv0.png', 
        label: 'moderator', 
        color: 'rgb(13, 47, 238)' 
    },
    intern: { 
        icon: 'https://i.imgur.com/ffrvDQp.png', 
        label: 'intern', 
        color: 'rgb(146, 146, 146)' 
    }
};

var ROLE_CONFIG = {
    'Глава следящих':     { icon: 'https://i.imgur.com/2xbBgvG.png', color: 'rgb(255, 0, 34)' },
    'Зам главы следящих': { icon: 'https://i.imgur.com/2shjkvq.png', color: 'rgb(250, 35, 64)' },
    'Старший следящий':   { icon: 'https://i.imgur.com/dOzEK5Q.png', color: 'rgb(252, 56, 82)' },
    'Следящий':           { icon: 'https://i.imgur.com/AvYplrn.png', color: 'rgb(255, 74, 98)' }
};

var BG_OPTIONS = [
    { id: 'bg1',  name: 'Фон 01', url: 'https://i.imgur.com/MpiTIPp.jpeg' },
    { id: 'bg2',  name: 'Фон 02', url: 'https://i.imgur.com/5251qqI.jpeg' },
    { id: 'bg3',  name: 'Фон 03', url: 'https://i.imgur.com/aO0bW5Y.jpeg' },
    { id: 'bg4',  name: 'Фон 04', url: 'https://i.imgur.com/HN4JFFC.png' },
    { id: 'bg5',  name: 'Фон 05', url: 'https://i.imgur.com/xp9Z6zO.jpeg' },
    { id: 'bg6',  name: 'Фон 06', url: 'https://i.imgur.com/5xGFarZ.png' },
    { id: 'bg7',  name: 'Фон 07', url: 'https://i.imgur.com/yQNtpSg.png' },
    { id: 'bg8',  name: 'Фон 08', url: 'https://i.imgur.com/CRxWtSo.png' },
    { id: 'bg9',  name: 'Фон 09', url: 'https://i.imgur.com/zHl4soe.jpeg' },
    { id: 'bg10', name: 'Фон 10', url: 'https://i.imgur.com/dPp05Jv.png' },
    { id: 'bg11', name: 'Фон 11', url: 'https://i.imgur.com/l0g01tN.png' },
    { id: 'bg12', name: 'Фон 12', url: 'https://i.imgur.com/iR8AZ8j.png' }
];

var SUSPECT_LABELS = {
    watching: 'Активно',
    warned:   'не Активно'
};

var QUIZ_GROUPS = {
    terms:            { label: 'Термины',               color: '#4fc3f7' },
    profession_rules: { label: 'Правила профессий',     color: '#81c784' },
    admin_rules:      { label: 'Правила администрации', color: '#ffb74d' },
    situations:       { label: 'Ситуации',              color: '#e57373' }
};

var QUIZ_DIFF = {
    easy:   { label: 'Лёгкая',  color: '#4caf50' },
    medium: { label: 'Средняя', color: '#ff9800' },
    hard:   { label: 'Высокая', color: '#f44336' }
};

var CALL_TYPES = {
    initial:   'Обзвон на досрочное повышение',
    repeated:  'Обзвон по BH',
    promotion: 'Обзвон на переаттестацию',
    check:     'Обзвон на снятие испытательного срока'
};

var QUIZ_ALLOWED_RANKS = ['senior_admin', 'assistant', 'sudo_curator', 'curator'];

var _handlers = {};

function on(evt, fn) {
    if (!_handlers[evt]) _handlers[evt] = [];
    _handlers[evt].push(fn);
    return function() { off(evt, fn); };
}
function off(evt, fn) {
    var list = _handlers[evt];
    if (!list) return;
    var idx = list.indexOf(fn);
    if (idx > -1) list.splice(idx, 1);
}
function emit(evt, data) {
    var list = _handlers[evt];
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
        try { list[i](data); } catch(e) { console.error('event handler error [' + evt + ']:', e); }
    }
}
function sanitizeStr(val, maxLen) {
    if (val == null) return '';
    return String(val).trim().slice(0, maxLen || 500);
}
function inList(val, list) {
    return list.indexOf(val) > -1;
}
var STEAM_RE = /^STEAM_[01]:[01]:\d{1,15}$/;
function isValidSteam(s) {
    return STEAM_RE.test(s);
}

function safeInt(val, min, max) {
    var n = parseInt(val, 10);
    if (isNaN(n)) return min;
    return Math.max(min, Math.min(max, n));
}

var _escDiv = document.createElement('div');
function esc(s) {
    if (s == null) return '';
    _escDiv.textContent = String(s);
    return _escDiv.innerHTML;
}

function html(strings) {
    var result = strings[0];
    for (var i = 1; i < arguments.length; i++) {
        var val = arguments[i];
        if (val && val.__safe) result += val.v;
        else result += esc(val);
        result += strings[i];
    }
    return result;
}
function safe(s) { return { __safe: true, v: s }; }

function formatDate(d) {
    try {
        var dt = new Date(d);
        if (isNaN(dt.getTime())) return '';
        function p(n) { return n < 10 ? '0' + n : '' + n; }
        return p(dt.getDate()) + '.' + p(dt.getMonth()+1) + '.' + dt.getFullYear() + ' ' + p(dt.getHours()) + ':' + p(dt.getMinutes());
    } catch(e) { return ''; }
}

function genId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try { return crypto.randomUUID(); } catch(e) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
function legacy_steam_fix(id) {
    return id.replace('STEAM_1', 'STEAM_0');
}

function steamTo64(steam32) {
  try {
    var clean = steam32.trim().replace(/\s+/g, '').replace('STEAM_', '');
    var parts = clean.split(':');
    if (parts.length !== 3) return null;
    var y = parseInt(parts[1]);
    var z = parseInt(parts[2]);
    if (isNaN(y) || isNaN(z)) return null;

    if (typeof BigInt === 'function') {
      return String(BigInt('76561197960265728') + BigInt(z) * BigInt(2) + BigInt(y));
    }

    var base = 76561197960265728;
    return String(base + z * 2 + y);
  } catch(e) { return null; }
}
function calcSalary(h, r, t) {
    var base = Math.min(h * 12 + r * 5, 500);
    return base + Math.min(t, 700 - base);
}

function clamp(val, min, max) {
    min = min || 0;
    max = max || Infinity;
    return Math.max(min, Math.min(max, parseInt(val) || 0));
}

var _debounceTimers = {};
function debounce(key, fn, delay) {
    return function() {
        var args = arguments, self = this;
        clearTimeout(_debounceTimers[key]);
        _debounceTimers[key] = setTimeout(function() { fn.apply(self, args); }, delay);
    };
}

function _timeAgo(ts) {
    var diff = Date.now() - ts;
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' мин. назад';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' ч. назад';
    return Math.floor(diff / 86400000) + ' д. назад';
}

function $(sel) {
    return document.querySelector(sel);
}
function $$(sel) {
    return document.querySelectorAll(sel);
}
function clearEl(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
}

function delegateClick(parent, childSel, handler) {
    if (!parent) return function(){};
    function listener(e) {
        var t = e.target.closest(childSel);
        if (t && parent.contains(t)) handler(e, t);
    }
    parent.addEventListener('click', listener);
    return function() { parent.removeEventListener('click', listener); };
}

function getJSON(key) {
    try { var v = storageGet(key); return v ? JSON.parse(v) : null; }
    catch(e) { return null; }
}
function setJSON(key, val) {
    try { storageSet(key, JSON.stringify(val)); return true; }
    catch(e) { return false; }
}

function getSession() { return getJSON(STORAGE_KEYS.session); }
function clearSession() { storageRemove(STORAGE_KEYS.session); }
function saveSession(token, login, steam, rank, canEdit) {
    setJSON(STORAGE_KEYS.session, {
        token:   token,
        login:   login,
        steam:   steam   || null,
        rank:    rank    || null,
        canEdit: !!canEdit
    });
}
function getAvatarCache() { return getJSON(STORAGE_KEYS.avatars) || {}; }
var saveAvatarCache = debounce('avatars', function(data) {
    setJSON(STORAGE_KEYS.avatars, data);
}, 500);

function getSavedBg() {
    var id = storageGet(STORAGE_KEYS.background);
    for (var i = 0; i < BG_OPTIONS.length; i++) {
        if (BG_OPTIONS[i].id === id) return id;
    }
    return BG_OPTIONS[0].id;
}
function saveBg(id) { storageSet(STORAGE_KEYS.background, id); }

var state = {
    canEdit: false,
    editingId: null,
    editingSuspectId: null,
    editingTopicId: null,
    editingQuestionId: null,
    currentTopicId: null
};

function setState(key, val) {
    var old = state[key];
    state[key] = val;
    if (old !== val) emit('state:' + key, { old: old, value: val });
}

var _cache = {};

function cacheGet(key) {
    var e = _cache[key];
    if (!e) return null;
    if (Date.now() - e.t > e.ttl) return null;
    return e.data;
}
function cacheFallback(key) {
    var e = _cache[key];
    return e ? e.data : null;
}
function cacheSet(key, data, ttl) {
    _cache[key] = { data: data, t: Date.now(), ttl: ttl };
}
function cacheClear(key) {
    if (key) delete _cache[key];
    else _cache = {};
}

async function _fetch(path, opts, timeout) {
    // 1. Rate limit check
    if (!checkRate()) throw new Error('Rate limit exceeded');
    
    timeout = timeout || API_TIMEOUT;
    var ctrl = new AbortController();
    var timer = setTimeout(function() { ctrl.abort(); }, timeout);

    try {
        var session = getSession();
        var method = opts.method || 'GET';
        var hdrs = {};

        if (method !== 'GET' && method !== 'HEAD') {
            hdrs['Content-Type'] = 'application/json';
        }

        if (session && session.token) {
            // Убеждаемся, что токен — это строка, чтобы не вставить [object Object]
            hdrs['Authorization'] = 'Bearer ' + String(session.token);
        }

            var res = await fetch(API_URL + path, Object.assign({}, opts, {
            headers: hdrs,
            signal: ctrl.signal,
            mode: 'cors',
            credentials: 'omit'  
            }));

        if (res.status === 401) {
            _handleExpired();
            throw new Error('Unauthorized');
        }

        if (res.status === 204) return { success: true };

        var text = await res.text();
        try {
            return text ? JSON.parse(text) : null;
        } catch(e) {
            return null;
        }
    } catch(err) {
        if (err.name === 'AbortError') throw new Error('Request timeout');
        throw err;
    } finally {
        clearTimeout(timer);
    }
}

async function fetchRetry(path, opts, timeout) {
    var lastErr;
    for (var i = 0; i < MAX_RETRIES; i++) {
        try {
            if (i > 0) console.warn('[RETRY]', path, 'attempt', i + 1);
            return await _fetch(path, opts || {}, timeout);
        } catch(err) {
            lastErr = err;
            if (err.message === 'Unauthorized' || err.message === 'Rate limit exceeded') throw err;
            if (i < MAX_RETRIES - 1) {
                var delay = RETRY_DELAY * Math.pow(2, i);
                await new Promise(function(r) { setTimeout(r, delay); });
            }
        }
    }
    throw lastErr;
}

var http = {
    get:    function(p) { return fetchRetry(p, { method: 'GET' }); },
    post:   function(p, body) { return fetchRetry(p, { method: 'POST', body: JSON.stringify(body) }); },
    put:    function(p, body) { return fetchRetry(p, { method: 'PUT', body: JSON.stringify(body) }); },
    del:    function(p) { return fetchRetry(p, { method: 'DELETE' }); }
};

function _handleExpired() {
    showToast('Сессия истекла');
    emit('auth:expired');
}

var _toastTimer;
function showToast(msg, dur) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function() { el.classList.add('hidden'); }, dur || 2500);
}

function showLoading(status) {
    var s = $('#loadingScreen');
    if (!s) return;
    s.classList.remove('hidden', 'fade-out');
    setLoadingStatus(status || 'Подключение к серверу');
    setLoadingProgress(0);
}
function hideLoading() {
    var s = $('#loadingScreen');
    if (!s) return;
    setLoadingProgress(100);
    setTimeout(function() {
        s.classList.add('fade-out');
        setTimeout(function() { s.classList.add('hidden'); }, 500);
    }, 300);
}
function setLoadingStatus(txt) {
    var el = $('#loadingStatus');
    if (el) el.textContent = txt;
}
function setLoadingProgress(pct) {
    var bar = $('#loadingBarFill');
    if (bar) bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
}

function makeCrud(path, cacheKey, ttl, backupKey) {
    return {
        getAll: async function(force) {
            if (!force) {
                var cached = cacheGet(cacheKey);
                if (cached) return cached;
            }
            try {
                var data = await http.get(path);
                var items = Array.isArray(data) ? data : [];
                cacheSet(cacheKey, items, ttl);
                if (backupKey) setTimeout(function() { setJSON(backupKey, items); }, 0);
                return items;
            } catch(err) {
                console.error('load ' + cacheKey + ' failed:', err);
                var fb = cacheFallback(cacheKey);
                if (fb) return fb;
            if (backupKey) {
                var backup = getJSON(backupKey);
                if (Array.isArray(backup)) {
                    // Помечаем данные как offline-backup
                    backup._isOfflineBackup = true;
                    cacheSet(cacheKey, backup, ttl);
                    return backup;
                }
            }
            return [];
            }
        },
        create: async function(item) {
            var r = await http.post(path, item);
            cacheClear(cacheKey);
            return r;
        },
        update: async function(id, item) {
            var r = await http.put(path + '/' + encodeURIComponent(id), item);
            cacheClear(cacheKey);
            return r;
        },
        remove: async function(id) {
            var r = await http.del(path + '/' + encodeURIComponent(id));
            cacheClear(cacheKey);
            return r;
        }
    };
}

var membersApi   = makeCrud('/api/members',   'members',   CACHE_TTL.members,  'union_members_backup');
var suspectsApi  = makeCrud('/api/suspects',   'suspects',  CACHE_TTL.suspects, 'union_suspects_backup');
var questionsApi = makeCrud('/api/questions',  'questions', 60000,              'union_questions_backup');

var _topicsBase = makeCrud('/api/topics', 'topics', CACHE_TTL.topics, 'union_topics_backup');

var topicsApi = {
    getAll: async function(force) {
        var topics = await _topicsBase.getAll(force);
        return topics.map(function(t) {
            if (!t.author_steam) t.author_steam = null;
            return t;
        });
    },
    create: async function(topic) {
        var payload = {
            id: topic.id,
            title: topic.title,
            description: topic.description || '',
            pinned: topic.pinned ? 1 : 0,
            locked: topic.locked ? 1 : 0,
            author: topic.author || 'Аноним',
            replies_count: 0
        };
        var r = await _topicsBase.create(payload);
        cacheClear('topics');
        storageRemove('union_topics_backup');
        return r;
    },
    update: async function(id, data) {
        var payload = {};
        if ('title'       in data) payload.title       = data.title;
        if ('description' in data) payload.description = data.description;
        if ('pinned'      in data) payload.pinned      = data.pinned ? 1 : 0;
        if ('locked'      in data) payload.locked      = data.locked ? 1 : 0;
        var r = await _topicsBase.update(id, payload);
        cacheClear('topics');
        return r;
    },
    remove: async function(id) {
        var r = await _topicsBase.remove(id);
        cacheClear('topics');
        storageRemove('union_topics_backup');
        return r;
    }
};

var statsApi = {
    getAll: async function(force) {
        if (!force) {
            var c = cacheGet('stats');
            if (c) return c;
        }
        try {
            var raw = await http.get('/api/stats');
            var stats = {};
            (Array.isArray(raw) ? raw : []).forEach(function(item) {
                stats[item.member_id] = {
                    hours:   Number(item.hours) || 0,
                    reports: Number(item.reports) || 0,
                    tickets: Number(item.tickets) || 0
                };
            });
            cacheSet('stats', stats, CACHE_TTL.stats);
            setTimeout(function() { setJSON('union_stats_backup', stats); }, 0);
            return stats;
        } catch(err) {
            console.error('stats load err:', err);
            var fb = cacheFallback('stats');
            if (fb) return fb;
            var bk = getJSON('union_stats_backup');
            if (bk && typeof bk === 'object') { cacheSet('stats', bk, CACHE_TTL.stats); return bk; }
            return {};
        }
    },
    save: async function(memberId, hours, reports, tickets) {
        var r = await http.put('/api/stats/' + encodeURIComponent(memberId), {
            member_id: memberId,
            hours: Number(hours), reports: Number(reports), tickets: Number(tickets)
        });
        cacheClear('stats');
        return r;
    }
};

var quizSessionsApi = {
    getAll: async function() {
        try { var d = await http.get('/api/quiz-sessions'); return Array.isArray(d) ? d : []; }
        catch(e) { console.error('quiz sessions err:', e); return []; }
    },
    getOne: async function(id) {
        try { return await http.get('/api/quiz-sessions/' + encodeURIComponent(id)); }
        catch(e) { console.error('quiz session load err:', e); return null; }
    },
    create:  function(s) { return http.post('/api/quiz-sessions', s); },
    answer:  function(sid, aid, given, correct) {
        return http.put('/api/quiz-sessions/' + encodeURIComponent(sid) + '/answer', {
            answer_id: aid, given_answer: given, is_correct: correct
        });
    },
    finish:  function(sid) { return http.put('/api/quiz-sessions/' + encodeURIComponent(sid) + '/finish', {}); },
    remove:  function(sid) { return http.del('/api/quiz-sessions/' + encodeURIComponent(sid)); }
};

var repliesApi = {
    getAll: async function(topicId) {
        try {
            var d = await http.get('/api/topics/' + encodeURIComponent(topicId) + '/replies');
            return Array.isArray(d) ? d : [];
        } catch(e) { console.error('replies err:', e); return []; }
    },
    create: function(tid, reply) {
        return http.post('/api/topics/' + encodeURIComponent(tid) + '/replies', reply);
    },
    setStatus: function(tid, rid, status) {
        return http.put('/api/topics/' + encodeURIComponent(tid) + '/replies/' + encodeURIComponent(rid) + '/status', { status: status });
    },
    remove: function(tid, rid) {
        return http.del('/api/topics/' + encodeURIComponent(tid) + '/replies/' + encodeURIComponent(rid));
    }
};

var _avatars = getAvatarCache();
var _avatarQueue = [];
var _avatarLoading = 0;
var _avatarPending = {}; 

function preloadIcons() {
    var icons = [];
    for (var r in RANK_CONFIG) if (RANK_CONFIG[r].icon) icons.push(RANK_CONFIG[r].icon);
    for (var ro in ROLE_CONFIG) if (ROLE_CONFIG[ro].icon) icons.push(ROLE_CONFIG[ro].icon);
    icons.filter((v, i, a) => a.indexOf(v) === i).forEach(url => {
        var img = new Image();
        img.src = url;
    });
}

function loadAvatar(steam32, imgEl) {
    var sid = steamTo64(steam32);
    if (!sid) {
        imgEl.src = FALLBACK_AVATAR;
        return;
    }
    var safeSid = String(sid).replace(/[^\d]/g, '');
    if (_avatars[safeSid]) {
        if (imgEl.src !== _avatars[safeSid]) imgEl.src = _avatars[safeSid];
        return;
    }
    imgEl.src = FALLBACK_AVATAR;
    if (!_avatarPending[safeSid]) {
        _avatarQueue.push({ sid: safeSid, steam32: steam32 });
        _processAvatarQueue();
    }
}

function _processAvatarQueue() {
    while (_avatarLoading < 6 && _avatarQueue.length) {
        var job = _avatarQueue.shift();
        if (_avatarPending[job.sid]) continue;
        _avatarPending[job.sid] = true;
        _avatarLoading++;
        _fetchAvatar(job).finally(() => {
            _avatarLoading--;
            _processAvatarQueue();
        });
    }
}

async function _fetchAvatar(job) {
    try {
        // Убрали ?t=..., чтобы Cloudflare и браузер могли кешировать файл
        var res = await fetch(API_URL + '/api/steam-avatar/' + job.sid, {
        cache: 'default',
        mode: 'cors',
        credentials: 'omit'
        });
        if (!res.ok) throw new Error();
        var data = await res.json();
        if (data.avatar) {
            _avatars[job.sid] = data.avatar;
            saveAvatarCache(_avatars);
            // Обновляем все картинки с этим ID на текущей странице
            document.querySelectorAll('[data-sid64="' + job.sid + '"]').forEach(img => {
                img.src = data.avatar;
            });
        }
    } catch(e) {
        console.warn('Avatar fail:', job.sid);
    } finally {
        delete _avatarPending[job.sid];
    }
}

function getCachedAvatar(sid64) {
    if (!sid64) return FALLBACK_AVATAR;
    var clean = String(sid64).replace(/[^\d]/g, '');
    return _avatars[clean] || FALLBACK_AVATAR;
}

function loadAvatarsIn(container) {
    if (!container) return;
    container.querySelectorAll('[data-steam][data-sid64]').forEach(img => {
        var sid = img.dataset.sid64;
        if (_avatars[sid]) {
            img.src = _avatars[sid];
        } else {
            loadAvatar(img.dataset.steam, img);
        }
    });
}

function rankBadge(rank) {
    var cfg = RANK_CONFIG[rank];
    if (!cfg) return html`<span class="member-rank-badge">${rank}</span>`;
    return _makeBadge(cfg.label, cfg.icon, cfg.color);
}
function roleBadge(role) {
    var cfg = ROLE_CONFIG[role];
    if (!cfg) return html`<span class="member-rank-badge">${role}</span>`;
    return _makeBadge(role, cfg.icon, cfg.color);
}
function _safeColor(c) {
    if (!c || typeof c !== 'string') return '#999';
    var hex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    var rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
    var rgba = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([\d.]+)\s*\)$/;
    
    var clean = c.trim();
    if (hex.test(clean) || rgb.test(clean) || rgba.test(clean)) return clean;
    return '#999';
}
function _safeIconUrl(u) {
    if (!u) return '';
    if (/^https:\/\/i\.imgur\.com\/[a-zA-Z0-9]{5,10}\.(png|jpg|jpeg|gif|webp)$/.test(u)) return u;
    return '';
}

var IC_EDIT   = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
var IC_DEL    = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
var IC_CHECK  = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
var IC_CLOSE  = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
var IC_CHAT   = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>';
var IC_DRAG   = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>';

var PATH_LOCK_CLOSED = 'M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z';
var PATH_LOCK_OPEN = 'M18 8h-1V6c0-2.8-2.2-5-5-5S7 3.2 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.7 1.4-3.1 3.1-3.1s3.1 1.4 3.1 3.1v2z';
var PATH_PIN = 'M14 4v5c0 1.12.37 2.16 1 3H9c.65-.86 1-1.9 1-3V4h4m3-2H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3V4h1c.55 0 1-.45 1-1s-.45-1-1-1z';

var _notifications = [];
var _notifMaxAge = 86400000;

function addNotification(text, type) {
    type = type || 'info';
    var notif = {
        id: genId(),
        text: text,
        type: type,
        time: Date.now(),
        read: false
    };
    _notifications.unshift(notif);
    if (_notifications.length > 50) _notifications.pop();
    setJSON('union_notifications', _notifications);
    renderNotifications();
    updateNotifBadge();
}

function renderNotifications() {
    var list = $('#notifList');
    if (!list) return;
    var now = Date.now();
    _notifications = _notifications.filter(function(n) { 
        return n && (now - n.time < _notifMaxAge); 
    });

    if (!_notifications.length) {
        list.innerHTML = '<div class="notif-empty">Нет уведомлений</div>';
        return;
    }

    list.innerHTML = _notifications.map(function(n) {
        var typeToIcon = {
            'member': 'ic-user',
            'suspect': 'ic-shield',
            'topic': 'ic-msg',
            'quiz': 'ic-help',
            'info': 'ic-msg'
        };
        var iconClass = typeToIcon[n.type] || 'ic-msg';

        var ago = _timeAgo(n.time);
        
        // Всегда используем esc() для текста и проверяем id
        var safeId = String(n.id).replace(/[^a-zA-Z0-9-]/g, '');
        
        return '<div class="notif-item' + (n.read ? '' : ' unread') + '" data-notif-id="' + safeId + '">' +
               '<div class="notif-icon"><i class="ic ' + iconClass + '"></i></div>' +
               '<div class="notif-body"><div class="notif-text">' + esc(n.text) + '</div>' +
               '<div class="notif-time">' + ago + '</div></div></div>';
    }).join('');
}

function updateNotifBadge() {
    var badge = $('#notifBadge');
    if (!badge) return;
    var unread = _notifications.filter(function(n) { return !n.read; }).length;
    badge.textContent = unread;
    badge.classList.toggle('hidden', unread === 0);
}

var _memberSearchTerm = '';
var _memberFilterRole = '';
var _suspectSearchTerm = '';
var _suspectFilterStatus = '';

function filterMembers(members) {
    var term = _memberSearchTerm.toLowerCase();
    var role = _memberFilterRole;
    return members.filter(function(m) {
        if (role && m.role !== role) return false;
        if (!term) return true;
        return (m.nick && m.nick.toLowerCase().indexOf(term) > -1) ||
               (m.steam && m.steam.toLowerCase().indexOf(term) > -1);
    });
}

function filterSuspects(suspects) {
    var term = _suspectSearchTerm.toLowerCase();
    var status = _suspectFilterStatus;
    return suspects.filter(function(s) {
        if (status && s.status !== status) return false;
        if (!term) return true;
        return (s.nick && s.nick.toLowerCase().indexOf(term) > -1) ||
               (s.steam && s.steam.toLowerCase().indexOf(term) > -1) ||
               (s.reason && s.reason.toLowerCase().indexOf(term) > -1);
    });
}

function memberCardHtml(m) {
    var sid = steamTo64(m.steam) || '';
    var safeSid = String(sid).replace(/[^\d]/g, '');
    var av = getCachedAvatar(safeSid);
    var safeAv = _isSafeImageUrl(av) ? av : FALLBACK_AVATAR;
    return '<div class="member-card" data-id="' + esc(m.id) + '">' +
        '<img class="member-avatar" data-steam="' + esc(m.steam) + '" data-sid64="' + safeSid + '" src="' + esc(safeAv) + '" alt="">' +
        '<div class="member-info">' +
            '<div class="member-nick">' + esc(m.nick) + '</div>' +
            '<div class="member-meta">' + esc(m.steam) + '</div>' +
            '<div class="member-badges">' + roleBadge(m.role) + rankBadge(m.rank) + '</div>' +
        '</div>' +
        '<div class="member-actions">' +
            '<button class="act-edit" title="Редактировать">' + IC_EDIT + '</button>' +
            '<button class="act-del" title="Удалить">' + IC_DEL + '</button>' +
        '</div></div>';
}

function suspectRowHtml(s) {
    var sid = steamTo64(s.steam) || '';
    var safeSid = String(sid).replace(/[^\d]/g, '');
    var av = getCachedAvatar(safeSid);
    var safeAv = _isSafeImageUrl(av) ? av : FALLBACK_AVATAR;
    var statusLabel = SUSPECT_LABELS[s.status] || esc(s.status);
    var violations = Number(s.violations) || 0;
    var reports = Number(s.reports) || 0;
    return '<td><div class="suspect-member"><img data-steam="' + esc(s.steam) + '" data-sid64="' + safeSid + '" src="' + esc(safeAv) + '" alt=""><span>' + esc(s.nick) + '</span></div></td>' +
        '<td><span class="suspect-steam">' + esc(s.steam) + '</span></td>' +
        '<td><span class="suspect-reason" title="' + esc(s.reason || '') + '">' + esc(s.reason || '—') + '</span></td>' +
        '<td><span class="suspect-violations" data-count="' + violations + '">' + violations + '</span></td>' +
        '<td><span class="suspect-reports">' + reports + '</span></td>' +
        '<td><span class="suspect-status" data-status="' + esc(s.status) + '">' + esc(statusLabel) + '</span></td>' +
        '<td class="editor-only"><div class="suspect-actions">' +
        '<button class="suspect-edit" title="Ред.">' + IC_EDIT + '</button>' +
        '<button class="suspect-del" title="Удалить">' + IC_DEL + '</button>' +
        '</div></td>';
}

function topicCardHtml(t) {
    var pinned = Number(t.pinned) === 1;
    var locked = Number(t.locked) === 1;
    var replies = Number(t.replies_count) || 0;
    var cls = 'topic-card';
    if (pinned) cls += ' pinned';
    if (locked) cls += ' locked';
    var draggable = state.canEdit ? ' draggable="true"' : '';

    return '<div class="' + cls + '"' + draggable + ' data-topic-id="' + esc(t.id) + '">' +
        (state.canEdit ? '<span class="drag-handle">' + IC_DRAG + '</span>' : '') +
        '<div class="topic-info"><div class="topic-title-row"><span class="topic-title">' + esc(t.title) + '</span>' +
        (pinned ? '<span class="topic-badge topic-badge-pinned">Закреплено</span>' : '') +
        (locked ? '<span class="topic-badge topic-badge-locked">Закрыта</span>' : '') +
        '</div><div class="topic-meta">' + esc(t.author) + ' • ' + formatDate(t.created_at) + '</div></div>' +
        '<div class="topic-replies-count"><span class="topic-replies-num">' + replies + '</span></div></div>';
}

function replyCardHtml(r) {
    var date = r.created_at ? formatDate(r.created_at) : '';
    var VALID_STATUSES = { approved: ' reply-approved', rejected: ' reply-rejected' };
    var cls = 'reply-card' + (VALID_STATUSES[r.status] || '');

    var badge;
    if (r.status === 'approved')      badge = '<span class="reply-status-badge reply-status-approved">✓ Принят</span>';
    else if (r.status === 'rejected') badge = '<span class="reply-status-badge reply-status-rejected">✗ Отклонён</span>';
    else                              badge = '<span class="reply-status-badge reply-status-pending">В рассмотрении</span>';

    var steam = r.author_steam || '';
    var sid = steam ? (steamTo64(steam) || '') : '';
    var safeSid = String(sid).replace(/[^\d]/g, '');
    var av = getCachedAvatar(safeSid);
    var safeAv = _isSafeImageUrl(av) ? av : FALLBACK_AVATAR;
    var sess = getSession();
    var isOwner = sess && r.author && sess.login === r.author;
    var isEditor = state.canEdit;
    var canDelete = isOwner || isEditor;

    return '<div class="' + cls + '" data-reply-id="' + esc(r.id) + '" data-reply-author="' + esc(r.author || '') + '">'
        + '<div class="reply-avatar"><img class="reply-author-avatar" data-steam="' + esc(steam) + '" data-sid64="' + safeSid + '" src="' + esc(safeAv) + '" alt=""></div>'
        + '<div class="reply-content">'
        + '<div class="reply-header">'
        + '<span class="reply-author">' + esc(r.author || 'Аноним') + '</span>'
        + '<span class="reply-date">' + date + '</span>'
        + (canDelete
            ? '<button class="reply-del-btn" title="Удалить ответ">'
              + IC_DEL
              + '</button>'
            : '')
        + '</div>'
        + '<div class="reply-text">' + esc(r.text || '') + '</div>'
        + badge
        + '<div class="reply-mod-actions editor-panel" style="margin:0">'
        + '<button class="reply-mod-btn reply-mod-btn-approve" data-action="approved">' + IC_CHECK + ' Принять</button>'
        + '<button class="reply-mod-btn reply-mod-btn-reject" data-action="rejected">' + IC_CLOSE + ' Отклонить</button>'
        + '</div>'
        + '</div></div>';
}

function Modal(overlaySel, formSel, titleSel, closeSels, onReset) {
    this.overlaySel = overlaySel;
    this.formSel = formSel;
    this.titleSel = titleSel;
    this.closeSels = closeSels || [];
    this.onReset = onReset;
    this._cleanups = [];
}

Modal.prototype.init = function() {
    var self = this;
    var overlay = $(this.overlaySel);
    if (!overlay) return;

    this.closeSels.forEach(function(sel) {
        var el = $(sel);
        if (el) {
            var h = function() { self.close(); };
            el.addEventListener('click', h);
            self._cleanups.push(function() { el.removeEventListener('click', h); });
        }
    });

    var bgHandler = function(e) { if (e.target === overlay) self.close(); };
    overlay.addEventListener('click', bgHandler);
    this._cleanups.push(function() { overlay.removeEventListener('click', bgHandler); });
};

Modal.prototype.open = function(title) {
    var overlay = $(this.overlaySel);
    var titleEl = $(this.titleSel);
    if (overlay) overlay.classList.remove('hidden');
    if (titleEl && title) titleEl.textContent = title;
};

Modal.prototype.close = function() {
    var overlay = $(this.overlaySel);
    var form = $(this.formSel);
    if (overlay) overlay.classList.add('hidden');
    if (form) form.reset();
    if (this.onReset) this.onReset();
};

Modal.prototype.onSubmit = function(handler) {
    var form = $(this.formSel);
    if (!form) return;
    var h = async function(e) { e.preventDefault(); await handler(e); };
    form.addEventListener('submit', h);
    this._cleanups.push(function() { form.removeEventListener('submit', h); });
};


function applyBg(id, doSave) {
    var bg = BG_OPTIONS.find(b => b.id === id) || BG_OPTIONS[0];
    if (doSave) saveBg(bg.id);
    var currentBg = document.documentElement.style.getPropertyValue('--app-bg-image');
    if (currentBg === 'url("' + bg.url + '")') return;
    var img = new Image();
    img.onload = function() {
                        try {
                            document.documentElement.style.setProperty('--app-bg-image', 'url("' + bg.url + '")');
                            } catch(e) {
                            try { document.body.style.setProperty('--app-bg-image', 'url("' + bg.url + '")'); } catch(e2) {}
                            }
    };
    img.src = bg.url;
}

function renderBgSelector() {
    var grid = $('#backgroundGrid');
    if (!grid) return;

    var selected = getSavedBg();
    grid.innerHTML = BG_OPTIONS.map(function(bg) {
        var active = bg.id === selected;
        return '<button type="button" class="background-card' + (active ? ' active' : '') + '" data-bg-id="' + bg.id + '">' +
            '<span class="background-check">' + IC_CHECK + '</span>' +
            '<span class="background-thumb" style="background-image:url(\'' + bg.url + '\')"></span>' +
            '<span class="background-meta"><span class="background-name">' + esc(bg.name) + '</span>' +
            '<span class="background-state">' + (active ? 'Выбран' : 'Выбрать') + '</span></span></button>';
    }).join('');

    delegateClick(grid, '.background-card', function(e, card) {
        applyBg(card.dataset.bgId, true);
        renderBgSelector();
        showToast('Фон обновлён');
    });
}

function updateProfile(login, rank, steam) {
    var nameEl = $('#currentUser');
    if (nameEl) nameEl.textContent = login || '';
    var rankEl = $('#currentUserRank');
    if (rankEl) rankEl.textContent = rank || 'Пользователь';

    if (steam) {
        var ha = $('#headerAvatar');
        var ra = $('#replyAvatar');
        if (ha) loadAvatar(steam, ha);
        if (ra) loadAvatar(steam, ra);
    }
}

function bindMemberGrid(container) {
    if (container._cleanup) container._cleanup();
    var c1 = delegateClick(container, '.act-edit', function(e, btn) {
        var card = btn.closest('.member-card');
        if (card) {
            var safeId = String(card.dataset.id || '').replace(/[^a-zA-Z0-9\-]/g, '');
            emit('member:edit', { id: safeId });
        }
    });
    var c2 = delegateClick(container, '.act-del', async function(e, btn) {
        var card = btn.closest('.member-card');
        if (!card || btn.disabled) return;
        if (!await requireAuth()) return;
        var safeId = String(card.dataset.id || '').replace(/[^a-zA-Z0-9\-]/g, '');
        btn.disabled = true;
        try {
            await membersApi.remove(safeId);
            addNotification('Участник удалён', 'member');
            showToast('Участник удалён');
            await renderMembers(true);
        } catch(err) {
            showToast('Ошибка удаления');
            btn.disabled = false;
        }
    });
    container._cleanup = function() { c1(); c2(); };
}

function renderMemberGrid(sel, list) {
    var el = $(sel);
    if (!el) return;
    if (!list.length) {
        el.innerHTML = '<div class="empty-msg">Нет участников</div>';
        return;
    }
    el.innerHTML = list.map(memberCardHtml).join('');
    loadAvatarsIn(el);
    bindMemberGrid(el);
}

async function renderMembers(force) {
    try {
        var members = await membersApi.getAll(force);
        if (members._isOfflineBackup) {
            showToast('Данные могут быть устаревшими (оффлайн)');
        }
        if (!members || !members.length) {
            ['#gridSenior', '#gridJunior'].forEach(function(s) {
                var el = $(s);
                if (el) el.innerHTML = '<div class="empty-msg">Нет участников</div>';
            });
            return;
        }
        var filtered = filterMembers(members);
        renderMemberGrid('#gridSenior', filtered.filter(function(m) { return SENIOR_ROLES.indexOf(m.role) > -1; }));
        renderMemberGrid('#gridJunior', filtered.filter(function(m) { return SENIOR_ROLES.indexOf(m.role) === -1; }));
    } catch(err) {
        console.error('members render fail:', err);
    }
}

var _statsCleanup = null;
function statRowHtml(member, stat) {
    var sid = steamTo64(member.steam) || '';
    var safeSid = String(sid).replace(/[^\d]/g, '');
    var av = getCachedAvatar(safeSid);
    var safeAv = _isSafeImageUrl(av) ? av : FALLBACK_AVATAR;
    var salary = calcSalary(stat.hours, stat.reports, stat.tickets);
    return '<td><div class="stat-member"><img data-steam="' + esc(member.steam) + '" data-sid64="' + safeSid + '" src="' + esc(safeAv) + '" alt=""> ' + esc(member.nick) + '</div></td>' +
        '<td>' + roleBadge(member.role) + '</td>' +
        '<td><span class="stat-val-ro">' + stat.hours + '</span><input class="stat-input" type="number" min="0" value="' + stat.hours + '" data-field="hours"></td>' +
        '<td><span class="stat-val-ro">' + stat.reports + '</span><input class="stat-input" type="number" min="0" value="' + stat.reports + '" data-field="reports"></td>' +
        '<td><span class="stat-val-ro">' + stat.tickets + '</span><input class="stat-input" type="number" min="0" value="' + stat.tickets + '" data-field="tickets"></td>' +
        '<td><span class="salary-badge">' + salary + '</span></td>' +
        '<td><button class="stat-save-btn editor-only-btn" title="Сохранить">' + IC_CHECK + '<span>Сохранить</span></button></td>';
}
async function renderStats(force) {
    var tbody = $('#statsBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px">Загрузка...</td></tr>';
    if (_statsCleanup) { _statsCleanup(); _statsCleanup = null; }

    try {
        var members = await membersApi.getAll();
        var stats = await statsApi.getAll();

        var SENIOR_RANKS = ['senior_admin', 'assistant', 'sudo_curator', 'curator'];

        var filtered = members.filter(function(m) {
            var role = String(m.role || '')
                .replace(/\u00A0/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            var rank = String(m.rank || '')
                .replace(/\u00A0/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .toLowerCase();

            return SENIOR_ROLES.indexOf(role) === -1 && SENIOR_RANKS.indexOf(rank) === -1;
        });

        if (!filtered.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px">Нет участников</td></tr>';
            return;
        }

        var frag = document.createDocumentFragment();
        filtered.forEach(function(m) {
            var s = stats[m.id] || { hours: 0, reports: 0, tickets: 0 };
            var tr = document.createElement('tr');
            tr.dataset.sid = m.id;
            tr.innerHTML = statRowHtml(m, s);
            frag.appendChild(tr);
        });

        clearEl(tbody);
        tbody.appendChild(frag);
        loadAvatarsIn(tbody);

        _statsCleanup = delegateClick(tbody, '.stat-save-btn', async function(e, btn) {
            if (btn.disabled) return;
            if (!await requireAuth()) return;
            var row = btn.closest('tr');
            if (!row) return;

            var mid = row.dataset.sid;
            var h = clamp(row.querySelector('[data-field="hours"]').value);
            var r = clamp(row.querySelector('[data-field="reports"]').value);
            var t = clamp(row.querySelector('[data-field="tickets"]').value);

            btn.disabled = true;
            btn.style.opacity = '0.5';
            try {
                await statsApi.save(mid, h, r, t);
                showToast('Статистика сохранена');
                var badge = row.querySelector('.salary-badge');
                if (badge) badge.textContent = calcSalary(h, r, t);
                var vals = row.querySelectorAll('.stat-val-ro');
                if (vals[0]) vals[0].textContent = h;
                if (vals[1]) vals[1].textContent = r;
                if (vals[2]) vals[2].textContent = t;
            } catch(err) {
                showToast('Ошибка сохранения: ' + (err.message || ''));
            }
            btn.disabled = false;
            btn.style.opacity = '';
        });
    } catch(err) {
        console.error('stats render fail:', err);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px">Ошибка загрузки</td></tr>';
    }
}

var _suspEditClean, _suspDelClean;

function updateSuspectCount(n) {
    var btn = $('[data-tab="suspects"]');
    if (!btn) return;
    var badge = btn.querySelector('.suspects-count');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'suspects-count';
        btn.appendChild(badge);
    }
    badge.textContent = n;
    badge.style.display = n > 0 ? '' : 'none';
}

async function renderSuspects(force) {
    var tbody = $('#suspectsBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px">Загрузка...</td></tr>';

    if (_suspEditClean) _suspEditClean();
    if (_suspDelClean) _suspDelClean();

    try {
        var suspects = await suspectsApi.getAll(force);
        var filtered = filterSuspects(suspects);
        updateSuspectCount(suspects.length);

        if (!filtered.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-msg">' +
                (_suspectSearchTerm || _suspectFilterStatus ? 'Ничего не найдено' : 'Нет сомнительных кадров') + '</td></tr>';
            return;
        }

        var frag = document.createDocumentFragment();
        filtered.forEach(function(s) {
            var tr = document.createElement('tr');
            tr.dataset.suspectId = s.id;
            tr.dataset.status = s.status;
            tr.innerHTML = suspectRowHtml(s);
            frag.appendChild(tr);
        });
        clearEl(tbody);
        tbody.appendChild(frag);
        loadAvatarsIn(tbody);

        _suspEditClean = delegateClick(tbody, '.suspect-edit', function(e, btn) {
            var row = btn.closest('tr');
            if (row) emit('suspect:edit', { id: row.dataset.suspectId });
        });
        _suspDelClean = delegateClick(tbody, '.suspect-del', async function(e, btn) {
            var row = btn.closest('tr');
            if (!row) return;
            if (!await requireAuth()) return;
            try {
                await suspectsApi.remove(row.dataset.suspectId);
                addNotification('Сомнительный удалён', 'suspect');
                showToast('Запись удалена');
                renderSuspects(true);
            } catch(err) { showToast('Ошибка удаления'); }
        });
    } catch(err) {
        console.error('suspects render fail:', err);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px">Ошибка загрузки</td></tr>';
    }
}

var _forumVersion = 0;
var _topicListClean, _replyClean, _actionsClean;

async function renderTopics(force) {
    var container = $('#topicsList');
    if (!container) return;

    var stale = cacheFallback('topics');
    if (!stale || !stale.length) {
        container.innerHTML = '<div class="empty-msg">Загрузка тем...</div>';
    }

    try {
        var topics = await topicsApi.getAll(force);
        var countEl = $('#reportsCount');
        if (countEl) countEl.textContent = topics.length;

        if (!topics.length) {
            container.innerHTML = '<div class="empty-msg">Нет тем для отображения</div>';
            return;
        }
        container.innerHTML = topics.map(topicCardHtml).join('');

        if (_topicListClean) _topicListClean();
        _topicListClean = delegateClick(container, '.topic-card', function(e, card) {
            if (e.target.closest('.drag-handle')) return;
            openTopicView(card.dataset.topicId);
        });
    } catch(err) {
        console.error('topics fail:', err);
        if (!stale || !stale.length)
            container.innerHTML = '<div class="empty-msg">Ошибка загрузки тем</div>';
    }
}

async function openTopicView(topicId) {
    var version = ++_forumVersion;
    setState('currentTopicId', topicId);
    var listEl = $('#topicsList');
    var viewEl = $('#topicView');
    var headEl = $('#topicHead');
    var replyForm = $('#topicReplyForm');
    var lockedMsg = $('#topicLockedMsg');
    var actionsEl = $('#topicViewActions');
    if (!viewEl || !headEl) return;
    if (listEl) listEl.style.display = 'none';
    $$('#tabReports > .section-block').forEach(function(el) { el.style.display = 'none'; });
    viewEl.classList.remove('hidden');
    var topics = await topicsApi.getAll();
    if (version !== _forumVersion) return;
    var topic = topics.find(function(t) { return String(t.id) === String(topicId); });
    if (!topic) { headEl.innerHTML = '<div class="empty-msg">Тема не найдена</div>'; return; }
    var date = topic.created_at ? formatDate(topic.created_at) : '';
    var tSteam = topic.author_steam || '';
    var tSid = tSteam ? steamTo64(tSteam) : null;
    var safeTSid = tSid ? String(tSid).replace(/[^\d]/g, '') : '';
    var tAv = safeTSid ? getCachedAvatar(safeTSid) : FALLBACK_AVATAR;
    var safeTAv = _isSafeImageUrl(tAv) ? tAv : FALLBACK_AVATAR;
    headEl.innerHTML =
        '<h2 class="topic-head-title">' + esc(topic.title) + '</h2>' +
        '<div class="topic-head-badges">' +
        (Number(topic.pinned) === 1 ? '<span class="topic-badge topic-badge-pinned">📌 Закреплено</span>' : '') +
        (Number(topic.locked) === 1 ? '<span class="topic-badge topic-badge-locked">🔒 Закрыта</span>' : '') +
        '</div>' +
        '<div class="topic-head-author">' +
        '<img class="topic-author-avatar" data-steam="' + esc(tSteam) + '" data-sid64="' + safeTSid + '" src="' + esc(safeTAv) + '" alt="">' +
        '<div class="topic-head-author-info">' +
        '<span class="topic-head-author-name">' + esc(topic.author || 'Аноним') + '</span>' +
        '<span class="topic-head-author-date">' + date + '</span>' +
        '</div></div>' +
        '<div class="topic-head-body">' + esc(topic.description || '') + '</div>';
    if (tSteam) loadAvatarsIn(headEl);
    if (actionsEl && state.canEdit) {
        if (_actionsClean) _actionsClean();
        actionsEl.innerHTML =
            '<button class="btn-add topic-action-btn" data-action="edit">' + IC_EDIT + ' Редактировать</button>' +
            '<button class="btn-add topic-action-btn" data-action="lock"><svg viewBox="0 0 24 24" width="16" height="16"><path d="' + (Number(topic.locked) === 1 ? PATH_LOCK_CLOSED : PATH_LOCK_OPEN) + '"/></svg> ' + (Number(topic.locked) === 1 ? 'Открыть' : 'Закрыть') + '</button>' +
            '<button class="btn-add topic-action-btn" data-action="pin"><svg viewBox="0 0 24 24" width="16" height="16"><path d="' + PATH_PIN + '"/></svg> ' + (Number(topic.pinned) === 1 ? 'Открепить' : 'Закрепить') + '</button>' +
            '<button class="btn-add topic-action-btn" data-action="delete">' + IC_DEL + ' Удалить</button>';
        _actionsClean = delegateClick(actionsEl, '[data-action]', async function(e, btn) {
            if (version !== _forumVersion) return;
            if (!await requireAuth()) return;
            var action = btn.dataset.action;
            if (action === 'edit') {
                emit('topic:edit', { id: topicId });
            } else if (action === 'lock') {
                try {
                    await topicsApi.update(topicId, { locked: Number(topic.locked) === 1 ? 0 : 1 });
                    showToast(Number(topic.locked) === 1 ? 'Тема открыта' : 'Тема закрыта');
                    openTopicView(topicId);
                } catch(err) { showToast('Ошибка: ' + err.message); }
            } else if (action === 'pin') {
                try {
                    await topicsApi.update(topicId, { pinned: Number(topic.pinned) === 1 ? 0 : 1 });
                    showToast(Number(topic.pinned) === 1 ? 'Тема откреплена' : 'Тема закреплена');
                    openTopicView(topicId);
                } catch(err) { showToast('Ошибка: ' + err.message); }
            } else if (action === 'delete') {
                try {
                    await topicsApi.remove(topicId);
                    addNotification('Тема удалена', 'topic');
                    showToast('Тема удалена');
                    closeTopicView();
                    renderTopics(true);
                } catch(err) { showToast('Ошибка удаления: ' + err.message); }
            }
        });
    }
    var box = replyForm ? replyForm.querySelector('.reply-form-box') : null;
    if (Number(topic.locked) === 1) {
        if (box) box.style.display = 'none';
        if (lockedMsg) lockedMsg.classList.remove('hidden');
    } else {
        if (box) box.style.display = '';
        if (lockedMsg) lockedMsg.classList.add('hidden');
    }
    await renderReplies(topicId);
}

async function renderReplies(topicId) {
    var container = $('#topicReplies');
    if (!container) return;

    if (_replyClean) _replyClean();

    container.innerHTML = '<div class="empty-msg">Загрузка ответов...</div>';

    try {
        var replies = await repliesApi.getAll(topicId);

        var out = '<div class="topic-replies-title">' + IC_CHAT + ' Ответы (' + replies.length + ')</div>';

        if (!replies.length) {
            out += '<div class="empty-msg" style="padding:16px 0">Пока нет ответов</div>';
        } else {
            out += replies.map(replyCardHtml).join('');
        }

        container.innerHTML = out;
        loadAvatarsIn(container);

        // Обработчик модерации (принять / отклонить)
        var modClean = delegateClick(container, '.reply-mod-btn', async function(e, btn) {
            e.stopPropagation();
            if (!await requireAuth()) return;
            var card = btn.closest('.reply-card');
            var replyId = card && card.dataset.replyId;
            var action = btn.dataset.action;
            if (!replyId || !action || btn.disabled) return;

            btn.disabled = true;
            try {
                await repliesApi.setStatus(topicId, replyId, action);
                showToast(action === 'approved' ? 'Ответ принят' : 'Ответ отклонён');
                renderReplies(topicId);
            } catch(err) {
                showToast('Ошибка: ' + err.message);
                btn.disabled = false;
            }
        });

    var delClean = delegateClick(container, '.reply-del-btn', async function(e, btn) {
        e.stopPropagation();
        var card = btn.closest('.reply-card');
        var replyId = card && card.dataset.replyId;
        if (!replyId || btn.disabled) return;

        var replyAuthor = card.dataset.replyAuthor || '';
        var sess = getSession();
        var isOwner = sess && sess.login && replyAuthor === sess.login;
        var isEditor = state.canEdit;

        if (!isOwner && !isEditor) {
            showToast('Недостаточно прав');
            return;
        }
        if (!isOwner) {
            if (!await requireAuth()) return;
        }

        btn.disabled = true;
        btn.style.opacity = '0.5';
        try {
            await repliesApi.remove(topicId, replyId);
            showToast('Ответ удалён');
            renderReplies(topicId);
        } catch(err) {
            showToast('Ошибка удаления: ' + (err.message || ''));
            btn.disabled = false;
            btn.style.opacity = '';
        }
    });

        _replyClean = function() {
            modClean();
            delClean();
        };

    } catch(err) {
        container.innerHTML = '<div class="empty-msg">Ошибка загрузки ответов</div>';
    }
}

function closeTopicView() {
    setState('currentTopicId', null);
    var viewEl = $('#topicView');
    if (viewEl) viewEl.classList.add('hidden');
    $$('#tabReports > .section-block').forEach(function(el) { el.style.display = ''; });
    var listEl = $('#topicsList');
    if (listEl) listEl.style.display = '';
}

var _qEditClean, _qDelClean;

async function renderQuestions(force) {
    var tbody = $('#questionsBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px">Загрузка...</td></tr>';
    if (_qEditClean) _qEditClean();
    if (_qDelClean)  _qDelClean();
    try {
        var questions = await questionsApi.getAll(force);
        var fGroup = $('#filterGroup');
        var fDiff  = $('#filterDifficulty');
        var gVal = fGroup ? fGroup.value : '';
        var dVal = fDiff  ? fDiff.value  : '';
        if (gVal) questions = questions.filter(function(q) { return q.group_name === gVal; });
        if (dVal) questions = questions.filter(function(q) { return q.difficulty === dVal; });
        var countEl = $('#questionsCount');
        if (countEl) countEl.textContent = questions.length;
        if (!questions.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-msg">Нет вопросов</td></tr>';
            return;
        }
        var frag = document.createDocumentFragment();
        questions.forEach(function(q, i) {
            var tr = document.createElement('tr');
            tr.dataset.questionId = q.id;
            var gc = QUIZ_GROUPS[q.group_name] || { label: q.group_name, color: '#999' };
            var dc = QUIZ_DIFF[q.difficulty]   || { label: q.difficulty, color: '#999' };
            var gcColor = _safeColor(gc.color);
            var dcColor = _safeColor(dc.color);
            tr.innerHTML =
                '<td>' + (i+1) + '</td>' +
                '<td><span class="quiz-badge" style="background:' + gcColor + '20;color:' + gcColor + ';border:1px solid ' + gcColor + '40">' + esc(gc.label) + '</span></td>' +
                '<td><span class="quiz-badge" style="background:' + dcColor + '20;color:' + dcColor + ';border:1px solid ' + dcColor + '40">' + esc(dc.label) + '</span></td>' +
                '<td><span class="quiz-question-preview" title="' + esc(q.description) + '">' + esc(q.description) + '</span></td>' +
                '<td><span class="quiz-answer-preview" title="' + esc(q.answer) + '">' + esc(q.answer) + '</span></td>' +
                '<td class="editor-only"><div class="suspect-actions">' +
                '<button class="suspect-edit question-edit" title="Ред.">' + IC_EDIT + '</button>' +
                '<button class="suspect-del question-del" title="Удалить">' + IC_DEL + '</button>' +
                '</div></td>';
            frag.appendChild(tr);
        });
        clearEl(tbody);
        tbody.appendChild(frag);
        _qEditClean = delegateClick(tbody, '.question-edit', async function(e, btn) {
            var row = btn.closest('tr');
            if (!row) return;
            try {
                var qs = await questionsApi.getAll(false);
                var q = qs.find(function(x) { return String(x.id) === String(row.dataset.questionId); });
                if (!q) return;
                setState('editingQuestionId', q.id);
                var gEl = $('#qGroup'), dEl = $('#qDifficulty'), qEl = $('#qDescription'), aEl = $('#qAnswer');
                if (gEl) gEl.value = q.group_name;
                if (dEl) dEl.value = q.difficulty;
                if (qEl) qEl.value = q.description;
                if (aEl) aEl.value = q.answer;
                _questionModal.open('Редактировать вопрос');
            } catch(err) { showToast('Ошибка'); }
        });
        _qDelClean = delegateClick(tbody, '.question-del', async function(e, btn) {
            var row = btn.closest('tr');
            if (!row) return;
            if (!await requireAuth()) return;
            try {
                await questionsApi.remove(row.dataset.questionId);
                showToast('Вопрос удалён');
                renderQuestions(true);
            } catch(err) { showToast('Ошибка удаления'); }
        });
    } catch(err) {
        console.error('questions fail:', err);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px">Ошибка загрузки</td></tr>';
    }
}

var _qSession = null;
var _qQuestions = [];
var _qIdx = 0;
var _qCorrect = 0;
var _qWrong = 0;

function showQuizPage(pageId) {
    $$('.quiz-page').forEach(function(p) { p.classList.remove('active'); });
    var page = $('#' + pageId);
    if (page) page.classList.add('active');
    $$('.quiz-nav-btn').forEach(function(b) { b.classList.remove('active'); });
}

async function startQuiz(form) {
    try {
        var questions = await questionsApi.getAll(false);
        
        if (!questions || questions.length === 0) {
            showToast('База вопросов пуста. Обновите страницу.');
            return;
        }

        var diff = form.difficulty; 
        
        var filterByDiff = function(arr, targetDiff) {
            if (targetDiff === 'mixed') return arr;
            var filtered = arr.filter(q => q.difficulty === targetDiff);
            return filtered.length > 0 ? filtered : arr; 
        };

        var counts = {
            terms:            safeInt(form.countTerms, 0, 50),
            profession_rules: safeInt(form.countProfession, 0, 50),
            admin_rules:      safeInt(form.countAdmin, 0, 50),
            situations:       safeInt(form.countSituations, 0, 50)
        };

        var pickedIds = [];

        for (var group in counts) {
            var need = counts[group];
            if (need <= 0) continue;
            var groupPool = questions.filter(q => q.group_name === group);
            var finalPool = filterByDiff(groupPool, diff);

            if (finalPool.length < need) {
                var groupLabel = (QUIZ_GROUPS[group] || {}).label || group;
                showToast('В группе "' + groupLabel + '" всего ' + finalPool.length + ' вопр.');
                return; 
            }

            // Перемешиваем и выбираем нужное количество
            finalPool.sort(() => Math.random() - 0.5);
            var selected = finalPool.slice(0, need);
            
            selected.forEach(q => pickedIds.push(q.id));
        }

        if (pickedIds.length === 0) {
            showToast('Выберите количество вопросов');
            return;
        }
        pickedIds.sort(() => Math.random() - 0.5);

        var sessionId = genId();
        var sess = getSession();
        var result = await quizSessionsApi.create({
            id: sessionId,
            call_type: form.callType,
            admin_nick: form.adminNick,
            admin_rank: form.adminRank,
            admin_steam: form.adminSteam,
            admin_discord: form.adminDiscord,
            difficulty: form.difficulty,
            max_errors: form.maxErrors,
            question_ids: pickedIds,
            created_by: (sess && sess.login) || 'system'
        });

        if (!result || !result.success) {
            throw new Error('Сервер отклонил создание сессии');
        }
        var full = await quizSessionsApi.getOne(sessionId);
        if (!full || !full.answers) {
            throw new Error('Не удалось получить вопросы от сервера');
        }
        _qSession = full;
        _qQuestions = full.answers;
        _qIdx = 0;
        _qCorrect = 0;
        _qWrong = 0;

        // Обновляем UI
        if ($('#quizActiveAdmin')) $('#quizActiveAdmin').textContent = form.adminNick;
        if ($('#quizActiveType'))  $('#quizActiveType').textContent = CALL_TYPES[form.callType] || form.callType;
        if ($('#quizMaxErrorsShow')) $('#quizMaxErrorsShow').textContent = form.maxErrors;

        showQuizPage('quizPageActive');
        renderQuizQuestion();
        showToast('Опрос начат успешно');

    } catch (err) {
        console.error('Quiz Start Error:', err);
        showToast('Ошибка: ' + err.message);
    }
}

function renderQuizQuestion() {
    if (_qIdx >= _qQuestions.length || _qWrong >= (_qSession.max_errors || 3)) {
        finishQuiz();
        return;
    }
    var q = _qQuestions[_qIdx];
    var total = _qQuestions.length;
    var progressText = $('#quizProgressText');
    var progressFill = $('#quizProgressFill');
    if (progressText) progressText.textContent = 'Вопрос ' + (_qIdx + 1) + ' / ' + total;
    if (progressFill) progressFill.style.width = ((_qIdx / total) * 100) + '%';
    updateQuizScore();
    var numEl  = $('#quizQNum');
    var groupEl = $('#quizQGroup');
    var diffEl  = $('#quizQDiff');
    var textEl  = $('#quizQText');
    if (numEl) numEl.textContent = 'Вопрос ' + (_qIdx + 1);
    var gc = QUIZ_GROUPS[q.group_name] || { label: q.group_name, color: '#999' };
    var dc = QUIZ_DIFF[q.difficulty]   || { label: q.difficulty, color: '#999' };
    if (groupEl) {
        groupEl.textContent = gc.label;
        var gcCol = _safeColor(gc.color);
        groupEl.style.cssText = 'background:' + gcCol + '20;color:' + gcCol + ';border:1px solid ' + gcCol + '40';
    }
    if (diffEl) {
        diffEl.textContent = dc.label;
        var dcCol = _safeColor(dc.color);
        diffEl.style.cssText = 'background:' + dcCol + '20;color:' + dcCol + ';border:1px solid ' + dcCol + '40';
    }
    if (textEl) textEl.textContent = q.question_text || q.description || '';
    var answerInput  = $('#quizAnswerInput');
    var correctBlock = $('#quizCorrectAnswer');
    if (answerInput)  answerInput.value = '';
    if (correctBlock) correctBlock.classList.add('hidden');
}

function updateQuizScore() {
    var ce = $('#quizScoreCorrect');
    var we = $('#quizScoreWrong');
    if (ce) ce.textContent = '✓ ' + _qCorrect;
    if (we) we.textContent = '✗ ' + _qWrong;
}

async function answerQuiz(correct) {
    if (_qIdx >= _qQuestions.length) return;

    var q = _qQuestions[_qIdx];
    var input = $('#quizAnswerInput');
    var given = input ? input.value.trim() : '';

    quizSessionsApi.answer(_qSession.id, q.id, given, correct).catch(function(e) {
        console.error('answer submit err:', e);
    });

    if (correct) _qCorrect++; else _qWrong++;
    updateQuizScore();
    _qIdx++;

    if (_qWrong >= (_qSession.max_errors || 3)) {
        showToast('Превышен лимит ошибок!');
        finishQuiz();
        return;
    }
    renderQuizQuestion();
}

function showQuizAnswer() {
    if (_qIdx >= _qQuestions.length) return;
    var q = _qQuestions[_qIdx];
    var block = $('#quizCorrectAnswer');
    var txt = $('#quizCorrectTxt');
    if (block) block.classList.remove('hidden');
    if (txt) txt.textContent = q.correct_answer || q.answer || '';
}

async function finishQuiz() {
    if (!_qSession) return;
    var result;
    try {
        result = await quizSessionsApi.finish(_qSession.id);
    } catch(e) {
        result = {
            result: _qWrong >= (_qSession.max_errors || 3) ? 'failed' : 'passed',
            correct: _qCorrect,
            wrong: _qWrong
        };
    }
    addNotification('Опрос завершён: ' + (_qSession.admin_nick || ''), 'quiz');
    renderQuizResult(result);
    showQuizPage('quizPageResult');
}

function renderQuizResult(result) {
    var card = $('#quizResultCard');
    if (!card) return;

    var passed = result.result === 'passed';
    var total = _qQuestions.length;
    var pct = total > 0 ? Math.round((_qCorrect / total) * 100) : 0;

    var icon = passed
        ? '<svg viewBox="0 0 24 24" width="64" height="64"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
        : '<svg viewBox="0 0 24 24" width="64" height="64"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

    var cls = passed ? 'quiz-result-passed' : 'quiz-result-failed';

    card.innerHTML =
        '<div class="quiz-result-icon ' + cls + '">' + icon + '</div>' +
        '<h2 class="quiz-result-title ' + cls + '">' + (passed ? 'ОПРОС ПРОЙДЕН' : 'ОПРОС НЕ ПРОЙДЕН') + '</h2>' +
        '<div class="quiz-result-details">' +
            '<div class="quiz-result-row"><span>Администратор:</span><strong>' + esc(_qSession.admin_nick) + '</strong></div>' +
            '<div class="quiz-result-row"><span>Ранг:</span><strong>' + esc(_qSession.admin_rank) + '</strong></div>' +
            '<div class="quiz-result-row"><span>Steam ID:</span><strong>' + esc(_qSession.admin_steam) + '</strong></div>' +
            (_qSession.admin_discord ? '<div class="quiz-result-row"><span>Discord:</span><strong>' + esc(_qSession.admin_discord) + '</strong></div>' : '') +
            '<div class="quiz-result-row"><span>Тип обзвона:</span><strong>' + esc(CALL_TYPES[_qSession.call_type] || _qSession.call_type) + '</strong></div>' +
            '<div class="quiz-result-divider"></div>' +
            '<div class="quiz-result-row"><span>Всего вопросов:</span><strong>' + total + '</strong></div>' +
            '<div class="quiz-result-row"><span>Правильных:</span><strong class="quiz-score-correct-text">' + _qCorrect + '</strong></div>' +
            '<div class="quiz-result-row"><span>Ошибок:</span><strong class="quiz-score-wrong-text">' + _qWrong + '</strong></div>' +
            '<div class="quiz-result-row"><span>Допустимо ошибок:</span><strong>' + _qSession.max_errors + '</strong></div>' +
            '<div class="quiz-result-row"><span>Процент верных:</span><strong>' + pct + '%</strong></div>' +
        '</div>';
}

function abortQuiz() {
    _qSession = null;
    _qQuestions = [];
    showQuizPage('quizPageCreate');
    showToast('Опрос прерван');
}

var _histDelClean;

async function renderQuizHistory() {
    var tbody = $('#quizHistoryBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px">Загрузка...</td></tr>';
    if (_histDelClean) _histDelClean();
    try {
        var sessions = await quizSessionsApi.getAll();
        if (!sessions.length) {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-msg">Нет записей</td></tr>';
            return;
        }
        var RESULT_CLASSES = { passed: 'quiz-result-passed', failed: 'quiz-result-failed' };
        var frag = document.createDocumentFragment();
        sessions.forEach(function(s) {
            var tr = document.createElement('tr');
            tr.dataset.sessionId = s.id;
            var rCls   = RESULT_CLASSES[s.result] || '';
            var rLabel = s.result === 'passed' ? 'Пройден'
                       : s.result === 'failed' ? 'Не пройден'
                       : s.status === 'in_progress' ? 'В процессе'
                       : esc(s.status);
            tr.innerHTML =
                '<td>' + formatDate(s.created_at) + '</td>' +
                '<td>' + esc(CALL_TYPES[s.call_type] || s.call_type) + '</td>' +
                '<td>' + esc(s.admin_nick) + '</td>' +
                '<td>' + rankBadge(s.admin_rank) + '</td>' +
                '<td>' + Number(s.total_questions) + '</td>' +
                '<td><span class="quiz-score-correct-text">' + Number(s.correct_answers) + '</span></td>' +
                '<td><span class="quiz-score-wrong-text">' + Number(s.wrong_answers) + '</span></td>' +
                '<td><span class="quiz-history-result ' + rCls + '">' + esc(rLabel) + '</span></td>' +
                '<td class="quiz-history-actions"><button class="quiz-session-del" type="button" title="Удалить">' + IC_DEL + '</button></td>';
            frag.appendChild(tr);
        });
        clearEl(tbody);
        tbody.appendChild(frag);
        _histDelClean = delegateClick(tbody, '.quiz-session-del', async function(e, btn) {
            var row = btn.closest('tr');
            if (!row) return;
            if (!await requireAuth()) return;
            try {
                await quizSessionsApi.remove(row.dataset.sessionId);
                showToast('Запись удалена');
                renderQuizHistory();
            } catch(e) { showToast('Ошибка удаления'); }
        });
    } catch(err) {
        console.error('quiz history err:', err);
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px">Ошибка</td></tr>';
    }
}

async function updateAvailCounts() {
    try {
        var qs = await questionsApi.getAll(false);
        var diff = $('#quizDifficulty');
        var dv = diff ? diff.value : 'mixed';

        function count(group) {
            var pool = qs.filter(function(q) { return q.group_name === group; });
            if (dv !== 'mixed') pool = pool.filter(function(q) { return q.difficulty === dv; });
            return pool.length;
        }

        var sets = { '#availTerms': 'terms', '#availProfession': 'profession_rules', '#availAdmin': 'admin_rules', '#availSituations': 'situations' };
        for (var sel in sets) {
            var el = $(sel);
            if (el) el.textContent = count(sets[sel]);
        }
        updateQuizTotal();
    } catch(err) { console.error('avail counts err:', err); }
}

function updateQuizTotal() {
    var total = 0;
    ['#quizCountTerms', '#quizCountProfession', '#quizCountAdmin', '#quizCountSituations'].forEach(function(sel) {
        var el = $(sel);
        if (el) total += Math.max(0, parseInt(el.value) || 0);
    });
    var el = $('#quizTotalQuestions');
    if (el) el.textContent = total;
}

function setQuizVisibility(rank) {
    var show = QUIZ_ALLOWED_RANKS.indexOf(rank) > -1;
    var btn = $('[data-tab="quiz"]');
    var content = $('#tabQuiz');
    if (btn) btn.style.display = show ? '' : 'none';
    if (content) content.style.display = show ? '' : 'none';
}

var TAB_DEFS = [
    { id: 'dashboard',  label: 'Главная',              ic: 'grid' },
    { id: 'table',      label: 'Таблица',              ic: 'user' },
    { id: 'stats',      label: 'Статистика',           ic: 'chart' },
    { id: 'suspects',   label: 'Сомнительные кадры',   ic: 'shield' },
    { id: 'reports',    label: 'Отчёты',               ic: 'msg' },
    { id: 'autotrack',  label: 'Авто слежка',          ic: 'eye' },
    { id: 'checker',    label: 'Чекер',                ic: 'search' },
    { id: 'quiz',       label: 'Опросник',             ic: 'plus-box' }
];

function renderTabs() {
    var nav = $('#mainTabs');
    if (!nav) return;

    nav.innerHTML = TAB_DEFS.map(function(t, i) {
        return '<button class="tab-btn' + (i === 0 ? ' active' : '') + '" data-tab="' + t.id + '">' +
            '<i class="ic ic-' + t.ic + '"></i>' +
            '<span>' + esc(t.label) + '</span></button>';
    }).join('');
}

var QUIZ_NAV = [
    { page: 'questions', label: 'База вопросов', ic: 'help' },
    { page: 'create',    label: 'Создать опрос', ic: 'plus' },
    { page: 'history',   label: 'История',       ic: 'clock' }
];

function renderQuizNav() {
    var nav = $('#quizNav');
    if (!nav) return;

    nav.innerHTML = QUIZ_NAV.map(function(n, i) {
        return '<button class="quiz-nav-btn' + (i === 0 ? ' active' : '') + '" data-quiz-page="' + n.page + '">' +
            '<i class="ic ic-' + n.ic + '"></i> ' + esc(n.label) + '</button>';
    }).join('');
}

async function renderDashboard() {
    try {
        var members = await membersApi.getAll();
        var stats = await statsApi.getAll();
        var suspects = await suspectsApi.getAll();
        var topics = await topicsApi.getAll();

        var dm = $('#dashMembers');
        var ds = $('#dashSuspects');
        var dh = $('#dashHours');
        var dt = $('#dashTopics');

        if (dm) dm.textContent = members.length;
        if (ds) ds.textContent = suspects.length;
        if (dt) dt.textContent = topics.length;

        var totalHours = 0;
        for (var mid in stats) {
            totalHours += stats[mid].hours || 0;
        }
        if (dh) dh.textContent = totalHours;

        renderDashChart(members, stats);
        renderDashActivity(topics, suspects);
    } catch(err) {
        console.error('dashboard err:', err);
    }
}

function renderDashChart(members, stats) {
    var canvas = $('#dashChart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 280 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '280px';
    ctx.scale(dpr, dpr);

    var w = rect.width;
    var h = 280;
    ctx.clearRect(0, 0, w, h);

    if (!members.length) {
        ctx.fillStyle = '#666';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Нет данных', w / 2, h / 2);
        return;
    }

    var data = members.map(function(m) {
        var s = stats[m.id] || { hours: 0, reports: 0, tickets: 0 };
        return { nick: m.nick, hours: s.hours, reports: s.reports, tickets: s.tickets };
    }).slice(0, 15);

    var maxVal = Math.max.apply(null, data.map(function(d) { return d.hours; })) || 1;

    var chartType = 'bar';
    var toggleBtns = $$('[data-chart]');
    toggleBtns.forEach(function(b) {
        if (b.classList.contains('active')) chartType = b.dataset.chart;
    });

    var padding = { top: 20, right: 20, bottom: 60, left: 50 };
    var chartW = w - padding.left - padding.right;
    var chartH = h - padding.top - padding.bottom;

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
        var gy = padding.top + chartH * (1 - g / 4);
        ctx.beginPath();
        ctx.moveTo(padding.left, gy);
        ctx.lineTo(w - padding.right, gy);
        ctx.stroke();
        ctx.fillStyle = '#555';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxVal * g / 4), padding.left - 8, gy + 4);
    }

    var gap = chartW / data.length;
    var barW = Math.min(gap * 0.6, 40);

    if (chartType === 'bar') {
        data.forEach(function(d, i) {
            var x = padding.left + i * gap + gap / 2 - barW / 2;
            var barH = (d.hours / maxVal) * chartH;
            var y = padding.top + chartH - barH;

            var grad = ctx.createLinearGradient(x, y, x, y + barH);
            grad.addColorStop(0, 'rgba(231,76,60,0.8)');
            grad.addColorStop(1, 'rgba(192,57,43,0.4)');
            ctx.fillStyle = grad;

            var r = Math.min(barW / 2, 6);
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + barW - r, y);
            ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
            ctx.lineTo(x + barW, y + barH);
            ctx.lineTo(x, y + barH);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.fill();

            ctx.fillStyle = '#888';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.save();
            ctx.translate(padding.left + i * gap + gap / 2, h - padding.bottom + 15);
            ctx.rotate(-0.4);
            var label = d.nick.length > 8 ? d.nick.substr(0, 7) + '…' : d.nick;
            ctx.fillText(label, 0, 0);
            ctx.restore();
        });
    } else {
        ctx.strokeStyle = 'rgba(231,76,60,0.8)';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.beginPath();

        var points = [];
        data.forEach(function(d, i) {
            var x = padding.left + i * gap + gap / 2;
            var y = padding.top + chartH - (d.hours / maxVal) * chartH;
            points.push({ x: x, y: y });
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        var fillGrad = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
        fillGrad.addColorStop(0, 'rgba(231,76,60,0.15)');
        fillGrad.addColorStop(1, 'rgba(231,76,60,0.01)');
        ctx.fillStyle = fillGrad;
        ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
        ctx.lineTo(points[0].x, padding.top + chartH);
        ctx.closePath();
        ctx.fill();

        points.forEach(function(p) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#e74c3c';
            ctx.fill();
            ctx.strokeStyle = 'rgba(231,76,60,0.3)';
            ctx.lineWidth = 6;
            ctx.stroke();
        });

        data.forEach(function(d, i) {
            ctx.fillStyle = '#888';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.save();
            ctx.translate(padding.left + i * gap + gap / 2, h - padding.bottom + 15);
            ctx.rotate(-0.4);
            var label = d.nick.length > 8 ? d.nick.substr(0, 7) + '…' : d.nick;
            ctx.fillText(label, 0, 0);
            ctx.restore();
        });
    }
}

function _isSafeImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    var allowedDomains = ['i.imgur.com', 'avatars.steamstatic.com', 'community.akamai.steamstatic.com'];
    try {
        var u = new URL(url);
        if (u.protocol !== 'https:') return false;
        return allowedDomains.some(function(dom) { return u.hostname === dom; });
    } catch(e) { return false; }
}

function _makeBadge(label, icon, color) {
    var c  = _safeColor(color);
    var ic = _safeIconUrl(icon);
    var safeIc = encodeURI(ic).replace(/'/g, '%27');
    var safeColor = c.replace(/[^\w#(),.\s]/g, '');
    var styleOuter = safe('--rank-color: ' + safeColor);
    var styleInner = safe(
        'background-color: ' + safeColor + '; ' +
        (safeIc ? '-webkit-mask-image: url(\'' + safeIc + '\'); mask-image: url(\'' + safeIc + '\');' : '')
    );

    return html`<span class="member-rank-badge rank-with-icon" title="${label}" style="${styleOuter}"><span class="rank-icon-mask" style="${styleInner}"></span><span class="rank-label">${label}</span></span>`;
}
function renderDashActivity(topics, suspects) {
    var list = $('#dashActivity');
    if (!list) return;

    var items = [];

    topics.forEach(function(t) {
        items.push({
            type: 'topic',
            text: 'Тема: ' + (t.title || ''),
            time: t.created_at ? new Date(t.created_at).getTime() : 0
        });
    });

    suspects.forEach(function(s) {
        items.push({
            type: 'suspect',
            text: 'Сомнительный: ' + (s.nick || ''),
            time: 0
        });
    });

    items.sort(function(a, b) { return b.time - a.time; });
    items = items.slice(0, 10);

    if (!items.length) {
        list.innerHTML = '<div class="notif-empty">Нет активности</div>';
        return;
    }

    list.innerHTML = items.map(function(item) {
        var safeActivityType = (item.type === 'topic' || item.type === 'suspect') ? item.type : 'info';

        return html`
            <div class="dash-activity-item">
                <div class="dash-activity-dot dash-activity-dot--${safeActivityType}"></div>
                <span class="dash-activity-text">${item.text}</span>
                <span class="dash-activity-time">${item.time ? _timeAgo(item.time) : ''}</span>
            </div>`;
    }).join('');
}

function initSearch() {
    var memberSearch = $('#memberSearch');
    if (memberSearch) {
        memberSearch.oninput = debounce('memberSearch', function() {
            _memberSearchTerm = memberSearch.value.trim();
            renderMembers(false);
        }, 250);
    }

    var memberChips = $$('[data-filter-role]');
    memberChips.forEach(function(chip) {
        chip.onclick = function() {
            memberChips.forEach(function(c) { c.classList.remove('active'); });
            chip.classList.add('active');
            _memberFilterRole = chip.dataset.filterRole;
            renderMembers(false);
        };
    });

    var suspectSearch = $('#suspectSearch');
    if (suspectSearch) {
        suspectSearch.oninput = debounce('suspectSearch', function() {
            _suspectSearchTerm = suspectSearch.value.trim();
            renderSuspects(false);
        }, 250);
    }

    var suspectChips = $$('[data-filter-suspect]');
    suspectChips.forEach(function(chip) {
        chip.onclick = function() {
            suspectChips.forEach(function(c) { c.classList.remove('active'); });
            chip.classList.add('active');
            _suspectFilterStatus = chip.dataset.filterSuspect;
            renderSuspects(false);
        };
    });

    var statsSearch = $('#statsSearch');
    if (statsSearch) {
        statsSearch.oninput = debounce('statsSearch', function() {
            var term = statsSearch.value.trim().toLowerCase();
            var rows = $$('#statsBody tr');
            rows.forEach(function(tr) {
                var nick = tr.querySelector('.stat-member');
                var text = nick ? nick.textContent.toLowerCase() : '';
                tr.style.display = text.indexOf(term) > -1 ? '' : 'none';
            });
        }, 250);
    }
}

var _sortState = {};

function initSortableHeaders() {
    $$('.sortable').forEach(function(th) {
        th.addEventListener('click', function() {
            var table = th.closest('table');
            var tbody = table ? table.querySelector('tbody') : null;
            if (!tbody) return;

            var sortKey = th.dataset.sort;
            var tableId = table.id;

            if (_sortState[tableId] === sortKey + ':asc') {
                _sortState[tableId] = sortKey + ':desc';
            } else {
                _sortState[tableId] = sortKey + ':asc';
            }

            var dir = _sortState[tableId].endsWith(':asc') ? 1 : -1;

            table.querySelectorAll('.sortable').forEach(function(h) {
                h.classList.remove('sort-asc', 'sort-desc');
            });
            th.classList.add(dir === 1 ? 'sort-asc' : 'sort-desc');

            var rows = Array.from(tbody.querySelectorAll('tr'));
            var colIdx = Array.from(th.parentNode.children).indexOf(th);

            rows.sort(function(a, b) {
                var aCell = a.children[colIdx];
                var bCell = b.children[colIdx];
                var aText = aCell ? aCell.textContent.trim() : '';
                var bText = bCell ? bCell.textContent.trim() : '';

                var aNum = parseFloat(aText.replace(/[^\d.-]/g, ''));
                var bNum = parseFloat(bText.replace(/[^\d.-]/g, ''));

                if (!isNaN(aNum) && !isNaN(bNum)) return (aNum - bNum) * dir;
                return aText.localeCompare(bText, 'ru') * dir;
            });

            rows.forEach(function(row) { tbody.appendChild(row); });
        });
    });
}
function showLoginScreen() {
    $('#loginScreen').classList.remove('hidden');
    $('#mainApp').classList.add('hidden');
    updateNormVisibility();
}

function showAppWithReadOnly() {
    $('#loginScreen').classList.add('hidden');
    $('#mainApp').classList.remove('hidden');
    state.canEdit = false;
    document.body.classList.remove('can-edit');
    updateNormVisibility();
}

function getSession() {
    const data = getJSON(STORAGE_KEYS.session);
    if (!data || !data.token) return null;
    

    if (typeof data.token !== 'string' || data.token.length < 8) {
        storageRemove(STORAGE_KEYS.session);
        return null;
    }
    return data;
}

function initTopicDragDrop() {
    var list = $('#topicsList');
    if (!list) return;

    var dragItem = null;

    list.addEventListener('dragstart', function(e) {
        var card = e.target.closest('.topic-card');
        if (!card || !state.canEdit) return;
        dragItem = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.dataset.topicId);
    });

    list.addEventListener('dragend', function() {
        if (dragItem) dragItem.classList.remove('dragging');
        $$('.topic-card.drag-over').forEach(function(c) { c.classList.remove('drag-over'); });
        dragItem = null;
    });

    list.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        var card = e.target.closest('.topic-card');
        if (card && card !== dragItem) {
            $$('.topic-card.drag-over').forEach(function(c) { c.classList.remove('drag-over'); });
            card.classList.add('drag-over');
        }
    });

    list.addEventListener('drop', function(e) {
        e.preventDefault();
        var card = e.target.closest('.topic-card');
        if (!card || !dragItem || card === dragItem) return;

        var cards = Array.from(list.querySelectorAll('.topic-card'));
        var fromIdx = cards.indexOf(dragItem);
        var toIdx = cards.indexOf(card);

        if (fromIdx < toIdx) {
            card.after(dragItem);
        } else {
            card.before(dragItem);
        }

        $$('.topic-card.drag-over').forEach(function(c) { c.classList.remove('drag-over'); });
        showToast('Порядок тем изменён');
    });
}

function initSettings() {
    var btnSettings = $('#btnSettings');
    var settingsModal = $('#settingsModal');
    var settingsClose = $('#settingsClose');

    if (btnSettings && settingsModal) {
        btnSettings.onclick = function() {
            settingsModal.classList.remove('hidden');
            renderBgSelector();
        };
        if (settingsClose) {
            settingsClose.onclick = function() {
                settingsModal.classList.add('hidden');
            };
        }
        settingsModal.addEventListener('click', function(e) {
            if (e.target === settingsModal) settingsModal.classList.add('hidden');
        });
    }
    var brightnessSlider = $('#bgBrightness');
    var brightnessVal = $('#bgBrightnessVal');
    if (brightnessSlider) {
        var savedBr = storageGet('union_bg_brightness');
        if (savedBr) {
            brightnessSlider.value = savedBr;
            applyBrightness(savedBr);
        }
        if (brightnessVal) brightnessVal.textContent = brightnessSlider.value + '%';

        brightnessSlider.oninput = function() {
            var val = brightnessSlider.value;
            if (brightnessVal) brightnessVal.textContent = val + '%';
            applyBrightness(val);
            storageSet('union_bg_brightness', val);
        };
    }
    $$('.settings-tab-style-btn').forEach(function(btn) {
        btn.onclick = function() {
            $$('.settings-tab-style-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var style = btn.dataset.tabStyle;
            applyTabStyle(style);
            storageSet('union_tab_style', style);
        };
    });
    $$('.settings-pos-btn').forEach(function(btn) {
        btn.onclick = function() {
            $$('.settings-pos-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var pos = btn.dataset.pos;
            applyTabPosition(pos);
            storageSet('union_tab_pos', pos);
        };
    });

    // load saved
    var savedStyle = storageGet('union_tab_style') || 'default';
    var savedPos = storageGet('union_tab_pos') || 'top';
    if (savedStyle === 'wheel') savedStyle = 'default';

    $$('.settings-tab-style-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.tabStyle === savedStyle);
    });
    $$('.settings-pos-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.pos === savedPos);
    });

    applyTabStyle(savedStyle);
    applyTabPosition(savedPos);
}

function applyBrightness(val) {
    var overlay = $('.overlay');
    if (!overlay) return;
    var numVal = Math.max(0, Math.min(100, parseFloat(val) || 50));
    var darkness = 1 - (numVal / 100);
    overlay.style.background =
        'radial-gradient(ellipse at 20% 50%, rgba(192, 57, 43, 0.06) 0%, transparent 60%),' +
        'radial-gradient(ellipse at 80% 20%, rgba(192, 57, 43, 0.04) 0%, transparent 50%),' +
        'radial-gradient(ellipse at 50% 100%, rgba(0, 0, 0, ' + (darkness * 0.8) + ') 0%, transparent 70%),' +
        'linear-gradient(180deg, rgba(0, 0, 0, ' + (darkness * 0.5) + ') 0%, rgba(0, 0, 0, ' + (darkness * 0.7) + ') 100%)';
}

function applyTabStyle(style) {
    if (style === 'wheel') style = 'default';
    document.body.setAttribute('data-tab-style', style);

    var defaultBar = $('#mainTabs');
    var glassBar = $('#glassTabBar');

    if (style === 'default') {
        if (defaultBar) defaultBar.classList.remove('hidden');
        if (glassBar) glassBar.classList.add('hidden');
    } else if (style === 'glass-rect') {
        if (defaultBar) defaultBar.classList.add('hidden');
        if (glassBar) glassBar.classList.remove('hidden');
        renderGlassTabs();
    }
}

function applyTabPosition(pos) {
    document.body.setAttribute('data-tab-pos', pos);
    var glassBar = $('#glassTabBar');
    if (glassBar) glassBar.setAttribute('data-pos', pos);
}

function renderGlassTabs() {
    var bar = $('#glassTabBar');
    if (!bar) return;

    bar.innerHTML = TAB_DEFS.map(function(t, i) {
        return '<button class="glass-tab-btn' + (i === 0 ? ' active' : '') + '" data-tab="' + t.id + '" data-tooltip="' + esc(t.label) + '">' +
            '<i class="ic ic-' + t.ic + '"></i>' +
            '<span class="glass-tab-label">' + esc(t.label) + '</span>' +
            '</button>';
    }).join('');

    delegateClick(bar, '.glass-tab-btn', function(e, btn) {
        handleTabSwitch(btn.dataset.tab);
        bar.querySelectorAll('.glass-tab-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
    });
}

function handleTabSwitch(tabName) {
    $$('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
    $$('.glass-tab-btn').forEach(function(b) { b.classList.remove('active'); });
    $$('.tab-content').forEach(function(c) { c.classList.remove('active'); });

    var contentId;
    if (tabName === 'dashboard') contentId = 'tabDashboard';
    else contentId = 'tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1);

    var content = $('#' + contentId);
    if (content) content.classList.add('active');

    var defaultBtn = $('#mainTabs [data-tab="' + tabName + '"]');
    if (defaultBtn) defaultBtn.classList.add('active');
    var glassBtn = $('#glassTabBar [data-tab="' + tabName + '"]');
    if (glassBtn) glassBtn.classList.add('active');

    var tabActions = {
        dashboard:  renderDashboard,
        table:      function() {
            _memberSearchTerm = '';
            _memberFilterRole = '';
            var searchInput = $('#memberSearch');
            if (searchInput) searchInput.value = '';
            $$('[data-filter-role]').forEach(function(c) {
                c.classList.toggle('active', c.dataset.filterRole === '');
            });
            renderMembers(false);
        },
        stats:      function() { renderStats(); },
        suspects:   function() {
            _suspectSearchTerm = '';
            _suspectFilterStatus = '';
            var suspectInput = $('#suspectSearch');
            if (suspectInput) suspectInput.value = '';
            $$('[data-filter-suspect]').forEach(function(c) {
                c.classList.toggle('active', c.dataset.filterSuspect === '');
            });
            renderSuspects();
        },
        reports:    function() { closeTopicView(); renderTopics(false); },
        quiz:       function() { renderQuestions(); updateAvailCounts(); }
    };
    if (tabActions[tabName]) tabActions[tabName]();
}

function initNotifPanel() {
    var btn = $('#btnNotif');
    var panel = $('#notifPanel');
    var clearBtn = $('#notifClearAll');

    if (!btn || !panel) return;

    btn.onclick = function(e) {
        e.stopPropagation();
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            _notifications.forEach(function(n) { n.read = true; });
            setJSON('union_notifications', _notifications);
            updateNotifBadge();
            renderNotifications();
        }
    };

    if (clearBtn) {
        clearBtn.onclick = function() {
            _notifications = [];
            setJSON('union_notifications', _notifications);
            renderNotifications();
            updateNotifBadge();
        };
    }

    document.addEventListener('click', function(e) {
        if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
            panel.classList.add('hidden');
        }
    });

    var saved = getJSON('union_notifications');
    if (Array.isArray(saved)) _notifications = saved;
    updateNotifBadge();
}

function updateNormVisibility() {
    var fab = $('#normFab');
    var mainApp = $('#mainApp');
    if (!fab) return;
    var isLoggedIn = mainApp && !mainApp.classList.contains('hidden');
    fab.classList.toggle('hidden', !isLoggedIn);
}

async function verifySession(session) {
    if (!session?.token) return { ok: false, reason: 'no_session' };

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), AUTH_TIMEOUT);

    try {
        const res = await fetch(AUTH_URL + '/verify', {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + session.token
        },
        signal: ctrl.signal
        });

        clearTimeout(timeout);

        if (res.status === 401 || res.status === 403) {
            return { ok: false, reason: 'invalid_token' };
        }

        if (!res.ok) {
            return { ok: false, reason: 'server_error', status: res.status };
        }

        const data = await res.json();

        return {
            ok: true,
            data: data,
            token: session.token
        };

    } catch (err) {
        clearTimeout(timeout);
        return {
            ok: false,
            reason: err.name === 'AbortError' ? 'timeout' : 'network_error',
            offline: true
        };
    }
}


async function _sha256(str) {
  // crypto.subtle может быть недоступен в non-secure context (Google Sites iframe)
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
    try {
      var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf))
        .map(function(b) { return b.toString(16).padStart(2, '0'); })
        .join('');
    } catch(e) {
      console.warn('[SHA256] crypto.subtle failed, using fallback');
    }
  }
  // Fallback: простая JS-реализация SHA-256
  return _sha256Fallback(str);
}

function _sha256Fallback(str) {
  // Минимальная JS SHA-256 реализация
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = 'length';
  var i, j;
  var result = '';
  var words = [];
  var asciiBitLength = str[lengthProperty] * 8;
  var hash = [];
  var k = [];
  var primeCounter = 0;

  var isComposite = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  str += '\x80';
  while (str[lengthProperty] % 64 - 56) str += '\x00';
  for (i = 0; i < str[lengthProperty]; i++) {
    j = str.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
  words[words[lengthProperty]] = (asciiBitLength);

  for (j = 0; j < words[lengthProperty];) {
    var w = words.slice(j, j += 16);
    var oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      var w15 = w[i - 15], w2 = w[i - 2];
      var a = hash[0], e = hash[4];
      var temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
          w[i - 16]
          + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
          + w[i - 7]
          + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
        ) | 0);
      var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      var b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

async function doLogin(login, pass) {
    var hashed = await _sha256(pass);
    var res = await fetch(AUTH_URL, {
    method: 'POST',
    mode: 'cors',
    credentials: 'omit',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({ login: login, pass: hashed })
    });
    if (!res.ok) {
        throw new Error('server_error:' + res.status);
    }
    var responseText = await res.text();
    try {
        return JSON.parse(responseText);
    } catch(e) {
        throw new Error('Некорректный ответ сервера');
    }
}

function applyAuth(serverResponse, originalToken) {
    const user = serverResponse.data || serverResponse;

    if (!user || !user.login) {
        logout();
        return;
    }

    const canEdit = !!user.canEdit;

    state.canEdit = canEdit;
    document.body.classList.toggle('can-edit', canEdit);

    updateProfile(
        user.login,
        user.rank || 'Пользователь',
        user.steam
    );

    saveSession(
        originalToken || user.token,
        user.login,
        user.steam,
        user.rank,
        canEdit
    );

    setQuizVisibility(user.rank);
}

function logout() {
    clearSession();
    cacheClear();
    state.canEdit = false;
    document.body.classList.remove('can-edit');

    var ls = $('#loginScreen');
    var ma = $('#mainApp');
    if (ls) ls.classList.remove('hidden');
    if (ma) ma.classList.add('hidden');

    updateNormVisibility();

    var normPopup = $('#normPopup');
    if (normPopup) {
        normPopup.classList.add('hidden');
        normPopup.classList.remove('is-active', 'is-closing', 'is-flashing');
    }

    ['#loginUser', '#loginPass', '#loginError', '#currentUserRank'].forEach(function(sel) {
        var el = $(sel);
        if (el) { el.textContent = ''; el.value = ''; }
    });
    var ha = $('#headerAvatar');
    if (ha) ha.src = FALLBACK_AVATAR;
}

function initParallax() {
    var bg = $('#bgLayer');
    if (!bg) return;
    var mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', function(e) {
        mx = (e.clientX / window.innerWidth - 0.5) * 25;
        my = (e.clientY / window.innerHeight - 0.5) * 25;
    });
    (function tick() {
        cx += (mx - cx) * 0.06;
        cy += (my - cy) * 0.06;
        bg.style.transform = 'scale(1.15) translate(' + cx + 'px,' + cy + 'px)';
        requestAnimationFrame(tick);
    })();
}

function initBanTexts() {
    var texts = [
        { t: 'БАН', w: 4 }, { t: 'ВЫГОВОР', w: 3 },
        { t: 'ПРЕДУПРЕЖДЕНИЕ', w: 2 }, { t: 'ЧСП', w: 2 }
    ];
    var totalW = 11;
    var anims = ['flyRight', 'flyLeft', 'flyUp', 'flyDiagonal'];
    var MAX = 60;

    function pick() {
        var r = Math.random() * totalW;
        for (var i = 0; i < texts.length; i++) {
            r -= texts[i].w;
            if (r <= 0) return texts[i].t;
        }
        return texts[0].t;
    }

    function spawn() {
        if (document.hidden) return;
        var c = document.getElementById('banContainer');
        if (!c || c.children.length >= MAX) return;

        var el = document.createElement('span');
        el.className = 'ban-text';
        var txt = pick();
        el.textContent = txt;
        el.dataset.type = txt.toLowerCase();
        if (Math.random() > 0.75) el.classList.add('glow');

        var sz = 8 + Math.random() * 12;
        if (txt.length > 6) sz *= 0.7;
        el.style.fontSize = sz + 'px';
        el.style.setProperty('--max-opacity', (0.10 + Math.random() * 0.18).toFixed(2));
        el.style.setProperty('--rot', (-25 + Math.random() * 50) + 'deg');
        el.style.top = Math.random() * 100 + '%';
        el.style.left = Math.random() * 100 + '%';

        var anim = anims[Math.random() * anims.length | 0];
        var dur = 6 + Math.random() * 8;
        el.style.animation = anim + ' ' + dur + 's linear forwards, gradientPulse ' + (2 + Math.random() * 2) + 's ease-in-out infinite';
        c.appendChild(el);
        setTimeout(function() { if (el.parentNode) el.remove(); }, dur * 1000 + 300);
    }

    for (var i = 0; i < 40; i++) setTimeout(spawn, i * 120);

    var interval = setInterval(spawn, 250);
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) { clearInterval(interval); interval = null; }
        else if (!interval) interval = setInterval(spawn, 250);
    });
}

function initNormPopup() {
    if (window.__normInit) return;
    window.__normInit = true;

    var isOpen = false, closeT, cleanT;

    function openIt() {
        if (!isUserInApp()) return;

        var overlay = $('#normPopup');
        var msg = $('#normMsg');
        var imgWrap = $('#normImgWrap');
        if (!overlay || !msg || !imgWrap) return;

        clearTimeout(closeT);
        clearTimeout(cleanT);
        isOpen = true;

        overlay.classList.remove('hidden', 'is-closing', 'is-active', 'is-flashing');
        msg.classList.remove('animate');
        imgWrap.classList.remove('animate');
        void overlay.offsetWidth;

        overlay.classList.add('is-active', 'is-flashing');
        msg.classList.add('animate');
        setTimeout(function() { imgWrap.classList.add('animate'); }, 180);
        closeT = setTimeout(closeIt, 7000);
    }

    function closeIt() {
        var overlay = $('#normPopup');
        if (!overlay) return;
        clearTimeout(closeT); clearTimeout(cleanT);
        isOpen = false;
        overlay.classList.remove('is-active', 'is-flashing');
        overlay.classList.add('is-closing');

        cleanT = setTimeout(function() {
            overlay.classList.add('hidden');
            overlay.classList.remove('is-closing');
            var msg = $('#normMsg');
            var imgWrap = $('#normImgWrap');
            if (msg) msg.classList.remove('animate');
            if (imgWrap) imgWrap.classList.remove('animate');
        }, 450);
    }

    document.addEventListener('click', function(e) {
        if (e.target.closest('#normTrigger')) { e.preventDefault(); openIt(); return; }
        if (e.target === document.getElementById('normPopup') && isOpen) closeIt();
    });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && isOpen) closeIt(); });
}

function initCornerWidget() {
    var icon, fx, busy = false, firstTime = true, spot, hideT, bobInt, bobA = 0;

    function init() {
        icon = document.getElementById('corner-icon-widget');
        fx = document.getElementById('corner-icon-fx');
        if (!icon || !fx) return;
        icon.addEventListener('click', onClick);
        schedule();
    }

    function schedule() {
        var delay = firstTime ? 3000 : (30000 + Math.random() * 20000);
        firstTime = false;
        setTimeout(appear, delay);
    }

    function randomSpot() {
        var sides = ['top', 'bottom', 'left', 'right'];
        var side = sides[Math.random() * 4 | 0];
        var vw = window.innerWidth, vh = window.innerHeight;
        var pos = { left: 0, top: 0, fromX: 0, fromY: 0 };
        switch(side) {
            case 'top':    pos.left = 50 + Math.random() * (vw-120); pos.top = -25; pos.fromY = -80; break;
            case 'bottom': pos.left = 50 + Math.random() * (vw-120); pos.top = vh-45; pos.fromY = 80; break;
            case 'left':   pos.left = -25; pos.top = 50 + Math.random() * (vh-120); pos.fromX = -80; break;
            default:       pos.left = vw-45; pos.top = 50 + Math.random() * (vh-120); pos.fromX = 80; break;
        }
        return pos;
    }

    function appear() {
        if (busy) return;
        busy = true;
        spot = randomSpot();
        icon.style.cssText = 'position:fixed;width:70px;left:' + spot.left + 'px;top:' + spot.top + 'px;opacity:0;pointer-events:none;z-index:999999;cursor:pointer;transform:translate(' + spot.fromX + 'px,' + spot.fromY + 'px) scale(0.5)';

        var start = null;
        var C1 = 1.7, C3 = C1 + 1;

        function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / 1500, 1);
            var ease = 1 + C3 * Math.pow(p - 1, 3) + C1 * Math.pow(p - 1, 2);
            icon.style.opacity = Math.min(p * 2.5, 1);
            icon.style.transform = 'translate(' + (spot.fromX * (1 - ease)) + 'px,' + (spot.fromY * (1 - ease)) + 'px) scale(' + (0.5 + 0.5 * ease) + ')';
            if (p < 1) { requestAnimationFrame(step); return; }
            icon.style.opacity = '1';
            icon.style.transform = 'translate(0,0) scale(1)';
            icon.style.pointerEvents = 'auto';
            startBob();
            hideT = setTimeout(function() { if (busy) hideBack(); }, 6000 + Math.random() * 4000);
        }
        requestAnimationFrame(step);
    }

    function startBob() {
        bobA = 0;
        bobInt = setInterval(function() {
            bobA += 0.07;
            icon.style.transform = 'translate(' + (Math.sin(bobA) * 4) + 'px,' + (Math.cos(bobA * 0.7) * 3) + 'px) rotate(' + (Math.sin(bobA * 0.5) * 3) + 'deg)';
        }, 30);
    }
    function stopBob() { if (bobInt) { clearInterval(bobInt); bobInt = null; } }

    function hideBack() {
        stopBob();
        icon.style.pointerEvents = 'none';
        var start = null;
        function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / 1000, 1);
            icon.style.opacity = 1 - p * p;
            icon.style.transform = 'translate(' + (spot.fromX * p * p) + 'px,' + (spot.fromY * p * p) + 'px) scale(' + (1 - 0.5 * p * p) + ')';
            if (p < 1) { requestAnimationFrame(step); return; }
            icon.style.opacity = '0';
            busy = false;
            schedule();
        }
        requestAnimationFrame(step);
    }

    function onClick(e) {
        if (!busy) return;
        busy = false;
        clearTimeout(hideT);
        stopBob();
        var rect = icon.getBoundingClientRect();
        boom(e.clientX, e.clientY);
        icon.style.pointerEvents = 'none';
        icon.style.left = rect.left + 'px';
        icon.style.top = rect.top + 'px';
        icon.style.transform = 'none';
        icon.style.opacity = '1';

        var x = rect.left, y = rect.top;
        var vx = (Math.random() - 0.5) * 4, vy = -4, angle = 0;
        var spin = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 4);

        setTimeout(function() {
            (function fall() {
                vy += 0.5; x += vx; y += vy; angle += spin;
                vx *= 0.997; spin *= 0.997;
                icon.style.left = x + 'px';
                icon.style.top = y + 'px';
                icon.style.transform = 'rotate(' + angle + 'deg)';
                if (y < window.innerHeight + 200) requestAnimationFrame(fall);
                else { icon.style.opacity = '0'; schedule(); }
            })();
        }, 80);
    }

    function boom(x, y) {
        var flash = document.createElement('div');
        flash.className = 'corner-flash';
        flash.style.left = x + 'px'; flash.style.top = y + 'px';
        fx.appendChild(flash);
        setTimeout(function() { flash.remove(); }, 350);

        for (var i = 0; i < 10; i++) {
            var sp = document.createElement('div');
            sp.className = 'corner-spark';
            var sz = 4 + Math.random() * 5;
            sp.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + sz + 'px;height:' + sz + 'px';
            sp.style.setProperty('--a', (i * 36) + 'deg');
            sp.style.setProperty('--d', (20 + Math.random() * 25) + 'px');
            fx.appendChild(sp);
            setTimeout(function() { sp.remove(); }, 450);
        }
        for (var j = 0; j < 4; j++) {
            var sm = document.createElement('div');
            sm.className = 'corner-smoke';
            var ssz = 10 + Math.random() * 12;
            sm.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + ssz + 'px;height:' + ssz + 'px';
            sm.style.setProperty('--sx', (-15 + Math.random() * 30) + 'px');
            sm.style.setProperty('--sy', (-12 + Math.random() * 24) + 'px');
            fx.appendChild(sm);
            setTimeout(function() { sm.remove(); }, 650);
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}

function initCustomCursor() {
    var cursor = document.getElementById('custom-cursor');


    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'custom-cursor';
        document.body.appendChild(cursor);
    }


    document.documentElement.classList.add('cursor-ready');

    document.addEventListener('mousemove', function(e) {
        cursor.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    }, { passive: true });


    document.addEventListener('mousedown', function() {
        cursor.classList.add('is-active');
    });

    document.addEventListener('mouseup', function() {
        cursor.classList.remove('is-active');
    });


    document.addEventListener('mouseout', function(e) {
        if (!e.relatedTarget && !e.toElement) {
            cursor.style.opacity = '0';
        }
    });

    document.addEventListener('mouseover', function() {
        cursor.style.opacity = '1';
    });
}

function initLoginFx() {
    var screen = document.getElementById('loginScreen');
    var parallaxBg = document.getElementById('loginParallaxBg');
    var loginBox3d = document.getElementById('loginBox3d');
    var boxWrapper = document.getElementById('loginBox3dWrapper');
    var flashC = document.getElementById('flashCursor');
    var particlesWrap = document.getElementById('loginParticlesWrap');
    if (!screen || !parallaxBg) return;

    var mx = 0, my = 0, cx = 0, cy = 0;
    var tx = 0, ty = 0, tcx = 0, tcy = 0;

    var boxBaseX = 0, boxBaseY = 0;
    function calcBoxBase() {
        boxBaseX = window.innerWidth - window.innerWidth * 0.12 - 200; 
        boxBaseY = window.innerHeight * 0.5;
    }
    calcBoxBase();
    window.addEventListener('resize', calcBoxBase);

    document.addEventListener('mousemove', function(e) {
        if (screen.classList.contains('hidden')) {
            if (flashC) flashC.style.display = 'none';
            return;
        }

        var ratioX = (e.clientX / window.innerWidth - 0.5);
        var ratioY = (e.clientY / window.innerHeight - 0.5);

        mx = ratioX * 70;
        my = ratioY * 45;

        tx = ratioX * -8;
        ty = ratioY * -5;

        if (flashC) {
            flashC.style.display = 'block';
            flashC.style.left = e.clientX + 'px';
            flashC.style.top = e.clientY + 'px';
        }
    });

    (function animate() {
        cx += (mx - cx) * 0.04;
        cy += (my - cy) * 0.04;
        tcx += (tx - tcx) * 0.05;
        tcy += (ty - tcy) * 0.05;
        if (parallaxBg) {
            parallaxBg.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
        }
        if (boxWrapper) {
            var bx = cx * 0.55;
            var by = cy * 0.55;
            boxWrapper.style.transform = 'translate(' + bx + 'px, calc(-50% + ' + by + 'px))';
        }
        if (loginBox3d) {
            loginBox3d.style.transform = 'rotateY(' + (tcx - 3) + 'deg) rotateX(' + (tcy + 1.5) + 'deg)';
        }
        requestAnimationFrame(animate);
    })();
    var pInterval;
    function spawnForestParticle() {
        if (screen.classList.contains('hidden')) return;
        var container = particlesWrap || screen;
        if (container.querySelectorAll('.login-forest-particle').length > 25) return;

        var p = document.createElement('div');
        p.className = 'login-forest-particle';
        var size = 2 + Math.random() * 5;
        var dur = 7 + Math.random() * 10;
        var colors = [
            'rgba(160,200,120,', 'rgba(120,180,80,', 'rgba(200,180,100,',
            'rgba(180,220,140,', 'rgba(140,160,90,'
        ];
        var color = colors[Math.floor(Math.random() * colors.length)];
        var alpha = 0.2 + Math.random() * 0.4;

        p.style.cssText =
            'left:' + (Math.random() * 100) + '%;' +
            'bottom:-10px;' +
            'width:' + size + 'px;height:' + size + 'px;' +
            'background:radial-gradient(circle,' + color + alpha + ') 0%, ' + color + (alpha * 0.3) + ') 70%, transparent 100%);' +
            'box-shadow:0 0 ' + (3 + Math.random() * 6) + 'px ' + color + (alpha * 0.5) + ');' +
            'animation-duration:' + dur + 's;' +
            'animation-delay:' + (Math.random() * 2) + 's;';

        container.appendChild(p);
        setTimeout(function() { if (p.parentNode) p.remove(); }, (dur + 3) * 1000);
    }
    for (var i = 0; i < 12; i++) setTimeout(spawnForestParticle, i * 200);
    pInterval = setInterval(function() {
        if (screen.classList.contains('hidden')) { clearInterval(pInterval); return; }
        spawnForestParticle();
    }, 500);
    new MutationObserver(function() {
        if (screen.classList.contains('hidden')) {
            if (flashC) flashC.style.display = 'none';
            screen.querySelectorAll('.login-forest-particle').forEach(function(el) { el.remove(); });
            if (particlesWrap) particlesWrap.innerHTML = '';
            clearInterval(pInterval);
        }
    }).observe(screen, { attributes: true, attributeFilter: ['class'] });
}

var _memberModal, _suspectModal, _topicModal, _questionModal;

function showConfirm(text) {
  return new Promise(function(resolve) {

    var dlg = $('#confirmDlg');
    if (!dlg) {

      resolve(window.confirm(text));
      return;
    }
    var txtEl = $('#confirmText');
    if (txtEl) txtEl.textContent = text;


    if (typeof dlg.showModal === 'function') {
      try {
        dlg.showModal();
        dlg.onclose = function() {
          resolve(dlg.returnValue === 'yes');
        };
        return;
      } catch(e) {}
    }


    dlg.setAttribute('open', '');
    dlg.style.cssText = 'display:block;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;background:#1a1a2e;border:1px solid #333;border-radius:12px;padding:24px;color:#fff;';


    var backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:99998;';
    document.body.appendChild(backdrop);

    function cleanup(val) {
      dlg.removeAttribute('open');
      dlg.style.cssText = '';
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      resolve(val);
    }

    var yesBtn = dlg.querySelector('[value="yes"]');
    var noBtn = dlg.querySelector('[value="no"]');
    if (yesBtn) yesBtn.onclick = function() { cleanup(true); };
    if (noBtn) noBtn.onclick = function() { cleanup(false); };
    backdrop.onclick = function() { cleanup(false); };
  });
}

function initModals() {
    _memberModal = new Modal('#modalOverlay', '#memberForm', '#modalTitle',
        ['#modalClose', '#btnCancel'],
        function() { setState('editingId', null); }
    );
    _memberModal.init();
    _memberModal.onSubmit(async function() {
        var btn = $('#memberForm button[type="submit"]');
        if (btn && btn.disabled) return;

        try {
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Сохранение...';
            }

            if (!await requireAuth()) return;

            var nick  = sanitizeStr(($('#fNick')  || {}).value, 64);
            var steam = sanitizeStr(($('#fSteam') || {}).value, 30);
            var rank  = ($('#fRank')  || {}).value;
            var role  = ($('#fRole')  || {}).value;

            if (!nick)  { showToast('Введите никнейм'); return; }
            if (!steam) { showToast('Введите SteamID'); return; }
            if (!isValidSteam(steam)) { showToast('Неверный формат SteamID'); return; }

            var eid = state.editingId;
            if (eid) {
                await membersApi.update(eid, { id: eid, nick: nick, steam: steam, rank: rank, role: role });
                addNotification('Участник обновлён: ' + nick, 'member');
                showToast('Участник обновлён');
            } else {
                await membersApi.create({ id: genId(), nick: nick, steam: steam, rank: rank, role: role });
                addNotification('Участник добавлен: ' + nick, 'member');
                showToast('Участник добавлен');
            }
            _memberModal.close();
            renderMembers(true);

        } catch(err) {
            console.error(err);
            showToast('Ошибка: ' + (err.message || 'Сервер не ответил'));
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Сохранить';
            }
        }
    });

    _suspectModal = new Modal('#suspectModal', '#suspectForm', '#suspectModalTitle',
        ['#suspectClose', '#suspectBtnCancel'],
        function() { setState('editingSuspectId', null); }
    );
    _suspectModal.init();

    _suspectModal.onSubmit(async function() {
        if (!await requireAuth()) return;

        var nick       = sanitizeStr(($('#sNick')       || {}).value, 64);
        var steam      = sanitizeStr(($('#sSteam')      || {}).value, 30);
        var reason     = sanitizeStr(($('#sReason')     || {}).value, 500);
        var status     = sanitizeStr(($('#sStatus')     || {}).value, 20);
        var violations = safeInt(($('#sViolations') || {}).value, 0, 9999);
        var reports    = safeInt(($('#sReports')    || {}).value, 0, 9999);

        if (!nick)  { showToast('Введите никнейм'); return; }
        if (!steam) { showToast('Введите SteamID'); return; }

        if (!isValidSteam(steam)) {
            showToast('Неверный формат SteamID (пример: STEAM_0:1:12345)');
            return;
        }

        if (!reason) { showToast('Укажите причину'); return; }

        if (!inList(status, VALID_STATUSES)) {
            showToast('Недопустимый статус');
            return;
        }

        try {
            var eid = state.editingSuspectId;
            if (eid) {
                await suspectsApi.update(eid, {
                    nick: nick, steam: steam, reason: reason,
                    violations: violations, reports: reports, status: status
                });
                showToast('Запись обновлена');
            } else {
                await suspectsApi.create({
                    id: genId(), nick: nick, steam: steam, reason: reason,
                    violations: violations, reports: reports, status: status
                });
                addNotification('Сомнительный добавлен: ' + nick, 'suspect');
                showToast('Запись добавлена');
            }
            renderSuspects();
            _suspectModal.close();
        } catch(err) {
            console.error(err);
            showToast('Ошибка сохранения');
        }
    });

                 var topicDlg = $('#topic-dlg');
    if (topicDlg && typeof topicDlg.showModal === 'function') {
      var _dialogWorks = true;
      try { topicDlg.showModal(); topicDlg.close(); } catch(e) { _dialogWorks = false; }

      if (_dialogWorks) {
        _topicModal = {
          open: function(title) {
            var t = $('#topic-dlg-title');
            if (t && title) t.textContent = title;
            topicDlg.showModal();
          },
          close: function() {
            topicDlg.close();
            var f = $('#topicForm');
            if (f) f.reset();
            setState('editingTopicId', null);
          },
          init: function() {
            topicDlg.addEventListener('click', function(e) {
              if (e.target === topicDlg) topicDlg.close();
            });
            var cancelBtn = $('#topicBtnCancel');
            if (cancelBtn) cancelBtn.addEventListener('click', function() {
              topicDlg.close();
            });
            var closeBtn = $('#topicDlgClose');
            if (closeBtn) closeBtn.addEventListener('click', function() {
              topicDlg.close();
            });
          },
          onSubmit: function(handler) {
            var form = $('#topicForm');
            if (!form) return;
            form.addEventListener('submit', async function(e) {
              e.preventDefault();
              await handler(e);
            });
          }
        };
      } else {
        _topicModal = new Modal('#topic-dlg', '#topicForm', '#topic-dlg-title',
          ['#topicDlgClose', '#topicBtnCancel'],
          function() { setState('editingTopicId', null); }
        );
      }
    } else {
      _topicModal = new Modal('#topicModal', '#topicForm', '#topicModalTtl',
        ['#topicClose', '#topicBtnCancel'],
        function() { setState('editingTopicId', null); }
      );
    }

    _topicModal.init();

    _topicModal.onSubmit(async function() {
        if (!await requireAuth()) return;

        var eid          = state.editingTopicId;
        var currentTopic = state.currentTopicId;

        var title  = sanitizeStr(($('#topicTitle') || {}).value, 150);
        var desc   = sanitizeStr(($('#topicDesc')  || {}).value, 5000);

        var pinnedEl = $('#topicPinned');
        var lockedEl = $('#topicLocked');
        var pinned   = pinnedEl ? !!pinnedEl.checked : false;
        var locked   = lockedEl ? !!lockedEl.checked : false;

        if (!title) { showToast('Введите название темы'); return; }

        try {
            if (eid) {
                await topicsApi.update(eid, {
                    title: title, description: desc,
                    pinned: pinned, locked: locked
                });
                showToast('Тема обновлена');
            } else {
                var sess = getSession();
                await topicsApi.create({
                    id:          genId(),
                    title:       title,
                    description: desc,
                    pinned:      pinned,
                    locked:      locked,
                    author:      sess ? sanitizeStr(sess.login, 64) : 'Аноним',
                    replies_count: 0
                });
                addNotification('Тема создана: ' + title, 'topic');
                showToast('Тема создана');
            }
            _topicModal.close();
            if (currentTopic && eid) openTopicView(currentTopic);
            else renderTopics(true);
        } catch(err) {
            console.error(err);
            showToast('Ошибка: ' + err.message);
        }
    });

    _questionModal = new Modal('#questionModal', '#questionForm', '#questionModalTtl',
        ['#questionClose', '#questionBtnCancel'],
        function() { setState('editingQuestionId', null); }
    );
    _questionModal.init();

    _questionModal.onSubmit(async function() {
        if (!await requireAuth()) return;

        var group  = sanitizeStr(($('#qGroup')       || {}).value, 32);
        var diff   = sanitizeStr(($('#qDifficulty')  || {}).value, 16);
        var desc   = sanitizeStr(($('#qDescription') || {}).value, 2000);
        var answer = sanitizeStr(($('#qAnswer')      || {}).value, 2000);

        if (!inList(group, VALID_GROUPS)) {
            showToast('Недопустимая группа вопроса');
            return;
        }

        if (!inList(diff, VALID_DIFFS)) {
            showToast('Недопустимая сложность');
            return;
        }

        if (!desc)   { showToast('Введите текст вопроса'); return; }
        if (!answer) { showToast('Введите ответ'); return; }

        try {
            var eid  = state.editingQuestionId;
            var sess = getSession();

            if (eid) {
                await questionsApi.update(eid, {
                    group_name: group, difficulty: diff,
                    description: desc, answer: answer
                });
                showToast('Вопрос обновлён');
            } else {
                await questionsApi.create({
                    id:          genId(),
                    group_name:  group,
                    difficulty:  diff,
                    description: desc,
                    answer:      answer,
                    created_by:  sess ? sanitizeStr(sess.login, 64) : 'system'
                });
                showToast('Вопрос добавлен');
            }
            renderQuestions(true);
            _questionModal.close();
        } catch(err) {
            console.error(err);
            showToast('Ошибка сохранения');
        }
    });
}

// ============================================================
//  STEAM CHECKER
// ============================================================

var _checkerLastActiveId = null;

function checkerExtract(text, fileName, modTime) {
    var ids = {};
    var base = BigInt('76561197960265728');

    // SteamID64
    var m64 = text.match(/7656119\d{10}/g);
    if (m64) {
        for (var i = 0; i < m64.length; i++) {
            ids[m64[i]] = true;
            if (modTime) _checkerUpdateActive(m64[i]);
        }
    }

    // Steam3 [U:1:xxx]
    var s3 = text.match(/\[U:1:(\d+)\]/g);
    if (s3) {
        for (var j = 0; j < s3.length; j++) {
            var accMatch = s3[j].match(/\d+/);
            if (accMatch) {
                var sid = String(BigInt(accMatch[0]) + base);
                ids[sid] = true;
            }
        }
    }

    // STEAM_X:Y:Z
    var s32 = text.match(/STEAM_[01]:[01]:\d{1,15}/g);
    if (s32) {
        for (var k = 0; k < s32.length; k++) {
            var p = s32[k].replace('STEAM_', '').split(':');
            if (p.length === 3) {
                var y = BigInt(p[1]);
                var z = BigInt(p[2]);
                var sid64 = String(base + z * BigInt(2) + y);
                ids[sid64] = true;
            }
        }
    }

    // Из имени файла
    if (fileName) {
        var nameMatch = fileName.match(/7656119\d{10}/);
        if (nameMatch) {
            ids[nameMatch[0]] = true;
            if (modTime) _checkerUpdateActive(nameMatch[0]);
        }
    }

    return Object.keys(ids);
}

function _checkerUpdateActive(id) {
    _checkerLastActiveId = id;
    var bar = $('#checkerActiveBar');
    var idEl = $('#checkerActiveId');
    if (bar) bar.classList.remove('hidden');
    if (idEl) idEl.textContent = id;
}

function checkerSid64ToFormats(sid64) {
    var base = BigInt('76561197960265728');
    var accId = BigInt(sid64) - base;
    var y = accId % BigInt(2);
    var z = accId / BigInt(2);
    return {
        sid64:   sid64,
        sid32:   'STEAM_0:' + y + ':' + z,
        accId:   String(accId),
        steam3:  '[U:1:' + String(accId) + ']'
    };
}

function checkerRender(source, ids) {
    if (!ids || !ids.length) return;
    var container = $('#checkerResults');
    if (!container) return;

    // Убираем "Результаты появятся здесь"
    var emptyMsg = container.querySelector('.empty-msg');
    if (emptyMsg) emptyMsg.remove();

    var allIds = ids.join(' ');

    var rows = '';
    for (var i = 0; i < ids.length; i++) {
        var f = checkerSid64ToFormats(ids[i]);
        var isActive = ids[i] === _checkerLastActiveId
            ? '<span class="checker-active-tag">АКТИВЕН</span>'
            : '';

        rows +=
            '<tr>' +
            '<td class="checker-col-id">' + esc(f.sid64) + ' ' + isActive + '</td>' +
            '<td class="checker-col-s32">' + esc(f.sid32) + '</td>' +
            '<td class="checker-col-acc">' + esc(f.accId) + '</td>' +
            '<td class="checker-col-s3">' + esc(f.steam3) + '</td>' +
            '<td class="checker-col-act">' +
                '<a href="https://unionteams.ru/player/' + esc(f.sid64) + '?section=bans" ' +
                'target="_blank" rel="noopener" class="checker-ban-link">UNION БАНЫ</a>' +
            '</td>' +
            '</tr>';
    }

    var safeSource = esc(source).toUpperCase();
    var safeAllIds = allIds.replace(/'/g, "\\'");

    var card = document.createElement('div');
    card.className = 'checker-card';
    card.innerHTML =
        '<div class="checker-card-header">' +
            '<div class="checker-card-title">' +
                '<span>' + safeSource + '</span>' +
                '<button type="button" class="checker-copy-all-btn" onclick="checkerCopyAll(\'' + safeAllIds + '\', this)">КОПИРОВАТЬ ВСЕ</button>' +
            '</div>' +
            '<span class="checker-card-count">НАЙДЕНО: ' + ids.length + '</span>' +
        '</div>' +
        '<div class="checker-table-wrap">' +
            '<table class="checker-table">' +
                '<thead><tr>' +
                    '<th>SteamID64</th><th>SteamID32</th><th>AccountID</th><th>Steam3</th><th>Действие</th>' +
                '</tr></thead>' +
                '<tbody>' + rows + '</tbody>' +
            '</table>' +
        '</div>';

    container.insertBefore(card, container.firstChild);
}

function checkerCopyAll(text, btn) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(function() {
        var orig = btn.textContent;
        btn.textContent = 'СКОПИРОВАНО!';
        setTimeout(function() { btn.textContent = orig; }, 1200);
    });
}

function checkerHandleManual() {
    var input = $('#checkerManualInput');
    if (!input) return;
    var text = input.value.trim();
    if (!text) { showToast('Введите текст'); return; }
    var ids = checkerExtract(text, '', 0);
    if (ids.length) {
        checkerRender('Ручной ввод', ids);
        showToast('Найдено: ' + ids.length + ' ID');
    } else {
        showToast('SteamID не найдены');
    }
    input.value = '';
}

async function checkerProcessEntry(entry) {
    if (entry.isDirectory) {
        var reader = entry.createReader();
        var entries = await new Promise(function(resolve) { reader.readEntries(resolve); });
        var folderIds = [];
        var imageIds = {};

        for (var i = 0; i < entries.length; i++) {
            var e = entries[i];
            if (e.isDirectory && /^\d+$/.test(e.name)) {
                var sid = String(BigInt(e.name) + BigInt('76561197960265728'));
                folderIds.push(sid);
            } else if (e.isFile) {
                var file = await new Promise(function(r) { e.file(r); });
                var isImg = /\.(png|jpg|jpeg)$/i.test(file.name);
                if (isImg) {
                    var imgIds = checkerExtract('', file.name, file.lastModified);
                    for (var j = 0; j < imgIds.length; j++) imageIds[imgIds[j]] = true;
                } else if (file.size < 5000000) {
                    var text = await file.text();
                    var fileIds = checkerExtract(text, file.name, file.lastModified);
                    if (fileIds.length) checkerRender(file.name, fileIds);
                }
            }
        }

        if (folderIds.length) checkerRender('Папка: ' + entry.name, folderIds);
        var imgArr = Object.keys(imageIds);
        if (imgArr.length) checkerRender('Кэш картинок', imgArr);
    } else if (entry.isFile) {
        var file2 = await new Promise(function(r) { entry.file(r); });
        var isImg2 = /\.(png|jpg|jpeg)$/i.test(file2.name);
        var ids2;
        if (isImg2) {
            ids2 = checkerExtract('', file2.name, file2.lastModified);
        } else {
            var txt = await file2.text();
            ids2 = checkerExtract(txt, file2.name, file2.lastModified);
        }
        if (ids2.length) checkerRender(file2.name, ids2);
    }
}

function initChecker() {
    var modeBtns = $$('.checker-mode-btn');
    modeBtns.forEach(function(btn) {
        btn.onclick = function() {
            modeBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var mode = btn.dataset.checkerMode;
            var scanner = $('#checkerScannerSection');
            var terminal = $('#checkerTerminalSection');
            if (scanner) scanner.classList.toggle('active', mode === 'scanner');
            if (terminal) terminal.classList.toggle('active', mode === 'terminal');
        };
    });

    var pathsToggle = $('#checkerPathsToggle');
    if (pathsToggle) {
        pathsToggle.onclick = function() {
            var panel = $('#checkerPathsPanel');
            if (panel) panel.classList.toggle('hidden');
        };
    }

    delegateClick(document.body, '.checker-path[data-copy]', function(e, el) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(el.textContent);
            showToast('Скопировано');
        }
    });

    var extractBtn = $('#checkerExtractBtn');
    if (extractBtn) extractBtn.onclick = checkerHandleManual;

    var dropZone = $('#checkerDropZone');
    var fileInput = $('#checkerFileInput');
    if (!dropZone || !fileInput) return;

    // Клик — выбор файлов
    dropZone.addEventListener('click', function(e) {
        e.preventDefault();
        fileInput.click();
    });

    // Input change
    fileInput.addEventListener('change', function() {
        if (fileInput.files && fileInput.files.length) {
            checkerProcessFiles(fileInput.files);
            fileInput.value = '';
        }
    });

    // === DRAG & DROP ===

    var dragCounter = 0;

    dropZone.addEventListener('dragenter', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter++;
        dropZone.classList.add('drag-active');
    }, false);

    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    }, false);

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter--;
        if (dragCounter <= 0) {
            dragCounter = 0;
            dropZone.classList.remove('drag-active');
        }
    }, false);

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter = 0;
        dropZone.classList.remove('drag-active');

        var dt = e.dataTransfer;
        if (!dt) return;

        // Способ 1: через items (поддержка папок)
        if (dt.items && dt.items.length > 0) {
            var hasEntry = false;
            var entries = [];

            for (var i = 0; i < dt.items.length; i++) {
                if (dt.items[i].kind === 'file') {
                    var entry = null;
                    if (typeof dt.items[i].webkitGetAsEntry === 'function') {
                        entry = dt.items[i].webkitGetAsEntry();
                    }
                    if (entry) {
                        hasEntry = true;
                        entries.push(entry);
                    }
                }
            }

            if (hasEntry) {
                checkerProcessEntries(entries);
                return;
            }
        }

        // Способ 2: через files (обычные файлы)
        if (dt.files && dt.files.length > 0) {
            checkerProcessFiles(dt.files);
        }
    }, false);

    // Предотвращаем дефолтное поведение на всём документе
    // чтобы браузер не открывал файл при промахе мимо зоны
    document.addEventListener('dragover', function(e) {
        if (e.target.closest('#checkerDropZone')) return;
        e.preventDefault();
    }, false);

    document.addEventListener('drop', function(e) {
        if (e.target.closest('#checkerDropZone')) return;
        e.preventDefault();
    }, false);
}

// Обработка массива entries (из drag & drop с поддержкой папок)
async function checkerProcessEntries(entries) {
    var totalFound = 0;
    for (var i = 0; i < entries.length; i++) {
        try {
            var count = await checkerProcessEntryCount(entries[i]);
            totalFound += count;
        } catch(err) {
            console.error('Checker entry error:', err);
        }
    }
    if (totalFound === 0) {
        showToast('SteamID не найдены');
    } else {
        showToast('Найдено: ' + totalFound + ' ID');
    }
}

// Обёртка над checkerProcessEntry с подсчётом
async function checkerProcessEntryCount(entry) {
    var countBefore = ($('#checkerResults') || {}).children ? $('#checkerResults').children.length : 0;

    if (entry.isDirectory) {
        var reader = entry.createReader();
        var allEntries = [];

        // readEntries может вернуть не все за раз — читаем батчами
        var readBatch = function() {
            return new Promise(function(resolve) {
                reader.readEntries(function(batch) {
                    resolve(batch);
                }, function() {
                    resolve([]);
                });
            });
        };

        var batch;
        do {
            batch = await readBatch();
            for (var i = 0; i < batch.length; i++) {
                allEntries.push(batch[i]);
            }
        } while (batch.length > 0);

        var folderIds = [];
        var imageIds = {};

        for (var j = 0; j < allEntries.length; j++) {
            var e = allEntries[j];

            if (e.isDirectory && /^\d+$/.test(e.name)) {
                try {
                    var sid = String(BigInt(e.name) + BigInt('76561197960265728'));
                    folderIds.push(sid);
                } catch(err) {}
            } else if (e.isFile) {
                var file = await new Promise(function(resolve, reject) {
                    e.file(resolve, reject);
                }).catch(function() { return null; });

                if (!file) continue;

                var isImg = /\.(png|jpg|jpeg)$/i.test(file.name);
                if (isImg) {
                    var imgIds = checkerExtract('', file.name, file.lastModified);
                    for (var k = 0; k < imgIds.length; k++) imageIds[imgIds[k]] = true;
                } else if (file.size < 5000000) {
                    var text = await checkerReadFile(file);
                    if (text) {
                        var fileIds = checkerExtract(text, file.name, file.lastModified);
                        if (fileIds.length) checkerRender(file.name, fileIds);
                    }
                }
            }
        }

        if (folderIds.length) checkerRender('Папка: ' + entry.name, folderIds);
        var imgArr = Object.keys(imageIds);
        if (imgArr.length) checkerRender('Кэш картинок', imgArr);

        return folderIds.length + imgArr.length;

    } else if (entry.isFile) {
        var file2 = await new Promise(function(resolve, reject) {
            entry.file(resolve, reject);
        }).catch(function() { return null; });

        if (!file2) return 0;

        var isImg2 = /\.(png|jpg|jpeg)$/i.test(file2.name);
        var ids2;

        if (isImg2) {
            ids2 = checkerExtract('', file2.name, file2.lastModified);
        } else {
            var txt = await checkerReadFile(file2);
            ids2 = checkerExtract(txt || '', file2.name, file2.lastModified);
        }

        if (ids2.length) checkerRender(file2.name, ids2);
        return ids2.length;
    }

    return 0;
}

// Обработка обычных файлов (из input или из drop без webkitGetAsEntry)
async function checkerProcessFiles(files) {
    var totalFound = 0;

    for (var i = 0; i < files.length; i++) {
        var file = files[i];

        try {
            var isImg = /\.(png|jpg|jpeg)$/i.test(file.name);

            if (isImg) {
                var imgIds = checkerExtract('', file.name, file.lastModified);
                if (imgIds.length) {
                    checkerRender(file.name, imgIds);
                    totalFound += imgIds.length;
                }
            } else if (file.size < 5000000) {
                var text = await checkerReadFile(file);
                if (text) {
                    var ids = checkerExtract(text, file.name, file.lastModified);
                    if (ids.length) {
                        checkerRender(file.name, ids);
                        totalFound += ids.length;
                    }
                }
            } else {
                console.warn('Checker: файл слишком большой:', file.name, file.size);
            }
        } catch(err) {
            console.error('Checker file error:', file.name, err);
        }
    }

    if (totalFound === 0) {
        showToast('SteamID не найдены в файлах');
    } else {
        showToast('Найдено: ' + totalFound + ' ID');
    }
}

// Безопасное чтение файла как текст
function checkerReadFile(file) {
    return new Promise(function(resolve) {
        try {
            var reader = new FileReader();
            reader.onload = function() {
                resolve(reader.result || '');
            };
            reader.onerror = function() {
                console.error('FileReader error:', file.name);
                resolve('');
            };
            reader.readAsText(file);
        } catch(e) {
            console.error('checkerReadFile error:', e);
            resolve('');
        }
    });
}

function wireUpEvents() {
    initSearch();
    initSortableHeaders();
    initNotifPanel();
    initSettings();
    initTopicDragDrop();
    initChecker();

    var btnAdd = $('#btnAdd');
    if (btnAdd) btnAdd.onclick = function() { setState('editingId', null); _memberModal.open('Добавить участника'); };

    var btnAddS = $('#btnAddSuspect');
    if (btnAddS) btnAddS.onclick = function() { setState('editingSuspectId', null); _suspectModal.open('Добавить сомнительного'); };

    var btnAddT = $('#btnAddTopic');
    if (btnAddT) btnAddT.onclick = function() { setState('editingTopicId', null); _topicModal.open('Создать тему'); };

    var btnLogout = $('#btnLogout');
    if (btnLogout) btnLogout.onclick = logout;

    var tabBar = $('#mainTabs');
    if (tabBar) {
        delegateClick(tabBar, '.tab-btn', function(e, btn) {
            handleTabSwitch(btn.dataset.tab);
            $$('#mainTabs .tab-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
        });
    }

    delegateClick(document.body, '[data-chart]', function(e, btn) {
        $$('[data-chart]').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderDashboard();
    });

    var backBtn = $('#topicBackBtn');
    if (backBtn) backBtn.onclick = function() { closeTopicView(); renderTopics(false); };

    var replyText = $('#replyText');
    var replyCharCnt = $('#replyCharCnt');
    var sendReply = $('#btnSendReply');

    if (replyText && replyCharCnt) {
        replyText.oninput = function() { replyCharCnt.textContent = replyText.value.length; };
    }

    if (sendReply) {
        sendReply.onclick = async function() {
            var topicId = state.currentTopicId;
            if (!topicId || !replyText) return;
            var text = replyText.value.trim();
            if (!text) { showToast('Введите текст'); return; }

            sendReply.disabled = true;
            try {
                var sess = getSession();
                await repliesApi.create(topicId, {
                    id: genId(), text: text,
                    author: sess ? sess.login : 'Аноним',
                    status: 'pending'
                });
                replyText.value = '';
                if (replyCharCnt) replyCharCnt.textContent = '0';
                showToast('Ответ отправлен');
                renderReplies(topicId);
            } catch(err) {
                showToast('Ошибка: ' + err.message);
            }
            sendReply.disabled = false;
        };
    }

    on('member:edit', async function(d) {
        try {
            var members = await membersApi.getAll();
            var m = members.find(function(x) { return String(x.id) === String(d.id); });
            if (!m) return;
            setState('editingId', d.id);
            var fn = $('#fNick'), fs = $('#fSteam'), fr = $('#fRank'), fo = $('#fRole');
            if (fn) fn.value = m.nick;
            if (fs) fs.value = m.steam;
            if (fr) fr.value = m.rank;
            if (fo) fo.value = m.role;
            _memberModal.open('Редактировать участника');
        } catch(err) { showToast('Ошибка'); }
    });

    on('suspect:edit', async function(d) {
        try {
            var suspects = await suspectsApi.getAll();
            var s = suspects.find(function(x) { return String(x.id) === String(d.id); });
            if (!s) return;
            setState('editingSuspectId', s.id);
            var fields = { '#sNick': 'nick', '#sSteam': 'steam', '#sReason': 'reason', '#sViolations': 'violations', '#sReports': 'reports', '#sStatus': 'status' };
            for (var sel in fields) {
                var el = $(sel);
                if (el) el.value = s[fields[sel]] != null ? s[fields[sel]] : '';
            }
            _suspectModal.open('Редактировать запись');
        } catch(err) { showToast('Ошибка'); }
    });

    on('topic:edit', async function(d) {
        try {
            var topics = await topicsApi.getAll();
            var t = topics.find(function(x) { return String(x.id) === String(d.id); });
            if (!t) return;
            setState('editingTopicId', d.id);
            var te = $('#topicTitle'), de = $('#topicDesc'), pe = $('#topicPinned'), le = $('#topicLocked');
            if (te) te.value = t.title || '';
            if (de) de.value = t.description || '';
            if (pe) pe.checked = Number(t.pinned) === 1;
            if (le) le.checked = Number(t.locked) === 1;
            _topicModal.open('Редактировать тему');
        } catch(err) { showToast('Ошибка'); }
    });

    on('auth:expired', function() {
        var ls = $('#loginScreen'), ma = $('#mainApp');
        if (ls) ls.classList.remove('hidden');
        if (ma) ma.classList.add('hidden');
        updateNormVisibility();
    });

    on('state:canEdit', function(d) {
        document.body.classList.toggle('can-edit', d.value);
    });

    var btnAddQ = $('#btnAddQuestion');
    if (btnAddQ) btnAddQ.onclick = function() { setState('editingQuestionId', null); _questionModal.open('Добавить вопрос'); };

    var fGroup = $('#filterGroup');
    var fDiff = $('#filterDifficulty');
    if (fGroup) fGroup.onchange = function() { renderQuestions(); };
    if (fDiff)  fDiff.onchange  = function() { renderQuestions(); };

    var quizNav = $('#quizNav');
    if (quizNav) {
        delegateClick(quizNav, '.quiz-nav-btn', function(e, btn) {
            $$('.quiz-nav-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');

            var page = btn.dataset.quizPage;
            var pageMap = { questions: 'quizPageQuestions', create: 'quizPageCreate', history: 'quiz-page-history' };
            showQuizPage(pageMap[page] || 'quizPageQuestions');

            if (page === 'questions') renderQuestions();
            if (page === 'create')   updateAvailCounts();
            if (page === 'history')  renderQuizHistory();
        });
    }

    var setupForm = $('#quizSetupForm');
    if (setupForm) {
        setupForm.onsubmit = async function(e) {
            e.preventDefault();
            if (!await requireAuth()) return;
            await startQuiz({
                callType:        ($('#quizCallType') || {}).value || 'initial',
                adminNick:       (($('#quizAdminNick') || {}).value || '').trim(),
                adminRank:       ($('#quizAdminRank') || {}).value || 'operator',
                adminSteam:      (($('#quizAdminSteam') || {}).value || '').trim(),
                adminDiscord:    (($('#quizAdminDiscord') || {}).value || '').trim(),
                difficulty:      ($('#quizDifficulty') || {}).value || 'mixed',
                maxErrors:       clamp(($('#quizMaxErrors') || {}).value, 1, 20),
                countTerms:      clamp(($('#quizCountTerms') || {}).value, 0, 50),
                countProfession: clamp(($('#quizCountProfession') || {}).value, 0, 50),
                countAdmin:      clamp(($('#quizCountAdmin') || {}).value, 0, 50),
                countSituations: clamp(($('#quizCountSituations') || {}).value, 0, 50)
            });
        };
    }

    var diffSel = $('#quizDifficulty');
    if (diffSel) diffSel.onchange = updateAvailCounts;

    ['#quizCountTerms', '#quizCountProfession', '#quizCountAdmin', '#quizCountSituations'].forEach(function(sel) {
        var el = $(sel);
        if (el) el.oninput = updateQuizTotal;
    });

    var qCorrect = $('#quizBtnCorrect');
    var qWrong   = $('#quizBtnWrong');
    var qReveal  = $('#quizBtnReveal');
    var qAbort   = $('#quizBtnAbort');
    if (qCorrect) qCorrect.onclick = function() { answerQuiz(true); };
    if (qWrong)   qWrong.onclick   = function() { answerQuiz(false); };
    if (qReveal)  qReveal.onclick  = showQuizAnswer;
    if (qAbort)   qAbort.onclick   = abortQuiz;

    var qNew  = $('#quizBtnNewQuiz');
    var qHist = $('#quizGoHistory');
    if (qNew) qNew.onclick = function() {
        showQuizPage('quizPageCreate');
        $$('.quiz-nav-btn').forEach(function(b) { b.classList.remove('active'); });
        var createBtn = $('[data-quiz-page="create"]');
        if (createBtn) createBtn.classList.add('active');
    };
    if (qHist) qHist.onclick = function() {
        showQuizPage('quiz-page-history');
        $$('.quiz-nav-btn').forEach(function(b) { b.classList.remove('active'); });
        var histBtn = $('[data-quiz-page="history"]');
        if (histBtn) histBtn.classList.add('active');
        renderQuizHistory();
    };
}

function initLoginForm() {
    var form = $('#loginForm');
    if (!form) return;
    form.onsubmit = async function(e) {
        e.preventDefault();
        var loginInput = $('#loginUser');
        var passInput = $('#loginPass');
        var errorEl = $('#loginError');
        var loginValue = loginInput ? loginInput.value.trim() : '';
        var passValue = passInput ? passInput.value : '';
        if (!loginValue || !passValue) {
            if (errorEl) errorEl.textContent = 'Введите логин и пароль';
            return;
        }
        if (errorEl) errorEl.textContent = 'Подключение...';
        doLogin(loginValue, passValue)
            .then(function(data) {
                if (data.success) {
                    if (loginInput) loginInput.value = '';
                    if (passInput) passInput.value = '';
                    if (errorEl) errorEl.textContent = '';

                    applyAuth(data, null);
                    setQuizVisibility(data.rank);

                    var ls = $('#loginScreen'), ma = $('#mainApp');
                    if (ls) ls.classList.add('hidden');
                    if (ma) ma.classList.remove('hidden');
                    updateNormVisibility();
                    handleTabSwitch('dashboard');
                    addNotification('Вход выполнен', 'info');
                    showLoading('Загрузка данных...');
                    setLoadingProgress(20);
                    return Promise.allSettled([
                        membersApi.getAll(true), statsApi.getAll(true),
                        suspectsApi.getAll(true), topicsApi.getAll(true),
                        questionsApi.getAll(true)
                    ]);
                } else {
                    throw new Error('fail');
                }
            })
            .then(function() {
                setLoadingProgress(70);
                setLoadingStatus('Отрисовка...');
                return renderDashboard();
            })
            .then(function() {
                setLoadingProgress(100);
                setLoadingStatus('Готово!');
                hideLoading();
            })
            .catch(function(err) {
                console.error('login err:', err);
                
                if (!err || !err.message) {
                    if (errorEl) errorEl.textContent = 'Неизвестная ошибка';
                    return;
                }
                
                if (err.message === 'fail') {
                    if (errorEl) errorEl.textContent = 'Неверный логин или пароль';
                } else if (err.message.startsWith('server_error:')) {
                    var parts = err.message.split(':');
                    var code = parts[1] || '?';
                    if (errorEl) errorEl.textContent = 'Ошибка сервера: ' + code;
                } else if (err.name === 'TypeError' || err.message.indexOf('fetch') > -1) {
                    if (errorEl) errorEl.textContent = 'Сервер недоступен. Проверь интернет.';
                } else {
                    if (errorEl) errorEl.textContent = 'Ошибка подключения';
                }
            });
    };
}
function isUserInApp() {
    var mainApp = $('#mainApp');
    var session = getSession();
    return !!(mainApp && !mainApp.classList.contains('hidden') && session && session.token);
}
async function startApp() {
    var appT0 = Date.now();
    console.log('[APP START]');

    preloadIcons(); 
    applyBg(getSavedBg(), false); 
    renderTabs();
    renderQuizNav();
    applyBg(getSavedBg(), false);
    initModals();
    wireUpEvents();
    initLoginForm();

    var savedBr = storageGet('union_bg_brightness');
    if (savedBr) applyBrightness(savedBr);

    console.log('[APP INIT DONE]', (Date.now() - appT0) + 'ms');

    var session = getSession();

    if (!session || !session.token) {
        console.log('[APP] No session, showing login');
        showLoginScreen();
        return;
    }

    showLoading('Проверка сессии...');
    setLoadingProgress(10);

    var result;
    try {
        result = await verifySession(session);
    } catch (err) {
        console.error('[APP] verify crashed:', err);
        result = { ok: false, reason: 'exception' };
    }

    console.log('[APP] verify result:', result.ok, result.reason || '');

    if (!result.ok && !result.offline) {
        console.log('[APP] Invalid token, logging out');
        hideLoading();
        clearSession();
        showLoginScreen();
        showToast('Сессия недействительна. Войдите заново.');
        return;
    }

    if (!result.ok && result.offline) {
        console.log('[APP] Server unreachable, read-only mode');

        showAppWithReadOnly();
        updateProfile(session.login, session.rank, session.steam);
        setQuizVisibility(session.rank);

        state.canEdit = false;
        document.body.classList.remove('can-edit');

        setLoadingStatus('Загрузка кешированных данных...');
        setLoadingProgress(50);

        handleTabSwitch('dashboard');

        try {
            await renderDashboard();
            await renderMembers(false);
        } catch (e) {
            console.error('offline render err:', e);
        }

        hideLoading();
        showToast('Сервер недоступен — режим только чтение');
        return;
    }


    console.log('[APP] Token valid, applying server data');

    var serverData = result.data || {};

    var canEdit = !!serverData.canEdit;
    state.canEdit = canEdit;
    document.body.classList.toggle('can-edit', canEdit);

    var serverLogin = serverData.login || session.login;
    var serverRank = serverData.rank || null;
    var serverSteam = serverData.steam || null;

    saveSession(
        serverData.token || session.token,
        serverLogin,
        serverSteam,
        serverRank,
        canEdit
    );
    var ls = $('#loginScreen'), ma = $('#mainApp');
    if (ls) ls.classList.add('hidden');
    if (ma) ma.classList.remove('hidden');
    updateNormVisibility();

    updateProfile(serverLogin, serverRank, serverSteam);
    setQuizVisibility(serverRank);

    setLoadingStatus('Загрузка данных...');
    setLoadingProgress(30);

    await Promise.allSettled([
        membersApi.getAll(true),
        statsApi.getAll(true),
        suspectsApi.getAll(true),
        topicsApi.getAll(true),
        questionsApi.getAll(true)
    ]);

    setLoadingProgress(70);
    setLoadingStatus('Отрисовка...');


    handleTabSwitch('dashboard');

    try {
        await renderDashboard();
        await renderMembers(false);
    } catch (e) {
        console.error('render err:', e);
    }

    setLoadingProgress(100);
    setLoadingStatus('Готово!');
    hideLoading();

    addNotification('Сессия подтверждена', 'info');
    console.log('[APP READY]', (Date.now() - appT0) + 'ms total');
}


initParallax();
initCustomCursor();
initLoginFx();
initNormPopup();

setTimeout(function() {
    initBanTexts();
    initCornerWidget();
}, 2000);
(function initWelcomeScreen() {
    const welcome = document.getElementById('welcomeScreen');
    const btn = document.getElementById('welcomeEnterBtn');
    const login = document.getElementById('loginScreen');

    if (!welcome || !btn) return;

    // hide login behind welcome
    if (login) {
        login.style.opacity = '0';
        login.style.pointerEvents = 'none';
    }

    function leave() {
        if (welcome.classList.contains('leaving')) return;
        welcome.classList.add('leaving');

        if (login) {
            login.style.transition = 'opacity 0.8s ease 0.25s';
            login.style.opacity = '1';
            login.style.pointerEvents = '';
        }

        welcome.addEventListener('transitionend', function h(e) {
            if (e.propertyName !== 'opacity') return;
            welcome.classList.add('hidden');
            welcome.removeEventListener('transitionend', h);
            if (login) {
                login.style.transition = '';
                login.style.opacity = '';
                login.style.pointerEvents = '';
            }
        });
    }

    btn.addEventListener('click', leave);

    document.addEventListener('keydown', function handler(e) {
        if (welcome.classList.contains('hidden') || welcome.classList.contains('leaving')) return;
        if (e.key === 'Tab' || e.metaKey || e.ctrlKey || e.altKey) return;
        leave();
        document.removeEventListener('keydown', handler);
    });
})();
// ---- go ----
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        startApp().catch(function(err) { console.error('init failed:', err); });
    }, { once: true });
} else {
    startApp().catch(function(err) { console.error('init failed:', err); });
}

})();