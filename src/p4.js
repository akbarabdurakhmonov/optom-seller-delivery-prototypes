// P-SD4 Admin: seller delivery in orders, sellers and the problem list
const AICON = { an: ICON.chart, pr: ICON.box, or: ICON.list, us: ICON.users, de: ICON.truck, mo: '<svg viewBox="0 0 24 24"><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/></svg>' };
// Lines with the eligibility snapshot (SPEC C3): basis per line «сумма заказа» (order total ≥ threshold) or «флаг»,
// plus the order total that was compared at checkout (all in-stock lines, before anything was set aside) and the seller's threshold then.
const PROB0 = [
  { o: "68726458", s: "ООО «Холод Сервис»", b: "Филиал Чиланзар", c: "Ташкент", st: ["Приостановлен", "a"], r: ["Доставка не удалась", "Просрочен"], age: "2 дн. 3 ч", stc: 24, refused: true,
    lines: [["Холодильник Artel HD 455", 1, 6300000, "сумма заказа"]], cmp: 6300000, thr: 5000000 },
  { o: "68726102", s: "ИП Каримов", b: "Склад Сергели", c: "Чирчик", st: ["Отправлен", "b"], r: ["Просрочен"], age: "2 дн. 0 ч", stc: 30,
    lines: [["Кружки керамические", 12, 35000, "флаг"]], cmp: 2220000, thr: 3000000 },
  { o: "68725977", s: "ИП Рашидов", b: "Филиал Самарканд", c: "Самарканд", st: ["В обработке", "b"], r: ["Продавец заблокирован"], age: "1 дн. 5 ч", stc: 25,
    lines: [["Холодильник Artel HD 290", 1, 2000000, "сумма заказа"], ["Морозильник Artel HS 228", 1, 1500000, "сумма заказа"], ["Кондиционер Artel 12", 1, 2000000, "сумма заказа"]], cmp: 5500000, thr: 5000000 },
  { o: "68725810", s: "ООО «Мебель Опт»", b: "Филиал Юнусабад", c: "Ташкент", st: ["Доставлено", "n"], r: ["Покупатель сообщил о проблеме"], age: "6 ч", stc: 35,
    lines: [["Стол офисный Grand", 2, 1450000, "флаг"]], cmp: 2900000, thr: 0 }];
