document.addEventListener('DOMContentLoaded', () => {
    // Variables
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileDropdownBtns = document.querySelectorAll('.mobile-dropdown-btn');
    const body = document.body;

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    document.body.appendChild(overlay);

    // Toggle menú móvil
    mobileMenuBtn.addEventListener('click', () => {
        const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        mobileMenuBtn.classList.toggle('active');
        mobileNav.classList.toggle('active');
        overlay.classList.toggle('active');
        body.style.overflow = isExpanded ? '' : 'hidden';
    });

    // Cerrar menú al hacer click en el overlay
    overlay.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        overlay.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
    });

    // Toggle dropdowns móviles con animación
    mobileDropdownBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', !isExpanded);
            const dropdownContent = btn.nextElementSibling;
            
            if (!isExpanded) {
                dropdownContent.style.display = 'block';
                dropdownContent.style.maxHeight = '0';
                dropdownContent.classList.add('active');
                requestAnimationFrame(() => {
                    dropdownContent.style.maxHeight = dropdownContent.scrollHeight + 'px';
                });
            } else {
                dropdownContent.style.maxHeight = '0';
                dropdownContent.addEventListener('transitionend', function handler() {
                    if (dropdownContent.style.maxHeight === '0px') {
                        dropdownContent.classList.remove('active');
                        dropdownContent.style.display = '';
                        dropdownContent.style.maxHeight = '';
                        dropdownContent.removeEventListener('transitionend', handler);
                    }
                });
            }
            
            // Rotar el ícono suavemente
            const icon = btn.querySelector('.fa-chevron-down');
            icon.style.transform = isExpanded ? 'rotate(0)' : 'rotate(180deg)';
            icon.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        });
    });

    // Cerrar menú móvil al hacer click en un enlace
    const mobileLinks = document.querySelectorAll('.mobile-nav a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
        });
    });

    // Inicializar Google Maps
    function initMap() {
        // Coordenadas de ejemplo (actualizar con las coordenadas reales)
        const sede = { lat: 40.416775, lng: -3.703790 };
        const map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: sede,
            styles: [
                {
                    "featureType": "all",
                    "elementType": "geometry",
                    "stylers": [{"saturation": "-30"}]
                }
            ]
        });
        
        const marker = new google.maps.Marker({
            position: sede,
            map: map,
            title: 'Sede Proyecto Dubini'
        });
    }

    // Cargar Google Maps de forma asíncrona
    function loadGoogleMaps() {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=TU_API_KEY&callback=initMap`;
        script.async = true;
        script.defer = true;
        window.initMap = initMap;
        document.head.appendChild(script);
    }

    // Observador de intersección para animaciones
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeIn');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // Observar elementos para animaciones
    document.querySelectorAll('.footer-section').forEach(section => {
        observer.observe(section);
    });

    // Inicializar slider de héroe
    function initHeroSlider() {
        const slides = document.querySelectorAll('.hero-slide');
        let currentSlide = 0;
        
        // Activar primera imagen
        slides[0].classList.add('active');
        
        // Cambiar imagen cada 5 segundos
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // Llamar a la función de inicialización del slider
    initHeroSlider();
});
