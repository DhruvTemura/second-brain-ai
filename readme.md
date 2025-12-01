# Personal AI Companion - "Second Brain"

A multi-modal knowledge management system that allows users to store, manage, and retrieve personal information through conversational AI. Upload text notes, audio recordings, and documents, then chat with your personalized AI assistant to retrieve insights from your stored knowledge base.

## 🎯 Project Overview

The Personal AI Companion leverages Retrieval-Augmented Generation (RAG) to create a searchable memory system powered by semantic search and large language models. It processes multiple input types, generates embeddings for semantic retrieval, and provides intelligent, context-aware responses through a conversational interface.

### Key Features

- **Multi-Modal Ingestion**: Support for text notes, audio files (via transcription), and PDF documents
- **Semantic Search**: Vector-based retrieval using pgvector for meaning-based search (not just keywords)
- **Conversational Interface**: Natural language Q&A powered by Google Gemini
- **Asynchronous Processing**: Background workers handle time-intensive transcription and embedding generation
- **User Isolation**: Complete data privacy with per-user data segregation
- **Temporal Awareness**: Timestamps stored with all content for temporal context

## 🏗️ System Architecture

### High-Level Components
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │────────▶│   Express    │────────▶│ PostgreSQL  │
│  Frontend   │         │  Backend API │         │ + pgvector  │
└─────────────┘         └──────────────┘         └─────────────┘
                               │                         ▲
                               │                         │
                               ▼                         │
                        ┌──────────────┐                │
                        │  Background  │────────────────┘
                        │    Worker    │
                        └──────────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
            ┌──────────────┐      ┌─────────────┐
            │   Whisper    │      │   Gemini    │
            │     API      │      │     API     │
            └──────────────┘      └─────────────┘
```

### Technology Stack

**Frontend**
- React 18.x
- Axios for API communication
- Deployed on Netlify

**Backend**
- Node.js 18.x
- Express.js
- Multer for file uploads
- Deployed on Render

**Database**
- PostgreSQL 15.x
- pgvector extension for vector similarity search
- Hosted on Supabase

**External APIs**
- Google Gemini API (embeddings & LLM responses)
- OpenAI Whisper API (audio transcription)

**Additional Libraries**
- `pg` - PostgreSQL client
- `pdf-parse` - PDF text extraction
- `dotenv` - Environment configuration

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 15.x with pgvector extension
- Google Gemini API key
- OpenAI API key (for Whisper)
- Git

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd second-brain
```

#### 2. Database Setup

**Option A: Use Supabase (Recommended)**

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection string from Settings → Database
4. Enable pgvector extension:
```sql
   CREATE EXTENSION IF NOT EXISTS vector;
```

**Option B: Local PostgreSQL**

1. Install PostgreSQL 15+
2. Install pgvector extension:
```bash
   cd /tmp
   git clone https://github.com/pgvector/pgvector.git
   cd pgvector
   make
   sudo make install
```
3. Create database:
```bash
   createdb second_brain
   psql second_brain -c "CREATE EXTENSION vector;"
```

#### 3. Initialize Database Schema

