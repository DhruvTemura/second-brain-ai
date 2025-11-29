# 🧠 Second Brain AI - Personal Knowledge Companion

A full-stack AI-powered application that acts as your personal "second brain" - ingesting, storing, and intelligently retrieving information from documents, audio, and text using semantic search and LLM-powered responses.

## 🎯 Project Overview

Second Brain AI is a **Retrieval-Augmented Generation (RAG)** system that allows users to:
- Upload and store personal knowledge (text, documents, audio)
- Query their knowledge base using natural language
- Receive intelligent, context-aware answers powered by AI
- Search across their information using semantic similarity

Built as a take-home assignment demonstrating full-stack development, system architecture, and AI integration skills.

---

## ✨ Features

### Core Functionality
- 🔄 **Multi-Modal Data Ingestion**: Support for text, PDF documents, and audio files
- 🤖 **AI-Powered Q&A**: Natural language conversation with your knowledge base
- 🔍 **Semantic Search**: Vector-based similarity search using embeddings
- ⏰ **Temporal Queries**: Search by time ("yesterday", "last week", etc.)
- 📊 **Asynchronous Processing**: Background workers for file processing
- 💾 **Vector Database**: PostgreSQL with pgvector for efficient similarity search

### Technical Highlights
- **RAG Architecture**: Retrieval-Augmented Generation for accurate, grounded responses
- **Real-time Chat**: Interactive chat interface with source attribution
- **Job Queue System**: Async processing with status tracking
- **Chunking Strategy**: Intelligent text splitting with overlap for context preservation
- **Production Ready**: Deployed backend and frontend with CI/CD

---

## 🏗️ System Architecture
```
┌─────────────┐
│   Frontend  │ (React + Tailwind)
│  (Netlify)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Backend API (Render)        │
│  ┌──────────────────────────────┐  │
│  │  Express.js REST API         │  │
│  │  - /api/ingest (upload)      │  │
│  │  - /api/chat (query)         │  │
│  │  - /api/jobs (status)        │  │
│  └──────────────────────────────┘  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│    Background Worker (Render)       │
│  ┌──────────────────────────────┐  │
│  │  Job Processor               │  │
│  │  - Text extraction           │  │
│  │  - Chunking                  │  │
│  │  - Embedding generation      │  │
│  └──────────────────────────────┘  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│   PostgreSQL + pgvector (Supabase)  │
│  ┌──────────────────────────────┐  │
│  │  Tables:                     │  │
│  │  - users                     │  │
│  │  - sources                   │  │
│  │  - chunks (with embeddings)  │  │
│  │  - jobs                      │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
       ▲
       │
┌──────┴──────┐
│  Gemini AI  │
│  - Embeddings (text-embedding-004)  │
│  - LLM Chat (gemini-2.5-flash-lite) │
└─────────────┘
```

---

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase) with pgvector extension
- **Vector Search**: pgvector for cosine similarity
- **AI/ML**: Google Gemini API (embeddings + LLM)
- **File Processing**: 
  - `pdf-parse` for PDF extraction
  - Multer for file uploads
- **Job Queue**: Custom polling-based worker

### Frontend
- **Framework**: React
- **Styling**: CSS3 with custom design
- **HTTP Client**: Axios
- **Deployment**: Netlify

### DevOps
- **Version Control**: Git + GitHub
- **Backend Hosting**: Render
- **Frontend Hosting**: Netlify
- **Database Hosting**: Supabase
- **Environment Management**: dotenv

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL with pgvector
- Gemini API key
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/second-brain-ai.git
cd second-brain-ai
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
NODE_ENV=development

# Supabase Database
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:PORT/postgres

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Optional
REDIS_URL=
```

Run database migrations (in Supabase SQL Editor):
```sql
-- See backend/database/schema.sql for full schema
CREATE EXTENSION IF NOT EXISTS vector;
-- ... (run all table creation scripts)
```

Start backend:
```bash
npm run dev  # API server on port 5000
```

Start worker (in separate terminal):
```bash
npm run worker  # Background job processor
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm start  # Runs on port 3000
```

### 4. Access the Application

Open [http://localhost:3000](http://localhost:3000)

---

## 🎮 Usage

### Upload Content
1. Navigate to **Upload** tab
2. Choose **Text** or **File**
3. Upload your content
4. Wait for processing (background worker)

### Chat with Your Knowledge
1. Navigate to **Chat** tab
2. Ask questions about uploaded content
3. Receive AI-generated answers with source citations
4. View similarity scores and timestamps

### Example Queries
```
"What are smartgrids?"
"Summarize the document I uploaded yesterday"
"Tell me about the Eiffel Tower"
"What did I save last week?"
```

---

## 🗄️ Database Schema

### Tables

**users**
- `user_id` (UUID, PK)
- `name`, `email`
- `created_at`, `updated_at`

**sources**
- `source_id` (UUID, PK)
- `user_id` (FK)
- `source_type` (text/audio/document)
- `title`, `raw_location`, `content`
- `created_at`, `source_timestamp`

**chunks**
- `chunk_id` (UUID, PK)
- `source_id` (FK), `user_id` (FK)
- `text` (content)
- `embedding` (vector[768])
- `chunk_timestamp`, `index`

**jobs**
- `job_id` (UUID, PK)
- `user_id` (FK), `source_id` (FK)
- `status` (queued/processing/done/failed)
- `error_message`

### Key Indexes
- Vector similarity: `HNSW` index on embeddings
- Temporal queries: Index on timestamps
- User isolation: Index on `user_id`

---

## 🔄 Data Flow

### Ingestion Pipeline
```
1. User uploads text/file
   ↓
