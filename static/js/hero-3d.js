// Subtle animated 3D backdrop for the hero section.
// Design intent: ambient, low-opacity wireframe + sparse particles behind
// the hero text — a "tech" feel, not a centerpiece competing with the text.
//
// This file fails silently (console.warn only) if WebGL or the module
// import is unavailable, because the CSS gradient behind the canvas is a
// complete visual on its own. It also does nothing at all when the user's
// OS has "reduce motion" turned on.

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  initHero3D();
}

async function initHero3D() {
  const canvas = document.getElementById('hero-canvas');
  const hero = canvas ? canvas.closest('.hero') : null;
  if (!canvas || !hero) return;

  let THREE;
  try {
    THREE = await import('three');
  } catch (err) {
    console.warn('Hero 3D scene skipped (could not load three.js):', err);
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (err) {
    console.warn('Hero 3D scene skipped (WebGL unavailable):', err);
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 9;

  const group = new THREE.Group();
  scene.add(group);

  // Centerpiece: a large, faint wireframe icosahedron. Kept low-opacity so
  // it reads as ambient texture rather than a shape competing with the text.
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.1, 1),
    new THREE.MeshBasicMaterial({
      color: 0x5eb8ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    })
  );
  group.add(core);

  // Sparse particle field, distributed on a sphere shell around the core.
  const particleCount = 220;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const radius = 5 + Math.random() * 7;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: 0x9db8ff,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    })
  );
  scene.add(particles);

  function resize() {
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Gentle parallax toward the pointer — small magnitude, never fights the
  // slow ambient rotation below.
  let targetX = 0;
  let targetY = 0;
  window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 0.6;
    targetY = (e.clientY / window.innerHeight - 0.5) * 0.6;
  });

  // Pause the render loop when the hero scrolls out of view to save
  // battery/CPU on long sessions.
  let isVisible = true;
  new IntersectionObserver(
    (entries) => { isVisible = entries[0].isIntersecting; },
    { threshold: 0.05 }
  ).observe(hero);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const delta = clock.getDelta();
    group.rotation.y += delta * 0.12;
    group.rotation.x += delta * 0.04;
    particles.rotation.y -= delta * 0.03;

    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (-targetY - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();
}
