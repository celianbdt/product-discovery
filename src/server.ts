import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { buildDeepSearchPrompt } from './prompts/deepSearchPrompt.js';
import { buildOutreachPrompt } from './prompts/outreachPrompt.js';
import { buildContactsPrompt } from './prompts/contactsPrompt.js';
import { buildInboundContentPrompt } from './prompts/inboundContentPrompt.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Check if OpenAI API key is set
const hasValidOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';

// Check if FullEnrich API key is set
const hasValidFullEnrichKey = process.env.FULLENRICH_API_KEY && process.env.FULLENRICH_API_KEY !== 'your_fullenrich_api_key_here';

if (!hasValidOpenAIKey) {
  console.warn('⚠️  OPENAI_API_KEY is not set or invalid in .env file');
  console.warn('   API endpoints will return mock data for testing');
  console.warn('   To use real OpenAI API, set a valid key in your .env file');
}

if (!hasValidFullEnrichKey) {
  console.warn('⚠️  FULLENRICH_API_KEY is not set or invalid in .env file');
  console.warn('   Contact enrichment will use mock data for testing');
  console.warn('   To use real FullEnrich API, set a valid key in your .env file');
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

// POST /api/product_validator/inbound-content
app.post('/api/product_validator/inbound-content', async (req, res) => {
  try {
    const { productIdea, insightsJSON, icpsJSON } = req.body;

    if (!productIdea || !insightsJSON || !icpsJSON) {
      return res.status(400).json({ 
        error: 'productIdea, insightsJSON, and icpsJSON are required' 
      });
    }

    console.log('📝 Generating inbound content...');

    // If no OpenAI key, return mock data
    if (!openai) {
      console.log('⚠️  Using mock data (no OpenAI API key)');
      return res.json({ 
        inboundContent: [
          {
            type: "LinkedIn Post",
            platform: "LinkedIn",
            title: "The #1 mistake founders make when validating ideas",
            content: "I've talked to 50+ founders this month, and there's one pattern I keep seeing...\n\nThey spend months building before validating.\n\nHere's what I learned:\n\n• 80% of successful products started with simple validation\n• The best founders test assumptions first\n• Speed beats perfection every time\n\nWhat's your biggest validation challenge? Drop a comment below 👇",
            cta: "Comment your biggest validation challenge",
            targetAudience: "Founders and entrepreneurs",
            painPoint: "Spending too much time building before validating",
            estimatedEngagement: "High"
          },
          {
            type: "Twitter Thread",
            platform: "Twitter",
            title: "5 validation frameworks that actually work",
            content: "1/ Want to validate your product idea fast?\n\nHere are 5 frameworks that actually work:\n\n2/ 🎯 Problem-Solution Fit\n- Find people with the problem\n- Test if they'll pay for a solution\n- Validate before building\n\n3/ 📊 Landing Page Test\n- Build a simple landing page\n- Drive traffic to it\n- Measure interest and signups\n\n4/ 💬 Customer Interviews\n- Talk to 10+ potential customers\n- Ask about their biggest pain points\n- Validate your assumptions\n\n5/ 🔥 Smoke Test\n- Create a minimal version\n- Get real user feedback\n- Iterate based on insights\n\n6/ Which framework have you tried? What worked best?\n\nFollow for more validation tips! 🚀",
            cta: "Follow for more validation tips",
            targetAudience: "Product managers and founders",
            painPoint: "Not knowing how to validate ideas systematically",
            estimatedEngagement: "High"
          },
          {
            type: "Reddit Post",
            platform: "Reddit",
            title: "How do you validate SaaS ideas before building?",
            content: "I'm working on a SaaS tool and want to validate it properly before investing months of development.\n\nWhat methods have worked best for you?\n\nI'm thinking:\n- Landing page with waitlist\n- Customer interviews\n- Competitor analysis\n- Social media validation\n\nAny other approaches I should consider?",
            cta: "Share your validation methods",
            targetAudience: "SaaS founders and developers",
            painPoint: "Uncertainty about validation methods",
            estimatedEngagement: "Medium"
          },
          {
            type: "Newsletter Content",
            platform: "Email",
            title: "The Validation Playbook: 3 Steps to Product-Market Fit",
            content: "Hey founders! 👋\n\nThis week I'm sharing the exact 3-step process I used to validate my last product idea in just 2 weeks.\n\nStep 1: Define Your Hypothesis\n- What problem are you solving?\n- Who has this problem?\n- How will you solve it?\n\nStep 2: Test with Real People\n- Find 10 people with the problem\n- Interview them about their pain points\n- Validate your assumptions\n\nStep 3: Measure Interest\n- Create a simple landing page\n- Drive targeted traffic\n- Track conversion rates\n\nWant the full playbook? Reply with 'VALIDATION' and I'll send you the detailed guide.\n\nKeep building! 🚀",
            cta: "Reply with 'VALIDATION' for the full guide",
            targetAudience: "Newsletter subscribers",
            painPoint: "Need for systematic validation process",
            estimatedEngagement: "Medium"
          },
          {
            type: "Blog Post Idea",
            platform: "Blog",
            title: "The Complete Guide to Product Validation: From Idea to Launch",
            content: "Outline:\n\n1. Introduction: Why validation matters\n2. The validation mindset shift\n3. Step-by-step validation process\n   - Problem identification\n   - Market research\n   - Customer interviews\n   - Landing page testing\n   - MVP development\n4. Common validation mistakes to avoid\n5. Tools and frameworks for validation\n6. Case studies and examples\n7. Next steps after validation\n\nKey takeaways:\n- Validation saves time and money\n- Start with the problem, not the solution\n- Test assumptions early and often\n- Use data to make decisions\n\nCall-to-action: Download our validation checklist",
            cta: "Download our validation checklist",
            targetAudience: "Product managers and entrepreneurs",
            painPoint: "Need for comprehensive validation guide",
            estimatedEngagement: "High"
          }
        ]
      });
    }

    const prompt = buildInboundContentPrompt(productIdea, insightsJSON, icpsJSON);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    console.log('✅ Generated inbound content');

    // Try to parse as JSON, if it fails wrap in raw
    try {
      const parsed = JSON.parse(response);
      res.json(parsed);
    } catch (error) {
      console.error('❌ Failed to parse inbound content JSON:', error);
      res.status(500).json({ error: 'Invalid JSON response from OpenAI' });
    }
  } catch (error: any) {
    console.error('❌ Inbound content endpoint error:', error);
    
    if (error.status === 401) {
      return res.status(500).json({ 
        error: 'OpenAI API key is invalid. Please check your .env file.' 
      });
    } else if (error.status === 429) {
      return res.status(500).json({ 
        error: 'OpenAI API rate limit exceeded. Please try again later.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// POST /api/product_validator/enrich-contacts
app.post('/api/product_validator/enrich-contacts', async (req, res) => {
  try {
    const { prospects, webhookUrl } = req.body;

    if (!prospects || !Array.isArray(prospects) || prospects.length === 0) {
      return res.status(400).json({ error: 'prospects array is required' });
    }

    if (prospects.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 prospects allowed per request' });
    }

    console.log(`🔍 Enriching ${prospects.length} contacts...`);

    // If no FullEnrich key, return mock data
    if (!hasValidFullEnrichKey) {
      console.log('⚠️  Using mock data (no FullEnrich API key)');
      const mockEnrichedProspects = prospects.map((prospect: any, index: number) => ({
        ...prospect,
        enriched: {
          email: `enriched${index + 1}@${prospect.company?.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: `+1-555-${String(index + 100).padStart(3, '0')}-${String(index + 1000).padStart(4, '0')}`,
          company_email: `info@${prospect.company?.toLowerCase().replace(/\s+/g, '')}.com`,
          company_phone: `+1-555-${String(index + 200).padStart(3, '0')}-${String(index + 2000).padStart(4, '0')}`,
          company_website: `https://${prospect.company?.toLowerCase().replace(/\s+/g, '')}.com`,
          linkedin_url: prospect.linkedin || `https://linkedin.com/in/${prospect.name?.toLowerCase().replace(/\s+/g, '')}`,
          twitter_url: `https://twitter.com/${prospect.name?.toLowerCase().replace(/\s+/g, '')}`,
          confidence_score: Math.floor(Math.random() * 30) + 70 // 70-100
        }
      }));
      
      return res.json({ 
        enrichment_id: `mock-${Date.now()}`,
        prospects: mockEnrichedProspects,
        message: 'Mock enrichment completed (no FullEnrich API key)'
      });
    }

    // Prepare data for FullEnrich API
    const enrichmentData = prospects.map((prospect: any) => {
      const [firstName, ...lastNameParts] = (prospect.name || '').split(' ');
      const lastName = lastNameParts.join(' ');
      
      return {
        firstname: firstName || '',
        lastname: lastName || '',
        domain: prospect.company ? `${prospect.company.toLowerCase().replace(/\s+/g, '')}.com` : undefined,
        company_name: prospect.company || '',
        linkedin_url: prospect.linkedin || '',
        enrich_fields: ["contact.emails", "contact.phones"],
        custom: {
          prospect_id: prospect.id || prospect.name,
          source: prospect.source || 'unknown'
        }
      };
    });

    const payload = {
      name: `Product Validator Enrichment - ${new Date().toISOString().split('T')[0]}`,
      datas: enrichmentData,
      ...(webhookUrl && { webhook_url: webhookUrl })
    };

    console.log('📤 Sending enrichment request to FullEnrich...');

    const response = await fetch('https://app.fullenrich.com/api/v1/contact/enrich/bulk', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FULLENRICH_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FullEnrich API error:', response.status, errorText);
      
      if (response.status === 401) {
        return res.status(500).json({ 
          error: 'FullEnrich API key is invalid. Please check your .env file.' 
        });
      } else if (response.status === 429) {
        return res.status(500).json({ 
          error: 'FullEnrich API rate limit exceeded. Please try again later.' 
        });
      }
      
      return res.status(500).json({ 
        error: 'FullEnrich API error',
        details: errorText 
      });
    }

    const result = await response.json();
    console.log('✅ Enrichment request sent successfully');
    
    res.json({
      enrichment_id: result.enrichment_id,
      message: 'Enrichment request submitted successfully. Results will be available via webhook or polling.',
      prospects_count: prospects.length
    });

  } catch (error: any) {
    console.error('❌ Enrich contacts endpoint error:', error);
    
    if (error.code === 'ENOTFOUND') {
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

// GET /api/product_validator/enrichment-status/:enrichmentId
app.get('/api/product_validator/enrichment-status/:enrichmentId', async (req, res) => {
  try {
    const { enrichmentId } = req.params;

    if (!enrichmentId) {
      return res.status(400).json({ error: 'enrichmentId is required' });
    }

    console.log(`🔍 Checking enrichment status for: ${enrichmentId}`);

    // If no FullEnrich key, return mock status
    if (!hasValidFullEnrichKey) {
      console.log('⚠️  Using mock status (no FullEnrich API key)');
      return res.json({
        enrichment_id: enrichmentId,
        status: 'completed',
        progress: 100,
        results: {
          enriched_contacts: 3,
          failed_contacts: 0,
          total_contacts: 3
        },
        message: 'Mock enrichment completed (no FullEnrich API key)'
      });
    }

    const response = await fetch(`https://app.fullenrich.com/api/v1/bulk/${enrichmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.FULLENRICH_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FullEnrich status check error:', response.status, errorText);
      
      if (response.status === 404) {
        return res.status(404).json({ 
          error: 'Enrichment not found or not yet processed' 
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to check enrichment status',
        details: errorText 
      });
    }

    const result = await response.json();
    console.log('✅ Enrichment status retrieved');
    
    res.json(result);

  } catch (error: any) {
    console.error('❌ Enrichment status endpoint error:', error);
    
    if (error.code === 'ENOTFOUND') {
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    openaiKeySet: hasValidOpenAIKey,
    fullEnrichKeySet: hasValidFullEnrichKey
  });
});

// Webhook endpoint for FullEnrich results
app.post('/api/webhook/fullenrich', (req, res) => {
  console.log('📥 Received FullEnrich webhook:', JSON.stringify(req.body, null, 2));
  
  // In a real application, you would:
  // 1. Verify the webhook signature
  // 2. Process the enriched data
  // 3. Update your database
  // 4. Notify the frontend
  
  res.json({ status: 'received' });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Global error handler:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🔑 OpenAI API key: ${hasValidOpenAIKey ? '✅ Set' : '❌ Missing (using mock data)'}`);
  console.log(`🔑 FullEnrich API key: ${hasValidFullEnrichKey ? '✅ Set' : '❌ Missing (using mock data)'}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${port}/api/test`);
}); 