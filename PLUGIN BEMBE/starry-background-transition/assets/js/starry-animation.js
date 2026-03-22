;(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        if (typeof starry_vars === 'undefined') {
            return;
        }

        const DEFAULTS = {
            numStars: 2000,
            starColor: '#ffffff',
            fadeSpeed: 0.008,
            animationDuration: 3000
        };

        const config = {
            numStars: parseInt(starry_vars.num_stars, 10) || DEFAULTS.numStars,
            starColor: starry_vars.star_color || DEFAULTS.starColor,
            fadeSpeed: parseFloat(starry_vars.fade_speed) || DEFAULTS.fadeSpeed,
            animationDuration: parseInt(starry_vars.animation_duration, 10) || DEFAULTS.animationDuration
        };

        config.numStars = Math.min(Math.max(config.numStars, 100), 5000);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            alpha: true,
            antialias: true
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const overlay = document.getElementById('starry-overlay');
        if (!overlay) return;

        overlay.appendChild(renderer.domElement);

        const numStars = config.numStars;
        const starGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(numStars * 3);
        const opacities = new Float32Array(numStars);

        const BOUNDS = 2000;
        const Z_NEAR = -1000;
        const Z_FADE_START = 50;
        const Z_RESET = 1000;

        for (let i = 0; i < numStars; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * BOUNDS;
            positions[i3 + 1] = (Math.random() - 0.5) * BOUNDS;
            positions[i3 + 2] = Z_NEAR + Math.random() * (Z_RESET - Z_NEAR);
            opacities[i] = 1.0;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

        const starMaterial = new THREE.PointsMaterial({
            color: config.starColor,
            size: 1.5,
            sizeAttenuation: true,
            transparent: true,
            opacity: 1,
            depthWrite: false
        });

        const starField = new THREE.Points(starGeometry, starMaterial);
        scene.add(starField);

        camera.position.z = 500;

        let animationStartTime = null;
        let animationComplete = false;

        function animate(currentTime) {
            requestAnimationFrame(animate);

            if (!animationStartTime) {
                animationStartTime = currentTime;
            }

            const elapsed = currentTime - animationStartTime;
            const progress = Math.min(elapsed / config.animationDuration, 1);

            if (!animationComplete) {
                const positionAttr = starGeometry.attributes.position;
                const opacityAttr = starGeometry.attributes.opacity;
                const posArray = positionAttr.array;
                const opacArray = opacityAttr.array;

                const speed = 3 + (progress * 2);

                for (let i = 0; i < numStars; i++) {
                    const i3 = i * 3;

                    posArray[i3 + 2] += speed;

                    if (posArray[i3 + 2] > Z_FADE_START) {
                        const fadeProgress = (posArray[i3 + 2] - Z_FADE_START) / (Z_RESET - Z_FADE_START);
                        opacArray[i] = Math.max(0, 1 - (fadeProgress * progress * 1.5));
                    }

                    if (posArray[i3 + 2] > Z_RESET) {
                        posArray[i3] = (Math.random() - 0.5) * BOUNDS;
                        posArray[i3 + 1] = (Math.random() - 0.5) * BOUNDS;
                        posArray[i3 + 2] = Z_NEAR;
                        opacArray[i] = 1.0;
                    }
                }

                positionAttr.needsUpdate = true;
                opacityAttr.needsUpdate = true;

                if (progress >= 1) {
                    animationComplete = true;
                    overlay.style.transition = 'opacity 0.8s ease-out';
                    overlay.style.opacity = '0';
                    setTimeout(function() {
                        if (overlay.parentNode) {
                            overlay.parentNode.removeChild(overlay);
                        }
                    }, 800);
                }
            }

            renderer.render(scene, camera);
        }

        animate(0);

        let resizeTimeout = null;
        function handleResize() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }, 150);
        }

        window.addEventListener('resize', handleResize);
    });
})();
