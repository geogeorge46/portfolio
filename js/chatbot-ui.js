/**
 * Chatbot UI Component
 * Handles chat interface rendering and interactions
 */

class ChatbotUI {
  constructor(options = {}) {
    this.options = {
      containerId: options.containerId || 'chatbot-container',
      avatarContainerId: options.avatarContainerId || 'avatar-3d',
      quickButtonsPreset: options.quickButtonsPreset || 'default',
      ...options
    };

    this.container = document.getElementById(this.options.containerId);
    this.messages = [];
    this.isOpen = false;
    this.isSpeaking = false;

    if (this.container) {
      this.init();
    } else {
      console.error(`Container with id "${this.options.containerId}" not found`);
    }
  }

  /**
   * Initialize UI
   */
  init() {
    this.renderChatInterface();
    this.attachEventListeners();
    this.addWelcomeMessage();
    console.log('✅ Chatbot UI initialized');
  }

  /**
   * Render chat interface HTML
   */
  renderChatInterface() {
    this.container.innerHTML = `
      <div class="chatbot-wrapper">
        <div class="chatbot-header">
          <h3>Ask Me Anything 🤖</h3>
          <button class="chatbot-close" aria-label="Close chat">✕</button>
        </div>

        <div class="chatbot-content">
          <div class="chatbot-messages" id="chatMessages"></div>
        </div>

        <div class="chatbot-quick-buttons" id="quickButtons"></div>

        <div class="chatbot-input-area">
          <input 
            type="text" 
            id="chatInput" 
            placeholder="Ask me anything..." 
            maxlength="200"
            aria-label="Chat input"
          />
          <button id="sendBtn" class="send-btn" aria-label="Send message">
            <span>→</span>
          </button>
        </div>

        <div class="chatbot-footer">
          <small>Powered by AI</small>
        </div>
      </div>
    `;

    this.messagesContainer = document.getElementById('chatMessages');
    this.inputElement = document.getElementById('chatInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.quickButtonsContainer = document.getElementById('quickButtons');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Send button
    this.sendBtn?.addEventListener('click', () => this.handleSendMessage());

    // Input enter key
    this.inputElement?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    // Close button
    document.querySelector('.chatbot-close')?.addEventListener('click', () => {
      this.toggleChat();
    });
  }

  /**
   * Add welcome message
   */
  addWelcomeMessage() {
    const greeting = getGreetingVariant ? getGreetingVariant() : "Hey! 👋";
    this.addMessage(
      `${greeting} I'm Geo's AI assistant. Ask me anything about my projects, skills, or how to navigate my portfolio! Feel free to pick a quick button below or type your question. 😊`,
      'bot',
      'happy'
    );
    this.renderQuickButtons();
  }

  /**
   * Handle sending message
   */
  async handleSendMessage() {
    const userMessage = this.inputElement?.value.trim();
    if (!userMessage) return;

    // Clear input
    this.inputElement.value = '';
    this.inputElement.focus();

    // Add user message to UI
    this.addMessage(userMessage, 'user');

    // Show typing indicator
    this.showTypingIndicator();

    // Get response from chatbot
    try {
      const response = await window.chatbotAPI?.sendMessage(userMessage);
      
      if (response) {
        // Remove typing indicator
        this.removeTypingIndicator();

        // Update avatar emotion
        if (window.avatar3D) {
          window.avatar3D.setEmotion(response.avatar_emotion);
          window.avatar3D.lookAtChat();
          // Speak
          this.speakResponse(response.response);
          // Play talking animation
          await window.avatar3D.talkingAnimation(2000);
          window.avatar3D.lookNeutral();
        }

        // Add bot response to UI
        this.addMessage(response.response, 'bot', response.avatar_emotion);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      this.removeTypingIndicator();
      this.addMessage(
        "Sorry, I had a little glitch! 🤔 Could you try asking again?",
        'bot',
        'thinking'
      );
    }
  }

  /**
   * Add message to chat
   * @param {string} text - Message text
   * @param {string} role - 'user' or 'bot'
   * @param {string} emotion - Avatar emotion (for styling)
   */
  addMessage(text, role = 'user', emotion = 'idle') {
    const messageObj = {
      text,
      role,
      emotion,
      timestamp: Date.now()
    };

    this.messages.push(messageObj);

    const messageEl = document.createElement('div');
    messageEl.className = `chat-message chat-${role}`;
    messageEl.setAttribute('data-emotion', emotion);

    // Format message (support markdown-like formatting)
    const formattedText = this.formatMessageText(text);

    messageEl.innerHTML = `
      <div class="message-content">
        ${formattedText}
      </div>
      <div class="message-time">${this.formatTime(new Date())}</div>
    `;

    this.messagesContainer?.appendChild(messageEl);

    // Scroll to bottom
    setTimeout(() => this.scrollToBottom(), 50);

    // Fade in animation
    gsap.fromTo(messageEl, 
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3 }
    );
  }

  /**
   * Format message text (simple markdown support)
   */
  formatMessageText(text) {
    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert new lines to <br>
    text = text.replace(/\n/g, '<br>');

    // Add line breaks before emoji-prefixed lines
    text = text.replace(/\n([✨🚀💻🎮☕🌙🎨🤖])/g, '<br>$1');

    return text;
  }

  /**
   * Format time
   */
  formatTime(date) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    const typingEl = document.createElement('div');
    typingEl.className = 'chat-message chat-bot typing-indicator';
    typingEl.id = 'typingIndicator';
    typingEl.innerHTML = `
      <div class="message-content">
        <span></span><span></span><span></span>
      </div>
    `;

    this.messagesContainer?.appendChild(typingEl);
    this.scrollToBottom();
  }

