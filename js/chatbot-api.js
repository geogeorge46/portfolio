/**
 * Chatbot API Service
 * Handles communication with AI backend and knowledge base
 * Supports: TorGPT API, Dialogflow, and fallback rule-based responses
 */

class ChatbotAPI {
  constructor(options = {}) {
    this.options = {
      apiType: options.apiType || 'knowledge-base', // 'knowledge-base', 'torgpt', 'dialogflow'
      apiKey: options.apiKey || null,
      apiUrl: options.apiUrl || null,
      useKnowledgeBase: options.useKnowledgeBase !== false,
      ...options
    };

    this.conversationHistory = [];
    this.isProcessing = false;
    this.cache = {};
    
    console.log(`✅ Chatbot API initialized (Mode: ${this.options.apiType})`);
  }

  /**
   * Send message and get response
   * @param {string} userMessage - User's input
   * @returns {Promise<object>} Response with text, emotion, gesture
   */
  async sendMessage(userMessage) {
    if (this.isProcessing) {
      return this.getCachedResponse(userMessage) || this.getDefaultResponse();
    }

    this.isProcessing = true;

    try {
      // Add to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: Date.now()
      });

      // Keep only last 10 messages for context
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      let response;

      // Try knowledge base first if enabled
      if (this.options.useKnowledgeBase) {
        response = findKnowledgeBaseResponse(userMessage);
        if (response.response) {
          this.conversationHistory.push({
            role: 'assistant',
            content: response.response,
            emotion: response.avatar_emotion,
            gesture: response.avatar_gesture,
            timestamp: Date.now()
          });
          this.isProcessing = false;
          return response;
        }
      }

      // Try API
      switch (this.options.apiType) {
        case 'torgpt':
          response = await this.queryTorGPT(userMessage);
          break;
        case 'dialogflow':
          response = await this.queryDialogflow(userMessage);
          break;
        default:
          response = this.getDefaultResponse(userMessage);
      }

      // Add response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response.response,
        emotion: response.avatar_emotion,
        timestamp: Date.now()
      });

      // Cache response
      this.cache[userMessage.toLowerCase()] = response;

      this.isProcessing = false;
      return response;

    } catch (error) {
      console.error('❌ Chatbot API error:', error);
      this.isProcessing = false;
      return this.getDefaultResponse(userMessage);
    }
  }

  /**
   * Query TorGPT API
   * @param {string} message - User message
   * @returns {Promise<object>} Response
   */
  async queryTorGPT(message) {
    if (!this.options.apiKey) {
      console.warn('⚠️ TorGPT API key not provided, using knowledge base');
      return findKnowledgeBaseResponse(message);
    }

    try {
      // Build prompt with context
      const systemPrompt = `You are Geo George's personal AI assistant. You're friendly, helpful, and knowledgeable about Geo's skills, projects, and experiences. 
Keep responses concise (2-3 sentences), conversational, and slightly humorous. You're like a personal guide through his portfolio.
Format responses with emoji and personality.`;

      const response = await fetch('https://api.torgpt.org/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.options.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...this.conversationHistory.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        throw new Error(`TorGPT API error: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = data.choices[0].message.content;

      return {
        response: botMessage,
        avatar_emotion: this.detectEmotion(botMessage),
        avatar_gesture: this.detectGesture(botMessage),
        source: 'torgpt'
      };

    } catch (error) {
      console.error('❌ TorGPT query failed:', error);
      // Fallback to knowledge base
      return findKnowledgeBaseResponse(message);
    }
  }

  /**
   * Query Dialogflow API
   * @param {string} message - User message
   * @returns {Promise<object>} Response
   */
  async queryDialogflow(message) {
    if (!this.options.apiKey || !this.options.projectId) {
      console.warn('⚠️ Dialogflow credentials not provided, using knowledge base');
      return findKnowledgeBaseResponse(message);
    }

    try {
      const response = await fetch(
        `https://dialogflow.googleapis.com/v2/projects/${this.options.projectId}/agent/sessions/user123:detectIntent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.options.apiKey}`
          },
          body: JSON.stringify({
            queryInput: {
              text: {
                text: message,
                languageCode: 'en-US'
              }
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Dialogflow API error: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = data.queryResult?.fulfillmentText || this.getDefaultResponse(message).response;

      return {
        response: botMessage,
        avatar_emotion: this.detectEmotion(botMessage),
        avatar_gesture: this.detectGesture(botMessage),
        source: 'dialogflow'
      };

    } catch (error) {
      console.error('❌ Dialogflow query failed:', error);
      return findKnowledgeBaseResponse(message);
    }
  }

  /**
   * Detect emotion from response text
   */
  detectEmotion(text) {
    const emotions = {
      happy: ['😄', '😊', '🎉', '🥳', 'awesome', 'great', 'love', 'fun', '😆'],
      excited: ['🚀', '✨', '💡', '🎊', 'exciting', 'wow', 'amazing', '🤩'],
      thinking: ['🤔', 'hmm', 'interesting', 'consider', 'think', 'actually'],
      explaining: ['📚', '💻', 'stack', 'technology', 'built', 'created', 'developed'],
      inspired: ['🌟', '💫', '🎯', 'future', 'goals', 'dream', 'possibility']
    };

    let matchedEmotion = 'idle';
    let maxMatches = 0;

    for (const [emotion, keywords] of Object.entries(emotions)) {
      const matches = keywords.filter(kw => text.toLowerCase().includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        matchedEmotion = emotion;
      }
    }

    return matchedEmotion;
  }

  /**
   * Detect gesture from response text
   */
  detectGesture(text) {
    const gestures = {
      hand_gesture: ['show', 'check', 'see', 'explore', 'look'],
      pointing: ['that', 'this', 'there', 'here', 'project'],
      thinking: ['consider', 'think', 'hmm', 'wonder'],
      wave: ['hello', 'hi', 'hey', 'welcome', 'greetings'],
      celebratory: ['won', 'achieved', 'success', 'award', 'victory'],
      friendly: ['connect', 'reach', 'contact', 'chat', 'talk']
    };

    let matchedGesture = 'confident';
    let maxMatches = 0;

    for (const [gesture, keywords] of Object.entries(gestures)) {
      const matches = keywords.filter(kw => text.toLowerCase().includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        matchedGesture = gesture;
      }
    }

    return matchedGesture;
  }

  /**
   * Get default response
   */
  getDefaultResponse(userMessage = '') {
    return {
      response: `Sorry, I didn't quite understand that. Could you rephrase? 🤔 Or try asking about my projects, skills, or how to contact me!`,
      avatar_emotion: 'thinking',
      avatar_gesture: 'curious',
      source: 'fallback'
    };
  }

  /**
   * Get cached response
   */
  getCachedResponse(userMessage) {
    return this.cache[userMessage.toLowerCase()];
  }

  /**
   * Set API key dynamically
   */
  setAPIKey(apiKey, apiType = 'torgpt') {
    this.options.apiKey = apiKey;
    this.options.apiType = apiType;
    console.log(`✅ API key updated for ${apiType}`);
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Clear conversation
   */
  clearHistory() {
    this.conversationHistory = [];
    this.cache = {};
    console.log('✅ Conversation history cleared');
  }

  /**
   * Get suggested quick buttons
   */
  getSuggestedQuestions() {
    return [
      "Show me your projects",
      "What's your tech stack?",
      "Tell me about hackathons",
      "What are you learning?",
      "Fun fact about you",
      "How to contact you?"
    ];
  }
}

// Export for use
window.ChatbotAPI = ChatbotAPI;
console.log('✅ Chatbot API Service loaded');