/**
 * 3D Avatar System
 * Handles avatar loading, animations, and interactions
 * Uses Three.js for 3D rendering
 */

class Avatar3DSystem {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    // Options
    this.options = {
      modelPath: options.modelPath || '/assets/avatar-model.glb',
      scale: options.scale || 1.5,
      autoRotate: options.autoRotate !== false,
      environment: options.environment || 'default',
      ...options
    };

    // Scene setup
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.avatar = null;
    this.mixer = null;
    this.animations = {};
    this.currentAnimation = null;
    
    // State
    this.isInitialized = false;
    this.isLoading = false;
    this.currentEmotion = 'idle';
    this.isAnimating = false;

    // Bind methods
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    // Initialize
    this.init();
  }

  /**
   * Initialize Three.js scene
   */
  init() {
    try {
      // Scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(this.options.autoRotate ? 0x000000 : 0xffffff);
      this.scene.fog = this.options.autoRotate ? new THREE.Fog(0x000000, 100, 1000) : null;

      // Camera
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      const cameraZ = 2 * (this.options.scale / 1.5);
      this.camera.position.set(0, 0.5, cameraZ);
      this.camera.lookAt(0, -0.1, 0);

      // Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.shadowMap.enabled = true;
      this.container.appendChild(this.renderer.domElement);

      // Lighting
      this.setupLighting();

      // Load avatar model
      this.loadAvatar();

      // Handle resize
      window.addEventListener('resize', this.onWindowResize);

      // Start animation loop
      this.animate();

      this.isInitialized = true;
      console.log('✅ Avatar 3D system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize avatar system:', error);
    }
  }

  /**
   * Setup scene lighting
   */
  setupLighting() {
    // Ambient light
    const ambientIntensity = this.options.autoRotate ? 0.6 : 1.0;
    const ambientLight = new THREE.AmbientLight(0xffffff, ambientIntensity);
    this.scene.add(ambientLight);

    // Key light (main)
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    this.scene.add(keyLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x0066ff, 0.3);
    fillLight.position.set(-5, 3, -5);
    this.scene.add(fillLight);

    // Back light
    const backLight = new THREE.PointLight(0xff6b9d, 0.4);
    backLight.position.set(0, 2, -5);
    this.scene.add(backLight);

    // Store lights for emotion-based color changes
    this.lights = { key: keyLight, fill: fillLight, back: backLight };
  }

  /**
   * Load 3D avatar model (Mixamo format)
   */
  loadAvatar() {
    this.isLoading = true;

    // Use GLTFLoader (should be available via Three.js CDN)
    if (typeof THREE.GLTFLoader === 'undefined') {
      console.warn('THREE.GLTFLoader not found. Loading from CDN...');
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/three@r128/examples/js/loaders/GLTFLoader.js';
      document.head.appendChild(script);
      script.onload = () => this.loadAvatar();
      return;
    }

    const loader = new THREE.GLTFLoader();
    
    loader.load(
      this.options.modelPath,
      (gltf) => this.onAvatarLoaded(gltf),
      (progress) => this.onAvatarProgress(progress),
      (error) => this.onAvatarError(error)
    );
  }

  /**
   * Handle successful avatar load
   */
  onAvatarLoaded(gltf) {
    this.avatar = gltf.scene;
    this.avatar.scale.set(this.options.scale, this.options.scale, this.options.scale);
    this.avatar.position.set(0, -0.5, 0);
    this.scene.add(this.avatar);

    // Setup animations
    if (gltf.animations.length > 0) {
      this.mixer = new THREE.AnimationMixer(this.avatar);
      gltf.animations.forEach((clip) => {
        this.animations[clip.name] = clip;
      });
      console.log(`✅ Avatar loaded with ${gltf.animations.length} animations`);
    } else {
      this.mixer = new THREE.AnimationMixer(this.avatar);
    }

    this.isLoading = false;
    this.playAnimation('idle'); // Start with idle animation

    // Emit custom event
    this.container.dispatchEvent(new CustomEvent('avatarLoaded', { detail: { avatar: this.avatar } }));
  }

  /**
   * Handle avatar loading progress
   */
  onAvatarProgress(progress) {
    const percentComplete = (progress.loaded / progress.total) * 100;
    console.log(`⏳ Avatar loading: ${percentComplete.toFixed(0)}%`);
  }

  /**
   * Handle avatar loading error
   */
  onAvatarError(error) {
    console.error('❌ Failed to load avatar model:', error);
    this.isLoading = false;
    
    // Fallback: Create simple placeholder
    this.createPlaceholderAvatar();
  }

  /**
   * Create a detailed placeholder avatar (futuristic AI assistant)
   */
  createPlaceholderAvatar() {
    const group = new THREE.Group();

    // Materials
    const skinMaterial = new THREE.MeshPhongMaterial({ color: 0xc4b5fd, shininess: 30 });
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x1e40af, shininess: 50 });
    const accentMaterial = new THREE.MeshPhongMaterial({
      color: 0x7c3aed,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.2,
      shininess: 100
    });
    const glowMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
    });

    // Head
    const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 0.3;
    head.castShadow = true;
    group.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.03, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeometry, glowMaterial);
    leftEye.position.set(-0.08, 0.35, 0.22);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, glowMaterial);
    rightEye.position.set(0.08, 0.35, 0.22);
    group.add(rightEye);

    // Mouth (subtle smile)
    const mouthGeometry = new THREE.TorusGeometry(0.02, 0.01, 8, 16, Math.PI);
    const mouth = new THREE.Mesh(mouthGeometry, accentMaterial);
    mouth.position.set(0, 0.25, 0.23);
    mouth.rotation.x = Math.PI / 2;
    group.add(mouth);

    // Body (torso)
    const torsoGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.4, 16);
    const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
    torso.position.y = 0;
    torso.castShadow = true;
    group.add(torso);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 12);
    const leftArm = new THREE.Mesh(armGeometry, skinMaterial);
    leftArm.position.set(-0.2, 0.1, 0);
    leftArm.rotation.z = Math.PI / 6;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, skinMaterial);
    rightArm.position.set(0.2, 0.1, 0);
    rightArm.rotation.z = -Math.PI / 6;
    group.add(rightArm);

    // Tech accents on body
    const accentGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.02);
    const chestAccent = new THREE.Mesh(accentGeometry, glowMaterial);
    chestAccent.position.set(0, 0.1, 0.13);
    group.add(chestAccent);

    const shoulderAccentL = new THREE.Mesh(accentGeometry, accentMaterial);
    shoulderAccentL.position.set(-0.18, 0.18, 0);
    group.add(shoulderAccentL);

    const shoulderAccentR = new THREE.Mesh(accentGeometry, accentMaterial);
    shoulderAccentR.position.set(0.18, 0.18, 0);
    group.add(shoulderAccentR);

    // Legs (simple)
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 12);
    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    leftLeg.position.set(-0.08, -0.25, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    rightLeg.position.set(0.08, -0.25, 0);
    group.add(rightLeg);

    // Base platform
    const baseGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
    const base = new THREE.Mesh(baseGeometry, accentMaterial);
    base.position.y = -0.4;
    base.receiveShadow = true;
    group.add(base);

    group.scale.set(this.options.scale, this.options.scale, this.options.scale);
    group.position.set(0, -0.5, 0);

    this.avatar = group;
    this.scene.add(this.avatar);
    this.mixer = new THREE.AnimationMixer(this.avatar);

    // Add simple rotation animation for placeholder if autoRotate is enabled
    if (this.options.autoRotate) {
      const rotateClip = new THREE.AnimationClip('rotate', 10, [
        new THREE.NumberKeyframeTrack('.rotation[y]', [0, 10], [0, Math.PI * 2])
      ]);
      this.mixer.clipAction(rotateClip).play();
    }

    console.log('✅ Enhanced placeholder avatar created');
  }

  /**
   * Play animation by name
   */
  playAnimation(name, loop = true) {
    if (!this.mixer || !this.avatar) return;

    // Stop current animation
    if (this.currentAnimation) {
      this.currentAnimation.stop();
    }

    // Find animation (Mixamo animations are usually named like: Idle, Talking, etc.)
    let clip = this.animations[name];
    
    // Fallback: search by partial name
    if (!clip) {
      const found = Object.entries(this.animations).find(([key]) =>
        key.toLowerCase().includes(name.toLowerCase())
      );
      clip = found ? found[1] : null;
    }

    if (!clip) {
      console.warn(`Animation "${name}" not found`);
      return;
    }

    const action = this.mixer.clipAction(clip);
    if (loop) {
      action.loop = THREE.LoopRepeat;
    } else {
      action.loop = THREE.LoopOnce;
      action.clampWhenFinished = true;
    }
    action.play();
    this.currentAnimation = action;
    this.isAnimating = true;
  }

  /**
   * Set avatar emotion (changes lighting colors)
   */
  setEmotion(emotion) {
    this.currentEmotion = emotion;

    const emotionColors = {
      idle: { key: 0xffffff, fill: 0x0066ff, back: 0xff6b9d },
      happy: { key: 0xFFD700, fill: 0xFFA500, back: 0xFF6B9D },
      thinking: { key: 0x87CEEB, fill: 0x4FC3F7, back: 0x87CEEB },
      excited: { key: 0xFF6B6B, fill: 0xFFE66D, back: 0xFF6B6B },
      explaining: { key: 0x00D084, fill: 0x42C4E8, back: 0xFF6B9D },
      inspired: { key: 0x9b59b6, fill: 0x3498db, back: 0x9b59b6 }
    };

    const colors = emotionColors[emotion] || emotionColors.idle;

    // Smoothly transition colors
    this.animateLightColor(this.lights.key, colors.key, 300);
    this.animateLightColor(this.lights.fill, colors.fill, 300);
    this.animateLightColor(this.lights.back, colors.back, 300);

    // Update background gradient
    this.updateSceneBackground(emotion);
  }

  /**
   * Animate light color transition
   */
  animateLightColor(light, targetColor, duration = 300) {
    const startColor = light.color.getHex();
    const target = new THREE.Color(targetColor);
    const start = new THREE.Color(startColor);
    const startTime = Date.now();

    const updateColor = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      light.color.lerpColors(start, target, progress);

      if (progress < 1) {
        requestAnimationFrame(updateColor);
      }
    };

    updateColor();
  }

  /**
   * Update scene background based on emotion
   */
  updateSceneBackground(emotion) {
    const backgrounds = {
      idle: { bottom: 0x0a0e27, top: 0x1a1f3a },
      happy: { bottom: 0xFFE5B4, top: 0xFFD700 },
      thinking: { bottom: 0x87CEEB, top: 0x4FC3F7 },
      excited: { bottom: 0xFF6B6B, top: 0xFFE66D },
      explaining: { bottom: 0x00D084, top: 0x42C4E8 },
      inspired: { bottom: 0x9b59b6, top: 0x3498db }
    };

    const bg = backgrounds[emotion] || backgrounds.idle;
    // Subtle background change (keep dark theme)
    const color = new THREE.Color(bg.bottom);
    this.scene.background = color;
  }

  /**
   * Simulate talking animation (lip-sync)
   * @param {number} duration - Duration in milliseconds
   */
  async talkingAnimation(duration = 3000) {
    if (!this.mixer || !this.avatar) return;

    // Look for "Talking" animation or similar
    const talkingClip = Object.entries(this.animations).find(([name]) =>
      name.toLowerCase().includes('talk') || name.toLowerCase().includes('speak')
    )?.[1];

    if (talkingClip) {
      this.playAnimation(talkingClip.name, false);
      await new Promise(resolve => setTimeout(resolve, Math.min(duration, talkingClip.duration * 1000)));
    } else {
      // Fallback: Subtle breathing/idle during speech
      this.playAnimation('idle');
    }
  }

  /**
   * Make avatar look toward chat window
   */
  lookAtChat() {
    if (!this.avatar) return;
    
    const targetX = 0.2;
    const targetZ = 0.5;
    
    // Smooth rotation toward chat
    gsap.to(this.avatar.rotation, {
      y: Math.atan2(targetX, targetZ) * 0.3,
      x: -0.1,
      duration: 0.5,
      ease: 'sine.inOut'
    });
  }

  /**
   * Make avatar return to neutral position
   */
  lookNeutral() {
    if (!this.avatar) return;
    
    gsap.to(this.avatar.rotation, {
      y: 0,
      x: 0,
      z: 0,
      duration: 0.5,
      ease: 'sine.inOut'
    });
  }

  /**
   * Animation loop
   */
  animate() {
    requestAnimationFrame(this.animate);

    // Update mixer
    if (this.mixer) {
      this.mixer.update(1 / 60); // 60fps
    }

    // Gentle auto-rotation
    if (this.options.autoRotate && this.avatar && this.currentEmotion === 'idle') {
      this.avatar.rotation.y += 0.001;
    }

    // Render
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Cleanup
   */
  destroy() {
    window.removeEventListener('resize', this.onWindowResize);
    
    if (this.renderer) {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }

    if (this.scene) {
      this.scene.clear();
    }
  }
}

// Export for use in main.js
window.Avatar3DSystem = Avatar3DSystem;
console.log('✅ Avatar 3D System loaded');