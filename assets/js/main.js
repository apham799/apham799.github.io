/* Alan Pham — Portfolio interactions. No dependencies. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- theme toggle (default: dark, persisted) ---------- */
  var toggle = document.querySelector(".theme-toggle");
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var next = theme === "dark" ? "light" : "dark";
    if (toggle) {
      toggle.setAttribute("aria-label", "Switch to " + next + " theme");
      toggle.setAttribute("title", "Switch to " + next + " theme");
    }
    if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#0e0f11" : "#f3f5f8");
  }
  applyTheme(root.getAttribute("data-theme") || "dark");

  if (toggle) {
    toggle.addEventListener("click", function () {
      var theme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(theme);
      try { localStorage.setItem("theme", theme); } catch (e) {}
    });
  }

  /* ---------- ?todo mode: outline everything still marked for revision ---------- */
  if (/[?&]todo\b/.test(location.search)) {
    root.classList.add("show-todos");
    var n = document.querySelectorAll("[data-todo]").length;
    console.info("[portfolio] " + n + " items marked TODO are highlighted.");
  }

  /* ---------- Chicago clock ---------- */
  var clock = document.querySelector(".clock");
  if (clock && window.Intl) {
    var fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago", hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short"
    });
    var tick = function () { clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 15000);
  }

  /* ---------- split project titles into letters ---------- */
  document.querySelectorAll(".project__title").forEach(function (h) {
    var title = h.querySelector("a") || h;      // split inside the link if the title is linked
    var text = title.textContent.trim();
    title.setAttribute("aria-label", text);
    title.textContent = "";
    Array.from(text).forEach(function (char, i) {
      var span = document.createElement("span");
      span.setAttribute("aria-hidden", "true");
      if (char === " ") {
        span.className = "sp";
      } else {
        span.className = "ch";
        span.textContent = char;
        span.style.setProperty("--i", i);
        span.style.setProperty("--r", Math.random().toFixed(3));
        span.style.setProperty("--dx", ((Math.random() - 0.5) * 1.6).toFixed(2) + "em");
        span.style.setProperty("--dy", ((Math.random() - 0.5) * 1.2).toFixed(2) + "em");
        span.style.setProperty("--rot", Math.round((Math.random() - 0.5) * 70) + "deg");
      }
      title.appendChild(span);
    });
  });

  // Splitting letters into separate boxes loses the font's kerning (pair spacing). Measure each pair as real
  // text inside the title (same font, size, optical size) and restore it as a margin on the first letter.
  function kernTitles() {
    document.querySelectorAll(".project__title").forEach(function (h) {
      var title = h.querySelector("a") || h;
      var spans = Array.prototype.slice.call(title.children);
      var text = title.getAttribute("aria-label") || "";
      if (spans.length !== text.length) return;
      var fs = parseFloat(getComputedStyle(h).fontSize);
      var probe = document.createElement("span");
      probe.setAttribute("aria-hidden", "true");
      probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre;left:0;top:0;";
      h.appendChild(probe);
      var w = function (str) { probe.textContent = str; return probe.getBoundingClientRect().width; };
      var chars = Array.from(text);
      chars.forEach(function (c, i) {
        var span = spans[i];
        if (c === " ") span.style.width = (w(" ") / fs).toFixed(4) + "em";
        if (i < chars.length - 1) {
          var d = w(c + chars[i + 1]) - w(c) - w(chars[i + 1]);
          span.style.marginRight = Math.abs(d) > 0.05 ? (d / fs).toFixed(4) + "em" : "";
        }
      });
      probe.remove();
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(kernTitles); else kernTitles();

  /* ---------- hero keywords: cursor-driven micro-typography ----------
     sense: letters darken as the cursor approaches (like a shadow over a sensor)
     move:  letters are pushed away from the cursor, then spring back
     shape: letters squash and widen near the cursor (like pressing clay)
     Each letter = outer .fx-ch (measured, never transformed) + inner .fx-in (styled). */
  var fxChars = [];
  document.querySelectorAll("[data-fx]").forEach(function (el) {
    var kind = el.getAttribute("data-fx");
    var text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    Array.from(text).forEach(function (char) {
      var outer = document.createElement("span");
      outer.className = "fx-ch";
      outer.setAttribute("aria-hidden", "true");
      var inner = document.createElement("span");
      inner.className = "fx-in";
      inner.textContent = char === " " ? " " : char;
      outer.appendChild(inner);
      el.appendChild(outer);
      fxChars.push({ kind: kind, outer: outer, inner: inner, k: 0, tk: 0, x: 0, y: 0, tx: 0, ty: 0 });
    });
  });

  if (fxChars.length) {
    var RADIUS = 110;            // px of influence around the cursor (move, shape)
    var SENSE_RADIUS = 42;       // tighter spot for sense, so the word stays readable
    var PUSH = 16;               // max px a "move" letter is pushed
    var pointer = null;
    var running = false;

    var setTargets = function () {
      fxChars.forEach(function (c) {
        if (!pointer) { c.tk = 0; c.tx = 0; c.ty = 0; return; }
        var r = c.outer.getBoundingClientRect();
        var dx = r.left + r.width / 2 - pointer.x;
        var dy = r.top + r.height / 2 - pointer.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 0.001;
        var k = Math.max(0, 1 - d / (c.kind === "sense" ? SENSE_RADIUS : RADIUS));
        k = k * k * (3 - 2 * k);                 // smoothstep falloff
        c.tk = k;
        if (c.kind === "move") { c.tx = (dx / d) * PUSH * k; c.ty = (dy / d) * PUSH * k; }
      });
    };

    var frame = function () {
      var still = true;
      var motionOK = !reduceMotion.matches;
      fxChars.forEach(function (c) {
        c.k += (c.tk - c.k) * 0.18;
        c.x += (c.tx - c.x) * 0.16;
        c.y += (c.ty - c.y) * 0.16;
        if (Math.abs(c.tk - c.k) > 0.002 || Math.abs(c.tx - c.x) > 0.05 || Math.abs(c.ty - c.y) > 0.05) still = false;
        if (c.kind === "sense") {
          c.inner.style.setProperty("--k", c.k.toFixed(3));
        } else if (c.kind === "move" && motionOK) {
          c.inner.style.transform = "translate(" + c.x.toFixed(2) + "px," + c.y.toFixed(2) + "px)";
        } else if (c.kind === "shape" && motionOK) {
          c.inner.style.transform = "scale(" + (1 + 0.5 * c.k).toFixed(3) + "," + (1 - 0.6 * c.k).toFixed(3) + ")";
        }
      });
      if (still) { running = false; return; }
      requestAnimationFrame(frame);
    };
    var kick = function () { setTargets(); if (!running) { running = true; requestAnimationFrame(frame); } };

    var statement = document.querySelector(".hero__statement");
    var introActive = false, userTookOver = false;
    window.addEventListener("pointermove", function (e) {
      var r = statement.getBoundingClientRect();
      var near = e.clientX > r.left - RADIUS && e.clientX < r.right + RADIUS && e.clientY > r.top - RADIUS && e.clientY < r.bottom + RADIUS;
      if (near) { userTookOver = true; pointer = { x: e.clientX, y: e.clientY }; kick(); }
      else if (pointer && !introActive) { pointer = null; kick(); }
    }, { passive: true });

    // Intro: on the first visit of the session, a virtual cursor glides once across "sense", "move",
    // and "change shape" so visitors discover that the words react. Stops if the real cursor arrives.
    (function intro() {
      var played = false;
      try { played = sessionStorage.getItem("fx-intro") === "1"; } catch (e) {}
      if (played || reduceMotion.matches || window.scrollY > window.innerHeight * 0.5) return;
      try { sessionStorage.setItem("fx-intro", "1"); } catch (e) {}
      var words = ["sense", "move", "shape"].map(function (k) { return document.querySelector('[data-fx="' + k + '"]'); }).filter(Boolean);
      var SWEEP = 950, GAP = 280, START = 1500;
      var ease = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
      setTimeout(function () {
        if (userTookOver) return;
        introActive = true;
        var t0 = performance.now(), total = words.length * (SWEEP + GAP);
        (function step(now) {
          var t = now - t0;
          if (userTookOver || t >= total) { introActive = false; if (!userTookOver) { pointer = null; kick(); } return; }
          var i = Math.floor(t / (SWEEP + GAP)), local = t - i * (SWEEP + GAP);
          if (local > SWEEP) { pointer = null; }               // short pause between words
          else {
            var el = words[i], r = el.getBoundingClientRect(), p = ease(local / SWEEP);
            var yOff = el.dataset.fx === "move" ? r.height * 0.45 : 0;   // from slightly below, so "move" letters hop up
            pointer = { x: r.left - 24 + (r.width + 48) * p, y: r.top + r.height / 2 + yOff };
          }
          kick();
          requestAnimationFrame(step);
        })(t0);
      }, START);
    })();
    document.addEventListener("pointerleave", function () { pointer = null; kick(); });
    window.addEventListener("blur", function () { pointer = null; kick(); });
  }

  /* ---------- page transition: "buoyant lift" ----------
     Leaving: add .pt-leave (CSS floats the page up), then navigate.
     Arriving: the inline <head> script adds .pt-enter, CSS plays the rise-in; we just clean up.
     (Backup idea if this doesn't stick: a "reel" transition, the page reeled up on a line.) */
  var LIFT_MS = 720;
  function pageNavigate(href) {
    if (reduceMotion.matches) { window.location.href = href; return; }
    var url = new URL(href, window.location.href), hash = url.hash;
    try {
      sessionStorage.setItem("pt", String(Date.now()));
      // Carry the #section separately and load the page without it, so the browser doesn't do its own
      // (smooth, late) jump; the arriving page positions itself before it becomes visible.
      if (hash) { sessionStorage.setItem("pt-hash", hash); url.hash = ""; }
    } catch (e) {}
    root.classList.remove("pt-enter");
    root.classList.add("pt-leave");
    setTimeout(function () { window.location.href = url.href; }, LIFT_MS - 40);
  }

  // Where an element sits in normal flow. offsetTop ignores transforms (the rise-in on <main>);
  // walking offsetParents with sticky disabled gives the un-stuck position of the project cards.
  function naturalTop(el) {
    var prev = el.style.position; el.style.position = "relative";
    var top = 0, n = el;
    while (n) { top += n.offsetTop; n = n.offsetParent; }
    el.style.position = prev;
    return Math.max(0, Math.round(top));
  }

  if (root.classList.contains("pt-enter")) {
    var ptHash = null;
    try { ptHash = sessionStorage.getItem("pt-hash"); sessionStorage.removeItem("pt-hash"); } catch (e) {}
    var ptTarget = null;
    if (ptHash) { try { ptTarget = document.querySelector(decodeURIComponent(ptHash)); } catch (e) {} }
    if (ptTarget) {
      var align = function () { window.scrollTo({ top: naturalTop(ptTarget), behavior: "instant" }); };
      align();
      // Fonts/images finishing can shift layout above the target; keep it pinned while the page is still fading in
      var stopAt = performance.now() + 1100;
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (performance.now() < stopAt) align(); });
      window.addEventListener("load", function () { if (performance.now() < stopAt) align(); }, { once: true });
      if (window.ResizeObserver) {
        var ro = new ResizeObserver(function () { if (performance.now() < stopAt) align(); else ro.disconnect(); });
        ro.observe(document.body);
        setTimeout(function () { ro.disconnect(); }, 1200);
      }
      try { history.replaceState(history.state, "", location.pathname + location.search + ptHash); } catch (e) {}
    }
    setTimeout(function () { root.classList.remove("pt-enter"); }, 1300);
  }

  // Returning via back/forward cache: never leave the page in its "floated away" state
  window.addEventListener("pageshow", function (e) { if (e.persisted) root.classList.remove("pt-leave", "pt-enter"); });

  // Intercept clicks on links to other pages of this site
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    var url = new URL(a.getAttribute("href"), window.location.href);
    if (url.protocol !== window.location.protocol || url.host !== window.location.host) return;      // external
    if (url.pathname === window.location.pathname && url.search === window.location.search) return;  // same page (#anchor)
    if (!/(\.html?|\/)$/.test(url.pathname)) return;                                                   // e.g. PDFs
    e.preventDefault();
    pageNavigate(url.href);
  });

  /* ---------- whole project card is clickable (when it has a page) ---------- */
  document.querySelectorAll("[data-card-href]").forEach(function (card) {
    var href = card.getAttribute("data-card-href");
    var open = function (e, newTab) {
      if (e.target.closest("a, button, input, textarea, select")) return;   // let real controls work
      if (window.getSelection && String(window.getSelection()).length) return; // don't hijack text selection
      if (newTab) window.open(href, "_blank", "noopener"); else pageNavigate(new URL(href, window.location.href).href);
    };
    card.addEventListener("click", function (e) { open(e, e.ctrlKey || e.metaKey || e.shiftKey); });
    card.addEventListener("auxclick", function (e) { if (e.button === 1) open(e, true); });
  });

  /* ---------- hero montage: project loops crossfade behind the hero ---------- */
  (function () {
    var bg = document.querySelector(".hero__bg");
    if (!bg) return;
    var vids = Array.prototype.slice.call(bg.querySelectorAll("video"));
    var link = document.querySelector(".hero__now-link");
    var toggle = document.querySelector(".hero__now-toggle");
    var HOLD = 6500, idx = 0, timer = null, inView = true, userPaused = false;

    function caption(v) {
      if (!link) return;
      link.classList.add("is-swapping");
      setTimeout(function () {
        link.querySelector(".hero__now-title").innerHTML = v.dataset.title;
        link.querySelector(".hero__now-venue").innerHTML = v.dataset.venue;
        link.setAttribute("href", v.dataset.href);
        link.classList.remove("is-swapping");
      }, 400);
    }
    function running() { return inView && !userPaused && !document.hidden && !reduceMotion.matches; }
    function show(i) {
      var prev = vids[idx], next = vids[i];
      idx = i;
      if (next !== prev) {
        try { next.currentTime = 0; } catch (e) {}
        if (running()) safePlay(next);
        next.classList.add("is-active"); prev.classList.remove("is-active");
        setTimeout(function () { if (prev !== vids[idx]) prev.pause(); }, 1900);
        caption(next);
      }
    }
    function schedule() { clearTimeout(timer); if (running()) timer = setTimeout(function () { show((idx + 1) % vids.length); schedule(); }, HOLD); }
    function sync() {
      if (running()) { safePlay(vids[idx]); schedule(); }
      else { clearTimeout(timer); vids.forEach(function (v) { v.pause(); }); }
    }
    if (toggle) toggle.addEventListener("click", function () {
      userPaused = !userPaused;
      toggle.textContent = userPaused ? "Play" : "Pause";
      toggle.setAttribute("aria-label", (userPaused ? "Play" : "Pause") + " background video");
      sync();
    });
    new IntersectionObserver(function (es) { inView = es[0].isIntersecting; sync(); }, { threshold: 0.15 }).observe(bg);
    document.addEventListener("visibilitychange", sync);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", sync);
    sync();
  })();

  /* ---------- reveal on scroll ---------- */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { revealIO.observe(el); });

  /* ---------- project sections: reveal + play only the visible video ---------- */
  var projects = Array.from(document.querySelectorAll(".project"));

  projects.forEach(function (p) {
    var video = p.querySelector("video");
    var btn = p.querySelector(".media-toggle");
    p._userPaused = reduceMotion.matches;   // reduced motion: never autoplay
    if (btn) {
      setBtn(btn, !p._userPaused);
      btn.addEventListener("click", function () {
        if (video.paused) { p._userPaused = false; safePlay(video); setBtn(btn, true); }
        else { p._userPaused = true; video.pause(); setBtn(btn, false); }
      });
    }
  });

  function setBtn(btn, playing) {
    btn.textContent = playing ? "Pause" : "Play";
    btn.setAttribute("aria-label", (playing ? "Pause" : "Play") + " background video");
  }
  function safePlay(video) {
    var pr = video.play();
    if (pr && pr.catch) pr.catch(function () {});
  }

  // Reveal each project once it is mostly on screen.
  var projectIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-in"); projectIO.unobserve(e.target); }
    });
  }, { threshold: 0.35 });
  projects.forEach(function (p) { projectIO.observe(p); });

  // Play only the video of the project currently in view. Because sections stack
  // (position: sticky), a project counts as hidden once the next one fully covers it.
  var ticking = false;
  function syncVideos() {
    ticking = false;
    var vh = window.innerHeight;
    projects.forEach(function (p, i) {
      var video = p.querySelector("video");
      if (!video) return;
      var r = p.getBoundingClientRect();
      var next = projects[i + 1];
      var covered = next ? next.getBoundingClientRect().top <= 1 : false;
      var visible = r.top < vh * 0.65 && r.bottom > vh * 0.35 && !covered;
      if (visible && !p._userPaused) { if (video.paused) safePlay(video); }
      else if (!video.paused) video.pause();
    });
    exitCards(vh);
  }

  // Exit motion: as the next card (or the Publications section) slides up over a pinned card,
  // that card's text block shrinks a little, drifts up and fades. Desktop only (cards are sticky there).
  var stackedMQ = window.matchMedia("(min-width: 901px)");
  var afterResearch = document.querySelector("#publications");
  function exitCards(vh) {
    var on = stackedMQ.matches && !reduceMotion.matches;
    projects.forEach(function (p, i) {
      var cover = projects[i + 1] || afterResearch;
      var out = 0;
      if (on && cover) {
        var top = cover.getBoundingClientRect().top;
        out = Math.min(1, Math.max(0, (vh - top) / vh));   // 0 = nothing covering, 1 = fully covered
      }
      var prev = p._out || 0;
      if (Math.abs(out - prev) > 0.001 || (out === 0 && prev !== 0)) { p.style.setProperty("--out", out.toFixed(3)); p._out = out; }
    });
  }
  function requestSync() { if (!ticking) { ticking = true; requestAnimationFrame(syncVideos); } }
  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync);
  syncVideos();

  /* ---------- project pages ---------- */
  // Autoplaying hero videos (respect reduced motion) + their pause buttons
  document.querySelectorAll("video[data-autoplay]").forEach(function (video) {
    var btn = video.parentElement.querySelector(".media-toggle");
    if (reduceMotion.matches) { video.removeAttribute("autoplay"); video.pause(); }
    if (btn) {
      setBtn(btn, !reduceMotion.matches);
      btn.addEventListener("click", function () {
        if (video.paused) { safePlay(video); setBtn(btn, true); } else { video.pause(); setBtn(btn, false); }
      });
    }
  });

  // Videos that should play only while on screen (gallery clips, related teasers)
  var inviewIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting && !v._userPaused && !reduceMotion.matches) safePlay(v); else v.pause();
    });
  }, { threshold: 0.25 });
  document.querySelectorAll("video[data-inview]").forEach(function (v) {
    var btn = v.parentElement.querySelector(".media-toggle");
    if (btn) {
      v._userPaused = reduceMotion.matches;
      setBtn(btn, !v._userPaused);
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        if (v.paused) { v._userPaused = false; safePlay(v); setBtn(btn, true); }
        else { v._userPaused = true; v.pause(); setBtn(btn, false); }
      });
    }
    inviewIO.observe(v);
  });

  // Click-to-load YouTube embed (no YouTube requests until the visitor clicks)
  document.querySelectorAll(".yt[data-yt]").forEach(function (box) {
    var btn = box.querySelector(".yt__play");
    btn.addEventListener("click", function () {
      // YouTube's embedded player refuses to run on pages opened from disk (file://, "Error 153"),
      // so in that case open the video on YouTube instead.
      if (location.protocol === "file:") {
        window.open("https://www.youtube.com/watch?v=" + box.getAttribute("data-yt"), "_blank", "noopener");
        return;
      }
      var iframe = document.createElement("iframe");
      iframe.referrerPolicy = "strict-origin-when-cross-origin";   // YouTube requires a referrer
      iframe.src = "https://www.youtube-nocookie.com/embed/" + box.getAttribute("data-yt") + "?autoplay=1&rel=0";
      iframe.title = btn.getAttribute("aria-label") || "Video";
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      box.replaceChildren(iframe);
      iframe.focus();
    });
  });

  // Copy BibTeX
  document.querySelectorAll(".bibtex__copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var code = btn.parentElement.querySelector("code").textContent;
      var done = function () {
        btn.classList.add("is-copied"); btn.setAttribute("aria-label", "Copied");
        setTimeout(function () { btn.classList.remove("is-copied"); btn.setAttribute("aria-label", "Copy BibTeX"); }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(code).then(done, function () {});
    });
  });

  // Lightbox for figures
  var lightbox = document.querySelector(".lightbox");
  if (lightbox && lightbox.showModal) {
    var lbImg = lightbox.querySelector("img");
    document.querySelectorAll(".pp-fig img").forEach(function (img) {
      img.addEventListener("click", function () {
        lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
        lightbox.showModal();
      });
    });
    lightbox.addEventListener("click", function () { lightbox.close(); });
  }

  /* ---------- active nav link ---------- */
  var navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  var navIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      navLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id); });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(function (s) { if (s) navIO.observe(s); });
})();
