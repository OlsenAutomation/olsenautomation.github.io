(() => {
  "use strict";

  const script = document.currentScript;
  if (!script || window.top !== window.self || navigator.webdriver) return;
  if (location.protocol !== "https:") return;

  const params = new URLSearchParams(location.search);
  if (params.get("no-ping") === "1") return;

  const pageId = (script.dataset.pageId || location.pathname).slice(0, 80);
  const pageLabel = (script.dataset.pageLabel || document.title || pageId).slice(0, 120);
  const topic = "oa-73a41ff2ffb6231a6bff23f91ad90d11a8a8113d622289bb";
  const testMode = params.get("ping-test") === "1";
  const reference = (params.get("ref") || params.get("k") || "direct-link")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 64) || "direct-link";

  const storage = {
    get(area, key) {
      try { return area.getItem(key); } catch (_) { return null; }
    },
    set(area, key, value) {
      try { area.setItem(key, value); } catch (_) {}
    }
  };

  const now = Date.now();
  const viewKey = `oa-application-view:${pageId}:${reference}`;
  const lastView = Number(storage.get(localStorage, viewKey) || 0);
  const viewCooldownMs = testMode ? 0 : 30 * 60 * 1000;
  let viewSent = !testMode && now - lastView < viewCooldownMs;
  let visibleSeconds = 0;
  let maxScrollPercent = 0;

  const device = window.matchMedia("(pointer: coarse)").matches || innerWidth < 800
    ? "mobile"
    : "desktop";

  function updateScrollDepth() {
    const root = document.documentElement;
    const scrollable = Math.max(1, root.scrollHeight - innerHeight);
    maxScrollPercent = Math.max(
      maxScrollPercent,
      Math.min(100, Math.round((scrollY / scrollable) * 100))
    );
  }

  function publish(eventLabel, priority = "default", tags = "briefcase,eyes") {
    const title = testMode
      ? `Application page ping test — ${pageLabel}`
      : `${eventLabel} — ${pageLabel}`;

    const message = [
      `Page: ${pageLabel}`,
      `Event: ${eventLabel}`,
      `Reference: ${reference}`,
      `Visible: ${visibleSeconds}s`,
      `Scroll depth: ${maxScrollPercent}%`,
      `Device: ${device}`,
      `Path: ${location.pathname}`
    ].join("\n");

    const endpoint =
      `https://ntfy.sh/${topic}` +
      `?title=${encodeURIComponent(title)}` +
      `&priority=${encodeURIComponent(priority)}` +
      `&tags=${encodeURIComponent(tags)}`;

    const payload = new Blob([message], { type: "text/plain;charset=UTF-8" });

    try {
      if (navigator.sendBeacon && navigator.sendBeacon(endpoint, payload)) return;
    } catch (_) {}

    try {
      fetch(endpoint, {
        method: "POST",
        body: message,
        mode: "no-cors",
        keepalive: true,
        headers: { "Content-Type": "text/plain;charset=UTF-8" }
      }).catch(() => {});
    } catch (_) {}
  }

  function sendConfirmedView() {
    if (viewSent) return;
    viewSent = true;
    storage.set(localStorage, viewKey, String(Date.now()));
    storage.set(sessionStorage, viewKey, "sent");
    publish(testMode ? "Owner test" : "Likely human view");
  }

  function onResumeClick(event) {
    const link = event.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    const text = (link.textContent || "").toLowerCase();
    const isResume = /\.pdf(?:$|[?#])/i.test(href) || text.includes("résumé") || text.includes("resume");
    if (!isResume) return;

    const clickKey = `${viewKey}:resume-click`;
    if (storage.get(sessionStorage, clickKey) === "sent") return;
    storage.set(sessionStorage, clickKey, "sent");
    publish("Résumé opened", "high", "briefcase,page_facing_up");
  }

  function start() {
    updateScrollDepth();
    addEventListener("scroll", updateScrollDepth, { passive: true });
    document.addEventListener("click", onResumeClick, true);

    const threshold = testMode ? 2 : 8;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") visibleSeconds += 1;
      if (visibleSeconds >= threshold) {
        clearInterval(timer);
        sendConfirmedView();
      }
    }, 1000);
  }

  if (document.prerendering) {
    document.addEventListener("prerenderingchange", start, { once: true });
  } else {
    start();
  }
})();
