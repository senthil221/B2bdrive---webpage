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

})();