let S = {};
function reset(o) { closeModal(); S = Object.assign({ view: "problems", rf: "", rows: JSON.parse(JSON.stringify(PROB0)), off: false, offReason: "", open: 0, method: "sd" }, o || {}); render(); }
function adminShell(section, sub, content) {
  const nav = (k, t) => `<div class="anav ${section === k ? "on" : ""}">${AICON[k]}${t}</div>`;
  const subs = section === "de" ? [["yg", "Проблемы Yandex Go"], ["problems", "Доставка продавцом: требует внимания"], ["conns", "Подключения продавцов"]].map(s => `<div class="asub ${sub === s[0] ? "on" : ""}">${s[1]}</div>`).join("") : "";
  return `<div class="ash"><aside class="aside">${LOGO.replace("optom</span>", "optom.uz</span>")}${nav("an", "Аналитика")}${nav("pr", "Товары")}${nav("or", "Заказы")}${nav("us", "Пользователи")}${nav("mo", "Модерация")}${nav("de", "Доставка")}${subs}</aside>
    <div><div class="atop"><span class="abox">${ICON.bell.replace("<svg", '<svg width="18" height="18" fill="none" stroke="#38383b" stroke-width="1.6"')}</span><span class="abox">RU ▾</span><span class="abox"><span class="ava" style="width:28px;height:28px;font-size:11px">АХ</span><b style="font-size:13px">Абдулазиз Холдаров</b></span></div>${content}</div></div>`;
}
function problems() {
  const rows = S.rows.filter(r => !S.rf || r.r.includes(S.rf));
  const reasons = ["Просрочен", "Доставка не удалась", "Покупатель сообщил о проблеме", "Продавец заблокирован"];
  const body = rows.length ? `<table class="t"><thead><tr><th>Заказ</th><th>Продавец</th><th>Филиал</th><th>Город</th><th>Статус</th><th>Причины</th><th>С какого времени</th><th></th></tr></thead><tbody>
    ${rows.map((r, i) => `<tr><td><b>№${r.o}</b></td><td>${r.s}</td><td class="muted">${r.b}</td><td>${r.c}</td><td><span class="pill ${r.st[1]}">${r.st[0]}</span></td><td>${r.r.map(x => `<span class="pill r" style="margin:2px">${x}</span>`).join("")}</td><td class="muted">${r.age}</td><td><span class="go" data-open="${S.rows.indexOf(r)}">→</span></td></tr>`).join("")}</tbody></table>`
    : `<div class="empty">Сейчас нет заказов с доставкой продавцом, которые требуют внимания.</div>`;
  return adminShell("de", "problems", `<div class="apanel"><h1>Доставка продавцом: требует внимания</h1><div class="row" style="margin-bottom:14px"><select class="inp" id="rf" style="max-width:280px"><option value="">Все причины</option>${reasons.map(x => `<option ${S.rf === x ? "selected" : ""}>${x}</option>`).join("")}</select><select class="inp" style="max-width:240px"><option>Все продавцы</option></select><span class="hint">сначала самые старые</span></div>${body}</div>`);
}
function orderPanel() {
  const r = S.rows[S.open] || PROB0[0];
  const acts = [];
  if (r.stc !== 35) acts.push('<button class="btn dan" id="acancel">Отменить заказ</button>');
  if (r.stc === 24) acts.push('<button class="btn pri" id="retry">Разрешить новую попытку</button>');
  if (r.stc === 30) acts.push('<button class="btn out" id="back">Вернуть в обработку</button>');
  acts.push('<button class="btn out" id="resolve">Отметить решённым</button>');
  return adminShell("or", "", `<div class="apanel"><h1>Заказ №${r.o} <span class="pill ${r.st[1]}">${r.st[0]}</span></h1>
    <div class="row" style="gap:8px;flex-wrap:wrap">${acts.join("")}</div>
    <div class="att"><div class="hd">${ICON.truck.replace("<svg", '<svg width="20" height="20" fill="none" stroke="#38383b" stroke-width="1.6"')}<b>Доставка продавцом</b><span class="sp" style="flex:1"></span>${r.r.map(x => `<span class="pill r">${x}</span>`).join("")}</div>
      <div class="bd"><div class="dl"><div><span>Город покупателя:</span> ${r.c}</div><div><span>Срок:</span> ${r.c==="Чирчик"?"2–3 дня":"сегодня или завтра"}</div><div><span>Доставить до:</span> 22.10.2026 23:59</div>
        <div><span>Передан в доставку:</span> ${r.stc >= 30 ? "22.10.2026 14:05" : "—"}</div><div><span>Доставлено:</span> ${r.stc === 35 ? "23.10.2026 11:20" : "—"}</div>${r.stc === 35 ? `<div><span>Автозавершение:</span> ${r.r.includes("Покупатель сообщил о проблеме") ? "приостановлено, обращение открыто" : "30.10.2026 23:59"}</div>` : ""}</div>
        <h4>Основание бесплатной доставки</h4><table class="t"><thead><tr><th>Товар</th><th>Кол-во</th><th>Сумма</th><th>Основание</th></tr></thead><tbody>${r.lines.map(l => `<tr><td>${l[0]}</td><td>${l[1]} шт.</td><td>${som(l[1] * l[2])}</td><td><span class="pill ${l[3] === "флаг" ? "v" : "g"}">${l[3] === "флаг" ? "Флаг" : "Сумма заказа"}</span></td></tr>`).join("")}</tbody></table>
        <div class="dl mt12"><div><span>Сумма заказа при проверке:</span> ${som(r.cmp)}</div><div><span>Порог продавца:</span> ${r.thr ? som(r.thr) + (r.cmp >= r.thr ? " · достигнут" : " · не достигнут") : "не задан"}</div></div>
        ${r.stc === 24 ? `<div class="alert w mt12"><span class="ic">!</span><div><b>Неудачная попытка 1: ${r.refused ? "Покупатель отказался от заказа" : "Покупатель не отвечает"}</b>22.10.2026 16:30 · Николаев А. Д. (продавец)</div></div>` : ""}
        <h4>История статусов</h4><div class="timeline"><div class="it"><span class="d">•</span><div>16 → 25 Подтверждён<small>22.10.2026 10:12 · Николаев А. Д. · продавец</small></div></div>${r.stc === 25 ? "" : '<div class="it"><span class="d">•</span><div>25 → 30 Передан в доставку<small>22.10.2026 14:05 · Николаев А. Д. · продавец</small></div></div>'}</div></div></div></div>`);
}
function orders() {
  return adminShell("or", "", `<div class="apanel"><h1>Заказы</h1><div class="row" style="margin-bottom:14px"><select class="inp" style="max-width:240px" id="meth"><option value="">Способ доставки: все</option><option value="sd" ${S.method === "sd" ? "selected" : ""}>Доставка продавцом</option><option>Fargo</option><option>Yandex Go</option></select></div>
    <table class="t"><thead><tr><th>Заказ</th><th>Продавец</th><th>Способ доставки</th><th>Статус</th><th></th></tr></thead><tbody>${PROB0.map((r, i) => `<tr><td>№${r.o}</td><td>${r.s}</td><td>Доставка продавцом</td><td><span class="pill ${r.st[1]}">${r.st[0]}</span></td><td><span class="go" data-open="${i}">→</span></td></tr>`).join("")}
    ${S.method === "sd" ? "" : '<tr><td>№68724001</td><td>ИП Ахмедов</td><td>Fargo</td><td><span class="pill b">Отправлен</span></td><td></td></tr>'}</tbody></table></div>`);
}
function seller() {
  const log = [["22.10.2026 18:10", "Николаев А. Д.", "Порог суммы заказа: — → 5 000 000 сум; Чиланзар: + Чирчик (2–3 дня)"]].concat(S.off ? [["24.10.2026 03:50", "Абдулазиз Холдаров (админ)", "Отключено администратором: " + S.offReason]] : []);
  return adminShell("us", "", `<div class="apanel"><h1>ООО «Холод Сервис» <span class="pill g">Подтвержден</span></h1>
    <div class="att"><div class="hd"><b>Доставка продавцом</b><span style="flex:1"></span>${S.off ? '<span class="pill r">Отключено администратором</span><button class="btn sm soft" id="on">Включить доставку продавцом</button>' : '<span class="pill g">Включено</span><button class="btn sm dan" id="off">Отключить доставку продавцом</button>'}</div>
      <div class="bd"><div class="dl"><div><span>Порог суммы заказа:</span> 5 000 000 сум</div><div><span>Отмечено товаров:</span> 2</div></div>
        <table class="t mt12"><thead><tr><th>Филиал</th><th>Города и сроки</th></tr></thead><tbody><tr><td>Филиал Чиланзар</td><td>Ташкент — сегодня или завтра; Чирчик — 2–3 дня</td></tr><tr><td>Филиал Самарканд</td><td>Самарканд — сегодня или завтра; Бухара — 4–7 дней</td></tr></tbody></table>
        ${S.off ? `<div class="alert e mt12"><span class="ic">!</span><div><b>Причина отключения</b>${esc(S.offReason)}</div></div>` : ""}
        <h4>Журнал изменений</h4><table class="t"><tbody>${log.map(l => `<tr><td class="muted">${l[0]}</td><td>${l[1]}</td><td>${esc(l[2])}</td></tr>`).join("")}</tbody></table></div></div></div>`);
}
function render() { $("#app").innerHTML = S.view === "order" ? orderPanel() : S.view === "orders" ? orders() : S.view === "seller" ? seller() : problems(); bind(); }
function commentDialog(title, btn, done) {
  const m = modal(`<h3>${title}</h3><textarea class="inp" id="why" maxlength="300" placeholder="Комментарий (10–300 символов)"></textarea><span class="err-t" id="e"></span><div class="acts"><button class="btn out" id="no">Назад</button><button class="btn pri" id="yes">${btn}</button></div>`);
  $("#no", m).onclick = closeModal;
  $("#yes", m).onclick = () => { const v = $("#why", m).value.trim(); if (v.length < 10) return $("#e", m).textContent = "Введите не менее 10 символов."; closeModal(); done(v); };
}
function bind() {
  document.querySelectorAll("[data-open]").forEach(x => x.onclick = () => { S.open = +x.dataset.open; S.view = "order"; render(); });
  const rf = $("#rf"); if (rf) rf.onchange = () => { S.rf = rf.value; render(); };
  const me = $("#meth"); if (me) me.onchange = () => { S.method = me.value; render(); };
  const on = (id, f) => { const e = $("#" + id); if (e) e.onclick = f; };
  on("acancel", () => commentDialog("Отменить заказ?", "Отменить заказ", () => { const r = S.rows[S.open]; r.st = ["Отменён администратором", "r"]; r.stc = 46; S.rows.splice(S.open, 1); S.view = "problems"; render(); toast("Заказ отменён (46). Покупатель и продавец получили уведомление"); }));
  on("retry", () => commentDialog("Разрешить новую попытку доставки?", "Разрешить", () => { toast("Продавец снова видит «Готов к доставке»"); }));
  on("back", () => commentDialog("Вернуть заказ в обработку?", "Вернуть", () => { const r = S.rows[S.open]; r.st = ["В обработке", "b"]; r.stc = 25; render(); toast("Заказ возвращён в статус 25"); }));
  on("resolve", () => commentDialog("Отметить причину решённой?", "Отметить", () => { S.rows.splice(S.open, 1); S.view = "problems"; render(); toast("Причина закрыта"); }));
  on("off", () => commentDialog("Отключить доставку продавцом для продавца?", "Отключить", v => { S.off = true; S.offReason = v; render(); toast("Отключено. Продавец получил уведомление"); }));
  on("on", () => { S.off = false; render(); toast("Доставка продавцом снова включена"); });
}
harness({ title: "P-SD4 Admin: seller delivery", stories: "US-AF-2.3-01 · US-AF-2.3-02 · US-BF-6.4-04", version: "1.5" }, [
  { label: "Orders: filter and seller-delivery block", apply: () => reset({ view: "orders" }), notes: ["The order filter has \"Доставка продавцом\" (US-AF-2.3-01 AC1). Open an order to see the seller-delivery block: city, delivery time, deadline, handover and delivery times, attempts and history (AC2).", "\"Основание бесплатной доставки\" is the snapshot saved at checkout: the basis per line (\"Флаг\" or \"Сумма заказа\"), the order total that was compared and the seller's threshold at that time (SPEC C3). There are no MOQ or delivery-code facts any more (decided 01.11.2026)."], src: "Seller delivery PRD v1.5 SD-A1, SD-A2 · not designed (DR-SD9)" },
  { label: "Seller: settings, log and switch-off", apply: () => reset({ view: "seller" }), notes: ["Read-only settings: the order-total threshold and the number of flagged products; the MOQ threshold is removed (AC3). The change log keeps every change.", "\"Отключить доставку продавцом\" needs a reason of 10–300 characters (AC4, AC5, decided OQ-SD19)."], src: "PRD SD-A3, SD-A4" },
  { label: "Problem list", apply: () => reset(), notes: ["One row per order with all open reasons, oldest first, filters by reason and seller (US-AF-2.3-02 AC1).", "Four reasons: \"Просрочен\", \"Доставка не удалась\", \"Покупатель сообщил о проблеме\", \"Продавец заблокирован\". \"Доставлено без кода\" is removed with the delivery code (decided 01.11.2026, OQ-SD7).", "\"Просрочен\" rows come from the daily job (US-BF-6.4-04 AC4). Open a row to act on it."], src: "PRD v1.5 SD-A5" },
  { label: "Order on hold: admin actions", apply: () => reset({ view: "order", open: 0 }), notes: ["The buyer refused, so only the admin can move the order on: cancel (→ 46), allow a new attempt, or mark the reason resolved (AC3, AC4, AC6; the new attempt is decided, OQ-SD9; \"Mark resolved\" is still ⚑).", "Basis: the order total 6 300 000 сум reached the 5 000 000 сум threshold, so the line is \"Сумма заказа\"."], src: "PRD SD-A6, 7" },
  { label: "Empty list", apply: () => reset({ rows: [] }), notes: ["Empty state text (US-AF-2.3-02 AC2)."], src: "M-SD57" },
  { label: "Delivered order: buyer reported a problem", apply: () => reset({ view: "order", open: 3 }), notes: ["35 Delivered and the buyer pressed \"Сообщить о проблеме\" within the 7 days: the order stays at 35, the reason is \"Покупатель сообщил о проблеме\" and auto-completion is paused while the report is open (BR-SD22). The return / dispute flow is in the Returns and disputes PRD.", "The seller has no threshold, so the line qualified by its flag: basis \"Флаг\", compared total 2 900 000 сум, threshold \"не задан\".", "Open \"ИП Каримов\" (row 2 of the problem list): the order has only the flagged mugs (420 000 сум), but the compared total is 2 220 000 сум, because the total is computed over all in-stock lines of the checkout before the chairs were set aside (they stayed in the buyer's cart). Set-aside lines are not stored on the order."], src: "PRD v1.5 SD-A2, SD-A5, SD-B14" },
]);
