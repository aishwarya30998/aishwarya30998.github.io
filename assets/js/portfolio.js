// PORTFOLIO.JS - Shared JavaScript

// ---- 1. STICKY NAV ----
(function () {
  var nav = document.getElementById("main-nav");
  if (!nav) return;
  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 60);
  });
  // Trigger on load in case page is already scrolled
  nav.classList.toggle("scrolled", window.scrollY > 60);
})();

// ---- 2. MOBILE HAMBURGER MENU ----
(function () {
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    nav.classList.toggle("nav-open");
    var expanded = nav.classList.contains("nav-open");
    toggle.setAttribute("aria-expanded", expanded);
    toggle.innerHTML = expanded
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  });

  // Close menu when a link is clicked
  var links = nav.querySelectorAll(".nav-links a");
  links.forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
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
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  );

  document.querySelectorAll(".fade-up").forEach(function (el) {
    observer.observe(el);
  });
})();

// ---- 4. PROJECT FILTER ----
(function () {
  var filterBtns = document.querySelectorAll(".filter-btn");
  var cards = document.querySelectorAll(".project-card");
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");

      // Show/hide cards with animation
      cards.forEach(function (card) {
        if (filter === "all") {
          card.classList.remove("hidden");
          card.style.animation = "fadeIn 0.4s ease forwards";
        } else {
          var categories = card.dataset.category.split(" ");
          if (categories.indexOf(filter) !== -1) {
            card.classList.remove("hidden");
            card.style.animation = "fadeIn 0.4s ease forwards";
          } else {
            card.classList.add("hidden");
          }
        }
      });
    });
  });
})();

