if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Service Worker registrado con éxito:', reg);
      })
      .catch(err => {
        console.error('Error al registrar el Service Worker:', err);
      });
  });
}




document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const mobileNav = document.querySelector(".mobile-nav");
  const mobileDropdownBtns = document.querySelectorAll(".mobile-dropdown-btn");
  const body = document.body;

  const overlay = document.createElement("div");
  overlay.className = "mobile-nav-overlay";
  document.body.appendChild(overlay);

  mobileMenuBtn.addEventListener("click", () => {
    const isExpanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";
    mobileMenuBtn.setAttribute("aria-expanded", !isExpanded);
    mobileMenuBtn.classList.toggle("active");
    mobileNav.classList.toggle("active");
    overlay.classList.toggle("active");
    body.style.overflow = isExpanded ? "" : "hidden";
  });

  overlay.addEventListener("click", () => {
    mobileNav.classList.remove("active");
    mobileMenuBtn.classList.remove("active");
    overlay.classList.remove("active");
    mobileMenuBtn.setAttribute("aria-expanded", "false");
    body.style.overflow = "";
  });

  mobileDropdownBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isExpanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", !isExpanded);
      const dropdownContent = btn.nextElementSibling;

      if (!isExpanded) {
        dropdownContent.style.display = "block";
        dropdownContent.style.maxHeight = "0";
        dropdownContent.classList.add("active");
        requestAnimationFrame(() => {
          dropdownContent.style.maxHeight = dropdownContent.scrollHeight + "px";
        });
      } else {
        dropdownContent.style.maxHeight = "0";
        dropdownContent.addEventListener("transitionend", function handler() {
          if (dropdownContent.style.maxHeight === "0px") {
            dropdownContent.classList.remove("active");
            dropdownContent.style.display = "";
            dropdownContent.style.maxHeight = "";
            dropdownContent.removeEventListener("transitionend", handler);
          }
        });
      }

      const icon = btn.querySelector(".fa-chevron-down");
      icon.style.transform = isExpanded ? "rotate(0)" : "rotate(180deg)";
      icon.style.transition =
        "transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
    });
  });

  const mobileLinks = document.querySelectorAll(".mobile-nav a");
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("active");
      mobileMenuBtn.classList.remove("active");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
      body.style.overflow = "";
    });
  });

  // FIN MENU MOVIL

  // GOOGLE MAPS
 /* function initMap() {
    const sede = { lat: 40.416775, lng: -3.70379 };
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 15,
      center: sede,
      styles: [
        {
          featureType: "all",
          elementType: "geometry",
          stylers: [{ saturation: "-30" }],
        },
      ],
    });

    const marker = new google.maps.Marker({
      position: sede,
      map: map,
      title: "Sede Proyecto Dubini",
    });
  }
  function loadGoogleMaps() {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=TU_API_KEY&callback=initMap`;
    script.async = true;
    script.defer = true;
    window.initMap = initMap;
    document.head.appendChild(script);
  }

  loadGoogleMaps();
*/

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fadeIn");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  document.querySelectorAll(".footer-section").forEach((section) => {
    observer.observe(section);
  });

  function initHeroSlider() {
    const slides = document.querySelectorAll(".hero-slide");
    let currentSlide = 0;

    slides[0].classList.add("active");

    setInterval(() => {
      slides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add("active");
    }, 5000);
  }

  initHeroSlider();

  function initActivitySlider() {
    const sliderTrack = document.querySelector(".slider-track");
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".slider-dot");
    let currentSlide = 0;
    const totalSlides = slides.length;

    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    let dragStartX = 0;
    slides.forEach((slide) => {
      slide.addEventListener("dragstart", (e) => e.preventDefault());
    });

    sliderTrack.addEventListener("touchstart", touchStart);
    sliderTrack.addEventListener("touchmove", touchMove);
    sliderTrack.addEventListener("touchend", touchEnd);

    sliderTrack.addEventListener("mousedown", touchStart);
    sliderTrack.addEventListener("mousemove", touchMove);
    sliderTrack.addEventListener("mouseup", touchEnd);
    sliderTrack.addEventListener("mouseleave", touchEnd);

    function touchStart(event) {
      isDragging = true;
      startPos = getPositionX(event);
      dragStartX = startPos;

      cancelAnimationFrame(animationID);

      sliderTrack.style.cursor = "grabbing";
    }

    function touchMove(event) {
      if (!isDragging) return;

      const currentPosition = getPositionX(event);
      const diff = currentPosition - startPos;
      const walk = currentPosition - dragStartX;

      currentTranslate = prevTranslate + walk;
      setSliderPosition();
    }

    function touchEnd() {
      isDragging = false;
      const movedBy = currentTranslate - prevTranslate;

      if (Math.abs(movedBy) > 100) {
        if (movedBy < 0 && currentSlide < totalSlides - 1) {
          currentSlide++;
        } else if (movedBy > 0 && currentSlide > 0) {
          currentSlide--;
        }
      }

      goToSlide(currentSlide);
      sliderTrack.style.cursor = "grab";
    }

    function getPositionX(event) {
      return event.type.includes("mouse")
        ? event.pageX
        : event.touches[0].clientX;
    }

    function setSliderPosition() {
      sliderTrack.style.transform = `translateX(${currentTranslate}px)`;
    }

    function goToSlide(index) {
      currentSlide = index;
      const offset = -index * 100;
      sliderTrack.style.transform = `translateX(${offset}%)`;
      prevTranslate = (offset * sliderTrack.offsetWidth) / 100;
      currentTranslate = prevTranslate;

      dots.forEach((dot) => dot.classList.remove("active"));
      dots[currentSlide].classList.add("active");
    }

    let autoSlideInterval;

    function startAutoSlide() {
      autoSlideInterval = setInterval(() => {
        if (!isDragging) {
          currentSlide = (currentSlide + 1) % totalSlides;
          goToSlide(currentSlide);
        }
      }, 10000);
    }

    function stopAutoSlide() {
      clearInterval(autoSlideInterval);
    }

    startAutoSlide();

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        stopAutoSlide();
        goToSlide(index);
        startAutoSlide();
      });
    });
  }

  initActivitySlider();
});

document.querySelectorAll(".program-card").forEach((card) => {
  let timeoutId;

  card.addEventListener("click", (e) => {
    if (e.target.classList.contains("learn-more")) {
      return;
    }

    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      const randomRotation = Math.random() < 0.5 ? -3 : 3;
      card.style.transform = `scale(1.1) rotate(${randomRotation}deg)`;

      setTimeout(() => {
        card.style.transform = "";
      }, 500);
    }, 50);
  });
});
