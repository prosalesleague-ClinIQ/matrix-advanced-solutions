// MuscleLock Apple-Style Product Unveil — GSAP-Powered
(function () {
  'use strict';

  var SESSION_KEY = 'ml-unveil-played';
  if (sessionStorage.getItem(SESSION_KEY)) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.innerWidth < 768;

  // --- Build DOM ---
  var overlay = document.createElement('div');
  overlay.id = 'ml-unveil-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  overlay.innerHTML =
    '<canvas id="ml-stars-canvas"></canvas>' +
    '<div id="ml-floor"></div>' +
    '<div id="ml-back-glow"></div>' +
    '<div id="ml-rim-left"></div>' +
    '<div id="ml-rim-right"></div>' +
    '<div id="ml-bottle-wrap"><img src="/musclelock/assets/bottle-studio.png" alt="" width="1024" height="1536" /></div>' +
    '<div id="ml-label-orbit"><div id="ml-label-plane"><img src="/musclelock/assets/label-wrap.png" alt="" width="1980" height="756" /></div></div>' +
    '<div id="ml-brand-lockup"><h2>MuscleLock</h2><p>By Matrix Advanced Solutions</p></div>' +
    '<button id="ml-unveil-skip">Skip</button>';

  document.body.prepend(overlay);

  var starsCanvas = document.getElementById('ml-stars-canvas');
  var backGlow = document.getElementById('ml-back-glow');
  var bottleWrap = document.getElementById('ml-bottle-wrap');
  var labelOrbit = document.getElementById('ml-label-orbit');
  var labelPlane = document.getElementById('ml-label-plane');
  var brandLockup = document.getElementById('ml-brand-lockup');
  var skipBtn = document.getElementById('ml-unveil-skip');

  // --- Starfield ---
  function initStars() {
    var ctx = starsCanvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio, 2);
    starsCanvas.width = window.innerWidth * dpr;
    starsCanvas.height = window.innerHeight * dpr;
    starsCanvas.style.width = '100%';
    starsCanvas.style.height = '100%';

    var stars = [];
    var count = isMobile ? 120 : 300;
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * starsCanvas.width,
        y: Math.random() * starsCanvas.height,
        size: 0.3 + Math.random() * 1.2,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinklePhase: Math.random() * Math.PI * 2,
        brightness: 0.3 + Math.random() * 0.5
      });
    }

    var running = true;
    function drawStars() {
      if (!running) return;
      ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
      var t = performance.now() / 1000;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var alpha = s.brightness * (0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinklePhase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180,190,220,' + alpha + ')';
        ctx.fill();
      }
      requestAnimationFrame(drawStars);
    }
    drawStars();
    return function () { running = false; };
  }

  var stopStars = initStars();

  // --- Finish ---
  function finish() {
    sessionStorage.setItem(SESSION_KEY, '1');
    overlay.classList.add('exiting');
    setTimeout(function () {
      stopStars();
      overlay.remove();
    }, 1100);
  }

  skipBtn.addEventListener('click', finish);
  var safetyTimer = setTimeout(finish, 9000);

  // --- Reduced motion shortcut ---
  if (reducedMotion) {
    bottleWrap.style.opacity = '1';
    bottleWrap.style.transform = 'translate(-50%, -50%) scale(1)';
    backGlow.style.opacity = '0.5';
    backGlow.style.transform = 'translate(-50%, -50%) scale(1)';
    brandLockup.style.opacity = '1';
    setTimeout(finish, 700);
    return;
  }

  // --- GSAP Master Timeline ---
  function loadGSAP(cb) {
    if (window.gsap) { cb(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
    s.onload = cb;
    s.onerror = function () {
      // Fallback if GSAP fails to load
      bottleWrap.style.opacity = '1';
      bottleWrap.style.transform = 'translate(-50%, -50%) scale(1)';
      setTimeout(finish, 1000);
    };
    document.head.appendChild(s);
  }

  // Preload images
  var loaded = 0;
  function onImgLoad() {
    loaded++;
    if (loaded >= 2) startAnimation();
  }
  var img1 = new Image(); img1.onload = img1.onerror = onImgLoad;
  var img2 = new Image(); img2.onload = img2.onerror = onImgLoad;
  img1.src = '/musclelock/assets/bottle-studio.png';
  img2.src = '/musclelock/assets/label-wrap.png';
  setTimeout(function () { if (loaded < 2) { loaded = 2; startAnimation(); } }, 2500);

  var started = false;
  function startAnimation() {
    if (started) return;
    started = true;

    loadGSAP(function () {
      var gsap = window.gsap;
      var orbitRadius = isMobile ? 140 : 220;
      var totalSpins = 3;

      var tl = gsap.timeline({
        onComplete: function () {
          clearTimeout(safetyTimer);
          setTimeout(finish, 1000);
        }
      });

      // Phase 1: Bottle emerges from darkness (0s - 1s)
      tl.to(bottleWrap, {
        opacity: 1,
        scale: 1,
        xPercent: -50,
        yPercent: -50,
        duration: 1.2,
        ease: 'power3.out'
      }, 0);

      // Subtle bottle 3D tilt during entrance
      tl.fromTo(bottleWrap, {
        rotationY: -8,
        rotationX: 3
      }, {
        rotationY: 0,
        rotationX: 0,
        duration: 1.5,
        ease: 'power2.out'
      }, 0);

      // Phase 2: Label appears and orbits (0.6s - 3s)
      tl.to(labelPlane, { opacity: 1, duration: 0.3 }, 0.6);

      // Custom label orbit using onUpdate
      var orbitObj = { angle: -0.5, radius: orbitRadius * 1.3, yOffset: 0 };
      tl.to(orbitObj, {
        angle: Math.PI * 2 * totalSpins + 0.5,
        radius: orbitRadius * 0.15,
        duration: isMobile ? 2 : 2.8,
        ease: 'power2.inOut',
        onUpdate: function () {
          var a = orbitObj.angle;
          var r = orbitObj.radius;
          var x = Math.cos(a) * r;
          var y = Math.sin(a) * r * 0.35;
          var z = Math.sin(a) * r * 0.6;

          // 3D rotation — label faces camera at certain angles
          var rotY = (a * 180 / Math.PI) % 360;
          var perspective = 1 + z / 600;
          var scale = 0.6 + (1 - orbitObj.radius / (orbitRadius * 1.3)) * 0.5;

          labelPlane.style.transform =
            'translate(' + (x - 160) + 'px, ' + (y - 50) + 'px) ' +
            'perspective(900px) ' +
            'rotateY(' + rotY + 'deg) ' +
            'rotateX(' + (y * 0.05) + 'deg) ' +
            'scale(' + (scale * Math.max(0.7, perspective)) + ')';

          // Depth-based opacity
          var depthAlpha = 0.5 + Math.cos(a) * 0.5;
          labelPlane.style.opacity = String(Math.min(1, depthAlpha + 0.3));

          // Depth-based z-index (in front or behind bottle)
          labelPlane.style.zIndex = z > 0 ? '15' : '8';
        }
      }, 0.6);

      // Phase 3: Label docks and fades (synced to end of orbit)
      var dockTime = isMobile ? 2.6 : 3.4;
      tl.to(labelPlane, {
        opacity: 0,
        scale: 0.85,
        duration: 0.4,
        ease: 'power2.in'
      }, dockTime);

      // Phase 4: Dramatic zoom in (3s - 4s)
      var zoomTime = dockTime + 0.2;
      tl.to(bottleWrap, {
        scale: 1.3,
        xPercent: -50,
        yPercent: -52,
        duration: 0.9,
        ease: 'power2.inOut'
      }, zoomTime);

      // Bottle slight 3D rotation during zoom
      tl.to(bottleWrap, {
        rotationY: 5,
        duration: 0.9,
        ease: 'power2.inOut'
      }, zoomTime);

      // Phase 5: Pull back to hero frame (4s - 4.5s)
      tl.to(bottleWrap, {
        scale: 1.1,
        rotationY: 0,
        yPercent: -50,
        duration: 0.7,
        ease: 'power3.out'
      }, zoomTime + 0.9);

      // Back glow builds
      tl.to(backGlow, {
        opacity: 0.7,
        scale: 1.1,
        xPercent: -50,
        yPercent: -50,
        duration: 1.5,
        ease: 'power2.out'
      }, zoomTime - 0.3);

      // Bottle shadow intensifies
      tl.to(bottleWrap.querySelector('img'), {
        filter: 'drop-shadow(0 20px 80px rgba(109,40,217,0.5)) drop-shadow(0 0 60px rgba(34,211,238,0.15))',
        duration: 1,
        ease: 'power2.out'
      }, zoomTime);

      // Rim lights
      tl.to(document.getElementById('ml-rim-left'), { opacity: 0.8, duration: 1.2, ease: 'power2.out' }, zoomTime - 0.5);
      tl.to(document.getElementById('ml-rim-right'), { opacity: 0.8, duration: 1.2, ease: 'power2.out' }, zoomTime - 0.3);

      // Brand lockup appears
      tl.to(brandLockup, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, zoomTime + 0.8);

      tl.fromTo(brandLockup, { y: 20 }, { y: 0, duration: 0.6, ease: 'power2.out' }, zoomTime + 0.8);
    });
  }
})();
