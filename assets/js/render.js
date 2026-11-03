/*!
 * Floating Contact Pro – renderer (shared by the front end and the admin live preview)
 * Vanilla JS, no dependencies.
 */
(function (w, d) {
  'use strict';

  var FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
  var DEVICES = ['desktop', 'tablet', 'mobile'];
  var SHADOWS = {
    none: 'none',
    sm: '0 2px 8px rgba(15,23,42,.10)',
    md: '0 8px 24px rgba(15,23,42,.14)',
    lg: '0 18px 48px rgba(15,23,42,.20)',
    xl: '0 28px 70px rgba(15,23,42,.30)'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function faNum(s, on) {
    s = String(s == null ? '' : s);
    return on ? s.replace(/[0-9]/g, function (n) { return FA_DIGITS[n]; }) : s;
  }
  function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }
  function has(v) { return v !== '' && v !== null && v !== undefined; }
  function px(v) { return (typeof v === 'number' || /^-?\d+(\.\d+)?$/.test(String(v))) ? v + 'px' : v; }

  /** desktop ← tablet ← mobile cascade for a device map */
  function dev(map, device) {
    var out = {}, chain = DEVICES.slice(0, DEVICES.indexOf(device) + 1);
    chain.forEach(function (k) {
      var m = (map && map[k]) || {};
      Object.keys(m).forEach(function (p) { if (has(m[p])) out[p] = m[p]; });
    });
    return out;
  }

  function icon(inst, key, cls) {
    var html = key && inst.icons ? inst.icons[key] : '';
    return '<span class="fcp-ic' + (cls ? ' ' + cls : '') + '">' + (html || '') + '</span>';
  }

  /* -------------------------------------------------------------- CSS */

  function placeVars(p) {
    var place = p.place || 'bottom-right', x = +p.x || 0, y = +p.y || 0;
    var v = { '--fcp-t': 'auto', '--fcp-b': 'auto', '--fcp-l': 'auto', '--fcp-r': 'auto', '--fcp-tx': '0', '--fcp-ty': '0' };
    var parts = place.split('-'), vert = parts[0], hor = parts[1];
    if (vert === 'top') v['--fcp-t'] = y + 'px';
    if (vert === 'bottom') v['--fcp-b'] = y + 'px';
    if (vert === 'middle') { v['--fcp-t'] = 'calc(50% + ' + y + 'px)'; v['--fcp-ty'] = '-50%'; }
    if (hor === 'left') v['--fcp-l'] = x + 'px';
    if (hor === 'right') v['--fcp-r'] = x + 'px';
    if (hor === 'center') { v['--fcp-l'] = 'calc(50% + ' + x + 'px)'; v['--fcp-tx'] = '-50%'; }
    // stacking of panel vs trigger
    v['--fcp-flow'] = vert === 'top' ? 'column-reverse' : (vert === 'middle' ? (hor === 'left' ? 'row-reverse' : 'row') : 'column');
    v['--fcp-align'] = vert === 'middle' ? 'center' : (hor === 'left' ? 'flex-start' : (hor === 'center' ? 'center' : 'flex-end'));
    v['--fcp-dial'] = hor === 'left' ? 'row-reverse' : 'row';
    v['--fcp-edge'] = hor === 'left' ? 'flex-start' : (hor === 'center' ? 'center' : 'flex-end');
    v['--fcp-origin'] = (vert === 'top' ? 'top ' : (vert === 'middle' ? 'center ' : 'bottom ')) + (hor === 'center' ? 'center' : hor);
    v['--fcp-slide'] = vert === 'top' ? '-14px' : '14px';
    v['--fcp-tab-r'] = hor === 'left' ? '0 var(--fcp-r) var(--fcp-r) 0' : 'var(--fcp-r) 0 0 var(--fcp-r)';
    return v;
  }

  function sizeVars(s) {
    var map = { trigger: '--fcp-trig', icon: '--fcp-ico', panel: '--fcp-pw', font: '--fcp-fs', item_icon: '--fcp-ii', radius: '--fcp-rad', gap: '--fcp-gap', social: '--fcp-soc', title: '--fcp-tfs' };
    var v = {};
    Object.keys(map).forEach(function (k) { if (has(s[k])) v[map[k]] = px(s[k]); });
    return v;
  }

  function block(sel, vars, extra) {
    var body = Object.keys(vars).map(function (k) { return k + ':' + vars[k]; }).join(';');
    return sel + '{' + body + (extra ? ';' + extra : '') + '}';
  }

  /**
   * Builds the instance stylesheet. mode: 'live' (media queries),
   * 'preview' (single device, no media queries) or 'inline'.
   */
  function css(inst, sel, mode, device) {
    var c = inst.colors || {}, st = inst.style || {}, adv = inst.advanced || {};
    var bp = inst.bp || { tablet: 1024, mobile: 767 };
    var base = {
      '--fcp-trig-bg': c.trigger_bg, '--fcp-trig-c': c.trigger_color,
      '--fcp-close-bg': c.close_bg, '--fcp-close-c': c.close_color,
      '--fcp-panel': c.panel_bg, '--fcp-head': c.header_bg, '--fcp-head2': st.gradient ? (c.header_bg2 || c.header_bg) : c.header_bg,
      '--fcp-head-c': c.header_text, '--fcp-item': c.item_bg, '--fcp-border': c.item_border,
      '--fcp-title-c': c.item_title, '--fcp-value-c': c.item_value, '--fcp-icon-bg': c.icon_bg, '--fcp-icon-c': c.icon_color,
      '--fcp-soc-bg': c.social_bg, '--fcp-soc-c': c.social_color, '--fcp-cta-bg': c.cta_bg, '--fcp-cta-c': c.cta_color,
      '--fcp-badge': c.badge_bg, '--fcp-lbl-bg': c.label_bg, '--fcp-lbl-c': c.label_color,
      '--fcp-shadow': SHADOWS[st.shadow] || SHADOWS.lg, '--fcp-bw': (+st.border_width || 0) + 'px',
      '--fcp-z': adv.z || 9990
    };
    if (st.font && st.font !== 'inherit') base['--fcp-font'] = st.font;
    var out = '';
    var visible = inst.display || {};

    if (mode === 'preview') {
      var vars = Object.assign({}, base, sizeVars(dev(inst.size, device)));
      if (inst.layout !== 'bar') Object.assign(vars, placeVars(dev(inst.position, device)));
      else Object.assign(vars, placeVars({ place: (dev(inst.position, device).place || 'bottom').indexOf('top') === 0 ? 'top-center' : 'bottom-center', x: 0, y: 0 }));
      return block(sel, vars);
    }

    out += block(sel, Object.assign({}, base, sizeVars(dev(inst.size, 'desktop')), mode === 'inline' ? {} : placeVars(dev(inst.position, 'desktop'))));
    ['tablet', 'mobile'].forEach(function (k) {
      var max = k === 'tablet' ? bp.tablet : bp.mobile;
      var min = k === 'tablet' ? bp.mobile + 1 : 0;
      var v = Object.assign({}, sizeVars(dev(inst.size, k)), mode === 'inline' ? {} : placeVars(dev(inst.position, k)));
      out += '@media (max-width:' + max + 'px){' + block(sel, v) + '}';
      if (mode !== 'inline' && visible[k] === false) {
        out += '@media (max-width:' + max + 'px)' + (min ? ' and (min-width:' + min + 'px)' : '') + '{' + sel + '{display:none!important}}';
      }
    });
    if (mode !== 'inline' && visible.desktop === false) out += '@media (min-width:' + (bp.tablet + 1) + 'px){' + sel + '{display:none!important}}';
    if (mode !== 'inline' && adv.woodmart_offset) {
      out += '@media (max-width:' + bp.tablet + 'px){body.sticky-toolbar-on ' + sel + '{--fcp-wd:62px}}';
    }
    return out;
  }

  /* ------------------------------------------------------- partials */

  function itemStyle(inst, it) {
    var st = inst.style || {}, s = [];
    var col = it.color || (st.network_colors ? it.ncolor : '');
    if (col) s.push('--fcp-ib:' + col, '--fcp-tint:' + col);
    else if (it.ncolor) s.push('--fcp-tint:' + it.ncolor);
    if (it.icon_color) s.push('--fcp-ic-c:' + it.icon_color);
    else if (col) s.push('--fcp-ic-c:#fff');
    if (it.bg) s.push('--fcp-it-bg:' + it.bg);
    return s.length ? ' style="' + esc(s.join(';')) + '"' : '';
  }

  function linkAttrs(inst, it, href) {
    href = href || it.href || '#';
    var ext = /^https?:/i.test(href) && it.new_tab !== false;
    return ' href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener nofollow"' : '') +
      ' data-fcp-net="' + esc(it.network || 'cta') + '" data-fcp-label="' + esc(it.label || '') + '"';
  }

  function valueHtml(inst, v) {
    if (!has(v)) return '';
    var o = inst.opts || {}, st = inst.style || {};
    return '<span class="fcp-val"' + (o.value_ltr ? ' dir="ltr"' : '') + '>' + esc(faNum(v, st.persian_digits)) + '</span>';
  }

  function header(inst, withClose) {
    var h = inst.header || {}, o = inst.opts || {}, st = inst.style || {};
    if (!h.show) return withClose ? '<div class="fcp-head fcp-head--bare">' + closeBtn(inst, 'fcp-x--in') + '</div>' : '';
    return '<div class="fcp-head">' +
      (h.icon ? icon(inst, h.icon, 'fcp-head__ic') : '') +
      '<div class="fcp-head__txt">' +
      (h.title ? '<div class="fcp-head__title">' + esc(faNum(h.title, st.persian_digits)) + '</div>' : '') +
      (h.subtitle ? '<div class="fcp-head__sub">' + esc(faNum(h.subtitle, st.persian_digits)) + '</div>' : '') +
      '</div>' + (withClose ? closeBtn(inst, 'fcp-x--in') : '') + '</div>';
  }

  function closeBtn(inst, cls) {
    return '<button type="button" class="fcp-x ' + cls + '" data-fcp-close aria-label="بستن">' + icon(inst, inst.trigger.close_icon || 'fas:xmark') + '</button>';
  }

  function items(inst) {
    var o = inst.opts || {}, st = inst.style || {};
    var style = o.item_style || 'card';
    var html = (inst.items || []).map(function (it) {
      var showVal = o.show_value && has(it.value) && !/^https?:/i.test(it.value) && style !== 'grid';
      var sub = it.sub ? '<span class="fcp-sub">' + esc(faNum(it.sub, st.persian_digits)) + '</span>' : '';
      return '<a class="fcp-item"' + linkAttrs(inst, it) + itemStyle(inst, it) + '>' +
        icon(inst, it.icon, 'fcp-item__ic') +
        '<span class="fcp-item__txt"><span class="fcp-lbl">' + esc(faNum(it.label, st.persian_digits)) + '</span>' +
        (showVal ? valueHtml(inst, it.value) : '') + sub + '</span>' +
        (style === 'row' ? '<span class="fcp-chev" aria-hidden="true"></span>' : '') +
        '</a>';
    }).join('');
    if (!html) return '';
    var cols = style === 'grid' ? ' style="--fcp-cols:' + (+o.columns || 2) + '"' : '';
    return '<div class="fcp-items fcp-items--' + esc(style) + '"' + cols + '>' + html + '</div>';
  }

  function socials(inst, force) {
    var s = inst.socials || {}, st = inst.style || {};
    if ((!s.show && !force) || !(s.items || []).length) return '';
    return '<div class="fcp-socials fcp-socials--' + esc(s.shape || 'rounded') + '">' +
      (s.title ? '<span class="fcp-socials__title">' + esc(faNum(s.title, st.persian_digits)) + '</span>' : '') +
      '<div class="fcp-socials__list">' + s.items.map(function (it) {
        return '<a class="fcp-soc"' + linkAttrs(inst, it) + itemStyle(inst, it) + ' aria-label="' + esc(it.label) + '" title="' + esc(it.label) + '">' + icon(inst, it.icon) + '</a>';
      }).join('') + '</div></div>';
  }

  function cta(inst, force) {
    var c = inst.cta || {}, st = inst.style || {};
    if ((!c.show && !force) || !c.href) return '';
    return '<a class="fcp-cta"' + linkAttrs(inst, { network: 'cta', label: c.text, new_tab: true }, c.href) + '>' +
      (c.icon ? icon(inst, c.icon) : '') + '<span>' + esc(faNum(c.text, st.persian_digits)) + '</span></a>';
  }

  function offlineNote(inst, ctx) {
    return ctx.offline ? '<div class="fcp-offline">' + nl2br(inst.display.sched_note) + '</div>' : '';
  }

  function trigger(inst) {
    var t = inst.trigger || {}, st = inst.style || {};
    var label = t.label_show && t.label ? '<span class="fcp-trig__lbl">' + esc(faNum(t.label, st.persian_digits)) + '</span>' : '';
    return '<button type="button" class="fcp-trig fcp-trig--' + esc(t.shape || 'circle') + (t.pulse ? ' fcp-pulse' : '') +
      (label ? ' fcp-trig--has-lbl' : '') + ' fcp-anim-' + esc(t.animate || 'rotate') + '" data-fcp-toggle aria-expanded="false" aria-label="' + esc(t.tooltip || t.label || 'تماس با ما') + '">' +
      '<span class="fcp-trig__icons">' + icon(inst, t.icon, 'fcp-trig__open') +
      (inst.opts.close_style === 'trigger' ? icon(inst, t.close_icon || 'fas:xmark', 'fcp-trig__close') : '') + '</span>' + label +
      (t.badge_show ? '<span class="fcp-badge">' + esc(faNum(t.badge_text, st.persian_digits)) + '</span>' : '') +
      '</button>';
  }

  function greeting(inst) {
    var t = inst.trigger || {};
    if (!t.greet_show || !t.greet_text) return '';
    return '<div class="fcp-greet" role="status"><button type="button" class="fcp-greet__x" data-fcp-greet-close aria-label="بستن">×</button>' +
      '<div class="fcp-greet__txt" data-fcp-toggle>' + nl2br(faNum(t.greet_text, inst.style.persian_digits)) + '</div></div>';
  }

  /* -------------------------------------------------------- layouts */

  var L = {};

  L.panel = function (inst, ctx) {
    var o = inst.opts || {};
    var outside = o.close_style === 'outside';
    return '<div class="fcp-panel" role="dialog" aria-label="' + esc(inst.header.title || 'تماس') + '">' +
      (outside ? closeBtn(inst, 'fcp-x--out') : '') +
      '<div class="fcp-card">' + header(inst, o.close_style === 'inside') + '<div class="fcp-body">' +
      offlineNote(inst, ctx) + items(inst) + socials(inst) + cta(inst) + '</div></div></div>' + greeting(inst) + trigger(inst);
  };

  L.chat = function (inst, ctx) {
    var h = inst.header || {}, o = inst.opts || {}, st = inst.style || {};
    var avatar = h.avatar ? '<img src="' + esc(h.avatar) + '" alt="" loading="lazy">' :
      (h.icon ? icon(inst, h.icon) : '<span>' + esc((h.agent || h.title || '؟').trim().charAt(0)) + '</span>');
    var foot;
    if (o.chat_mode === 'icons') {
      foot = '<div class="fcp-chat__with"><span>' + esc(inst.cta.text || 'شروع گفتگو با:') + '</span><div class="fcp-chat__icons">' +
        (inst.items || []).map(function (it) {
          return '<a class="fcp-soc"' + linkAttrs(inst, it) + itemStyle(inst, it) + ' aria-label="' + esc(it.label) + '" title="' + esc(it.label) + '">' + icon(inst, it.icon) + '</a>';
        }).join('') + '</div></div>';
    } else if (o.chat_mode === 'list') {
      foot = items(inst);
    } else {
      foot = cta(inst, true);
    }
    return '<div class="fcp-panel" role="dialog" aria-label="' + esc(h.agent || h.title) + '">' +
      (o.close_style === 'outside' ? closeBtn(inst, 'fcp-x--out') : '') +
      '<div class="fcp-card fcp-chat">' +
      '<div class="fcp-head fcp-chat__head"><span class="fcp-av' + (h.online ? ' is-online' : '') + '">' + avatar + '</span>' +
      '<div class="fcp-head__txt"><div class="fcp-head__title">' + esc(faNum(h.agent || h.title, st.persian_digits)) + '</div>' +
      '<div class="fcp-head__sub">' + esc(faNum(h.role || h.subtitle, st.persian_digits)) + '</div></div>' +
      (o.close_style === 'inside' ? closeBtn(inst, 'fcp-x--in') : '') + '</div>' +
      '<div class="fcp-chat__body">' + offlineNote(inst, ctx) + '<div class="fcp-bubble">' +
      (h.agent ? '<b>' + esc(h.agent) + '</b>' : '') + '<p>' + nl2br(faNum(h.message, st.persian_digits)) + '</p>' +
      (h.time ? '<time>' + esc(faNum(h.time, st.persian_digits)) + '</time>' : '') + '</div></div>' +
      '<div class="fcp-chat__foot">' + foot + socials(inst) + '</div></div></div>' + greeting(inst) + trigger(inst);
  };

  L.speeddial = function (inst) {
    var o = inst.opts || {}, st = inst.style || {};
    var list = (inst.items || []).map(function (it, i) {
      return '<a class="fcp-dial__item" style="--i:' + i + '"' + linkAttrs(inst, it) + '>' +
        (o.dial_labels !== 'none' ? '<span class="fcp-dial__lbl' + (o.dial_labels === 'hover' ? ' is-hover' : '') + '">' + esc(faNum(it.label, st.persian_digits)) + '</span>' : '') +
        '<span class="fcp-dial__btn"' + itemStyle(inst, it) + '>' + icon(inst, it.icon) + '</span></a>';
    }).join('');
    return '<div class="fcp-panel fcp-dial" role="menu">' + list + '</div>' + greeting(inst) + trigger(inst);
  };

  L.tabs = function (inst) {
    var o = inst.opts || {}, st = inst.style || {};
    return '<div class="fcp-tabs' + (o.tabs_expand === 'always' ? ' is-expanded' : '') + '">' + (inst.items || []).map(function (it) {
      return '<a class="fcp-tab"' + linkAttrs(inst, it) + itemStyle(inst, it) + '>' + icon(inst, it.icon) +
        '<span class="fcp-tab__lbl">' + esc(faNum(it.label, st.persian_digits)) + '</span></a>';
    }).join('') + '</div>';
  };

  L.pill = function (inst) {
    var o = inst.opts || {}, st = inst.style || {};
    return '<div class="fcp-pill' + (o.pill_labels ? ' has-labels' : '') + '">' + (inst.items || []).map(function (it) {
      return '<a class="fcp-pill__btn"' + linkAttrs(inst, it) + itemStyle(inst, it) + ' aria-label="' + esc(it.label) + '" title="' + esc(it.label) + '">' + icon(inst, it.icon) +
        (o.pill_labels ? '<span>' + esc(faNum(it.label, st.persian_digits)) + '</span>' : '') + '</a>';
    }).join('') + '</div>';
  };

  L.cta = function (inst) {
    var c = inst.cta || {}, st = inst.style || {}, t = inst.trigger || {};
    if (!c.href) return '';
    return greeting(inst) + '<a class="fcp-ctabtn fcp-trig--' + esc(t.shape || 'pill') + (t.pulse ? ' fcp-pulse' : '') + '"' +
      linkAttrs(inst, { network: 'cta', label: c.text, new_tab: true }, c.href) + '>' +
      '<span class="fcp-ctabtn__ic">' + icon(inst, c.icon || t.icon) + '</span><span class="fcp-ctabtn__txt">' + esc(faNum(c.text, st.persian_digits)) + '</span>' +
      (t.badge_show ? '<span class="fcp-badge">' + esc(faNum(t.badge_text, st.persian_digits)) + '</span>' : '') + '</a>';
  };

  L.bubble = function (inst) {
    var t = inst.trigger || {}, c = inst.cta || {}, st = inst.style || {};
    var first = (inst.items || [])[0];
    var href = c.show && c.href ? c.href : (first ? first.href : c.href);
    if (!href) return '';
    var it = first && href === first.href ? first : { network: 'cta', label: c.text, new_tab: true };
    return greeting(inst) + '<a class="fcp-trig fcp-trig--' + esc(t.shape || 'circle') + (t.pulse ? ' fcp-pulse' : '') + '"' +
      linkAttrs(inst, it, href) + ' aria-label="' + esc(t.tooltip || it.label || 'تماس') + '">' +
      '<span class="fcp-trig__icons">' + icon(inst, t.icon || (first && first.icon), 'fcp-trig__open') + '</span>' +
      (t.label_show && t.label ? '<span class="fcp-trig__lbl">' + esc(faNum(t.label, st.persian_digits)) + '</span>' : '') +
      (t.badge_show ? '<span class="fcp-badge">' + esc(faNum(t.badge_text, st.persian_digits)) + '</span>' : '') + '</a>';
  };

  L.bar = function (inst) {
    var o = inst.opts || {}, st = inst.style || {};
    if (o.bar_mode === 'cta') {
      return '<div class="fcp-bar fcp-bar--cta">' + cta(inst, true) + '</div>';
    }
    return '<div class="fcp-bar">' + (inst.items || []).map(function (it) {
      return '<a class="fcp-bar__btn"' + linkAttrs(inst, it) + itemStyle(inst, it) + '>' + icon(inst, it.icon) +
        '<span>' + esc(faNum(it.label, st.persian_digits)) + '</span></a>';
    }).join('') + '</div>';
  };

  /* ---------------------------------------------------- scheduling */

  function isOffline(inst, nowMs) {
    var dsp = inst.display || {};
    if (!dsp.sched_on) return false;
    var tz = +(inst.tz || 0);
    var now = new Date((nowMs || Date.now()) + tz * 3600000); // site time expressed in UTC fields
    var day = now.getUTCDay();
    var mins = now.getUTCHours() * 60 + now.getUTCMinutes();
    var toMin = function (s) { var p = String(s || '0:0').split(':'); return (+p[0] || 0) * 60 + (+p[1] || 0); };
    var from = toMin(dsp.sched_from), to = toMin(dsp.sched_to);
    var days = (dsp.sched_days || []).map(Number);
    var inRange = from <= to ? (mins >= from && mins < to) : (mins >= from || mins < to);
    return !(days.indexOf(day) > -1 && inRange);
  }

  /* -------------------------------------------------------- render */

  var uid = 0;

  /**
   * opts: { mode: 'live' | 'preview' | 'inline', device, part, now, open }
   * Returns the root element (not yet attached).
   */
  function render(inst, opts) {
    opts = opts || {};
    var mode = opts.mode || 'live';
    var ctx = { offline: isOffline(inst, opts.now) };
    if (ctx.offline && inst.display.sched_outside === 'hide' && mode === 'live') return null;
    ctx.offline = (ctx.offline || !!opts.forceOffline) && inst.display.sched_outside === 'note';

    var root = d.createElement('div');
    var id = 'fcp-' + inst.id + (mode === 'live' ? '' : '-' + (++uid));
    root.id = id;
    var layout = L[inst.layout] ? inst.layout : 'panel';
    var cls = ['fcp', 'fcp--' + layout, 'fcp--' + mode, 'fcp-is-' + (inst.opts.item_style || 'card'), 'fcp-an-' + (inst.style.animation || 'slide')];
    if (inst.style.glass) cls.push('fcp--glass');
    if (inst.style.network_colors) cls.push('fcp--netcolors');
    if (inst.advanced.class) cls.push(inst.advanced.class);
    if (layout === 'bar' && String(dev(inst.position, opts.device || 'desktop').place || '').indexOf('top') === 0) cls.push('fcp--bar-top');
    if ((inst.display.delay > 0 || inst.display.scroll > 0) && mode === 'live') cls.push('fcp--wait');
    root.className = cls.join(' ');
    root.setAttribute('data-fcp', inst.id);

    var html;
    if (mode === 'inline') {
      var part = opts.part || 'all', o = inst.opts;
      html = part === 'socials' ? socials(inst, true) :
        part === 'items' ? items(inst) :
          '<div class="fcp-card">' + header(inst, false) + '<div class="fcp-body">' + items(inst) + socials(inst) + cta(inst) + '</div></div>';
    } else {
      html = L[layout](inst, ctx);
    }
    if (!html) return null;

    var style = d.createElement('style');
    style.textContent = css(inst, '#' + id, mode, opts.device || 'desktop');
    root.innerHTML = '<div class="fcp-in" dir="' + (inst.style.dir === 'ltr' ? 'ltr' : 'rtl') + '">' + html + '</div>';
    root.insertBefore(style, root.firstChild);
    if (mode !== 'inline' && inst.opts.overlay && ['panel', 'chat', 'speeddial'].indexOf(layout) > -1) {
      var ov = d.createElement('div'); ov.className = 'fcp-overlay'; ov.setAttribute('data-fcp-close', '');
      root.insertBefore(ov, root.firstChild.nextSibling);
    }
    if (opts.open) root.classList.add('is-open');
    return root;
  }

  /* ------------------------------------------------------ behaviour */

  function ss(k, v) {
    try { if (v === undefined) return w.sessionStorage.getItem(k); w.sessionStorage.setItem(k, v); } catch (e) { return null; }
  }

  function bind(root, inst, live) {
    var toggles = root.querySelectorAll('[data-fcp-toggle]');
    var setOpen = function (open) {
      root.classList.toggle('is-open', open);
      Array.prototype.forEach.call(root.querySelectorAll('.fcp-trig'), function (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); });
      if (open) {
        root.classList.add('was-opened');
        hideGreet();
        if (live) ss('fcp_open_' + inst.id, '1');
      }
    };
    var hideGreet = function () {
      root.classList.remove('greet-on');
      if (live) ss('fcp_greet_' + inst.id, '1');
    };
    Array.prototype.forEach.call(toggles, function (t) {
      t.addEventListener('click', function (e) { e.preventDefault(); setOpen(!root.classList.contains('is-open')); });
      if (inst.trigger.open_on === 'hover' && w.matchMedia && w.matchMedia('(hover:hover)').matches && t.classList.contains('fcp-trig')) {
        root.addEventListener('mouseenter', function () { setOpen(true); });
        root.addEventListener('mouseleave', function () { setOpen(false); });
      }
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-fcp-close]'), function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); setOpen(false); });
    });
    var gx = root.querySelector('[data-fcp-greet-close]');
    if (gx) gx.addEventListener('click', function (e) { e.stopPropagation(); hideGreet(); });

    if (!live) return { setOpen: setOpen };

    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    if (inst.opts.close_outside) {
      d.addEventListener('click', function (e) { if (root.classList.contains('is-open') && !root.contains(e.target)) setOpen(false); });
    }

    // analytics
    root.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-fcp-net]');
      if (!a || !inst.advanced.analytics) return;
      var payload = { event: 'fcp_click', fcp_widget: inst.name, fcp_network: a.getAttribute('data-fcp-net'), fcp_label: a.getAttribute('data-fcp-label'), fcp_url: a.href };
      (w.dataLayer = w.dataLayer || []).push(payload);
      if (typeof w.gtag === 'function') w.gtag('event', 'contact_click', { method: payload.fcp_network, label: payload.fcp_label });
    });

    // reveal (delay / scroll)
    if (root.classList.contains('fcp--wait')) {
      var shown = false, delayOk = !(inst.display.delay > 0), scrollOk = !(inst.display.scroll > 0);
      var reveal = function () { if (!shown && delayOk && scrollOk) { shown = true; root.classList.remove('fcp--wait'); afterReveal(); } };
      if (!delayOk) setTimeout(function () { delayOk = true; reveal(); }, inst.display.delay * 1000);
      if (!scrollOk) {
        var onScroll = function () {
          var h = d.documentElement.scrollHeight - w.innerHeight;
          if (h <= 0 || (w.scrollY / h) * 100 >= inst.display.scroll) { scrollOk = true; w.removeEventListener('scroll', onScroll); reveal(); }
        };
        w.addEventListener('scroll', onScroll, { passive: true }); onScroll();
      }
    } else {
      afterReveal();
    }

    function afterReveal() {
      var t = inst.trigger;
      if (t.greet_show && t.greet_text && !ss('fcp_greet_' + inst.id)) {
        setTimeout(function () { if (!root.classList.contains('was-opened')) root.classList.add('greet-on'); }, (+t.greet_delay || 0) * 1000);
      }
      if (+t.auto_open > 0 && !ss('fcp_open_' + inst.id) && root.querySelector('.fcp-panel')) {
        setTimeout(function () { if (!root.classList.contains('was-opened')) setOpen(true); }, t.auto_open * 1000);
      }
    }
    return { setOpen: setOpen };
  }

  function mountInline(slot) {
    if (slot.getAttribute('data-fcp-done')) return;
    var json = slot.querySelector('script[type="application/json"]');
    if (!json) return;
    try {
      var inst = JSON.parse(json.textContent);
      var el = render(inst, { mode: 'inline', part: slot.getAttribute('data-part') });
      if (!el) return;
      if (slot.getAttribute('data-align')) el.setAttribute('data-align', slot.getAttribute('data-align'));
      slot.appendChild(el);
      slot.setAttribute('data-fcp-done', '1');
      bind(el, inst, true);
    } catch (e) { /* ignore */ }
  }

  function boot() {
    var data = d.getElementById('fcp-data');
    if (data) {
      try {
        var payload = JSON.parse(data.textContent);
        (payload.floating || []).forEach(function (inst) {
          if (d.getElementById('fcp-' + inst.id)) return;
          var el = render(inst, { mode: 'live' });
          if (!el) return;
          d.body.appendChild(el);
          bind(el, inst, true);
        });
      } catch (e) { if (w.console) console.warn('FCP', e); }
    }
    Array.prototype.forEach.call(d.querySelectorAll('.fcp-inline-slot'), mountInline);
  }

  w.FCP = { render: render, bind: bind, css: css, dev: dev, esc: esc, isOffline: isOffline, mountInline: mountInline };

  if (!w.FCP_NO_BOOT) {
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
    // Elementor editor / AJAX-rendered widgets
    var hookElementor = function () {
      if (w.elementorFrontend && w.elementorFrontend.hooks && !w.FCP._el) {
        w.FCP._el = true;
        w.elementorFrontend.hooks.addAction('frontend/element_ready/fcp-inline.default', function ($scope) {
          var el = $scope && $scope[0] ? $scope[0] : $scope;
          Array.prototype.forEach.call(el.querySelectorAll('.fcp-inline-slot'), mountInline);
        });
      }
    };
    hookElementor();
    if (w.jQuery) w.jQuery(w).on('elementor/frontend/init', hookElementor);
  }
})(window, document);
