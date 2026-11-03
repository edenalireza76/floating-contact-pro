/* Floating Contact Pro – ready-made templates (partial instance configs). */
(function (w) {
  'use strict';

  var n = 0;
  function it(network, label, value, extra) {
    var o = { id: 't' + (++n), enabled: true, network: network, label: label, sub: '', value: value || '', message: '', icon: '', color: '', icon_color: '', bg: '', new_tab: true };
    for (var k in extra || {}) o[k] = extra[k];
    return o;
  }
  var PH = '09121234567', TEL = '021-22010230';
  var SOC = function () { return [it('instagram', 'اینستاگرام', 'yourpage'), it('whatsapp', 'واتساپ', PH), it('eitaa', 'ایتا', 'yourid'), it('bale', 'بله', 'yourid')]; };
  var SIZE = function (o) {
    var s = { desktop: { trigger: 60, icon: 26, panel: 340, font: 14, item_icon: 44, radius: 18, gap: 10, social: 38, title: 17 }, tablet: {}, mobile: { trigger: 56, icon: 24, panel: 310, item_icon: 40, title: 16 } };
    for (var k in o || {}) s.desktop[k] = o[k];
    return s;
  };
  var POS = function (place, x, y, mplace) {
    return { desktop: { place: place, x: x == null ? 24 : x, y: y == null ? 24 : y }, tablet: { place: '', x: '', y: '' }, mobile: { place: mplace || '', x: x == null ? 16 : Math.min(x, 16), y: y == null ? 16 : Math.min(y, 16) } };
  };

  var T = [];
  function add(key, name, cat, cfg) { cfg.template = key; T.push({ key: key, name: name, cat: cat, cfg: cfg }); }

  /* ---------- Persian contact-card panels (like the reference screenshots) ---------- */
  add('cards-navy', 'کارت‌های مشاوره – سرمه‌ای و طلایی', 'panel', {
    layout: 'panel',
    header: { show: true, title: 'نیاز به مشاوره تخصصی دارید؟', subtitle: 'تماس با مشاوران فروش' },
    items: [it('support', 'مشاوره خرید', PH, { icon: 'fas:headset' }), it('whatsapp', 'واتس اپ', PH), it('bale', 'پیام در بله', PH)],
    socials: { show: true, title: 'شبکه های اجتماعی :', items: [it('instagram', 'اینستاگرام', 'page'), it('whatsapp', 'واتساپ', PH), it('bale', 'بله', 'id')], shape: 'rounded' },
    opts: { item_style: 'card', close_style: 'outside', show_value: true },
    trigger: { icon: 'fas:phone-volume', shape: 'rounded', pulse: true, animate: 'shake' },
    colors: { trigger_bg: '#22c55e', trigger_color: '#ffffff', close_bg: '#0b3d6b', close_color: '#fff', panel_bg: '#ffffff', header_bg: '#0b4a7a', header_bg2: '#0b3d6b', header_text: '#ffffff', item_bg: '#f4f7fb', item_border: '#e2e8f0', item_title: '#475569', item_value: '#0b4a7a', icon_bg: '#2f3e4c', icon_color: '#f5c518', social_bg: '#2f3e4c', social_color: '#f5c518' },
    style: { network_colors: false, gradient: true, shadow: 'lg', animation: 'slide' }, size: SIZE()
  });

  add('cards-gold-dark', 'لوکس تیره – طلایی', 'panel', {
    layout: 'panel',
    header: { show: true, title: 'نیاز به مشاوره تخصصی دارید؟', subtitle: 'تماس با تیم فروش' },
    items: [it('phone', 'تماس با تیم مشاوره', TEL, { icon: 'fas:phone' }), it('whatsapp', 'واتساپ', PH, { bg: '#1d3a24', icon_color: '#ffffff' })],
    socials: { show: false, items: [] },
    opts: { item_style: 'minimal', close_style: 'outside', show_value: true },
    trigger: { icon: 'fas:phone', shape: 'circle', pulse: true, animate: 'rotate' },
    colors: { trigger_bg: '#0f5b36', trigger_color: '#ffffff', close_bg: '#b8935f', close_color: '#fff', panel_bg: '#141210', header_bg: '#b8935f', header_bg2: '#a07d4c', header_text: '#ffffff', item_bg: '#1f1b17', item_border: '#2a241d', item_title: '#c9a46b', item_value: '#ffffff', icon_bg: 'transparent', icon_color: '#c9a46b' },
    style: { gradient: false, shadow: 'xl', border_width: 0 }, size: SIZE({ radius: 4 })
  });

  add('cards-royal', 'کارت‌های رنگی – آبی سلطنتی', 'panel', {
    layout: 'panel',
    header: { show: true, title: 'نیاز به مشاوره تخصصی دارید؟', subtitle: 'تماس با مشاوران فروش' },
    items: [it('support', 'مشاوره خرید', '021-26306267', { color: '#c9a35b' }), it('phone', 'تلفن دفتر فروش', '021-26306319', { color: '#0f2a5f' }), it('whatsapp', 'واتساپ', '0912-215-3229', { color: '#22a565' }), it('telegram', 'تلگرام', '09122153229', { color: '#229ed9', icon: 'fas:paper-plane' })],
    socials: { show: true, title: 'شبکه‌های اجتماعی:', items: [it('instagram', 'اینستاگرام', 'page'), it('telegram', 'تلگرام', 'id', { icon: 'fas:paper-plane' }), it('whatsapp', 'واتساپ', PH)], shape: 'rounded' },
    opts: { item_style: 'card', close_style: 'trigger', show_value: true },
    trigger: { icon: 'fas:headset', shape: 'rounded', pulse: false, animate: 'rotate' },
    colors: { trigger_bg: '#0f2a5f', trigger_color: '#ffffff', panel_bg: '#ffffff', header_bg: '#0f2a5f', header_bg2: '#2563eb', header_text: '#ffffff', item_bg: '#f3f6fb', item_border: '#e5eaf3', item_title: '#64748b', item_value: '#0f2a5f', icon_bg: '#0f2a5f', icon_color: '#ffffff', social_bg: '#0f2a5f', social_color: '#ffffff' },
    style: { gradient: true, shadow: 'xl' }, size: SIZE({ radius: 22 })
  });

  add('cards-iran', 'پیام‌رسان‌های ایرانی', 'panel', {
    layout: 'panel',
    header: { show: true, title: 'از طریق پیام‌رسان‌های ایرانی', subtitle: 'پاسخگویی سریع در ساعات کاری', icon: 'fas:comments' },
    items: [it('eitaa', 'ایتا', '@yourid', { sub: 'پاسخ زیر ۱۰ دقیقه' }), it('bale', 'بله', '@yourid', { sub: 'ارسال فایل و فاکتور' }), it('rubika', 'روبیکا', '@yourid', { sub: 'کانال تخفیف‌ها' }), it('soroush', 'سروش پلاس', '@yourid', { sub: 'پشتیبانی' })],
    socials: { show: false, items: [] },
    opts: { item_style: 'tinted', close_style: 'inside', show_value: false },
    trigger: { icon: 'fas:comment-dots', shape: 'circle', pulse: true, badge_show: true, badge_text: '1' },
    colors: { trigger_bg: '#ef7f1a', trigger_color: '#fff', panel_bg: '#ffffff', header_bg: '#ef7f1a', header_bg2: '#f59e0b', header_text: '#fff', item_bg: '#f8fafc', item_border: '#eef2f7', item_title: '#1f2937', item_value: '#ef7f1a' },
    style: { network_colors: true, gradient: true }, size: SIZE()
  });

  add('cards-grid', 'کاشی‌های شبکه‌ای', 'panel', {
    layout: 'panel',
    header: { show: true, title: 'راه‌های ارتباط با ما', subtitle: 'هر کدام راحت‌ترید' },
    items: [it('phone', 'تماس', TEL), it('whatsapp', 'واتساپ', PH), it('telegram', 'تلگرام', 'id'), it('eitaa', 'ایتا', 'id'), it('email', 'ایمیل', 'info@site.ir'), it('neshan', 'مسیریابی', 'https://nshn.ir/')],
    socials: { show: false, items: [] },
    opts: { item_style: 'grid', columns: 3, close_style: 'inside', show_value: false },
    trigger: { icon: 'fas:comments', shape: 'circle', pulse: true },
    colors: { trigger_bg: '#4f46e5', trigger_color: '#fff', header_bg: '#4f46e5', header_bg2: '#7c3aed', header_text: '#fff', item_bg: '#f5f6ff', item_border: '#eceefe', item_title: '#312e81' },
    style: { network_colors: true }, size: SIZE({ panel: 360 })
  });

  /* ---------- link lists ---------- */
  add('list-help', 'لیست راهنما + دکمه', 'list', {
    layout: 'panel',
    header: { show: true, title: 'کمک لازم دارید؟', subtitle: '' },
    items: [it('phone', 'گفتگوی تلفنی', TEL), it('whatsapp', 'شروع چت', PH), it('faq', 'سوالات متداول', '/faq'), it('neshan', 'مسیریابی', 'https://nshn.ir/')],
    cta: { show: true, text: 'ارسال پیام', icon: '', link: '', item: '' },
    socials: { show: false, items: [] },
    opts: { item_style: 'row', close_style: 'inside', show_value: false },
    trigger: { icon: 'fas:circle-info', shape: 'circle', pulse: false },
    colors: { trigger_bg: '#ffffff', trigger_color: '#0f766e', panel_bg: '#ffffff', header_bg: '#ffffff', header_bg2: '#ffffff', header_text: '#0f766e', item_title: '#1f2937', item_value: '#0f766e', item_border: '#e5e7eb', cta_bg: '#0f766e', cta_color: '#fff' },
    style: { gradient: false }, size: SIZE({ panel: 280, trigger: 48, icon: 20, title: 16 })
  });

  add('list-tinted-orange', 'لیست رنگی – نارنجی', 'list', {
    layout: 'panel',
    header: { show: true, title: 'پشتیبانی آنلاین', subtitle: 'از کدام راه کمک بگیرید؟' },
    items: [it('whatsapp', 'پیام در واتساپ', PH, { sub: 'پاسخ سریع' }), it('website', 'پنل مشتریان', '/my-account', { sub: 'سفارش‌ها و فاکتورها' }), it('phone', 'سوالات مالی', TEL, { sub: 'واحد حسابداری' }), it('email', 'نکات و آموزش‌ها', 'info@site.ir', { sub: 'خبرنامه' })],
    socials: { show: false, items: [] },
    opts: { item_style: 'tinted', close_style: 'trigger', show_value: false },
    trigger: { icon: 'fas:headset', shape: 'circle', pulse: false },
    colors: { trigger_bg: '#ffffff', trigger_color: '#1f2937', header_bg: '#ff8a65', header_bg2: '#ffa38a', header_text: '#fff', item_title: '#3f1d0e', item_value: '#ff6f43', icon_bg: '#ff8a65' },
    style: { network_colors: false }, size: SIZE({ panel: 290, trigger: 44, icon: 18, title: 15 })
  });

  add('list-tinted-navy', 'لیست رنگی – سرمه‌ای زرد', 'list', {
    layout: 'panel',
    header: { show: true, title: 'منابع دانشجویی', subtitle: 'هر چیزی که لازم دارید' },
    items: [it('whatsapp', 'سوالات دوره‌ها', PH, { sub: 'مشاور آموزشی' }), it('website', 'دوره‌های شما', '/courses', { sub: 'ورود به پنل' }), it('phone', 'ثبت‌نام', TEL, { sub: 'واحد پذیرش' }), it('google_maps', 'نقشه مجموعه', 'Tehran', { sub: 'آدرس و مسیر' })],
    socials: { show: false, items: [] },
    opts: { item_style: 'tinted', close_style: 'trigger', show_value: false },
    trigger: { icon: 'fas:graduation-cap', shape: 'circle' },
    colors: { trigger_bg: '#ffffff', trigger_color: '#1e3a5f', header_bg: '#1e3a5f', header_bg2: '#1e3a5f', header_text: '#fff', item_title: '#1e293b', icon_bg: '#1e3a5f', icon_color: '#facc15' },
    style: { gradient: false }, size: SIZE({ panel: 280, trigger: 44, icon: 18, title: 15 })
  });

  add('list-dark-red', 'لیست تیره – قرمز', 'list', {
    layout: 'panel',
    header: { show: true, title: 'کمک فوری', subtitle: '' },
    items: [it('phone', 'تماس با ما', TEL), it('faq', 'راهنمای سفارش', '/guide'), it('tracking', 'پیگیری سفارش', '/track'), it('neshan', 'آدرس فروشگاه', 'https://nshn.ir/')],
    cta: { show: true, text: 'خرید کنید', icon: 'fas:cart-shopping', link: '/shop' },
    socials: { show: false, items: [] },
    opts: { item_style: 'row', close_style: 'inside', show_value: false },
    trigger: { icon: 'fas:circle-question', shape: 'circle' },
    colors: { trigger_bg: '#262626', trigger_color: '#fff', panel_bg: '#111111', header_bg: '#111111', header_bg2: '#111111', header_text: '#f43f5e', item_border: '#262626', item_title: '#e5e5e5', item_value: '#ffffff', item_bg: '#1c1c1c', cta_bg: '#f43f5e', cta_color: '#fff' },
    style: { gradient: false }, size: SIZE({ panel: 250, trigger: 44, icon: 18, title: 15 })
  });

  /* ---------- chat bubbles ---------- */
  add('chat-whatsapp', 'چت واتساپ با مشاور', 'chat', {
    layout: 'chat',
    header: { show: true, agent: 'سارا محمدی', role: 'مشاور فروش', message: 'سلام 👋\nچطور می‌تونم کمکتون کنم؟', time: '10:30', online: true },
    items: [it('whatsapp', 'واتساپ', PH, { message: 'سلام، از سایت پیام می‌دم' })],
    cta: { show: true, text: 'شروع گفتگو در واتساپ', icon: 'fab:whatsapp', item: '' },
    opts: { chat_mode: 'button', close_style: 'inside' },
    trigger: { icon: 'fab:whatsapp', shape: 'circle', pulse: true, badge_show: true, badge_text: '1', greet_show: true },
    colors: { trigger_bg: '#25d366', trigger_color: '#fff', header_bg: '#075e54', header_bg2: '#128c7e', header_text: '#fff', cta_bg: '#25d366', cta_color: '#fff' },
    style: { gradient: true }, size: SIZE({ panel: 320 })
  });

  add('chat-red-mail', 'چت قرمز – ایمیل', 'chat', {
    layout: 'chat',
    header: { show: true, agent: 'نیلوفر احمدی', role: 'مدیر فروش', message: 'سلام! سوالی دارید؟ همین حالا ایمیل بزنید.', time: '15:29', online: true },
    items: [it('email', 'ایمیل', 'sales@site.ir')],
    cta: { show: true, text: 'ارسال ایمیل', icon: 'fas:envelope' },
    opts: { chat_mode: 'button', close_style: 'inside' },
    trigger: { icon: 'fas:envelope', shape: 'rounded', pulse: false, badge_show: true },
    colors: { trigger_bg: '#c81e1e', trigger_color: '#fff', header_bg: '#c81e1e', header_bg2: '#c81e1e', header_text: '#fff', cta_bg: '#c81e1e', cta_color: '#fff' },
    style: { gradient: false }, size: SIZE({ panel: 300, trigger: 48, icon: 20 })
  });

  add('chat-icons-navy', 'چت + انتخاب پیام‌رسان', 'chat', {
    layout: 'chat',
    header: { show: true, agent: 'علی رضایی', role: 'مشاور آموزشی', message: 'برای انتخاب دوره کمک لازم دارید؟', time: '12:30', online: true },
    items: [it('whatsapp', 'واتساپ', PH), it('telegram', 'تلگرام', 'id'), it('eitaa', 'ایتا', 'id'), it('sms', 'پیامک', PH)],
    cta: { show: false, text: 'شروع گفتگو با:' },
    opts: { chat_mode: 'icons', close_style: 'inside' },
    trigger: { icon: 'fas:comments', shape: 'rounded' },
    colors: { trigger_bg: '#25258a', trigger_color: '#fff', header_bg: '#25258a', header_bg2: '#3730a3', header_text: '#fff', social_bg: '#25258a', social_color: '#fff', item_title: '#475569' },
    style: { network_colors: false }, size: SIZE({ panel: 300, trigger: 48, icon: 20 })
  });

  add('chat-teal', 'چت سبز کله‌غازی', 'chat', {
    layout: 'chat',
    header: { show: true, agent: 'مریم کاظمی', role: 'مدیر حساب', message: 'سفارش‌تان را ثبت کردید؟ اگر سوالی هست بپرسید.', time: '14:30', online: true },
    items: [it('whatsapp', 'واتساپ', PH), it('phone', 'تماس', TEL), it('telegram', 'تلگرام', 'id'), it('email', 'ایمیل', 'info@site.ir')],
    cta: { show: false, text: 'گفتگو در:' },
    opts: { chat_mode: 'icons', close_style: 'inside' },
    trigger: { icon: 'fas:message', shape: 'rounded' },
    colors: { trigger_bg: '#0f766e', trigger_color: '#fff', header_bg: '#0f766e', header_bg2: '#0f766e', header_text: '#fff' },
    style: { network_colors: true }, size: SIZE({ panel: 300, trigger: 48, icon: 20 })
  });

  /* ---------- single buttons ---------- */
  add('cta-call-black', 'دکمه «تماس بگیرید» مشکی', 'button', {
    layout: 'cta', items: [it('phone', 'تماس', TEL)],
    cta: { show: true, text: 'همین حالا تماس بگیرید', icon: 'fas:phone', item: '' },
    trigger: { shape: 'pill', pulse: false }, colors: { trigger_bg: '#0b0b0b', trigger_color: '#fff' }, size: SIZE({ trigger: 52, icon: 22 })
  });
  add('cta-chat-green', 'دکمه «بیایید گفتگو کنیم»', 'button', {
    layout: 'cta', items: [it('whatsapp', 'واتساپ', PH)],
    cta: { show: true, text: 'بیایید گفتگو کنیم', icon: 'fab:whatsapp' },
    trigger: { shape: 'pill', pulse: true, greet_show: false }, colors: { trigger_bg: '#25d366', trigger_color: '#fff' }, size: SIZE({ trigger: 52, icon: 24 })
  });
  add('cta-navigate', 'دکمه مسیریابی', 'button', {
    layout: 'cta', items: [it('neshan', 'مسیریابی', 'https://nshn.ir/')],
    cta: { show: true, text: 'مسیریابی با نشان', icon: 'fab:waze' },
    trigger: { shape: 'pill' }, colors: { trigger_bg: '#38bdf8', trigger_color: '#fff' }, size: SIZE({ trigger: 52, icon: 24 })
  });
  add('bubble-whatsapp', 'حباب واتساپ + نشان', 'button', {
    layout: 'bubble', items: [it('whatsapp', 'واتساپ', PH, { message: 'سلام' })],
    trigger: { icon: 'fab:whatsapp', shape: 'circle', pulse: true, badge_show: true, badge_text: '1', greet_show: true, greet_text: 'سلام 👋 سوالی دارید؟ در واتساپ پیام بدید', greet_delay: 3 },
    colors: { trigger_bg: '#25d366', trigger_color: '#fff' }, size: SIZE({ trigger: 58, icon: 30 })
  });
  add('bubble-telegram', 'حباب تلگرام', 'button', {
    layout: 'bubble', items: [it('telegram', 'تلگرام', 'yourid')],
    trigger: { icon: 'fab:telegram', shape: 'circle', pulse: true, badge_show: true },
    colors: { trigger_bg: '#229ed9', trigger_color: '#fff' }, size: SIZE({ trigger: 58, icon: 32 })
  });
  add('bubble-eitaa', 'حباب ایتا', 'button', {
    layout: 'bubble', items: [it('eitaa', 'ایتا', 'yourid')],
    trigger: { icon: 'efa:eitaa', shape: 'circle', pulse: true },
    colors: { trigger_bg: '#ef7f1a', trigger_color: '#fff' }, size: SIZE({ trigger: 58, icon: 30 })
  });

  /* ---------- bars & stacks ---------- */
  add('pill-purple', 'نوار کپسولی بنفش', 'bar', {
    layout: 'pill', position: POS('bottom-center', 0, 20),
    items: [it('phone', 'تماس', TEL), it('email', 'ایمیل', 'info@site.ir')],
    colors: { trigger_bg: '#5b4ee5', trigger_color: '#fff' }, size: SIZE({ trigger: 56, icon: 24 })
  });
  add('pill-slate', 'نوار کپسولی چهار آیکون', 'bar', {
    layout: 'pill', position: POS('bottom-right'),
    items: [it('whatsapp', 'واتساپ', PH), it('phone', 'تماس', TEL), it('email', 'ایمیل', 'info@site.ir'), it('bale', 'بله', 'id')],
    colors: { trigger_bg: '#334155', trigger_color: '#fff' }, size: SIZE({ trigger: 52, icon: 22 })
  });
  add('pill-labels', 'نوار مشکی با برچسب', 'bar', {
    layout: 'pill', position: POS('bottom-center', 0, 20), opts: { pill_labels: true },
    items: [it('whatsapp', 'واتساپ', PH), it('messenger', 'مسنجر', 'page'), it('sms', 'پیامک', PH), it('phone', 'تماس', TEL)],
    colors: { trigger_bg: '#111111', trigger_color: '#fff' }, size: SIZE({ trigger: 52, icon: 20 })
  });
  add('tabs-red', 'زبانه‌های کناری قرمز', 'bar', {
    layout: 'tabs', position: POS('middle-left', 0, 0),
    items: [it('whatsapp', 'واتساپ', PH), it('tracking', 'پیگیری سفارش', '/track'), it('phone', 'تماس', TEL), it('email', 'ایمیل', 'info@site.ir'), it('website', 'وب‌سایت', '/')],
    opts: { tabs_expand: 'hover' },
    colors: { trigger_bg: '#e11d48', trigger_color: '#fff' }, size: SIZE({ trigger: 56, icon: 22, radius: 10 })
  });
  add('tabs-color', 'زبانه‌های رنگی شبکه‌ها', 'bar', {
    layout: 'tabs', position: POS('middle-right', 0, 0),
    items: [it('whatsapp', 'واتساپ', PH), it('telegram', 'تلگرام', 'id'), it('eitaa', 'ایتا', 'id'), it('instagram', 'اینستاگرام', 'page'), it('phone', 'تماس', TEL)],
    opts: { tabs_expand: 'hover' }, style: { network_colors: true },
    colors: { trigger_bg: '#334155', trigger_color: '#fff' }, size: SIZE({ trigger: 54, icon: 22, radius: 10 })
  });
  add('dial-dark', 'منوی شناور عمودی تیره', 'stack', {
    layout: 'speeddial',
    items: [it('phone', 'تماس با ما', TEL), it('whatsapp', 'واتساپ', PH), it('eitaa', 'ایتا', 'id'), it('email', 'ایمیل', 'info@site.ir')],
    opts: { dial_labels: 'always', close_style: 'trigger' },
    trigger: { icon: 'fas:comments', shape: 'circle', pulse: true },
    colors: { trigger_bg: '#111827', trigger_color: '#fff', icon_bg: '#111827', icon_color: '#fff', label_bg: '#ffffff', label_color: '#111827' }, size: SIZE({ trigger: 54, icon: 22 })
  });
  add('dial-color', 'منوی شناور رنگی', 'stack', {
    layout: 'speeddial',
    items: [it('whatsapp', 'واتساپ', PH), it('telegram', 'تلگرام', 'id'), it('bale', 'بله', 'id'), it('instagram', 'اینستاگرام', 'page'), it('phone', 'تماس', TEL)],
    opts: { dial_labels: 'hover', close_style: 'trigger' }, style: { network_colors: true },
    trigger: { icon: 'fas:plus', close_icon: 'fas:xmark', shape: 'circle', pulse: false },
    colors: { trigger_bg: '#2563eb', trigger_color: '#fff', label_bg: '#1e293b', label_color: '#fff' }, size: SIZE({ trigger: 56, icon: 24 })
  });
  add('bar-mobile', 'نوار پایین موبایل (آیکون‌ها)', 'bar', {
    layout: 'bar', position: POS('bottom-center', 0, 0),
    items: [it('phone', 'تماس', TEL), it('whatsapp', 'واتساپ', PH), it('eitaa', 'ایتا', 'id'), it('neshan', 'مسیر', 'https://nshn.ir/')],
    display: { desktop: false, tablet: true, mobile: true }, opts: { bar_mode: 'icons' },
    colors: { trigger_bg: '#0f172a', trigger_color: '#fff' }, size: SIZE({ trigger: 56, icon: 20 })
  });
  add('bar-mobile-cta', 'دکمه تمام‌عرض موبایل', 'bar', {
    layout: 'bar', position: POS('bottom-center', 0, 0),
    items: [it('phone', 'تماس', TEL)],
    cta: { show: true, text: 'تماس فوری با مشاور', icon: 'fas:phone' },
    display: { desktop: false, tablet: true, mobile: true }, opts: { bar_mode: 'cta' },
    colors: { trigger_bg: '#22c55e', trigger_color: '#fff' }, size: SIZE({ trigger: 60, icon: 22 })
  });

  w.FCP_TEMPLATES = T;
  w.FCP_TEMPLATE_CATS = { all: 'همه', panel: 'کارت‌های تماس', list: 'لیست لینک‌ها', chat: 'حباب گفتگو', button: 'تک دکمه', stack: 'منوی شناور', bar: 'نوار و زبانه' };
})(window);
