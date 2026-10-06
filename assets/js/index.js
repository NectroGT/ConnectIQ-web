/* Homepage (index.html) behaviour: platform tabs, reader price calculator, contact dialog.
 * Shared behaviour (nav, scroll bar, in-page links) lives in global.js. */

(() => {
  const $ = (s) => document.querySelector(s),
    $$ = (s) => [...document.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Platform tabs: Platform shows the stack; Tracking / Quality show the workflow view with that card in focus */
  const appTabs = $$("[data-app]");
  const showApp = (tab, focus) => {
    const name = tab.dataset.app;
    appTabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    $("#panel-platform").hidden = name !== "platform";
    $("#panel-workflow").hidden = name === "platform";
    $("#panel-workflow").setAttribute("aria-labelledby", tab.id);
    $$(".wf-card").forEach((c) => c.classList.toggle("focus", c.classList.contains(name)));
    if (focus) tab.focus();
  };
  appTabs.forEach((tab, i) => {
    tab.addEventListener("click", () => showApp(tab));
    tab.addEventListener("keydown", (e) => {
      const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (step) {
        e.preventDefault();
        showApp(appTabs[(i + step + appTabs.length) % appTabs.length], true);
      }
    });
  });
  const layerRows = $$(".ciqm-row");
  layerRows.forEach((row) =>
    row.addEventListener("toggle", () => {
      if (row.open)
        layerRows.forEach((o) => {
          if (o !== row) o.open = false;
        });
    }),
  );

  /* Reader pricing calculator: totals are interpolated between anchor points (SGD cents). */
  const anchors = [
    [1, 5000],
    [5, 15000],
    [10, 22000],
    [25, 40000],
    [50, 60000],
    [100, 80000],
  ];
  const money = (cents, digits = 0) =>
    "S$" +
    (cents / 100).toLocaleString("en-SG", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  const totalFor = (n) => {
    let lo = anchors[0],
      hi = anchors[anchors.length - 1];
    for (const a of anchors) {
      if (a[0] <= n) lo = a;
      if (a[0] >= n) {
        hi = a;
        break;
      }
    }
    return lo[0] === hi[0] ? lo[1] : Math.round(lo[1] + ((hi[1] - lo[1]) * (n - lo[0])) / (hi[0] - lo[0]));
  };
  const number = $("#reader-number"),
    presets = $(".presets");
  presets.innerHTML = [5, 10, 50, 100]
    .map((n) => `<button type="button" data-preset="${n}" aria-pressed="false">${n}</button>`)
    .join("");
  const setReaders = (n) => {
    n = Math.min(100, Math.max(1, Math.round(Number(n) || 1)));
    const total = totalFor(n),
      rate = total / n,
      word = n === 1 ? "reader" : "readers";
    number.value = n;
    $("#count-label").textContent = n;
    $("#count-word").textContent = word;
    $("#price-rate").textContent = money(rate, Number.isInteger(rate / 100) ? 0 : 2);
    $("#price-total").textContent = money(total, total % 100 ? 2 : 0);
    $("#price-unit").textContent = `per month for ${n} ${word}`;
    $("#cta-count").textContent = `${n} ${word}`;
    $$("[data-step]").forEach(
      (b) => (b.disabled = (b.dataset.step === "-1" && n === 1) || (b.dataset.step === "1" && n === 100)),
    );
    $$("[data-preset]").forEach((b) =>
      b.setAttribute("aria-pressed", String(Number(b.dataset.preset) === n)),
    );
  };
  number.addEventListener("change", () => setReaders(number.value));
  $$("[data-step]").forEach((b) =>
    b.addEventListener("click", () => setReaders(Number(number.value) + Number(b.dataset.step))),
  );
  presets.addEventListener("click", (e) => {
    const b = e.target.closest("[data-preset]");
    if (b) setReaders(b.dataset.preset);
  });
  setReaders(1);

  /* Contact dialog: validates locally only. No backend is connected, so nothing is sent. */
  const dialog = $("#contact-dialog"),
    body = $("#contact-body");
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-enquiry]");
    if (trigger) {
      body.innerHTML = `<p>Tell us where you want to start. Your first use case can be practical; the memory builds from there.</p>
  <form id="contact-form" novalidate>
    <div class="field"><label for="c-name">Name</label><input id="c-name" name="name" required maxlength="100" autocomplete="name"></div>
    <div class="field"><label for="c-company">Company</label><input id="c-company" name="company" required maxlength="150" autocomplete="organization"></div>
    <div class="field"><label for="c-email">Work email</label><input id="c-email" name="email" type="email" required maxlength="254" autocomplete="email"></div>
    <div class="field"><label for="c-interest">Interested in</label><input id="c-interest" name="interest" value="${esc(trigger.dataset.enquiry)}" maxlength="120"></div>
    <div class="field"><label for="c-msg">Your use case</label><textarea id="c-msg" name="message" maxlength="2000" placeholder="For example: tracking work through machining and inspection."></textarea></div>
    <p class="form-note">Preview form: your details are checked here but not sent anywhere yet.</p>
    <p class="form-error" role="alert"></p>
    <button type="submit" class="button ink small">Check enquiry <span>↗</span></button>
  </form>`;
      dialog.showModal();
      return;
    }
    if (e.target.closest("[data-close]")) dialog.close();
  });
  dialog.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target,
      err = f.querySelector(".form-error");
    if (!f.name.value.trim() || !f.company.value.trim()) {
      err.textContent = "Enter your name and company.";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value)) {
      err.textContent = "Enter a valid work email address.";
      return;
    }
    body.innerHTML =
      '<p>Your enquiry looks complete. This preview isn’t connected to an inbox yet, so nothing was sent.</p><button class="button ink small" data-close>Close</button>';
  });
})();
