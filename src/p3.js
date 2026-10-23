// P-SD3 Seller: seller-delivery order actions (website and app)
const ST = { 16: ["Новый", "g"], 25: ["В обработке", "b"], 30: ["Отправлен", "b"], 24: ["Приостановлен", "a"], 35: ["Доставлено", "n"], 45: ["Отменён продавцом", "r"] };
const REASONS = [["NoAnswer", "Покупатель не отвечает"], ["WrongAddress", "Неверный адрес"], ["Refused", "Покупатель отказался от заказа"], ["Other", "Другое"]];
let S = {};
function reset(o) {
  closeModal();
  S = Object.assign({ st: 16, hist: [], tries: 0, lockUntil: 0, failCount: 0, reason: "", conflict: false, overdue: false, mobile: false, notif: false, noCode: false, adminRetry: false }, o || {});
  render();
}
const log = t => S.hist.push([t, "сегодня в " + new Date().toTimeString().slice(0, 5), "Николаев А. Д. · продавец"]);
function setSt(n, t, msg) {
  if (S.conflict) { closeModal(); S.conflict = false; S.st = 41; render(); return toast("Статус заказа уже изменился. Обновите страницу."); }
  S.st = n; log(t); closeModal(); render(); if (msg) toast(msg);
}
const supportOnly = () => S.st === 24 && (S.reason === "Refused" || S.failCount >= 3) && !S.adminRetry;
function actions() {
  const b = (id, cls, t) => `<button class="btn ${cls}" id="${id}">${t}</button>`;
  if (S.st === 41) return `<div class="alert e"><span class="ic">!</span><div><b>Покупатель отменил заказ</b>Не отправляйте и не передавайте товары.</div></div>`;
  if (S.st === 16) return `<h3>Подтвердите заказ</h3><p class="sub">У вас есть 24 часа, чтобы принять заказ.</p><div class="row mt12">${b("reject", "dan", "Отклонить")}${b("confirm", "pri", "Подтвердить")}</div>`;
  if (S.st === 25) return `<h3>Соберите и отправьте заказ</h3><p class="sub">Когда заказ уедет к покупателю, нажмите «Готов к доставке». Покупатель получит код для получения.</p><div class="row mt12">${b("cancel", "dan", "Отменить заказ")}${b("ready", "pri", "Готов к доставке")}</div>`;
  if (S.st === 30) return `<h3>Заказ в пути</h3><p class="sub">При передаче попросите у покупателя 4-значный код из его заказа.</p><div class="row mt12">${b("fail", "out", "Не удалось доставить")}${b("deliv", "pri", "Доставлено")}</div><p class="hint mt8">Отменить заказ в доставке может только поддержка.</p>`;
  if (S.st === 24) return supportOnly() ? `<div class="alert w"><span class="ic">!</span><div><b>Поддержка примет решение по этому заказу. Дождитесь сообщения.</b>Причина: ${REASONS.find(r => r[0] === S.reason)[1]}${S.failCount >= 3 ? " · неудачных попыток: " + S.failCount : ""}</div></div>`
    : `<div class="alert w"><span class="ic">!</span><div><b>Доставка не удалась: ${REASONS.find(r => r[0] === S.reason)[1]}</b>Попробуйте доставить ещё раз. Попытка ${S.failCount} из 3.</div></div><div class="row mt12">${b("ready", "pri", "Готов к доставке")}</div>`;
  if (S.st === 35) return `<div class="alert s"><span class="ic">✓</span><div><b>Доставлено ${S.noCode ? "без кода" : "с кодом"}</b>${S.noCode ? "Заказ попал в список проверки поддержки." : "Покупатель подтвердил получение кодом."}</div></div>`;
  if (S.st === 45) return `<div class="alert e"><span class="ic">!</span><div><b>Заказ отменён</b>Покупатель получил уведомление. Товары вернулись на остаток филиала.</div></div>`;
  return "";
}
function deadline() { return `<span class="${S.overdue ? "overdue" : ""}">Доставить до 24.10.2026${S.overdue ? " · Просрочен" : ""}</span>`; }
function orderBody() {
  const os = ST[S.st] || ["Отменён покупателем", "r"];
  const hist = S.hist.length ? `<div class="timeline mt12" style="border-top:1px solid var(--line);padding-top:8px">${S.hist.map(h => `<div class="it"><span class="d">•</span><div>${h[0]}<small>${h[1]} · ${h[2]}</small></div></div>`).join("")}</div>` : "";
  return `<div class="card">${actions()}</div><div class="card"><h3>Доставка</h3>
      <div class="kv">${ICON.truck}<div><span class="k">Способ:</span> Доставка продавцом · бесплатно для покупателя</div></div>
      <div class="kv">${ICON.pin}<div><span class="k">Адрес:</span> Ташкент, массив Буз-1, 8 · <b>Ташкент</b></div></div>
      <div class="kv">${ICON.cal}<div><span class="k">Срок:</span> сегодня или завтра · ${deadline()}</div></div>
      <div class="kv">${ICON.user}<div><span class="k">Покупатель:</span> Азизбек Хамидов · +998 90 222 02 20</div></div>${hist}</div>
    <div class="card"><h3>Товары</h3><div class="prod mt8"><span class="thumb"></span>Холодильник Artel HD 455 · 1 шт. · ${som(6300000)}</div></div>`;
}
function web() {
  const os = ST[S.st] || ["Отменён покупателем", "r"];
  const notif = S.notif ? `<div class="notif" style="position:fixed;right:20px;top:60px;z-index:30"><span class="ic2">!</span><div><b>Срок доставки истёк: заказ №68726458</b><div class="small">Доставьте заказ или сообщите о проблеме.</div><button class="btn sm soft mt8">Открыть заказ</button></div></div>` : "";
  return sellerShell("or", `Заказы <span>›</span> <b>№68726458</b>`, `${notif}<div class="h1">Заказ №68726458 <span class="pill ${os[1]}">${os[0]}</span></div><div class="og"><div>${orderBody()}</div>
    <div class="card"><h3>Список заказов</h3><table class="t"><tbody><tr><td>№68726458<div class="small">${deadline()}</div></td><td><span class="pill ${os[1]}">${os[0]}</span></td></tr><tr><td>№68726402<div class="small muted">Доставить до 26.10.2026</div></td><td><span class="pill b">В обработке</span></td></tr></tbody></table></div></div>`);
}
function app() {
  const os = ST[S.st] || ["Отменён покупателем", "r"];
  return `<div class="phonewrap"><div class="phone"><div class="sb"><span>9:41</span><span>▮▮▮ ◔</span></div><div class="ah"><span>‹</span><b>Мои заказы · №68726458</b></div><div class="pc"><span class="pill ${os[1]}">${os[0]}</span><div class="mt8">${orderBody()}</div></div>
    <div class="tabbar"><span>Главная</span><span class="on">Заказы</span><span>Товары</span><span>Чаты</span><span>Ещё</span></div></div></div>`;
}
function render() { $("#app").innerHTML = S.mobile ? app() : web(); bind(); }
function bind() {
  const on = (id, f) => { const e = $("#" + id); if (e) e.onclick = f; };
  on("confirm", () => setSt(25, "Заказ подтверждён (16 → 25)", "Заказ подтверждён"));
  on("reject", () => setSt(45, "Заказ отклонён продавцом", "Заказ отклонён"));
  on("ready", readyDialog); on("cancel", cancelDialog); on("deliv", codeDialog); on("fail", failDialog);
}
function readyDialog() {
  const m = modal(`<h3>Заказ готов к отправке?</h3><p>Подтвердите, что заказ упакован и готов к передаче в доставку.</p><div class="acts"><button class="btn out" id="no">Отмена</button><button class="btn pri" id="yes">Подтвердить</button></div>`);
  $("#no", m).onclick = closeModal;
  $("#yes", m).onclick = () => { if (S.failSave) { closeModal(); return toast("Не удалось обновить статус"); } S.adminRetry = false; setSt(30, S.st === 24 ? "Новая попытка доставки (24 → 30)" : "Передан в доставку (25 → 30). Покупатель видит код", "Заказ передан в доставку"); };
}
function cancelDialog() {
  const m = modal(`<h3>Отменить заказ?</h3><p>Укажите причину отмены для покупателя.</p><textarea class="inp" id="why" maxlength="300" placeholder="Например: товар закончился на складе"></textarea><span class="err-t" id="e"></span><div class="acts"><button class="btn out" id="no">Назад</button><button class="btn danfill" id="yes">Отменить заказ</button></div>`);
  $("#no", m).onclick = closeModal;
  $("#yes", m).onclick = () => { const v = $("#why", m).value.trim(); if (v.length < 10) return $("#e", m).textContent = "Введите не менее 10 символов."; setSt(45, "Заказ отменён продавцом: " + esc(v), "Заказ отменён"); };
}
function codeDialog() {
  const locked = S.lockUntil > Date.now();
  const m = modal(`<h3>Введите код покупателя</h3><p class="sub">Покупатель видит код в своём заказе.</p><div class="codebox">${[0, 1, 2, 3].map(i => `<input maxlength="1" inputmode="numeric" data-i="${i}" ${locked ? "disabled" : ""}>`).join("")}</div>
    <div class="err-t" id="e" style="text-align:center">${locked ? "Слишком много попыток. Попробуйте через 15 минут." : ""}</div>
    <p class="small muted" style="text-align:center">Демо: правильный код 4817 · неверных попыток: ${S.tries}</p>
    <div style="text-align:center"><a href="#" id="nocode">Покупатель не может назвать код</a></div>
    <div class="acts"><button class="btn out" id="no">Отмена</button><button class="btn pri" id="yes" ${locked ? "disabled" : ""}>Подтвердить</button></div>`);
  const ins = m.querySelectorAll("[data-i]"); ins.forEach((x, i) => x.oninput = () => { if (x.value && ins[i + 1]) ins[i + 1].focus(); });
  if (ins[0] && !locked) ins[0].focus();
  $("#no", m).onclick = closeModal;
  $("#yes", m).onclick = () => { const c = [...ins].map(x => x.value).join("");
    if (c === "4817") { S.tries = 0; return setSt(35, "Доставлено с кодом (30 → 35)", "Заказ отмечен как доставленный"); }
    S.tries++; if (S.tries >= 5) { S.lockUntil = Date.now() + 15 * 60000; S.tries = 0; codeDialog(); return; }
    $("#e", m).textContent = "Неверный код. Попросите покупателя проверить код в заказе."; ins.forEach(x => x.value = ""); ins[0].focus(); };
  $("#nocode", m).onclick = e => { e.preventDefault(); noCodeDialog(); };
}
function noCodeDialog() {
  const m = modal(`<h3>Покупатель не может назвать код</h3><p>Опишите, как вы передали заказ. Заказ попадёт на проверку поддержки, а покупатель получит уведомление.</p><textarea class="inp" id="why" maxlength="300"></textarea><span class="err-t" id="e"></span><div class="acts"><button class="btn out" id="no">Назад</button><button class="btn pri" id="yes">Отметить доставленным</button></div>`);
  $("#no", m).onclick = codeDialog;
  $("#yes", m).onclick = () => { const v = $("#why", m).value.trim(); if (v.length < 10) return $("#e", m).textContent = "Введите не менее 10 символов."; S.noCode = true; setSt(35, "Доставлено без кода: " + esc(v), "Заказ отмечен как доставленный"); };
}
function failDialog() {
  let pick = "";
  const m = modal(`<h3>Не удалось доставить? Выберите причину.</h3><div class="reasons">${REASONS.map(r => `<label data-r="${r[0]}"><input type="radio" name="r">${r[1]}</label>`).join("")}</div><textarea class="inp mt8" id="why" maxlength="300" placeholder="Комментарий (обязателен для «Другое»)"></textarea><span class="err-t" id="e"></span>
    <div class="acts"><button class="btn out" id="no">Отмена</button><button class="btn pri" id="yes">Сохранить</button></div>`);
  m.querySelectorAll("[data-r]").forEach(l => l.onclick = () => { pick = l.dataset.r; m.querySelectorAll("[data-r]").forEach(x => x.classList.toggle("on", x === l)); });
  $("#no", m).onclick = closeModal;
  $("#yes", m).onclick = () => { if (!pick) return $("#e", m).textContent = "Выберите причину."; const v = $("#why", m).value.trim(); if (pick === "Other" && v.length < 10) return $("#e", m).textContent = "Введите не менее 10 символов.";
    S.reason = pick; S.failCount++; setSt(24, "Доставка не удалась: " + REASONS.find(r => r[0] === pick)[1] + " (30 → 24)", "Статус обновлён. Покупатель получил уведомление"); };
}
const H0 = [["Заказ подтверждён (16 → 25)", "22.10.2026 в 10:12", "Николаев А. Д. · продавец"]];
const H1 = H0.concat([["Передан в доставку (25 → 30). Покупатель видит код", "22.10.2026 в 14:05", "Николаев А. Д. · продавец"]]);
harness({ title: "P-SD3 Seller: seller-delivery order actions", stories: "US-SF-5.4-02 · US-SF-5.4-03 · US-BF-6.4-04", version: "1.0" }, [
  { label: "New paid order", apply: () => reset(), notes: ["16 PaymentSuccessWaitingConfirmation. \"Подтвердить\" moves the order to 25 Processing; status 20 is skipped (US-SF-5.4-02 AC2, ⚑ OQ-SD18).", "\"Доставить до\" shows the deadline set at payment (AC1)."], src: "Seller delivery PRD 5.4, 6" },
  { label: "Processing: ready for delivery", apply: () => reset({ st: 25, hist: H0.slice() }), notes: ["In 25 the seller sees \"Готов к доставке\" and \"Отменить заказ\" (AC4, AC6). The website gets these actions too (DR-SD4)."], src: "PRD SD-S18, SD-S19" },
  { label: "Ready-for-delivery dialog", apply: () => { reset({ st: 25, hist: H0.slice() }); readyDialog(); }, notes: ["Dialog texts from the seller app design. \"Подтвердить\" → 30 Shipped, toast, the buyer gets the code and DLV-01 (AC5)."], src: "Seller app design «Мои заказы»" },
  { label: "Cancel with a reason", apply: () => { reset({ st: 25, hist: H0.slice() }); cancelDialog(); }, notes: ["Cancel in 25 needs a reason of 10–300 characters (AC6, decided OQ-SD11). Try a short reason to see the error."], src: "PRD SD-S19, M-SD44, M-SD55" },
  { label: "Shipped: actions", apply: () => reset({ st: 30, hist: H1.slice() }), notes: ["In 30 the seller sees \"Доставлено\" and \"Не удалось доставить\" and no cancel button (US-SF-5.4-02 AC7, US-SF-5.4-03 AC1)."], src: "ТЗ 3.8 · DR-SD3" },
  { label: "Code dialog: wrong code and lock", apply: () => { reset({ st: 30, hist: H1.slice(), tries: 4 }); codeDialog(); }, notes: ["4 wrong attempts already. One more wrong code locks entry for 15 minutes (US-SF-5.4-03 AC3, AC4). The right demo code is 4817."], src: "PRD SD-S20, M-SD8, M-SD9" },
  { label: "Buyer cannot give the code", apply: () => { reset({ st: 30, hist: H1.slice() }); noCodeDialog(); }, notes: ["The no-code path needs a comment; the order becomes 35 \"without code\", goes to the admin list and the buyer gets SD-N3 (AC5)."], src: "PRD SD-S21" },
  { label: "Status already changed", apply: () => reset({ st: 25, hist: H0.slice(), conflict: true }), notes: ["The buyer cancelled while the page was open. Click any action: nothing changes and the seller sees \"Статус заказа уже изменился\" (US-SF-5.4-02 AC8)."], src: "PRD SD-P8, M-SD23" },
  { label: "Could not deliver", apply: () => { reset({ st: 30, hist: H1.slice() }); failDialog(); }, notes: ["Four reasons; \"Другое\" needs a comment. Result: 24 OnHold, DLV-02 to the buyer, admin problem list (US-SF-5.4-03 AC6)."], src: "PRD SD-S22, M-SD17" },
  { label: "On hold: new attempt", apply: () => reset({ st: 24, reason: "NoAnswer", failCount: 1, hist: H1.concat([["Доставка не удалась: Покупатель не отвечает (30 → 24)", "22.10.2026 в 16:30", "Николаев А. Д. · продавец"]]) }), notes: ["After \"Покупатель не отвечает\" the seller can try again: \"Готов к доставке\" → 30 with the same code (AC7)."], src: "PRD SD-S23" },
  { label: "On hold: support decides", apply: () => reset({ st: 24, reason: "Refused", failCount: 1, hist: H1.slice() }), notes: ["After a refusal (or 3 failures) the seller has no actions until the admin allows a new attempt or cancels (AC8, ⚑ OQ-SD9; US-AF-2.3-02)."], src: "PRD SD-S23, 7" },
  { label: "Overdue order and reminder", apply: () => reset({ st: 30, hist: H1.slice(), overdue: true, notif: true }), notes: ["The deadline passed. At 09:00 the next morning the seller gets SD-N1 and the date turns red with \"Просрочен\" (US-BF-6.4-04 AC1).", "Two days after the deadline the order also goes to the admin problem list (AC4)."], src: "PRD SD-S27, SD-N1" },
  { label: "Seller app: order actions", apply: () => reset({ st: 30, hist: H1.slice(), mobile: true }), notes: ["The seller app has the same actions, dialogs and rules as the website (US-SF-5.4-02 AC13)."], src: "Seller app design «Мои заказы»" },
]);
