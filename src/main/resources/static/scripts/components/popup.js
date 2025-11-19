export function sanitizeTitle(title) {
  return title.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function closePopup(overlay) {
  if (!overlay) return;

  // IMPORTANTE: Remover show Y añadir hide simultáneamente
  overlay.classList.remove('show');
  overlay.classList.add('hide');

  // Escuchar el fin de la animación
  const handleAnimationEnd = (e) => {
    // Solo actuar si la animación es del overlay mismo, no de sus hijos
    if (e.target === overlay) {
      overlay.style.display = 'none';
      overlay.classList.remove('hide');
      document.body.style.overflow = '';
      overlay.removeEventListener('animationend', handleAnimationEnd);
    }
  };

  overlay.addEventListener('animationend', handleAnimationEnd);
}

export function openPopup(titleId) {
  const overlay = document.getElementById(`overlay-${titleId}`);
  if (!overlay) return;

  // Limpiar cualquier estado previo
  overlay.classList.remove('hide');
  overlay.style.display = 'flex';
  
  // Forzar reflow
  void overlay.offsetWidth;

  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

export function initializePopups() {
  document.querySelectorAll('.read-more').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      openPopup(this.id);
    });
  });

  document.querySelectorAll('.popup-content > div:first-child button').forEach(closeBtn => {
    closeBtn.addEventListener('click', function () {
      const overlay = this.closest('.popup-overlay');
      closePopup(overlay);
    });
  });

  document.querySelectorAll('.popup-overlay').forEach(overlay => {
    overlay.addEventListener('click', function (e) {
      if (e.target === this) closePopup(this);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const openOverlay = document.querySelector('.popup-overlay.show');
      if (openOverlay) closePopup(openOverlay);
    }
  });
}
