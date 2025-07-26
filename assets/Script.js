// Initialize GSAP and ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Snake Cursor Animation - English Only
let mouseX = 0;
let mouseY = 0;
let snakeCursor = null;
let isDesktop = window.innerWidth > 768;
let isArabic = false;

function initSnakeCursor() {
  snakeCursor = document.getElementById("snakeCursor");
  isArabic = document.body.getAttribute("lang") === "ar";

  // Show snake cursor only on desktop English
  if (isDesktop && !isArabic && snakeCursor) {
    snakeCursor.style.display = "block";
    document.body.style.cursor = "none";

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (snakeCursor && !isArabic) {
        gsap.to(snakeCursor, {
          x: mouseX - 10,
          y: mouseY - 10,
          duration: 0.1,
          ease: "power2.out",
        });
      }
    });

    // Hide cursor when leaving window
    document.addEventListener("mouseleave", () => {
      if (snakeCursor && !isArabic) {
        gsap.to(snakeCursor, {
          opacity: 0,
          duration: 0.3,
        });
      }
    });

    // Show cursor when entering window
    document.addEventListener("mouseenter", () => {
      if (snakeCursor && !isArabic) {
        gsap.to(snakeCursor, {
          opacity: 1,
          duration: 0.3,
        });
      }
    });

    // Scale cursor on hover over interactive elements
    const interactiveElements = document.querySelectorAll(
      "a, button, input, textarea, .gallery-card, .platform-card, .tab-button"
    );

    interactiveElements.forEach((element) => {
      element.addEventListener("mouseenter", () => {
        if (snakeCursor && isDesktop && !isArabic) {
          gsap.to(snakeCursor, {
            scale: 1.5,
            duration: 0.3,
          });
        }
      });

      element.addEventListener("mouseleave", () => {
        if (snakeCursor && isDesktop && !isArabic) {
          gsap.to(snakeCursor, {
            scale: 1,
            duration: 0.3,
          });
        }
      });
    });
  } else {
    // Hide snake cursor and show default cursor
    if (snakeCursor) {
      snakeCursor.style.display = "none";
    }
    document.body.style.cursor = "default";

    // Force default cursor on all elements
    const allElements = document.querySelectorAll("*");
    allElements.forEach((el) => {
      el.style.cursor = "default";
    });
  }
}

// Update cursor when language changes
function updateCursorForLanguage() {
  isArabic =
    document.body.getAttribute("lang") === "ar" || currentLang === "ar";

  if (isArabic || !isDesktop) {
    // Hide snake cursor for Arabic or mobile
    if (snakeCursor) {
      snakeCursor.style.display = "none";
    }
    document.body.style.cursor = "default";

    const allElements = document.querySelectorAll("*");
    allElements.forEach((el) => {
      el.style.cursor = "default";
    });
  } else {
    // Show snake cursor for English desktop
    if (snakeCursor) {
      snakeCursor.style.display = "block";
    }
    document.body.style.cursor = "none";
  }
}

// Handle window resize
window.addEventListener("resize", () => {
  const wasDesktop = isDesktop;
  isDesktop = window.innerWidth > 768;

  if (wasDesktop !== isDesktop) {
    initSnakeCursor();

    // Reinitialize gallery sliders on resize
    if (typeof portfolioSwipers !== "undefined") {
      Object.values(portfolioSwipers).forEach((swiper) => {
        if (swiper) {
          swiper.update();
        }
      });
    }
  }
});

// Clean Network-Only 3D Background
let scene, camera, renderer, networkSystem;

function init3DBackground() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("bg-canvas"),
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create Only Network Effect
  createNetworkField();

  camera.position.z = 60;

  animate3D();
}

