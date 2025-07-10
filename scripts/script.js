// ======================================
// JAVASCRIPT PRINCIPAL - JAVIER MILLÁN
// ======================================

// Configuración global
const CONFIG = {
    navbar: {
        scrollThreshold: 50,
        blurIntense: 'blur(20px)',
        blurNormal: 'blur(8px)',
        blurNone: 'blur(0px)'
    },
    animations: {
        scrollOffset: -100,
        intersectionThreshold: 0.1,
        intersectionRootMargin: '0px 0px -50px 0px'
    }
};

// ======================================
// NAVBAR EFFECTS
// ======================================

function initNavbarEffects() {
    const navbar = document.getElementById('navbar-container');
    if (!navbar) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > CONFIG.navbar.scrollThreshold) {
            //navbar.style.backdropFilter = CONFIG.navbar.blurIntense;
            //navbar.style.background = 'rgba(0, 0, 0, 0.8)';
        } else {
            //navbar.style.backdropFilter = CONFIG.navbar.blurNormal;
            navbar.style.background = 'transparent';
        }
    });
}

// ======================================
// MOBILE MENU
// ======================================

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenuBtn || !mobileMenu) return;

    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
        
        // Cambiar icono del botón
        const icon = mobileMenuBtn.querySelector('svg');
        if (icon) {
            if (mobileMenu.classList.contains('hidden')) {
                // Icono de hamburger
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
            } else {
                // Icono de X
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
            }
        }
    });
}

// ======================================
// SMOOTH SCROLL
// ======================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop + CONFIG.animations.scrollOffset;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Cerrar menú móvil si está abierto
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    
                    // Resetear icono del botón
                    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
                    const icon = mobileMenuBtn?.querySelector('svg');
                    if (icon) {
                        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
                    }
                }
            }
        });
    });
}

// ======================================
// CONTACT FORM
// ======================================

function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener datos del formulario
        const formData = new FormData(this);
        const name = this.querySelector('input[type="text"]')?.value;
        const email = this.querySelector('input[type="email"]')?.value;
        const message = this.querySelector('textarea')?.value;
        
        // Validación básica
        if (!name || !email || !message) {
            showNotification('Por favor, completa todos los campos.', 'error');
            return;
        }
        
        // Validar email
        if (!isValidEmail(email)) {
            showNotification('Por favor, ingresa un email válido.', 'error');
            return;
        }
        
        // Simular envío exitoso
        showNotification('¡Gracias por tu mensaje! Te contactaré pronto.', 'success');
        
        // Resetear formulario
        this.reset();
    });
}

// ======================================
// INTERSECTION OBSERVER ANIMATIONS
// ======================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: CONFIG.animations.intersectionThreshold,
        rootMargin: CONFIG.animations.intersectionRootMargin
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar todas las secciones
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// ======================================
// GLASS BUTTON EFFECTS
// ======================================

