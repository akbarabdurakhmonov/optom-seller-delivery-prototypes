// P-SD1 Seller: seller-delivery settings and product flag
const TERMS = [["D0_1", "Сегодня или завтра"], ["D2_3", "2–3 дня"], ["D4_7", "4–7 дней"], ["D8_14", "8–14 дней"], ["D15_30", "15–30 дней"]];
const CITIES = ["Ташкент", "Чирчик", "Ангрен", "Алмалык", "Самарканд", "Бухара", "Андижан", "Наманган", "Фергана", "Карши", "Навои", "Нукус"];
// Demo catalogue of the seller. neg = negotiable price: never counts for seller delivery.
const PRODUCTS = [{ n: "Холодильник Artel HD 455", p: 6300000, f: false }, { n: "Стиральная машина LG F2J3", p: 5200000, f: false }, { n: "Стулья офисные (комплект)", p: 450000, f: false },
  { n: "Бумажные стаканы 250 мл", p: 900, f: false }, { n: "Кружки керамические", p: 35000, f: true }, { n: "Витринный холодильник", p: 4100000, f: true }, { n: "Холодильная камера на заказ", p: 0, f: false, neg: true }];
const BR0 = [{ id: 1, name: "Филиал Чиланзар", city: "Ташкент", ticked: false, cities: [] }, { id: 2, name: "Склад Сергели", city: "Ташкент", ticked: false, cities: [] },
  { id: 3, name: "Филиал Самарканд", city: "Самарканд", ticked: false, cities: [] }, { id: 4, name: "Новый склад (без адреса)", city: "", ticked: false, cities: [] }];
