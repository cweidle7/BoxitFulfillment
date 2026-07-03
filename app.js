/* ===================================================================
   Box It Fulfillment — shared JS
   Handles: quote modal, International dropdown (touch), duty calculators
   =================================================================== */
(function () {
  "use strict";

  /* ---------- Quote modal ---------- */
  var modal = document.getElementById("quoteModal");
  function openQuote() {
    if (!modal) return;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeQuote() {
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-open-quote]").forEach(function (b) {
    b.addEventListener("click", openQuote);
  });
  document.querySelectorAll("[data-close-quote]").forEach(function (b) {
    b.addEventListener("click", closeQuote);
  });
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeQuote();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeQuote();
  });

  /* ---------- International dropdown (hover via CSS; click for touch) ---------- */
  var dd = document.getElementById("intlDropdown");
  if (dd) {
    var btn = dd.querySelector("button");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      dd.classList.toggle("open");
    });
    document.addEventListener("click", function () {
      dd.classList.remove("open");
    });
  }

  /* ---------- Duty & tax calculators ----------
     A calculator is any element with [data-calc] where the value is the
     country code: "ca", "uk", or "eu". Markup contract (see the pages):
       [data-calc="ca"]
         input[type=range][data-calc-range]
         [data-calc-value]        -> shows formatted order value
         [data-calc-duty]         -> customs duty output
         [data-calc-tax]          -> VAT / GST output
         [data-calc-total]        -> landed cost output
         (CA only) button[data-usmca="yes"|"no"]  -> qualifies toggle
  --------------------------------------------------------------------- */
  var RULES = {
    ca: { sym: "$",  vat: 0.12, vatFree: 40,  dutyFree: 150, duty: 0.065 },
    uk: { sym: "\u00a3", vat: 0.20, vatFree: 0, dutyFree: 135, duty: 0.04 },
    eu: { sym: "\u20ac", vat: 0.21, vatFree: 0, dutyFree: 150, duty: 0.04 }
  };

  function money(sym, n) {
    return sym + Math.round(n).toLocaleString();
  }

  function wire(calc) {
    var code = calc.getAttribute("data-calc");
    var rule = RULES[code];
    if (!rule) return;

    var range = calc.querySelector("[data-calc-range]");
    var valEl = calc.querySelector("[data-calc-value]");
    var dutyEl = calc.querySelector("[data-calc-duty]");
    var taxEl = calc.querySelector("[data-calc-tax]");
    var totalEl = calc.querySelector("[data-calc-total]");
    var usmcaYes = calc.querySelector('[data-usmca="yes"]');
    var usmcaNo = calc.querySelector('[data-usmca="no"]');
    var state = { qualifies: true };

    function recalc() {
      var v = Number(range.value) || 0;
      var duty = 0;
      if (code === "ca") {
        duty = state.qualifies ? 0 : (v > rule.dutyFree ? v * rule.duty : 0);
      } else {
        duty = v > rule.dutyFree ? v * rule.duty : 0;
      }
      var tax = v > rule.vatFree ? v * rule.vat : 0;
      if (valEl) valEl.textContent = money(rule.sym, v);
      if (dutyEl) dutyEl.textContent = money(rule.sym, duty);
      if (taxEl) taxEl.textContent = money(rule.sym, tax);
      if (totalEl) totalEl.textContent = money(rule.sym, v + duty + tax);
    }

    if (range) range.addEventListener("input", recalc);
    if (usmcaYes && usmcaNo) {
      usmcaYes.addEventListener("click", function () {
        state.qualifies = true;
        usmcaYes.classList.add("on");
        usmcaNo.classList.remove("on");
        recalc();
      });
      usmcaNo.addEventListener("click", function () {
        state.qualifies = false;
        usmcaNo.classList.add("on");
        usmcaYes.classList.remove("on");
        recalc();
      });
    }
    recalc();
  }

  document.querySelectorAll("[data-calc]").forEach(wire);

  /* ---------- Scroll reveal ---------- */
  var revealGroups = document.querySelectorAll(".cards3, .cards4, .steps, .stats, .keystats, .faq-list");
  revealGroups.forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      if (child.classList.contains("reveal")) {
        child.style.transitionDelay = Math.min(i * 70, 280) + "ms";
      }
    });
  });

  var revealEls = document.querySelectorAll(".reveal");
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Light parallax on wave dividers ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var parallaxEls = document.querySelectorAll("[data-parallax]");
  if (parallaxEls.length && !reduceMotion) {
    var ticking = false;
    function updateParallax() {
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var factor = parseFloat(el.getAttribute("data-parallax")) || 0;
        var offset = Math.max(-16, Math.min(16, (center - vh / 2) * factor));
        el.style.transform = "translateY(" + offset.toFixed(1) + "px)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }
})();