function initGlassButtonEffects() {
    document.querySelectorAll('.glass-button').forEach(button => {
        button.addEventListener('click', function(e) {
            // Crear efecto ripple
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                z-index: 1;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// ======================================
// UTILIDADES
// ======================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    // Estilos según el tipo
    const styles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    
    notification.className += ` ${styles[type] || styles.info}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(full)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ======================================
// EFECTOS DE URGENCIA (PARA PÁGINAS DE VENTAS)
// ======================================

function initUrgencyEffects() {
    const urgencyElements = document.querySelectorAll('.urgency-text');
    if (urgencyElements.length === 0) return;

    function updateUrgency() {
        urgencyElements.forEach(el => {
            el.style.opacity = el.style.opacity === '0.5' ? '1' : '0.5';
        });
    }
    
    setInterval(updateUrgency, 2000);
}

// ======================================
// FAQ ACCORDION (PARA PÁGINAS DE VENTAS)
// ======================================

function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');
                
                // Cerrar todos los otros items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('open');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherAnswer) {
                        otherAnswer.style.maxHeight = '0';
                    }
                });
                
                // Toggle el item actual
                if (!isOpen) {
                    item.classList.add('open');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        }
    });
}

// ======================================
// CONTADOR REGRESIVO (PARA PÁGINAS DE VENTAS)
// ======================================

function initCountdown(targetDate) {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            countdownElement.innerHTML = "¡Oferta expirada!";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Ejecutar inmediatamente
    
    return interval;
}

// ======================================
// TRACKING DE EVENTOS (OPCIONAL)
// ======================================

function trackEvent(eventName, eventData = {}) {
    // Aquí puedes integrar Google Analytics, Facebook Pixel, etc.
    console.log('Event tracked:', eventName, eventData);
    
    // Ejemplo para Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    // Ejemplo para Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, eventData);
    }
}

// ======================================
// INICIALIZACIÓN
// ======================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todas las funcionalidades
    initNavbarEffects();
    initMobileMenu();
    initSmoothScroll();
    initContactForm();
    initScrollAnimations();
    initGlassButtonEffects();
    initUrgencyEffects();
    initFAQAccordion();
    
    // Agregar animación de entrada a los elementos glass
    setTimeout(() => {
        document.querySelectorAll('.glass-container').forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
            el.classList.add('fade-in-up');
        });
    }, 100);
    
    console.log('🚀 JavaScript de Javier Millán cargado correctamente');
});

// ======================================
// CSS ANIMATIONS (INJECT TO HEAD)
// ======================================

function injectAnimations() { 
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .fade-in-up {
            animation: fadeInUp 0.6s ease forwards;
        }
        
        .faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        
        .faq-item.open .faq-answer {
            transition: max-height 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Inyectar animaciones cuando se carga el DOM
document.addEventListener('DOMContentLoaded', injectAnimations);

// ======================================
// FUNCIONALIDAD DROPDOWN EBOOKS
// ======================================

function initEbooksDropdown() {
    const dropdownTrigger = document.querySelector('.ebooks-nav-section');
    const dropdown = document.querySelector('.ebooks-dropdown');
    
    if (!dropdownTrigger || !dropdown) return;
    
    let isDropdownOpen = false;
    let hideTimeout;
    
    // Función para mostrar dropdown
    function showDropdown() {
        clearTimeout(hideTimeout);
        isDropdownOpen = true;
        dropdown.style.opacity = '1';
        dropdown.style.visibility = 'visible';
        dropdown.style.transform = 'translateY(0)';
    }
    
    // Función para ocultar dropdown
    function hideDropdown() {
        hideTimeout = setTimeout(() => {
            isDropdownOpen = false;
            dropdown.style.opacity = '0';
            dropdown.style.visibility = 'hidden';
            dropdown.style.transform = 'translateY(0.5rem)';
        }, 150); // Pequeño delay para mejor UX
    }
    
    // Event listeners para desktop
    dropdownTrigger.addEventListener('mouseenter', showDropdown);
    dropdownTrigger.addEventListener('mouseleave', hideDropdown);
    
    // Mantener dropdown abierto cuando el mouse está sobre él
    dropdown.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
    });
    dropdown.addEventListener('mouseleave', hideDropdown);
    
    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!dropdownTrigger.contains(e.target) && !dropdown.contains(e.target)) {
            hideDropdown();
        }
    });
    
    // Manejo del teclado para accesibilidad
    dropdownTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (isDropdownOpen) {
                hideDropdown();
            } else {
                showDropdown();
            }
        }
        
        if (e.key === 'Escape') {
            hideDropdown();
        }
    });
}

// ======================================
// TRACKING DE EVENTOS PARA EBOOKS
// ======================================

function initEbooksTracking() {
    // Tracking cuando se abre el dropdown
    const ebooksLink = document.querySelector('a[href="#productos"]');
    if (ebooksLink) {
        ebooksLink.addEventListener('click', () => {
            trackEvent('ebooks_section_viewed', {
                source: 'navbar_dropdown',
                timestamp: Date.now()
            });
        });
    }
    
    // Tracking de clics en ebooks específicos
    document.querySelectorAll('.ebook-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            const ebookTitle = item.querySelector('.ebook-title')?.textContent || `ebook_${index}`;
            trackEvent('ebook_clicked', {
                ebook_title: ebookTitle,
                source: 'navbar_dropdown',
                position: index + 1
            });
        });
    });
}

// ======================================
// EFECTOS VISUALES MEJORADOS
// ======================================

function initEbooksVisualEffects() {
    // Efecto de pulse en el emoji del ebook
    const ebookIcons = document.querySelectorAll('.ebook-icon');
    
    ebookIcons.forEach(icon => {
        let pulseInterval;
        
        icon.addEventListener('mouseenter', () => {
            pulseInterval = setInterval(() => {
                icon.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    icon.style.transform = 'scale(1)';
                }, 150);
            }, 300);
        });
        
        icon.addEventListener('mouseleave', () => {
            clearInterval(pulseInterval);
            icon.style.transform = 'scale(1)';
        });
    });
    
    // Efecto de brillo en badges
    const badges = document.querySelectorAll('.free-badge, .price-badge');
    badges.forEach(badge => {
        badge.addEventListener('mouseenter', () => {
            badge.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.5)';
        });
        
        badge.addEventListener('mouseleave', () => {
            badge.style.boxShadow = 'none';
        });
    });
}

// ======================================
// MOBILE MENU CON EBOOKS
// ======================================

function updateMobileMenuWithEbooks() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenuBtn || !mobileMenu) return;
    
    // Función para toggle del menú móvil (actualizada)
    function toggleMobileMenu() {
        const isHidden = mobileMenu.classList.contains('hidden');
        
        if (isHidden) {
            mobileMenu.classList.remove('hidden');
            // Animar entrada de items
            const menuItems = mobileMenu.querySelectorAll('a, .mobile-ebook-section');
            menuItems.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    item.style.transition = 'all 0.3s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, index * 50);
            });
        } else {
            mobileMenu.classList.add('hidden');
        }
        
        // Cambiar icono
        const icon = mobileMenuBtn.querySelector('svg');
        if (icon) {
            if (isHidden) {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
            } else {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
            }
        }
    }
    
    // Reemplazar el event listener existente
    mobileMenuBtn.replaceWith(mobileMenuBtn.cloneNode(true));
    document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);
}

// ======================================
// INICIALIZACIÓN EXTENDIDA
// ======================================

// Añadir a la función de inicialización principal
document.addEventListener('DOMContentLoaded', function() {
    // Ejecutar después de que se carguen las funciones base
    setTimeout(() => {
        initEbooksDropdown();
        initEbooksTracking();
        initEbooksVisualEffects();
        updateMobileMenuWithEbooks();
        
        console.log('✅ Funcionalidad de Ebooks inicializada');
    }, 100);
});

// ======================================
// UTILIDADES ESPECÍFICAS PARA EBOOKS
// ======================================

function scrollToEbooks() {
    const ebooksSection = document.getElementById('productos');
    if (ebooksSection) {
        ebooksSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Highlight temporal de la sección
        ebooksSection.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.3)';
        setTimeout(() => {
            ebooksSection.style.boxShadow = '';
        }, 2000);
    }
}

// Función para abrir modal de ebook (para futuras implementaciones)
function openEbookModal(ebookId) {
    trackEvent('ebook_modal_opened', { ebook_id: ebookId });
    
    // Aquí puedes añadir la lógica para abrir un modal con más detalles
    console.log(`Abriendo modal para ebook: ${ebookId}`);
}

// ======================================
// DROPDOWN INDEPENDIENTE PARA EBOOKS
// ======================================

function initIndependentEbooksDropdown() {
    const trigger = document.getElementById('ebooks-trigger');
    const dropdown = document.getElementById('ebooks-dropdown');
    const overlay = document.getElementById('dropdown-overlay');
    const arrow = document.getElementById('ebooks-arrow');
    
    if (!trigger || !dropdown || !overlay || !arrow) return;
    
    let isOpen = false;
    let hideTimeout;
    
    // Función para calcular posición del dropdown
    function calculateDropdownPosition() {
        const triggerRect = trigger.getBoundingClientRect();
        const dropdownWidth = 300;
        const viewportWidth = window.innerWidth;
        
        // Posición vertical
        dropdown.style.top = (triggerRect.bottom + 8) + 'px';
        
        // Posición horizontal
        let leftPosition = triggerRect.left;
        
        // Si se sale por la derecha, ajustar
        if (leftPosition + dropdownWidth > viewportWidth - 20) {
            leftPosition = viewportWidth - dropdownWidth - 20;
        }
        
        // Si se sale por la izquierda, ajustar
        if (leftPosition < 20) {
            leftPosition = 20;
        }
        
        dropdown.style.left = leftPosition + 'px';
    }
    
    // Función para mostrar dropdown
    function showDropdown() {
        clearTimeout(hideTimeout);
        calculateDropdownPosition();
        
        dropdown.classList.add('show');
        overlay.classList.add('show');
        arrow.style.transform = 'rotate(180deg)';
        isOpen = true;
        
        // Tracking
        if (typeof trackEvent === 'function') {
            trackEvent('ebooks_dropdown_opened', {
                source: 'navbar',
                timestamp: Date.now()
            });
        }
    }
    
    // Función para ocultar dropdown
    function hideDropdown() {
        hideTimeout = setTimeout(() => {
            dropdown.classList.remove('show');
            overlay.classList.remove('show');
            arrow.style.transform = 'rotate(0deg)';
            isOpen = false;
        }, 150);
    }
    
    // Event listeners
    trigger.addEventListener('mouseenter', showDropdown);
    trigger.addEventListener('mouseleave', hideDropdown);
    
    // Mantener abierto cuando mouse está sobre dropdown
    dropdown.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
    });
    dropdown.addEventListener('mouseleave', hideDropdown);
    
    // Cerrar con overlay
    overlay.addEventListener('click', hideDropdown);
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            hideDropdown();
        }
    });
    
    // Click en trigger para toggle (útil en móvil)
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        if (isOpen) {
            hideDropdown();
        } else {
            showDropdown();
        }
    });
    
    // Recalcular posición en resize
    window.addEventListener('resize', () => {
        if (isOpen) {
            calculateDropdownPosition();
        }
    });
    
    // Recalcular posición en scroll
    window.addEventListener('scroll', () => {
        if (isOpen) {
            calculateDropdownPosition();
        }
    });
    
    console.log('✅ Dropdown independiente de Ebooks inicializado');
}

// ======================================
// TRACKING MEJORADO PARA EBOOKS
// ======================================

function initEbooksClickTracking() {
    // Tracking de clics en ebooks específicos
    document.querySelectorAll('#ebooks-dropdown a[href="#productos"]').forEach((link, index) => {
        link.addEventListener('click', (e) => {
            const ebookTitle = link.querySelector('.text-sm')?.textContent || `ebook_${index}`;
            const isGratis = link.textContent.includes('GRATIS');
            
            if (typeof trackEvent === 'function') {
                trackEvent('ebook_clicked', {
                    ebook_title: ebookTitle,
                    is_free: isGratis,
                    source: 'navbar_dropdown',
                    position: index + 1
                });
            }
        });
    });
    
    // Tracking del botón "Ver Todos los Ebooks"
    const viewAllBtn = document.querySelector('#ebooks-dropdown button');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            if (typeof trackEvent === 'function') {
                trackEvent('view_all_ebooks_clicked', {
                    source: 'navbar_dropdown'
                });
            }
        });
    }
}

// ======================================
// INICIALIZACIÓN
// ======================================

// Añadir a la inicialización principal
document.addEventListener('DOMContentLoaded', function() {
    // Ejecutar después de que se carguen las funciones base
    setTimeout(() => {
        initIndependentEbooksDropdown();
        initEbooksClickTracking();
        
        console.log('🚀 Sistema de dropdown independiente cargado');
    }, 100);
});

// ======================================
// UTILIDADES ADICIONALES
// ======================================

// Función para cerrar dropdown programáticamente
function closeEbooksDropdown() {
    const dropdown = document.getElementById('ebooks-dropdown');
    const overlay = document.getElementById('dropdown-overlay');
    const arrow = document.getElementById('ebooks-arrow');
    
    if (dropdown && overlay && arrow) {
        dropdown.classList.remove('show');
        overlay.classList.remove('show');
        arrow.style.transform = 'rotate(0deg)';
    }
}

// Función para abrir dropdown programáticamente
function openEbooksDropdown() {
    const trigger = document.getElementById('ebooks-trigger');
    if (trigger) {
        trigger.dispatchEvent(new Event('mouseenter'));
    }
}