  /**
   * Remove typing indicator
   */
  removeTypingIndicator() {
    const typingEl = document.getElementById('typingIndicator');
    if (typingEl) {
      gsap.to(typingEl, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => typingEl.remove()
      });
    }
  }

  /**
   * Render quick buttons
   */
  renderQuickButtons() {
    if (!this.quickButtonsContainer) return;

    const questions = window.chatbotAPI?.getSuggestedQuestions?.() || [
      "Show me your projects",
      "What's your tech stack?",
      "Tell me about hackathons",
      "What are you learning?",
      "How to contact you?"
    ];

    this.quickButtonsContainer.innerHTML = '';

    questions.forEach((question) => {
      const btn = document.createElement('button');
      btn.className = 'quick-button';
      btn.textContent = question;
      btn.addEventListener('click', () => {
        this.inputElement.value = question;
        this.handleSendMessage();
      });

      this.quickButtonsContainer.appendChild(btn);
    });
  }

  /**
   * Speak response using Web Speech API
   */
  speakResponse(text) {
    if (!window.speechSynthesis || this.isSpeaking) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      this.isSpeaking = true;
      console.log('🔊 Speaking...');
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      console.log('✅ Speech complete');
    };

    utterance.onerror = (event) => {
      console.error('❌ Speech error:', event.error);
      this.isSpeaking = false;
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Scroll to bottom of messages
   */
  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  /**
   * Toggle chat visibility
   */
  toggleChat() {
    this.isOpen = !this.isOpen;
    this.container?.classList.toggle('chatbot-open', this.isOpen);

    if (this.isOpen) {
      this.inputElement?.focus();
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  /**
   * Open chat
   */
  open() {
    if (!this.isOpen) {
      this.toggleChat();
    }
  }

  /**
   * Close chat
   */
  close() {
    if (this.isOpen) {
      this.toggleChat();
    }
  }

  /**
   * Clear chat
   */
  clearChat() {
    this.messages = [];
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = '';
    }
    if (window.chatbotAPI) {
      window.chatbotAPI.clearHistory();
    }
    this.addWelcomeMessage();
  }

  /**
   * Get messages
   */
  getMessages() {
    return this.messages;
  }
}

// Export for use
window.ChatbotUI = ChatbotUI;
console.log('✅ Chatbot UI Component loaded');