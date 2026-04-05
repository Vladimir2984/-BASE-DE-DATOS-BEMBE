/**
 * BEMBÉ - JavaScript Moderno
 * Animaciones, interactividad y mejoras de UX
 *
 * @version 2.0.0
 * @author MiniMax Agent
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURACIÓN
    // ==========================================================================
    const CONFIG = {
        animationThreshold: 0.1,
        scrollOffset: 100,
        debounceTime: 100
    };

    // ==========================================================================
    // UTILIDADES
    // ==========================================================================

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // ==========================================================================
    // HEADER SCROLL EFFECT
    // ==========================================================================
    function initHeaderScroll() {
        const header = document.querySelector('header, .site-header, .header');
        if (!header) return;

        let lastScroll = 0;

        window.addEventListener('scroll', debounce(() => {
            const currentScroll = window.pageYOffset;

            // Add scrolled class
            if (currentScroll > CONFIG.scrollOffset) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Hide/show on scroll direction
            if (currentScroll > lastScroll && currentScroll > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }

            lastScroll = currentScroll;
        }, CONFIG.debounceTime));
    }

    // ==========================================================================
    // SCROLL ANIMATIONS (Intersection Observer)
    // ==========================================================================
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll(
            '.dance-style-card, .style-card, .card, article, .price-card, ' +
            'section > h2, section > h3, .fade-in, .slide-in-left, .slide-in-right'
        );

        if (!animatedElements.length) return;

        // Add initial classes
        animatedElements.forEach(el => {
            if (!el.classList.contains('fade-in') &&
                !el.classList.contains('slide-in-left') &&
                !el.classList.contains('slide-in-right')) {
                el.classList.add('fade-in');
            }
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: unobserve after animation
                    // observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: CONFIG.animationThreshold,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // ==========================================================================
    // LAZY LOADING IMAGES
    // ==========================================================================
    function initLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');

        images.forEach(img => {
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
            }
        });
    }

    // ==========================================================================
    // SMOOTH SCROLL
    // ==========================================================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ==========================================================================
    // MOBILE MENU
    // ==========================================================================
    function initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle, .hamburger, [class*="menu-btn"]');
        const nav = document.querySelector('nav, .nav-menu, .main-menu');

        if (!menuToggle || !nav) return;

        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu on link click
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    // ==========================================================================
    // FORM ENHANCEMENTS
    // ==========================================================================
    function initFormEnhancements() {
        // Floating labels
        const inputs = document.querySelectorAll('input, textarea');

        inputs.forEach(input => {
            // Check initial value
            if (input.value) {
                input.classList.add('has-value');
            }

            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
                if (input.value) {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            });
        });

        // Phone mask
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 0) {
                    if (value[0] === '7' || value[0] === '8') {
                        value = value.substring(1);
                    }
                    let formatted = '+7 ';
                    if (value.length > 0) formatted += '(' + value.substring(0, 3);
                    if (value.length >= 3) formatted += ') ' + value.substring(3, 6);
                    if (value.length >= 6) formatted += '-' + value.substring(6, 8);
                    if (value.length >= 8) formatted += '-' + value.substring(8, 10);
                    e.target.value = formatted;
                }
            });
        });

        // AJAX form submission
        const forms = document.querySelectorAll('form:not([action*="wp-login"])');
        forms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                // Only intercept if it's a contact form
                if (!form.querySelector('[name="name"]') && !form.querySelector('[name="phone"]')) return;

                e.preventDefault();

                const submitBtn = form.querySelector('[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Отправка...';
                submitBtn.disabled = true;

                try {
                    const formData = new FormData(form);
                    formData.append('action', 'bembespb_contact');
                    formData.append('nonce', bembespbData?.nonce || '');

                    const response = await fetch(bembespbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();

                    if (result.success) {
                        showNotification(result.data.message, 'success');
                        form.reset();
                    } else {
                        showNotification(result.data.message || 'Произошла ошибка', 'error');
                    }
                } catch (error) {
                    showNotification('Ошибка соединения. Попробуйте позже.', 'error');
                } finally {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
        });
    }

    // ==========================================================================
    // NOTIFICATIONS
    // ==========================================================================
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.bembespb-notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `bembespb-notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-btn">&times;</button>
        `;

        // Styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 25px',
            borderRadius: '12px',
            background: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6',
            color: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            animation: 'slideInRight 0.3s ease',
            maxWidth: '90vw'
        });

        document.body.appendChild(notification);

        // Close button
        notification.querySelector('.close-btn').addEventListener('click', () => {
            notification.remove();
        });

        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .bembespb-notification .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }
    `;
    document.head.appendChild(style);

    // ==========================================================================
    // COUNTER ANIMATION
    // ==========================================================================
    function initCounterAnimation() {
        const counters = document.querySelectorAll('.counter, [data-counter]');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-counter') || counter.textContent);
                    const duration = 2000;
                    const step = target / (duration / 16);
                    let current = 0;

                    const updateCounter = () => {
                        current += step;
                        if (current < target) {
                            counter.textContent = Math.floor(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target;
                        }
                    };

                    updateCounter();
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    // ==========================================================================
    // PARALLAX EFFECT
    // ==========================================================================
    function initParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax], .parallax');

        if (!parallaxElements.length) return;

        window.addEventListener('scroll', debounce(() => {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const speed = element.getAttribute('data-speed') || 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }, 10));
    }

    // ==========================================================================
    // MODAL/POPUP IMPROVEMENTS
    // ==========================================================================
    function initModals() {
        const modals = document.querySelectorAll('.modal, .popup, [class*="modal"]');

        modals.forEach(modal => {
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modals.forEach(modal => {
                    if (window.getComputedStyle(modal).display !== 'none') {
                        modal.style.display = 'none';
                        document.body.style.overflow = '';
                    }
                });
            }
        });
    }

    // ==========================================================================
    // BACK TO TOP BUTTON
    // ==========================================================================
    function initBackToTop() {
        const button = document.createElement('button');
        button.className = 'back-to-top';
        button.innerHTML = '↑';
        button.setAttribute('aria-label', 'Volver arriba');

        Object.assign(button.style, {
            position: 'fixed',
            bottom: '100px',
            right: '30px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E63946 0%, #F4A261 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            opacity: '0',
            visibility: 'hidden',
            transition: 'all 0.3s ease',
            zIndex: '9998',
            fontSize: '20px',
            boxShadow: '0 4px 15px rgba(230, 57, 70, 0.4)'
        });

        document.body.appendChild(button);

        window.addEventListener('scroll', debounce(() => {
            if (window.pageYOffset > 500) {
                button.style.opacity = '1';
                button.style.visibility = 'visible';
            } else {
                button.style.opacity = '0';
                button.style.visibility = 'hidden';
            }
        }, CONFIG.debounceTime));

        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
    }

    // ==========================================================================
    // PRELOADER
    // ==========================================================================
    function initPreloader() {
        const preloader = document.querySelector('.preloader, .loader');

        if (preloader) {
            window.addEventListener('load', () => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            });
        }
    }

    // ==========================================================================
    // PERFORMANCE OPTIMIZATIONS
    // ==========================================================================

    // Intersection Observer for lazy loading
    function initIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        const imageObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        img.classList.add('loaded');
                    }
                    obs.unobserve(img);
                }
            });
        }, observerOptions);

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Prefetch links on hover
    function initPrefetchLinks() {
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            link.addEventListener('mouseenter', () => {
                const prefetch = document.createElement('link');
                prefetch.rel = 'prefetch';
                prefetch.href = link.href;
                document.head.appendChild(prefetch);
            });
        });
    }

    // Cache DOM queries
    const cachedQueries = {};
    function $(selector) {
        if (!cachedQueries[selector]) {
            cachedQueries[selector] = document.querySelector(selector);
        }
        return cachedQueries[selector];
    }

    // Debounced resize handler
    function initResizeHandler() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // Trigger resize complete actions
                document.dispatchEvent(new Event('resizeComplete'));
            }, 250);
        });
    }

    // WebP support detection
    function supportsWebP() {
        const elem = document.createElement('canvas');
        if (elem.getContext && elem.getContext('2d')) {
            return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        return false;
    }

    // Replace images with WebP if available
    function initWebP() {
        if (supportsWebP()) {
            document.body.classList.add('webp-supported');
        }
    }

    // Service Worker Registration (for PWA)
    async function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered');
            } catch (e) {
                console.log('Service Worker registration failed:', e);
            }
        }
    }

    // ==========================================================================
    // INITIALIZE ALL
    // ==========================================================================
    function init() {
        initHeaderScroll();
        initScrollAnimations();
        initLazyLoading();
        initSmoothScroll();
        initMobileMenu();
        initFormEnhancements();
        initCounterAnimation();
        initParallax();
        initModals();
        initBackToTop();
        initPreloader();
        
        // Performance
        initIntersectionObserver();
        initPrefetchLinks();
        initResizeHandler();
        initWebP();
        
        // Register Service Worker
        registerServiceWorker();

        console.log('🎉 BEMBÉ Modern JS initialized');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
