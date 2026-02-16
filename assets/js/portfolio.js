/* ============================================================
   PORTFOLIO.JS - Shared JavaScript
   ============================================================ */

// ---- 1. STICKY NAV ----
(function () {
  var nav = document.getElementById('main-nav');
  if (!nav) return;
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
  // Trigger on load in case page is already scrolled
  nav.classList.toggle('scrolled', window.scrollY > 60);
})();

// ---- 2. MOBILE HAMBURGER MENU ----
(function () {
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    nav.classList.toggle('nav-open');
    var expanded = nav.classList.contains('nav-open');
    toggle.setAttribute('aria-expanded', expanded);
    toggle.innerHTML = expanded ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });

  // Close menu when a link is clicked
  var links = nav.querySelectorAll('.nav-links a');
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });
})();

// ---- 3. SCROLL ANIMATIONS ----
(function () {
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.fade-up').forEach(function (el) {
    observer.observe(el);
  });
})();

// ---- 4. PROJECT FILTER ----
(function () {
  var filterBtns = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('.project-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      // Show/hide cards with animation
      cards.forEach(function (card) {
        if (filter === 'all') {
          card.classList.remove('hidden');
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          var categories = card.dataset.category.split(' ');
          if (categories.indexOf(filter) !== -1) {
            card.classList.remove('hidden');
            card.style.animation = 'fadeIn 0.4s ease forwards';
          } else {
            card.classList.add('hidden');
          }
        }
      });
    });
  });
})();

