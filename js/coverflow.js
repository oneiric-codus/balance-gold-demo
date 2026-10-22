/* =========================================================
   Coverflow — 3D-карусель карточек по кольцу (крутится в обе стороны).
   Без зависимостей: requestAnimationFrame + твин/сглаживание.

   new Coverflow(element, {
     items: [...],                 // данные карточек
     render: (item, i) => "html",  // разметка содержимого карточки
     name: (item) => "…",          // название для aria-live
     startIndex: 0,                // с какой карточки начать (в центре)
     autoplay: true,
     direction: "forward",         // "forward" | "backward" | "pingpong"
     interval: 3000,               // пауза между шагами автоплея, мс
     duration: 900,                // длительность перехода, мс
     resume: 4000,                 // автоплей возобновляется после взаимодействия, мс
     label: "Карусель"             // aria-label блока
   });

   Состояние — дробный progress. Для карточки i: d = i − progress, приведённое к [−M/2, M/2).
   Все трансформации считаются из d, поэтому промежуточные кадры получаются сами собой.
   ========================================================= */
(function () {
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // = cubic-bezier(.65,0,.35,1)
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mod = (n, m) => ((n % m) + m) % m;

  const ARROW_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  const ARROW_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  class Coverflow {
    constructor(root, options) {
      this.o = Object.assign({
        items: [], render: (x) => String(x), name: (x) => String(x), startIndex: 0,
        autoplay: true, direction: "forward", interval: 3000, duration: 900, resume: 4000, label: "Карусель"
      }, options);
      this.root = root;
      root.coverflow = this;            // доступ к экземпляру: element.coverflow.next() / .prev() / .goTo(i) / .setDirection(d)
      this.N = this.o.items.length;
      if (!this.N) return;
      /* Мало карточек — дублируем в кольце визуально (логика и счётчик — по реальным).
         При 4 и меньше единственная задняя карточка целиком прячется за центральной,
         поэтому добиваем кольцо минимум до 6, чтобы задний ряд был виден. */
      this.M = this.N < 6 ? this.N * Math.ceil(6 / this.N) : this.N;
      this.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.progress = this.trail = this.goal = mod(this.o.startIndex, this.N);
      this.ppDir = this.o.direction === "backward" ? -1 : 1;
      this.inView = true;
      this.build();
      this.layout();
      this.bind();
      this.render();
      this.announce(true);
      this.schedule();
    }

    /* ---------- Разметка ---------- */
    build() {
      const r = this.root;
      r.classList.add("cf");
      if (this.reduce) r.classList.add("cf--reduce");
      r.setAttribute("role", "region");
      r.setAttribute("aria-roledescription", "карусель");
      r.setAttribute("aria-label", this.o.label);
      r.innerHTML = `
        <div class="cf__stage" tabindex="0" aria-label="${this.o.label}: листайте стрелками влево и вправо"></div>
        <div class="cf__controls">
          <button type="button" class="cf__btn" data-step="-1" aria-label="Предыдущий">${ARROW_L}</button>
          <span class="cf__count" aria-hidden="true"></span>
          <button type="button" class="cf__btn" data-step="1" aria-label="Следующий">${ARROW_R}</button>
        </div>
        <p class="cf__live" aria-live="polite" aria-atomic="true"></p>`;
      this.stage = r.querySelector(".cf__stage");
      this.count = r.querySelector(".cf__count");
      this.live = r.querySelector(".cf__live");
      this.slots = [];
      for (let j = 0; j < this.M; j++) {
        const i = j % this.N, item = this.o.items[i];
        const slot = document.createElement("div");
        slot.className = "cf__slot";
        slot.innerHTML = `<div class="cf__trail" aria-hidden="true"></div>
          <article class="cf__card" role="group" aria-roledescription="слайд"
            aria-label="${i + 1} из ${this.N}: ${String(this.o.name(item)).replace(/"/g, "&quot;")}">${this.o.render(item, i)}</article>`;
        if (j >= this.N) slot.classList.add("cf__slot--dup");
        this.stage.appendChild(slot);
        this.slots.push({ el: slot, card: slot.querySelector(".cf__card"), trail: slot.querySelector(".cf__trail"), i, active: null });
      }
    }

    /* Размеры зависят от ширины блока: на телефоне боковые ближе и меньше, задний ряд скрыт */
    layout() {
      const w = this.root.clientWidth || window.innerWidth;
      this.mobile = w < 640;
      const cardW = this.slots[0].card.offsetWidth || 300;
      this.X = this.mobile ? cardW * 0.62 : Math.min(w * 0.3, cardW * 1.05);
      this.sideScale = this.mobile ? 0.78 : 0.82;
      this.slots.forEach((s) => (s.card.style.height = "auto"));
      const h = Math.max(...this.slots.map((s) => s.card.offsetHeight));
      this.slots.forEach((s) => { s.card.style.height = h + "px"; s.trail.style.height = h + "px"; });
      this.stage.style.height = Math.round(h + (this.mobile ? 48 : 90)) + "px";
      this.render();
    }

    /* ---------- Геометрия карточки по смещению d ---------- */
    pose(d) {
      const a = Math.abs(d), s = d < 0 ? -1 : 1, X = this.X;
      if (this.reduce) return { t: "translate(-50%,-50%)", op: clamp(1 - a, 0, 1), f: "none", pe: a < 0.5 };
      let tx, ry, sc, z, op, blur, br;
      if (a <= 1) {
        tx = s * X * a; ry = -s * 33 * a; sc = lerp(1, this.sideScale, a); z = -150 * a; op = 1; blur = 0; br = 1;
      } else {
        const u = clamp((a - 1) / 0.5, 0, 1);                       // 1 → 1.5: уход за центр
        const half = this.M / 2;
        const v = half > 1.5 ? clamp((a - 1.5) / (half - 1.5), 0, 1) : 1; // глубже в задний ряд — ближе к центру
        tx = s * lerp(X, X * 0.55, u) * (a > 1.5 ? 1 - v : 1);
        ry = -s * lerp(33, 180, u);                                // разворот на 180° — зеркально
        sc = lerp(this.sideScale, 0.7, u); z = lerp(-150, -500, u);
        op = lerp(1, this.mobile ? 0 : 0.2, u); blur = 2 * u; br = lerp(1, 0.6, u);
      }
      return {
        t: `translate(-50%,-50%) translate3d(${tx.toFixed(2)}px,0,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(4)})`,
        op, f: blur > 0.02 ? `blur(${blur.toFixed(2)}px) brightness(${br.toFixed(3)})` : "none", pe: a < 1.2
      };
    }

    wrap(d) { return mod(d + this.M / 2, this.M) - this.M / 2; }

    render() {
      let activeSlot = null;
      this.slots.forEach((s, j) => {
        const d = this.wrap(j - this.progress), p = this.pose(d);
        s.card.style.transform = p.t;
        s.card.style.opacity = p.op.toFixed(3);
        s.card.style.filter = p.f;
        s.el.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
        s.card.style.pointerEvents = p.pe ? "auto" : "none";
        const pt = this.pose(this.wrap(j - this.trail));             // внешняя рамка — со шлейфом
        s.trail.style.transform = pt.t;
        s.trail.style.opacity = (pt.op * 0.85).toFixed(3);
        if (Math.abs(d) < 0.5) activeSlot = s;
      });
      if (activeSlot !== this.activeSlot) {
        this.activeSlot = activeSlot;
        this.slots.forEach((s) => {
          const on = s === activeSlot;
          s.el.classList.toggle("is-active", on);
          s.card.setAttribute("aria-hidden", on ? "false" : "true");
          s.card.querySelectorAll("a, button").forEach((x) => (x.tabIndex = on ? 0 : -1)); // у боковых — вне tab-порядка
        });
      }
    }

    /* ---------- Движение ---------- */
    loop(now) {
      const dt = this.last ? Math.min(64, now - this.last) : 16;
      this.last = now;
      if (this.tw) {
        const k = clamp((now - this.tw.t0) / this.tw.dur, 0, 1);
        this.progress = lerp(this.tw.from, this.tw.to, this.tw.ease(k));
        if (k >= 1) this.tw = null;
      }
      const tau = this.reduce ? 1 : 85;                               // запаздывание внешней рамки ≈ 85 мс
      this.trail += (this.progress - this.trail) * (1 - Math.exp(-dt / tau));
      if (Math.abs(this.progress - this.trail) < 0.0005) this.trail = this.progress;
      this.render();
      if (this.tw || this.dragging || this.trail !== this.progress) this.raf = requestAnimationFrame((t) => this.loop(t));
      else { this.raf = null; this.last = null; }
    }
    kick() { if (!this.raf) { this.last = null; this.raf = requestAnimationFrame((t) => this.loop(t)); } }

    tweenTo(to, dur, ease) {
      this.goal = to;
      this.tw = { from: this.progress, to, t0: performance.now(), dur: Math.max(1, dur), ease: ease || easeInOut };
      this.announce();
      this.kick();
    }
    /* Шаг на ±n: новая цель считается от текущей цели, анимация — от текущего положения (без рывков) */
    step(n) { this.tweenTo(Math.round(this.goal) + n, this.reduce ? 400 : this.o.duration); }
    next() { this.step(1); }
    prev() { this.step(-1); }
    goTo(index) { this.step(Math.round(this.wrapN(index - this.goal))); }
    wrapN(d) { return mod(d + this.N / 2, this.N) - this.N / 2; }

    announce(silent) {
      const i = mod(Math.round(this.goal), this.N);
      if (i === this.shown) return;
      this.shown = i;
      this.count.textContent = `${i + 1} / ${this.N}`;
      if (!silent) this.live.textContent = `${i + 1} из ${this.N}: ${this.o.name(this.o.items[i])}`;
    }

    /* ---------- Автоплей ---------- */
    schedule() {
      clearTimeout(this.timer);
      if (!this.o.autoplay || this.reduce || this.paused || this.hover || !this.inView || document.hidden) return;
      this.timer = setTimeout(() => { this.autoStep(); this.schedule(); }, this.o.interval);
    }
    autoStep() {
      let dir = this.o.direction === "backward" ? -1 : 1;
      if (this.o.direction === "pingpong") {
        const i = mod(Math.round(this.goal), this.N);
        if (i >= this.N - 1) this.ppDir = -1; else if (i <= 0) this.ppDir = 1;
        dir = this.ppDir;
      }
      this.step(dir);
    }
    setDirection(dir) { this.o.direction = dir; this.ppDir = dir === "backward" ? -1 : 1; this.schedule(); }
    /* Любое взаимодействие — пауза, возобновление через resume мс */
    interact() {
      this.paused = true;
      clearTimeout(this.timer); clearTimeout(this.resumeT);
      this.resumeT = setTimeout(() => { this.paused = false; this.schedule(); }, this.o.resume);
    }

    /* ---------- Управление ---------- */
    bind() {
      const st = this.stage;
      this.root.querySelectorAll(".cf__btn").forEach((b) =>
        b.addEventListener("click", () => { this.interact(); this.step(+b.dataset.step); }));

      /* Свайп и drag: progress следует за пальцем, после отпускания — к ближайшей с учётом скорости */
      st.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        this.drag = { id: e.pointerId, x: e.clientX, p: this.progress, moved: false, lx: e.clientX, lt: performance.now(), v: 0 };
      });
      st.addEventListener("pointermove", (e) => {
        const g = this.drag;
        if (!g || e.pointerId !== g.id) return;
        const dx = e.clientX - g.x;
        if (!g.moved) {
          if (Math.abs(dx) < 6) return;
          g.moved = true; this.dragging = true; this.tw = null;
          try { st.setPointerCapture(e.pointerId); } catch (err) { /* указатель уже отпущен — продолжаем без захвата */ }
          st.classList.add("is-dragging"); this.interact();
        }
        const now = performance.now(), dtt = Math.max(1, now - g.lt);
        g.v = lerp(g.v, (e.clientX - g.lx) / dtt, 0.5); g.lx = e.clientX; g.lt = now;
        this.progress = g.p - dx / this.X;
        this.kick();
      });
      const end = (e) => {
        const g = this.drag;
        if (!g || e.pointerId !== g.id) return;
        this.drag = null;
        if (!g.moved) return;
        this.dragging = false; st.classList.remove("is-dragging");
        this.suppressClick = true; setTimeout(() => (this.suppressClick = false), 0);
        const projected = this.progress - (g.v / this.X) * 220;      // инерция
        const target = Math.round(clamp(projected, this.progress - 2, this.progress + 2));
        this.tweenTo(target, this.reduce ? 300 : 520, easeOut);
        this.interact();
      };
      st.addEventListener("pointerup", end);
      st.addEventListener("pointercancel", end);

      /* Клик по боковой карточке — переезжает в центр; кнопка покупки работает только у центральной */
      st.addEventListener("click", (e) => {
        if (this.suppressClick) { e.preventDefault(); e.stopPropagation(); return; }
        const slotEl = e.target.closest(".cf__slot");
        if (!slotEl || slotEl.classList.contains("is-active")) return;
        e.preventDefault();
        const s = this.slots.find((x) => x.el === slotEl);
        this.interact();
        this.step(Math.round(this.wrap(this.slots.indexOf(s) - this.goal)));
      }, true);

      /* Горизонтальный скролл тачпада */
      this.root.addEventListener("wheel", (e) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 1) return;
        e.preventDefault();
        this.tw = null; this.interact();
        this.progress += e.deltaX / (this.X * 1.6);
        this.goal = this.progress;
        this.kick();
        clearTimeout(this.wheelT);
        this.wheelT = setTimeout(() => this.tweenTo(Math.round(this.progress), 380, easeOut), 130);
      }, { passive: false });

      /* Клавиши ←/→: когда фокус в карусели или она на экране и фокус не в поле ввода */
      document.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        const a = document.activeElement;
        const inside = this.root.contains(a);
        const free = !a || a === document.body;
        if (!inside && !(free && this.inView)) return;
        if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
        e.preventDefault();
        this.interact();
        this.step(e.key === "ArrowRight" ? 1 : -1);
      });

      /* Пауза при наведении, вне экрана и в фоновой вкладке */
      this.root.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { this.hover = true; clearTimeout(this.timer); } });
      this.root.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { this.hover = false; this.interact(); } });
      this.root.addEventListener("focusin", () => this.interact());
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([en]) => { this.inView = en.isIntersecting; this.schedule(); }, { threshold: 0.3 }).observe(this.root);
      }
      document.addEventListener("visibilitychange", () => this.schedule());
      if ("ResizeObserver" in window) {
        let rw = 0;
        new ResizeObserver(() => { const w = this.root.clientWidth; if (w !== rw) { rw = w; this.layout(); } }).observe(this.root);
      } else window.addEventListener("resize", () => this.layout());
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => this.layout());
    }
  }

  window.Coverflow = Coverflow;
})();
