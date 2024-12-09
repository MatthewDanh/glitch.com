/* Credit and Thanks:
Matrix - Particles.js;
SliderJS - Ettrics;
Design - Sara Mazal Web;
Fonts - Google Fonts
*/

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Particles.js
  const particles = Particles.init({
    selector: ".background",
    color: ["#9b59b6", "#ffff00", "#000000"],
    connectParticles: true,
    responsive: [
      {
        breakpoint: 768,
        options: {
          color: ["#faebd7", "#9b59b6", "#ffff00"],
          maxParticles: 43,
          connectParticles: false,
        },
      },
    ],
  });

  // Navigation Behavior
  class Navigation {
    constructor() {
      this.currentTab = null;
      this.lastScroll = 0;
      this.init();
    }

    init() {
      const navTabs = document.querySelectorAll(".nav-tab");
      const navContainer = document.querySelector(".nav-container");

      navTabs.forEach((tab) => {
        tab.addEventListener("click", (e) => this.scrollToSection(e, tab));
      });

      window.addEventListener("scroll", () => this.handleScroll(navContainer));
      window.addEventListener("resize", () => this.updateSlider());
    }

    scrollToSection(event, tab) {
      event.preventDefault();
      const targetId = tab.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const offsetTop =
          targetElement.offsetTop - document.querySelector(".nav-container").offsetHeight;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    }

    handleScroll(navContainer) {
      const headerHeight = 75;

      // Sticky Nav Behavior
      if (window.scrollY > headerHeight) {
        navContainer.classList.add("nav-container--scrolled");
      } else {
        navContainer.classList.remove("nav-container--scrolled");
      }

      // Tab Highlight Logic
      this.highlightCurrentTab();
    }

    highlightCurrentTab() {
      const navTabs = document.querySelectorAll(".nav-tab");
      let currentTab = null;

      navTabs.forEach((tab) => {
        const sectionId = tab.getAttribute("href");
        const section = document.querySelector(sectionId);

        if (section) {
          const sectionTop = section.offsetTop - 80; // Offset to account for sticky nav
          const sectionBottom = sectionTop + section.offsetHeight;

          if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
            currentTab = tab;
          }
        }
      });

      // Update Slider
      if (currentTab) {
        this.updateSlider(currentTab);
      }
    }

    updateSlider(activeTab) {
      const slider = document.querySelector(".nav-tab-slider");

      if (activeTab) {
        const tabRect = activeTab.getBoundingClientRect();
        slider.style.width = `${tabRect.width}px`;
        slider.style.left = `${tabRect.left}px`;
      }
    }
  }

  // Fade-In Effect
  const fadeInElements = document.querySelectorAll(".fade-in");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  fadeInElements.forEach((element) => observer.observe(element));

  // Modal Functionality
  const modal = document.getElementById("modal");
  const openModalButton = document.getElementById("openModal");
  const closeModalButton = document.getElementById("closeModal");

  if (modal && openModalButton && closeModalButton) {
    openModalButton.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.remove("hidden");
      setTimeout(() => {
        modal.classList.add("show");
      }, 10); // Small delay for animation
    });

    closeModalButton.addEventListener("click", () => {
      modal.classList.remove("show");
      setTimeout(() => {
        modal.classList.add("hidden");
      }, 500); // Wait for animation to complete
    });
  }

  // Initialize Navigation
  new Navigation();
});
