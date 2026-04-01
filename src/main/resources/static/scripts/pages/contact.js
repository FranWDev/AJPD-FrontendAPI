document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');

    // Configuración del Rate Limit (1 hora)
    const RATE_LIMIT_MS = 60 * 60 * 1000;
    const STORAGE_KEY = 'ajpd_contact_last_submission';

    // Verificar si el usuario está bajo rate limit al cargar
    checkRateLimit();

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (isUnderRateLimit()) {
            showStatus('Ya has enviado un mensaje recientemente. Por favor, espera un poco.', 'error');
            return;
        }

        const formData = new FormData(contactForm);
        const data = {
            nombre: formData.get('nombre'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            asunto: formData.get('asunto'),
            mensaje: formData.get('mensaje')
        };

        setLoading(true);

        try {
            const response = await fetch('/api/contacto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showStatus(result.message || '¡Mensaje enviado con éxito!', 'success');
                recordSubmission();
                
                // Ocultar solo el formulario después de un breve retraso
                setTimeout(() => {
                    contactForm.style.display = 'none';
                    // Desplazar al mensaje de éxito que ahora está fuera del form
                    formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            } else {
                showStatus(result.message || 'Error al enviar el mensaje.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showStatus('Error de conexión. Inténtalo de nuevo más tarde.', 'error');
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.querySelector('span').textContent = 'Enviando...';
            submitBtn.querySelector('i').className = 'fas fa-spinner fa-spin';
        } else {
            if (!isUnderRateLimit()) {
                submitBtn.disabled = false;
                submitBtn.querySelector('span').textContent = 'Enviar Mensaje';
                submitBtn.querySelector('i').className = 'fas fa-paper-plane';
            }
        }
    }

    function showStatus(message, type) {
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
        
        // Limpiar mensaje después de 10 segundos si es éxito
        if (type === 'success') {
            setTimeout(() => {
                formStatus.textContent = '';
                formStatus.className = 'form-status';
            }, 10000);
        }
    }

    function recordSubmission() {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }

    function isUnderRateLimit() {
        const lastSubmission = localStorage.getItem(STORAGE_KEY);
        if (!lastSubmission) return false;

        const elapsed = Date.now() - parseInt(lastSubmission);
        return elapsed < RATE_LIMIT_MS;
    }

    function checkRateLimit() {
        if (isUnderRateLimit()) {
            const lastSubmission = parseInt(localStorage.getItem(STORAGE_KEY));
            const remaining = RATE_LIMIT_MS - (Date.now() - lastSubmission);
            const minutesRemaining = Math.ceil(remaining / (60 * 1000));

            // Siguiendo el requisito de ocultar el formulario también en este estado
            contactForm.style.display = 'none';
            showStatus(`Ya hemos recibido tu mensaje. Podrás enviar otro en aproximadamente ${minutesRemaining} minutos.`, 'success');
        }
    }
});
