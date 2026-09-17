# The Chronicle / La Chronique

A bilingual (English/French) lore wiki, styled like an old parchment manuscript. Plain HTML/CSS/JS — no build step, no framework, no dependencies. Deploys straight to GitHub Pages at `github.io/Lore/`.

## How the site is organized

```
index.html          Language chooser (root)
en/                  English tree
  index.html         English home
  spirituality/
    index.html       Section index (lists its subsections)
    deities/
      index.html     Subsection index (lists entries, or subsections of its own)
      your-entry.html
    ...
  sciences/
  geopolitics-and-history/
  geography/
  library/           Flat section, no subsections — entries live directly inside
fr/                  French tree — same shape, French slugs (see below)
  index.html
  spiritualite/
    dieux/
    ...
templates/
  page-template.html       Copy this for a new English entry
  modele-de-page.html      Copy this for a new French entry
assets/
  css/style.css            Theme: typography, parchment texture, components
  css/transitions.css      Page-to-page animations
  js/transitions.js        Picks which animation plays, based on navigation
  js/reveal.js             Scroll-in fade animation for elements
  img/                     Drop your artwork here
```

**Categories nest to any depth.** A "subsection" isn't a fixed level — `en/spirituality/deities/` can itself contain further category folders (e.g. `en/spirituality/deities/pantheon-a/`, further split by religion) before you finally add entry pages. Every category folder is just an `index.html` that either lists its child categories or, once it has no more children, lists entries. Nest as deep as your lore actually needs.

## Important: every internal link is rooted at `/Lore/`

Every `href`/`src` in this site starts with `/Lore/` (e.g. `/Lore/assets/css/style.css`, `/Lore/en/sciences/magic/index.html`) instead of a relative path. This means:

- **You never count `../`.** Copy `templates/page-template.html` into a folder 6 levels deep and every link on it still works, unedited (aside from the breadcrumb, which you fill in to match — see below).
- **This only works because the repo is named `Lore`**, published as a GitHub Pages *project* site at `<username>.github.io/Lore/`. If you ever rename the repository, every internal link breaks at once — fix it with:
  ```bash
  grep -rl '"/Lore/' --include="*.html" . | xargs sed -i 's#/Lore/#/NewName/#g'
  ```
  (and update `BASE` in the generator script if you keep it, and the templates' comments).
- If you later move to a custom domain (so the site is served at the domain root instead of a `/Lore/` subpath), the same find-and-replace removes the prefix entirely (`s#/Lore/#/#g`).

## Previewing locally

Because paths are rooted at `/Lore/`, serve from the **parent** of this folder so that prefix resolves correctly:

```bash
cd /home/max/Documents   # the parent of Lore/
python3 -m http.server 8000
# then open http://localhost:8000/Lore/
```

## Adding a new lore entry

1. Copy `templates/page-template.html` (English) or `templates/modele-de-page.html` (French) into the right category folder, at whatever depth it belongs — e.g. `en/spirituality/deities/some-god.html`.
2. Fill in the bracketed placeholders. The template's comments explain each block. The only depth-sensitive part is the **breadcrumb**: add one `<a>` per ancestor category, in order.
3. Link to it from its category's `index.html` (add an `.entry-card`) — or, if the category currently shows the "no entries yet" empty state, replace that block with an `.entry-grid` containing your new card.
4. Link *to* it from any other page that mentions it, using a normal `/Lore/`-rooted `<a href="...">`. That's the whole wiki-linking mechanism — no special syntax. Use `.see-also` at the bottom of a page for an explicit "related pages" list.
5. Once the matching page exists in the other language, update both pages' `.lang-switch` link to point at each other.

### Adding a new subcategory (at any depth)

1. Create the folder and an `index.html` inside it, copied from a sibling category's index page.
2. Add a `<li><a>` entry for it in the parent category's `.category-list`.
3. Update the breadcrumb and `.eyebrow` on the new index page to include the new ancestor.
4. If it's a brand-new **top-level section** (not just a subsection), also add its nav link to `.site-nav` in **every** page's header (both languages) — `assets/js/transitions.js` picks up new top-level sections automatically for the transition system, no JS changes needed.

### Reusable content blocks (defined in `assets/css/style.css`)

| Class | Use for |
|---|---|
| `.breadcrumb` | The Home › Section › ... trail at the top of a page |
| `.lore-text` (wrapping `<p>`) | Body paragraphs — first paragraph automatically gets a decorative drop cap |
| `blockquote.lore-quote` | An in-world quotation, optionally with a `<cite>` for attribution |
| `figure.lore-figure` + `<img>` + `<figcaption>` | A real picture with a caption |
| `.image-placeholder` | A styled stand-in box for artwork you haven't made yet |
| `.note-box` + `.note-label` | A marginal aside, e.g. "Scribe's Note" |
| `.empty-state` | The "nothing here yet" message on a category with no entries |
| `hr.ornament` | A decorative section divider |
| `.tag` | A small category pill badge |
| `.see-also` | The "related pages" block at the end of an entry |
| `.category-list` | A grid of links to subcategories, for a category index page |
| `.entry-grid` / `.entry-card` | A grid of links to entries, for a leaf category page |
| `.lang-switch` | The EN/FR pill in the header |
| `.reveal` | Add to any block element for a fade-up-on-scroll entrance (used sparingly) |

### Adding images

Drop image files into `assets/img/`, then reference them with `/Lore/assets/img/your-file.jpg` from anywhere on the site. Replace an `.image-placeholder` block with:

```html
<figure class="lore-figure">
  <img src="/Lore/assets/img/your-file.jpg" alt="Describe the image" />
  <figcaption>A short caption.</figcaption>
</figure>
```

## How the page transitions work

This site uses the browser-native [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) in its cross-document (multi-page) form — no animation library, no SPA routing. Two pieces work together:

- **`assets/css/transitions.css`** opts every navigation in with `@view-transition { navigation: auto; }`, then defines three different animations depending on where you're navigating to:
  - **same top-level section** (e.g. within Sciences) → a quick horizontal **slide**
  - **different top-level section** (e.g. Sciences → Geography) → a bigger perspective **page turn**
  - **switching language** (`/en/` ↔ `/fr/`) → a soft **ink-dissolve** (blur + fade)

  It also gives the header its own persistent `view-transition-name`, so it stays fixed in place while `<main>` animates.
- **`assets/js/transitions.js`** listens for the `pageswap` event and compares the language and top-level section of the page you're leaving vs. the one you're entering, tagging the transition with the right type for the CSS above.

**Browser support**: cross-document View Transitions currently work in Chromium-based browsers (Chrome, Edge). Elsewhere navigation just works normally with no animation — pure progressive enhancement.

## Deploying to GitHub Pages

1. Push this repository to GitHub (repo must stay named `Lore` for the `/Lore/`-rooted links to resolve — see above).
2. In the repo, go to **Settings → Pages**.
3. Under "Build and deployment", set **Source** to "Deploy from a branch".
4. Set **Branch** to `main` and the folder to `/ (root)`, then save.
5. Your site publishes at `https://<your-username>.github.io/Lore/`.
