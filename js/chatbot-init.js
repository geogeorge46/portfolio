/**
 * Chatbot Initialization Script
 * Ties together all components: Avatar, API, UI
 */

class ChatbotSystem {
  constructor(options = {}) {
    this.options = {
      avatarContainerId: options.avatarContainerId || 'avatar-3d',
      chatContainerId: options.chatContainerId || 'chatbot-container',
      apiKey: options.apiKey || null,
      apiType: options.apiType || 'knowledge-base',
      modelPath: options.modelPath || '/assets/avatar-model.glb',
      enableVoice: options.enableVoice !== false,
      autoInit: options.autoInit !== false,
      ...options
    };

    this.avatar3D = null;
    this.aboutAvatar3D = null;
    this.chatbotAPI = null;
    this.chatbotUI = null;
    this.isReady = false;

    if (this.options.autoInit) {
      this.init();
    }
  }

  /**
   * Initialize chatbot system
   */
  async init() {
    console.log('🤖 Initializing Chatbot System...');

    try {
      // Initialize API
      this.initAPI();

      // Initialize Avatar
      await this.initAvatar();

      // Initialize UI
      this.initUI();

      // Bind components
      this.bindComponents();

      this.isReady = true;
      console.log('✅ Chatbot System fully initialized');

      // Emit ready event
      document.dispatchEvent(new CustomEvent('chatbotReady', {
        detail: { system: this }
      }));

    } catch (error) {
      console.error('❌ Chatbot initialization error:', error);
    }
  }

  /**
   * Initialize API
   */
  initAPI() {
    this.chatbotAPI = new ChatbotAPI({
      apiKey: this.options.apiKey,
      apiType: this.options.apiType,
      useKnowledgeBase: true
    });

    window.chatbotAPI = this.chatbotAPI;
    console.log('✅ Chatbot API initialized');
  }

  /**
   * Initialize Avatar
   */
  async initAvatar() {
    return new Promise((resolve) => {
      const container = document.getElementById(this.options.avatarContainerId);

      if (!container) {
        console.warn(`Avatar container "${this.options.avatarContainerId}" not found`);
        resolve();
        return;
      }

      // Check if Three.js is loaded
      if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded, waiting...');
        window.addEventListener('load', () => {
          this.initAvatarInternal();
          resolve();
        });
      } else {
        this.initAvatarInternal();
        resolve();
      }
    });
  }

  /**
   * Initialize avatar (internal)
   */
  initAvatarInternal() {
    try {
      this.avatar3D = new Avatar3DSystem(this.options.avatarContainerId, {
        modelPath: this.options.modelPath,
        scale: 1.5,
        autoRotate: true,
        environment: 'default'
      });

      window.avatar3D = this.avatar3D;
      console.log('✅ Avatar 3D System initialized');
    } catch (error) {
      console.error('❌ Avatar initialization error:', error);
    }
  }

  /**
   * Initialize About Avatar
   */
  async initAboutAvatar() {
    return new Promise((resolve) => {
      const container = document.getElementById('about-avatar-3d');

      if (!container) {
        console.warn('About avatar container not found');
        resolve();
        return;
      }

      // Check if Three.js is loaded
      if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded for about avatar');
        resolve();
        return;
      }

      try {
        this.aboutAvatar3D = new Avatar3DSystem('about-avatar-3d', {
          modelPath: this.options.modelPath,
          scale: 0.8,
          autoRotate: false,
          environment: 'default'
        });

        console.log('✅ About Avatar 3D System initialized');
        resolve();
      } catch (error) {
        console.error('❌ About avatar initialization error:', error);
        resolve();
      }
    });
  }

  /**
   * Initialize UI
   */
  initUI() {
    this.chatbotUI = new ChatbotUI({
      containerId: this.options.chatContainerId,
      avatarContainerId: this.options.avatarContainerId,
      quickButtonsPreset: 'default'
    });

    window.chatbotUI = this.chatbotUI;
    console.log('✅ Chatbot UI initialized');
  }

  /**
   * Bind all components together
   */
  bindComponents() {
    // Listen for UI events
    const chatContainer = document.getElementById(this.options.chatContainerId);
    if (chatContainer) {
      chatContainer.addEventListener('sendMessage', (e) => {
        console.log('Message sent:', e.detail);
      });
    }

    // Listen for avatar loaded
    const avatarContainer = document.getElementById(this.options.avatarContainerId);
    if (avatarContainer) {
      avatarContainer.addEventListener('avatarLoaded', (e) => {
        console.log('Avatar loaded event fired');
      });
    }

    // About avatar click to navigate to chat
    const aboutAvatarEl = document.getElementById('about-avatar-img');
    if (aboutAvatarEl) {
      aboutAvatarEl.addEventListener('click', () => {
        // Scroll to chatbot section
        document.getElementById('chatbot')?.scrollIntoView({ behavior: 'smooth' });
        // Open the chat
        this.chatbotUI?.open();
      });
    }

    console.log('✅ Components bound successfully');
  }

  /**
   * Set API key dynamically
   */
  setAPIKey(apiKey, apiType = 'torgpt') {
    if (this.chatbotAPI) {
      this.chatbotAPI.setAPIKey(apiKey, apiType);
      console.log(`✅ API key updated for ${apiType}`);
    }
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      ready: this.isReady,
      avatar: this.avatar3D ? 'initialized' : 'not initialized',
      api: this.chatbotAPI ? 'initialized' : 'not initialized',
      ui: this.chatbotUI ? 'initialized' : 'not initialized'
    };
  }

  /**
   * Destroy system
   */
  destroy() {
    if (this.avatar3D) {
      this.avatar3D.destroy();
    }
    if (this.chatbotUI) {
      // Clean up UI
    }
    this.isReady = false;
    console.log('✅ Chatbot system destroyed');
  }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if elements exist before initializing
  const avatarEl = document.getElementById('avatar-3d');
  const chatEl = document.getElementById('chatbot-container');

  if (avatarEl && chatEl) {
    window.chatbotSystem = new ChatbotSystem({
      avatarContainerId: 'avatar-3d',
      chatContainerId: 'chatbot-container',
      autoInit: true
    });
  }
});

// Export
window.ChatbotSystem = ChatbotSystem;
console.log('✅ Chatbot System loaded');