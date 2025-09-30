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

    // Inicializar slider de actividades
    function initActivitySlider() {
        const sliderTrack = document.querySelector('.slider-track');
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.slider-dot');
        let currentSlide = 0;
        const totalSlides = slides.length;

        // Variables para el deslizamiento
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID = 0;
        let dragStartX = 0;

        // Prevenir el comportamiento por defecto de las imágenes
        slides.forEach(slide => {
            slide.addEventListener('dragstart', e => e.preventDefault());
        });

        // Touch events
        sliderTrack.addEventListener('touchstart', touchStart);
        sliderTrack.addEventListener('touchmove', touchMove);
        sliderTrack.addEventListener('touchend', touchEnd);

        // Mouse events
        sliderTrack.addEventListener('mousedown', touchStart);
        sliderTrack.addEventListener('mousemove', touchMove);
        sliderTrack.addEventListener('mouseup', touchEnd);
        sliderTrack.addEventListener('mouseleave', touchEnd);

        function touchStart(event) {
            isDragging = true;
            startPos = getPositionX(event);
            dragStartX = startPos;
            
            // Detener la animación automática mientras se arrastra
            cancelAnimationFrame(animationID);
            
            // Cambiar el cursor
            sliderTrack.style.cursor = 'grabbing';
        }

        function touchMove(event) {
            if (!isDragging) return;
            
            const currentPosition = getPositionX(event);
            const diff = currentPosition - startPos;
            const walk = currentPosition - dragStartX;
            
            // Actualizar la posición del slider
            currentTranslate = prevTranslate + walk;
            setSliderPosition();
        }

        function touchEnd() {
            isDragging = false;
            const movedBy = currentTranslate - prevTranslate;
            
            // Determinar si el usuario ha deslizado lo suficiente para cambiar de slide
            if (Math.abs(movedBy) > 100) {
                if (movedBy < 0 && currentSlide < totalSlides - 1) {
                    currentSlide++;
                } else if (movedBy > 0 && currentSlide > 0) {
                    currentSlide--;
                }
            }
            
            goToSlide(currentSlide);
            sliderTrack.style.cursor = 'grab';
        }

        function getPositionX(event) {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        }

        function setSliderPosition() {
            sliderTrack.style.transform = `translateX(${currentTranslate}px)`;
        }

        function goToSlide(index) {
            currentSlide = index;
            const offset = -index * 100;
            sliderTrack.style.transform = `translateX(${offset}%)`;
            prevTranslate = offset * sliderTrack.offsetWidth / 100;
            currentTranslate = prevTranslate;
            
            // Actualizar dots
            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentSlide].classList.add('active');
        }

        // Auto avance (solo cuando no se está interactuando)
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

        // Iniciar auto-slide
        startAutoSlide();

        // Event listeners para los dots (mantenemos esta funcionalidad como respaldo)
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                stopAutoSlide();
                goToSlide(index);
                startAutoSlide();
            });
        });
    }
    
    // Llamar a la función de inicialización del slider de actividades
    initActivitySlider();
});
// Añadir al script.js
document.querySelectorAll('.program-card').forEach(card => {
    let timeoutId;
    
    card.addEventListener('click', (e) => {
        // Verificar si el click fue en el enlace "saber más"
        if (e.target.classList.contains('learn-more')) {
            // Si es el enlace, no ejecutar la animación
            return;
        }

        // Limpiar timeout anterior si existe
        if (timeoutId) clearTimeout(timeoutId);

        // Añadir delay para la animación
        timeoutId = setTimeout(() => {
            const randomRotation = Math.random() < 0.5 ? -3 : 3;
            card.style.transform = `scale(1.1) rotate(${randomRotation}deg)`;
            
            // Volver al estado original después de 500ms
            setTimeout(() => {
                card.style.transform = '';
            }, 500);
        }, 50); // 50ms de delay para permitir el click en el enlace
    });
});