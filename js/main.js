/* Общий скрипт: шапка, подвал, плавающая кнопка, отрисовка блоков из data.js, форма. */
(function () {
  const S = window.SITE;
  const page = location.pathname.split("/").pop() || "index.html";

  /* Экранирование + подсветка заглушек в [квадратных скобках] */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ph = (s) => esc(s).replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>');

  const ICONS = {
    dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
    user: '<circle cx="12" cy="7.5" r="3.5"/><path d="M5 20.5c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
    group: '<circle cx="8" cy="8" r="3"/><circle cx="16.5" cy="9" r="2.5"/><path d="M2.5 19.5c.6-3 2.8-4.7 5.5-4.7s4.9 1.7 5.5 4.7M14 15.2c.8-.3 1.6-.4 2.5-.4 2.3 0 4.1 1.4 4.6 4"/>',
    hands: '<path d="M4 14c2-1 3.5-3.5 4-6 .3-1.3 2-1.3 2 .2V12M10 12V5.5c0-1.4 2-1.4 2 0V12M12 12V6.5c0-1.4 2-1.4 2 0V12M14 12V8c0-1.4 2-1.4 2 0v6c0 4-2.5 6.5-6 6.5-2.3 0-4-1-5.3-2.6"/>',
    steam: '<path d="M8 3c-1.2 1.6 1.2 2.6 0 4.2M12 3c-1.2 1.6 1.2 2.6 0 4.2M16 3c-1.2 1.6 1.2 2.6 0 4.2"/><path d="M3.5 11h17l-1.6 8.2a2 2 0 0 1-2 1.6H7.1a2 2 0 0 1-2-1.6L3.5 11z"/>',
    phone: '<path d="M5 3.5h3.2l1.6 4-2 1.3a11 11 0 0 0 5.4 5.4l1.3-2 4 1.6V17a2 2 0 0 1-2 2C9.6 19 5 14.4 5 5.5a2 2 0 0 1 0-2z"/>',
    tg: '<path d="M21 4 3 11l6 2.2M21 4l-3 16-9-6.8M21 4 9 13.2v5.3l3-3.4"/>',
    wa: '<path d="M4 20l1.2-3.9A8 8 0 1 1 8 19z"/><path d="M9 9.5c.3 2.4 2.1 4.2 4.5 4.6l1.1-1.2 1.9.8c-.3 1.3-1.3 1.8-2.3 1.8-3.4 0-6.2-2.8-6.2-6.2 0-1 .5-2 1.8-2.3l.8 1.9z"/>',
    camera: '<path d="M4 7.5h3l1.5-2h7l1.5 2h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    home: '<path d="M3.5 10.5 12 4l8.5 6.5"/><path d="M5.5 9v10.5h13V9"/><path d="M10 19.5v-5h4v5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    tag: '<path d="M3.5 12.5V4.5h8l9 9-8 8z"/><circle cx="8" cy="9" r="1.4"/>',
    chat: '<path d="M4 5.5h16v11H9l-5 4z"/>',
    kids: '<circle cx="12" cy="5.5" r="2.5"/><path d="M7 11l5-2 5 2M12 9v6M9 21l3-6 3 6"/>',
    dance: '<circle cx="14" cy="4.5" r="2"/><path d="M8 9l5-2 3 4 3 1M13 7l-1 7 3 3v4M12 14l-4 3-3-1"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    vk: '<path d="M3.5 7.5h3c.4 3.4 1.9 5.4 3.5 5.9V7.5h2.7v3.3c1.5-.2 3-1.8 3.6-3.3h2.7c-.5 2.2-2.1 3.9-3.3 4.6 1.2.6 3 2.1 3.7 4.4h-3c-.6-1.6-2-2.9-3.7-3.1v3.1h-.4C6.6 16.5 3.8 13 3.5 7.5z"/>',
    moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>'
  };
  const icon = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ""}</svg>`;
  const photo = (label, light) => `<div class="photo-ph${light ? " photo-ph--light" : ""}" role="img" aria-label="Место для фото: ${esc(label)}"><span>${icon("camera")}${esc(label)}</span></div>`;
  const tel = (raw) => (raw && !/^\[/.test(raw) ? "tel:" + raw.replace(/[^\d+]/g, "") : "kontakty.html");
  const callHref = S.club.phoneHref ? "tel:" + S.club.phoneHref : "kontakty.html";
  const mapSrc = S.club.yandexOrgId
    ? "https://yandex.ru/map-widget/v1/org/balance/" + S.club.yandexOrgId + "/?z=16"
    : "https://yandex.ru/map-widget/v1/?text=" + encodeURIComponent(S.club.mapQuery) + "&z=16";
  /* Запись на пробную — сразу в форму ВКонтакте (новая вкладка) */
  const bookHref = S.club.bookingUrl || "kontakty.html#zayavka";
  const ext = (url) => (/^https?:/.test(url) ? ' target="_blank" rel="noopener"' : "");
  const fmtNum = (n) => Number(n).toLocaleString("ru-RU");

  /* ---------- Cookie: выбор посетителя ----------
     "all" — разрешены сервисы Яндекса (карта, отзывы); "necessary" — только необходимые (тема сайта). */
  const CONSENT_KEY = "bg-cookies";
  const getConsent = () => { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } };
  const setConsent = (v) => {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
    document.dispatchEvent(new CustomEvent("bg-consent", { detail: v }));
  };
  /* Встраивание сервиса Яндекса: при согласии — сразу, иначе заглушка с кнопкой «Показать» */
  const embed = (el, src, title, label) => {
    const load = () => { el.innerHTML = `<iframe src="${src}" title="${esc(title)}" allowfullscreen></iframe>`; el.classList.add("is-loaded"); };
    if (getConsent() === "all") return load();
    el.innerHTML = `<div class="embed-ph">${icon("pin")}<p>${esc(label)}</p>
      <button type="button" class="b b--line press">Показать</button>
      <small>Загрузится сервис Яндекса, он использует cookie. <a href="cookie.html">Подробнее</a></small></div>`;
    el.querySelector("button").addEventListener("click", load);
    document.addEventListener("bg-consent", (e) => { if (e.detail === "all" && !el.classList.contains("is-loaded")) load(); });
  };

  /* «Открыто до 21:30» / «Закрыто, откроется в 8:00» — по времени Перми */
  const openStatus = () => {
    const sch = S.club.schedule;
    if (!sch) return "";
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Yekaterinburg" }));
    const mins = (t) => +t.slice(0, 2) * 60 + +t.slice(3);
    const nowM = now.getHours() * 60 + now.getMinutes();
    const today = sch[now.getDay()];
    if (today && nowM >= mins(today[0]) && nowM < mins(today[1])) return `<span class="open-dot is-open"></span>Открыто до ${today[1].replace(/^0/, "")}`;
    const next = today && nowM < mins(today[0]) ? today : sch[(now.getDay() + 1) % 7];
    return `<span class="open-dot"></span>Закрыто · откроется в ${next[0].replace(/^0/, "")}`;
  };

  /* Ссылки «в одно нажатие»: звонок, мессенджеры, карта. Пока в data.js заглушки — ведут на «Контакты». */
  const isPh = (s) => !s || /^\[/.test(s);
  const waHref = (n) => (isPh(n) ? "kontakty.html" : "https://wa.me/" + n.replace(/\D/g, ""));
  const tgHref = (n) => (isPh(n) ? "kontakty.html" : "https://t.me/" + n.replace(/^@/, ""));
  const mapLink = "https://yandex.ru/maps/?text=" + encodeURIComponent(S.club.mapQuery);
  const isApp = document.body.classList.contains("app");

  /* ---------- Тема (тёмная по умолчанию, выбор запоминается) ---------- */
  const setTheme = (t) => {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("bg-theme", t); } catch (e) {}
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "light" ? "#f3f1ec" : "#0c0c0d");
  };

  /* ---------- Шапка ---------- */
  const navItems = S.nav.map((n) => `<li><a href="${n.href}"${n.href === page ? ' aria-current="page"' : ""}>${esc(n.label)}</a></li>`).join("");
  const header = document.getElementById("site-header");
  if (header) {
    header.className = "site-header app-header";
    header.innerHTML = `
      <div class="wrap">
        <a class="logo" href="index.html" aria-label="${esc(S.club.name)} — на главную">
          <img src="assets/logo.png" alt="Логотип фитнес-клуба ${esc(S.club.name)}" width="36" height="36">
          <span><b>BALANCE GOLD</b><small>Live · фитнес-клуб</small></span>
        </a>
        <nav class="app-nav" aria-label="Основное меню">${S.nav.map((n) => `<a href="${n.href}"${n.href === page ? ' aria-current="page"' : ""}>${esc(n.label)}</a>`).join("")}</nav>
        ${isApp ? `<button class="icon-btn theme-btn" type="button" aria-label="Переключить тему"><span class="i-moon">${icon("moon")}</span><span class="i-sun">${icon("sun")}</span></button>` : ""}
        <button class="burger" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="mobile-menu"><span></span></button>
      </div>`;
    header.querySelector(".theme-btn")?.addEventListener("click", () =>
      setTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light"));

    /* Полноэкранное меню: все разделы строками + быстрые действия */
    const menuIcons = { "index.html": "home", "o-klube.html": "user", "trenery.html": "group", "zal.html": "dumbbell", "trenirovki.html": "calendar", "massazh-sauna.html": "steam", "ceny.html": "tag", "kontakty.html": "pin" };
    const menu = document.createElement("div");
    menu.className = "sheet";
    menu.id = "mobile-menu";
    menu.innerHTML = `
      <div class="card rows group">${S.nav.map((n) => `
        <a class="row" href="${n.href}"${n.href === page ? ' aria-current="page"' : ""}><span class="row__icon">${icon(menuIcons[n.href])}</span>
          <span class="row__text"><b>${esc(n.label)}</b></span><span class="row__chev"></span></a>`).join("")}</div>
      <a class="b b--gold b--block press" href="${bookHref}"${ext(bookHref)}>Записаться на пробную</a>
      <div class="sheet__actions">
        <a class="b b--line press" href="${callHref}">${icon("phone")}Позвонить</a>
        <a class="b b--line press" href="${mapLink}" target="_blank" rel="noopener">${icon("pin")}Маршрут</a>
      </div>`;
    header.after(menu);
    const burger = header.querySelector(".burger");
    const toggle = (open) => {
      burger.setAttribute("aria-expanded", open);
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => toggle(burger.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) toggle(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggle(false); });

    /* Прозрачная шапка над первым экраном, при прокрутке — размытый фон */
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Нижняя панель навигации (телефон) ---------- */
  const TABS = [["index.html", "home", "Главная"], ["trenirovki.html", "calendar", "Тренировки"], ["trenery.html", "group", "Тренеры"], ["ceny.html", "tag", "Цены"], ["kontakty.html", "pin", "Контакты"]];
  const tabbar = document.createElement("nav");
  tabbar.className = "tabbar";
  tabbar.setAttribute("aria-label", "Быстрая навигация");
  tabbar.innerHTML = TABS.map(([href, ic, label]) => `<a href="${href}"${href === page ? ' aria-current="page"' : ""}>${icon(ic)}<span>${label}</span></a>`).join("");
  document.body.appendChild(tabbar);

  /* ---------- Плашка cookie (показывается, пока посетитель не сделал выбор) ---------- */
  const cookieBar = document.createElement("div");
  cookieBar.className = "cookie-bar";
  cookieBar.setAttribute("role", "dialog");
  cookieBar.setAttribute("aria-label", "Использование файлов cookie");
  cookieBar.innerHTML = `
    <p>Мы используем файлы cookie: необходимые — для работы сайта, а также cookie сервисов Яндекса (карта и отзывы).
      Нажимая «Принять», вы соглашаетесь с <a href="cookie.html">политикой cookie</a> и <a href="privacy.html">политикой конфиденциальности</a>.</p>
    <div class="cookie-bar__actions">
      <button type="button" class="b b--gold press" data-consent="all">Принять</button>
      <button type="button" class="b b--line press" data-consent="necessary">Только необходимые</button>
    </div>`;
  document.body.appendChild(cookieBar);
  const showBar = (on) => cookieBar.classList.toggle("is-open", on);
  if (!getConsent()) setTimeout(() => showBar(true), 600);
  cookieBar.addEventListener("click", (e) => {
    const b = e.target.closest("[data-consent]");
    if (b) { setConsent(b.dataset.consent); showBar(false); }
  });
  document.addEventListener("click", (e) => { if (e.target.closest("[data-cookie-settings]")) showBar(true); });

  /* ---------- Подвал ---------- */
  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.className = "app-footer";
    footer.innerHTML = `
      <div class="wrap">
        <div class="app-footer__brand">
          <img src="assets/logo.png" alt="Логотип ${esc(S.club.name)}" width="52" height="52" loading="lazy">
          <div><b>BALANCE GOLD</b><small>${esc(S.club.type)} · ${esc(S.club.city)}</small></div>
        </div>
        <div class="card rows">
          <a class="row" href="${mapLink}" target="_blank" rel="noopener"><span class="row__icon">${icon("pin")}</span><span class="row__text"><b>${esc(S.club.address)}</b><span>Открыть на карте</span></span><span class="row__chev"></span></a>
          <a class="row" href="${callHref}"><span class="row__icon">${icon("phone")}</span><span class="row__text"><b>${ph(S.club.phone)}</b><span>Позвонить</span></span><span class="row__chev"></span></a>
          <a class="row" href="${S.club.vk}" target="_blank" rel="noopener"><span class="row__icon">${icon("vk")}</span><span class="row__text"><b>ВКонтакте</b><span>${fmtNum(S.club.vkSubscribers)} подписчиков</span></span><span class="row__chev"></span></a>
          <div class="row"><span class="row__icon">${icon("clock")}</span><span class="row__text"><b>${esc(S.club.hours)}</b><span>${openStatus()}</span></span></div>
        </div>
        <nav class="app-footer__links" aria-label="Разделы">${S.nav.slice(1).map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join("")}</nav>
        <nav class="app-footer__docs" aria-label="Документы">
          <a href="privacy.html">Политика конфиденциальности</a>
          <a href="cookie.html">Политика cookie</a>
          <button type="button" data-cookie-settings>Настройки cookie</button>
        </nav>
        <div class="app-footer__legal">
          <p><b>Официальный сайт фитнес-клуба ${esc(S.club.name)}</b></p>
          ${S.club.legal ? `<p>${esc(S.club.legal.owner)} · ИНН ${esc(S.club.legal.inn)} · ОГРН ${esc(S.club.legal.ogrn)}</p>` : ""}
          <p>Адрес: ${esc(S.club.address)}. Вопросы и претензии: ${esc(S.club.phone)}, сообщения группы ВКонтакте.</p>
          <p>Информация о ценах и акциях на сайте не является публичной офертой (ст. 437 ГК РФ). Актуальные условия уточняйте у администратора.</p>
          <p>Рейтинг и отзывы — сервис Яндекс Карты. Фото и видео размещены с согласия изображённых людей.</p>
        </div>
        <div class="app-footer__bottom"><span>© ${new Date().getFullYear()} ${esc(S.club.name)}</span><span>${esc(S.club.type)} · ${esc(S.club.district)}, ${esc(S.club.city)}</span></div>
      </div>`;
  }

  /* ---------- Блоки страницы (data-render="...") ---------- */
  const R = {
    clubText: (el) => (el.innerHTML = ph(S.club[el.dataset.key] || "")),
    facts: (el) => (el.innerHTML = S.club.facts.map((f) => `<div><b>${ph(f.value)}</b><span>${esc(f.label)}</span></div>`).join("")),
    services: (el) => (el.innerHTML = S.services.map((s) => `
      <a class="service reveal" href="${s.href}">
        <span class="service__icon">${icon(s.icon)}</span>
        <h3>${esc(s.title)}</h3><p>${ph(s.text)}</p><span class="service__more">Подробнее →</span>
      </a>`).join("")),
    muscles: (el) => (el.innerHTML = S.equipment.map((g) => `
      <div class="muscle reveal"><div><b>${esc(g.group)}</b><small>${esc(g.items.slice(0, 2).map((i) => i[0]).join(", "))}${g.items.length > 2 ? "…" : ""}</small></div>
      <span class="muscle__count" aria-label="${g.items.length} позиций">${g.items.length}</span></div>`).join("")),
    equipTotal: (el) => (el.textContent = S.equipment.reduce((n, g) => n + g.items.length, 0)),
    trainers: (el) => {
      const n = +el.dataset.limit || S.trainers.length;
      el.innerHTML = S.trainers.slice(0, n).map((t, i) => `
        <article class="trainer reveal" data-dirs="${t.directions.join(" ")}">
          ${photo("Фото тренера", true)}
          <div class="trainer__body">
            <span class="trainer__tag">${esc(t.role)}</span>
            <h3><button type="button" class="trainer__open" data-trainer="${i}">${ph(t.name)}<span class="sr-only"> — подробнее</span></button></h3>
            <dl><dt>Стаж</dt><dd>${ph(t.experience)}</dd><dt>Персональная</dt><dd>${ph(t.price)}</dd></dl>
            <div class="trainer__contacts">
              <a class="contact-btn" href="${tel(t.phone)}" title="${esc(t.phone)}">${icon("phone")}Позвонить</a>
              <a class="contact-btn" href="#" title="${esc(t.telegram)}">${icon("tg")}Telegram</a>
              <a class="contact-btn" href="#" title="${esc(t.whatsapp)}">${icon("wa")}WhatsApp</a>
            </div>
          </div>
        </article>`).join("");
    },
    prices: (el) => (el.innerHTML = S.prices.map((p) => `
      <article class="price reveal${p.popular ? " price--popular" : ""}">
        ${p.popular ? '<span class="price__badge">Популярный</span>' : ""}
        <h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>
        <div class="price__value">${ph(p.value)}<small>${esc(p.per)}</small></div>
        <ul>${p.features.map((f) => `<li>${ph(f)}</li>`).join("")}</ul>
        <a class="btn ${p.popular ? "btn--gold" : "btn--outline"} btn--sm" href="${page === "index.html" ? "" : "kontakty.html"}#zayavka">Выбрать</a>
      </article>`).join("")),
    extras: (el) => (el.innerHTML = S.extras.map((x) => `<span>${ph(x)}</span>`).join("")),
    reviews: (el) => (el.innerHTML = S.reviews.map((r) => `
      <figure class="review reveal" style="margin:0">
        <div class="review__stars" aria-label="Оценка: [__] из 5">★★★★★</div>
        <blockquote>${ph(r.text)}</blockquote>
        <figcaption class="review__author"><span class="review__avatar" aria-hidden="true"></span><span>${ph(r.author)}<small>${ph(r.meta)}</small></span></figcaption>
      </figure>`).join("")),
    map: (el) => embed(el, mapSrc, "Карта: " + S.club.address, "Карта Яндекса: " + S.club.address),
    contactInfo: (el) => (el.innerHTML = `
      <div><small>Адрес</small>${ph(S.club.address)}</div>
      <div><small>Телефон</small><a href="${callHref}">${ph(S.club.phone)}</a></div>
      <div><small>Режим работы</small>${ph(S.club.hours)}</div>
      <div><small>Соцсети</small>${S.club.socials.map((s) => `<a href="${s.url}">${esc(s.name)}</a>`).join(" · ")}</div>`),
    leadForm: (el) => (el.outerHTML = `
      <form class="form" data-lead-form novalidate aria-labelledby="lead-title">
        <h3 id="lead-title">Заявка</h3>
        <p>Оставьте телефон — администратор перезвонит и подберёт время.</p>
        <div class="field"><label for="f-name">Имя</label>
          <input id="f-name" name="name" type="text" autocomplete="given-name" required><span class="field__error" aria-live="polite"></span></div>
        <div class="field"><label for="f-phone">Телефон</label>
          <input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required><span class="field__error" aria-live="polite"></span></div>
        <div class="field"><label for="f-interest">Что интересует</label>
          <select id="f-interest" name="interest" required><option value="">Выберите…</option>${S.formInterests.map((i) => `<option>${esc(i)}</option>`).join("")}</select><span class="field__error" aria-live="polite"></span></div>
        <div class="field"><label for="f-comment">Комментарий</label>
          <textarea id="f-comment" name="comment" placeholder="Удобное время, цель тренировок…"></textarea></div>
        <label class="check"><input type="checkbox" name="consent" required>
          <span>Согласен(на) на обработку персональных данных по <a href="privacy.html">политике конфиденциальности</a><span class="field__error" aria-live="polite" style="display:block"></span></span></label>
        <button class="btn btn--gold btn--block" type="submit">Отправить заявку</button>
        <div class="form__success" role="status">Спасибо! Заявка принята (демо-режим: пока никуда не отправляется).</div>
      </form>`),

    /* --- О клубе --- */
    director: (el) => {
      const d = S.about.director;
      el.innerHTML = `${photo("Фото директора", true)}
        <div class="director__text reveal"><span class="eyebrow">О директоре</span>
          <h2>${ph(d.name)}</h2><p class="director__role">${esc(d.role)}</p><p>${ph(d.text)}</p></div>`;
    },
    history: (el) => (el.innerHTML = S.about.history.map((h) => `
      <li class="timeline__item reveal"><span class="timeline__year">${ph(h.year)}</span><p>${ph(h.text)}</p></li>`).join("")),
    numbers: (el) => (el.innerHTML = S.about.numbers.map((n) => `<div class="number reveal"><b>${ph(n.value)}</b><span>${esc(n.label)}</span></div>`).join("")),

    /* --- Тренеры: фильтр --- */
    trainerFilters: (el) => {
      el.innerHTML = S.trainerFilters.map((f, i) => `<button type="button" class="chip" aria-pressed="${i === 0}" data-filter="${f.id}">${esc(f.label)}</button>`).join("");
      el.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-filter]");
        if (!btn) return;
        el.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", b === btn));
        const f = btn.dataset.filter;
        document.querySelectorAll(".trainer[data-dirs]").forEach((card) => {
          card.hidden = f !== "all" && !card.dataset.dirs.split(" ").includes(f);
        });
      });
    },

    /* --- Зал: полный список тренажёров --- */
    equipmentFull: (el) => (el.innerHTML = S.equipment.map((g, i) => `
      <details class="acc reveal"${i === 0 ? " open" : ""}>
        <summary><span class="acc__num">${String(i + 1).padStart(2, "0")}</span><span class="acc__title">${esc(g.group)}</span><span class="acc__count">${g.items.length}</span><span class="acc__chev" aria-hidden="true"></span></summary>
        <div class="acc__body">
          ${photo("Фото: " + g.group)}
          <ul class="equip-list">${g.items.map((it) => `<li><b>${esc(it[0])}</b>${it[1] ? `<span>${ph(it[1])}</span>` : ""}</li>`).join("")}</ul>
        </div>
      </details>`).join("")),

    /* --- Тренировки: табы --- */
    trainingTabs: (el) => {
      el.innerHTML = `<div class="tabs" role="tablist" aria-label="Форматы тренировок">${S.trainings.map((t, i) => `
          <button class="tab" role="tab" id="tab-${t.id}" aria-controls="panel-${t.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(t.title)}</button>`).join("")}</div>
        ${S.trainings.map((t, i) => `
          <div class="tab-panel" role="tabpanel" id="panel-${t.id}" aria-labelledby="tab-${t.id}"${i ? " hidden" : ""}>
            <div class="tab-panel__grid">
              <div><h2>${esc(t.title)}</h2><p class="lead">${esc(t.lead)}</p>
                <ul class="checklist">${t.points.map((p) => `<li>${ph(p)}</li>`).join("")}</ul>
                <a class="btn btn--gold" href="kontakty.html#zayavka">Записаться</a></div>
              ${photo("Фото: " + t.title)}
            </div>
          </div>`).join("")}`;
      const tabs = [...el.querySelectorAll(".tab")];
      const select = (tab) => tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      tabs.forEach((t, i) => {
        t.addEventListener("click", () => select(t));
        t.addEventListener("keydown", (e) => {
          const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!d) return;
          const next = tabs[(i + d + tabs.length) % tabs.length]; select(next); next.focus();
        });
      });
    },
    schedule: (el) => {
      const sc = S.schedule;
      const cell = (c) => (c ? `<div class="slot">${c.split("\n").map((x, i) => i ? `<small>${ph(x)}</small>` : `<b>${ph(x)}</b>`).join("")}</div>` : "");
      const table = `<div class="table-wrap schedule-table"><table class="table">
          <thead><tr><th scope="col">Время</th>${sc.days.map((d) => `<th scope="col">${d}</th>`).join("")}</tr></thead>
          <tbody>${sc.rows.map((r) => `<tr><th scope="row">${ph(r.time)}</th>${r.cells.map((c) => `<td>${cell(c)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table></div>`;
      const list = `<div class="schedule-list">${sc.days.map((d, di) => {
          const items = sc.rows.filter((r) => r.cells[di]);
          return `<div class="day"><h3>${d}</h3>${items.length ? items.map((r) => `<div class="day__row"><span>${ph(r.time)}</span>${cell(r.cells[di])}</div>`).join("") : '<p class="day__empty">Нет групповых занятий</p>'}</div>`;
        }).join("")}</div>`;
      el.innerHTML = table + list;
    },

    /* --- Массаж и сауна --- */
    massage: (el) => (el.innerHTML = S.massage.map((m) => `
      <article class="mcard reveal"><h3>${ph(m.title)}</h3>
        <div class="mcard__meta"><span>${ph(m.duration)}</span><b>${ph(m.price)}</b></div>
        <a class="btn btn--ghost btn--sm" href="kontakty.html#zayavka">Записаться</a></article>`).join("")),
    sauna: (el) => {
      const s = S.sauna;
      el.innerHTML = `<p class="lead">${ph(s.text)}</p>
        <div class="kv"><div><small>Режим</small>${ph(s.hours)}</div><div><small>Стоимость</small>${ph(s.price)}</div></div>
        <h3 class="sub">Правила посещения</h3><ul class="checklist">${s.rules.map((r) => `<li>${ph(r)}</li>`).join("")}</ul>`;
    },

    /* --- Цены --- */
    priceTable: (el) => {
      const t = S.priceTable;
      el.innerHTML = `<table class="table table--prices">
        <thead><tr><th scope="col">Формат</th>${t.cols.map((c, i) => `<th scope="col"${i === 1 ? ' class="is-popular"' : ""}>${esc(c)}</th>`).join("")}</tr></thead>
        <tbody>${t.rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th>${r.slice(1).map((c, i) => `<td${i === 1 ? ' class="is-popular"' : ""}>${c === "✓" ? '<span class="tick" aria-label="Есть">✓</span>' : c === "—" ? '<span class="dash" aria-label="Нет">—</span>' : ph(c)}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>`;
    },
    extraPrices: (el) => (el.innerHTML = S.extraPrices.map((p) => `<div class="extra-row"><span>${ph(p[0])}</span><b>${ph(p[1])}</b></div>`).join("")),

    /* ===== Главная v2 (мобильная) ===== */
    stats2: (el) => (el.innerHTML = S.stats.map((s, i) => {
      const n = String(s.value).match(/^\d+$/) ? `<b data-count="${s.value}">0</b>` : `<b>${ph(s.value)}</b>`;
      return `<div class="glass" data-anim="up" style="--i:${i}">${n}<span>${esc(s.label)}</span></div>`;
    }).join("")),
    dirCards: (el) => (el.innerHTML = S.directions.map((d, i) => `
      <a class="photo-card press" href="${d.href}" data-anim="${i % 2 ? "right" : "left"}" style="--i:${i % 3}">
        <span class="photo-card__ph">Фото: ${esc(d.title.toLowerCase())}</span>
        <span class="photo-card__icon">${icon(d.icon)}</span>
        <h3>${esc(d.title)}</h3><p>${ph(d.text)}</p>
        <span class="round-arrow" aria-hidden="true">${icon("arrow")}</span>
      </a>`).join("")),
    serviceRows: (el) => (el.innerHTML = S.services.map((s) => `
      <a class="row" href="${s.href}"><span class="row__icon">${icon(s.icon)}</span>
        <span class="row__text"><b>${esc(s.title)}</b><span>${ph(s.text)}</span></span><span class="row__chev"></span></a>`).join("")),
    steps2: (el) => (el.innerHTML = S.steps.map((s, i) => `
      <div class="step2${s.accent ? " step2--accent" : ""}" data-anim="up" style="--i:${i}">
        <i>${String(i + 1).padStart(2, "0")}</i><b>${esc(s.title)}</b><p>${ph(s.text)}</p></div>`).join("")),
    muscleRows: (el) => {
      const n = +el.dataset.limit || S.equipment.length;
      el.innerHTML = S.equipment.slice(0, n).map((g) => `
        <a class="row" href="zal.html"><span class="row__icon">${icon("dumbbell")}</span>
          <span class="row__text"><b>${esc(g.group)}</b><span>${esc(g.items.slice(0, 3).map((i) => i[0]).join(", "))}</span></span>
          <span class="row__meta">${g.items.length}</span><span class="row__chev"></span></a>`).join("");
    },
    coaches: (el) => {
      const n = +el.dataset.limit || S.trainers.length;
      el.innerHTML = S.trainers.slice(0, n).map((t, i) => `
        <article class="card coach" data-anim="up" style="--i:${i % 3}" data-dirs="${t.directions.join(" ")}">
          <div class="coach__photo" role="img" aria-label="Место для фото тренера">${icon("camera")}</div>
          <div class="coach__body">
            <span class="coach__role">${esc(t.role)}</span>
            <h3 class="coach__name"><button type="button" data-trainer="${i}">${ph(t.name)}<span class="sr-only"> — подробнее</span></button></h3>
            <div class="coach__meta"><span>Стаж</span><b>${ph(t.experience)}</b></div>
            <div class="coach__meta"><span>Персональная</span><b>${ph(t.price)}</b></div>
            ${el.dataset.more ? `<button type="button" class="coach__more" data-trainer="${i}">Подробнее о тренере</button>` : ""}
            <div class="coach__actions">
              <a class="chip-btn press" href="${tel(t.phone)}" aria-label="Позвонить тренеру">${icon("phone")}</a>
              <a class="chip-btn press" href="${tgHref(t.telegram)}" aria-label="Написать в Telegram">${icon("tg")}</a>
              <a class="chip-btn press" href="${waHref(t.whatsapp)}" aria-label="Написать в WhatsApp">${icon("wa")}</a>
            </div>
          </div>
        </article>`).join("");
    },
    dayTabs: (el) => {
      const sc = S.schedule;
      const today = (new Date().getDay() + 6) % 7;
      el.innerHTML = `<div class="days" role="tablist" aria-label="День недели">${sc.days.map((d, i) =>
          `<button class="day-btn" role="tab" type="button" aria-selected="${i === today}" data-day="${i}">${d}</button>`).join("")}</div>
        <div class="card rows" role="tabpanel" aria-live="polite"></div>`;
      const list = el.querySelector(".rows");
      const show = (di) => {
        el.querySelectorAll(".day-btn").forEach((b) => b.setAttribute("aria-selected", +b.dataset.day === di));
        const items = sc.rows.filter((r) => r.cells[di]);
        list.innerHTML = items.length ? items.map((r) => {
          const [what, who] = r.cells[di].split("\n");
          return `<a class="row" href="trenirovki.html"><span class="row__time">${ph(r.time)}</span>
            <span class="row__text"><b>${ph(what)}</b><span>${ph(who || "")}</span></span><span class="row__chev"></span></a>`;
        }).join("") : '<p class="empty">В этот день групповых занятий нет — зал открыт для самостоятельных тренировок.</p>';
      };
      el.addEventListener("click", (e) => { const b = e.target.closest(".day-btn"); if (b) show(+b.dataset.day); });
      show(today);
    },
    plans: (el) => (el.innerHTML = S.prices.map((p, i) => `
      <article class="card plan${p.popular ? " plan--hot" : ""}" data-anim="up" style="--i:${i}">
        ${p.popular ? '<span class="plan__badge">Популярный</span>' : ""}
        <h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>
        <div class="plan__price">${ph(p.value)}${p.old ? `<s>${esc(p.old)}</s>` : ""}${p.per ? `<small>${esc(p.per)}</small>` : ""}</div>
        <ul>${p.features.map((f) => `<li>${icon("check")}<span>${ph(f)}</span></li>`).join("")}</ul>
        <a class="b ${p.popular ? "b--gold" : "b--line"} b--block press" href="${S.club.vkMessages}" target="_blank" rel="noopener">Купить через ВКонтакте</a>
      </article>`).join("")),
    quotes: (el) => (el.innerHTML = S.reviews.map((r, i) => `
      <figure class="card quote" style="margin:0;--i:${i}" data-anim="up">
        <div class="quote__stars" aria-hidden="true">★★★★★</div>
        <blockquote>${ph(r.text)}</blockquote>
        <figcaption class="quote__who"><i aria-hidden="true"></i><span>${ph(r.author)}<small>${ph(r.meta)}</small></span></figcaption>
      </figure>`).join("")),
    contactRows: (el) => {
      el.innerHTML = `
        <a class="row" href="${mapLink}" target="_blank" rel="noopener"><span class="row__icon">${icon("pin")}</span><span class="row__text"><b>${esc(S.club.address)}</b><span>${esc(S.club.landmark || "Построить маршрут")}</span></span><span class="row__chev"></span></a>
        <a class="row" href="${callHref}"><span class="row__icon">${icon("phone")}</span><span class="row__text"><b>${ph(S.club.phone)}</b><span>Позвонить</span></span><span class="row__chev"></span></a>
        <a class="row" href="${S.club.vkMessages}" target="_blank" rel="noopener"><span class="row__icon">${icon("chat")}</span><span class="row__text"><b>Написать во ВКонтакте</b><span>Ответим в сообщениях группы</span></span><span class="row__chev"></span></a>
        <a class="row" href="${bookHref}"${ext(bookHref)}><span class="row__icon">${icon("calendar")}</span><span class="row__text"><b>Записаться на пробную</b><span>300 ₽ · онлайн-запись ВКонтакте</span></span><span class="row__chev"></span></a>
        <div class="row"><span class="row__icon">${icon("clock")}</span><span class="row__text"><b>Пн–Пт 8:00–21:30</b><span>Сб–Вс 10:00–18:00 · ${openStatus()}</span></span></div>`;
    },

    /* Акции (скрываются сами после даты until) */
    promos: (el) => {
      const today = new Date().toISOString().slice(0, 10);
      const list = (S.promos || []).filter((p) => !p.until || p.until >= today);
      if (!list.length) { el.closest("section")?.remove(); return; }
      const url = (u) => (u === "booking" ? bookHref : u === "vkMessages" ? S.club.vkMessages : u);
      el.innerHTML = list.map((p, i) => `
        <article class="promo${i === 0 ? " promo--gold" : ""}" data-anim="up" style="--i:${i}">
          <span class="promo__badge">${esc(p.badge)}</span>
          <h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>
          <a class="b ${i === 0 ? "b--dark" : "b--gold"} b--block press" href="${url(p.url)}"${ext(url(p.url))}>${esc(p.cta)}</a>
        </article>`).join("");
    },
    /* Отзывы — живой виджет Яндекс Карт (всегда актуальные, без ручного копирования) */
    yaReviews: (el) => {
      const c = S.club, r = c.rating;
      el.innerHTML = `
        <div class="card rating" data-anim="up">
          <div class="rating__top"><b>${esc(r.value)}</b>
            <div><span class="rating__stars" aria-hidden="true">★★★★★</span>
              <span class="rating__meta">${r.votes} оценок · ${r.reviews} отзыва на Яндекс Картах</span></div></div>
          ${(r.aspects || []).map((x) => `<div class="rating__row"><span>${esc(x.label)}</span><span class="rating__bar"><i style="width:${x.value}%"></i></span><b>${x.value}%</b></div>`).join("")}
          ${r.aspects ? '<p class="rating__note">Доля положительных упоминаний в отзывах</p>' : ""}
          <a class="b b--line b--block press" href="${c.yandexUrl}reviews/" target="_blank" rel="noopener">Читать все отзывы на Яндекс Картах</a>
        </div>
        <div class="card ya-widget" data-anim="up" style="--i:1"></div>`;
      embed(el.querySelector(".ya-widget"), `https://yandex.ru/maps-reviews-widget/${c.yandexOrgId}?comments`,
        "Отзывы о клубе на Яндекс Картах", "Свежие отзывы с Яндекс Карт");
    },
    /* Запись — только через ВКонтакте (вместо формы на сайте) */
    bookCard: (el) => (el.outerHTML = `
      <div class="card book">
        <h3>Пробная тренировка за 300 ₽</h3>
        <p>Запись онлайн через ВКонтакте: выберите направление и удобное время, администратор подтвердит запись.</p>
        <a class="b b--gold b--block press" href="${bookHref}"${ext(bookHref)}>${icon("calendar")}Записаться на пробную</a>
        <a class="b b--line b--block press" href="${S.club.vkMessages}" target="_blank" rel="noopener">${icon("chat")}Написать во ВКонтакте</a>
        <a class="b b--line b--block press" href="${callHref}">${icon("phone")}Позвонить ${esc(S.club.phone)}</a>
      </div>`),
    openStatus: (el) => (el.innerHTML = openStatus()),
    hoursRows: (el) => (el.innerHTML = `
      <div class="row"><span class="row__icon">${icon("clock")}</span><span class="row__text"><b>Понедельник — пятница</b></span><span class="row__meta">8:00–21:30</span></div>
      <div class="row"><span class="row__icon">${icon("calendar")}</span><span class="row__text"><b>Суббота и воскресенье</b></span><span class="row__meta">10:00–18:00</span></div>`),
    legal: (el) => (el.textContent = S.club.legal ? `${S.club.legal.owner}, ИНН ${S.club.legal.inn}, ОГРН ${S.club.legal.ogrn}` : "[реквизиты]"),

    /* ===== Внутренние страницы v2 ===== */
    person: (el) => {
      const d = S.about.director;
      el.innerHTML = `<div class="person__photo" role="img" aria-label="Место для фото директора">${icon("camera")}</div>
        <div class="person__body"><span class="dot-label">О директоре</span><h2>${ph(d.name)}</h2>
          <span class="person__role">${esc(d.role)}</span><p>${ph(d.text)}</p></div>`;
    },
    historyRows: (el) => (el.innerHTML = S.about.history.map((h) => `
      <div class="row"><span class="row__year">${ph(h.year)}</span><span class="row__text"><b>${ph(h.text)}</b></span></div>`).join("")),
    metrics: (el) => (el.innerHTML = S.about.numbers.map((n, i) => `
      <div class="card metric" data-anim="up" style="--i:${i}">${/^\d+$/.test(n.value) ? `<b data-count="${n.value}">0</b>` : `<b>${ph(n.value)}</b>`}<span>${esc(n.label)}</span></div>`).join("")),
    pills: (el) => {
      el.innerHTML = S.trainerFilters.map((f, i) => `<button type="button" class="pill press" aria-pressed="${i === 0}" data-filter="${f.id}">${esc(f.label)}</button>`).join("");
      el.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-filter]");
        if (!btn) return;
        el.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", b === btn));
        const f = btn.dataset.filter;
        document.querySelectorAll(".coach[data-dirs]").forEach((c) => {
          c.hidden = f !== "all" && !c.dataset.dirs.split(" ").includes(f);
          if (!c.hidden) c.classList.add("in");
        });
      });
    },
    equipFolds: (el) => (el.innerHTML = S.equipment.map((g, i) => `
      <details class="card fold" data-anim="up" style="--i:${i % 3}"${i === 0 ? " open" : ""}>
        <summary class="row"><span class="row__icon">${icon("dumbbell")}</span>
          <span class="row__text"><b>${esc(g.group)}</b><span>${g.items.length} ${g.items.length === 1 ? "позиция" : g.items.length < 5 ? "позиции" : "позиций"}</span></span>
          <span class="row__chev"></span></summary>
        <div class="fold__body">
          <div class="fold__photo" role="img" aria-label="Место для фото: ${esc(g.group)}">Фото: ${esc(g.group.toLowerCase())}</div>
          ${g.items.map((it) => `<div class="row"><span class="row__dot"></span><span class="row__text"><b>${esc(it[0])}</b>${it[1] ? `<span>${ph(it[1])}</span>` : ""}</span></div>`).join("")}
        </div>
      </details>`).join("")),
    /* Счётчики «считаются» от 0 при появлении на экране */
    equipCount: (el) => { el.dataset.count = S.equipment.reduce((n, g) => n + g.items.length, 0); el.textContent = "0"; },
    groupCount: (el) => { el.dataset.count = S.equipment.length; el.textContent = "0"; },
    formats: (el) => {
      const pics = { self: "dumbbell", personal: "user", group: "group" };
      el.innerHTML = `<div class="seg" role="tablist" aria-label="Формат тренировок">${S.trainings.map((t, i) =>
          `<button role="tab" type="button" id="tab-${t.id}" aria-controls="panel-${t.id}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}">${esc(t.title)}</button>`).join("")}</div>
        ${S.trainings.map((t, i) => `
          <div class="format" role="tabpanel" id="panel-${t.id}" aria-labelledby="tab-${t.id}"${i ? " hidden" : ""}>
            <div class="photo-card" role="img" aria-label="Место для фото: ${esc(t.title)}">
              <span class="photo-card__ph">Фото: ${esc(t.title.toLowerCase())}</span>
              <span class="photo-card__icon">${icon(pics[t.id])}</span>
              <h3>${esc(t.title)}</h3>
            </div>
            <div class="card rows">
              <p class="format__lead">${esc(t.lead)}</p>
              ${t.points.map((p) => `<div class="row"><span class="row__check">${icon("check")}</span><span class="row__text"><b>${ph(p)}</b></span></div>`).join("")}
              <div style="padding:12px 16px 16px"><a class="b b--gold b--block press" href="kontakty.html#zayavka">Записаться</a></div>
            </div>
          </div>`).join("")}`;
      const tabs = [...el.querySelectorAll('[role="tab"]')];
      const select = (tab) => tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      tabs.forEach((t, i) => {
        t.addEventListener("click", () => select(t));
        t.addEventListener("keydown", (e) => {
          const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; select(n); n.focus(); }
        });
      });
    },
    massageRows: (el) => (el.innerHTML = S.massage.map((m) => `
      <a class="row" href="kontakty.html#zayavka"><span class="row__icon">${icon("hands")}</span>
        <span class="row__text"><b>${ph(m.title)}</b><span>${ph(m.duration)}</span></span>
        <span class="row__meta">${ph(m.price)}</span><span class="row__chev"></span></a>`).join("")),
    saunaRows: (el) => {
      const s = S.sauna;
      el.innerHTML = `<p class="format__lead">${ph(s.text)}</p>
        <div class="row"><span class="row__icon">${icon("clock")}</span><span class="row__text"><b>${ph(s.hours)}</b><span>Режим работы</span></span></div>
        <div class="row"><span class="row__icon">${icon("tag")}</span><span class="row__text"><b>${ph(s.price)}</b><span>Стоимость</span></span></div>
        ${s.rules.map((r) => `<div class="row"><span class="row__check">${icon("check")}</span><span class="row__text"><b>${ph(r)}</b></span></div>`).join("")}`;
    },
    compare: (el) => {
      const t = S.priceTable, hot = 1;
      const cell = (c) => (c === "✓" ? '<span class="yes" aria-label="Есть">✓</span>' : c === "—" ? '<span class="no" aria-label="Нет">—</span>' : ph(c));
      el.innerHTML = `
        <div class="compare-cards">${t.cols.map((col, ci) => `
          <div class="card rows${ci === hot ? " plan--hot" : ""}" data-anim="up" style="--i:${ci}">
            <h3>${esc(col)}</h3>
            ${t.rows.filter((r) => r[ci + 1] !== "—").map((r) => `<div class="row"><span class="row__text"><b>${esc(r[0])}</b></span><span class="row__meta">${cell(r[ci + 1])}</span></div>`).join("")}
          </div>`).join("")}</div>
        <div class="card compare-table"><table>
          <thead><tr><th scope="col">Формат</th>${t.cols.map((c, i) => `<th scope="col"${i === hot ? ' class="hot"' : ""}>${esc(c)}</th>`).join("")}</tr></thead>
          <tbody>${t.rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th>${r.slice(1).map((c, i) => `<td${i === hot ? ' class="hot"' : ""}>${cell(c)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table></div>`;
    },
    extraRows: (el) => (el.innerHTML = S.extraPrices.map((p) => `
      <div class="row"><span class="row__text"><b>${ph(p[0])}</b></span><span class="row__meta">${ph(p[1])}</span></div>`).join("")),
    quick: (el) => {
      el.innerHTML = `<a class="press" href="${callHref}">${icon("phone")}Позвонить</a>
        <a class="press" href="${S.club.vkMessages}" target="_blank" rel="noopener">${icon("vk")}ВКонтакте</a>
        <a class="press" href="${mapLink}" target="_blank" rel="noopener">${icon("pin")}Маршрут</a>`;
    },

    interests: (el) => (el.innerHTML = '<option value="">Выберите…</option>' + S.formInterests.map((i) => `<option>${esc(i)}</option>`).join(""))
  };
  document.querySelectorAll("[data-render]").forEach((el) => R[el.dataset.render] && R[el.dataset.render](el));

  /* Кнопки «Записаться на пробную» (data-book) ведут в онлайн-запись ВКонтакте */
  document.querySelectorAll("[data-book]").forEach((a) => {
    a.href = bookHref;
    if (/^https?:/.test(bookHref)) { a.target = "_blank"; a.rel = "noopener"; }
  });

  /* Подсветка заглушек [..], написанных прямо в HTML страниц */
  const walker = document.createTreeWalker(document.getElementById("main") || document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (/\[[^\]]+\]/.test(n.nodeValue) && !n.parentElement.closest(".ph, script, option, textarea")) textNodes.push(n);
  }
  textNodes.forEach((n) => {
    const span = document.createElement("span");
    span.innerHTML = ph(n.nodeValue);
    n.replaceWith(...span.childNodes);
  });

  /* ---------- Подробная карточка тренера (модальное окно) ---------- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-trainer]");
    if (!btn) return;
    const t = S.trainers[+btn.dataset.trainer];
    let dlg = document.getElementById("trainer-dialog");
    if (!dlg) {
      dlg = document.createElement("dialog");
      dlg.id = "trainer-dialog";
      dlg.className = "dialog";
      dlg.addEventListener("click", (ev) => { if (ev.target === dlg || ev.target.closest("[data-close]")) dlg.close(); });
      document.body.appendChild(dlg);
    }
    dlg.setAttribute("aria-label", "Тренер");
    dlg.innerHTML = `<div class="dialog__inner">
        <button type="button" class="dialog__close" data-close aria-label="Закрыть">×</button>
        ${photo("Фото тренера", true)}
        <div class="dialog__body">
          <span class="trainer__tag">${esc(t.role)}</span>
          <h2>${ph(t.name)}</h2>
          <dl class="kv"><div><small>Стаж</small>${ph(t.experience)}</div><div><small>Персональная тренировка</small>${ph(t.price)}</div></dl>
          <h3 class="sub">О себе</h3><p>${ph("[О себе — подход к тренировкам, с кем работает]")}</p>
          <h3 class="sub">Достижения</h3><p>${ph("[Спортивные достижения, результаты клиентов]")}</p>
          <h3 class="sub">Сертификаты</h3><p>${ph("[Образование и сертификаты]")}</p>
          <div class="trainer__contacts">
            <a class="contact-btn" href="${tel(t.phone)}">${icon("phone")}${ph(t.phone)}</a>
            <a class="contact-btn" href="#">${icon("tg")}${ph(t.telegram)}</a>
            <a class="contact-btn" href="#">${icon("wa")}${ph(t.whatsapp)}</a>
          </div>
        </div>
      </div>`;
    dlg.showModal();
  });

  /* ---------- Форма заявки ---------- */
  document.querySelectorAll("form[data-lead-form]").forEach((form) => {
    const setErr = (name, msg) => {
      const field = form.querySelector(`[name="${name}"]`).closest(".field, .check");
      field.classList.toggle("is-invalid", !!msg);
      const out = field.querySelector(".field__error");
      if (out) out.textContent = msg || "";
    };
    const phoneInput = form.querySelector('[name="phone"]');
    phoneInput.addEventListener("input", () => {
      let d = phoneInput.value.replace(/\D/g, "");
      if (!d) return (phoneInput.value = "");
      if (d[0] === "8") d = "7" + d.slice(1);
      if (d[0] !== "7") d = "7" + d;
      d = d.slice(0, 11);
      const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
      phoneInput.value = "+7" + (p[0] ? " (" + p[0] : "") + (p[0].length === 3 ? ")" : "") + (p[1] ? " " + p[1] : "") + (p[2] ? "-" + p[2] : "") + (p[3] ? "-" + p[3] : "");
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      let ok = true;
      const check = (name, cond, msg) => { setErr(name, cond ? "" : msg); if (!cond) ok = false; };
      check("name", (data.name || "").trim().length >= 2, "Введите имя");
      check("phone", (data.phone || "").replace(/\D/g, "").length === 11, "Введите телефон полностью");
      check("interest", !!data.interest, "Выберите, что вас интересует");
      check("consent", !!data.consent, "Нужно согласие на обработку данных");
      if (!ok) { form.querySelector(".is-invalid input, .is-invalid select")?.focus(); return; }
      await sendLead(data);
      form.classList.add("is-sent");
      form.reset();
    });
  });

  /* ЗАГЛУШКА ОТПРАВКИ. Сюда подключается Telegram-бот или почта (см. README). */
  async function sendLead(data) {
    console.info("Заявка (демо, никуда не отправлена):", data);
  }

  /* ---------- Анимация появления ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    }), { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });
  } else reveals.forEach((el) => el.classList.add("is-visible"));

  /* ---------- Motion v2: появление при прокрутке (один раз), счётчики, параллакс ---------- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const countUp = (el) => {
    const to = +el.dataset.count, t0 = performance.now(), dur = 900;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = fmtNum(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const animated = document.querySelectorAll("[data-anim], .sec-title");
  if (!reduce && "IntersectionObserver" in window) {
    const io2 = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      e.target.querySelectorAll("[data-count]").forEach(countUp);
      if (e.target.dataset.count) countUp(e.target);
      io2.unobserve(e.target);
    }), { threshold: .15, rootMargin: "0px 0px -6% 0px" });
    animated.forEach((el) => io2.observe(el));
    /* Подстраховка: если наблюдатель не сработал (старый браузер, фоновая вкладка),
       показываем всё, что уже на экране, по таймеру и при прокрутке */
    const reveal = () => animated.forEach((el) => {
      if (el.classList.contains("in")) return;
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) {
        el.classList.add("in");
        el.querySelectorAll("[data-count]").forEach(countUp);
        io2.unobserve(el);
      }
    });
    setTimeout(reveal, 900);
    let rq = false;
    window.addEventListener("scroll", () => { if (!rq) { rq = true; setTimeout(() => { rq = false; reveal(); }, 250); } }, { passive: true });
  } else {
    animated.forEach((el) => el.classList.add("in"));
    document.querySelectorAll("[data-count]").forEach((el) => (el.textContent = el.dataset.count));
  }
  window.__animReady = true;

  /* Лёгкий параллакс первого экрана (только transform — без просадок fps) */
  const hero = document.querySelector(".hero2");
  if (hero && !reduce) {
    const media = hero.querySelector(".hero2__media"), bgText = hero.querySelector(".hero2__bgtext");
    let ticking = false;
    const draw = () => {
      const y = Math.min(window.scrollY, hero.offsetHeight);
      if (media) media.style.transform = `translate3d(0, ${y * 0.25}px, 0)`;
      if (bgText) bgText.style.transform = `translate3d(${y * -0.18}px, ${y * 0.12}px, 0)`;
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
  }
})();
