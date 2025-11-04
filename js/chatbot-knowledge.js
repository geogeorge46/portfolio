/**
 * Chatbot Knowledge Base
 * Predefined FAQ answers about Geo George
 * Falls back to TorGPT API if no match found
 */

const CHATBOT_KNOWLEDGE_BASE = {
  // Projects
  "show me your projects": {
    keywords: ["project", "show me", "portfolio", "work"],
    response: `I've worked on some exciting projects! Here are my favorites:

🚀 **AI-Powered Portfolio** - Built this very website with immersive scroll effects, parallax backgrounds, and smooth animations using GSAP and Three.js.

🤖 **Machine Learning Pipeline** - Created an end-to-end ML pipeline for data preprocessing, model training, and deployment with Python and scikit-learn.

💻 **Open Source Contributions** - Active contributor to several open-source projects in web development and Python ecosystems.

Want to see more details about any specific project?`,
    avatar_emotion: "excited",
    avatar_gesture: "hand_gesture"
  },

  "what are your projects": {
    keywords: ["project", "what", "do"],
    response: `I've worked on several interesting projects! Let me tell you about them... 🚀`,
    avatar_emotion: "explaining",
    avatar_gesture: "hand_gesture"
  },

  // Skills & Tech Stack
  "tell me about your skills": {
    keywords: ["skill", "tech stack", "technology", "expertise"],
    response: `My tech stack includes:

**Languages**: Python, JavaScript, Java, SQL

**Web**: React, Node.js, Express, HTML/CSS, Three.js

**AI/ML**: TensorFlow, scikit-learn, Pandas, NumPy

**Tools**: Git, Docker, REST APIs, Databases (PostgreSQL, MongoDB)

**Design**: UI/UX principles, Figma, Responsive Design

I'm particularly strong in full-stack web development and AI/ML applications. What would you like to know more about?`,
    avatar_emotion: "explaining",
    avatar_gesture: "confident"
  },

  "what's your favorite tech stack": {
    keywords: ["favorite", "tech stack", "prefer"],
    response: `Ooh, tough question! 😄 I love building with:

**Frontend**: React + Three.js (beautiful, interactive UIs!)
**Backend**: Node.js + Express (fast and scalable)
**Database**: PostgreSQL (reliable and powerful)
**ML**: Python + TensorFlow (endless possibilities!)

The best tech stack is the one that solves your problem efficiently. But if I'm building something fun? React + Three.js all day!`,
    avatar_emotion: "happy",
    avatar_gesture: "thinking"
  },

  // Hackathons
  "tell me about your hackathons": {
    keywords: ["hackathon", "competition", "award", "achievement"],
    response: `I've participated in several hackathons and competitions! 🏆

**Key Achievements:**
- Built innovative prototypes under time pressure
- Collaborated with talented developers and designers
- Learned new technologies rapidly
- Won recognition for creative problem-solving

My favorite part is the energy and creativity - bringing ideas to life in 24-48 hours is exhilarating!

Want to know about a specific project from a hackathon?`,
    avatar_emotion: "excited",
    avatar_gesture: "celebratory"
  },

  // Learning & Future
  "what are you learning right now": {
    keywords: ["learning", "studying", "next", "currently"],
    response: `Great question! Currently, I'm exploring:

📚 **Advanced AI/ML**: Deep learning, transformers, and LLM applications
🎮 **3D Graphics**: WebGL, advanced Three.js techniques, shader programming
⚡ **Performance Optimization**: Web performance, algorithm efficiency, and system design
🔐 **Web Security**: Authentication, encryption, and secure coding practices

I believe in continuous learning - tech evolves so fast, and staying curious is key! 🚀`,
    avatar_emotion: "thinking",
    avatar_gesture: "curious"
  },

  "what's next for you": {
    keywords: ["next", "future", "plans", "goal"],
    response: `My next goals are:

1. **Build innovative AI projects** - Applying cutting-edge AI to real-world problems
2. **Master advanced web technologies** - Deep dive into WebGL, VR/AR development
3. **Contribute more to open source** - Give back to the community
4. **Lead impactful projects** - Help teams build products that matter

The future is full of possibilities, and I'm excited to be part of building it! 💡`,
    avatar_emotion: "inspired",
    avatar_gesture: "pointing"
  },

  // About Me
  "tell me about yourself": {
    keywords: ["about", "who", "introduce", "yourself"],
    response: `Hey! I'm Geo George 👋

**Who I Am:**
- Integrated MCA student (specialized in Software Development)
- Full-stack developer & AI/ML enthusiast
- Open source contributor
- Passionate about creating beautiful, functional digital experiences

**What I Do:**
- Build responsive web applications with modern frameworks
- Develop AI/ML solutions
- Contribute to open-source projects
- Continuously learn and experiment with new tech

**What I'm About:**
- Problem-solving and creative thinking
- Collaboration and knowledge sharing
- Building projects that matter
- Clean code and best practices

Feel free to explore my portfolio and reach out if you'd like to connect! 🤝`,
    avatar_emotion: "happy",
    avatar_gesture: "friendly"
  },

  "how can i contact you": {
    keywords: ["contact", "reach", "email", "connect", "dm"],
    response: `Great! You can reach me through:

📧 **Email**: Check the contact section below
💼 **LinkedIn**: linkedin.com/in/geogeorge
💻 **GitHub**: github.com/geogeorge
🐦 **Twitter/X**: @geogeorge

Or just scroll down to the contact section and send me a message directly! I love connecting with people. 🤝`,
    avatar_emotion: "friendly",
    avatar_gesture: "wave"
  },

  // Navigation Tips
  "show me your portfolio": {
    keywords: ["portfolio", "navigate", "show", "tour"],
    response: `Welcome to my portfolio! 🎉

Here's what you can explore:

📌 **About** - Learn more about me and my background
🛠️ **Skills** - Check out my tech stack and expertise
🚀 **Projects** - See what I've built
💼 **Experience** - My journey and achievements
💬 **Chat** - Ask me anything (that's me!)
📬 **Contact** - Get in touch!

Just click on any section in the navigation, or scroll down to explore. Want me to highlight a specific section?`,
    avatar_emotion: "happy",
    avatar_gesture: "showing"
  },

  "what are your achievements": {
    keywords: ["achievement", "award", "accomplishment", "success"],
    response: `Here are some of my key achievements:

🎓 **Academic**: Pursuing Integrated MCA in Software Development
🏆 **Competitions**: Participated and won recognition in hackathons
📦 **Open Source**: Active contributor with multiple projects
💻 **Projects**: Built several production-ready applications
🌟 **Skills**: Mastered multiple programming languages and frameworks

What matters most to me is the impact and learning journey behind each achievement. Every project teaches me something new! 🚀`,
    avatar_emotion: "proud",
    avatar_gesture: "confident"
  },

  // Fun Facts
  "tell me a fun fact": {
    keywords: ["fun fact", "interesting", "funny", "fun"],
    response: `Fun facts about me:

🎮 When I'm not coding, I love gaming and exploring new tech!
☕ I code better with coffee (lots of it ☕☕☕)
🌙 I'm a night owl - my best coding happens after midnight
🎨 I'm obsessed with UI/UX design and beautiful interfaces
🚀 I dream of building the next viral tech product
🤖 I'm fascinated by AI and how it'll shape the future

What else would you like to know? 😄`,
    avatar_emotion: "happy",
    avatar_gesture: "playful"
  },

  // Default Greeting
  "hello": {
    keywords: ["hi", "hello", "hey", "greetings"],
    response: `Hey there! 👋 I'm Geo, nice to meet you! 

I'm here to answer any questions about me, my projects, skills, or help you navigate my portfolio. You can ask me things like:

✨ "Show me your projects"
✨ "What's your favorite tech stack?"
✨ "Tell me about your hackathons"
✨ "How can I contact you?"

What would you like to know?`,
    avatar_emotion: "happy",
    avatar_gesture: "wave"
  },

  // Default Fallback
  "default": {
    keywords: [],
    response: `That's an interesting question! 🤔 Let me think about that...

I'm still learning, so if you asked something specific about me that I don't have in my knowledge base, you can:

📧 Email me directly for detailed answers
💬 Check the FAQ section below
🔗 Visit my GitHub or LinkedIn

Or try asking me about:
- My projects and work
- Tech skills and stack
- Hackathons and achievements
- What I'm learning
- How to contact me

What else can I help with?`,
    avatar_emotion: "thinking",
    avatar_gesture: "curious"
  }
};

