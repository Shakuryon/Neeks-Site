document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbarCont");
  const navbarSection = document.getElementById("navbarSection");
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.getElementById("siteNav");
  const year = document.getElementById("footerYear");

  if (year) year.textContent = new Date().getFullYear();

  const updateNav = () => {
    const scrolled = window.scrollY > 24;
    navbar?.classList.toggle("scrolled", scrolled);
    navbarSection?.classList.toggle("scrolledtoo", scrolled);
  };
  updateNav();
  window.addEventListener("scroll", updateNav, { passive: true });

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    siteNav?.classList.toggle("is-open", !isOpen);
  });

  siteNav?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  // One shared audio element keeps the page from playing multiple demos at once.
  const audio = document.getElementById("characterAudio");
  const cards = [...document.querySelectorAll("[data-character-audio]")];
  const note = document.getElementById("audioNote");
  let activeCard = null;

  function setCardState(card, playing) {
    if (!card) return;
    card.classList.toggle("is-playing", playing);
    card.setAttribute("aria-pressed", String(playing));
  }

  function resetCards() {
    cards.forEach(card => setCardState(card, false));
    activeCard = null;
  }

  cards.forEach(card => {
    card.addEventListener("click", async () => {
      const source = card.dataset.characterAudio;
      if (!audio || !source) return;

      if (activeCard === card && !audio.paused) {
        audio.pause();
        setCardState(card, false);
        if (note) note.textContent = "Playback paused. Press the sample again to continue.";
        return;
      }

      audio.pause();
      resetCards();
      activeCard = card;

      if (audio.getAttribute("src") !== source) {
        audio.src = source;
        audio.load();
      }

      try {
        await audio.play();
        setCardState(card, true);
        if (note) note.textContent = "Now playing: " + card.querySelector(".char-name")?.textContent + ".";
      } catch (error) {
        resetCards();
        if (note) note.textContent = "Sample not available yet for demo! " + source + ".";
      }
    });
  });

  audio?.addEventListener("ended", () => {
    resetCards();
    if (note) note.textContent = "Sample finished. Choose another track!";
  });
  audio?.addEventListener("pause", () => {
    if (audio.ended) return;
    if (activeCard) setCardState(activeCard, false);
  });
  audio?.addEventListener("error", () => {
    resetCards();
    if (note) note.textContent = "Demo file not found. Add Neekstars’ approved MP3s to the assets/audio folder before launch.";
  });

  // Gentle reveal animations; content remains visible when reduced motion is preferred.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduceMotion) {
    document.documentElement.classList.add("reveal-ready");
    const revealItems = document.querySelectorAll(".kelvin-moment, .char-card, .equipment-card, .about-content");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  }
});