2. API creates source record + job (status: queued)
   ↓
3. Worker picks up job
   ↓
4. Extract text based on type:
   - Text: Direct from database
   - PDF: Extract using pdf-parse
   - Audio: Transcribe (placeholder)
   ↓
5. Clean and chunk text (~800 tokens, 100 overlap)
   ↓
6. Generate embeddings (Gemini text-embedding-004)
   ↓
7. Store chunks + vectors in database
   ↓
8. Mark job as done
```

### Query Pipeline
```
1. User asks question
   ↓
2. Parse temporal constraints ("yesterday", etc.)
   ↓
3. Generate query embedding
   ↓
4. Vector similarity search (top-K chunks)
   ↓
5. Build context from retrieved chunks
   ↓
6. Send to LLM with prompt template
   ↓
7. Return answer + sources
```

---

## 🎨 Design Decisions

### Why Vector Database?
**Semantic search** over keyword matching enables:
- Understanding user intent
- Finding conceptually similar content
- Handling paraphrasing and synonyms

### Why Chunking?
- **Token limits**: LLM embeddings have max input size
- **Precision**: Smaller chunks = more accurate retrieval
- **Context**: Overlap preserves meaning across boundaries

### Why RAG over Fine-tuning?
- **Dynamic knowledge**: Add new info without retraining
- **Source attribution**: Show where answers come from
- **Cost-effective**: No model training required
- **Accuracy**: Grounded in actual user data

### Why Async Workers?
- **User experience**: No waiting for slow file processing
- **Scalability**: Handle multiple uploads simultaneously
- **Reliability**: Retry failed jobs, track status

---

## 🚧 Known Limitations

- **Audio transcription**: Currently placeholder (not implemented)
- **Rate limits**: Free tier Gemini API has request limits
- **Cold starts**: Render free tier spins down after 15 min inactivity
- **File size**: 50MB upload limit
- **Concurrent users**: Single test user (no authentication)

---

## 🔮 Future Enhancements

- [ ] User authentication and multi-tenancy
- [ ] Audio transcription (Whisper API)
- [ ] Web scraping for URL ingestion
- [ ] Image processing with vision models
- [ ] Conversation history and context
- [ ] Advanced filters (date range, source type)
- [ ] Export knowledge base
- [ ] Mobile app
- [ ] Real-time collaboration

---

## 📚 API Documentation

### Endpoints

#### `POST /api/ingest/text`
Upload text content
```json
{
  "text": "Your content here",
  "title": "Optional title"
}
```

#### `POST /api/ingest/file`
Upload file (PDF, TXT, audio)
- Form data with `file` field

#### `POST /api/chat`
Query knowledge base
```json
{
  "query": "Your question here"
}
```

#### `GET /api/jobs/:jobId`
Check job status

#### `GET /api/jobs`
List all jobs for user

---

## 🧪 Testing
```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

---

## 📝 Environment Variables

### Backend
```env
NODE_ENV=development|production
PORT=5000
DATABASE_URL=postgresql://...
GEMINI_API_KEY=AIza...
```

### Frontend
```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 🤝 Contributing

This is a take-home assignment project. Contributions are not currently accepted, but feel free to fork and adapt for your own use!

---

## 📄 License

MIT License - Feel free to use this project for learning purposes.

---

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- **Anthropic** - For the project assignment
- **Google Gemini** - AI capabilities
- **Supabase** - Database hosting
- **Render** - Backend hosting
- **Netlify** - Frontend hosting

---

## 📸 Screenshots

### Chat Interface
![Chat Interface](screenshots/chat.png)

### Upload Panel
![Upload Panel](screenshots/upload.png)

### System Architecture
![Architecture Diagram](screenshots/architecture.png)

---

## 🎯 Assignment Deliverables

- [x] Detailed System Design Document (SDD)
- [x] Source code repository
- [x] Working demo (hosted)
- [x] Video walkthrough
- [x] Multi-modal ingestion (text + documents)
- [x] Vector-based retrieval
- [x] LLM integration
- [x] Chat interface
- [x] Temporal querying support

---

Built with ❤️ as a demonstration of full-stack AI system design capabilities.