// P-SD2 Buyer: catalogue delivery time filter, checkout card, order page
const GOODS = { fridge: { n: "Холодильник Artel HD 455", p: 6300000, q: 1 }, chairs: { n: "Стулья офисные (комплект)", p: 450000, q: 4 } };
const ADDR = { tash: ["Ташкент, массив Буз-1, 8", "Ташкент"], chir: ["Чирчик, ул. Амира Темура, 12", "Чирчик"], sam: ["Самарканд, ул. Регистан, 5", "Самарканд"] };
const TERM = { "Ташкент": "сегодня или завтра", "Чирчик": "2–3 дня" };
let S = {};
function reset(o) {
  closeModal(); document.querySelectorAll(".addrpick").forEach(x => x.remove());
  S = Object.assign({ view: "checkout", cart: ["fridge"], addr: "tash", method: "", tip: false, confirmFail: false, stage: "processing", noCode: false, filter: "any", hdrAddr: "tash", reported: false, mobile: false }, o || {});
  render();
}
function header() {
  const a = S.hdrAddr ? ADDR[S.hdrAddr][0] : "Укажите адрес доставки";
  return `<div class="strip"><span>➤ <a href="#" id="hdraddr" style="color:#fff;text-decoration:underline">${a}</a></span><span><span>О компании</span><span>Связаться с нами</span><span>Доставка и оплата</span></span></div>
  <div class="bh">${LOGO}<button class="btn pri">☰ Каталог</button><div class="srch"><input placeholder="Что вы ищете?" value="холодильник"><button>Найти</button></div><span class="small">Русский · Избранное · Корзина · Профиль</span></div>`;
}
// ---------- catalogue ----------
const CAT = [
  { n: "Смартфон Redmi Note 14", p: 3200000, sl: "Продавец A", t: { "Ташкент": 1, "Самарканд": 7, "Андижан": 7 }, why: "Yandex Go, Ташкент" },
  { n: "Холодильник Artel HD 455", p: 6300000, sl: "Продавец B", t: { "Ташкент": 1, "Самарканд": 3, "Андижан": 7 }, why: "доставка продавцом" },
  { n: "Стулья офисные (комплект)", p: 450000, sl: "Продавец B", t: { "Ташкент": 7, "Самарканд": 7, "Андижан": 7 }, why: "Fargo" },
  { n: "Холодильник Samsung RB33", p: 7900000, sl: "Продавец C", t: { "Ташкент": 14, "Самарканд": 14 }, why: "доставка продавцом 8–14 дней" },
  { n: "Морозильный ларь (самовывоз)", p: 4100000, sl: "Продавец D", t: {}, why: "только самовывоз" },
  { n: "Холодильник Hofmann 2D", p: 5100000, sl: "Продавец A", t: { "Ташкент": 7, "Самарканд": 7 }, why: "Fargo" }];
