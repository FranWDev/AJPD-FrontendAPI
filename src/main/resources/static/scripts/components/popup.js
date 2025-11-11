export function sanitizeTitle(title) {
  return title.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function closePopup(overlay) {
  if (!overlay) return;

  overlay.classList.remove('show');
  overlay.classList.add('hide');

  const handleAnimationEnd = (e) => {
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

  overlay.classList.remove('hide');
  overlay.style.display = 'flex';

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
