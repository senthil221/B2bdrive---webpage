(() => {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion) {
    root.classList.add("motion-ready");
  }

  const header = document.querySelector("[data-site-header]");
  if (header) {
    let headerTicking = false;
    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
      headerTicking = false;
    };
    const requestHeaderUpdate = () => {
      if (headerTicking) return;
      headerTicking = true;
      window.requestAnimationFrame(updateHeader);
    };
    window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
    updateHeader();
  }

  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -55px 0px" }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const calendarAnimations = [...document.querySelectorAll("[data-calendar-animation]")];
  if (reduceMotion || !("IntersectionObserver" in window)) {
    calendarAnimations.forEach((item) => item.classList.add("is-calendar-visible"));
  } else {
    const calendarObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-calendar-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );
    calendarAnimations.forEach((item) => calendarObserver.observe(item));
  }

  const autoMarquees = [...document.querySelectorAll("[data-auto-marquee]")];
  const initialiseAutoMarquee = (marquee) => {
    const track = marquee.querySelector("[data-auto-marquee-track]");
    const sourceGroup = marquee.querySelector("[data-auto-marquee-group]");
    if (!track || !sourceGroup) return;

    marquee.classList.remove("is-marquee-ready");
    track.querySelectorAll("[data-marquee-clone]").forEach((clone) => clone.remove());

    const sourceWidth = sourceGroup.getBoundingClientRect().width;
    if (!sourceWidth) return;

    const targetWidth = marquee.clientWidth + sourceWidth;
    let safety = 0;
    while (track.scrollWidth < targetWidth && safety < 20) {
      const clone = sourceGroup.cloneNode(true);
      clone.removeAttribute("data-auto-marquee-group");
      clone.setAttribute("data-marquee-clone", "");
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
      safety += 1;
    }

    if (!track.querySelector("[data-marquee-clone]")) {
      const clone = sourceGroup.cloneNode(true);
      clone.removeAttribute("data-auto-marquee-group");
      clone.setAttribute("data-marquee-clone", "");
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    }

    const duration = Number.parseFloat(marquee.dataset.marqueeSpeed || "36");
    track.style.setProperty("--marquee-shift", `-${sourceWidth}px`);
    track.style.setProperty("--marquee-duration", `${Math.max(12, duration)}s`);
    marquee.classList.add("is-marquee-ready");
  };

  if (autoMarquees.length) {
    const initialiseAllMarquees = () => autoMarquees.forEach(initialiseAutoMarquee);
    initialiseAllMarquees();
    window.addEventListener("load", initialiseAllMarquees, { once: true });

    let marqueeResizeTimer;
    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(marqueeResizeTimer);
        marqueeResizeTimer = window.setTimeout(initialiseAllMarquees, 150);
      },
      { passive: true }
    );
  }

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector("[data-carousel-track]");
    const previousButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    if (!track) return;

    const getDistance = () => {
      const card = track.firstElementChild;
      if (!card) return track.clientWidth * 0.85;
      const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || "0");
      return card.getBoundingClientRect().width + gap;
    };

    const updateControls = () => {
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth - 2);
      if (previousButton) previousButton.disabled = track.scrollLeft <= 2;
      if (nextButton) nextButton.disabled = track.scrollLeft >= maxScroll;
    };

    const move = (direction) => {
      track.scrollBy({
        left: getDistance() * direction,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    };

    previousButton?.addEventListener("click", () => move(-1));
    nextButton?.addEventListener("click", () => move(1));
    track.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls, { passive: true });
    updateControls();
  });

  const roadmapSteps = [...document.querySelectorAll("[data-roadmap-step]")];
  const roadmapProgress = document.querySelector("[data-roadmap-progress]");
  if (roadmapSteps.length) {
    const setRoadmapStep = (activeIndex) => {
      roadmapSteps.forEach((step, index) => {
        step.classList.toggle("is-active", index === activeIndex);
        step.classList.toggle("is-complete", index < activeIndex);
      });
      if (roadmapProgress) {
        const progress = roadmapSteps.length > 1 ? activeIndex / (roadmapSteps.length - 1) : 1;
        roadmapProgress.style.transform = `scaleY(${Math.max(0.03, progress)})`;
      }
    };

    setRoadmapStep(0);
    if (!reduceMotion && "IntersectionObserver" in window && window.matchMedia("(min-width: 1024px)").matches) {
      const visibility = new Map(roadmapSteps.map((step) => [step, 0]));
      const roadmapObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => visibility.set(entry.target, entry.intersectionRatio));
          let activeIndex = 0;
          let highestRatio = -1;
          roadmapSteps.forEach((step, index) => {
            const ratio = visibility.get(step) || 0;
            if (ratio > highestRatio) {
              highestRatio = ratio;
              activeIndex = index;
            }
          });
          if (highestRatio > 0) setRoadmapStep(activeIndex);
        },
        { threshold: [0.15, 0.3, 0.5, 0.7], rootMargin: "-22% 0px -48% 0px" }
      );
      roadmapSteps.forEach((step) => roadmapObserver.observe(step));
    } else {
      setRoadmapStep(roadmapSteps.length - 1);
      if (roadmapProgress) roadmapProgress.style.transform = "scaleY(1)";
    }
  }

  const stackCards = [...document.querySelectorAll("[data-stack-card]")];
  if (stackCards.length && !reduceMotion && "IntersectionObserver" in window && window.matchMedia("(min-width: 1024px)").matches) {
    const setStackCard = (activeIndex) => {
      stackCards.forEach((card, index) => {
        card.classList.toggle("is-past", index < activeIndex);
        card.classList.toggle("is-current", index === activeIndex);
      });
    };
    const stackObserver = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!active) return;
        setStackCard(stackCards.indexOf(active.target));
      },
      { threshold: [0.3, 0.55, 0.8], rootMargin: "-12% 0px -58% 0px" }
    );
    stackCards.forEach((card) => stackObserver.observe(card));
    setStackCard(0);
  }

  // Antigravity-style particle field: colored dashes that orient toward / follow the cursor.
  const particleCanvas = document.querySelector("[data-particle-field]");
  if (particleCanvas && particleCanvas.getContext) {
    const ctx = particleCanvas.getContext("2d");
    const host = particleCanvas.closest("section") || particleCanvas.parentElement;
    const palette = ["#2f6bff", "#4f46e5", "#7c3aed", "#ec4899", "#ef4444", "#f59e0b"];
    const DENSITY = 0.00048; // dashes per px² of hero area (dense, like the reference)
    const DASH = 5;          // base dash length (px) — small ticks
    const REACH = 460;       // radius (px) over which cursor brightness falls off
    const PULL_RADIUS = 220; // radius (px) inside which the focal point attracts particles
    const PULL = 0.9;        // magnetic attraction strength (≈ max draw × SPRING)
    const SPRING = 0.06;     // pull back toward home position
    const FRICTION = 0.86;   // velocity damping
    const DRAG = 0.085;      // how heavily the focal point trails the cursor (lower = more lag)
    const rand = (a, b) => a + Math.random() * (b - a);

    let w = 0, h = 0, dpr = 1, particles = [];
    let pointerX = 0, pointerY = 0, hasPointer = false, raf = 0;
    let fx = 0, fy = 0; // focal point that lags behind the cursor (the "magnet")
    let rect = particleCanvas.getBoundingClientRect();

    const build = () => {
      rect = particleCanvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      particleCanvas.width = Math.round(w * dpr);
      particleCanvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fx = w * 0.5; fy = h * 0.5;
      const count = Math.round(w * h * DENSITY);
      particles = [];
      for (let i = 0; i < count; i++) {
        const base = rand(0, Math.PI * 2);
        const x = rand(0, w), y = rand(0, h);
        particles.push({
          x, y, hx: x, hy: y, vx: 0, vy: 0, // current pos, home pos, velocity
          base, angle: base,
          len: rand(0.7, 1.35),
          drift: rand(0.0004, 0.0018) * (Math.random() < 0.5 ? -1 : 1),
          color: palette[(Math.random() * palette.length) | 0],
        });
      }
    };

    const drawDash = (p, alpha, scale) => {
      const len = DASH * p.len * scale;
      const cx = Math.cos(p.angle) * len * 0.5;
      const cy = Math.sin(p.angle) * len * 0.5;
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(p.x - cx, p.y - cy);
      ctx.lineTo(p.x + cx, p.y + cy);
      ctx.stroke();
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";

      // The focal point chases the cursor with "weight" (lag) — this is what reads
      // as a magnet the field follows, rather than every dash snapping in place.
      if (hasPointer) {
        fx += (pointerX - fx) * DRAG;
        fy += (pointerY - fy) * DRAG;
      }

      for (const p of particles) {
        // Spring back toward home position.
        let ax = (p.hx - p.x) * SPRING;
        let ay = (p.hy - p.y) * SPRING;
        let target = p.base, alpha = 0.26, scale = 1;

        if (hasPointer) {
          const dx = fx - p.x, dy = fy - p.y;            // from particle toward focal point
          const dist = Math.max(Math.hypot(dx, dy), 8);
          if (dist < PULL_RADIUS) {
            const f = 1 - dist / PULL_RADIUS;            // 1 at focal → 0 at radius
            ax += (dx / dist) * f * PULL;                // draw particle toward the magnet
            ay += (dy / dist) * f * PULL;
          }
          const prox = Math.max(0, 1 - dist / REACH);    // brightness/orient emphasis
          target = Math.atan2(dy, dx);                   // dash points toward the magnet
          alpha = 0.22 + prox * 0.55;
          scale = 1 + prox * 1.0;
        } else {
          p.base += p.drift; // gentle idle rotation only when the cursor is away
          target = p.base;
        }

        // Integrate velocity (damped spring) → smooth draw-in and ease-back.
        p.vx = (p.vx + ax) * FRICTION;
        p.vy = (p.vy + ay) * FRICTION;
        p.x += p.vx;
        p.y += p.vy;

        let d = target - p.angle;
        d = Math.atan2(Math.sin(d), Math.cos(d)); // shortest rotation path
        p.angle += d * 0.1;
        drawDash(p, alpha, scale);
      }
      ctx.globalAlpha = 1;
      raf = window.requestAnimationFrame(frame);
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      for (const p of particles) drawDash(p, 0.28, 1);
      ctx.globalAlpha = 1;
    };

    const start = () => { if (!raf) raf = window.requestAnimationFrame(frame); };
    const stop = () => { if (raf) { window.cancelAnimationFrame(raf); raf = 0; } };

    host.addEventListener("pointermove", (event) => {
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      hasPointer = true;
    }, { passive: true });
    host.addEventListener("pointerleave", () => { hasPointer = false; });

    window.addEventListener("resize", () => {
      build();
      if (reduceMotion) drawStatic();
    }, { passive: true });
    window.addEventListener("scroll", () => { rect = particleCanvas.getBoundingClientRect(); }, { passive: true });

    build();
    drawStatic(); // immediate first paint so the field is never blank before rAF starts
    if (reduceMotion) {
      // static field only — no cursor follow
    } else {
      start();
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(
          (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
          { threshold: 0 }
        ).observe(particleCanvas);
      }
    }
  }
})();
