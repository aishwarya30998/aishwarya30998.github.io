# Aishwarya Pentyala - Portfolio Website

Personal portfolio website showcasing AI/ML engineering skills, projects, and professional experience.

**Live:** [aishwarya30998.github.io](https://aishwarya30998.github.io)

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Hosting:** GitHub Pages
- **Observability:** Langfuse (self-hosted on Hugging Face Spaces)

## Features

- Responsive design with mobile-first approach
- Project showcase with category filtering (AI/ML, NLP, Cloud, Full Stack)
- Scroll animations and sticky navigation
- Interactive chatbot assistant with Langfuse observability

## Chatbot Assistant

The portfolio includes a built-in conversational assistant that answers questions about Aishwarya's skills, experience, projects, and education.

### How It Works

- **Knowledge-base driven:** Uses a keyword-matching system with predefined triggers and responses covering 15+ topics (skills, LLMs, RAG, LangChain, agents, AWS, MLOps, education, experience, etc.)
- **Client-side only:** Runs entirely in the browser with no backend or external API calls
- **Lightweight:** Zero dependencies, injected dynamically into the DOM

### Architecture

```
User Input → Keyword Matching (KB triggers) → Response Selection → Display
                                                       ↓
                                              Langfuse Trace (async)
```

## Langfuse Observability

Every chatbot interaction is traced and logged using [Langfuse](https://langfuse.com) for monitoring and analytics.

### Setup

- **Langfuse Instance:** Self-hosted on [Hugging Face Spaces](https://huggingface.co/spaces) (Docker SDK, free tier)
- **Database:** PostgreSQL hosted on [Neon](https://neon.tech) (free tier)
- **Integration:** Client-side JavaScript using Langfuse's public ingestion REST API

### What Gets Traced

Each trace captures:

| Field | Description |
|-------|-------------|
| `input.message` | The user's chat message |
| `output.response` | The bot's response |
| `metadata.source` | `portfolio-website` |
| `metadata.page` | Page URL where the chat occurred |
| `metadata.userAgent` | Browser user agent string |

### How Tracing Works

```javascript
// Traces are sent asynchronously via Langfuse's public ingestion API
// Uses only the public key (pk-lf-*) — safe for client-side exposure
// Fire-and-forget pattern: trace failures don't affect chat functionality
fetch(LANGFUSE_HOST + "/api/public/ingestion", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Basic " + btoa(LANGFUSE_PUBLIC_KEY + ":")
  },
  body: JSON.stringify({
    batch: [{
      type: "trace-create",
      body: {
        name: "portfolio-chat",
        input: { message: userMessage },
        output: { response: botResponse }
      }
    }]
  })
});
```

### Infrastructure (All Free Tier)

| Service | Purpose | Provider |
|---------|---------|----------|
| Portfolio Website | Static hosting | GitHub Pages |
| Langfuse Dashboard | Trace observability UI | Hugging Face Spaces (Docker) |
| PostgreSQL Database | Langfuse data store | Neon |

## Project Structure

```
.
├── index.html              # Main portfolio page
├── projects.html           # Projects showcase page
├── assets/
│   ├── css/
│   │   └── portfolio.css   # Styles (including chatbot UI)
│   └── js/
│       └── portfolio.js    # JavaScript (nav, animations, chatbot, Langfuse tracing)
└── README.md
```

## Contact

- **Email:** [aishwarya.ap998@gmail.com](mailto:aishwarya.ap998@gmail.com)
- **LinkedIn:** [linkedin.com/in/aishwarya-pentyala](https://www.linkedin.com/in/aishwarya-pentyala/)
- **GitHub:** [github.com/aishwarya30998](https://github.com/aishwarya30998)
