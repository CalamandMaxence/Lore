---
name: lore-pages
description: Add lore entries, subcategories, or new top-level sections to the Atelesia bilingual (FR/EN) wiki, following its established conventions. Use whenever asked to add/prepare/generate pages for this site, rename entries, or restructure a category.
---

# Adding pages to The World of Atelesia / Le Monde d'Atelesia

Read `README.md` at the repo root first — it's the canonical, evolving reference for the site's architecture (absolute `/Lore/`-rooted links, recursive category nesting, the reusable CSS component classes, the View Transitions system). This skill covers the *workflow* for adding content at scale; it assumes you already know the architecture from the README.

## Core rule: never invent lore content

Body content (paragraphs, quotes, notes, captions) is always Lorem Ipsum or bracketed placeholders — Max writes the real lore himself. The only things safe to pre-fill confidently are structural: breadcrumb, nav highlighting, `<title>`, eyebrow, and a placeholder `<h1>` mechanically derived from the filename/slug.

## Workflow for adding a batch of blank entries

1. **Get the exact list from Max**: category path (e.g. `Sciences > Magie`) and either exact filenames/slugs or names to slugify. If English names are needed too and some aren't obviously invented proper nouns, hold off generating the English side until translations are settled (see below).

2. **Write a Python generator script** to the scratchpad (not the repo) rather than hand-authoring each file. Reuse the structure from prior runs of this pattern — `header_block`, `breadcrumb_block`, `sheet_open`, etc. — each entry needs:
   - Correct breadcrumb chain (one `<a>` per ancestor category) — this is the #1 source of hand-copy typos, so generating it is much safer than editing a copy-pasted template by hand.
   - `aria-current="page"` on the right top-level nav link.
   - `lang-switch` pointing at the *exact* corresponding page in the other language if it exists yet, otherwise the nearest existing category index in that language as a working fallback (never leave a literal `[bracket placeholder]` in a live, unguarded `href` — see below).
   - `.see-also` block **commented out** (`<!-- ... -->`) rather than left with a dead placeholder link, since there's nothing real to cross-link yet. Same for `.lore-quote` and `.note-box` — comment out anything optional that has no real content.
   - `.image-placeholder` figure left visible (it's a styled empty-frame, not a broken link, so it's fine uncommented).

3. **Update every affected category index page** (`.entry-grid` listing, or `.category-list` if you just turned a leaf category into a branch) in both languages, in the same pass — a page that exists but isn't linked from anywhere "doesn't appear" on the site (this bit Max once: a plain static site has no directory listing/auto-discovery).

4. **If mirroring into the other language**, also **upgrade** the just-generated pages' `lang-switch` from a category-index fallback to the exact new counterpart file, and do the same on the *existing* side (the first-generated language's entries were pointing at a fallback until the mirror existed).

5. **Validate before declaring done** — see the two checks below. No headless browser is available in this environment (no chromium-cli/playwright/node); these static checks are the full extent of verification possible here.

6. **Re-run-safety**: if a fix script does a regex substitution meant to correct earlier output, make sure it can't match its *own already-fixed* output (or scope it tightly / make it a no-op on the fixed state) — a naive re-run once double-wrapped an HTML comment into invalid nested comments.

## Translating French names to English

Max's rule: translate only if the French word has real, unambiguous dictionary meaning (e.g. carmine→Carmine, ébène→Ebony, malin→"The Fiend", nain→"Dwarf Kingdom"). If it's invented/stylized with no clear root (e.g. "Lysmoth", "Mundus"), keep it unchanged in English. Apply this directly for obvious cases; batch only the genuinely ambiguous ones into a short question (2-4 fits one `AskUserQuestion` call) rather than asking item-by-item or generating 80+ files on a guess.

## Validation checks (run both after any batch add/edit)

Tag balance (catches unclosed/mismatched tags that plain diffing misses):

```python
import glob
from html.parser import HTMLParser
class Checker(HTMLParser):
    def __init__(self):
        super().__init__(); self.stack=[]; self.void={"meta","link","img","br","hr","input"}
    def handle_starttag(self,t,a):
        if t not in self.void: self.stack.append(t)
    def handle_startendtag(self,t,a): pass
    def handle_endtag(self,t):
        if t in self.void: return
        if not self.stack: print(f"extra </{t}>"); return
        if self.stack[-1]!=t: print(f"mismatch expected </{self.stack[-1]}> got </{t}>")
        else: self.stack.pop()
files = glob.glob("index.html") + glob.glob("en/**/*.html", recursive=True) + glob.glob("fr/**/*.html", recursive=True) + glob.glob("templates/*.html")
bad=False
for f in sorted(files):
    c=Checker(); c.feed(open(f,encoding="utf-8").read())
    if c.stack: print(f"{f}: UNCLOSED {c.stack}"); bad=True
print(f"checked {len(files)} —", "ALL CLEAN" if not bad else "ISSUES")
```

Broken-link check (strips comments first, so intentionally-inert placeholders in templates don't false-positive):

```python
import glob, re, os
files = glob.glob("index.html") + glob.glob("en/**/*.html", recursive=True) + glob.glob("fr/**/*.html", recursive=True)
bad = 0
for f in files:
    text = open(f, encoding="utf-8").read()
    live = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    for m in re.finditer(r'(?:href|src)="(/Lore/[^"]*)"', live):
        rel = m.group(1)[len("/Lore/"):]
        if not rel or not os.path.isfile(rel):
            print(f"BROKEN in {f} -> {m.group(1)}")
            bad += 1
print(f"checked {len(files)} files,", bad, "broken live links")
```

## Adding a brand-new top-level section

More invasive than a subcategory: needs a nav link added to `.site-nav` in **every** page's header, both languages. Prefer batching this with other changes rather than doing it in isolation, since it touches every file.
