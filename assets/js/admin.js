/* Floating Contact Pro – admin app (vanilla JS) */
(function (w, d) {
  'use strict';

  var A = w.FCP_ADMIN, R = w.FCP, TPL = w.FCP_TEMPLATES || [], CATS = w.FCP_TEMPLATE_CATS || {};
  var esc = R.esc;
  var app = d.getElementById('fcp-app');
  var PACKS = {}, packLoading = {};
  var S = {
    view: 'list', list: A.instances || [], cur: null, dirty: false, tab: 'layout',
    device: 'desktop', previewOpen: true, previewOffline: false, saving: false, openItems: {}
  };

  /* ================================================================ utils */

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function get(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? undefined : a[k]; }, o); }
  function set(o, p, v) {
    var ks = p.split('.'), last = ks.pop();
    var t = ks.reduce(function (a, k) { if (a[k] == null || typeof a[k] !== 'object') a[k] = {}; return a[k]; }, o);
    t[last] = v;
  }
  function deepMerge(base, add) {
    Object.keys(add || {}).forEach(function (k) {
      var v = add[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) deepMerge(base[k], v);
      else base[k] = clone(v);
    });
    return base;
  }
  function uid(p) { return (p || 'i') + Math.random().toString(36).slice(2, 8); }
  function rp(p) { return p.replace('@', S.device); }
  function $(sel, ctx) { return (ctx || d).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || d).querySelectorAll(sel)); }
  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }
  function toast(msg, type) {
    var t = d.createElement('div'); t.className = 'fcp-toast fcp-toast--' + (type || 'ok'); t.textContent = msg;
    d.body.appendChild(t); setTimeout(function () { t.classList.add('is-in'); }, 10);
    setTimeout(function () { t.classList.remove('is-in'); setTimeout(function () { t.remove(); }, 300); }, 2600);
  }
  function ajax(action, data) {
    var fd = new FormData(); fd.append('action', 'fcp_' + action); fd.append('nonce', A.nonce);
    Object.keys(data || {}).forEach(function (k) { fd.append(k, typeof data[k] === 'object' ? JSON.stringify(data[k]) : data[k]); });
    return fetch(A.ajax, { method: 'POST', body: fd, credentials: 'same-origin' }).then(function (r) { return r.json(); });
  }
  var ICON_SVG = {
    desktop: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7v2h3v2H7v-2h3v-2H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v9h16V6z"/></svg>',
    tablet: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h12V4zm5 13h2v2h-2z"/></svg>',
    mobile: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h8V4zm3 13h2v2h-2z"/></svg>',
    drag: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM9 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-6 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>'
  };
  var DEV_LABEL = { desktop: 'دسکتاپ', tablet: 'تبلت', mobile: 'موبایل' };

  /* ================================================================ icons */

  function loadPack(p) {
    if (PACKS[p]) return Promise.resolve(PACKS[p]);
    if (!packLoading[p]) {
      packLoading[p] = fetch(A.iconsUrl + p + '.json?v=' + A.version).then(function (r) { return r.json(); }).then(function (j) { PACKS[p] = j; return j; });
    }
    return packLoading[p];
  }
  function svgFor(key) {
    if (!key || key.indexOf(':') < 0) return '';
    var i = key.indexOf(':'), p = key.slice(0, i), n = key.slice(i + 1);
    if (p === 'img') return '<img class="fcp-i fcp-i--img" src="' + esc(n) + '" alt="">';
    if (p === 'cus') { var c = A.custom[n]; return c ? c.svg.replace('<svg', '<svg class="fcp-i"') : ''; }
    var pack = PACKS[p]; if (!pack || !pack[n]) return '';
    var g = pack[n], wv = g[0], h = g[1], dd = g[2], t = g[3] || 0;
    if (t === 1) return '<svg class="fcp-i" viewBox="0 0 ' + wv + ' 1024"><path fill="currentColor" transform="matrix(1 0 0 -1 0 960)" d="' + dd + '"/></svg>';
    if (t === 2) return '<svg class="fcp-i" viewBox="0 0 ' + wv + ' ' + h + '"><path fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" d="' + dd + '"/></svg>';
    return '<svg class="fcp-i" viewBox="0 0 ' + wv + ' ' + h + '"><path fill="currentColor" d="' + dd + '"/></svg>';
  }
  function iconKeys(inst) {
    var keys = [inst.trigger.icon, inst.trigger.close_icon, inst.cta.icon, inst.header.icon, 'fas:xmark'];
    (inst.items || []).concat(inst.socials.items || []).forEach(function (it) { keys.push(it.icon || (A.networks[it.network] || {}).icon); });
    return keys.filter(Boolean);
  }
  function ensureIcons(inst) {
    var need = {};
    iconKeys(inst).forEach(function (k) { var p = k.split(':')[0]; if (['fas', 'far', 'fab', 'efa'].indexOf(p) > -1) need[p] = 1; });
    return Promise.all(Object.keys(need).map(loadPack));
  }

  /** Mirror of FCP_Settings::payload() for the preview. */
  function payload(inst) {
    var p = clone(inst), icons = {};
    ['items', 'socials'].forEach(function (grp) {
      var list = grp === 'items' ? p.items : p.socials.items;
      list = (list || []).filter(function (it) { return it.enabled !== false; }).map(function (it) {
        var net = A.networks[it.network] || A.networks.custom;
        it.icon = it.icon || net.icon; it.ncolor = net.color; it.href = '#'; it.label = it.label || net.label;
        return it;
      });
      if (grp === 'items') p.items = list; else p.socials.items = list;
    });
    p.cta.href = '#';
    iconKeys(p).forEach(function (k) { icons[k] = svgFor(k); });
    p.icons = icons; p.bp = { tablet: +A.global.bp_tablet, mobile: +A.global.bp_mobile }; p.tz = 0;
    return p;
  }

  /* ============================================================ controls */

  function respBadge(isResp) {
    if (!isResp) return '';
    return '<span class="fcp-resp" title="این تنظیم برای هر دستگاه جداست">' + ICON_SVG[S.device] + '</span>';
  }
  function inherited(path) {
    if (path.indexOf('@') < 0 || S.device === 'desktop') return '';
    var parts = path.split('.@.'), map = get(S.cur, parts[0]);
    var prev = S.device === 'mobile' ? 'tablet' : 'desktop';
    var v = R.dev(map, prev)[parts[1]];
    return v === undefined ? '' : String(v);
  }
  function label(lbl, path, desc) {
    return '<div class="fcp-f__head"><label>' + lbl + respBadge(path && path.indexOf('@') > -1) + '</label></div>' + (desc ? '<p class="fcp-f__desc">' + desc + '</p>' : '');
  }
  var F = {
    text: function (path, lbl, o) {
      o = o || {};
      var v = get(S.cur, rp(path));
      return '<div class="fcp-f' + (o.wide ? ' fcp-f--wide' : '') + '">' + label(lbl, path, o.desc) +
        '<input type="text" class="fcp-in-text" data-path="' + path + '" value="' + esc(v == null ? '' : v) + '" placeholder="' + esc(o.ph || inherited(path)) + '"' + (o.ltr ? ' dir="ltr"' : '') + '></div>';
    },
    textarea: function (path, lbl, o) {
      o = o || {};
      return '<div class="fcp-f fcp-f--wide">' + label(lbl, path, o.desc) +
        '<textarea data-path="' + path + '" rows="' + (o.rows || 3) + '"' + (o.ltr ? ' dir="ltr" class="fcp-code"' : '') + ' placeholder="' + esc(o.ph || '') + '">' + esc(get(S.cur, rp(path)) || '') + '</textarea></div>';
    },
    num: function (path, lbl, o) {
      o = o || {};
      var v = get(S.cur, rp(path));
      var range = o.max != null ? '<input type="range" data-path="' + path + '" data-type="num" min="' + (o.min || 0) + '" max="' + o.max + '" step="' + (o.step || 1) + '" value="' + esc(v === '' || v == null ? (inherited(path) || o.min || 0) : v) + '">' : '';
      return '<div class="fcp-f">' + label(lbl, path, o.desc) + '<div class="fcp-num">' + range +
        '<input type="number" data-path="' + path + '" data-type="num" value="' + esc(v == null ? '' : v) + '" placeholder="' + esc(inherited(path)) + '" step="' + (o.step || 1) + '"' + (o.min != null ? ' min="' + o.min + '"' : '') + '>' +
        (o.unit ? '<span class="fcp-unit">' + o.unit + '</span>' : '') + '</div></div>';
    },
    select: function (path, lbl, opts, o) {
      o = o || {};
      var v = get(S.cur, rp(path)), inh = inherited(path);
      var html = (path.indexOf('@') > -1 && S.device !== 'desktop' ? '<option value="">— مثل ' + (S.device === 'mobile' ? 'تبلت' : 'دسکتاپ') + (inh ? ' (' + esc(optLabel(opts, inh)) + ')' : '') + ' —</option>' : '') +
        Object.keys(opts).map(function (k) { return '<option value="' + esc(k) + '"' + (String(v) === k ? ' selected' : '') + '>' + esc(opts[k]) + '</option>'; }).join('');
      return '<div class="fcp-f' + (o.wide ? ' fcp-f--wide' : '') + '">' + label(lbl, path, o.desc) + '<select data-path="' + path + '"' + (o.rerender ? ' data-rerender' : '') + (o.num ? ' data-type="num"' : '') + '>' + html + '</select></div>';
    },
    toggle: function (path, lbl, o) {
      o = o || {};
      var v = !!get(S.cur, rp(path));
      return '<div class="fcp-f fcp-f--toggle' + (o.wide ? ' fcp-f--wide' : '') + '"><label class="fcp-switch"><input type="checkbox" data-path="' + path + '" data-type="bool"' + (v ? ' checked' : '') + (o.rerender ? ' data-rerender' : '') + '><span></span></label><div><b>' + lbl + '</b>' + (o.desc ? '<p class="fcp-f__desc">' + o.desc + '</p>' : '') + '</div></div>';
    },
    color: function (path, lbl, o) {
      o = o || {};
      var v = get(S.cur, rp(path)) || '';
      var hex = /^#[0-9a-f]{6}$/i.test(v) ? v : (/^#[0-9a-f]{3}$/i.test(v) ? '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3] : '#ffffff');
      return '<div class="fcp-f fcp-f--color">' + label(lbl, path, o.desc) + '<div class="fcp-color"><span class="fcp-color__sw" style="background:' + esc(v || 'transparent') + '"><input type="color" data-color-for="' + path + '" value="' + hex + '"></span>' +
        '<input type="text" dir="ltr" data-path="' + path + '" value="' + esc(v) + '" placeholder="' + esc(o.ph || 'پیش‌فرض') + '">' +
        (o.clear ? '<button type="button" class="fcp-mini" data-clear="' + path + '" title="پاک‌کردن">×</button>' : '') + '</div></div>';
    },
    icon: function (path, lbl, o) {
      o = o || {};
      var v = get(S.cur, rp(path)) || '', def = o.def || '';
      return '<div class="fcp-f">' + label(lbl, path, o.desc) + '<div class="fcp-iconf"><button type="button" class="fcp-iconf__btn" data-pick-icon="' + path + '" data-def="' + esc(def) + '">' +
        '<span class="fcp-iconf__prev">' + (svgFor(v || def) || '?') + '</span><span>' + (v ? esc(v) : (def ? 'پیش‌فرض' : 'انتخاب آیکون')) + '</span></button>' +
        (v ? '<button type="button" class="fcp-mini" data-clear="' + path + '" title="حذف">×</button>' : '') + '</div></div>';
    },
    image: function (path, lbl, o) {
      var v = get(S.cur, rp(path)) || '';
      return '<div class="fcp-f">' + label(lbl, path, (o || {}).desc) + '<div class="fcp-imgf">' + (v ? '<img src="' + esc(v) + '">' : '') +
        '<button type="button" class="button" data-media="' + path + '">انتخاب تصویر</button>' + (v ? '<button type="button" class="fcp-mini" data-clear="' + path + '">×</button>' : '') + '</div></div>';
    },
    choice: function (path, lbl, opts, o) {
      o = o || {};
      var v = get(S.cur, rp(path));
      return '<div class="fcp-f fcp-f--wide">' + label(lbl, path, o.desc) + '<div class="fcp-choice' + (o.cls ? ' ' + o.cls : '') + '">' + Object.keys(opts).map(function (k) {
        return '<button type="button" data-choice="' + path + '" data-value="' + esc(k) + '" class="' + (String(v) === k ? 'is-on' : '') + '"' + (o.rerender ? ' data-rerender' : '') + '>' + opts[k] + '</button>';
      }).join('') + '</div></div>';
    }
  };
  function optLabel(opts, v) { return opts[v] || v; }
  function sect(title, body, o) {
    o = o || {};
    return '<section class="fcp-sect"><h3>' + title + (o.badge ? ' <span class="fcp-tag">' + o.badge + '</span>' : '') + '</h3>' + (o.desc ? '<p class="fcp-sect__desc">' + o.desc + '</p>' : '') + '<div class="fcp-grid">' + body + '</div></section>';
  }
  function devSwitch() {
    return '<div class="fcp-devs">' + ['desktop', 'tablet', 'mobile'].map(function (k) {
      return '<button type="button" data-device="' + k + '" class="' + (S.device === k ? 'is-on' : '') + '" title="' + DEV_LABEL[k] + '">' + ICON_SVG[k] + '<span>' + DEV_LABEL[k] + '</span></button>';
    }).join('') + '</div>';
  }

  /* ================================================================ tabs */

  var LAYOUTS = {
    panel: ['پنل کارت/لیست', 'پنل کامل با هدر، آیتم‌ها، شبکه‌ها و دکمه'],
    chat: ['حباب گفتگو', 'کارت چت با آواتار مشاور'],
    speeddial: ['منوی شناور', 'آیکون‌های دایره‌ای عمودی'],
    tabs: ['زبانه کناری', 'زبانه‌های چسبیده به لبه صفحه'],
    pill: ['نوار کپسولی', 'آیکون‌ها در یک کپسول'],
    cta: ['تک دکمه متنی', 'یک دکمه با آیکون و متن'],
    bubble: ['تک آیکون', 'یک دکمه دایره‌ای مستقیم'],
    bar: ['نوار تمام‌عرض', 'نوار پایین/بالای صفحه (موبایل)']
  };
  var HAS_TRIGGER = { panel: 1, chat: 1, speeddial: 1 };

  var TABS = [
    ['layout', 'قالب و چیدمان'], ['items', 'آیتم‌های تماس'], ['socials', 'شبکه‌های اجتماعی'], ['texts', 'هدر و متن‌ها'],
    ['trigger', 'دکمه اصلی'], ['position', 'موقعیت'], ['size', 'اندازه‌ها'], ['colors', 'رنگ و استایل'],
    ['display', 'شرایط نمایش'], ['advanced', 'پیشرفته']
  ];

  var T = {};

  T.layout = function () {
    var L = S.cur.layout;
    var cards = Object.keys(LAYOUTS).map(function (k) {
      return '<button type="button" class="fcp-layout' + (L === k ? ' is-on' : '') + '" data-choice="layout" data-value="' + k + '" data-rerender>' +
        '<span class="fcp-layout__art fcp-art--' + k + '"><i></i><i></i><i></i></span><b>' + LAYOUTS[k][0] + '</b><small>' + LAYOUTS[k][1] + '</small></button>';
    }).join('');
    var h = sect('نوع نمایش', '<div class="fcp-layouts fcp-f--wide">' + cards + '</div>' +
      '<div class="fcp-f--wide fcp-tplbar"><button type="button" class="button button-secondary" data-open-gallery="apply">🎨 انتخاب از ' + TPL.length + ' قالب آماده…</button><span class="fcp-f__desc">قالب‌ها رنگ، چیدمان و استایل را اعمال می‌کنند؛ می‌توانید آیتم‌های فعلی‌تان را نگه دارید.</span></div>');

    if (L === 'panel') {
      h += sect('چیدمان پنل', F.choice('opts.item_style', 'استایل آیتم‌ها', {
        card: 'کارت', row: 'لیست ساده', tinted: 'رنگی ملایم', solid: 'تمام‌رنگ', grid: 'شبکه‌ای', minimal: 'مینیمال'
      }, { rerender: true }) +
        (S.cur.opts.item_style === 'grid' ? F.num('opts.columns', 'تعداد ستون‌ها', { min: 2, max: 4 }) : '') +
        F.select('opts.close_style', 'دکمه بستن', { outside: 'مربع جدا بالای پنل', inside: 'داخل هدر', trigger: 'تبدیل دکمه اصلی به ×' }) +
        F.toggle('opts.show_value', 'نمایش شماره/مقدار زیر عنوان', { desc: 'مثل «۰۹۰۱۱۰۹۸۸۹۹» زیر «مشاوره خرید»' }) +
        F.toggle('opts.value_ltr', 'شماره‌ها چپ‌به‌راست', { desc: 'برای نمایش درست ۰۲۱-۲۲۰۱...' }) +
        F.toggle('cta.show', 'دکمه اقدام (CTA) پایین پنل', { rerender: true }));
    }
    if (L === 'chat') {
      h += sect('چیدمان گفتگو', F.select('opts.chat_mode', 'پایین کارت', { button: 'یک دکمه بزرگ', icons: 'آیکون پیام‌رسان‌ها («شروع گفتگو با…»)', list: 'لیست آیتم‌ها' }, { rerender: true }) +
        F.select('opts.close_style', 'دکمه بستن', { inside: 'داخل هدر', outside: 'مربع جدا بالای کارت', trigger: 'تبدیل دکمه اصلی به ×' }));
    }
    if (L === 'speeddial') {
      h += sect('منوی شناور', F.select('opts.dial_labels', 'برچسب کنار آیکون‌ها', { always: 'همیشه', hover: 'فقط با هاور', none: 'بدون برچسب' }) +
        F.select('opts.close_style', 'هنگام باز شدن', { trigger: 'دکمه اصلی به × تبدیل شود', inside: 'آیکون ثابت بماند' }));
    }
    if (L === 'tabs') h += sect('زبانه‌ها', F.select('opts.tabs_expand', 'نمایش عنوان', { hover: 'با هاور باز شود', always: 'همیشه باز' }));
    if (L === 'pill') h += sect('نوار کپسولی', F.toggle('opts.pill_labels', 'نمایش عنوان زیر آیکون‌ها'));
    if (L === 'bar') h += sect('نوار تمام‌عرض', F.select('opts.bar_mode', 'حالت', { icons: 'دکمه‌های مساوی با آیکون و عنوان', cta: 'یک دکمه بزرگ (CTA)' }, { rerender: true }));
    if (L === 'cta' || L === 'bar' && S.cur.opts.bar_mode === 'cta' || (L === 'panel' && S.cur.cta.show) || L === 'chat') {
      var itemOpts = { '': '— اولین آیتم تماس —' };
      (S.cur.items || []).forEach(function (it) { itemOpts[it.id] = (it.label || (A.networks[it.network] || {}).label) + ' (' + (it.value || '') + ')'; });
      h += sect('دکمه اقدام (CTA)', F.text('cta.text', 'متن دکمه') + F.icon('cta.icon', 'آیکون دکمه') +
        F.select('cta.item', 'لینک به آیتم', itemOpts) + F.text('cta.link', 'یا لینک دلخواه', { ltr: true, ph: 'https://...', desc: 'اگر پر شود، به جای آیتم استفاده می‌شود.' }));
    }
    if (L === 'bubble') h += sect('تک آیکون', '<p class="fcp-f--wide fcp-note">دکمه مستقیم به <b>اولین آیتم تماس</b> لینک می‌شود. آیکون و رنگ را در تب «دکمه اصلی» تنظیم کنید.</p>');
    return h;
  };

  function networkSelect(path, val) {
    var groups = {};
    Object.keys(A.networks).forEach(function (k) { var n = A.networks[k]; (groups[n.group] = groups[n.group] || []).push([k, n.label]); });
    return '<select data-path="' + path + '" data-rerender-item>' + Object.keys(groups).map(function (g) {
      return '<optgroup label="' + esc(g) + '">' + groups[g].map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === val ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</optgroup>';
    }).join('') + '</select>';
  }
  var KIND_HINT = {
    phone: ['شماره', '09121234567 یا 021-12345678', 'برای واتساپ/وایبر صفر اول خودکار به کد کشور تبدیل می‌شود.'],
    user: ['نام کاربری یا لینک', '@username یا لینک کامل', 'می‌توانید لینک کامل هم وارد کنید.'],
    url: ['لینک', 'https://...', ''],
    email: ['ایمیل', 'info@example.com', ''],
    text: ['آدرس یا مختصات', 'تهران، خیابان ... یا 35.7,51.4', '']
  };

  function itemRow(group, i, it) {
    var base = group + '.' + i, net = A.networks[it.network] || A.networks.custom, kind = KIND_HINT[net.kind] || KIND_HINT.url;
    var key = group + ':' + it.id, open = !!S.openItems[key];
    var msgLbl = { whatsapp: 'پیام پیش‌فرض واتساپ', sms: 'متن پیامک', email: 'موضوع ایمیل' }[it.network];
    var isSoc = group === 'socials.items';
    return '<div class="fcp-rep__item' + (open ? ' is-open' : '') + (it.enabled === false ? ' is-off' : '') + '" draggable="false" data-rep="' + group + '" data-idx="' + i + '">' +
      '<div class="fcp-rep__head" data-toggle-item="' + key + '"><span class="fcp-rep__drag" title="جابجایی">' + ICON_SVG.drag + '</span>' +
      '<span class="fcp-rep__ic" style="background:' + esc(it.color || net.color) + '">' + svgFor(it.icon || net.icon) + '</span>' +
      '<span class="fcp-rep__title"><b>' + esc(it.label || net.label) + '</b><small dir="ltr">' + esc(it.value || '—') + '</small></span>' +
      '<label class="fcp-switch fcp-switch--sm" title="فعال/غیرفعال"><input type="checkbox" data-path="' + base + '.enabled" data-type="bool"' + (it.enabled !== false ? ' checked' : '') + ' data-rerender-item><span></span></label>' +
      '<button type="button" class="fcp-mini" data-dup="' + group + '" data-idx="' + i + '" title="کپی">⧉</button>' +
      '<button type="button" class="fcp-mini fcp-mini--del" data-del="' + group + '" data-idx="' + i + '" title="حذف">🗑</button></div>' +
      (open ? '<div class="fcp-rep__body fcp-grid">' +
        '<div class="fcp-f"><div class="fcp-f__head"><label>نوع / شبکه</label></div>' + networkSelect(base + '.network', it.network) + '</div>' +
        F.text(base + '.value', kind[0], { ltr: true, ph: kind[1], desc: kind[2] }) +
        F.text(base + '.label', 'عنوان', { ph: net.label }) +
        (isSoc ? '' : F.text(base + '.sub', 'زیرعنوان (اختیاری)', { ph: 'مثلا: پاسخ زیر ۱۰ دقیقه' })) +
        (msgLbl ? F.textarea(base + '.message', msgLbl, { rows: 2 }) : '') +
        F.icon(base + '.icon', 'آیکون', { def: net.icon }) +
        F.color(base + '.color', 'رنگ پس‌زمینه آیکون', { clear: true, ph: 'از استایل کلی' }) +
        F.color(base + '.icon_color', 'رنگ آیکون', { clear: true, ph: 'از استایل کلی' }) +
        (isSoc ? '' : F.color(base + '.bg', 'رنگ پس‌زمینه کارت', { clear: true, ph: 'از استایل کلی' })) +
        F.toggle(base + '.new_tab', 'باز شدن در تب جدید') +
        '</div>' : '') + '</div>';
  }

  function repeater(group, title) {
    var list = get(S.cur, group) || [];
    return '<div class="fcp-rep" data-rep-list="' + group + '">' + (list.length ? list.map(function (it, i) { return itemRow(group, i, it); }).join('') : '<p class="fcp-empty">هنوز آیتمی اضافه نشده.</p>') + '</div>' +
      '<div class="fcp-rep__add"><select data-add-net="' + group + '"><option value="">+ افزودن ' + title + '…</option>' +
      networkSelect('', '').replace(/^<select[^>]*>/, '').replace(/<\/select>$/, '').replace(/ selected/g, '') + '</select>' +
      '<span class="fcp-f__desc">آیتم‌ها را با کشیدن جابجا کنید.</span></div>';
  }

  T.items = function () {
    var note = { tabs: 'هر آیتم یک زبانه است.', pill: 'هر آیتم یک آیکون در نوار است.', bubble: 'فقط اولین آیتم استفاده می‌شود.', cta: 'CTA به اولین آیتم (یا آیتم انتخابی) لینک می‌شود.' }[S.cur.layout];
    return sect('آیتم‌های تماس', '<div class="fcp-f--wide">' + repeater('items', 'آیتم تماس') + '</div>', { desc: note || 'تلفن، واتساپ، ایتا، بله، روبیکا، تلگرام، ایمیل، نقشه، لینک… هر تعداد که بخواهید.' });
  };
  T.socials = function () {
    return sect('ردیف شبکه‌های اجتماعی', F.toggle('socials.show', 'نمایش ردیف شبکه‌های اجتماعی پایین پنل') + F.text('socials.title', 'عنوان ردیف') +
      F.select('socials.shape', 'شکل آیکون‌ها', { rounded: 'گوشه گرد', circle: 'دایره', square: 'مربع', outline: 'دورخط' }) +
      '<div class="fcp-f--wide">' + repeater('socials.items', 'شبکه اجتماعی') + '</div>', { desc: 'این ردیف در پنل و همچنین در ویجت/شورت‌کد «فقط شبکه‌های اجتماعی» (مثلا در فوتر) نمایش داده می‌شود.' });
  };

  T.texts = function () {
    var L = S.cur.layout;
    if (L === 'chat') {
      return sect('کارت گفتگو', F.image('header.avatar', 'تصویر مشاور') + F.icon('header.icon', 'یا آیکون به جای تصویر') +
        F.text('header.agent', 'نام مشاور') + F.text('header.role', 'سمت', { ph: 'مشاور فروش' }) +
        F.textarea('header.message', 'پیام خوشامد') + F.text('header.time', 'زمان نمایشی', { ph: '10:30' }) +
        F.toggle('header.online', 'نقطه سبز «آنلاین»'));
    }
    return sect('هدر پنل', F.toggle('header.show', 'نمایش هدر', { rerender: true }) + F.text('header.title', 'عنوان') + F.text('header.subtitle', 'زیرعنوان') +
      F.icon('header.icon', 'آیکون کنار عنوان (اختیاری)'), { desc: L === 'panel' ? '' : 'هدر فقط در چیدمان «پنل» و ویجت اینلاین استفاده می‌شود.' });
  };

  T.trigger = function () {
    var L = S.cur.layout;
    if (!HAS_TRIGGER[L] && L !== 'bubble' && L !== 'cta') {
      return sect('دکمه اصلی', '<p class="fcp-note fcp-f--wide">این چیدمان دکمه باز/بستن ندارد؛ رنگ پس‌زمینه از «رنگ دکمه اصلی» در تب رنگ‌ها گرفته می‌شود.</p>');
    }
    var h = sect('آیکون و شکل', (L !== 'cta' ? F.icon('trigger.icon', 'آیکون دکمه') : '') +
      (HAS_TRIGGER[L] ? F.icon('trigger.close_icon', 'آیکون بستن', { def: 'fas:xmark' }) : '') +
      F.choice('trigger.shape', 'شکل', { circle: 'دایره', rounded: 'گوشه‌گرد', square: 'مربع', pill: 'کپسولی' }) +
      (L !== 'cta' ? F.text('trigger.label', 'متن کنار آیکون (اختیاری)', { ph: 'تماس با ما' }) + F.toggle('trigger.label_show', 'نمایش متن کنار آیکون') : '') +
      F.text('trigger.tooltip', 'متن دسترس‌پذیری (aria-label)', { ph: 'تماس با ما' }));
    h += sect('جلوه‌ها', F.toggle('trigger.pulse', 'موج تپنده دور دکمه') +
      (L !== 'cta' ? F.select('trigger.animate', 'انیمیشن آیکون', { rotate: 'چرخش هنگام باز شدن', shake: 'لرزش زنگ', bounce: 'جهش', none: 'بدون انیمیشن' }) : '') +
      F.toggle('trigger.badge_show', 'نشان اعلان (Badge)', { rerender: true }) + (S.cur.trigger.badge_show ? F.text('trigger.badge_text', 'متن نشان') : ''));
    h += sect('پیام خوشامد (حباب کنار دکمه)', F.toggle('trigger.greet_show', 'نمایش پیام خوشامد', { rerender: true }) +
      (S.cur.trigger.greet_show ? F.textarea('trigger.greet_text', 'متن پیام', { rows: 2 }) + F.num('trigger.greet_delay', 'نمایش بعد از', { min: 0, max: 60, unit: 'ثانیه' }) : ''),
      { desc: 'یک بار در هر نشست نمایش داده می‌شود و با کلیک بسته می‌شود.' });
    if (HAS_TRIGGER[L]) {
      h += sect('رفتار', F.select('trigger.open_on', 'باز شدن با', { click: 'کلیک', hover: 'هاور (فقط دسکتاپ)' }) +
        F.num('trigger.auto_open', 'باز شدن خودکار بعد از', { min: 0, max: 120, unit: 'ثانیه', desc: '۰ = غیرفعال. یک بار در هر نشست.' }) +
        F.toggle('opts.close_outside', 'بستن با کلیک بیرون پنل') + F.toggle('opts.overlay', 'تیره شدن پس‌زمینه هنگام باز بودن'));
    }
    return h;
  };

  var PLACES = {
    'top-left': '↖', 'top-center': '↑', 'top-right': '↗',
    'middle-left': '←', 'middle-center': '', 'middle-right': '→',
    'bottom-left': '↙', 'bottom-center': '↓', 'bottom-right': '↘'
  };
  T.position = function () {
    var path = 'position.@.place', cur = get(S.cur, rp(path)), inh = R.dev(S.cur.position, S.device).place;
    var grid = '<div class="fcp-place">' + Object.keys(PLACES).map(function (k) {
      if (k === 'middle-center') return '<span class="fcp-place__mid">صفحه</span>';
      return '<button type="button" data-choice="' + path + '" data-value="' + k + '" class="' + (cur === k ? 'is-on' : (!cur && inh === k ? 'is-inh' : '')) + '" title="' + k + '">' + PLACES[k] + '</button>';
    }).join('') + '</div>';
    var h = sect('محل نمایش در صفحه', '<div class="fcp-f fcp-f--wide">' + label('گوشه / لبه صفحه', path) + grid +
      (S.device !== 'desktop' ? '<button type="button" class="button-link" data-clear="' + path + '">استفاده از تنظیم ' + (S.device === 'mobile' ? 'تبلت' : 'دسکتاپ') + '</button>' : '') + '</div>' +
      F.num('position.@.x', 'فاصله افقی از لبه', { min: -50, max: 300, unit: 'px' }) +
      F.num('position.@.y', 'فاصله عمودی از لبه', { min: -50, max: 400, unit: 'px' }) +
      F.num('advanced.z', 'z-index (لایه)', { desc: 'اگر زیر هدر چسبان یا پاپ‌آپ قالب رفت، عدد را بیشتر کنید.' }),
      { desc: 'برای هر دستگاه جدا قابل تنظیم است — از دکمه‌های دسکتاپ/تبلت/موبایل بالای پیش‌نمایش استفاده کنید. ' + (S.cur.layout === 'bar' ? 'نوار تمام‌عرض فقط بالا/پایین را در نظر می‌گیرد.' : '') });
    h += sect('سازگاری با قالب', F.toggle('advanced.woodmart_offset', 'بالاتر از نوار چسبان موبایل وودمارت', { desc: 'وقتی «Sticky toolbar» وودمارت روشن است، دکمه‌ها خودکار ۶۲px بالاتر می‌روند.' }));
    return h;
  };

  T.size = function () {
    var L = S.cur.layout;
    var h = sect('دکمه و آیکون‌ها',
      F.num('size.@.trigger', HAS_TRIGGER[L] || L === 'bubble' ? 'اندازه دکمه اصلی' : 'ارتفاع دکمه‌ها', { min: 32, max: 110, unit: 'px' }) +
      F.num('size.@.icon', 'اندازه آیکون دکمه', { min: 12, max: 60, unit: 'px' }) +
      F.num('size.@.item_icon', 'اندازه باکس آیکون آیتم‌ها', { min: 24, max: 80, unit: 'px' }) +
      F.num('size.@.social', 'اندازه آیکون شبکه‌های اجتماعی', { min: 24, max: 70, unit: 'px' }));
    h += sect('پنل و متن', F.num('size.@.panel', 'عرض پنل', { min: 200, max: 560, unit: 'px' }) +
      F.num('size.@.font', 'اندازه فونت پایه', { min: 10, max: 22, unit: 'px' }) +
      F.num('size.@.title', 'اندازه عنوان هدر', { min: 12, max: 30, unit: 'px' }) +
      F.num('size.@.radius', 'گردی گوشه‌ها', { min: 0, max: 40, unit: 'px' }) +
      F.num('size.@.gap', 'فاصله بین آیتم‌ها', { min: 0, max: 30, unit: 'px' }) +
      F.num('style.border_width', 'ضخامت حاشیه آیتم‌ها', { min: 0, max: 4, unit: 'px' }));
    return sect('', '<p class="fcp-note fcp-f--wide">' + ICON_SVG[S.device] + ' در حال ویرایش برای <b>' + DEV_LABEL[S.device] + '</b>. فیلد خالی در تبلت/موبایل یعنی همان مقدار دستگاه بزرگ‌تر.</p>') + h;
  };

  T.colors = function () {
    var presets = [
      ['#0b4a7a', '#22c55e', '#2f3e4c', '#f5c518'], ['#0f2a5f', '#0f2a5f', '#0f2a5f', '#ffffff'], ['#b8935f', '#0f5b36', '#1f1b17', '#c9a46b'],
      ['#075e54', '#25d366', '#075e54', '#ffffff'], ['#e11d48', '#e11d48', '#e11d48', '#ffffff'], ['#4f46e5', '#4f46e5', '#eef2ff', '#4f46e5'],
      ['#111827', '#111827', '#111827', '#ffffff'], ['#ef7f1a', '#ef7f1a', '#fff3e6', '#ef7f1a']
    ];
    var pal = '<div class="fcp-palettes fcp-f--wide">' + presets.map(function (p, i) {
      return '<button type="button" data-palette="' + i + '" title="اعمال پالت">' + p.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</button>';
    }).join('') + '</div>';
    w._fcpPalettes = presets;
    var h = sect('پالت سریع', pal);
    h += sect('دکمه اصلی', F.color('colors.trigger_bg', 'پس‌زمینه دکمه / نوار') + F.color('colors.trigger_color', 'رنگ آیکون دکمه') +
      F.color('colors.close_bg', 'پس‌زمینه دکمه بستن') + F.color('colors.close_color', 'رنگ آیکون بستن') + F.color('colors.badge_bg', 'رنگ نشان اعلان'));
    h += sect('پنل و هدر', F.color('colors.panel_bg', 'پس‌زمینه پنل') + F.color('colors.header_bg', 'پس‌زمینه هدر') +
      F.color('colors.header_bg2', 'رنگ دوم گرادینت هدر') + F.color('colors.header_text', 'متن هدر') + F.toggle('style.gradient', 'هدر گرادینت'));
    h += sect('آیتم‌ها', F.color('colors.item_bg', 'پس‌زمینه کارت آیتم') + F.color('colors.item_border', 'حاشیه / خط جداکننده') +
      F.color('colors.item_title', 'رنگ عنوان آیتم') + F.color('colors.item_value', 'رنگ شماره / مقدار') +
      F.color('colors.icon_bg', 'پس‌زمینه باکس آیکون') + F.color('colors.icon_color', 'رنگ آیکون') +
      F.toggle('style.network_colors', 'رنگ برند هر شبکه', { desc: 'آیکون واتساپ سبز، تلگرام آبی، ایتا نارنجی… (به جای رنگ یکسان)' }));
    h += sect('شبکه‌ها، دکمه CTA و برچسب‌ها', F.color('colors.social_bg', 'پس‌زمینه آیکون شبکه‌ها') + F.color('colors.social_color', 'رنگ آیکون شبکه‌ها') +
      F.color('colors.cta_bg', 'پس‌زمینه CTA') + F.color('colors.cta_color', 'متن CTA') + F.color('colors.label_bg', 'پس‌زمینه برچسب منوی شناور') + F.color('colors.label_color', 'متن برچسب منوی شناور'));
    h += sect('استایل کلی', F.select('style.shadow', 'سایه', { none: 'بدون سایه', sm: 'کم', md: 'متوسط', lg: 'زیاد', xl: 'خیلی زیاد' }) +
      F.select('style.animation', 'انیمیشن باز شدن', { slide: 'لغزش', scale: 'بزرگ‌نمایی', fade: 'محو', none: 'بدون انیمیشن' }) +
      F.toggle('style.glass', 'افکت شیشه‌ای (Glass)') + F.toggle('style.persian_digits', 'نمایش اعداد فارسی', { desc: '۰۹۱۲… به جای 0912… (لینک‌ها تغییری نمی‌کنند)' }) +
      F.select('style.dir', 'جهت متن', { rtl: 'راست به چپ', ltr: 'چپ به راست' }) +
      F.text('style.font', 'فونت', { ph: 'inherit', desc: 'inherit = فونت قالب/المنتور. یا نام فونت مثل IRANYekanX, Vazirmatn' }));
    return h;
  };

  T.display = function () {
    var dsp = S.cur.display;
    var types = A.ruleTypes, rows = (dsp.rules || []).map(function (r, i) {
      var needs = ['post_type', 'ids', 'terms', 'url'].indexOf(r.type) > -1;
      return '<div class="fcp-rule"><select data-path="display.rules.' + i + '.mode"><option value="include"' + (r.mode === 'include' ? ' selected' : '') + '>نمایش در</option><option value="exclude"' + (r.mode === 'exclude' ? ' selected' : '') + '>عدم نمایش در</option></select>' +
        '<select data-path="display.rules.' + i + '.type" data-rerender>' + Object.keys(types).filter(function (k) { return A.woo || k.indexOf('woo_') !== 0; }).map(function (k) { return '<option value="' + k + '"' + (r.type === k ? ' selected' : '') + '>' + esc(types[k]) + '</option>'; }).join('') + '</select>' +
        (needs ? '<div class="fcp-rule__val"><input type="text" data-path="display.rules.' + i + '.value" value="' + esc(r.value) + '" placeholder="' + ({ post_type: 'page, product', ids: 'شناسه‌ها: 12, 45', terms: 'شناسه دسته‌ها: 7, 9', url: '/product-category/' })[r.type] + '" dir="ltr">' +
          ((r.type === 'ids' || r.type === 'terms') ? '<input type="search" class="fcp-rule__search" data-rule-search="' + i + '" placeholder="🔍 جستجوی عنوان…"><div class="fcp-rule__res"></div>' : '') + '</div>' : '') +
        '<button type="button" class="fcp-mini fcp-mini--del" data-del-rule="' + i + '">×</button></div>';
    }).join('');
    var days = [[6, 'شنبه'], [0, 'یکشنبه'], [1, 'دوشنبه'], [2, 'سه‌شنبه'], [3, 'چهارشنبه'], [4, 'پنجشنبه'], [5, 'جمعه']];
    var h = sect('دستگاه‌ها', ['desktop', 'tablet', 'mobile'].map(function (k) { return F.toggle('display.' + k, 'نمایش در ' + DEV_LABEL[k]); }).join(''),
      { desc: 'با CSS انجام می‌شود، پس با کش صفحه (WP Rocket، LiteSpeed…) هم درست کار می‌کند. محدوده‌ها از «تنظیمات کلی» قابل تغییر است.' });
    h += sect('صفحات', '<div class="fcp-f--wide"><div class="fcp-rules">' + (rows || '<p class="fcp-empty">بدون قانون = نمایش در کل سایت</p>') + '</div><button type="button" class="button" data-add-rule>+ افزودن قانون</button></div>',
      { desc: 'قوانین «عدم نمایش» بر «نمایش» اولویت دارند. مثال: نمایش در کل سایت + عدم نمایش در تسویه حساب.' });
    h += sect('کاربران و زمان‌بندی ظاهر شدن', F.select('display.users', 'نمایش برای', { all: 'همه', guests: 'فقط مهمان‌ها', logged: 'فقط کاربران وارد شده' }) +
      F.num('display.delay', 'ظاهر شدن بعد از', { min: 0, max: 60, unit: 'ثانیه' }) + F.num('display.scroll', 'یا بعد از اسکرول', { min: 0, max: 100, unit: '٪' }) +
      F.toggle('display.hide_in_editor', 'مخفی در ویرایشگر المنتور'));
    h += sect('ساعات کاری', F.toggle('display.sched_on', 'فقط در ساعات کاری فعال باشد', { rerender: true, wide: true }) + (dsp.sched_on ?
      '<div class="fcp-f fcp-f--wide"><div class="fcp-f__head"><label>روزهای کاری</label></div><div class="fcp-days">' + days.map(function (dd) {
        return '<label><input type="checkbox" data-day="' + dd[0] + '"' + ((dsp.sched_days || []).indexOf(dd[0]) > -1 ? ' checked' : '') + '><span>' + dd[1] + '</span></label>';
      }).join('') + '</div></div>' +
      '<div class="fcp-f"><div class="fcp-f__head"><label>از ساعت</label></div><input type="time" data-path="display.sched_from" value="' + esc(dsp.sched_from) + '"></div>' +
      '<div class="fcp-f"><div class="fcp-f__head"><label>تا ساعت</label></div><input type="time" data-path="display.sched_to" value="' + esc(dsp.sched_to) + '"></div>' +
      F.select('display.sched_outside', 'خارج از ساعت کاری', { hide: 'کاملا مخفی شود', note: 'نمایش + پیام «خارج از ساعت کاری»' }, { rerender: true }) +
      (dsp.sched_outside === 'note' ? F.textarea('display.sched_note', 'پیام خارج از ساعت کاری', { rows: 2 }) + F.toggle('', 'پیش‌نمایش حالت خارج از ساعت', {}).replace('data-path=""', 'data-preview-offline' + (S.previewOffline ? ' checked' : '')) : '')
      : ''), { desc: 'بر اساس منطقه زمانی وردپرس (تنظیمات › عمومی) محاسبه می‌شود.' });
    return h;
  };

  T.advanced = function () {
    var id = S.cur.id;
    var sc = function (part) { return '[fcp id="' + id + '"' + (part ? ' part="' + part + '"' : '') + ']'; };
    var h = sect('نمایش در فوتر یا هر جای دیگر (اینلاین)', '<div class="fcp-f--wide fcp-codes">' +
      [['کل پنل', sc('')], ['فقط آیتم‌های تماس', sc('items')], ['فقط شبکه‌های اجتماعی (مناسب فوتر)', sc('socials')], ['شبکه‌ها – وسط‌چین', sc('socials').replace(']', ' align="center"]')]].map(function (r) {
        return '<div><span>' + r[0] + '</span><code dir="ltr">' + esc(r[1]) + '</code><button type="button" class="fcp-mini" data-copy="' + esc(r[1]) + '">کپی</button></div>';
      }).join('') + '<p class="fcp-f__desc">در المنتور هم ویجت «دکمه‌های تماس / شبکه‌های اجتماعی» را در هدر/فوتر (Theme Builder) بکشید. در وودمارت داخل «HTML Block» یا ستون فوتر، شورت‌کد را قرار دهید.</p></div>');
    h += sect('ردیابی', F.toggle('advanced.analytics', 'ارسال رویداد کلیک به Google Analytics / Tag Manager', { desc: 'رویداد dataLayer با نام fcp_click و رویداد gtag با نام contact_click (شامل نوع شبکه و عنوان).' }));
    h += sect('CSS سفارشی', F.text('advanced.class', 'کلاس CSS اضافه', { ltr: true }) + F.textarea('advanced.custom_css', 'کد CSS', { rows: 6, ltr: true, ph: '#fcp-' + id + ' .fcp-trig { … }' }));
    h += sect('ابزارها', '<div class="fcp-f--wide fcp-tools"><button type="button" class="button" data-export>⬇ خروجی JSON این ویجت</button><button type="button" class="button" data-dup-instance>⧉ ساخت کپی از این ویجت</button><button type="button" class="button fcp-danger" data-delete-instance>🗑 حذف ویجت</button></div>');
    return h;
  };

  /* ============================================================== views */

  function render() {
    if (S.view === 'list') return renderList();
    renderEditor();
  }

  function renderList() {
    var cards = S.list.map(function (inst) {
      return '<div class="fcp-icard"><div class="fcp-icard__prev" data-mini="' + inst.id + '"></div><div class="fcp-icard__body">' +
        '<div class="fcp-icard__top"><b>' + esc(inst.name) + '</b><label class="fcp-switch fcp-switch--sm" title="فعال/غیرفعال"><input type="checkbox" data-quick-toggle="' + inst.id + '"' + (inst.enabled ? ' checked' : '') + '><span></span></label></div>' +
        '<small>' + esc((LAYOUTS[inst.layout] || [''])[0]) + ' · ' + (inst.items || []).length + ' آیتم · <code dir="ltr">' + esc(inst.id) + '</code></small>' +
        '<div class="fcp-icard__act"><button type="button" class="button button-primary" data-edit="' + inst.id + '">ویرایش</button>' +
        '<button type="button" class="button" data-copy="[fcp id=&quot;' + inst.id + '&quot; part=&quot;socials&quot;]">کپی شورت‌کد</button></div></div></div>';
    }).join('');
    app.innerHTML = '<div class="fcp-top"><div class="fcp-brand"><span class="fcp-logo">' + svgFor('fas:phone-volume') + '</span><div><h1>دکمه‌های تماس شناور</h1><p>نسخه ' + A.version + '</p></div></div>' +
      '<div class="fcp-top__act"><button type="button" class="button" data-global>⚙ تنظیمات کلی</button><button type="button" class="button" data-import>⬆ درون‌ریزی</button>' +
      '<button type="button" class="button button-primary button-hero" data-open-gallery="new">+ ساخت دکمه تماس جدید</button></div></div>' +
      (S.list.length ? '<div class="fcp-icards">' + cards + '</div>' :
        '<div class="fcp-welcome"><h2>اولین دکمه تماس را بسازید 👋</h2><p>از بین ' + TPL.length + ' قالب آماده انتخاب کنید و همه‌چیز را شخصی‌سازی کنید: آیتم‌ها، آیکون‌ها، رنگ‌ها، موقعیت و اندازه برای هر دستگاه و شرایط نمایش.</p><button type="button" class="button button-primary button-hero" data-open-gallery="new">انتخاب قالب</button></div>');
    S.list.forEach(function (inst) {
      ensureIcons(inst).then(function () { mountMini($('[data-mini="' + inst.id + '"]'), inst, 0.4); });
    });
  }

  function mountMini(box, inst, scale) {
    if (!box) return;
    box.innerHTML = '<div class="fcp-stage fcp-stage--mini" style="transform:scale(' + scale + ')"><div class="fcp-fake"><i></i><i></i><i></i><b></b><b></b></div></div>';
    var el = R.render(payload(inst), { mode: 'preview', device: 'desktop', open: true });
    if (el) box.firstChild.appendChild(el);
  }

  function renderEditor() {
    var c = S.cur;
    app.innerHTML = '<div class="fcp-ed">' +
      '<div class="fcp-ed__bar"><button type="button" class="button" data-back>→ بازگشت</button>' +
      '<input type="text" class="fcp-ed__name" data-path="name" value="' + esc(c.name) + '">' +
      '<label class="fcp-switch" title="فعال"><input type="checkbox" data-path="enabled" data-type="bool"' + (c.enabled ? ' checked' : '') + '><span></span></label><span class="fcp-ed__state">' + (c.enabled ? 'فعال' : 'غیرفعال') + '</span>' +
      '<span class="fcp-ed__sp"></span><span class="fcp-ed__dirty">' + (S.dirty ? 'تغییرات ذخیره نشده' : '') + '</span>' +
      '<button type="button" class="button button-primary button-large" data-save>' + (S.saving ? 'در حال ذخیره…' : 'ذخیره تغییرات') + '</button></div>' +
      '<div class="fcp-ed__main"><div class="fcp-ed__side"><nav class="fcp-tabs-nav">' + TABS.map(function (t) {
        return '<button type="button" data-tab="' + t[0] + '" class="' + (S.tab === t[0] ? 'is-on' : '') + '">' + t[1] + '</button>';
      }).join('') + '</nav><div class="fcp-ed__panel" id="fcp-panel"></div></div>' +
      '<div class="fcp-ed__prev"><div class="fcp-prevbar">' + devSwitch() +
      '<button type="button" class="button" data-preview-toggle>' + (S.previewOpen ? 'نمایش بسته' : 'نمایش باز') + '</button></div>' +
      '<div class="fcp-prevwrap" id="fcp-prevwrap"></div><p class="fcp-f__desc fcp-prevnote">پیش‌نمایش زنده — لینک‌ها در این حالت غیرفعال‌اند.</p></div></div></div>';
    renderPanel();
    renderPreview();
  }

  function renderPanel() {
    var p = $('#fcp-panel'); if (!p) return;
    var top = p.scrollTop;
    p.innerHTML = (T[S.tab] || T.layout)();
    p.scrollTop = top;
  }

  var renderPreview = function () {
    var wrap = $('#fcp-prevwrap'); if (!wrap || !S.cur) return;
    var dims = { desktop: [1100, 640], tablet: [800, 900], mobile: [390, 760] }[S.device];
    var avail = wrap.clientWidth || 600;
    var scale = Math.min(1, avail / dims[0]);
    wrap.style.height = Math.round(dims[1] * scale) + 'px';
    var inst = S.cur;
    ensureIcons(inst).then(function () {
      wrap.innerHTML = '<div class="fcp-stage fcp-stage--' + S.device + '" style="width:' + dims[0] + 'px;height:' + dims[1] + 'px;transform:scale(' + scale + ')"><div class="fcp-fake"><i></i><i></i><i></i><b></b><b></b><b></b></div></div>';
      var hidden = inst.display[S.device] === false;
      var el = R.render(payload(inst), { mode: 'preview', device: S.device, open: S.previewOpen, forceOffline: S.previewOffline });
      if (hidden) wrap.firstChild.insertAdjacentHTML('beforeend', '<div class="fcp-hiddenmsg">این ویجت در ' + DEV_LABEL[S.device] + ' مخفی است</div>');
      if (el) {
        if (hidden) el.style.opacity = '.25';
        wrap.firstChild.appendChild(el);
        var ctl = R.bind(el, payload(inst), false);
        el.addEventListener('click', function (e) {
          var a = e.target.closest('a'); if (a) e.preventDefault();
          setTimeout(function () { S.previewOpen = el.classList.contains('is-open'); var b = $('[data-preview-toggle]'); if (b) b.textContent = S.previewOpen ? 'نمایش بسته' : 'نمایش باز'; }, 0);
        });
        if (inst.trigger.greet_show && !S.previewOpen) el.classList.add('greet-on');
      }
    });
  };
  var previewSoon = debounce(function () { renderPreview(); }, 120);

  function markDirty() {
    S.dirty = true;
    var el = $('.fcp-ed__dirty'); if (el) el.textContent = 'تغییرات ذخیره نشده';
  }

  /* ============================================================ gallery */

  function openGallery(mode) {
    var cat = 'all';
    var keep = mode === 'apply';
    var m = modal('<div class="fcp-gal__top"><h2>' + (mode === 'apply' ? 'اعمال قالب آماده' : 'یک قالب انتخاب کنید') + '</h2>' +
      '<div class="fcp-gal__cats">' + Object.keys(CATS).map(function (k) { return '<button type="button" data-cat="' + k + '" class="' + (k === 'all' ? 'is-on' : '') + '">' + CATS[k] + '</button>'; }).join('') + '</div>' +
      (mode === 'apply' ? '<label class="fcp-keep"><input type="checkbox" id="fcp-keep" checked> آیتم‌ها و متن‌های فعلی من حفظ شود</label>' : '') +
      (mode === 'new' ? '<button type="button" class="button" data-blank>شروع از صفر</button>' : '') + '</div><div class="fcp-gal" id="fcp-gal"></div>', 'fcp-modal--wide');
    Promise.all([loadPack('fas'), loadPack('fab'), loadPack('efa')]).then(function () {
      var draw = function () {
        var g = $('#fcp-gal', m); g.innerHTML = '';
        TPL.filter(function (t) { return cat === 'all' || t.cat === cat; }).forEach(function (t) {
          var card = d.createElement('button'); card.type = 'button'; card.className = 'fcp-gal__card'; card.setAttribute('data-tpl', t.key);
          card.innerHTML = '<div class="fcp-gal__prev"></div><span>' + esc(t.name) + '</span>';
          g.appendChild(card);
          var inst = deepMerge(clone(A.defaults), t.cfg); inst.id = 'tpl' + t.key.replace(/\W/g, '');
          mountMini(card.firstChild, inst, 0.36);
        });
      };
      draw();
      m.addEventListener('click', function (e) {
        var c = e.target.closest('[data-cat]');
        if (c) { cat = c.getAttribute('data-cat'); $$('[data-cat]', m).forEach(function (b) { b.classList.toggle('is-on', b === c); }); draw(); return; }
        var b = e.target.closest('[data-blank]');
        if (b) { closeModal(m); newInstance(null); return; }
        var t = e.target.closest('[data-tpl]');
        if (!t) return;
        var tpl = TPL.filter(function (x) { return x.key === t.getAttribute('data-tpl'); })[0];
        closeModal(m);
        if (mode === 'new') newInstance(tpl);
        else applyTemplate(tpl, $('#fcp-keep') ? $('#fcp-keep').checked : keep);
      });
    });
  }

  function freshIds(list) { return (list || []).map(function (it) { it.id = uid('i'); return it; }); }

  function newInstance(tpl) {
    var inst = clone(A.defaults);
    if (tpl) deepMerge(inst, clone(tpl.cfg));
    else inst.items = [Object.assign(clone(A.itemDef), { network: 'phone', label: 'تماس با ما', value: '' })];
    inst.id = 'fcp' + Math.random().toString(36).slice(2, 8);
    inst.name = tpl ? tpl.name : 'دکمه تماس جدید';
    inst.items = freshIds(inst.items); inst.socials.items = freshIds(inst.socials.items);
    S.cur = inst; S.view = 'editor'; S.tab = 'items'; S.dirty = true; S.previewOpen = true; S.openItems = {};
    if (inst.items[0]) S.openItems['items:' + inst.items[0].id] = true;
    render();
    toast('قالب انتخاب شد — شماره‌ها و آیدی‌ها را با اطلاعات خودتان جایگزین کنید.');
  }

  function applyTemplate(tpl, keep) {
    var old = S.cur, inst = deepMerge(clone(A.defaults), clone(tpl.cfg));
    inst.id = old.id; inst.name = old.name; inst.enabled = old.enabled; inst.display = old.display; inst.advanced = Object.assign({}, inst.advanced, { custom_css: old.advanced.custom_css, class: old.advanced.class });
    if (keep) {
      inst.items = old.items; inst.socials = Object.assign(inst.socials, { items: old.socials.items, title: old.socials.title });
      inst.header = Object.assign({}, inst.header, { title: old.header.title, subtitle: old.header.subtitle, agent: old.header.agent || inst.header.agent, message: old.header.message || inst.header.message, avatar: old.header.avatar });
      inst.cta.text = old.cta.text || inst.cta.text; inst.cta.link = old.cta.link; inst.cta.item = old.cta.item;
    } else { inst.items = freshIds(inst.items); inst.socials.items = freshIds(inst.socials.items); }
    S.cur = inst; markDirty(); render(); toast('قالب «' + tpl.name + '» اعمال شد');
  }

  /* ============================================================ modals */

  function modal(html, cls) {
    var m = d.createElement('div'); m.className = 'fcp-modal ' + (cls || '');
    m.innerHTML = '<div class="fcp-modal__box" dir="rtl"><button type="button" class="fcp-modal__x" data-modal-close>×</button>' + html + '</div>';
    d.body.appendChild(m);
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('[data-modal-close]')) closeModal(m); });
    setTimeout(function () { m.classList.add('is-in'); }, 10);
    return m;
  }
  function closeModal(m) { m.classList.remove('is-in'); setTimeout(function () { m.remove(); }, 200); }

  /* icon picker */
  var PICK_TABS = [['fas', 'Font Awesome توپر'], ['far', 'Font Awesome خطی'], ['fab', 'برندها'], ['efa', 'آیکون‌های ایرانی'], ['cus', 'آیکون‌های من']];
  var SEARCH = null;
  function openIconPicker(path, cb) {
    var pack = 'fab', q = '', limit = 240;
    var curVal = get(S.cur, path) || '';
    if (curVal) { var cp = curVal.split(':')[0]; if (['fas', 'far', 'fab', 'efa', 'cus'].indexOf(cp) > -1) pack = cp; }
    var m = modal('<div class="fcp-pick"><div class="fcp-pick__top"><h2>انتخاب آیکون</h2><input type="search" placeholder="جستجو: phone, whatsapp, تلفن، ایتا…" class="fcp-pick__q" autofocus></div>' +
      '<div class="fcp-pick__tabs">' + PICK_TABS.map(function (t) { return '<button type="button" data-pack="' + t[0] + '" class="' + (t[0] === pack ? 'is-on' : '') + '">' + t[1] + '</button>'; }).join('') +
      '<button type="button" data-media-icon class="fcp-pick__media">🖼 تصویر از رسانه</button></div><div class="fcp-pick__grid"></div></div>', 'fcp-modal--wide');
    var grid = $('.fcp-pick__grid', m);
    var FA_SYN = { 'تلفن': 'phone', 'تماس': 'phone', 'ایمیل': 'envelope', 'نقشه': 'map', 'آدرس': 'location', 'پیام': 'comment', 'چت': 'comment', 'سبد': 'cart', 'خرید': 'cart', 'پشتیبانی': 'headset', 'ساعت': 'clock', 'کاربر': 'user', 'خانه': 'house', 'سوال': 'question', 'دانلود': 'download', 'ارسال': 'truck', 'تلگرام': 'telegram', 'واتساپ': 'whatsapp', 'اینستاگرام': 'instagram' };
    function draw() {
      if (pack === 'cus') return drawCustom();
      grid.innerHTML = '<p class="fcp-empty">در حال بارگذاری…</p>';
      Promise.all([loadPack(pack), SEARCH ? SEARCH : (SEARCH = fetch(A.iconsUrl + 'search.json?v=' + A.version).then(function (r) { return r.json(); }).then(function (j) { SEARCH = j; return j; }))]).then(function () {
        var names = Object.keys(PACKS[pack]);
        var qq = q.trim().toLowerCase(); if (FA_SYN[qq]) qq = FA_SYN[qq];
        if (qq) names = names.filter(function (n) { var s = SEARCH[pack === 'efa' ? 'efa:' + n : n] || ''; return n.indexOf(qq) > -1 || s.indexOf(qq) > -1; });
        var total = names.length;
        grid.innerHTML = names.slice(0, limit).map(function (n) {
          var k = pack + ':' + n;
          return '<button type="button" data-icon="' + k + '" class="' + (k === curVal ? 'is-on' : '') + '" title="' + esc(n) + '">' + svgFor(k) + '<small>' + esc(n) + '</small></button>';
        }).join('') + (total > limit ? '<button type="button" class="fcp-pick__more" data-more>نمایش بیشتر (' + (total - limit) + ')</button>' : '') + (!total ? '<p class="fcp-empty">آیکونی پیدا نشد.</p>' : '');
      });
    }
    function drawCustom() {
      var lib = A.custom;
      grid.innerHTML = '<div class="fcp-cus"><div class="fcp-cus__add"><textarea dir="ltr" placeholder="&lt;svg ...&gt;...&lt;/svg&gt; — کد SVG را اینجا بچسبانید" rows="3"></textarea>' +
        '<input type="text" placeholder="نام آیکون"><label class="button">آپلود فایل SVG<input type="file" accept=".svg,image/svg+xml" hidden></label><button type="button" class="button button-primary" data-cus-save>افزودن به کتابخانه</button>' +
        '<p class="fcp-f__desc">SVG ها ایمن‌سازی می‌شوند (اسکریپت و لینک خارجی حذف می‌شود). برای هم‌رنگ شدن با تنظیمات، از fill="currentColor" استفاده کنید.</p></div>' +
        '<div class="fcp-pick__grid2">' + Object.keys(lib).map(function (id) {
          return '<div class="fcp-cus__it"><button type="button" data-icon="cus:' + id + '">' + svgFor('cus:' + id) + '<small>' + esc(lib[id].name) + '</small></button><button type="button" class="fcp-mini fcp-mini--del" data-cus-del="' + id + '">×</button></div>';
        }).join('') + '</div></div>';
      var file = $('input[type=file]', grid);
      file.addEventListener('change', function () {
        var f = file.files[0]; if (!f) return;
        var r = new FileReader(); r.onload = function () { $('textarea', grid).value = r.result; $('input[type=text]', grid).value = f.name.replace(/\.svg$/i, ''); }; r.readAsText(f);
      });
    }
    var qIn = $('.fcp-pick__q', m);
    qIn.addEventListener('input', debounce(function () { q = qIn.value; limit = 240; if (pack === 'cus') pack = 'fas'; syncTabs(); draw(); }, 200));
    function syncTabs() { $$('[data-pack]', m).forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-pack') === pack); }); }
    m.addEventListener('click', function (e) {
      var t;
      if ((t = e.target.closest('[data-pack]'))) { pack = t.getAttribute('data-pack'); limit = 240; syncTabs(); draw(); return; }
      if (e.target.closest('[data-more]')) { limit += 400; draw(); return; }
      if ((t = e.target.closest('[data-icon]'))) { cb(t.getAttribute('data-icon')); closeModal(m); return; }
      if (e.target.closest('[data-media-icon]')) {
        mediaPick(function (url) { cb('img:' + url); closeModal(m); }, ['image']); return;
      }
      if (e.target.closest('[data-cus-save]')) {
        var svg = $('textarea', grid).value, name = $('input[type=text]', grid).value || 'icon';
        ajax('icon_add', { svg: svg, name: name }).then(function (r) {
          if (!r.success) return toast(r.data && r.data.message || 'خطا', 'err');
          A.custom[r.data.id] = r.data.icon; drawCustom(); toast('آیکون اضافه شد');
        }); return;
      }
      if ((t = e.target.closest('[data-cus-del]'))) {
        if (!confirm('این آیکون از کتابخانه حذف شود؟')) return;
        var id = t.getAttribute('data-cus-del');
        ajax('icon_delete', { id: id }).then(function () { delete A.custom[id]; drawCustom(); });
      }
    });
    draw();
  }

  function mediaPick(cb, types) {
    if (!w.wp || !w.wp.media) return toast('کتابخانه رسانه در دسترس نیست', 'err');
    var frame = w.wp.media({ title: 'انتخاب تصویر', multiple: false, library: { type: types || ['image'] } });
    frame.on('select', function () { var a = frame.state().get('selection').first().toJSON(); cb(a.url); });
    frame.open();
  }

  function openGlobal() {
    var g = A.global;
    var m = modal('<h2>تنظیمات کلی</h2><div class="fcp-grid">' +
      '<div class="fcp-f"><div class="fcp-f__head"><label>کد کشور پیش‌فرض</label></div><input type="text" dir="ltr" id="g-cc" value="' + esc(g.country_code) + '"><p class="fcp-f__desc">برای تبدیل 0912… به 98912… در واتساپ و وایبر.</p></div>' +
      '<div class="fcp-f"><div class="fcp-f__head"><label>حداکثر عرض تبلت</label></div><input type="number" id="g-bt" value="' + esc(g.bp_tablet) + '"><p class="fcp-f__desc">پیش‌فرض المنتور: 1024</p></div>' +
      '<div class="fcp-f"><div class="fcp-f__head"><label>حداکثر عرض موبایل</label></div><input type="number" id="g-bm" value="' + esc(g.bp_mobile) + '"><p class="fcp-f__desc">پیش‌فرض المنتور: 767</p></div>' +
      '</div><p><button type="button" class="button button-primary" id="g-save">ذخیره</button></p>');
    $('#g-save', m).addEventListener('click', function () {
      var ng = { country_code: $('#g-cc', m).value, bp_tablet: $('#g-bt', m).value, bp_mobile: $('#g-bm', m).value };
      ajax('global', { global: ng }).then(function (r) { if (r.success) { A.global = r.data.global; toast('ذخیره شد'); closeModal(m); } });
    });
  }

  function importJson() {
    var inp = d.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = function () {
      var f = inp.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var data = JSON.parse(r.result);
          var inst = deepMerge(clone(A.defaults), data.fcp || data);
          inst.id = 'fcp' + Math.random().toString(36).slice(2, 8);
          inst.name = (inst.name || 'درون‌ریزی') + ' (درون‌ریزی)';
          S.cur = inst; S.view = 'editor'; S.dirty = true; S.tab = 'layout'; render();
          toast('درون‌ریزی شد — برای ثبت، ذخیره کنید.');
        } catch (e) { toast('فایل JSON معتبر نیست', 'err'); }
      };
      r.readAsText(f);
    };
    inp.click();
  }

  /* ============================================================== save */

  function save() {
    if (S.saving) return;
    S.saving = true; var btn = $('[data-save]'); if (btn) btn.textContent = 'در حال ذخیره…';
    ajax('save', { instance: S.cur }).then(function (r) {
      S.saving = false;
      if (!r.success) { toast((r.data && r.data.message) || 'ذخیره نشد', 'err'); if (btn) btn.textContent = 'ذخیره تغییرات'; return; }
      var saved = r.data.instance, found = false;
      S.list = S.list.map(function (i) { if (i.id === saved.id) { found = true; return saved; } return i; });
      if (!found) S.list.push(saved);
      // keep the editor's object (and UI state) but adopt server-sanitised values
      S.cur = saved; S.dirty = false;
      renderEditor();
      toast('ذخیره شد ✓ (کش صفحات پاک شد)');
    }).catch(function () { S.saving = false; toast('خطای ارتباط با سرور', 'err'); if (btn) btn.textContent = 'ذخیره تغییرات'; });
  }

  /* ============================================================ events */

  function readInput(el) {
    var t = el.getAttribute('data-type'), path = rp(el.getAttribute('data-path'));
    var v;
    if (t === 'bool') v = el.checked;
    else if (t === 'num') v = el.value === '' ? (/\.(tablet|mobile)\./.test(path) ? '' : 0) : +el.value;
    else v = el.value;
    if (path === 'display.rules') return;
    set(S.cur, path, v);
    return path;
  }

  app.addEventListener('input', function (e) {
    var el = e.target;
    if (el.hasAttribute('data-color-for')) {
      var p = el.getAttribute('data-color-for'); set(S.cur, rp(p), el.value);
      var txt = el.closest('.fcp-color').querySelector('input[type=text]'); txt.value = el.value;
      el.parentNode.style.background = el.value; markDirty(); previewSoon(); return;
    }
    if (el.hasAttribute('data-rule-search')) { ruleSearch(el); return; }
    if (!el.hasAttribute('data-path') || el.type === 'checkbox' || el.tagName === 'SELECT') return;
    readInput(el); markDirty(); previewSoon();
    // sync range <-> number
    if (el.type === 'range' || el.type === 'number') {
      var twin = el.parentNode.querySelector(el.type === 'range' ? 'input[type=number]' : 'input[type=range]');
      if (twin) twin.value = el.value;
    }
    if (el.closest('.fcp-color')) el.closest('.fcp-color').querySelector('.fcp-color__sw').style.background = el.value || 'transparent';
    if (el.getAttribute('data-path') === 'name') { /* nothing */ }
    var item = el.closest('.fcp-rep__item');
    if (item && /\.(label|value)$/.test(el.getAttribute('data-path'))) {
      var arr = get(S.cur, item.getAttribute('data-rep'))[+item.getAttribute('data-idx')];
      var net = A.networks[arr.network] || {};
      item.querySelector('.fcp-rep__title b').textContent = arr.label || net.label;
      item.querySelector('.fcp-rep__title small').textContent = arr.value || '—';
    }
  });

  app.addEventListener('change', function (e) {
    var el = e.target;
    if (el.hasAttribute('data-preview-offline')) { S.previewOffline = el.checked; renderPreview(); return; }
    if (el.hasAttribute('data-quick-toggle')) {
      var inst = S.list.filter(function (i) { return i.id === el.getAttribute('data-quick-toggle'); })[0];
      inst.enabled = el.checked;
      ajax('save', { instance: inst }).then(function (r) { toast(r.success ? (inst.enabled ? 'فعال شد' : 'غیرفعال شد') : 'خطا', r.success ? 'ok' : 'err'); });
      return;
    }
    if (el.hasAttribute('data-add-net')) {
      var grp = el.getAttribute('data-add-net'), net = el.value; if (!net) return;
      var it = Object.assign(clone(A.itemDef), { id: uid('i'), network: net });
      var list = get(S.cur, grp); list.push(it);
      S.openItems[grp + ':' + it.id] = true;
      markDirty(); renderPanel(); renderPreview(); return;
    }
    if (el.hasAttribute('data-day')) {
      var days = $$('[data-day]').filter(function (c) { return c.checked; }).map(function (c) { return +c.getAttribute('data-day'); });
      S.cur.display.sched_days = days; markDirty(); renderPreview(); return;
    }
    if (!el.hasAttribute('data-path')) return;
    if (el.type === 'checkbox' || el.tagName === 'SELECT' || el.type === 'time') {
      var path = readInput(el);
      if (path === 'enabled') { var st = $('.fcp-ed__state'); if (st) st.textContent = el.checked ? 'فعال' : 'غیرفعال'; }
      if (/^(items|socials\.items)\.\d+\.network$/.test(path)) {
        var obj = get(S.cur, path.replace(/\.network$/, '')); obj.icon = ''; // network default icon
      }
      markDirty();
      if (el.hasAttribute('data-rerender') || el.hasAttribute('data-rerender-item') || path === 'layout') renderPanel();
      renderPreview();
    }
  });

  app.addEventListener('click', function (e) {
    var t = e.target, b;
    if ((b = t.closest('[data-edit]'))) {
      var src = S.list.filter(function (i) { return i.id === b.getAttribute('data-edit'); })[0];
      S.cur = clone(src); S.view = 'editor'; S.tab = 'layout'; S.dirty = false; S.openItems = {}; render(); return;
    }
    if (t.closest('[data-back]')) {
      if (S.dirty && !confirm('تغییرات ذخیره نشده‌اند. خارج می‌شوید؟')) return;
      S.view = 'list'; S.cur = null; S.dirty = false; render(); return;
    }
    if (t.closest('[data-save]')) return save();
    if ((b = t.closest('[data-open-gallery]'))) return openGallery(b.getAttribute('data-open-gallery'));
    if (t.closest('[data-global]')) return openGlobal();
    if (t.closest('[data-import]')) return importJson();
    if ((b = t.closest('[data-tab]'))) { S.tab = b.getAttribute('data-tab'); $$('[data-tab]').forEach(function (x) { x.classList.toggle('is-on', x === b); }); $('#fcp-panel').scrollTop = 0; renderPanel(); return; }
    if ((b = t.closest('[data-device]'))) { S.device = b.getAttribute('data-device'); $$('[data-device]').forEach(function (x) { x.classList.toggle('is-on', x === b); }); renderPanel(); renderPreview(); return; }
    if (t.closest('[data-preview-toggle]')) { S.previewOpen = !S.previewOpen; t.closest('[data-preview-toggle]').textContent = S.previewOpen ? 'نمایش بسته' : 'نمایش باز'; renderPreview(); return; }
    if ((b = t.closest('[data-choice]'))) {
      set(S.cur, rp(b.getAttribute('data-choice')), b.getAttribute('data-value')); markDirty();
      if (b.getAttribute('data-choice') === 'layout' || b.hasAttribute('data-rerender') || b.closest('.fcp-place')) renderPanel();
      else $$('[data-choice="' + b.getAttribute('data-choice') + '"]').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      renderPreview(); return;
    }
    if ((b = t.closest('[data-clear]'))) { set(S.cur, rp(b.getAttribute('data-clear')), ''); markDirty(); renderPanel(); renderPreview(); return; }
    if ((b = t.closest('[data-pick-icon]'))) {
      var path = rp(b.getAttribute('data-pick-icon'));
      openIconPicker(path, function (key) { set(S.cur, path, key); markDirty(); renderPanel(); renderPreview(); });
      return;
    }
    if ((b = t.closest('[data-media]'))) {
      var mp = rp(b.getAttribute('data-media'));
      mediaPick(function (url) { set(S.cur, mp, url); markDirty(); renderPanel(); renderPreview(); }); return;
    }
    if ((b = t.closest('[data-toggle-item]'))) {
      if (t.closest('button,label,input')) return;
      var k = b.getAttribute('data-toggle-item'); S.openItems[k] = !S.openItems[k]; renderPanel(); return;
    }
    if ((b = t.closest('[data-del]'))) {
      if (!confirm('این آیتم حذف شود؟')) return;
      get(S.cur, b.getAttribute('data-del')).splice(+b.getAttribute('data-idx'), 1); markDirty(); renderPanel(); renderPreview(); return;
    }
    if ((b = t.closest('[data-dup]'))) {
      var arr = get(S.cur, b.getAttribute('data-dup')), i = +b.getAttribute('data-idx');
      var cp = clone(arr[i]); cp.id = uid('i'); arr.splice(i + 1, 0, cp); markDirty(); renderPanel(); renderPreview(); return;
    }
    if (t.closest('[data-add-rule]')) { S.cur.display.rules.push({ mode: 'include', type: 'all', value: '' }); markDirty(); renderPanel(); return; }
    if ((b = t.closest('[data-del-rule]'))) { S.cur.display.rules.splice(+b.getAttribute('data-del-rule'), 1); markDirty(); renderPanel(); return; }
    if ((b = t.closest('[data-rule-pick]'))) {
      var ri = +b.getAttribute('data-rule-pick'), rule = S.cur.display.rules[ri];
      var ids = String(rule.value || '').split(/[\s,]+/).filter(Boolean);
      if (ids.indexOf(b.getAttribute('data-id')) < 0) ids.push(b.getAttribute('data-id'));
      rule.value = ids.join(', '); markDirty(); renderPanel(); return;
    }
    if ((b = t.closest('[data-palette]'))) {
      var p = w._fcpPalettes[+b.getAttribute('data-palette')];
      Object.assign(S.cur.colors, { header_bg: p[0], header_bg2: p[0], trigger_bg: p[1], close_bg: p[0], icon_bg: p[2], icon_color: p[3], social_bg: p[2], social_color: p[3], item_value: p[0], cta_bg: p[1] });
      markDirty(); renderPanel(); renderPreview(); return;
    }
    if ((b = t.closest('[data-copy]'))) {
      var txt = b.getAttribute('data-copy');
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { toast('کپی شد: ' + txt); }, function () { prompt('کپی کنید:', txt); });
      return;
    }
    if (t.closest('[data-export]')) {
      var blob = new Blob([JSON.stringify({ fcp: S.cur, version: A.version }, null, 2)], { type: 'application/json' });
      var a = d.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'fcp-' + S.cur.id + '.json'; a.click(); return;
    }
    if (t.closest('[data-dup-instance]')) {
      var c = clone(S.cur); c.id = 'fcp' + Math.random().toString(36).slice(2, 8); c.name += ' (کپی)';
      S.cur = c; S.dirty = true; render(); toast('کپی ساخته شد — برای ثبت ذخیره کنید.'); return;
    }
    if (t.closest('[data-delete-instance]')) {
      if (!confirm('این ویجت برای همیشه حذف شود؟')) return;
      var id = S.cur.id;
      ajax('delete', { id: id }).then(function () { S.list = S.list.filter(function (i) { return i.id !== id; }); S.view = 'list'; S.cur = null; S.dirty = false; render(); toast('حذف شد'); });
    }
  });

  var ruleSearch = debounce(function (el) {
    var q = el.value.trim(), box = el.parentNode.querySelector('.fcp-rule__res');
    if (q.length < 2) { box.innerHTML = ''; return; }
    var ri = el.getAttribute('data-rule-search'), type = S.cur.display.rules[+ri].type;
    ajax('search_posts', { q: q }).then(function (r) {
      var res = (r.data || []).filter(function (x) { return type === 'terms' ? x.type.indexOf('term:') === 0 : x.type.indexOf('term:') !== 0; });
      box.innerHTML = res.length ? res.map(function (x) { return '<button type="button" data-rule-pick="' + ri + '" data-id="' + x.id + '">' + esc(x.title) + ' <small>(' + esc(x.type.replace('term:', '')) + ' #' + x.id + ')</small></button>'; }).join('') : '<small>نتیجه‌ای نبود</small>';
    });
  }, 300);

  // drag & drop reorder of repeater items
  var drag = null;
  app.addEventListener('mousedown', function (e) {
    var h = e.target.closest && e.target.closest('.fcp-rep__drag');
    if (h) h.closest('.fcp-rep__item').setAttribute('draggable', 'true');
  });
  app.addEventListener('mouseup', function () { $$('.fcp-rep__item[draggable=true]').forEach(function (n) { if (n !== drag) n.setAttribute('draggable', 'false'); }); });
  app.addEventListener('dragstart', function (e) {
    var it = e.target.closest && e.target.closest('.fcp-rep__item');
    if (!it || !e.target.closest('.fcp-rep__item')) return;
    drag = it; it.classList.add('is-drag'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', ''); } catch (x) { /* */ }
  });
  app.addEventListener('dragover', function (e) {
    if (!drag) return;
    var over = e.target.closest && e.target.closest('.fcp-rep__item');
    if (!over || over === drag || over.getAttribute('data-rep') !== drag.getAttribute('data-rep')) return;
    e.preventDefault();
    var r = over.getBoundingClientRect();
    over.parentNode.insertBefore(drag, (e.clientY - r.top) > r.height / 2 ? over.nextSibling : over);
  });
  app.addEventListener('dragend', function () {
    if (!drag) return;
    var grp = drag.getAttribute('data-rep'), list = get(S.cur, grp);
    var order = $$('.fcp-rep__item', drag.parentNode).map(function (n) { return list[+n.getAttribute('data-idx')]; });
    set(S.cur, grp, order); drag = null; markDirty(); renderPanel(); renderPreview();
  });

  w.addEventListener('resize', debounce(function () { if (S.view === 'editor') renderPreview(); }, 150));
  w.addEventListener('beforeunload', function (e) { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });
  d.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 's' && S.view === 'editor') { e.preventDefault(); save(); } });

  Promise.all([loadPack('fas'), loadPack('fab')]).then(render, render);
})(window, document);
