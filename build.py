SRC = "/home/claude/sd-proto/src/"
css = open(SRC + "base.css").read() + open(SRC + "sd.css").read()
harness = open(SRC + "harness.js").read()
FOOT = '<p style="text-align:center;color:#8b9189;font-size:11.5px;margin:18px 0 28px">Optom.uz · clickable prototype for the seller-delivery user stories (epic US-BF-6.4) · requirements: Seller delivery PRD · example data only. Where a prototype differs from the acceptance criteria in Confluence, the acceptance criteria win.</p>'
PAGES = [("p-sd1-seller-settings.html", "P-SD1 Seller: delivery settings", "p1.js"), ("p-sd2-buyer.html", "P-SD2 Buyer: filter, checkout, order", "p2.js"),
         ("p-sd3-seller-order.html", "P-SD3 Seller: order actions", "p3.js"), ("p-sd4-admin.html", "P-SD4 Admin: seller delivery", "p4.js")]
for fn, title, js in PAGES:
    open("/home/claude/sd-proto/" + fn, "w").write(f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>{css}</style></head><body>
<div id="app"></div>{FOOT}
<script>{harness}
{open(SRC + js).read()}
</script></body></html>''')
open("/home/claude/sd-proto/index.html", "w").write('''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Optom.uz seller delivery prototypes</title>
<style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:40px auto;padding:0 16px;color:#1b1c1f}a{color:#00a028}li{margin:8px 0}small{color:#667}</style></head><body>
<h1>Optom.uz · Seller delivery prototypes v1.1</h1><p>Clickable prototypes for the seller-delivery user stories (epic US-BF-6.4) and the delivery time filter. Screens in Russian, notes in English. Pick a state in the <b>Scenario</b> list at the top, or open a scenario with <code>?s=N</code> (N starts at 0).</p>
<ul><li><a href="p-sd1-seller-settings.html">P-SD1 Seller: seller-delivery settings and product flag</a> <small>US-SF-5.5-01, US-SF-5.4-01 · 8 scenarios</small></li>
<li><a href="p-sd2-buyer.html">P-SD2 Buyer: delivery time filter, checkout card, order page</a> <small>US-BF-2.11-01, US-BF-6.4-01 – 03 · 14 scenarios</small></li>
<li><a href="p-sd3-seller-order.html">P-SD3 Seller: order actions on the website and in the app</a> <small>US-SF-5.4-02, US-SF-5.4-03, US-BF-6.4-04 · 13 scenarios</small></li>
<li><a href="p-sd4-admin.html">P-SD4 Admin: orders, seller settings, problem list</a> <small>US-AF-2.3-01, US-AF-2.3-02 · 5 scenarios</small></li></ul>
<p><small>Example data only. The acceptance criteria in Confluence are the source of truth.</small></p></body></html>''')
open("/home/claude/sd-proto/README.md", "w").write("# Optom.uz seller delivery prototypes\n\nClickable HTML prototypes P-SD1 – P-SD4 for the seller-delivery user stories (epic US-BF-6.4) and the delivery time filter (US-BF-2.11-01), published with GitHub Pages and embedded in the Confluence user story pages.\n\nRequirements: Seller delivery PRD. Source of truth: the Confluence story pages. Example data only, no real customer data.\n\nBuilt from `src/` with `build.py`.\n")
open("/home/claude/sd-proto/robots.txt", "w").write("User-agent: *\nDisallow: /\n")
open("/home/claude/sd-proto/.nojekyll", "w").write("")
print("built")