Run the following SQL commands in your PostgreSQL database:
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sources (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  source_type VARCHAR(50) NOT NULL,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chunks (
  id SERIAL PRIMARY KEY,
  source_id INTEGER REFERENCES sources(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  embedding VECTOR(768),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chunks_user ON chunks(user_id);
CREATE INDEX idx_chunks_source ON chunks(source_id);
CREATE INDEX idx_chunks_embedding ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  source_id INTEGER REFERENCES sources(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'queued',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_user ON jobs(user_id);
```

#### 4. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in the `backend` directory:
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Getting API Keys:**

- **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)

#### 5. Worker Setup
```bash
cd worker
npm install
```

Create `.env` file in the `worker` directory (same as backend):
```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

#### 6. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

### Running the Application

You need to run three separate processes:

**Terminal 1 - Backend API:**
```bash
cd backend
npm start
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Background Worker:**
```bash
cd worker
npm start
```
Worker will continuously poll for jobs

**Terminal 3 - Frontend:**
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

Visit `http://localhost:3000` in your browser to use the application.

## 📖 How to Use

### 1. Create an Account (if authentication implemented)
- Register with email and name
- Login to access your personal knowledge base

### 2. Upload Content

**Text Notes:**
- Enter a title
- Type or paste your text
- Click "Save Note"

**Audio Files:**
- Enter a title
- Upload MP3, WAV, or M4A file
- System will transcribe automatically (takes 5-40 seconds)

**PDF Documents:**
- Enter a title
- Upload PDF file
- System will extract text automatically

### 3. Monitor Processing
- Each upload creates a background job
- Status indicators show processing progress
- Notification appears when ingestion completes

### 4. Chat with Your AI
- Type questions in the chat interface
- AI retrieves relevant information from your knowledge base
- Responses include source citations with timestamps
- Ask follow-up questions naturally

### Example Queries
- "What did I learn about machine learning yesterday?"
- "Summarize my meeting notes from last week"
- "What are my action items?"
- "Tell me about the project timeline I uploaded"

## 🔧 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword"
}

Response:
{
  "success": true,
  "data": {
    "userId": 1,
    "token": "jwt_token_here"
  }
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "success": true,
  "data": {
    "userId": 1,
    "token": "jwt_token_here"
  }
}
```

### Ingestion Endpoints

#### Upload Text Note
```http
POST /api/ingest/text
Content-Type: application/json

{
  "userId": 1,
  "title": "Meeting Notes",
  "text": "Discussed project timeline and deliverables..."
}

Response:
{
  "success": true,
  "data": {
    "jobId": 123,
    "sourceId": 456
  }
}
```

#### Upload Audio File
```http
POST /api/ingest/audio
Content-Type: multipart/form-data

userId: 1
title: "Lecture Recording"
audioFile: [binary file data]

Response:
{
  "success": true,
  "data": {
    "jobId": 124,
    "sourceId": 457
  }
}
```

#### Upload Document
```http
POST /api/ingest/document
Content-Type: multipart/form-data

userId: 1
title: "Research Paper"
documentFile: [binary file data]

Response:
{
  "success": true,
  "data": {
    "jobId": 125,
    "sourceId": 458
  }
}
```

### Job Tracking Endpoints

#### Check Job Status
```http
GET /api/jobs/:jobId

Response:
{
  "success": true,
  "data": {
    "jobId": 123,
    "status": "done",
    "createdAt": "2024-11-26T10:30:00Z",
    "errorMessage": null
  }
}
```

#### List User Jobs
```http
GET /api/jobs/user/:userId

Response:
{
  "success": true,
  "data": [
    {
      "jobId": 123,
      "status": "done",
      "title": "Meeting Notes",
      "createdAt": "2024-11-26T10:30:00Z"
    }
  ]
}
```

### Chat Endpoint

#### Send Chat Message
```http
POST /api/chat
Content-Type: application/json

{
  "userId": 1,
  "message": "What did I note about the project?"
}

Response:
{
  "success": true,
  "data": {
    "response": "Based on your notes, the project timeline...",
    "sources": [
      {
        "chunkId": 789,
        "text": "Project timeline: Phase 1...",
        "timestamp": "2024-11-26T10:30:00Z"
      }
    ]
  }
}
```

### Source Management Endpoints

#### List Sources
```http
GET /api/sources/:userId

Response:
{
  "success": true,
  "data": [
    {
      "sourceId": 456,
      "title": "Meeting Notes",
      "sourceType": "text",
      "createdAt": "2024-11-26T10:30:00Z"
    }
  ]
}
```

#### Delete Source
```http
DELETE /api/sources/:sourceId

Response:
{
  "success": true,
  "data": {
    "message": "Source deleted successfully"
  }
}
```

## 🔍 How It Works

### Ingestion Pipeline

1. **Upload**: User submits content through the frontend
2. **Job Creation**: API creates a job record with status='queued'
3. **Processing**: Background worker picks up the job
   - Audio: Transcribed via Whisper API
   - PDF: Text extracted via pdf-parse
   - Text: Used directly
4. **Chunking**: Text split into 500-1000 token chunks
5. **Embedding**: Each chunk embedded using Gemini API (768-dimensional vectors)
6. **Storage**: Chunks and embeddings stored in PostgreSQL
7. **Completion**: Job marked as 'done', content searchable

### Retrieval & Chat Flow

1. **Query**: User types a question
2. **Embedding**: Query embedded using Gemini API
3. **Search**: Vector similarity search in PostgreSQL using pgvector
```sql
   SELECT text, created_at, 
          1 - (embedding <=> $queryEmbedding) AS similarity
   FROM chunks
   WHERE user_id = $userId
   ORDER BY embedding <=> $queryEmbedding
   LIMIT 5;
```
4. **Context Building**: Top 5 relevant chunks formatted into prompt
5. **LLM Call**: Prompt sent to Gemini for response generation
6. **Response**: AI answer with source citations returned to user

### Key Technologies Explained

**pgvector**: PostgreSQL extension that enables vector similarity search. Stores embeddings as VECTOR(768) type and provides operators like `<=>` for cosine distance.

**IVFFlat Index**: Approximate nearest neighbor index that speeds up vector search from O(n) to O(log n).

**Asynchronous Processing**: Separates heavy operations (transcription, embedding) from user-facing API, keeping the interface responsive.

**Semantic Search**: Unlike keyword search, finds content based on meaning. "car" matches "automobile", "budget planning" matches "financial strategy".

## 🚢 Deployment

### Backend & Worker Deployment (Render)

1. Create account at [render.com](https://render.com)
2. Create new Web Service for backend
3. Create new Background Worker for worker
4. Set environment variables in Render dashboard
5. Connect to GitHub repository
6. Auto-deploy on push

**Render Configuration:**

Backend (Web Service):
```yaml
Build Command: npm install
Start Command: npm start
Environment: Node
```

Worker (Background Worker):
```yaml
Build Command: npm install
Start Command: npm start
Environment: Node
```

### Frontend Deployment (Netlify)

1. Create account at [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Set build settings:
```
   Build Command: npm run build
   Publish Directory: build
```
4. Add environment variables:
```
   REACT_APP_API_URL=https://your-backend.onrender.com
```
5. Deploy

### Database Deployment (Supabase)

Already hosted if using Supabase - no additional deployment needed.

### Environment Variables for Production

**Backend/Worker:**
```env
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
GEMINI_API_KEY=your_production_key
OPENAI_API_KEY=your_production_key
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.netlify.app
```

**Frontend:**
```env
REACT_APP_API_URL=https://your-backend.onrender.com
```

## 🧪 Testing

### Manual Testing Checklist

**Ingestion Tests:**
- [ ] Upload text note successfully
- [ ] Upload audio file (MP3) successfully
- [ ] Upload PDF document successfully
- [ ] Verify job status updates correctly
- [ ] Confirm content becomes searchable after processing
- [ ] Test error handling for invalid files

**Chat Tests:**
- [ ] Ask question about uploaded content
- [ ] Verify relevant results returned
- [ ] Check source citations are accurate
- [ ] Test with no matching content
- [ ] Test follow-up questions

**Source Management:**
- [ ] List all sources
- [ ] Delete source
- [ ] Verify chunks deleted with source

### Testing with Sample Data
```bash
# Test text ingestion
curl -X POST http://localhost:5000/api/ingest/text \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "Test Note",
    "text": "This is a test note about artificial intelligence and machine learning."
  }'

# Test chat
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "message": "What did I write about AI?"
  }'
```

## 📊 System Requirements

### Minimum Requirements

- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 10GB (for database and logs)
- **Network**: Stable internet for API calls

### Recommended Requirements

- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB
- **Network**: High-speed internet for faster processing

### API Rate Limits

- **Gemini API**: 15 requests per minute (free tier)
- **Whisper API**: 50 requests per minute
- Consider these limits when processing multiple files

## ⚙️ Configuration Options

### Chunking Configuration

Edit in `worker/src/chunker.js`:
```javascript
const CHUNK_SIZE = 1000; // tokens per chunk
const OVERLAP = 0; // token overlap between chunks
```

### Retrieval Configuration

Edit in `backend/src/retrieval.js`:
```javascript
const TOP_K = 5; // number of chunks to retrieve
const SIMILARITY_THRESHOLD = 0.3; // minimum similarity score
```

### Worker Polling Interval

Edit in `worker/src/index.js`:
```javascript
const POLL_INTERVAL = 5000; // milliseconds between job checks
```

## 🐛 Troubleshooting

### Common Issues

**Issue: Worker not processing jobs**
- Check worker is running (`npm start` in worker directory)
- Verify DATABASE_URL is correct
- Check job status in database: `SELECT * FROM jobs;`
- Look for error messages in worker logs

**Issue: "pgvector extension not found"**
- Install pgvector extension: `CREATE EXTENSION vector;`
- Verify extension: `SELECT * FROM pg_extension WHERE extname = 'vector';`
- Restart PostgreSQL after installation

**Issue: Gemini API errors**
- Verify API key is correct
- Check rate limits (15 requests/minute on free tier)
- Ensure model name is correct: `text-embedding-004` and `gemini-1.5-flash`

**Issue: Whisper API timeout**
- Large audio files may timeout
- Try smaller file sizes (< 25MB)
- Ensure audio format is supported (MP3, WAV, M4A)

**Issue: CORS errors in frontend**
- Verify FRONTEND_URL in backend .env matches frontend URL
- Check CORS configuration in `backend/src/index.js`
- Clear browser cache and reload

**Issue: Database connection fails**
- Check DATABASE_URL format is correct
- For Supabase, ensure using transaction pooler (port 6543)
- Verify network allows outbound connections to database
- Check SSL mode requirement

### Debug Mode

Enable detailed logging:
```env
DEBUG=true
LOG_LEVEL=verbose
```

### Database Debugging

Check database contents:
```sql
-- View all users
SELECT * FROM users;

-- View recent jobs
SELECT * FROM jobs ORDER BY created_at DESC LIMIT 10;

-- View sources for a user
SELECT * FROM sources WHERE user_id = 1;

-- View chunks for a source
SELECT id, chunk_index, LEFT(text, 50) as text_preview 
FROM chunks 
WHERE source_id = 1 
ORDER BY chunk_index;

-- Check job failures
SELECT * FROM jobs WHERE status = 'failed';
```

## 🔐 Security Considerations

### Implemented Security Features

- User data isolation via user_id filtering
- HTTPS for production deployments
- Environment variables for sensitive credentials
- SQL injection prevention via parameterized queries
- CORS configuration to restrict origins

### Recommended Enhancements

- Implement JWT authentication
- Add rate limiting per user
- Enable API key rotation
- Add input validation middleware
- Implement request size limits
- Add audit logging
- Enable database encryption at rest

## 📈 Performance Optimization

### Current Optimizations

- Asynchronous ingestion prevents UI blocking
- IVFFlat index on embeddings for fast vector search
- Database indexes on user_id and status fields
- Connection pooling for database
- Limit retrieval to top-5 chunks

### Future Optimizations

- Cache query embeddings
- Implement response caching for duplicate queries
- Add CDN for frontend static assets
- Use Redis for job queue
- Implement batch embedding generation
- Add query result caching layer

## 🤝 Contributing

This is an academic project. If you'd like to extend it:

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Test thoroughly
5. Submit a pull request with description

## 📄 License

This project is created for educational purposes as part of a college placement project.

## 🙏 Acknowledgments

- **Google Gemini API** for embeddings and LLM capabilities
- **OpenAI Whisper API** for audio transcription
- **pgvector** team for PostgreSQL vector extension
- **Supabase** for managed PostgreSQL hosting
- **Render** and **Netlify** for deployment platforms

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review API documentation
3. Check database logs and job error messages
4. Verify all environment variables are set correctly

## 🗺️ Roadmap

Potential future enhancements:

- [ ] Image ingestion with OCR or caption-based search
- [ ] Web URL ingestion and scraping
- [ ] Advanced temporal query parsing ("last week", "yesterday")
- [ ] Job history UI panel
- [ ] Multi-user chat rooms
- [ ] Export/import knowledge base
- [ ] Mobile app
- [ ] Browser extension for quick capture
- [ ] Integration with note-taking apps
- [ ] Voice input for queries
- [ ] Advanced analytics dashboard

## 📚 Additional Resources

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [OpenAI Whisper API Docs](https://platform.openai.com/docs/guides/speech-to-text)
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)

---

**Version**: 1.0  
**Last Updated**: November 26, 2024  
**Author**: Dhruv Temura