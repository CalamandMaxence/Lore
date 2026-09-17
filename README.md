# The Chronicle

An accessible lore wiki, styled like an old parchment manuscript. Plain HTML/CSS/JS — no build step, no framework, no dependencies. Deploys straight to GitHub Pages.

## Structure

```
index.html                     Home page / summary
pages/
  characters/
    index.html                 Category listing
    example-entry.html         Lorem Ipsum demo entry
  locations/
    index.html
    example-entry.html
  events/
    index.html
    example-entry.html
templates/
  page-template.html           Copy this to start a new entry
assets/
  css/
    style.css                  Theme: typography, parchment texture, components
    transitions.css            Page-to-page animations
  js/
    transitions.js             Picks which animation plays, based on navigation
    reveal.js                  Scroll-in fade animation for elements
  img/                         Drop your artwork here
```

Every category (`characters`, `locations`, `events`) is a folder under `pages/`. Add a new category by copying a folder like `pages/locations/` and updating its `index.html` links, then adding a nav link for it in `.site-nav` on every page's header (see "Adding a new category" below).

## Previewing locally

Because the pages link to each other with relative paths and use real browser navigation (not JavaScript routing), you can preview by just opening `index.html` in a browser — but for the page transitions to behave correctly, run it through a local server instead of `file://`:

```bash
cd /home/max/Documents/Lore
python3 -m http.server 8000
# then open http://localhost:8000
```

## Adding a new lore entry

1. Copy `templates/page-template.html` into the right category folder, e.g. `pages/characters/new-character.html`.
2. Fill in the bracketed placeholders. The template's HTML comments explain what each block is (title, tag, body text, quote, image, note, "see also" links).
3. Link to it from that category's `index.html` (add an `.entry-card` entry) and, if it's worth surfacing, from the home page's "Recently Added" grid.
4. Link *to* it from any other page that mentions it, using a normal relative `<a href="...">` — that's the whole wiki-linking mechanism here, no special syntax needed. Use `.see-also` at the bottom of a page to list related entries explicitly.

### Reusable content blocks (defined in `assets/css/style.css`)

| Class | Use for |
|---|---|
| `.lore-text` (wrapping `<p>`) | Body paragraphs — first paragraph automatically gets a decorative drop cap |
| `blockquote.lore-quote` | An in-world quotation, optionally with a `<cite>` for attribution |
| `figure.lore-figure` + `<img>` + `<figcaption>` | A real picture with a caption |
| `.image-placeholder` | A styled stand-in box for artwork you haven't made yet |
| `.note-box` + `.note-label` | A marginal aside, e.g. "Scribe's Note" |
| `hr.ornament` | A decorative section divider |
| `.tag` | A small category pill badge |
| `.see-also` | The "related pages" block at the end of an entry |
| `.entry-grid` / `.entry-card` | A grid of links, for category/listing pages |
| `.reveal` | Add to any block element for a fade-up-on-scroll entrance (used sparingly) |

### Adding images

Drop image files into `assets/img/`, then reference them with a path like `../../assets/img/your-file.jpg` from a page in `pages/<category>/`. Replace a `.image-placeholder` block with:

```html
<figure class="lore-figure">
  <img src="../../assets/img/your-file.jpg" alt="Describe the image" />
  <figcaption>A short caption.</figcaption>
</figure>
```

### Adding a new category

1. Create `pages/<new-category>/index.html`, copied from an existing category index.
2. Add a nav link (`<a href="pages/<new-category>/index.html">...</a>`) to `.site-nav` in **every** page's header, and add it to the "Browse by Category" list on the home page.
3. `assets/js/transitions.js` detects categories automatically from the URL (`/pages/<category>/...`), so a new folder immediately gets correct same-category vs. cross-category transitions with no extra JS changes.

## How the page transitions work

This site uses the browser-native [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) in its cross-document (multi-page) form — no animation library, no SPA routing. Two pieces work together:

- **`assets/css/transitions.css`** opts every navigation in with `@view-transition { navigation: auto; }`, then defines different animations for a few "types" of transition: a quick horizontal slide between pages in the *same* category, and a bigger perspective "page turn" between *different* categories (fitting the parchment theme). It also gives the header its own persistent `view-transition-name` so it stays fixed in place instead of animating with the rest of the page.
- **`assets/js/transitions.js`** listens for the `pageswap` event (fired just before you leave a page) and compares the category of the page you're on to the category of the page you're going to, tagging the transition as `same-category` or `cross-category` (and `back`/`forward` for browser history navigation) so the CSS above knows which animation to play.

**Browser support**: cross-document View Transitions currently work in Chromium-based browsers (Chrome, Edge). In browsers that don't support it yet (Firefox, Safari, as of this writing), navigation just works normally with no animation — this is a progressive enhancement, not a requirement.

If you want to go further with this (it's a good rabbit hole for learning modern CSS/JS): try giving individual elements — like a character portrait that appears on both the category listing and the entry page — their own `view-transition-name` so they visually morph between positions across the navigation, instead of only animating the whole page.

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under "Build and deployment", set **Source** to "Deploy from a branch".
4. Set **Branch** to `main` and the folder to `/ (root)`, then save.
5. Your site will publish at `https://<your-username>.github.io/<repo-name>/`.

Because this is a project site (not a `<username>.github.io` root repo), all links in this project are relative — that's intentional and required for the site to work correctly under that `/repo-name/` subpath. Don't change internal links to start with `/`.
