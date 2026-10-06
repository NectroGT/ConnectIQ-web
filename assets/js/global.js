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
  /* Flash & activate: any link marked data-flash asks which portal to use */
  const PORTALS = [
    { name: "International", url: "https://usal.connectiq.asia/", host: "usal.connectiq.asia" },
    { name: "China", url: "https://api.huawei.connectiq.asia/", host: "api.huawei.connectiq.asia" },
  ];
  let regionDialog;
  const openRegionChooser = () => {
    if (!regionDialog) {
      regionDialog = document.createElement("dialog");
      regionDialog.setAttribute("aria-labelledby", "region-title");
      regionDialog.innerHTML = `
        <div class="dialog-head">
          <h2 id="region-title">Flash &amp; activate a device</h2>
          <button class="dialog-close" aria-label="Close">×</button>
        </div>
        <div class="dialog-body">
          <p>Choose the portal for your region.</p>
          <div class="region-options">
            ${PORTALS.map(
              (p) => `<a class="region-option" href="${p.url}" target="_blank" rel="noopener">
                <strong>${p.name} <span aria-hidden="true">↗</span></strong><small>${p.host}</small>
              </a>`,
            ).join("")}
          </div>
        </div>`;
      document.body.append(regionDialog);
      regionDialog.querySelector(".dialog-close").addEventListener("click", () => regionDialog.close());
      // Close after a portal is picked, or when clicking the dimmed area outside the box
      regionDialog.addEventListener("click", (e) => {
        if (e.target.closest(".region-option") || e.target === regionDialog) regionDialog.close();
      });
    }
    regionDialog.showModal();
  };
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-flash]")) return;
    e.preventDefault();
    openRegionChooser();
  });
})();
