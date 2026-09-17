// Tags each cross-document view transition with a "type" describing the
// relationship between the page you're leaving and the page you're going to,
// so transitions.css can pick a different animation per case.
//
// Support: Chromium-based browsers only, at the time of writing (the
// `pageswap` event and cross-document View Transitions are not yet in
// Firefox/Safari). Everywhere else this script simply does nothing and
// navigation behaves normally — it's a progressive enhancement layer.
(() => {
  // URLs look like /<lang>/<section>/<subsection>/<file>.html (or
  // /<lang>/library/<file>.html, which has no subsection level). We only
  // need the language and the section to decide which animation to play.
  function localeOf(url) {
    try {
      const path = new URL(url, location.href).pathname;
      const match = path.match(/\/(en|fr)\/([^/]+)\//);
      return match ? { lang: match[1], section: match[2] } : null;
    } catch {
      return null;
    }
  }

  window.addEventListener("pageswap", (event) => {
    const { viewTransition, activation } = event;
    if (!viewTransition || !activation) return;

    const destinationUrl = activation.entry?.url;
    if (!destinationUrl) return;

    const from = localeOf(location.href);
    const to = localeOf(destinationUrl);

    if (from && to) {
      if (from.lang !== to.lang) {
        viewTransition.types.add("language-switch");
      } else {
        viewTransition.types.add(
          from.section === to.section ? "same-category" : "cross-category"
        );
      }
    }

    if (activation.navigationType === "traverse" && activation.entry.index != null) {
      const goingBack = activation.entry.index < navigation.currentEntry.index;
      viewTransition.types.add(goingBack ? "back" : "forward");
    }
  });
})();
