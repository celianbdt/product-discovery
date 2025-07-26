import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { buildDeepSearchPrompt } from './prompts/deepSearchPrompt.js';
import { buildOutreachPrompt } from './prompts/outreachPrompt.js';
import { buildContactsPrompt } from './prompts/contactsPrompt.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Check if OpenAI API key is set
const hasValidOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';

if (!hasValidOpenAIKey) {
  console.warn('⚠️  OPENAI_API_KEY is not set or invalid in .env file');
  console.warn('   API endpoints will return mock data for testing');
  console.warn('   To use real OpenAI API, set a valid key in your .env file');
}

// Initialize OpenAI client only if key is valid
let openai: OpenAI | null = null;
if (hasValidOpenAIKey) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint that doesn't require OpenAI
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    openaiAvailable: !!openai
  });
});

// POST /api/product_validator/validate
app.post('/api/product_validator/validate', async (req, res) => {
  try {
    const { productIdea, context, resourcesJSON } = req.body;

    if (!productIdea) {
      return res.status(400).json({ error: 'productIdea is required' });
    }

    console.log('🔍 Validating product idea:', productIdea.substring(0, 100) + '...');

    // If no OpenAI key, return mock data
    if (!openai) {
      console.log('⚠️  Using mock data (no OpenAI API key)');
      const mockResponse = {
        discussions: [
          {
            platform: "reddit",
            title: "Struggling to validate my SaaS idea",
            url: "https://reddit.com/r/startups/example",
            author: "founder123",
            authorContext: "Solo founder",
            content: "I have this idea for a SaaS tool but I'm not sure how to validate it properly...",
            date: "2024-01-15",
            relevance: 95,
            problem: "Need systematic approach to validate ideas",
            solution: "Your product could help by providing structured validation framework"
          }
        ],
        people: [
          {
            name: "Sarah Chen",
            platform: "linkedin",
            context: "Product Manager at Startup",
            problem: "Struggling with product validation",
            originalPost: "Looking for better ways to validate product ideas...",
            url: "https://linkedin.com/example",
            engagement: "15 likes, 8 comments"
          }
        ],
        insights: {
          marketDemand: "Strong demand for validation tools among founders",
          commonPainPoints: ["Time constraints", "Lack of systematic approach", "Uncertainty"],
          bestChannels: ["Reddit r/startups", "LinkedIn", "Twitter"],
          nextSteps: ["Direct outreach", "Landing page", "MVP development"]
        }
      };
      return res.json(mockResponse);
    }

    const prompt = buildDeepSearchPrompt(productIdea, context, resourcesJSON);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    console.log('✅ Received response from OpenAI');

    // Try to parse as JSON, if it fails wrap in raw
    try {
      const parsed = JSON.parse(response);
      res.json(parsed);
    } catch {
      console.log('⚠️ Response was not valid JSON, returning as raw');
      res.json({ raw: response });
    }
  } catch (error: any) {
    console.error('❌ Validate endpoint error:', error);
    
    // Handle specific OpenAI errors
    if (error.status === 401) {
      return res.status(500).json({ 
        error: 'OpenAI API key is invalid. Please check your .env file.' 
      });
    } else if (error.status === 429) {
      return res.status(500).json({ 
        error: 'OpenAI API rate limit exceeded. Please try again later.' 
      });
    } else if (error.code === 'ENOTFOUND') {
      return res.status(500).json({ 
        error: 'Network error. Please check your internet connection.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// POST /api/product_validator/outreach
app.post('/api/product_validator/outreach', async (req, res) => {
  try {
    const { productIdea, searchResultsJSON, targetPersonJSON } = req.body;

    if (!productIdea || !searchResultsJSON || !targetPersonJSON) {
      return res.status(400).json({ 
        error: 'productIdea, searchResultsJSON, and targetPersonJSON are required' 
      });
    }

    console.log('📤 Generating outreach message...');

    // If no OpenAI key, return mock data
    if (!openai) {
      console.log('⚠️  Using mock data (no OpenAI API key)');
      return res.json({ 
        message: "Hi there! I noticed your post about product validation challenges and thought our AI-powered validation tool might be exactly what you're looking for. Would love to show you a quick demo if you're interested!" 
      });
    }

    const prompt = buildOutreachPrompt(productIdea, searchResultsJSON, targetPersonJSON);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const message = completion.choices[0]?.message?.content;

    if (!message) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    console.log('✅ Generated outreach message');
    res.json({ message });
  } catch (error: any) {
    console.error('❌ Outreach endpoint error:', error);
    
    if (error.status === 401) {
      return res.status(500).json({ 
        error: 'OpenAI API key is invalid. Please check your .env file.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// POST /api/product_validator/contacts
app.post('/api/product_validator/contacts', async (req, res) => {
  try {
    const { targetPersonJSON } = req.body;

    if (!targetPersonJSON) {
      return res.status(400).json({ error: 'targetPersonJSON is required' });
    }

    console.log('🔍 Finding contact information...');

    // If no OpenAI key, return mock data
    if (!openai) {
      console.log('⚠️  Using mock data (no OpenAI API key)');
      return res.json({ 
        contacts: {
          email: "person@company.com",
          linkedin: "https://linkedin.com/in/username",
          twitter: "@username",
          company: "Example Company",
          website: "https://company.com"
        }
      });
    }

    const prompt = buildContactsPrompt(targetPersonJSON);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    // Parse JSON response
    try {
      const contacts = JSON.parse(response);
      console.log('✅ Found contact information');
      res.json({ contacts });
    } catch (error) {
      console.error('❌ Failed to parse contacts JSON:', error);
      res.status(500).json({ error: 'Invalid JSON response from OpenAI' });
    }
  } catch (error: any) {
    console.error('❌ Contacts endpoint error:', error);
    
    if (error.status === 401) {
      return res.status(500).json({ 
        error: 'OpenAI API key is invalid. Please check your .env file.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    openaiKeySet: hasValidOpenAIKey
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Global error handler:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🔑 OpenAI API key: ${hasValidOpenAIKey ? '✅ Set' : '❌ Missing (using mock data)'}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${port}/api/test`);
}); 