function createNetworkField() {
  const networkGeometry = new THREE.BufferGeometry();
  const networkPositions = [];
  const networkColors = [];
  const connections = [];

  // Create network nodes
  for (let i = 0; i < 40; i++) {
    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 70;
    const z = (Math.random() - 0.5) * 70;

    networkPositions.push(x, y, z);

    // Dark red network colors
    networkColors.push(0.6, 0.1, 0.1);

    // Create connections between nearby nodes
    for (let j = 0; j < i; j++) {
      const dx = networkPositions[j * 3] - x;
      const dy = networkPositions[j * 3 + 1] - y;
      const dz = networkPositions[j * 3 + 2] - z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance < 25) {
        connections.push(
          networkPositions[j * 3],
          networkPositions[j * 3 + 1],
          networkPositions[j * 3 + 2],
          x,
          y,
          z
        );
      }
    }
  }

  // Create network lines
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(connections, 3)
  );

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x881111,
    transparent: true,
    opacity: 0.4,
  });

  const networkLines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(networkLines);

  // Create network points
  networkGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(networkPositions, 3)
  );
  networkGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(networkColors, 3)
  );

  const networkMaterial = new THREE.PointsMaterial({
    size: 3,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  });

  networkSystem = new THREE.Points(networkGeometry, networkMaterial);
  scene.add(networkSystem);
  scene.userData.networkLines = networkLines;
}

function animate3D() {
  requestAnimationFrame(animate3D);

  const time = Date.now() * 0.0005;

  // Smooth network animation
  if (networkSystem) {
    networkSystem.rotation.y += 0.002;
    networkSystem.rotation.x += 0.0008;
  }

  // Smooth network lines animation
  if (scene.userData.networkLines) {
    scene.userData.networkLines.rotation.y += 0.0015;
    scene.userData.networkLines.material.opacity =
      0.3 + Math.sin(time * 3) * 0.1;
  }

  // Smooth camera movement
  camera.position.x = Math.sin(time * 0.4) * 2;
  camera.position.y = Math.cos(time * 0.3) * 1;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

// Language Toggle Functionality - NO localStorage
let currentLang = "en"; // Always start with English

// Initialize language - Always default to English
function initializeLanguage() {
  currentLang = "en"; // Always start with English

  document.body.setAttribute("lang", currentLang);
  document.body.setAttribute("dir", "ltr");
  document.querySelector(".lang-text").textContent = "العربية";

  // Update cursor based on language
  updateCursorForLanguage();
}

function toggleLanguage() {
  currentLang = currentLang === "en" ? "ar" : "en";

  // NO localStorage - removed completely

  document.body.setAttribute("lang", currentLang);

  if (currentLang === "ar") {
    document.body.setAttribute("dir", "rtl");
    document.querySelector(".lang-text").textContent = "English";
  } else {
    document.body.setAttribute("dir", "ltr");
    document.querySelector(".lang-text").textContent = "العربية";
  }

  // Update cursor based on language
  updateCursorForLanguage();

  // Re-trigger animations for RTL layout
  ScrollTrigger.refresh();

  // Update all gallery sliders direction
  if (typeof portfolioSwipers !== "undefined") {
    Object.values(portfolioSwipers).forEach((swiper) => {
      if (swiper) {
        swiper.changeLanguageDirection && swiper.changeLanguageDirection();
        swiper.update();
      }
    });
  }
}

// Enhanced Portfolio Tabs System with New Tabs: WordPress, Salla, Zid, OpenCart
let portfolioSwipers = {};

function initPortfolioTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab");

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button and corresponding content
      button.classList.add("active");
      document.getElementById(targetTab).classList.add("active");

      // Stop all other swipers first
      Object.values(portfolioSwipers).forEach((swiper) => {
        if (swiper && swiper.autoplay) {
          swiper.autoplay.stop();
        }
      });

      // Initialize or update the swiper for the active tab
      initSwiperForTab(targetTab);

      // Start autoplay immediately for the new tab
      setTimeout(() => {
        const newSwiper = portfolioSwipers[targetTab];
        if (newSwiper && newSwiper.autoplay) {
          newSwiper.autoplay.start();
        }
      }, 200);

      // Add animation for tab content
      gsap.fromTo(
        `#${targetTab} .gallery-card`,
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
        }
      );
    });
  });
}