function catalogue() {
  const city = S.hdrAddr ? ADDR[S.hdrAddr][1] : null;
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
function addrPicker() {
  const el = document.createElement("div"); el.className = "addrpick";
  el.innerHTML = `<div class="modal"><h3>Адрес доставки</h3><p class="sub">Укажите адрес доставки, чтобы показать товары по сроку доставки</p>
    ${Object.entries(ADDR).map(([k, v]) => `<div class="opt" data-a="${k}" style="cursor:pointer;border-top:1px solid var(--line)"><span class="radio"></span>${v[0]}</div>`).join("")}
    <div class="acts"><button class="btn out" id="apclose">Закрыть</button></div></div>`;
  document.body.append(el);
  el.querySelectorAll("[data-a]").forEach(x => x.onclick = () => { S.hdrAddr = x.dataset.a; S.filter = S.pending; el.remove(); render(); });
  $("#apclose", el).onclick = () => { el.remove(); S.filter = "any"; render(); };
}
// ---------- checkout ----------
function sdState() {
  const city = ADDR[S.addr][1];
  if (!S.addr) return ["off", "Добавьте адрес доставки"];
  if (!TERM[city]) return ["off", "Продавец не доставляет по этому адресу"];
  if (S.cart.includes("chairs")) return ["off", "Не все товары в заказе доставляются продавцом бесплатно"];
  return ["on", "Бесплатно · " + TERM[city]];
}
function checkout() {
  const [st, txt] = sdState(), sel = S.method === "sd";
  const total = S.cart.reduce((a, k) => a + GOODS[k].p * GOODS[k].q, 0);
  const deliv = sel ? 0 : S.method === "fargo" ? 30000 : 0;
  const sd = `<div class="sdcard ${st === "off" ? "off" : sel ? "on" : ""}" id="sdc"><span class="r"></span><div style="flex:1"><b>🚚 Доставка продавцом</b>
      ${st === "on" ? `<div class="small">${txt} <span class="info" id="tipb">i</span></div>` : `<div class="why">${txt}${S.cart.includes("chairs") ? ' <span class="info" id="tipb">i</span>' : ""}</div>`}
      ${S.tip ? `<div class="tip">${st === "on" ? "Условия продавца: доставка до подъезда, разгрузка за счёт покупателя." : "Не подходят: Стулья офисные (комплект)"}</div>` : ""}</div></div>`;
  return `<div class="buyer">${header()}<div class="wrapb"><h1 style="font-size:30px;margin:0 0 20px">Оформление заказа</h1><div class="cg"><div>
    <div class="blk"><h2>Адрес доставки</h2><div class="box">${Object.entries(ADDR).map(([k, v]) => `<div class="opt" data-addr="${k}" style="cursor:pointer"><span class="radio ${S.addr === k ? "on" : ""}"></span>${v[0]}</div>`).join("")}</div></div>
    <div class="blk"><h2>Товары · Продавец B, Филиал Чиланзар</h2>${S.cart.map(k => `<div class="row mt8"><span class="thumb"></span><div style="flex:1">${GOODS[k].n}<div class="small muted">${GOODS[k].q} шт. × ${som(GOODS[k].p)}</div></div></div>`).join("")}
      ${S.cart.includes("chairs") ? "" : '<button class="btn link sm" id="addch">＋ демо: добавить стулья в заказ</button>'}</div>
    <div class="blk"><h2>Способ доставки</h2><div class="ycard ${S.method === "fargo" ? "on" : ""}" data-m="fargo"><span class="r"></span><div style="flex:1">${FARGO}<div class="small muted">до 7 дней</div></div><b>${som(30000)}</b></div>${sd}
      ${S.msg ? `<div class="alert w mt12"><span class="ic">!</span><div>${S.msg}</div></div>` : ""}</div></div>
    <div class="sumc"><h3 style="margin:0 0 8px">Ваша корзина</h3><div class="ln">Товары<b>${som(total)}</b></div><div class="ln">Доставка<b>${sel ? "Бесплатно" : S.method ? som(deliv) : "—"}</b></div>
      <div class="tot"><span>Итого</span><span>${som(total + deliv)}</span></div><button class="btn pri big" id="pay" ${S.method ? "" : "disabled"}>Оформить заказ</button>
      ${S.method ? "" : '<p class="small muted mt8">Выберите способ доставки</p>'}</div></div></div></div>`;
}
// ---------- order page ----------
const STG = { processing: 1, shipped: 2, onhold: 2, delivered: 3 };
function orderPage() {
  const i = STG[S.stage];
  const steps = ["Принято", "Упаковка", "В пути", "Доставлено"].map((t, k) => `<div class="step ${k <= i ? "on" : ""}"><div class="dot">${["▤", "▢", "⛟", "✓"][k]}</div>${t}</div>`).join("");
  let box = "";
  if (S.stage === "processing") box = `<p class="sub mt8">Продавец собирает заказ. Код для получения появится, когда заказ будет в пути.</p><button class="btn dan sm mt12" id="bcancel">Отменить заказ</button>`;
  if (S.stage === "shipped" || S.stage === "onhold") box = `${S.stage === "onhold" ? '<div class="mt8"><span class="pill r">Проблема с доставкой</span> <span class="small">Продавец: «Покупатель не отвечает». Поддержка свяжется с вами.</span></div>' : ""}
    <div class="mt12"><div class="small muted">Код для получения</div><div class="code-big">4 8 1 7</div><p class="small mt8">Назовите его продавцу, когда получите заказ.</p></div>
    <p class="hint">Заказ уже в пути: отменить его нельзя. Если заказ не нужен, обратитесь в поддержку.</p>`;
  if (S.stage === "delivered") box = `<p class="sub mt8">${S.noCode ? "Продавец отметил заказ доставленным без кода." : "Доставлено 22.10.2026 в 15:40, с кодом."}</p>${S.reported ? '<div class="alert i mt12"><span class="ic">i</span><div>Обращение отправлено. Поддержка свяжется с вами.</div></div>' : '<button class="btn out sm mt12" id="report">Сообщить о проблеме</button><span class="hint"> · в течение 3 дней</span>'}`;
  const inner = `<h1 style="font-size:28px;margin:0 0 18px">Заказ: 68726458</h1><div class="steps">${steps}</div>
    <div class="track"><div class="row" style="justify-content:space-between"><b>🚚 Доставка продавцом · Бесплатно</b><span class="small">Ожидаемая доставка: до 24.10.2026</span></div>${box}
      <p class="small muted mt12">Условия продавца: доставка до подъезда, разгрузка за счёт покупателя.</p>
      <div class="row mt8"><button class="btn soft sm">☎ Связаться с продавцом</button><button class="btn out sm">Чат по заказу</button></div></div>`;
  if (S.mobile) return `<div class="phonewrap"><div class="phone"><div class="sb"><span>9:41</span><span>▮▮▮ ◔</span></div><div class="ah"><span>‹</span><b>Заказ 68726458</b></div><div class="pc"><div class="card">${inner.replace(/<h1[^>]*>.*?<\/h1>/, "")}</div></div>
    <div class="tabbar"><span>Главная</span><span>Каталог</span><span>Корзина</span><span class="on">Заказы</span><span>Профиль</span></div></div></div>`;
  return `<div class="buyer">${header()}<div class="wrapb"><div class="oc"><div>${inner}</div><div class="sumc"><h3 style="margin:0 0 8px">Ваша корзина</h3><div class="ln">1 товар<b>${som(6300000)}</b></div><div class="ln">Доставка<b>Бесплатно</b></div><div class="tot"><span>Итого</span><span>${som(6300000)}</span></div></div></div></div></div>`;
}
function render() { $("#app").innerHTML = S.view === "catalogue" ? catalogue() : S.view === "order" ? orderPage() : checkout(); bind(); }
function bind() {
  document.querySelectorAll("[data-f]").forEach(x => x.onclick = () => { const f = x.dataset.f; if (f !== "any" && !S.hdrAddr) { S.pending = f; return addrPicker(); } S.filter = f; render(); });
  const fr = $("#freset"); if (fr) fr.onclick = () => { S.filter = "any"; render(); };
  const ha = $("#hdraddr"); if (ha) ha.onclick = e => { e.preventDefault(); S.pending = S.filter; addrPicker(); };
  document.querySelectorAll("[data-addr]").forEach(x => x.onclick = () => { S.addr = x.dataset.addr; S.msg = ""; if (S.method === "sd" && sdState()[0] === "off") { S.method = ""; S.msg = "Доставка продавцом недоступна для нового адреса. Выберите другой способ доставки."; } render(); });
  document.querySelectorAll("[data-m]").forEach(x => x.onclick = () => { S.method = x.dataset.m; S.msg = ""; render(); });
  const c = $("#sdc"); if (c) c.onclick = e => { if (e.target.id === "tipb") return; if (sdState()[0] === "on") { S.method = "sd"; S.msg = ""; render(); } };
  const tb = $("#tipb"); if (tb) tb.onclick = e => { e.stopPropagation(); S.tip = !S.tip; render(); };
  const ac = $("#addch"); if (ac) ac.onclick = () => { S.cart.push("chairs"); if (S.method === "sd") { S.method = ""; S.msg = "Не все товары в заказе доставляются продавцом бесплатно"; } render(); };
  const pay = $("#pay"); if (pay) pay.onclick = () => { if (S.confirmFail && S.method === "sd") { S.method = ""; S.msg = "Условия доставки продавца изменились. Выберите способ доставки заново."; S.confirmFail = false; return render(); } toast("Переход к оплате (Paylov)…"); };
  const bc = $("#bcancel"); if (bc) bc.onclick = () => toast("Заказ отменён (как сейчас)");
  const rp = $("#report"); if (rp) rp.onclick = () => { S.reported = true; render(); toast("Заказ добавлен в список проблем поддержки"); };
}
harness({ title: "P-SD2 Buyer: delivery time filter, checkout, order page", stories: "US-BF-2.11-01 · US-BF-6.4-01/02/03", version: "1.0" }, [
  { label: "Checkout: card active", apply: () => reset(), notes: ["Address in Tashkent, the fridge qualifies by price: \"Бесплатно · сегодня или завтра\" (US-BF-6.4-02 AC1).", "The info icon shows the seller's note. Select the card: the cart shows \"Доставка: Бесплатно\" (AC5).", "The card is never pre-selected (AC6)."], src: "Seller delivery PRD 4.4, 5.3 · new checkout design 23.10.2026" },
  { label: "Checkout: an item does not qualify", apply: () => reset({ cart: ["fridge", "chairs"] }), notes: ["The chairs do not qualify, so the whole card is inactive (US-BF-6.4-01 AC8).", "The info icon lists the items that do not qualify (US-BF-6.4-02 AC3)."], src: "PRD BR-SD4, M-SD3" },
  { label: "Checkout: city not served", apply: () => reset({ addr: "sam" }), notes: ["Samarkand is not in the branch's city list: inactive with \"Продавец не доставляет по этому адресу\" (US-BF-6.4-01 AC4).", "Click Chirchiq to see \"Бесплатно · 2–3 дня\"."], src: "PRD 4.3, M-SD2" },
  { label: "Checkout: address changed after selecting", apply: () => reset({ method: "sd" }), notes: ["Seller delivery is selected. Click the Samarkand address: the selection is cleared with the message and \"Оформить заказ\" is blocked (US-BF-6.4-02 AC7)."], src: "ТЗ 3.5, M-SD5" },
  { label: "Checkout: terms changed at confirm", apply: () => reset({ method: "sd", confirmFail: true }), notes: ["Click \"Оформить заказ\": the re-check fails, no order is created and the method must be chosen again (US-BF-6.4-02 AC9)."], src: "PRD SD-P3, M-SD6" },
  { label: "Order page: processing", apply: () => reset({ view: "order", stage: "processing" }), notes: ["Stage \"Упаковка\" (25). No code yet; the buyer can still cancel (US-BF-6.4-03 AC3, AC5).", "\"Ожидаемая доставка: до …\" comes from the order deadline (AC1)."], src: "PRD 5.5" },
  { label: "Order page: on the way with the code", apply: () => reset({ view: "order", stage: "shipped" }), notes: ["From 30 the buyer sees the 4-digit code; it is never sent in push or SMS (AC3).", "No cancel button (AC6). The buyer got DLV-01 with the seller-delivery text (US-BF-8.1-03 AC1)."], src: "PRD SD-B11, M-SD7 · not designed (DR-SD8)" },
  { label: "Order page: delivery problem", apply: () => reset({ view: "order", stage: "onhold" }), notes: ["24 OnHold: stage \"В пути\" with \"Проблема с доставкой\" and the seller's reason (AC2). The code stays valid for the next attempt."], src: "PRD SD-B10, DLV-02" },
  { label: "Order page: delivered", apply: () => reset({ view: "order", stage: "delivered" }), notes: ["35 Delivered. \"Сообщить о проблеме\" within 3 days (AC7, ⚑ OQ-SD8). Click it: the order goes to the admin problem list."], src: "PRD SD-B14" },
  { label: "Catalogue: filter with an address", apply: () => reset({ view: "catalogue", filter: "today" }), notes: ["Header address in Tashkent. \"Сегодня или завтра\" shows only products with 1 day: the phone by Yandex Go and the fridge by seller delivery (US-BF-2.11-01 AC2, AC5).", "Switch to \"До 7 дней\" and \"Любой\". Change the header address to Samarkand to see the list change (AC13).", "The grey \"демо\" tag on each card is for the prototype only: the delivery time is not shown on cards in this release (SD-F11)."], src: "PRD 5.8 · catalogue filter design 24.10.2026" },
  { label: "Catalogue: filter without an address", apply: () => reset({ view: "catalogue", hdrAddr: "" }), notes: ["No header address. Pick \"Сегодня или завтра\": the address picker opens (US-BF-2.11-01 AC12). Close it without choosing: the filter stays \"Любой\"."], src: "PRD SD-F4, M-SD25 · not designed (DR-SD10)" },
  { label: "Buyer app: order on the way", apply: () => reset({ view: "order", stage: "shipped", mobile: true }), notes: ["The buyer app shows the same details, code and actions (US-BF-6.4-03 AC9)."], src: "PRD NFR-SD7" },
  { label: "Order page: delivered without code", apply: () => reset({ view: "order", stage: "delivered", noCode: true }), notes: ["The seller used the no-code path. The buyer got SD-N3 and can report a problem (US-BF-6.4-03 AC8)."], src: "PRD SD-S21, SD-N3" },
]);
