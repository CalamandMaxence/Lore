// Tags each cross-document view transition with a "type" describing the
// relationship between the page you're leaving and the page you're going to,
// so transitions.css can pick a different animation per case.
//
// Support: Chromium-based browsers only, at the time of writing (the
// `pageswap` event and cross-document View Transitions are not yet in
// Firefox/Safari). Everywhere else this script simply does nothing and
// navigation behaves normally — it's a progressive enhancement layer.
(() => {
  // A page's "category" is the first folder under /pages/, e.g.
  // /pages/characters/elaris.html -> "characters". The home page and any
  // top-level page count as "home".
  function categoryOf(url) {
    try {
      const path = new URL(url, location.href).pathname;
      const match = path.match(/\/pages\/([^/]+)\//);
      return match ? match[1] : "home";
    } catch {
      return "home";
    }
  }

  window.addEventListener("pageswap", (event) => {
    const { viewTransition, activation } = event;
    if (!viewTransition || !activation) return;

    const destinationUrl = activation.entry?.url;
    if (!destinationUrl) return;

    const fromCategory = categoryOf(location.href);
    const toCategory = categoryOf(destinationUrl);

    viewTransition.types.add(
      fromCategory === toCategory ? "same-category" : "cross-category"
    );

    if (activation.navigationType === "traverse" && activation.entry.index != null) {
      const goingBack = activation.entry.index < navigation.currentEntry.index;
      viewTransition.types.add(goingBack ? "back" : "forward");
    }
  });
})();