// Initialize Swiper for specific tab with enhanced auto-loop
function initSwiperForTab(tabName) {
  // Destroy existing swiper if it exists
  if (portfolioSwipers[tabName]) {
    portfolioSwipers[tabName].destroy(true, true);
  }

  const swiperContainer = document.querySelector(`#${tabName} .swiper`);
  if (!swiperContainer) return;

  portfolioSwipers[tabName] = new Swiper(swiperContainer, {
    // Basic settings for auto-loop with centered slides
    slidesPerView: 1,
    spaceBetween: 30,
    centeredSlides: true,

    // Enhanced Auto-play with 3000ms speed
    autoplay: {
      delay: 3000, // Exactly 3000ms as requested
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
      reverseDirection: false,
      waitForTransition: false,
    },

    speed: 1000, // Smooth transition speed
    effect: "slide", // Better for loop

    // Always enable loop
    loop: true,
    loopAdditionalSlides: 3,

    // Enhanced responsive breakpoints with centered slides in all screens
    breakpoints: {
      // Mobile: 1 slide - Centered
      320: {
        slidesPerView: 1,
        spaceBetween: 20,
        centeredSlides: true, // Always centered
        loop: true,
        loopAdditionalSlides: 2,
      },
      // Tablet: 2 slides - Centered
      768: {
        slidesPerView: 2,
        spaceBetween: 30,
        centeredSlides: true, // Changed to true for centering
        loop: true,
        loopAdditionalSlides: 3,
      },
      // Desktop: 3 slides - Centered
      1024: {
        slidesPerView: 3,
        spaceBetween: 40,
        centeredSlides: true, // Always centered
        loop: true,
        loopAdditionalSlides: 3,
      },
    },

    // Navigation arrows
    navigation: {
      nextEl: `#${tabName} .swiper-button-next`,
      prevEl: `#${tabName} .swiper-button-prev`,
    },

    // Pagination
    pagination: {
      el: `#${tabName} .swiper-pagination`,
      clickable: true,
      dynamicBullets: true,
    },

    // Smooth transitions
    freeMode: false,
    watchSlidesProgress: true,
    watchSlidesVisibility: true,

    // Touch settings
    touchRatio: 1,
    touchAngle: 45,
    simulateTouch: true,
    allowTouchMove: true,

    // Performance
    updateOnWindowResize: true,
    observer: true,
    observeParents: true,

    // Prevent loop warnings
    watchOverflow: false, // Allow loop even with few slides

    // Events
    on: {
      init: function () {
        // Start autoplay immediately after initialization - no delay
        this.autoplay.start();
        console.log(`${tabName} slider initialized and autoplay started`);
      },
      slideChange: function () {
        // Add active slide animation
        const activeSlide = this.slides[this.activeIndex];
        const activeCard = activeSlide?.querySelector(".gallery-card");

        if (activeCard) {
          gsap.fromTo(
            activeCard,
            { scale: 0.98 },
            { scale: 1, duration: 0.3, ease: "power2.out" }
          );
        }
      },
      transitionStart: function () {
        // Keep autoplay running during transitions
        this.allowTouchMove = true;
      },
      transitionEnd: function () {
        // Ensure autoplay continues after transition
        if (!this.autoplay.running) {
          this.autoplay.start();
        }
        this.allowTouchMove = true;
      },
      touchStart: function () {
        // Pause autoplay on touch but keep it responsive
        this.autoplay.stop();
      },
      touchEnd: function () {
        // Resume autoplay after touch with shorter delay
        setTimeout(() => {
          this.autoplay.start();
        }, 1000);
      },
      reachEnd: function () {
        // Ensure continuous loop
        if (this.loop) {
          this.autoplay.start();
        }
      },
      reachBeginning: function () {
        // Ensure continuous loop
        if (this.loop) {
          this.autoplay.start();
        }
      },
      autoplayStart: function () {
        console.log(`${tabName} slider autoplay started`);
      },
      autoplayStop: function () {
        console.log(`${tabName} slider autoplay stopped`);
      },
    },
  });

  // Enhanced interaction events for current tab
  const galleryCards = document.querySelectorAll(`#${tabName} .gallery-card`);
  galleryCards.forEach((card) => {
    // Remove existing event listeners to prevent duplicates
    card.removeEventListener("mouseenter", handleCardMouseEnter);
    card.removeEventListener("mouseleave", handleCardMouseLeave);
    card.removeEventListener("click", handleCardClick);

    // Add new event listeners
    card.addEventListener("mouseenter", handleCardMouseEnter);
    card.addEventListener("mouseleave", handleCardMouseLeave);
    card.addEventListener("click", handleCardClick);
  });
}

// Event handlers for gallery cards
function handleCardMouseEnter() {
  const tabName = this.closest(".tab-content").id;
  const swiper = portfolioSwipers[tabName];
  if (swiper && swiper.autoplay && swiper.autoplay.running) {
    swiper.autoplay.stop();
  }
}

