# ADHYAN.EXE — personal NFC website

A responsive, retro-internet-inspired personal landing page built with plain HTML, CSS, and JavaScript. No build step or framework required.

## Preview locally
Open `index.html` in a browser. For best results, use a local server (for example, VS Code Live Server).

## Personalise before publishing
1. Open `config.js` (everything personal is in there).
2. Replace the placeholder social URLs with your real profile URLs. Add or remove lines to add or remove cards.
3. Open `config.js`: change your name, email, phone, and socials in one place.
4. Edit any copy in `index.html` that doesn't sound like you.
5. Set `showEditNotes: false` in `config.js` to hide the little setup notes.
6. Test the Save Contact button and every link on a phone.

## Publish
This is a static site. You can host it on GitHub Pages, Cloudflare Pages, Netlify, or another static host. Upload the contents of this folder (not the ZIP itself) to your chosen host, then write the final HTTPS URL to your NFC tag.

## Notes
- Mobile-first responsive layout with a fixed mobile navigation dock.
- CSS-only retro computer illustration; no heavy animation or 3D library.
- Reduced-motion preferences are respected.
- Sound is never autoplayed. The toggle enables tiny UI blips (WebAudio, no files); the jukebox only starts when pressed.
- External Google Fonts are optional. System fallbacks are included.
- The current social links and email are placeholders. Update them before sharing the site publicly.

## Mascot cat
The cat now lives at the end of the page: she pops out of the bottom edge of the contact section and says bye (button `#exitCat`). Sprites: `assets/cat-body.png`, `assets/cat-tail.png`. At night mode she sleeps.

## v2 extras
- Click the pixel sun: night mode, the cat falls asleep.
- Save contact uses `PROFILE` in `config.js` (phone is a placeholder `0000`, replace it).
- Tiny jukebox in the status section (generated live), draggable interests window (double-click its title bar to reset), scroll progress bar, ticker strip, 88x31 badges, copy-email button, per-device visit counter.
