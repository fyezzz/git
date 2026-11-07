# CodeOpsAcq website (static, GoDaddy-ready)

Plain HTML/CSS/JS. No build step. Three.js (3D core, particles, bloom), GSAP ScrollTrigger (cinematic scroll scenes, pinned rail), Lenis (smooth scroll), all loaded from CDNs.

Files: `index.html`, `styles.css`, `main.js`, `config.js`.

## Put it on GoDaddy

**cPanel / Web Hosting**
1. GoDaddy → My Products → Web Hosting → Manage → cPanel Admin → File Manager.
2. Open `public_html` (delete GoDaddy's placeholder `index.html` if there is one).
3. Upload `codeopsacq-site.zip` and click Extract. `index.html` must sit directly in `public_html`.
4. Visit your domain. Hard-refresh (Ctrl/Cmd+Shift+R) if you see the old page.

**GoDaddy Website Builder** can't host custom code like this. Use Web Hosting, or point the domain's DNS at any static host (Netlify, Vercel, Cloudflare Pages).

## Make the form deliver
Edit `config.js`:
- `formEndpoint`: paste a Formspree (or similar) endpoint to receive submissions by email. Leave empty and the form opens the visitor's email app instead.
- `contactEmail`: your real address (currently a placeholder: `hello@codeopsacq.com`).

## Notes
- Respects "reduce motion": animations and the 3D intro are skipped.
- Pricing and terms mirror the CodeOpsAcq offer: Starter $99/mo, Growth $299/mo, Scale Flagship $999/mo + rev share (application only). No lead, booking or revenue guarantees are claimed.