function handleCardMouseLeave() {
  const tabName = this.closest(".tab-content").id;
  const swiper = portfolioSwipers[tabName];
  if (swiper && swiper.autoplay) {
    // Immediately restart with 3000ms delay
    setTimeout(() => {
      swiper.autoplay.start();
    }, 500);
  }
}

function handleCardClick() {
  const img = this.querySelector("img");
  const title = this.querySelector("h3")?.textContent || "";

  if (img) {
    openGalleryModal(img.src, title);
  }
}

// Initialize all gallery sliders
function initAllGallerySliders() {
  // Initialize the first tab (WordPress) by default with autoplay
  setTimeout(() => {
    initSwiperForTab("wordpress");

    // Force start autoplay for the initial tab
    setTimeout(() => {
      const wordpressSwiper = portfolioSwipers["wordpress"];
      if (wordpressSwiper) {
        wordpressSwiper.autoplay.start();
        console.log("WordPress slider autoplay started");
      }
    }, 500);
  }, 100);

  // Add scroll trigger for gallery section
  ScrollTrigger.create({
    trigger: ".gallery-section",
    start: "top 85%",
    onEnter: () => {
      gsap.fromTo(
        ".gallery-section .section-title",
        { opacity: 0, y: 40, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" }
      );

      // Animate portfolio tabs
      gsap.fromTo(
        ".tab-button",
        { opacity: 0, y: 20, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.3,
        }
      );

      // Ensure autoplay starts when section comes into view
      setTimeout(() => {
        const activeSwiper = portfolioSwipers["wordpress"];
        if (activeSwiper && !activeSwiper.autoplay.running) {
          activeSwiper.autoplay.start();
          console.log("WordPress slider autoplay restarted on scroll");
        }
      }, 1000);
    },
  });
}

// Enhanced Gallery Modal
function openGalleryModal(imgSrc, title = "") {
  // Create modal if it doesn't exist
  let modal = document.getElementById("galleryModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "galleryModal";
    modal.className = "gallery-modal";
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <button class="close-modal" id="closeGalleryModal">
          <i class="fas fa-times"></i>
        </button>
        <img src="" alt="" class="modal-image" id="galleryModalImage">
        <div class="modal-info">
          <h3 class="modal-title" id="galleryModalTitle"></h3>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Add close event listeners
    document
      .getElementById("closeGalleryModal")
      .addEventListener("click", closeGalleryModal);
    modal
      .querySelector(".modal-backdrop")
      .addEventListener("click", closeGalleryModal);
  }

  const modalImg = document.getElementById("galleryModalImage");
  const modalTitle = document.getElementById("galleryModalTitle");

  modal.style.display = "block";
  modalImg.src = imgSrc;
  modalTitle.textContent = title;

  // Add fade in animation
  gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.3 });
  gsap.fromTo(
    modalImg,
    { scale: 0.8, rotation: 5 },
    { scale: 1, rotation: 0, duration: 0.4, delay: 0.1, ease: "back.out(1.7)" }
  );
}

function closeGalleryModal() {
  const modal = document.getElementById("galleryModal");
  if (modal) {
    gsap.to(modal, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        modal.style.display = "none";
      },
    });
  }
}

// Counter Animation
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);

  const timer = setInterval(() => {
    start += increment;
    element.textContent = Math.floor(start);

    if (start >= target) {
      element.textContent = target;
      clearInterval(timer);
    }
  }, 16);
}

