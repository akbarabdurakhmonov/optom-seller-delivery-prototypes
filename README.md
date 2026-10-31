# Optom.uz seller delivery prototypes

Clickable HTML prototypes P-SD1 – P-SD4 for the seller-delivery user stories (epic US-BF-6.4) and the delivery time filter (US-BF-2.11-01), published with GitHub Pages and embedded in the Confluence user story pages.

Requirements: Seller delivery PRD. Source of truth: the Confluence story pages. Example data only, no real customer data.

Built from `src/` with `build.py`; `check.py` opens every scenario in Chromium and fails on script errors or removed v1.4 texts.

## Versions

- **v1.5, 01.11.2026** — Seller delivery PRD v1.5. P-SD1: one threshold «Бесплатно, если сумма заказа от» (order total of one branch, before promo codes); the MOQ field is removed; live count «Отмечено товаров». P-SD2: checkout card active with M-SD60 when some lines do not qualify, section «Не входят в этот заказ — останутся в корзине», inactive with M-SD3 or M-SD59, «Нет в наличии» section; no delivery code; in 35 «Я получил заказ», «Сообщить о проблеме» and auto-completion on day 7; filter without MOQ, threshold sellers count. P-SD3: «Доставлено» opens the confirmation M-SD62 / M-SD63, no code dialog. P-SD4: 4 problem reasons, basis per line and the compared order total. Removed scenarios were replaced in place, new ones appended, so existing `?s=N` links keep their index.
- v1.1, 26.10.2026 — buyer's city of the City and catalogue filters PRD, Fargo 1–3 / 3–5 days.
- v1.0 — first version.