// ---- 5. CHATBOT ----
(function () {
  // --- Knowledge Base ---
  var KB = {
    greetings: {
      triggers: ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'sup', 'howdy'],
      response:
        "Hi there! \ud83d\udc4b I'm Aishwarya's portfolio assistant. I can tell you about her <b>skills</b>, <b>experience</b>, <b>projects</b>, <b>education</b>, or how to <b>contact</b> her. What would you like to know?",
    },
    skills_general: {
      triggers: ['skills', 'technologies', 'tech stack', 'what can', 'expertise', 'speciali'],
      response:
        "Aishwarya's core skills span: <b>AI/ML</b> (LLMs, RAG, NLP, Fine-tuning, LangChain, CrewAI), <b>Cloud</b> (AWS, GCP), <b>Languages</b> (Python, SQL, TypeScript), and <b>Frameworks</b> (Streamlit, FastAPI, React, Hugging Face). She holds an MS in Artificial Intelligence.",
    },
    python: {
      triggers: ['python'],
      response:
        'Python is Aishwarya\'s primary language. She uses it for ML model development, LLM integration, data pipelines, API development with FastAPI/Django, and automation. Most of her portfolio projects are Python-based.',
    },
    llm: {
      triggers: ['llm', 'large language model', 'language model', 'gpt', 'gemini', 'llama', 'flan'],
      response:
        'Aishwarya has extensive LLM experience: fine-tuning FLAN-T5 with PEFT/LoRA, building apps with Gemini Pro and Llama 2, integrating OpenAI APIs, and using LangChain for orchestration. She\'s worked with models from Hugging Face, Google, Meta, and OpenAI.',
    },
    rag: {
      triggers: ['rag', 'retrieval', 'vector', 'chromadb', 'faiss', 'embedding'],
      response:
        'RAG (Retrieval-Augmented Generation) is one of her key specializations. Her <b>DeveloperDocs-AI-Copilot-RAG</b> project is an end-to-end doc Q&A system with vector embeddings, semantic search, and LLM generation. She works with ChromaDB, FAISS, and semantic embeddings.',
    },
    langchain: {
      triggers: ['langchain', 'lang chain'],
      response:
        'She has a dedicated LangChain project exploring custom LLM deployment, chain construction, and API integration. It covers prompt templates, memory, agents, and tool use within the LangChain framework.',
    },
    agents: {
      triggers: ['agent', 'crewai', 'crew ai', 'openai agent', 'agentic', 'multi-agent'],
      response:
        'Aishwarya has built AI agents using three frameworks: <b>LangChain</b> agents, <b>CrewAI</b> (multi-agent orchestration), and the <b>OpenAI Agents SDK</b>. These projects focus on autonomous task execution and agent-to-agent communication.',
    },
    aws: {
      triggers: ['aws', 'amazon', 'bedrock', 'ec2', 's3', 'ecs', 'cloud'],
      response:
        'She has practical AWS experience including EC2 for model hosting, S3 for storage, ECS with Docker for containerized ML deployments, Bedrock for managed LLM APIs, and GitHub Actions CI/CD pipelines targeting AWS. She also has experience with Google Cloud Platform.',
    },
    mlops: {
      triggers: ['mlops', 'cicd', 'ci/cd', 'docker', 'deployment', 'pipeline', 'monitoring', 'devops'],
      response:
        'MLOps is a strong area. The <b>Student Performance Prediction</b> project demonstrates a full MLOps pipeline: data ingestion, model training, Docker containerization, AWS ECS deployment, GitHub Actions CI/CD, logging, exception handling, and model monitoring.',
    },
    projects: {
      triggers: ['project', 'portfolio', 'github', 'built', 'worked on', 'show me'],
      response:
        'She has 12+ portfolio projects! Categories include: <b>RAG/Agents</b> (DeveloperDocs Copilot, CrewAI, OpenAI Agents), <b>LLM Apps</b> (LangChain, Gemini chatbot, Blog Generator, ATS Checker), <b>NLP/ML</b> (FLAN-T5, Sentence Transformers), <b>MLOps</b> (Student Performance), and <b>Frontend</b> (React TypeScript). <a href="projects.html">See all projects \u2192</a>',
    },
    education: {
      triggers: ['education', 'degree', 'ms', 'masters', 'university', 'study', 'studied', 'graduate', 'school'],
      response:
        'Aishwarya holds a <b>Master of Science in Artificial Intelligence</b>. Her graduate research focused on LLM fine-tuning, culminating in a capstone project fine-tuning FLAN-T5 using PEFT and LoRA techniques with evaluation via the ROUGE metric.',
    },
    experience: {
      triggers: ['experience', 'work', 'job', 'years', 'career', 'professional', 'resume'],
      response:
        'She has nearly <b>3+ years</b> of professional experience as an NLP/ML Software Engineer, building production AI systems, NLP models, and cloud-based deployments. She\'s also a certified Salesforce Administrator and Developer.',
    },
    contact: {
      triggers: ['contact', 'reach', 'email', 'hire', 'available', 'opportunity', 'connect', 'touch', 'linkedin'],
      response:
        'You can reach Aishwarya at <a href="mailto:aishwarya.ap998@gmail.com">aishwarya.ap998@gmail.com</a>, connect on <a href="https://www.linkedin.com/in/aishwarya-pentyala/" target="_blank">LinkedIn</a>, or explore her code on <a href="https://github.com/aishwarya30998" target="_blank">GitHub</a>. She is open to AI/ML engineering roles and research collaborations.',
    },
    react: {
      triggers: ['react', 'typescript', 'frontend', 'javascript', 'web dev'],
      response:
        'Beyond AI/ML, she has a React + TypeScript project: a searchable user list application demonstrating component architecture, state management, and typed interfaces. She also has experience with Django and uses Streamlit extensively for ML app frontends.',
    },
    nlp: {
      triggers: ['nlp', 'natural language', 'text processing', 'sentiment', 'transformer'],
      response:
        'NLP is a core strength. She has experience with transformer models, sentence embeddings (SBERT), text classification, named entity recognition, and building production NLP pipelines. Her Sentence Transformers project demonstrates multi-task learning with embeddings.',
    },
    deep_learning: {
      triggers: ['deep learning', 'neural network', 'tensorflow', 'pytorch', 'reinforcement'],
      response:
        'She has strong deep learning skills with TensorFlow and PyTorch, covering CNNs, RNNs, transformers, and reinforcement learning. Her projects include fine-tuning large models and implementing various neural network architectures.',
    },
    about: {
      triggers: ['about', 'who is', 'tell me about', 'introduce', 'background'],
      response:
        'Aishwarya Pentyala is a <b>DATA/ML/AI Engineer</b> with an MS in AI and 3+ years of experience. She specializes in building production AI systems using LLMs, RAG, NLP, and MLOps. She\'s passionate about turning complex AI research into practical applications.',
    },
    thanks: {
      triggers: ['thank', 'thanks', 'appreciate', 'helpful', 'great'],
      response:
        "You're welcome! Feel free to ask me anything else about Aishwarya's skills, projects, or experience. \ud83d\ude0a",
    },
    default: {
      response:
        "I didn't quite catch that. Try asking about her <b>skills</b>, <b>projects</b>, <b>experience</b>, <b>education</b>, <b>AWS</b>, <b>RAG systems</b>, <b>LangChain</b>, <b>agents</b>, or how to <b>contact</b> her!",
    },
  };

  function getResponse(input) {
    var lower = input.toLowerCase().trim();
    var keys = Object.keys(KB);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (key === 'default') continue;
      var triggers = KB[key].triggers;
      for (var j = 0; j < triggers.length; j++) {
        if (lower.indexOf(triggers[j]) !== -1) {
          return KB[key].response;
        }
      }
    }
    return KB.default.response;
  }

  // --- Inject Chatbot DOM ---
  var chatHTML =
    '<div id="chat-container" class="chat-hidden" aria-live="polite">' +
    '  <div id="chat-header">' +
    '    <div class="chat-avatar">AP</div>' +
    '    <div class="chat-header-text">' +
    '      <div class="chat-name">Aishwarya\'s Assistant</div>' +
    '      <div class="chat-status">Ask me anything</div>' +
    '    </div>' +
    '    <button id="chat-close" aria-label="Close chat">&times;</button>' +
    '  </div>' +
    '  <div id="chat-messages">' +
    '    <div class="chat-message bot-message">' +
    "      Hi! \ud83d\udc4b I'm here to answer questions about Aishwarya's skills, projects, and experience. What would you like to know?" +
    '    </div>' +
    '  </div>' +
    '  <div id="chat-input-row">' +
    '    <input type="text" id="chat-input" placeholder="Ask about skills, projects..." aria-label="Chat message input" maxlength="200" />' +
    '    <button id="chat-send" aria-label="Send message">' +
    '      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>' +
    '    </button>' +
    '  </div>' +
    '</div>' +
    '<button id="chat-toggle" aria-label="Open chat assistant" aria-expanded="false">' +
    '  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>' +
    '</button>';

  document.body.insertAdjacentHTML('beforeend', chatHTML);

  // --- Event Wiring ---
  var container = document.getElementById('chat-container');
  var toggleBtn = document.getElementById('chat-toggle');
  var closeBtn = document.getElementById('chat-close');
  var input = document.getElementById('chat-input');
  var sendBtn = document.getElementById('chat-send');
  var messages = document.getElementById('chat-messages');

  function openChat() {
    container.classList.remove('chat-hidden');
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.style.display = 'none';
    input.focus();
  }

  function closeChat() {
    container.classList.add('chat-hidden');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.style.display = 'flex';
  }

  function addMessage(text, role) {
    var div = document.createElement('div');
    div.className = 'chat-message ' + (role === 'user' ? 'user-message' : 'bot-message');
    div.innerHTML = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function handleSend() {
    var text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    setTimeout(function () {
      addMessage(getResponse(text), 'bot');
    }, 350);
  }

  toggleBtn.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);
  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleSend();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeChat();
  });
})();