// Enhanced Form Submission
function handleFormSubmit(e) {
  e.preventDefault();

  const btn = document.querySelector(".submit-btn");
  const originalHTML = btn.innerHTML;

  // Get current language
  const isArabic = document.body.getAttribute("lang") === "ar";

  // Show loading state
  btn.innerHTML = `
    <i class="fas fa-spinner fa-spin"></i>
    <span class="en">Sending...</span>
    <span class="ar">جاري الإرسال...</span>
  `;
  btn.disabled = true;

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  // Create mailto link
  const subject = isArabic
    ? "رسالة من الموقع الشخصي"
    : "Message from Personal Website";
  const body = `
Name / الاسم: ${data.fullName}
Phone / الهاتف: ${data.phone}
Email / البريد الإلكتروني: ${data.email}

Message / الرسالة:
${data.message}

---
Sent from Mohamed Atef's Portfolio Website
  `;

  const mailtoLink = `mailto:mohammedatef1359@gmail.com?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  // Simulate sending delay
  setTimeout(() => {
    window.open(mailtoLink);

    // Reset form
    e.target.reset();

    // Show success message
    btn.innerHTML = isArabic
      ? '<i class="fas fa-check"></i> تم الإرسال بنجاح!'
      : '<i class="fas fa-check"></i> Message Sent Successfully!';
    btn.style.background = "linear-gradient(45deg, #28a745, #20c997)";

    // Reset button after 3 seconds
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = "linear-gradient(45deg, #ff6b6b, #dc2626)";
      btn.disabled = false;
    }, 3000);
  }, 1500);
}

// Enhanced GSAP Animations - No loading screen needed
function initLightAnimations() {
  // Enhanced Hero Section Animation with mobile-first profile - immediately visible
  const heroTimeline = gsap.timeline();

  // Mobile: Profile image appears first
  if (window.innerWidth <= 992) {
    heroTimeline
      .fromTo(
        ".hero-right.mobile-first",
        {
          opacity: 0,
          y: 50,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "back.out(1.7)",
        }
      )
      .fromTo(
        ".hero-left",
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
        },
        "-=0.5"
      );
  } else {
    // Desktop: Standard layout
    heroTimeline
      .fromTo(
        ".hero-left",
        {
          opacity: 0,
          x: -50,
        },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: "power3.out",
        }
      )
      .fromTo(
        ".hero-right.desktop-only",
        {
          opacity: 0,
          x: 50,
        },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: "power3.out",
        },
        "-=0.8"
      );
  }

  // Enhanced Stats Animation
  ScrollTrigger.create({
    trigger: ".stats-section",
    start: "top 85%",
    onEnter: () => {
      gsap.fromTo(
        ".stat-card",
        {
          opacity: 0,
          y: 50,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
        }
      );

      // Enhanced counter animation
      document.querySelectorAll(".counter").forEach((counter) => {
        const target = parseInt(counter.getAttribute("data-target"));
        animateCounter(counter, target, 2500);
      });
    },
  });

  // Enhanced Platforms Animation
  ScrollTrigger.create({
    trigger: ".platforms-section",
    start: "top 85%",
    onEnter: () => {
      gsap.fromTo(
        ".platforms-section .section-title",
        { opacity: 0, y: 40, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" }
      );

      gsap.fromTo(
        ".platform-card",
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.3,
        }
      );
    },
  });

  // Enhanced Contact Section Animation with RTL support
  ScrollTrigger.create({
    trigger: ".contact-section",
    start: "top 85%",
    onEnter: () => {
      const isRTL = document.body.getAttribute("dir") === "rtl";
      const isMobile = window.innerWidth <= 992;

      if (isMobile) {
        // Mobile: Content first, then form
        gsap.fromTo(
          ".contact-info-side",
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          }
        );

        gsap.fromTo(
          ".contact-form-side",
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.3,
            ease: "power3.out",
          }
        );
      } else {
        // Desktop: Side by side
        if (isRTL) {
          // RTL: Form left, content right
          gsap.fromTo(
            ".contact-form-side",
            {
              opacity: 0,
              x: -30,
            },
            {
              opacity: 1,
              x: 0,
              duration: 1,
              ease: "power3.out",
            }
          );

          gsap.fromTo(
            ".contact-info-side",
            {
              opacity: 0,
              x: 30,
            },
            {
              opacity: 1,
              x: 0,
              duration: 1,
              delay: 0.3,
              ease: "power3.out",
            }
          );
        } else {
          // LTR: Content left, form right
          gsap.fromTo(
            ".contact-info-side",
            {
              opacity: 0,
              x: -30,
            },
            {
              opacity: 1,
              x: 0,
              duration: 1,
              ease: "power3.out",
            }
          );

          gsap.fromTo(
            ".contact-form-side",
            {
              opacity: 0,
              x: 30,
            },
            {
              opacity: 1,
              x: 0,
              duration: 1,
              delay: 0.3,
              ease: "power3.out",
            }
          );
        }
      }
    },
  });

  // Enhanced social links animation
  gsap.to(".social-link", {
    y: -4,
    duration: 2.5,
    repeat: -1,
    yoyo: true,
    ease: "power2.inOut",
    stagger: 0.15,
  });
}

// Smooth Scroll for Navigation
function smoothScrollTo(target) {
  const element = document.querySelector(target);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// Resize Handler
function handleResize() {
  if (renderer && camera) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  ScrollTrigger.refresh();

  // Update all portfolio sliders on resize
  if (typeof portfolioSwipers !== "undefined") {
    Object.values(portfolioSwipers).forEach((swiper) => {
      if (swiper) {
        swiper.update();
      }
    });
  }
}

// Enhanced Touch Improvements
function initTouchImprovements() {
  // Add touch support for interactive elements
  const touchElements = document.querySelectorAll(
    ".gallery-card, .platform-card, .stat-card, .social-link, .contact-item, .tab-button"
  );

  touchElements.forEach((element) => {
    element.addEventListener("touchstart", function () {
      this.style.transform = "scale(0.95)";
    });

    element.addEventListener("touchend", function () {
      this.style.transform = "";
    });
  });

  // Improve form usability on mobile
  const formInputs = document.querySelectorAll("input, textarea");
  formInputs.forEach((input) => {
    input.addEventListener("focus", function () {
      // Scroll into view with offset for mobile keyboards
      setTimeout(() => {
        this.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    });
  });
}

// Enhanced Mobile Menu and Optimizations
function initMobileEnhancements() {
  // Optimize animations for mobile
  if (window.innerWidth <= 768) {
    // Speed up animations on mobile
    gsap.globalTimeline.timeScale(1.3);

    // Disable some heavy animations on mobile
    if (renderer) {
      renderer.setPixelRatio(1); // Reduce quality for better performance
    }
  }
}

// Performance optimization for scroll
let ticking = false;

function updateScrollAnimations() {
  // Only run 3D animation in hero section
  const heroSection = document.querySelector(".hero-section");
  if (heroSection) {
    const heroRect = heroSection.getBoundingClientRect();

    if (heroRect.bottom < 0) {
      // Stop 3D animation when hero is out of view
      if (renderer) {
        renderer.setAnimationLoop(null);
      }
    } else if (heroRect.top < window.innerHeight) {
      // Resume 3D animation when hero is in view
      if (renderer && !renderer.info.render.frame) {
        renderer.setAnimationLoop(animate3D);
      }
    }
  }

  ticking = false;
}

function requestScrollUpdate() {
  if (!ticking) {
    requestAnimationFrame(updateScrollAnimations);
    ticking = true;
  }
}

// Initialize Everything - NO loading screen
document.addEventListener("DOMContentLoaded", function () {
  // Initialize language first (always English - no localStorage)
  initializeLanguage();

  // Initialize Snake Cursor
  initSnakeCursor();

  // Initialize 3D Background only for hero section
  init3DBackground();

  // Initialize animations immediately (no loading screen)
  initLightAnimations();

  // Initialize Portfolio Tabs and Sliders
  initPortfolioTabs();
  initAllGallerySliders();

  // Initialize Touch Improvements
  initTouchImprovements();

  // Initialize Mobile Enhancements
  initMobileEnhancements();

  // Language Toggle Event
  document
    .getElementById("langToggle")
    .addEventListener("click", toggleLanguage);

  // Form Submission
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", handleFormSubmit);
  }

  // Window Events
  window.addEventListener("resize", handleResize);
  window.addEventListener("scroll", requestScrollUpdate);

  // Keyboard Navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeGalleryModal();
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = this.getAttribute("href");
      smoothScrollTo(target);
    });
  });

  // Add stagger animation to contact form fields
  ScrollTrigger.create({
    trigger: ".contact-form",
    start: "top 80%",
    onEnter: () => {
      gsap.fromTo(
        ".form-group",
        { opacity: 0, y: 20, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
        }
      );
    },
  });

  // Add magnetic effect to buttons (only on desktop)
  if (window.innerWidth > 768) {
    document
      .querySelectorAll(".submit-btn, .social-link, .tab-button")
      .forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;

          gsap.to(btn, {
            x: x * 0.1,
            y: y * 0.1,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        btn.addEventListener("mouseleave", () => {
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });
  }

  console.log(
    "Enhanced Portfolio with Auto-Loop Tabs initialized successfully!"
  );
});

// Performance optimizations on load
window.addEventListener("load", function () {
  // Preload gallery images for all tabs - Updated with new images
  const imageUrls = [
    // WordPress images (8 images)
    "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&h=400&fit=crop",
    // Salla images (8 images)
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1556909114-5ba7fbe78aca?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop",
    // Zid images (8 images)
    "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=400&fit=crop",
    // OpenCart images (8 images) - all already included above
  ];

  imageUrls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });

  // Optimize animations after load
  gsap.set(
    [
      ".hero-left",
      ".hero-right",
      ".stat-card",
      ".platform-card",
      ".contact-info-side",
      ".contact-form-side",
      ".gallery-card",
      ".tab-button",
    ],
    {
      willChange: "transform, opacity",
    }
  );

  // Force autoplay start after all images are loaded
  setTimeout(() => {
    const wordpressSwiper = portfolioSwipers["wordpress"];
    if (wordpressSwiper && !wordpressSwiper.autoplay.running) {
      wordpressSwiper.autoplay.start();
      console.log("WordPress slider autoplay forced start after page load");
    }
  }, 1000);
});

// Error handling for images
document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("error", function () {
    this.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=";
  });
});

// Add focus management for accessibility
document.addEventListener("keydown", function (e) {
  if (e.key === "Tab") {
    document.body.classList.add("keyboard-nav");
  }
});

document.addEventListener("mousedown", function () {
  document.body.classList.remove("keyboard-nav");
});

// Intersection Observer for better performance
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
    }
  });
}, observerOptions);

// Observe elements for animation
document.addEventListener("DOMContentLoaded", () => {
  const elementsToObserve = document.querySelectorAll(
    ".stat-card, .platform-card, .gallery-card, .contact-info-side, .contact-form-side, .tab-button"
  );

  elementsToObserve.forEach((el) => observer.observe(el));
});

// Add CSS for gallery modal if not already present
const galleryModalCSS = `
.gallery-modal {
  display: none;
  position: fixed;
  z-index: 2000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.gallery-modal .modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
}

.gallery-modal .modal-content {
  position: relative;
  margin: 2% auto;
  padding: 20px;
  width: 95%;
  max-width: 1000px;
  text-align: center;
  z-index: 2001;
}

.gallery-modal .modal-image {
  width: 100%;
  height: auto;
  max-height: 80vh;
  border-radius: 20px;
  box-shadow: 0 30px 60px rgba(255, 107, 107, 0.3);
  object-fit: contain;
}

.gallery-modal .close-modal {
  position: absolute;
  top: 15px;
  right: 25px;
  width: 50px;
  height: 50px;
  background: rgba(255, 107, 107, 0.2);
  border: 2px solid #ff6b6b;
  border-radius: 50%;
  color: #ff6b6b;
  font-size: 20px;
  cursor: pointer;
  z-index: 2002;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-modal .close-modal:hover {
  background: #ff6b6b;
  color: white;
  transform: scale(1.1);
}

.gallery-modal .modal-title {
  color: #ff6b6b;
  font-size: clamp(1.3rem, 3vw, 1.8rem);
  font-weight: 600;
  margin-top: 25px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

@media (max-width: 768px) {
  .gallery-modal .modal-content {
    margin: 5% auto;
    padding: 15px;
    width: 98%;
  }
  
  .gallery-modal .close-modal {
    width: 40px;
    height: 40px;
    font-size: 16px;
    top: 10px;
    right: 15px;
  }
}
`;

// Inject gallery modal CSS if not already present
if (!document.querySelector("#gallery-modal-styles")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "gallery-modal-styles";
  styleSheet.textContent = galleryModalCSS;
  document.head.appendChild(styleSheet);
}

// Auto-restart all swipers every 3 seconds to ensure continuous 3000ms loop
setInterval(() => {
  if (typeof portfolioSwipers !== "undefined") {
    Object.values(portfolioSwipers).forEach((swiper) => {
      if (swiper && swiper.autoplay) {
        // Force restart autoplay if it's not running
        if (!swiper.autoplay.running) {
          swiper.autoplay.start();
        }
        // Ensure delay is exactly 3000ms
        if (swiper.autoplay.delay !== 3000) {
          swiper.autoplay.stop();
          swiper.autoplay.delay = 3000;
          swiper.autoplay.start();
        }
      }
    });
  }
}, 3000); // Check every 3 seconds

// Export functions for global access
window.portfolioFunctions = {
  toggleLanguage,
  openGalleryModal,
  closeGalleryModal,
  smoothScrollTo,
  initAllGallerySliders,
  portfolioSwipers,
};