let S = {};
function reset(o) {
  closeModal();
  S = Object.assign({ view: "settings", on: false, price: "", note: "", branches: JSON.parse(JSON.stringify(BR0)), saved: null, activeOrders: 0, adminOff: "", failSave: false, picker: null,
    flag: false, sdOn: true, negotiable: false, prodPrice: "6 300 000", dirty: false }, o || {});
  render();
}
const num = v => +String(v).replace(/\D/g, "") || 0;
function errors() {
  const e = {};
  if (!S.on) return e;
  if (S.price !== "" && (num(S.price) < 1000 || num(S.price) > 1e9)) e.price = "Введите сумму от 1 000 до 1 000 000 000 сум";
  const t = S.branches.filter(b => b.ticked);
  if (!t.length) e.br = "Выберите хотя бы один филиал, из которого вы доставляете";
  t.forEach(b => { if (!b.cities.length) e["c" + b.id] = "Добавьте хотя бы один город, куда доставляет филиал"; else if (b.cities.some(c => !c.term)) e["t" + b.id] = "Выберите срок доставки для каждого города"; });
  return e;
}
// Live count (SD-S7, proposed) is M-SD48 «Отмечено товаров: {n}»: flagged fixed-price products only,
// because the order-total rule cannot be counted per product.
const qualify = () => PRODUCTS.filter(p => !p.neg && p.f).length;
function cityRows(b, ro) {
  return b.cities.map((c, i) => `<div class="cityrow"><div class="inp" style="background:#f6f7f9">${esc(c.city)}</div>
    <select class="inp" data-term="${b.id}:${i}" ${ro ? "disabled" : ""}><option value="">Срок доставки…</option>${TERMS.map(t => `<option value="${t[0]}" ${c.term === t[0] ? "selected" : ""}>${t[1]}</option>`).join("")}</select>
    <button class="x" data-rm="${b.id}:${i}" ${ro ? "disabled" : ""} title="Удалить">✕</button></div>`).join("");
}
function branchBlock(b, e, ro) {
  if (!b.city) return `<div class="brblock"><label class="chk" style="margin:0;opacity:.55"><input type="checkbox" disabled><span><b>${esc(b.name)}</b><div class="hint">Укажите город филиала, чтобы доставлять из него · <a href="#" onclick="return false">Изменить филиал</a></div></span></label></div>`;
  return `<div class="brblock ${b.ticked ? "on" : ""}"><label class="chk" style="margin:0"><input type="checkbox" data-br="${b.id}" ${b.ticked ? "checked" : ""} ${ro ? "disabled" : ""}><span><b>${esc(b.name)}</b> <span class="muted">· ${esc(b.city)}</span></span></label>
    ${b.ticked ? `<div style="margin-left:28px"><div class="small muted mt8">Города доставки и срок</div>${cityRows(b, ro)}
      ${S.picker === b.id ? `<div class="row mt8"><select class="inp" id="cpick" style="max-width:260px"><option value="">Найдите город…</option>${CITIES.map(c => `<option>${c}</option>`).join("")}</select><span class="err-t" id="dup"></span></div>` : ""}
      ${!ro ? `<button class="btn link sm" data-add="${b.id}">＋ Добавить город</button>` : ""}
      ${e["c" + b.id] ? `<div class="err-t">${e["c" + b.id]}</div>` : ""}${e["t" + b.id] ? `<div class="err-t">${e["t" + b.id]}</div>` : ""}</div>` : ""}</div>`;
}
function sdBlock(mobile) {
  const e = errors(), ro = !!S.adminOff, valid = !Object.keys(e).length;
  const head = `<div class="row" style="justify-content:space-between;align-items:flex-start"><div><h3 style="margin:0">🚚 Доставка продавцом</h3><p class="sub small">Своим транспортом, всегда бесплатно для покупателя</p></div><button class="toggle ${S.on ? "on" : ""}" id="sw" ${ro ? "disabled" : ""}></button></div>`;
  if (S.adminOff) return `<div class="card">${head}<div class="alert e mt12"><span class="ic">!</span><div><b>Доставка продавцом отключена администратором: ${esc(S.adminOff)}</b>Обратитесь в поддержку, если не согласны.</div></div></div>`;
  if (!S.on) return `<div class="card">${head}</div>`;
  const warn = S.price === "" && !PRODUCTS.some(p => p.f) ? `<div class="alert w mt12"><span class="ic">!</span><div>Сейчас ни один товар не подходит для бесплатной доставки. Укажите порог или отметьте товары.</div></div>` : "";
  return `<div class="card">${head}
    <div class="field mt16" style="${mobile ? "" : "max-width:440px"}"><label>Бесплатно, если сумма заказа от</label><input class="inp ${e.price ? "err" : ""}" id="price" placeholder="например, 5 000 000" value="${esc(S.price)}"><span class="hint">Сумма одного заказа из этого филиала, без учёта промокодов</span>${e.price ? `<span class="err-t">${e.price}</span>` : ""}</div>
    <div class="field"><label>Условия для покупателя <span class="counter">${S.note.length}/300</span></label><textarea class="inp" id="note" maxlength="300" placeholder="Например: доставка до подъезда, разгрузка за счёт покупателя">${esc(S.note)}</textarea></div>
    <div class="pill g">Отмечено товаров: ${qualify()}</div>${warn}
    <h4 style="margin:18px 0 0">Филиалы, из которых вы доставляете</h4>${S.branches.map(b => branchBlock(b, e, ro)).join("")}
    ${e.br ? `<div class="err-t mt8">${e.br}</div>` : ""}
    <div class="row mt16"><button class="btn pri" id="save" ${valid ? "" : "disabled"}>Сохранить</button>${S.saved ? `<span class="hint">Сохранено ${S.saved}</span>` : ""}</div></div>`;
}
function settingsPage() {
  const other = `<div class="card"><h3>Способы доставки</h3><p class="sub">Выберите, как покупатели могут получить ваши заказы</p>
    <div class="kv mt12"><div style="flex:1">${FARGO} <span class="muted small">· подключено</span></div><span class="pill g">Включено</span></div>
    <div class="kv"><div style="flex:1">${YG} <span class="muted small">· отдельный блок</span></div><span class="pill n">Настроить</span></div>
    <div class="kv"><div style="flex:1"><b>Самовывоз</b> <span class="muted small">· позже</span></div><span class="pill n">Скоро</span></div></div>`;
  return sellerShell("se", `Настройки <span>›</span> <b>Доставка</b>`, `<div class="h1">Доставка</div>${other}<div class="mt12">${sdBlock(false)}</div>`);
}
function productPage() {
  const dis = S.negotiable;
  return sellerShell("pr", `Товары <span>›</span> <b>Редактирование</b>`, `<div class="h1">Холодильник Artel HD 455</div>
    <div class="card"><div class="grid2"><div class="field"><label>Цена, сум</label><input class="inp" value="${esc(S.prodPrice)}"></div><div class="field"><label>Минимальный заказ, шт.</label><input class="inp" value="1"></div></div>
      <label class="chk"><input type="checkbox" id="neg" ${S.negotiable ? "checked" : ""}><span>Договорная цена</span></label>
      <div class="brblock ${S.flag && !dis ? "on" : ""}"><label class="chk" style="margin:0"><input type="checkbox" id="flag" ${S.flag && !dis ? "checked" : ""} ${dis ? "disabled" : ""}><span><b>Бесплатная доставка продавцом</b>
        <div class="hint">${dis ? "Товары с договорной ценой пока не могут доставляться продавцом бесплатно." : "Товар доставляется бесплатно, если адрес покупателя в зоне вашей доставки."}</div>
        ${!S.sdOn && !dis ? `<div class="hint" style="color:#b54708">Доставка продавцом выключена в настройках. <a href="#" onclick="return false">Открыть настройки</a></div>` : ""}</span></label></div>
      <div class="row mt16"><button class="btn out">Отмена</button><button class="btn pri" id="psave">Сохранить</button></div></div>`);
}
function mobilePage() {
  return `<div class="phonewrap"><div class="phone"><div class="sb"><span>9:41</span><span>▮▮▮ ◔</span></div><div class="ah"><span>‹</span><b>Доставка</b></div><div class="pc">${sdBlock(true)}</div>
    <div class="tabbar"><span>Главная</span><span>Заказы</span><span>Товары</span><span>Чаты</span><span class="on">Ещё</span></div></div></div>`;
}
function render() { $("#app").innerHTML = S.view === "product" ? productPage() : S.view === "mobile" ? mobilePage() : settingsPage(); bind(); }
function bind() {
  const sw = $("#sw"); if (sw) sw.onclick = () => {
    if (S.on && S.activeOrders) return offDialog();
    S.on = !S.on; render(); };
  const inp = (id, k) => { const el = $("#" + id); if (el) el.oninput = e => { S[k] = e.target.value; const p = el.selectionStart; render(); const n = $("#" + id); n.focus(); try { n.setSelectionRange(p, p); } catch (_) {} }; };
  inp("price", "price"); inp("note", "note");
  document.querySelectorAll("[data-br]").forEach(c => c.onchange = () => { const b = S.branches.find(x => x.id == c.dataset.br); b.ticked = c.checked; if (b.ticked && !b.cities.length) b.cities.push({ city: b.city, term: "" }); render(); });
  document.querySelectorAll("[data-term]").forEach(s => s.onchange = () => { const [b, i] = s.dataset.term.split(":"); S.branches.find(x => x.id == b).cities[i].term = s.value; render(); });
  document.querySelectorAll("[data-rm]").forEach(s => s.onclick = () => { const [b, i] = s.dataset.rm.split(":"); S.branches.find(x => x.id == b).cities.splice(i, 1); render(); });
  document.querySelectorAll("[data-add]").forEach(s => s.onclick = () => { S.picker = +s.dataset.add; render(); });
  const cp = $("#cpick"); if (cp) cp.onchange = () => { const b = S.branches.find(x => x.id == S.picker); if (b.cities.some(c => c.city === cp.value)) { $("#dup").textContent = "Этот город уже добавлен"; return; } b.cities.push({ city: cp.value, term: "" }); S.picker = null; render(); };
  const sv = $("#save"); if (sv) sv.onclick = () => { if (S.failSave) return toast("Не удалось сохранить настройки. Попробуйте ещё раз."); S.saved = "сегодня в 03:42"; render(); toast("Настройки сохранены"); };
  const fl = $("#flag"); if (fl) fl.onchange = () => { S.flag = fl.checked; };
  const ng = $("#neg"); if (ng) ng.onchange = () => { S.negotiable = ng.checked; render(); };
  const ps = $("#psave"); if (ps) ps.onclick = () => toast(S.flag && !S.negotiable ? "Товар сохранён. Повторная модерация не нужна: изменилась только доставка" : "Товар сохранён");
}
function offDialog() {
  const m = modal(`<h3>Выключить доставку продавцом?</h3><p>У вас ${S.activeOrders} активных заказов с доставкой продавцом. Их всё равно нужно доставить.</p><div class="acts"><button class="btn out" id="keep">Оставить включённой</button><button class="btn danfill" id="off">Выключить</button></div>`);
  $("#keep", m).onclick = closeModal; $("#off", m).onclick = () => { closeModal(); S.on = false; render(); toast("Настройки сохранены"); };
}
const filled = () => { const b = JSON.parse(JSON.stringify(BR0)); b[0].ticked = true; b[0].cities = [{ city: "Ташкент", term: "D0_1" }, { city: "Чирчик", term: "D2_3" }]; b[2].ticked = true; b[2].cities = [{ city: "Самарканд", term: "D0_1" }, { city: "Бухара", term: "D4_7" }]; return b; };
harness({ title: "P-SD1 Seller: seller delivery settings and product flag", stories: "US-SF-5.5-01 · US-SF-5.4-01", version: "1.5" }, [
  { label: "Settings, seller delivery off", apply: () => reset(), notes: ["Default state: the block is off and shows nothing else (US-SF-5.5-01 AC1).", "Click the switch to turn it on (AC2). Fargo, Yandex Go and pickup are only placeholders here."], src: "Seller delivery PRD 5.1 · not designed (DR-SD5)" },
  { label: "Settings filled in, two branches", apply: () => reset({ on: true, price: "5 000 000", note: "Доставка до подъезда, разгрузка за счёт покупателя.", branches: filled() }), notes: ["Two branches deliver; each city has its own delivery time from five fixed ranges (AC3, AC4).", "Try \"+ Добавить город\" and pick Ташкент again to see \"Этот город уже добавлен\" (AC5).", "One threshold only: \"Бесплатно, если сумма заказа от\" (L-SD2, changed in v1.5). It is compared with the total of one order from one branch: Σ price after the seller's discount × quantity, before promo codes; out-of-stock and negotiable-price lines do not count; \"at least\" (≥). If the total reaches it, every line of that order is delivered free (decided 01.11.2026, OQ-SD1).", "Example: threshold 5 000 000 сум; an order of 2 000 000 + 1 500 000 + 2 000 000 = 5 500 000 сум from the same branch → the whole order qualifies.", "The MOQ threshold \"Бесплатно, если минимальный заказ от\" is removed from the MVP (later; OQ-SD3).", "The hint under the field is M-SD64 \"The total of one order from this branch, before promo codes\". The amount is in сум.", "The live count is now M-SD48 \"Отмечено товаров: N\" (AC10, nice to have): flagged products only, because the order-total rule cannot be counted per product. Negotiable-price products never count.", "\"Новый склад\" has no city, so it cannot be ticked (AC9)."], src: "PRD 4.3, 4.6, 5.1" },
  { label: "Validation errors", apply: () => { const b = JSON.parse(JSON.stringify(BR0)); b[0].ticked = true; b[0].cities = [{ city: "Ташкент", term: "" }]; b[1].ticked = true; reset({ on: true, price: "500", branches: b }); }, notes: ["\"Сохранить\" stays disabled while any error is shown (AC6).", "Errors: the order-total threshold out of range (M-SD13, 1 000 – 1 000 000 000 сум), a branch without a city, a city without a delivery time. An empty threshold is allowed: then only flagged products qualify."], src: "PRD 5.1 field table, M-SD12, M-SD13, M-SD26" },
  { label: "Turning off with active orders", apply: () => reset({ on: true, price: "5 000 000", branches: filled(), activeOrders: 3, saved: "вчера в 18:10" }), notes: ["Click the switch: the dialog warns that 3 active orders must still be delivered (AC11).", "\"Выключить\" turns the method off for new checkouts only."], src: "PRD SD-S9, M-SD16" },
  { label: "Switched off by the admin", apply: () => reset({ on: false, adminOff: "покупателям предлагали платную доставку" }), notes: ["The switch is locked and the admin's reason is shown (AC13). The seller cannot turn it back on."], src: "PRD SD-S10, M-SD22; US-AF-2.3-01" },
  { label: "Product form with the flag", apply: () => reset({ view: "product", flag: true }), notes: ["Checkbox \"Бесплатная доставка продавцом\" with its hint (US-SF-5.4-01 AC1).", "Saving only this field does not send the product back to moderation (AC4).", "Tick \"Договорная цена\" to see the checkbox disabled (AC5, proposed)."], src: "PRD 5.2 · not designed (DR-SD7)" },
  { label: "Flag while seller delivery is off", apply: () => reset({ view: "product", sdOn: false }), notes: ["The flag still saves; the hint says seller delivery is off and links to the settings (AC3)."], src: "PRD SD-S14, M-SD20" },
  { label: "Seller app: settings", apply: () => reset({ view: "mobile", on: true, price: "5 000 000", branches: filled() }), notes: ["The seller app has the same block, rules and messages (US-SF-5.5-01 AC15)."], src: "PRD NFR-SD7" },
]);
