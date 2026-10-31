// P-SD2 Buyer: catalogue delivery time filter, checkout card, order page
// f = product flag «Бесплатная доставка продавцом»; oos = out of stock at the branch
const GOODS = { fridge: { n: "Холодильник Artel HD 455", p: 6300000 }, chairs: { n: "Стулья офисные (комплект)", p: 450000 }, mugs: { n: "Кружки керамические", p: 35000, f: true },
  cups: { n: "Бумажные стаканы 250 мл", p: 900 }, hd290: { n: "Холодильник Artel HD 290", p: 2000000 }, hs228: { n: "Морозильник Artel HS 228", p: 1500000 },
  ac12: { n: "Кондиционер Artel 12", p: 2000000 }, chest: { n: "Морозильный ларь Artel 300", p: 3200000, oos: true } };
const L = (k, q) => ({ k, q });
const ADDR = { tash: ["Ташкент, массив Буз-1, 8", "Ташкент"], chir: ["Чирчик, ул. Амира Темура, 12", "Чирчик"], sam: ["Самарканд, ул. Регистан, 5", "Самарканд"] };
const TERM = { "Ташкент": "сегодня или завтра", "Чирчик": "2–3 дня" };
let S = {};
function reset(o) {
  closeModal(); document.querySelectorAll(".addrpick").forEach(x => x.remove());
  S = Object.assign({ view: "checkout", lines: [L("fridge", 1)], thr: 5000000, addr: "tash", method: "", tip: false, confirmFail: false, stage: "processing", filter: "any", hdrAddr: "tash", hdrCity: "", reported: false, mobile: false }, o || {});
  render();
}
function header() {
  const a = S.hdrAddr ? ADDR[S.hdrAddr][0] : S.hdrCity ? "Город: " + S.hdrCity : "Выберите город";
  return `<div class="strip"><span>➤ <a href="#" id="hdraddr" style="color:#fff;text-decoration:underline">${a}</a></span><span><span>О компании</span><span>Связаться с нами</span><span>Доставка и оплата</span></span></div>
  <div class="bh">${LOGO}<button class="btn pri">☰ Каталог</button><div class="srch"><input placeholder="Что вы ищете?" value="холодильник"><button>Найти</button></div><span class="small">Русский · Избранное · Корзина · Профиль</span></div>`;
}
// ---------- catalogue ----------
// Seller B: seller delivery from Филиал Чиланзар with an order-total threshold, so every fixed-price product of B counts for seller delivery (SPEC C2).
// Seller A: seller delivery without a threshold; the Hofmann fridge is not flagged, so only Fargo counts for it.
const CAT = [
  { n: "Смартфон Redmi Note 14", p: 3200000, sl: "Продавец A", t: { "Ташкент": 1, "Самарканд": 5, "Андижан": 5, "Чирчик": 5 }, why: "Yandex Go в Ташкенте (1 шт. проходит по габаритам), иначе Fargo" },
  { n: "Холодильник Artel HD 455", p: 6300000, sl: "Продавец B", t: { "Ташкент": 1, "Самарканд": 3, "Чирчик": 3, "Андижан": 5 }, why: "доставка продавцом (у продавца порог суммы заказа), Андижан — Fargo" },
  { n: "Стулья офисные (комплект)", p: 450000, sl: "Продавец B", t: { "Ташкент": 1, "Самарканд": 3, "Чирчик": 3, "Андижан": 5 }, why: "доставка продавцом (порог суммы заказа), Андижан — Fargo" },
  { n: "Холодильник Samsung RB33", p: 7900000, sl: "Продавец C", t: { "Ташкент": 14, "Самарканд": 14 }, why: "доставка продавцом 8–14 дней (флаг)" },
  { n: "Морозильный ларь (самовывоз)", p: 4100000, sl: "Продавец D", t: {}, why: "только самовывоз" },
  { n: "Холодильник Hofmann 2D", p: 5100000, sl: "Продавец A", t: { "Ташкент": 3, "Самарканд": 5, "Чирчик": 5 }, why: "Fargo; у продавца A нет порога, товар без флага" }];
