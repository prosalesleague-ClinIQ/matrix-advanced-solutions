// MuscleLock Apple-Style Product Unveil
// Self-contained — no dependencies beyond GSAP (loaded inline)

(function () {
  'use strict';

  const SESSION_KEY = 'ml-unveil-played';
  if (sessionStorage.getItem(SESSION_KEY)) return;

  // Reduced motion check
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Build DOM
  const overlay = document.createElement('div');
  overlay.id = 'ml-unveil-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  overlay.innerHTML = `
    <div id="ml-unveil-stage">
      <div id="ml-unveil-glow"></div>
      <div id="ml-unveil-bottle">
        <img src="/musclelock/assets/bottle-hero.png" alt="" />
      </div>
      <div id="ml-unveil-label">
        <img src="/musclelock/assets/label-wrap.webp" alt="" />
      </div>
    </div>
    <button id="ml-unveil-skip">Skip</button>
  `;

  document.body.prepend(overlay);

  const bottle = document.getElementById('ml-unveil-bottle');
  const label = document.getElementById('ml-unveil-label');
  const glow = document.getElementById('ml-unveil-glow');
  const skipBtn = document.getElementById('ml-unveil-skip');

  function finish() {
    sessionStorage.setItem(SESSION_KEY, '1');
    overlay.classList.add('exiting');
    setTimeout(function () {
      overlay.remove();
    }, 1000);
  }

  skipBtn.addEventListener('click', finish);

  // Safety timeout
  var safetyTimer = setTimeout(finish, 8000);

  // Reduced motion: quick reveal
  if (reducedMotion) {
    bottle.style.opacity = '1';
    bottle.style.transform = 'translate(-50%, -50%) scale(1)';
    glow.style.opacity = '0.5';
    glow.style.transform = 'translate(-50%, -50%) scale(1)';
    setTimeout(finish, 800);
    return;
  }

  // Animation using CSS transitions + requestAnimationFrame timing
  // (No GSAP dependency needed for this approach)

  var isMobile = window.innerWidth < 768;
  var duration = isMobile ? 3200 : 4200;
  var startTime = performance.now();

  // Easing functions
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function easeOutQuint(t) { return 1 - Math.pow(1 - t, 5); }

  function animate(now) {
    var elapsed = now - startTime;
    var raw = Math.min(1, elapsed / duration);

    // --- Phase 1: Bottle emerges (0% - 25%) ---
    var bottleP = Math.min(1, raw / 0.25);
    var bottleEased = easeOutCubic(bottleP);
    bottle.style.opacity = String(Math.min(1, bottleEased * 1.5));
    var bottleScale = 0.6 + bottleEased * 0.4;

    // --- Phase 2: Label orbit (15% - 65%) ---
    var labelRaw = Math.max(0, Math.min(1, (raw - 0.15) / 0.5));
    var labelEased = easeInOutQuad(labelRaw);

    if (labelRaw > 0) {
      label.style.opacity = String(Math.min(1, labelRaw * 3));

      // Orbit: full 360° + extra for dramatic sweep
      var orbitAngle = labelEased * Math.PI * 2.5;
      // Orbit radius shrinks as it approaches bottle
      var orbitRadius = isMobile ? 160 : 240;
      var currentRadius = orbitRadius * (1 - labelEased * 0.85);

      var labelX = Math.cos(orbitAngle) * currentRadius;
      var labelY = Math.sin(orbitAngle) * currentRadius * 0.3; // elliptical
      var labelZ = Math.sin(orbitAngle) * 0.6; // depth perspective

      // 3D rotation to simulate wrapping
      var rotateY = (orbitAngle * 180 / Math.PI) % 360;
      var scaleLabel = 0.7 + labelEased * 0.3;
      // Perspective scaling based on depth
      var depthScale = 0.85 + labelZ * 0.15;

      label.style.transform =
        'translate(calc(-50% + ' + labelX + 'px), calc(-50% + ' + labelY + 'px)) ' +
        'scale(' + (scaleLabel * depthScale) + ') ' +
        'perspective(800px) rotateY(' + rotateY + 'deg)';
    }

    // --- Phase 3: Label attachment (65% - 80%) ---
    if (raw > 0.65) {
      var attachP = Math.min(1, (raw - 0.65) / 0.15);
      var attachEased = easeOutQuint(attachP);

      // Label moves to center and fades to merge with bottle
      var attachX = (1 - attachEased) * Math.cos(Math.PI * 2.5 * easeInOutQuad(1)) * (isMobile ? 160 : 240) * 0.15;
      var attachY = (1 - attachEased) * 10;
      label.style.transform =
        'translate(calc(-50% + ' + attachX + 'px), calc(-50% + ' + attachY + 'px)) ' +
        'scale(' + (1 - attachEased * 0.1) + ') ' +
        'perspective(800px) rotateY(0deg)';
      label.style.opacity = String(1 - attachEased);
    }

    // --- Phase 4: Zoom in (70% - 85%) ---
    if (raw > 0.7) {
      var zoomP = Math.min(1, (raw - 0.7) / 0.15);
      var zoomEased = easeOutCubic(zoomP);
      bottleScale = 1 + zoomEased * 0.25;
    }

    // --- Phase 5: Zoom out slightly (85% - 95%) ---
    if (raw > 0.85) {
      var pullP = Math.min(1, (raw - 0.85) / 0.1);
      var pullEased = easeOutCubic(pullP);
      bottleScale = 1.25 - pullEased * 0.1;
    }

    bottle.style.transform = 'translate(-50%, -50%) scale(' + bottleScale + ')';

    // --- Glow: builds from 50% onward ---
    if (raw > 0.5) {
      var glowP = Math.min(1, (raw - 0.5) / 0.35);
      var glowEased = easeOutCubic(glowP);
      glow.style.opacity = String(glowEased * 0.65);
      glow.style.transform = 'translate(-50%, -50%) scale(' + (0.4 + glowEased * 0.8) + ')';
    }

    // --- Bottle shadow intensifies ---
    if (raw > 0.6) {
      var shadowP = Math.min(1, (raw - 0.6) / 0.3);
      bottle.querySelector('img').style.filter =
        'drop-shadow(0 0 ' + (30 + shadowP * 40) + 'px rgba(109,40,217,' + (0.2 + shadowP * 0.4) + ')) ' +
        'drop-shadow(0 0 ' + (10 + shadowP * 20) + 'px rgba(34,211,238,' + (shadowP * 0.15) + '))';
    }

    if (raw < 1) {
      requestAnimationFrame(animate);
    } else {
      // Hold for a moment then exit
      clearTimeout(safetyTimer);
      setTimeout(finish, 900);
    }
  }

  // Preload images then start
  var bottleImg = new Image();
  var labelImg = new Image();
  var loaded = 0;

  function onLoad() {
    loaded++;
    if (loaded >= 2) {
      requestAnimationFrame(animate);
    }
  }

  bottleImg.onload = onLoad;
  labelImg.onload = onLoad;
  bottleImg.onerror = onLoad;
  labelImg.onerror = onLoad;
  bottleImg.src = '/musclelock/assets/bottle-hero.png';
  labelImg.src = '/musclelock/assets/label-wrap.webp';

  // Fallback if images take too long
  setTimeout(function () {
    if (loaded < 2) {
      loaded = 2;
      requestAnimationFrame(animate);
    }
  }, 2000);

})();