/**
 * Find best matching response from knowledge base
 * @param {string} userMessage - User's input message
 * @returns {object} - Response data with text and animations
 */
function findKnowledgeBaseResponse(userMessage) {
  const normalizedMessage = userMessage.toLowerCase().trim();

  // Exact match first
  if (CHATBOT_KNOWLEDGE_BASE[normalizedMessage]) {
    return CHATBOT_KNOWLEDGE_BASE[normalizedMessage];
  }

  // Keyword matching
  for (const [key, data] of Object.entries(CHATBOT_KNOWLEDGE_BASE)) {
    const allKeywords = [key, ...data.keywords];
    const hasMatch = allKeywords.some(keyword =>
      normalizedMessage.includes(keyword.toLowerCase())
    );
    if (hasMatch) {
      return data;
    }
  }

  // No match - return default
  return CHATBOT_KNOWLEDGE_BASE.default;
}

/**
 * Generate a random greeting variant
 */
function getGreetingVariant() {
  const greetings = [
    "Heyy! 👋",
    "What's up! 🚀",
    "Hey there! ✨",
    "Heya! 😄",
    "Hi! Good to see you 👍"
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

// Make available globally (no ES6 exports - scripts are loaded as regular scripts, not modules)
window.CHATBOT_KNOWLEDGE_BASE = CHATBOT_KNOWLEDGE_BASE;
window.findKnowledgeBaseResponse = findKnowledgeBaseResponse;
window.getGreetingVariant = getGreetingVariant;