const CITIES = ["Ташкент", "Самарканд", "Андижан", "Чирчик"];
function buyerCity() { return S.hdrAddr ? ADDR[S.hdrAddr][1] : (S.hdrCity || null); }
function catalogue() {
  const city = buyerCity();
  const lim = { today: 1, week: 7 }[S.filter];
  const list = CAT.filter(p => !lim || (city && p.t[city] && p.t[city] <= lim));
  const opt = (k, t) => `<div class="fopt" data-f="${k}"><span class="radio ${S.filter === k ? "on" : ""}"></span>${t}</div>`;
  return `<div class="buyer">${header()}<div class="wrapb"><div class="small muted">Главная › Бытовая техника › Холодильники</div><h1 style="font-size:28px;margin:8px 0 18px">Холодильники <span class="muted small">${list.length} товаров</span></h1>
    <div style="display:grid;grid-template-columns:260px 1fr;gap:24px;align-items:start"><div class="dflt"><h4>Цена, сум</h4><div class="row"><input class="inp" placeholder="от"><input class="inp" placeholder="до"></div>
      <h4>Срок доставки</h4>${opt("today", "Сегодня или завтра")}${opt("week", "До 7 дней")}${opt("any", "Любой")}
      <h4>Бренд</h4><span class="chipf">Artel</span><span class="chipf">Samsung</span><span class="chipf">Hofmann</span><span class="chipf">LG</span>
      <div class="mt12"><button class="btn link sm" id="freset">Сбросить</button></div></div>
    <div>${list.length ? `<div class="pgrid">${list.map(p => `<div class="pcard"><div class="img"></div><div class="pr">${som(p.p)}</div><div>${p.n}</div><div class="small muted">${p.sl}</div><span class="ptag" title="Prototype only">демо: ${city && p.t[city] ? (p.t[city] === 1 ? "1 день" : "до " + p.t[city] + " дн.") : "нет доставки"} · ${p.why}</span></div>`).join("")}</div>`
      : `<div class="empty">Ничего не найдено. Попробуйте изменить фильтры.</div>`}</div></div></div></div>`;
}
// Header city choice of the City and catalogue filters PRD: a saved address, or only a city (M-FL8). From the filter it shows M-SD25 on top.
function addrPicker(fromFilter, cityMode) {
  document.querySelectorAll(".addrpick").forEach(x => x.remove());
  const el = document.createElement("div"); el.className = "addrpick";
  const rows = cityMode
    ? CITIES.map(c => `<div class="opt" data-c="${c}" style="cursor:pointer;border-top:1px solid var(--line)"><span class="radio"></span>${c}</div>`).join("")
    : Object.entries(ADDR).map(([k, v]) => `<div class="opt" data-a="${k}" style="cursor:pointer;border-top:1px solid var(--line)"><span class="radio"></span>${v[0]}</div>`).join("")
      + `<div class="opt" id="apcity" style="cursor:pointer;border-top:1px solid var(--line);color:var(--blue)">Выбрать только город</div>`;
  el.innerHTML = `<div class="modal"><h3>${cityMode ? "Выберите город" : "Ваш город"}</h3>${fromFilter ? '<p class="sub">Выберите город, чтобы показать товары по сроку доставки</p>' : ""}
    ${rows}<div class="acts"><button class="btn out" id="apclose">Закрыть</button></div></div>`;
  document.body.append(el);
  el.querySelectorAll("[data-a]").forEach(x => x.onclick = () => { S.hdrAddr = x.dataset.a; S.hdrCity = ""; S.filter = S.pending; el.remove(); render(); });
  el.querySelectorAll("[data-c]").forEach(x => x.onclick = () => { S.hdrCity = x.dataset.c; S.hdrAddr = ""; S.filter = S.pending; el.remove(); render(); });
  const ac = $("#apcity", el); if (ac) ac.onclick = () => addrPicker(fromFilter, true);
  $("#apclose", el).onclick = () => { el.remove(); if (fromFilter) S.filter = "any"; render(); };
}
// ---------- checkout ----------
// v1.5 rules (SPEC C1, C3): one branch of Продавец B. Order total = Σ price × qty of the in-stock lines, before promo codes.
// Total ≥ threshold → every line qualifies (basis «сумма заказа»); otherwise only flagged lines (basis «флаг»).
// Out-of-stock lines go to «Нет в наличии» for every method and never count.
function lineSum(l) { return GOODS[l.k].p * l.q; }
function calc() {
  const inStock = S.lines.filter(l => !GOODS[l.k].oos), oos = S.lines.filter(l => GOODS[l.k].oos);
  const total = inStock.reduce((a, l) => a + lineSum(l), 0);
  const thrMet = !!S.thr && total >= S.thr;
  const qual = inStock.filter(l => thrMet || GOODS[l.k].f), notQ = inStock.filter(l => !(thrMet || GOODS[l.k].f));
  return { inStock, oos, total, thrMet, qual, notQ };
}
function sdState() {
  if (!S.addr) return ["off", "Добавьте адрес доставки"];
  const city = ADDR[S.addr][1];
  if (!TERM[city]) return ["off", "Продавец не доставляет по этому адресу"];
  const c = calc();
  if (!c.qual.length) return ["off", S.thr ? `Бесплатная доставка продавцом для заказов от ${som(S.thr)}` : "Эти товары продавец не доставляет бесплатно"];
  return ["on", "Бесплатно · " + TERM[city], c.notQ.length ? `Товаров без доставки продавцом: ${c.notQ.length}. Они останутся в корзине.` : ""];
}
function lineRow(l, mode) {
  const g = GOODS[l.k], dim = mode !== "in";
  const step = mode === "oos" ? "" : `<span class="qty"><button data-dec="${l.k}">−</button><b>${l.q}</b><button data-inc="${l.k}">＋</button></span>`;
  return `<div class="row mt8 cline ${dim ? "dim" : ""}"><span class="thumb"></span><div style="flex:1">${g.n}${g.f ? ' <span class="ptag" style="margin:0 0 0 4px">флаг · демо</span>' : ""}<div class="small muted">${l.q} шт. × ${som(g.p)}</div></div>${step}<b class="lsum">${som(lineSum(l))}</b></div>`;
}
function aside(title, lines, mode) {
  if (!lines.length) return "";
  return `<div class="aside2"><div class="row" style="justify-content:space-between"><b>${title}</b><b>${som(lines.reduce((a, l) => a + lineSum(l), 0))}</b></div>${lines.map(l => lineRow(l, mode)).join("")}</div>`;
}
function checkout() {
  const [st, txt, hint] = sdState(), sel = S.method === "sd", c = calc();
  const inOrder = sel ? c.qual : c.inStock, setAside = sel ? c.notQ : [];
  const goods = inOrder.reduce((a, l) => a + lineSum(l), 0);
  const deliv = S.method === "fargo" ? 30000 : 0;
  const sd = `<div class="sdcard ${st === "off" ? "off" : sel ? "on" : ""}" id="sdc"><span class="r"></span><div style="flex:1"><b>🚚 Доставка продавцом</b>
      ${st === "on" ? `<div class="small">${txt} <span class="info" id="tipb">i</span></div>${hint ? `<div class="small warn2">${hint}</div>` : ""}` : `<div class="why">${txt}</div>`}
      ${S.tip && st === "on" ? `<div class="tip">Условия продавца: доставка до подъезда, разгрузка за счёт покупателя.</div>` : ""}</div></div>`;
  const thrInfo = `<span class="ptag" title="Prototype only">демо: порог продавца ${S.thr ? som(S.thr) : "не задан"} · сумма заказа ${som(c.total)} · ${c.thrMet ? "порог достигнут, все товары по сумме заказа" : "порог не достигнут, только товары с флагом"}</span>`;
  return `<div class="buyer">${header()}<div class="wrapb"><h1 style="font-size:30px;margin:0 0 20px">Оформление заказа</h1><div class="cg"><div>
    <div class="blk"><h2>Адрес доставки</h2><div class="box">${Object.entries(ADDR).map(([k, v]) => `<div class="opt" data-addr="${k}" style="cursor:pointer"><span class="radio ${S.addr === k ? "on" : ""}"></span>${v[0]}</div>`).join("")}</div></div>
    <div class="blk"><h2>Товары · Продавец B, Филиал Чиланзар</h2>${inOrder.map(l => lineRow(l, "in")).join("") || '<p class="sub mt8">Нет товаров для заказа.</p>'}
      ${aside("Не входят в этот заказ — останутся в корзине", setAside, "set")}${aside("Нет в наличии", c.oos, "oos")}<div class="mt8">${thrInfo}</div></div>
    <div class="blk"><h2>Способ доставки</h2><div class="ycard ${S.method === "fargo" ? "on" : ""}" data-m="fargo"><span class="r"></span><div style="flex:1">${FARGO}<div class="small muted">${ADDR[S.addr][1] === "Ташкент" ? "1–3 дня" : "3–5 дней"}</div></div><b>${som(30000)}</b></div>${sd}
      ${S.msg ? `<div class="alert w mt12"><span class="ic">!</span><div>${S.msg}</div></div>` : ""}</div></div>
    <div class="sumc"><h3 style="margin:0 0 8px">Ваша корзина</h3><div class="ln">Товары (${inOrder.length})<b>${som(goods)}</b></div><div class="ln">Доставка<b>${sel ? "Бесплатно" : S.method ? som(deliv) : "—"}</b></div>
      <div class="tot"><span>Итого</span><span>${som(goods + deliv)}</span></div><button class="btn pri big" id="pay" ${S.method && inOrder.length ? "" : "disabled"}>Оформить заказ</button>
      ${S.method ? "" : '<p class="small muted mt8">Выберите способ доставки</p>'}</div></div></div></div>`;
}
// ---------- order page ----------
const STG = { processing: 1, shipped: 2, onhold: 2, delivered: 3, completed: 3 };
function orderPage() {
  const i = STG[S.stage];
  const steps = ["Принято", "Упаковка", "В пути", "Доставлено"].map((t, k) => `<div class="step ${k <= i ? "on" : ""}"><div class="dot">${["▤", "▢", "⛟", "✓"][k]}</div>${t}</div>`).join("");
  let box = "";
  if (S.stage === "processing") box = `<p class="sub mt8">Продавец собирает заказ.</p><button class="btn dan sm mt12" id="bcancel">Отменить заказ</button>`;
  if (S.stage === "shipped" || S.stage === "onhold") box = `${S.stage === "onhold" ? '<div class="mt8"><span class="pill r">Проблема с доставкой</span> <span class="small">Продавец: «Покупатель не отвечает». Поддержка свяжется с вами.</span></div>' : ""}
    <p class="hint mt12">Заказ уже в пути: отменить его нельзя. Если заказ не нужен, обратитесь в поддержку.</p>`;
  if (S.stage === "delivered") box = `<p class="sub mt8">Доставлено 03.11.2026 в 14:00.</p>${S.reported ? '<div class="alert i mt12"><span class="ic">i</span><div>Обращение отправлено. Поддержка свяжется с вами.</div></div>' : ""}
    <div class="row mt12">${S.reported ? "" : '<button class="btn pri sm" id="recv">Я получил заказ</button><button class="btn out sm" id="report">Сообщить о проблеме</button>'}</div>
    <p class="hint mt8">${S.reported ? "Автозавершение приостановлено, пока мы разбираемся с заказом." : "Заказ завершится автоматически 10.11.2026 в 23:59."}</p>`;
  if (S.stage === "completed") box = `<div class="alert s mt12"><span class="ic">✓</span><div><b>Завершён 03.11.2026</b></div></div>`;
  const inner = `<h1 style="font-size:28px;margin:0 0 18px">Заказ: 68726458</h1><div class="steps">${steps}</div>
    <div class="track"><div class="row" style="justify-content:space-between"><b>🚚 Доставка продавцом · Бесплатно</b><span class="small">Ожидаемая доставка: до 04.11.2026</span></div>${box}
      <p class="small muted mt12">Условия продавца: доставка до подъезда, разгрузка за счёт покупателя.</p>
      <div class="row mt8"><button class="btn soft sm">☎ Связаться с продавцом</button><button class="btn out sm">Чат по заказу</button></div></div>`;
  if (S.mobile) return `<div class="phonewrap"><div class="phone"><div class="sb"><span>9:41</span><span>▮▮▮ ◔</span></div><div class="ah"><span>‹</span><b>Заказ 68726458</b></div><div class="pc"><div class="card">${inner.replace(/<h1[^>]*>.*?<\/h1>/, "")}</div></div>
    <div class="tabbar"><span>Главная</span><span>Каталог</span><span>Корзина</span><span class="on">Заказы</span><span>Профиль</span></div></div></div>`;
  return `<div class="buyer">${header()}<div class="wrapb"><div class="oc"><div>${inner}</div><div class="sumc"><h3 style="margin:0 0 8px">Ваша корзина</h3><div class="ln">1 товар<b>${som(6300000)}</b></div><div class="ln">Доставка<b>Бесплатно</b></div><div class="tot"><span>Итого</span><span>${som(6300000)}</span></div></div></div></div></div>`;
}
function render() { $("#app").innerHTML = S.view === "catalogue" ? catalogue() : S.view === "order" ? orderPage() : checkout(); bind(); }
function bind() {
  document.querySelectorAll("[data-f]").forEach(x => x.onclick = () => { const f = x.dataset.f; if (f !== "any" && !buyerCity()) { S.pending = f; return addrPicker(true); } S.filter = f; render(); });
  const fr = $("#freset"); if (fr) fr.onclick = () => { S.filter = "any"; render(); };
  const ha = $("#hdraddr"); if (ha) ha.onclick = e => { e.preventDefault(); S.pending = S.filter; addrPicker(false); };
  document.querySelectorAll("[data-addr]").forEach(x => x.onclick = () => { S.addr = x.dataset.addr; S.msg = ""; if (S.method === "sd" && sdState()[0] === "off") { S.method = ""; S.msg = "Доставка продавцом недоступна для нового адреса. Выберите другой способ доставки."; } render(); });
  document.querySelectorAll("[data-m]").forEach(x => x.onclick = () => { S.method = x.dataset.m; S.msg = ""; render(); });
  const c = $("#sdc"); if (c) c.onclick = e => { if (e.target.id === "tipb") return; if (sdState()[0] === "on") { S.method = "sd"; S.msg = ""; render(); } };
  const tb = $("#tipb"); if (tb) tb.onclick = e => { e.stopPropagation(); S.tip = !S.tip; render(); };
  // Quantity change: the order total is recomputed, lines move into or out of the set-aside section (SPEC C3).
  const qty = (k, d) => { const l = S.lines.find(x => x.k === k); l.q = Math.max(1, l.q + d); S.msg = ""; const st = sdState(); if (S.method === "sd" && st[0] === "off") { S.method = ""; S.msg = st[1]; } render(); };
  document.querySelectorAll("[data-inc]").forEach(x => x.onclick = () => qty(x.dataset.inc, 1));
  document.querySelectorAll("[data-dec]").forEach(x => x.onclick = () => qty(x.dataset.dec, -1));
  const pay = $("#pay"); if (pay) pay.onclick = () => { if (S.confirmFail && S.method === "sd") { S.method = ""; S.msg = "Условия доставки продавца изменились. Выберите способ доставки заново."; S.confirmFail = false; return render(); }
    const cc = calc(), n = S.method === "sd" ? cc.qual.length : cc.inStock.length, left = S.lines.length - n; toast("Переход к оплате (Paylov)… · демо: в заказе " + n + " поз." + (left ? ", в корзине остаются " + left : "")); };
  const bc = $("#bcancel"); if (bc) bc.onclick = () => toast("Заказ отменён (как сейчас)");
  const rp = $("#report"); if (rp) rp.onclick = () => { S.reported = true; render(); toast("Заказ добавлен в список проблем поддержки"); };
  const rv = $("#recv"); if (rv) rv.onclick = recvDialog;
}
function recvDialog() {
  const m = modal(`<h3>Подтвердить получение заказа №68726458?</h3><p class="sub">Заказ будет завершён.</p><div class="acts"><button class="btn out" id="no">Не сейчас</button><button class="btn pri" id="yes">Подтвердить</button></div>`);
  $("#no", m).onclick = closeModal;
  $("#yes", m).onclick = () => { closeModal(); S.stage = "completed"; render(); toast("Заказ завершён"); };
}
harness({ title: "P-SD2 Buyer: delivery time filter, checkout, order page", stories: "US-BF-2.11-01 · US-BF-6.4-01/02/03", version: "1.5" }, [
  { label: "Checkout: card active", apply: () => reset(), notes: ["Seller B's threshold is 5 000 000 сум. The order total from Филиал Чиланзар is 6 300 000 сум ≥ threshold, so every line qualifies, basis «сумма заказа» (US-BF-6.4-01, decided 01.11.2026, OQ-SD1). Card: \"Бесплатно · сегодня или завтра\" (M-SD1).", "The info icon shows the seller's note. Select the card: the cart shows \"Доставка: Бесплатно\" (US-BF-6.4-02 AC5).", "The card is never pre-selected (AC6). The grey \"демо\" tag under the lines is for the prototype only."], src: "Seller delivery PRD v1.5 4.4, 5.3 · new checkout design 23.10.2026" },
  { label: "Checkout: some items set aside", apply: () => reset({ lines: [L("mugs", 12), L("chairs", 4), L("cups", 500)] }), notes: ["Order total 2 670 000 сум < 5 000 000 сум: only the flagged mugs qualify. The card stays active and shows M-SD60 \"Товаров без доставки продавцом: 2. Они останутся в корзине.\" (decided 01.11.2026, OQ-SD4).", "Select \"Доставка продавцом\": the chairs and the cups move to \"Не входят в этот заказ — останутся в корзине\" (M-SD61) with their amount; \"Итого\" counts only the mugs. \"Оформить заказ\" creates the order with the mugs only; the other lines stay in the cart unchanged.", "Select Fargo: the set-aside lines come back into the order.", "Press ＋ on the chairs until the order total reaches 5 000 000 сум (10 sets): every line qualifies and the section disappears. Press − again: the lines move back out. The total is computed once over all in-stock lines, before anything is set aside."], src: "PRD v1.5 4.4, SD-B3, SD-B6 · not designed" },
  { label: "Checkout: city not served", apply: () => reset({ addr: "sam" }), notes: ["Samarkand is not in the branch's city list: inactive with \"Продавец не доставляет по этому адресу\" (US-BF-6.4-01 AC4).", "Click Chirchiq to see \"Бесплатно · 2–3 дня\"."], src: "PRD 4.3, M-SD2" },
  { label: "Checkout: address changed after selecting", apply: () => reset({ method: "sd" }), notes: ["Seller delivery is selected. Click the Samarkand address: the selection is cleared with the message and \"Оформить заказ\" is blocked (US-BF-6.4-02 AC7)."], src: "ТЗ 3.5, M-SD5" },
  { label: "Checkout: terms changed at confirm", apply: () => reset({ method: "sd", confirmFail: true }), notes: ["Click \"Оформить заказ\": the re-check finds that the qualifying lines differ from this session (the seller's settings or a price changed), no order is created and the method must be chosen again (US-BF-6.4-02 AC9)."], src: "PRD SD-P3, M-SD6" },
  { label: "Order page: processing", apply: () => reset({ view: "order", stage: "processing" }), notes: ["Stage \"Упаковка\" (25). The buyer can still cancel (US-BF-6.4-03 AC5).", "\"Ожидаемая доставка: до …\" comes from the order deadline (AC1). There is no delivery code in the MVP (decided 01.11.2026, OQ-SD7)."], src: "PRD 5.5" },
  { label: "Order page: on the way", apply: () => reset({ view: "order", stage: "shipped" }), notes: ["30 Shipped: stage \"В пути\", no cancel button (AC6). No delivery code is shown (OQ-SD7, changed 01.11.2026).", "The buyer got DLV-01 with the seller-delivery text without the code sentence: \"Заказ №… в пути\" / \"Доставка: продавцом. Подробности — в заказе.\""], src: "PRD SD-B10, SD-B13, DLV-01" },
  { label: "Order page: delivery problem", apply: () => reset({ view: "order", stage: "onhold" }), notes: ["24 OnHold: stage \"В пути\" with \"Проблема с доставкой\" and the seller's reason (AC2)."], src: "PRD SD-B10, DLV-02" },
  { label: "Order page: delivered", apply: () => reset({ view: "order", stage: "delivered" }), notes: ["35 Delivered on 03.11.2026 at 14:00. The buyer got DLV-09 \"Заказ №… отмечен доставленным\" / \"Подтвердите получение или сообщите о проблеме до 10.11.2026.\"", "7 calendar days: day 0 is the delivery date (Tashkent), so the order completes automatically on 10.11.2026 at 23:59 (M-OL25) — the same rule for every method (decided 01.11.2026, OQ-SD8).", "\"Я получил заказ\" (M-OL23) opens M-OL24; \"Подтвердить\" → 40 Success at once, \"Завершён 03.11.2026\" (M-OL26).", "\"Сообщить о проблеме\" (M-SD47) = reject: the order stays at 35, goes to the admin problem list with \"Покупатель сообщил о проблеме\" and auto-completion pauses while the report is open (BR-SD22). The return / dispute flow is in the Returns and disputes PRD."], src: "PRD SD-B14; Order lifecycle US-BF-6.8-01, US-BF-6.8-02" },
  { label: "Catalogue: filter with a city", apply: () => reset({ view: "catalogue", filter: "today" }), notes: ["The buyer's city is Tashkent, from the address chosen in the header. \"Сегодня или завтра\" shows the products with 1 day: the phone by Yandex Go, and the Artel fridge and the chairs by seller delivery (US-BF-2.11-01 AC2, AC5).", "The chairs are not flagged, but seller B has an order-total threshold, so every fixed-price product of B counts for seller delivery where the branch delivers (decided 01.11.2026). Checkout may still set them aside if the real order total is below the threshold (accepted).", "Seller A has no threshold and the Hofmann fridge is not flagged, so it counts only with Fargo: switch to \"До 7 дней\" to see it with 3 days inside Tashkent (AC8). Negotiable-price products never count for seller delivery.", "A product counts when at least one variant has stock > 0 at an active branch; the Yandex Go fit check uses one unit. The minimum order quantity is not checked (MOQ is out of the MVP).", "The grey \"демо\" tag on each card is for the prototype only: the delivery time is not shown on cards in this release (SD-F11)."], src: "PRD v1.5 5.8 · catalogue filter design 24.10.2026" },
  { label: "Catalogue: no city, the city choice opens", apply: () => reset({ view: "catalogue", hdrAddr: "", hdrCity: "" }), notes: ["No buyer's city: nothing chosen in the header and the location was refused (\"Выберите город\" in the header).", "Pick \"Сегодня или завтра\": the header city choice opens with \"Выберите город, чтобы показать товары по сроку доставки\" (US-BF-2.11-01 AC13). Choose a saved address, or \"Выбрать только город\" and a city.", "Close it without choosing: the filter stays \"Любой\". No city is ever assumed. A guest's city saved in the browser is used only by this filter; a guest cannot add to the cart (OQ-SD25)."], src: "PRD SD-F3, SD-F4, M-SD25; City and catalogue filters PRD 4.4 · not designed (DR-SD10)" },
  { label: "Buyer app: order on the way", apply: () => reset({ view: "order", stage: "shipped", mobile: true }), notes: ["The buyer app shows the same details and actions (US-BF-6.4-03 AC9). No delivery code."], src: "PRD NFR-SD7" },
  { label: "Checkout: order total reaches the threshold", apply: () => reset({ lines: [L("hd290", 1), L("hs228", 1), L("ac12", 1)] }), notes: ["Akbar's example: threshold 5 000 000 сум; three products from the same branch, 2 000 000 + 1 500 000 + 2 000 000 = 5 500 000 сум ≥ threshold, so the whole order qualifies for free seller delivery (decided 01.11.2026, OQ-SD1). None of them is flagged.", "The basis «сумма заказа» and the compared total 5 500 000 сум are saved on the order (snapshot, P-SD4).", "Promo codes never change eligibility: the total is before promo codes."], src: "PRD v1.5 4.4 rule ②" },
  { label: "Catalogue: only a city chosen", apply: () => reset({ view: "catalogue", hdrAddr: "", hdrCity: "Самарканд", filter: "week" }), notes: ["The buyer chose only a city, Samarkand, without an address: the header shows \"Город: Самарканд\" (City and catalogue filters PRD, M-FL1, M-FL8).", "\"До 7 дней\" applies for Samarkand: the Artel fridge and the chairs by seller delivery (3 days, seller B's threshold), the phone and the Hofmann fridge by Fargo (5 days) (US-BF-2.11-01 AC5, AC8). \"Сегодня или завтра\" shows nothing.", "Checkout will still ask for a delivery address; the city alone is enough for the filter."], src: "PRD SD-F3; City and catalogue filters PRD 4.4" },
  { label: "Checkout: inactive, total below the threshold", apply: () => reset({ lines: [L("chairs", 4)] }), notes: ["No line qualifies: the chairs are not flagged and the order total 1 800 000 сум is below seller B's 5 000 000 сум. The card is inactive with M-SD3 \"Бесплатная доставка продавцом для заказов от 5 000 000 сум\".", "Press ＋ on the chairs to 12 sets (5 400 000 сум): the card becomes active. Press − back: if seller delivery was selected, the selection is cleared and M-SD3 is shown above (SD-B6)."], src: "PRD v1.5 4.4, M-SD3" },
  { label: "Checkout: inactive, no threshold", apply: () => reset({ lines: [L("chairs", 4)], thr: 0 }), notes: ["The seller has no order-total threshold (rule ② not used) and no line is flagged: the card is inactive with M-SD59 \"Эти товары продавец не доставляет бесплатно\"."], src: "PRD v1.5 4.4, M-SD59" },
  { label: "Checkout: an item is out of stock", apply: () => reset({ lines: [L("mugs", 12), L("chairs", 4), L("chest", 1)], method: "fargo" }), notes: ["Cart-wide rule for every method (owner: cart, BF-5.1, next Order lifecycle PRD version): the out-of-stock freezer moves to \"Нет в наличии\" (M-SD65) and is deducted from the total. Checkout is not blocked.", "Out-of-stock lines never count for the threshold: the order total is 2 220 000 сум, not 5 420 000 сум. Select \"Доставка продавцом\": only the flagged mugs stay in the order, the chairs go to \"Не входят в этот заказ\", the freezer stays in \"Нет в наличии\"."], src: "PRD v1.5 4.4; Order lifecycle PRD (cart)" },
]);