// ---- 5. CHATBOT ----
(function () {
  // --- Langfuse Tracing ---
  var LANGFUSE_HOST = "https://aishwarya30998-langfuse-tracing.hf.space";
  var LANGFUSE_PUBLIC_KEY = "pk-lf-88d4cf5a-2505-4759-bc71-4c84ba6f6223";
  var LANGFUSE_SECRET_KEY = "sk-lf-8ee958e9-4551-4d5c-8372-ad4202439c6e";

  var traceQueue = [];
  var langfuseAwake = false;
  var wakeUpInProgress = false;

  function sendTraceRequest(userMessage, botResponse) {
    return fetch(LANGFUSE_HOST + "/api/public/ingestion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(LANGFUSE_PUBLIC_KEY + ":" + LANGFUSE_SECRET_KEY),
      },
      body: JSON.stringify({
        batch: [
          {
            id: crypto.randomUUID(),
            type: "trace-create",
            timestamp: new Date().toISOString(),
            body: {
              id: crypto.randomUUID(),
              name: "portfolio-chat",
              input: { message: userMessage },
              output: { response: botResponse },
              metadata: {
                source: "portfolio-website",
                page: window.location.pathname,
                userAgent: navigator.userAgent,
              },
            },
          },
        ],
      }),
    });
  }

  function flushQueue() {
    var pending = traceQueue.slice();
    traceQueue = [];
    pending.forEach(function (item) {
      sendTraceRequest(item.input, item.output).catch(function () {});
    });
  }

  function wakeLangfuse(callback) {
    if (langfuseAwake) { callback(); return; }
    if (wakeUpInProgress) { return; }
    wakeUpInProgress = true;
    var attempts = 0;
    var maxAttempts = 6; // retry for ~60s

    function ping() {
      fetch(LANGFUSE_HOST, { method: "HEAD", mode: "no-cors" })
        .then(function () {
          // Wait a few seconds after first response for full startup
          setTimeout(function () {
            langfuseAwake = true;
            wakeUpInProgress = false;
            callback();
            // Mark as sleeping again after 30 min of no activity
            setTimeout(function () { langfuseAwake = false; }, 30 * 60 * 1000);
          }, 5000);
        })
        .catch(function () {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(ping, 10000);
          } else {
            wakeUpInProgress = false;
          }
        });
    }
    ping();
  }

  function sendTrace(userMessage, botResponse) {
    if (langfuseAwake) {
      sendTraceRequest(userMessage, botResponse).catch(function () {
        // If it fails, Space may have gone to sleep — queue and retry
        langfuseAwake = false;
        traceQueue.push({ input: userMessage, output: botResponse });
        wakeLangfuse(flushQueue);
      });
    } else {
      traceQueue.push({ input: userMessage, output: botResponse });
      wakeLangfuse(flushQueue);
    }
  }

  // Wake up Langfuse when the page loads so it's ready for first chat
  wakeLangfuse(function () {});

  // --- Knowledge Base ---
  var KB = {
    greetings: {
      triggers: ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening", "sup", "howdy"],
      response: "Hi there! 👋 I'm Aishwarya's portfolio assistant. I can answer questions about her <b>projects</b>, <b>skills</b>, <b>work experience</b>, <b>education</b>, or how to <b>contact</b> her. What would you like to know?",
    },

    about: {
      triggers: ["about", "who is", "tell me about", "introduce", "background", "summary"],
      response: "Aishwarya Pentyala is an <b>AI/ML Engineer</b> with 4+ years of experience specializing in Generative AI, LLMs, RAG systems, and cloud-native AI architectures. She started as a full-stack/backend developer, transitioned into ML engineering, and holds an <b>MS in Artificial Intelligence</b> from the University of Bridgeport. She's built production AI systems for healthcare (HIPAA-compliant RAG, voice assistants, clinical document automation) and fintech (fraud detection, transaction anomaly detection).",
    },

    skills_general: {
      triggers: ["skills", "technologies", "tech stack", "what can", "expertise", "speciali", "tools"],
      response: "Aishwarya's tech stack: <b>LLMs & GenAI</b> — GPT-4o, Claude 3, Llama 3, FLAN-T5, Gemini, PEFT/LoRA, Prompt Engineering. <b>RAG & Agents</b> — LangChain, ChromaDB, FAISS, Azure AI Search, CrewAI, OpenAI Agents SDK, MCP. <b>Cloud</b> — AWS Bedrock, Lambda, S3, ECS, API Gateway, Azure OpenAI, GCP. <b>Observability</b> — Langfuse, ROUGE, LLM-as-a-Judge. <b>Backend</b> — Python, FastAPI, Pydantic, SQLAlchemy, Node.js, REST APIs. <b>ML/Data</b> — Scikit-learn, XGBoost, Pandas, Sentence Transformers, Hugging Face. <b>Frontend</b> — React, TypeScript, Streamlit.",
    },

    python: {
      triggers: ["python"],
      response: "Python is Aishwarya's primary language. She uses it for LLM integration, RAG pipelines, FastAPI/Pydantic API development, ML model training, feature engineering, and automation. All 14 of her portfolio projects are Python-based.",
    },

    fastapi_pydantic: {
      triggers: ["fastapi", "pydantic", "url shortener", "url short", "rest api", "api development", "sqlalchemy", "uvicorn"],
      response: "Aishwarya has strong FastAPI + Pydantic experience. Her <b>URL Shortener API</b> project showcases this: a full-stack REST API with custom key generation, click tracking analytics, admin endpoints, and auto-generated Swagger UI docs — backed by SQLite via SQLAlchemy ORM with clean separation across <code>schemas.py</code>, <code>crud.py</code>, <code>models.py</code>, and <code>keygen.py</code>, served with Uvicorn. She also uses FastAPI in production at Healthyr to expose LLM inference endpoints and manage conversation memory. <a href='projects.html'>View project →</a>",
    },

    llm: {
      triggers: ["llm", "large language model", "language model", "gpt", "gpt-4", "gemini", "llama", "flan", "claude", "foundation model"],
      response: "Aishwarya works with the full spectrum of LLMs: <b>GPT-4o</b> (Azure OpenAI — clinical document automation at Vertex), <b>Claude 3</b> (AWS Bedrock — healthcare RAG at Healthyr & ABM Tech), <b>Llama 3</b> (AWS Bedrock — high-volume summarization), <b>Gemini Pro</b> (Smart ATS Checker, Invoice Extractor), and <b>FLAN-T5</b> (fine-tuning via PEFT/LoRA for her MS capstone). She handles model selection, prompt tuning, and evaluation in production.",
    },

    rag: {
      triggers: ["rag", "retrieval", "vector", "chromadb", "faiss", "embedding", "vector store", "semantic search", "knowledge base"],
      response: "RAG is Aishwarya's core specialization with 4 portfolio projects and production experience: <b>Customer Support Agent (MCP)</b> — MCP-powered RAG with knowledge base server; <b>MedGraphRAG</b> — clinical QA via medical knowledge graph traversal; <b>DeveloperDocs AI Copilot</b> — end-to-end doc Q&A with ChromaDB + LangChain; <b>RAG with VectorDB</b> — agent-VectorDB interaction with FAISS & ChromaDB. In production: clinical PDF RAG at Healthyr (AWS Bedrock + LangChain), pharmaceutical trial RAG at Vertex (Azure AI Search + GPT-4o), and healthcare doc Q&A at ABM Tech (ChromaDB + Claude 3). <a href='projects.html'>View RAG projects →</a>",
    },

    mcp: {
      triggers: ["mcp", "model context protocol", "customer support agent"],
      response: "Aishwarya built a <b>Customer Support Agent using MCP (Model Context Protocol)</b> — one of the most cutting-edge agent architectures available. It features a Planner/Executor multi-agent split, three MCP servers (orders, tickets, knowledge base) running as stdio subprocesses, Claude-powered agentic loop with tool routing, and SQLite persistence via AsyncExitStack for clean session lifecycle management. <a href='https://github.com/aishwarya30998/customersupportAgent-MCP' target='_blank'>View on GitHub →</a>",
    },

    medgraphrag: {
      triggers: ["medgraphrag", "medical", "clinical", "knowledge graph", "graph", "healthcare ai", "hipaa"],
      response: "Aishwarya has deep healthcare AI expertise. <b>MedGraphRAG</b> answers clinical questions by traversing a medical knowledge graph (diseases, drugs, genes, symptoms, treatments) — combining graph-based retrieval with LLM generation. In production: at <b>Healthyr</b> she built HIPAA-compliant patient document RAG, voice assistants with STT/TTS pipelines, and AI agents with tool-calling on AWS Bedrock. At <b>Vertex Pharmaceuticals</b> she built HIPAA-compliant ICF document automation with zero-data-retention Azure OpenAI and clinical trial protocol RAG with citation-grounded responses. <a href='projects.html'>View project →</a>",
    },

    agents: {
      triggers: ["agent", "crewai", "crew ai", "openai agent", "agentic", "multi-agent", "tool calling", "function calling", "autonomous"],
      response: "Aishwarya has built agents across 4 frameworks: <b>MCP (Model Context Protocol)</b> — Customer Support Agent with Planner/Executor split and 3 MCP servers; <b>CrewAI</b> — multi-agent orchestration with defined roles and task delegation; <b>OpenAI Agents SDK</b> — 5-agent research pipeline (planner, researcher, writer, critic, summarizer) with Gradio UI; <b>LangChain agents</b> — tool-using agents with RAG. In production at Healthyr: agents autonomously invoke backend APIs, query databases, and execute multi-step reasoning for care recommendations on AWS Bedrock. <a href='projects.html'>View agent projects →</a>",
    },

    aws: {
      triggers: ["aws", "amazon", "bedrock", "s3", "ecs", "lambda", "api gateway", "sam", "serverless", "cloud"],
      response: "AWS is Aishwarya's primary cloud platform. Her <b>Blog Generation AWS Serverless</b> project uses API Gateway → Lambda → Bedrock → S3, a fully serverless GenAI pipeline. In production at Healthyr she architected a serverless LLM architecture using AWS SAM — deploying Lambda functions for event-driven AI inference. Other AWS work: ECS + Docker for containerized ML deployments (Student Performance Prediction project), and AWS Bedrock integrating Claude 3 / Llama 3 for healthcare RAG across 3 roles. <a href='projects.html'>View AWS projects →</a>",
    },

    azure: {
      triggers: ["azure", "azure openai", "vertex", "microsoft", "openai service"],
      response: "At <b>Vertex Pharmaceuticals</b>, Aishwarya built an LLM-powered clinical document automation system using <b>Azure OpenAI Service (GPT-4o)</b> for ICF generation, and a clinical trial RAG system with <b>Azure AI Search</b> as the vector store. She implemented HIPAA-compliant LLM deployment patterns: zero data retention, private endpoints, and RBAC. Her <b>Code Generation — Azure AI</b> portfolio project demonstrates Azure OpenAI GPT-4 for developer assistant capabilities. <a href='projects.html'>View Azure project →</a>",
    },

    langfuse: {
      triggers: ["langfuse", "observability", "tracing", "monitoring", "llm monitoring", "token usage"],
      response: "Aishwarya uses <b>Langfuse</b> for full LLM observability — tracking request/response traces, token usage, latency, and billing across all model calls to enable data-driven prompt optimization in production. She self-hosted Langfuse at Healthyr and integrated it across the full application stack. This portfolio's chatbot itself sends traces to Langfuse! Langfuse is also listed as a skill on her portfolio.",
    },

    mlops: {
      triggers: ["mlops", "cicd", "ci/cd", "docker", "deployment", "pipeline", "devops", "containeriz"],
      response: "MLOps is a strong area. The <b>Student Performance Prediction</b> portfolio project demonstrates a full production MLOps pipeline: modular data ingestion, transformation, and model training stages — containerized with Docker, deployed on AWS ECS, with GitHub Actions CI/CD for automated testing and deployment. In production at Healthyr she containerized FastAPI + LLM services with Docker and integrated with React + TypeScript frontends.",
    },

    projects: {
      triggers: ["project", "portfolio", "github", "built", "worked on", "show me", "all project"],
      response: "Aishwarya has <b>14 end-to-end projects</b>: <br><br><b>Agentic AI:</b> Customer Support Agent (MCP), CrewAI Multi-Agent, OpenAI Agents SDK<br><b>RAG:</b> MedGraphRAG, DeveloperDocs AI Copilot, RAG with VectorDB<br><b>LLM Apps:</b> Smart ATS Checker, Blog Gen (AWS Serverless), Code Gen (Azure AI), Multilanguage Invoice Extractor<br><b>APIs:</b> URL Shortener (FastAPI + Pydantic)<br><b>MLOps:</b> Student Performance Prediction<br><b>NLP:</b> Fine-tuning FLAN-T5 (MS Capstone), Sentence Transformers Multi-Task Learning<br><br><a href='projects.html'>View all 14 projects →</a>",
    },

    experience: {
      triggers: ["experience", "work", "job", "career", "professional", "role", "company", "where", "current"],
      response: "Aishwarya has <b>4+ years</b> of experience across 4 roles:<br><br>🏥 <b>AI Engineer @ Healthyr</b> (Mar 2025–Present) — Patient document RAG, voice assistant (STT→LLM→TTS), AI agents with tool-calling, content recommendation engine, FastAPI services, AWS SAM serverless, Langfuse observability<br><br>🧬 <b>GenAI Engineer @ Vertex Pharmaceuticals</b> (Oct 2024–Feb 2025) — Clinical ICF document automation (Azure OpenAI GPT-4o), trial protocol RAG (LangChain + Azure AI Search), HIPAA-compliant LLM deployment, prompt engineering for pharmaceutical tasks<br><br>🏥 <b>ML Engineer Trainee @ ABM Tech LLC</b> (Jun–Sep 2024) — Healthcare document Q&A (AWS Bedrock + ChromaDB), LangChain orchestration, Lambda + API Gateway inference endpoints<br><br>💻 <b>Software/ML Engineer @ LTI Mindtree</b> (Oct 2019–Jul 2022) — Churn prediction, demand forecasting (GameStop); fraud detection, chargeback risk scoring, anomaly detection (GlobalPay)",
    },

    resume: {
      triggers: ["resume", "cv", "download"],
      response: "You can view Aishwarya's full resume details by exploring this portfolio or connecting on <a href='https://www.linkedin.com/in/aishwarya-pentyala/' target='_blank'>LinkedIn</a>. Her resume covers 4+ years of AI/ML engineering across healthcare and fintech — reach out at <a href='mailto:aishwarya.ap998@gmail.com'>aishwarya.ap998@gmail.com</a> to request a copy directly.",
    },

    education: {
      triggers: ["education", "degree", "ms", "masters", "university", "study", "studied", "graduate", "school", "bridgeport"],
      response: "🎓 <b>MS in Artificial Intelligence</b> — University of Bridgeport, CT (Sep 2022 – May 2024). Capstone: fine-tuned FLAN-T5 (10B params) on Stanford Alpaca dataset, comparing full fine-tuning vs. PEFT with LoRA — evaluated via ROUGE metrics against human baselines.<br><br>🎓 <b>BE in Computer Science</b> — KL University, India (Jul 2015 – May 2019). Foundation in software engineering, algorithms, and backend development.",
    },

    fintech: {
      triggers: ["fintech", "fraud", "payment", "transaction", "gamestop", "globalpay", "lti", "mindtree", "churn"],
      response: "At <b>LTI Mindtree</b> (Oct 2019–Jul 2022) Aishwarya worked on two fintech/retail clients: <b>GameStop</b> — customer churn prediction on PowerUp Rewards loyalty data, demand forecasting for game/hardware SKUs, NLP sentiment analysis on reviews, and REST APIs to expose ML outputs. <b>GlobalPay</b> — real-time transaction fraud detection (Random Forest/XGBoost on velocity, geo, device fingerprint signals), chargeback risk scoring, transaction anomaly detection, and feature engineering pipelines over millions of daily payment events.",
    },

    voice_assistant: {
      triggers: ["voice", "speech", "tts", "stt", "audio", "text to speech", "speech to text"],
      response: "At Healthyr, Aishwarya built a <b>personalized voice assistant</b> for patient-facing interactions using an LLM + STT/TTS pipeline: Speech-to-Text → LLM reasoning → Text-to-Speech, with user-specific knowledge retrieval so patients receive context-aware responses grounded in their own care data — not generic model outputs.",
    },

    langchain: {
      triggers: ["langchain", "lang chain", "llamaindex", "llama index", "orchestration"],
      response: "LangChain is one of Aishwarya's primary orchestration frameworks. She's used it across production and portfolio work: multi-step retrieval chains, context injection, LangChain agents with tool use, and A/B model swapping between Claude 3 and GPT-4o. Portfolio: <b>DeveloperDocs AI Copilot</b> uses LangChain + ChromaDB; <b>RAG with VectorDB</b> demonstrates agent-VDB patterns. Production: patient document RAG at Healthyr, clinical trial protocol RAG at Vertex, and healthcare document Q&A at ABM Tech.",
    },

    nlp: {
      triggers: ["nlp", "natural language", "text processing", "sentiment", "transformer", "sbert", "sentence transformer"],
      response: "NLP is a core strength. Her <b>Sentence Transformers Multi-Task Learning</b> project trains SBERT models jointly on semantic similarity and text classification — producing high-quality dense embeddings. She also applied NLP sentiment analysis on customer reviews at GameStop, and built clinical NLP pipelines with ICD-10 code suggestion and regulatory language classification at Vertex Pharmaceuticals.",
    },

    finetuning: {
      triggers: ["fine-tun", "finetuning", "finetune", "peft", "lora", "flan", "alpaca", "hugging face", "huggingface"],
      response: "Aishwarya's <b>MS Capstone</b> involved fine-tuning <b>FLAN-T5 (10B params)</b> on the Stanford Alpaca instruction dataset — benchmarking full fine-tuning vs. PEFT with LoRA. LoRA achieved competitive performance at a fraction of compute cost, evaluated via ROUGE metrics against human baselines. She uses Hugging Face Transformers, PEFT library, and has hands-on experience with parameter-efficient fine-tuning techniques for production deployment.",
    },

    deep_learning: {
      triggers: ["deep learning", "neural network", "tensorflow", "pytorch", "reinforcement"],
      response: "Aishwarya has strong deep learning foundations with TensorFlow and PyTorch — covering CNNs, RNNs, transformers, and reinforcement learning. Her graduate coursework and projects include fine-tuning large transformer models, implementing custom neural architectures, and applying RL concepts.",
    },

    multimodal: {
      triggers: ["multimodal", "vision", "image", "invoice", "document ai", "gemini vision"],
      response: "Aishwarya's <b>Multilanguage Invoice Extractor</b> uses <b>Gemini Vision Pro</b> to process invoices in any language — you upload the image and ask natural language questions, and the vision LLM reads and extracts structured data. Built with Streamlit for an interactive UI. This showcases her multimodal AI skills beyond text-only LLMs. <a href='projects.html'>View project →</a>",
    },

    contact: {
      triggers: ["contact", "reach", "email", "hire", "available", "opportunity", "connect", "touch", "linkedin", "open to"],
      response: '📬 Reach Aishwarya at <a href="mailto:aishwarya.ap998@gmail.com">aishwarya.ap998@gmail.com</a><br>💼 Connect on <a href="https://www.linkedin.com/in/aishwarya-pentyala/" target="_blank">LinkedIn</a><br>💻 Explore code on <a href="https://github.com/aishwarya30998" target="_blank">GitHub</a><br>🤗 Hugging Face: <a href="https://huggingface.co/Aishwarya30998" target="_blank">Aishwarya30998</a><br><br>She is open to <b>AI/ML engineering roles</b>, research collaborations, and consulting opportunities.',
    },

    thanks: {
      triggers: ["thank", "thanks", "appreciate", "helpful", "great", "awesome", "perfect"],
      response: "You're welcome! 😊 Feel free to ask anything else about Aishwarya's projects, experience, or skills.",
    },

    default: {
      response: "I didn't quite catch that. Try asking about her <b>projects</b>, <b>skills</b>, <b>experience</b>, <b>education</b>, <b>MCP</b>, <b>RAG</b>, <b>FastAPI</b>, <b>AWS</b>, <b>Azure</b>, <b>Langfuse</b>, <b>healthcare AI</b>, or how to <b>contact</b> her!",
    },
  };

  function getResponse(input) {
    var lower = input.toLowerCase().trim();
    var keys = Object.keys(KB);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (key === "default") continue;
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
    "    </div>" +
    '    <button id="chat-close" aria-label="Close chat">&times;</button>' +
    "  </div>" +
    '  <div id="chat-messages">' +
    '    <div class="chat-message bot-message">' +
    "      Hi! \ud83d\udc4b I'm here to answer questions about Aishwarya's skills, projects, and experience. What would you like to know?" +
    "    </div>" +
    "  </div>" +
    '  <div id="chat-input-row">' +
    '    <input type="text" id="chat-input" placeholder="Ask about skills, projects..." aria-label="Chat message input" maxlength="200" />' +
    '    <button id="chat-send" aria-label="Send message">' +
    '      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>' +
    "    </button>" +
    "  </div>" +
    "</div>" +
    '<button id="chat-toggle" aria-label="Open chat assistant" aria-expanded="false">' +
    '  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>' +
    "</button>";

  document.body.insertAdjacentHTML("beforeend", chatHTML);

  // --- Event Wiring ---
  var container = document.getElementById("chat-container");
  var toggleBtn = document.getElementById("chat-toggle");
  var closeBtn = document.getElementById("chat-close");
  var input = document.getElementById("chat-input");
  var sendBtn = document.getElementById("chat-send");
  var messages = document.getElementById("chat-messages");

  function openChat() {
    container.classList.remove("chat-hidden");
    toggleBtn.setAttribute("aria-expanded", "true");
    toggleBtn.style.display = "none";
    input.focus();
  }

  function closeChat() {
    container.classList.add("chat-hidden");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.style.display = "flex";
  }

  function addMessage(text, role) {
    var div = document.createElement("div");
    div.className =
      "chat-message " + (role === "user" ? "user-message" : "bot-message");
    div.innerHTML = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function handleSend() {
    var text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    input.value = "";
    setTimeout(function () {
      var response = getResponse(text);
      addMessage(response, "bot");
      sendTrace(text, response);
    }, 350);
  }

  toggleBtn.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);
  sendBtn.addEventListener("click", handleSend);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") handleSend();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeChat();
  });

  // Auto-open chat 3 seconds after page load.
  // If the user manually closes it, it won't reopen.
  var userClosed = false;
  closeBtn.addEventListener("click", function () { userClosed = true; });

  setTimeout(function () {
    if (!userClosed) openChat();
  }, 3000);
})();

