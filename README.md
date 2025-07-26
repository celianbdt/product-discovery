# AI Product Validator & Sales Launcher

A comprehensive tool that helps entrepreneurs validate product ideas using AI-powered market research and generates personalized outreach content.

## 🚀 Features

- **AI-Powered Validation**: Analyze product ideas with deep market research
- **ICP Identification**: Find and validate ideal customer profiles
- **Content Generation**: Create personalized outreach messages and inbound content
- **Sales Mode**: Generate prospect lists and sales scripts
- **Real-time Analysis**: Get instant insights from market discussions

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **AI**: OpenAI GPT-4 API
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional - uses mock data if not provided)
- FullEnrich API key (optional - for contact enrichment)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd product-discovery
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env file and add your API keys (optional)
OPENAI_API_KEY=your_openai_api_key_here
FULLENRICH_API_KEY=your_fullenrich_api_key_here
PORT=3001
```

### 3. Start the Backend Server

```bash
# Development mode with auto-reload
npm run server:dev

# Or build and start production
npm run server:build
npm run server:start
```

The backend will run on `http://localhost:3001`

### 4. Start the Frontend

```bash
# Development mode
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔄 Complete Flow

### 1. Product Idea Input
- Open `http://localhost:5173` in your browser
- Enter your product idea in the chat interface
- Optionally upload files or add URLs for additional context

### 2. AI Analysis
- The system calls the `/api/product_validator/validate` endpoint
- AI analyzes your idea and searches for relevant market discussions
- Generates insights about target market, pain points, and opportunities

### 3. Dashboard Insights
- View identified ICPs (Ideal Customer Profiles)
- See relevant discussions from Reddit, LinkedIn, Twitter, etc.
- Review generated inbound content for social media
- Access personalized outreach messages

### 4. Sales Mode
- Click "Go to Sales" to access prospect generation
- Select prospects and enrich their contact information using FullEnrich API
- View enriched prospect lists with verified emails, phones, and company data
- Copy sales scripts for different platforms

### 5. Iteration
- Use the "Iterate" button to provide feedback
- Update hypothesis based on learnings
- Generate new validation strategies

## 🔌 API Endpoints

### POST `/api/product_validator/validate`
Analyzes a product idea and returns market insights.

**Request:**
```json
{
  "productIdea": "Your product idea description",
  "context": "Optional additional context",
  "resourcesJSON": "Optional JSON string of additional resources"
}
```

**Response:**
```json
{
  "discussions": [...],
  "people": [...],
  "insights": {
    "marketDemand": "...",
    "commonPainPoints": [...],
    "bestChannels": [...],
    "nextSteps": [...]
  }
}
```

### POST `/api/product_validator/outreach`
Generates personalized outreach messages.

**Request:**
```json
{
  "productIdea": "Your product idea",
  "searchResultsJSON": "JSON string of search results",
  "targetPersonJSON": "JSON string of target person"
}
```

### POST `/api/product_validator/contacts`
Finds contact information for prospects using AI.

**Request:**
```json
{
  "targetPersonJSON": "JSON string of person to find"
}
```

### POST `/api/product_validator/enrich-contacts`
Enriches prospect contact information using FullEnrich API.

**Request:**
```json
{
  "prospects": [
    {
      "id": "1",
      "name": "John Doe",
      "title": "CEO",
      "company": "Example Corp",
      "email": "john@example.com",
      "linkedin": "https://linkedin.com/in/johndoe",
      "source": "LinkedIn",
      "relevanceScore": 9
    }
  ],
  "webhookUrl": "https://your-webhook-url.com" // Optional
}
```

**Response:**
```json
{
  "enrichment_id": "uuid-string",
  "message": "Enrichment request submitted successfully",
  "prospects_count": 1
}
```

### GET `/api/product_validator/enrichment-status/:enrichmentId`
Checks the status of a contact enrichment request.

**Response:**
```json
{
  "enrichment_id": "uuid-string",
  "status": "completed",
  "progress": 100,
  "results": {
    "enriched_contacts": 1,
    "failed_contacts": 0,
    "total_contacts": 1
  }
}
```

## 🎯 Usage Examples

### Example 1: SaaS Tool Validation
1. Enter: "A project management tool for remote teams"
2. AI finds discussions about remote work challenges
3. Identifies project managers and team leads as ICPs
4. Generates LinkedIn posts and cold email templates

### Example 2: Mobile App Validation
1. Enter: "A fitness tracking app for busy professionals"
2. AI finds discussions about time management and health
3. Identifies professionals aged 25-40 as primary ICPs
4. Creates content for fitness communities and LinkedIn

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── Chat.tsx        # Main chat interface
│   ├── Dashboard.tsx   # Analysis dashboard
│   ├── SalesMode.tsx   # Sales tools
│   └── IterateModal.tsx # Iteration feedback
├── prompts/            # AI prompt templates
│   ├── deepSearchPrompt.ts
│   ├── outreachPrompt.ts
│   └── contactsPrompt.ts
└── server.ts          # Express backend
```

### Available Scripts
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
npm run server:dev   # Start backend with auto-reload
npm run server:build # Build backend
npm run server:start # Start production backend

# Linting
npm run lint         # Run ESLint
```

## 🎨 Customization

### Adding New AI Prompts
1. Create new prompt file in `src/prompts/`
2. Export a function that builds the prompt
3. Add corresponding endpoint in `src/server.ts`
4. Update frontend to use new endpoint

### Styling
The app uses Tailwind CSS. Customize styles in:
- `tailwind.config.js` - Tailwind configuration
- `src/index.css` - Global styles
- Component files - Inline Tailwind classes

## 🚨 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if port 3001 is available
- Verify `.env` file exists
- Ensure all dependencies are installed

**Frontend can't connect to backend:**
- Verify backend is running on port 3001
- Check CORS settings in `src/server.ts`
- Ensure both servers are running

**OpenAI API errors:**
- Verify API key is set in `.env`
- Check API key validity
- Monitor rate limits

**FullEnrich API errors:**
- Verify FullEnrich API key is set in `.env`
- Check API key validity and credits
- Monitor rate limits (max 100 contacts per request)

**No data showing:**
- Check browser console for errors
- Verify API endpoints are responding
- Ensure data transformation is working

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation
- Open an issue on GitHub

---

**Ready to validate your next big idea?** 🚀

Open `http://localhost:5173` and start building!
