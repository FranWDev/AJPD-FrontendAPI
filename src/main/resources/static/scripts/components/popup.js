export function sanitizeTitle(title) {
    return title.toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

// Función para abrir popup
export function openPopup(titleId) {
    const overlay = document.getElementById(`overlay-${titleId}`);
    if (overlay) {
        overlay.style.display = 'flex'; // Añadir esta línea
        overlay.classList.remove('hide');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Función para cerrar popup
export function closePopup(overlay) {
    overlay.classList.remove('show');
    overlay.classList.add('hide');
    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.classList.remove('hide');
        document.body.style.overflow = '';
    }, 300);
}

export function initializePopups() {
    document.querySelectorAll('.read-more').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const titleId = this.id;
            openPopup(titleId);
        });
    });

    document.querySelectorAll('.popup-content > div:first-child button').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const overlay = this.closest('.popup-overlay');
            closePopup(overlay);
        });
    });

    document.querySelectorAll('.popup-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closePopup(this);
            }
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openOverlay = document.querySelector('.popup-overlay.show');
            if (openOverlay) {
                closePopup(openOverlay);
            }
        }
    });
}