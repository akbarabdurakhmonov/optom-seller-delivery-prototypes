// P-SD4 Admin: seller delivery in orders, sellers and the problem list
const AICON = { an: ICON.chart, pr: ICON.box, or: ICON.list, us: ICON.users, de: ICON.truck, mo: '<svg viewBox="0 0 24 24"><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/></svg>' };
const PROB0 = [
  { o: "68726458", s: "ООО «Холод Сервис»", b: "Филиал Чиланзар", c: "Ташкент", st: ["Приостановлен", "a"], r: ["Доставка не удалась", "Просрочен"], age: "2 дн. 3 ч", stc: 24, refused: true },
  { o: "68726102", s: "ИП Каримов", b: "Склад Сергели", c: "Чирчик", st: ["Отправлен", "b"], r: ["Просрочен"], age: "2 дн. 0 ч", stc: 30 },
  { o: "68725977", s: "ООО «Холод Сервис»", b: "Филиал Самарканд", c: "Самарканд", st: ["Доставлено", "n"], r: ["Доставлено без кода"], age: "1 дн. 5 ч", stc: 35 },
  { o: "68725810", s: "ООО «Мебель Опт»", b: "Филиал Юнусабад", c: "Ташкент", st: ["Доставлено", "n"], r: ["Покупатель сообщил о проблеме"], age: "6 ч", stc: 35 }];
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
  const reasons = ["Просрочен", "Доставка не удалась", "Доставлено без кода", "Покупатель сообщил о проблеме", "Продавец заблокирован"];
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
      <div class="bd"><div class="dl"><div><span>Город покупателя:</span> ${r.c}</div><div><span>Срок:</span> сегодня или завтра</div><div><span>Доставить до:</span> 22.10.2026 23:59</div>
        <div><span>Основание (строка 1):</span> цена ≥ порога</div><div><span>Передан в доставку:</span> 22.10.2026 14:05</div><div><span>Доставлено:</span> ${r.stc === 35 ? "23.10.2026 11:20 · " + (r.r.includes("Доставлено без кода") ? "без кода" : "с кодом") : "—"}</div></div>
        ${r.stc === 24 ? `<div class="alert w mt12"><span class="ic">!</span><div><b>Неудачная попытка 1: ${r.refused ? "Покупатель отказался от заказа" : "Покупатель не отвечает"}</b>22.10.2026 16:30 · Николаев А. Д. (продавец)</div></div>` : ""}
        ${r.r.includes("Доставлено без кода") ? `<div class="alert i mt12"><span class="ic">i</span><div><b>Комментарий продавца</b>Покупатель не смог открыть приложение, товар принял менеджер Рустам.</div></div>` : ""}
        <p class="small muted mt12">Код для получения администратору не показывается.</p>
        <h4>История статусов</h4><div class="timeline"><div class="it"><span class="d">•</span><div>16 → 25 Подтверждён<small>22.10.2026 10:12 · Николаев А. Д. · продавец</small></div></div><div class="it"><span class="d">•</span><div>25 → 30 Передан в доставку<small>22.10.2026 14:05 · Николаев А. Д. · продавец</small></div></div></div></div></div></div>`);
}
function orders() {
  return adminShell("or", "", `<div class="apanel"><h1>Заказы</h1><div class="row" style="margin-bottom:14px"><select class="inp" style="max-width:240px" id="meth"><option value="">Способ доставки: все</option><option value="sd" ${S.method === "sd" ? "selected" : ""}>Доставка продавцом</option><option>Fargo</option><option>Yandex Go</option></select></div>
    <table class="t"><thead><tr><th>Заказ</th><th>Продавец</th><th>Способ доставки</th><th>Статус</th><th></th></tr></thead><tbody>${PROB0.map((r, i) => `<tr><td>№${r.o}</td><td>${r.s}</td><td>Доставка продавцом</td><td><span class="pill ${r.st[1]}">${r.st[0]}</span></td><td><span class="go" data-open="${i}">→</span></td></tr>`).join("")}
    ${S.method === "sd" ? "" : '<tr><td>№68724001</td><td>ИП Ахмедов</td><td>Fargo</td><td><span class="pill b">Отправлен</span></td><td></td></tr>'}</tbody></table></div>`);
}
function seller() {
  const log = [["22.10.2026 18:10", "Николаев А. Д.", "Порог цены: — → 5 000 000 сум; Чиланзар: + Чирчик (2–3 дня)"]].concat(S.off ? [["24.10.2026 03:50", "Абдулазиз Холдаров (админ)", "Отключено администратором: " + S.offReason]] : []);
  return adminShell("us", "", `<div class="apanel"><h1>ООО «Холод Сервис» <span class="pill g">Подтвержден</span></h1>
    <div class="att"><div class="hd"><b>Доставка продавцом</b><span style="flex:1"></span>${S.off ? '<span class="pill r">Отключено администратором</span><button class="btn sm soft" id="on">Включить доставку продавцом</button>' : '<span class="pill g">Включено</span><button class="btn sm dan" id="off">Отключить доставку продавцом</button>'}</div>
      <div class="bd"><div class="dl"><div><span>Порог цены:</span> 5 000 000 сум</div><div><span>Порог мин. заказа:</span> 100 шт.</div><div><span>Отмеченных товаров:</span> 2</div></div>
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
harness({ title: "P-SD4 Admin: seller delivery", stories: "US-AF-2.3-01 · US-AF-2.3-02 · US-BF-6.4-04", version: "1.0" }, [
  { label: "Orders: filter and seller-delivery block", apply: () => reset({ view: "orders" }), notes: ["The order filter has \"Доставка продавцом\" (US-AF-2.3-01 AC1). Open an order to see the seller-delivery block: city, delivery time, deadline, basis, handover, attempts and history (AC2).", "The delivery code is never shown to the admin."], src: "Seller delivery PRD SD-A1, SD-A2 · not designed (DR-SD9)" },
  { label: "Seller: settings, log and switch-off", apply: () => reset({ view: "seller" }), notes: ["Read-only settings and the change log (AC3). \"Отключить доставку продавцом\" needs a reason of 10–300 characters (AC4, AC5, ⚑ OQ-SD19)."], src: "PRD SD-A3, SD-A4" },
  { label: "Problem list", apply: () => reset(), notes: ["One row per order with all open reasons, oldest first, filters by reason and seller (US-AF-2.3-02 AC1).", "\"Просрочен\" rows come from the daily job (US-BF-6.4-04 AC4). Open a row to act on it."], src: "PRD SD-A5" },
  { label: "Order on hold: admin actions", apply: () => reset({ view: "order", open: 0 }), notes: ["The buyer refused, so only the admin can move the order on: cancel (→ 46), allow a new attempt, or mark the reason resolved (AC3, AC4, AC6; the last two are ⚑)."], src: "PRD SD-A6, 7" },
  { label: "Empty list", apply: () => reset({ rows: [] }), notes: ["Empty state text (US-AF-2.3-02 AC2)."], src: "M-SD57" },
]);
