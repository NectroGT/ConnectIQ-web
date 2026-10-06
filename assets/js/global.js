/*
 * ConnectIQ global behaviour — shared by index.html and fdm.html.
 * - In-page links scroll to their section without adding #section to the address bar
 *   (also finds sections inside the FDM page's component).
 * - Mobile nav toggle, green scroll-progress bar and the footer year.
 */
(() => {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Look for an id on the page, then inside any web component (e.g. <connectiq-fdm-quality>).
  const findSection = (id) => {
    const direct = document.getElementById(id);
    if (direct) return direct;
    for (const el of document.querySelectorAll("*")) {
      const found = el.shadowRoot && el.shadowRoot.getElementById(id);
      if (found) return found;
    }
    return null;
  };

  /* In-page links */
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = findSection(link.getAttribute("href").slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);

  /* Mobile nav */
  const toggle = document.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      mobileNav.hidden = !mobileNav.hidden;
      toggle.setAttribute("aria-expanded", String(!mobileNav.hidden));
    });
    mobileNav.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        mobileNav.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Scroll progress */
  const bar = document.querySelector(".scroll-progress");
  if (bar) {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("load", onScroll);
    onScroll();
  }

  /* Footer year */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
