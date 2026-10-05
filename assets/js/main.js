(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Archive banner ---------- */

  const banner = document.getElementById("archive-banner");
  const BANNER_KEY = "bytebeam:banner-dismissed";

  try {
    if (sessionStorage.getItem(BANNER_KEY)) banner.hidden = true;
  } catch {
    /* Storage unavailable: keep the banner visible. */
  }

  document.querySelector("[data-dismiss-banner]")?.addEventListener("click", () => {
    banner.hidden = true;
    try {
      sessionStorage.setItem(BANNER_KEY, "1");
    } catch {
      /* Ignore. */
    }
  });

  /* ---------- Header ---------- */

  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile navigation ---------- */

  const nav = document.getElementById("nav");
  const toggle = document.querySelector("[data-nav-toggle]");

  const setNavOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  toggle.addEventListener("click", () => setNavOpen(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setNavOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setNavOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (nav.classList.contains("is-open") && !header.contains(event.target)) setNavOpen(false);
  });
  window.matchMedia("(min-width: 861px)").addEventListener("change", (event) => {
    if (event.matches) setNavOpen(false);
  });

  /* ---------- Active section in nav ---------- */

  const navLinks = [...document.querySelectorAll(".nav__list a")];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          if (active) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => sectionObserver.observe(section));

  /* ---------- Count-up numbers ---------- */

  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? "";
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ---------- Reveal on scroll ---------- */

  const revealEls = document.querySelectorAll("[data-reveal]");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        entry.target.querySelectorAll("[data-count]").forEach(countUp);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
})();
