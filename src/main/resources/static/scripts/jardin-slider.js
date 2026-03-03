/**
 * Slider del Jardín Botánico con soporte táctil completo
 */
(function () {
  const slider = document.querySelector('.jardin-slider');
  if (!slider) return;

  const track = slider.querySelector('.slider-track');
  const slides = Array.from(slider.querySelectorAll('.slider-item'));
  const prevBtn = slider.querySelector('.slider-btn--prev');
  const nextBtn = slider.querySelector('.slider-btn--next');
  const dotsContainer = slider.querySelector('.slider-dots');

  let currentIndex = 0;
  let autoplayInterval = null;
  let isTransitioning = false;

  // Touch/Swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;
  let isDragging = false;

  // Crear indicadores de puntos
  function createDots() {
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('slider-dot');
      dot.setAttribute('aria-label', `Ir a imagen ${index + 1}`);
      if (index === 0) dot.classList.add('active');

      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });
  }

  // Actualizar indicadores
  function updateDots() {
    const dots = dotsContainer.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  // Ir a slide específico
  function goToSlide(index) {
    if (isTransitioning) return;
    isTransitioning = true;

    // Remover active de todos
    slides.forEach(slide => slide.classList.remove('active'));

    currentIndex = index;
    const offset = -currentIndex * 100;
    track.style.transform = `translateX(${offset}%)`;

    // Activar el slide actual
    slides[currentIndex].classList.add('active');
    updateDots();

    setTimeout(() => {
      isTransitioning = false;
    }, 450);
  }

  // Siguiente slide
  function nextSlide() {
    const nextIndex = (currentIndex + 1) % slides.length;
    goToSlide(nextIndex);
  }

  // Anterior slide
  function prevSlide() {
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    goToSlide(prevIndex);
  }

  // Touch events para swipe
  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging = true;
    stopAutoplay();
  }

  function handleTouchMove(e) {
    if (!isDragging) return;

    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;

    // Calcular diferencia
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Si el movimiento es más horizontal que vertical, prevenir scroll
    if (Math.abs(diffX) > Math.abs(diffY)) {
      e.preventDefault();
    }
  }

  function handleTouchEnd() {
    if (!isDragging) return;
    isDragging = false;

    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Mínimo 50px de swipe y más horizontal que vertical
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        // Swipe left (next)
        nextSlide();
      } else {
        // Swipe right (prev)
        prevSlide();
      }
    }

    // Reset
    touchStartX = 0;
    touchEndX = 0;
    touchStartY = 0;
    touchEndY = 0;

    startAutoplay();
  }

  // Autoplay
  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  // Keyboard navigation
  function handleKeydown(e) {
    if (e.key === 'ArrowLeft') {
      prevSlide();
      stopAutoplay();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
      stopAutoplay();
    }
  }

  // Event listeners
  prevBtn.addEventListener('click', () => {
    prevSlide();
    stopAutoplay();
  });

  nextBtn.addEventListener('click', () => {
    nextSlide();
    stopAutoplay();
  });

  // Touch events
  const sliderContainer = slider.querySelector('.slider-container');
  sliderContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
  sliderContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
  sliderContainer.addEventListener('touchend', handleTouchEnd);

  // Mouse events para desktop (opcional)
  sliderContainer.addEventListener('mouseenter', stopAutoplay);
  sliderContainer.addEventListener('mouseleave', startAutoplay);

  // Keyboard
  document.addEventListener('keydown', handleKeydown);

  // Inicializar
  createDots();
  startAutoplay();

  // Pausar autoplay cuando la pestaña no está visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });
})();
