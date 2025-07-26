import OpenAI from 'openai';
import { runCompleteResearchPipeline } from './researchPipeline';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface ConversationContext {
  productIdea?: string;
  resources?: string[];
  targetAudience?: string;
  problemDescription?: string;
  businessModel?: string;
  stage: 'initial' | 'gathering' | 'ready_for_analysis';
  messageCount: number;
}

export async function analyzeUserInput(
  message: string, 
  context: ConversationContext,
  hasResources: boolean = false
): Promise<{ response: string; updatedContext: ConversationContext; shouldProceedToAnalysis: boolean }> {
  
  const systemPrompt = `You are an AI product validation expert helping entrepreneurs refine their product ideas. Your goal is to gather enough information through MAXIMUM 3 messages before proceeding to deep analysis.

Current context:
- Message count: ${context.messageCount}
- Stage: ${context.stage}
- Has product idea: ${!!context.productIdea}
- Has resources: ${hasResources}
- Has target audience: ${!!context.targetAudience}
- Has problem description: ${!!context.problemDescription}

Guidelines:
1. MAXIMUM 3 question-answer exchanges allowed
2. If message count >= 3, ALWAYS proceed to analysis regardless of information completeness
3. If user only provides a vague product idea, ask for target audience and problem details
4. If user only provides resources, ask about their product concept and target market
5. Be conversational and focused on gathering the most critical insights quickly
6. Don't ask more than 2 questions per response
7. After 3 exchanges OR when you have enough info, ALWAYS end with: "I have enough information to start the analysis!"

Respond in a helpful, conversational tone.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User message: "${message}"\n\nContext: ${JSON.stringify(context, null, 2)}` }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Could you try again?";
    
    // Update context based on the message
    const updatedContext: ConversationContext = {
      ...context,
      messageCount: context.messageCount + 1
    };

    // Extract information from the message
    if (message.toLowerCase().includes('target') || message.toLowerCase().includes('audience') || message.toLowerCase().includes('customer')) {
      updatedContext.targetAudience = message;
    }
    
    if (message.toLowerCase().includes('problem') || message.toLowerCase().includes('pain') || message.toLowerCase().includes('solve')) {
      updatedContext.problemDescription = message;
    }
    
    if (!context.productIdea && (message.toLowerCase().includes('product') || message.toLowerCase().includes('app') || message.toLowerCase().includes('service'))) {
      updatedContext.productIdea = message;
    }

    // Determine if we should proceed to analysis
    const shouldProceedToAnalysis = response.includes("I have enough information to start the analysis!") || 
                                   updatedContext.messageCount >= 3;

    if (shouldProceedToAnalysis) {
      updatedContext.stage = 'ready_for_analysis';
    } else if (updatedContext.messageCount >= 1) {
      updatedContext.stage = 'gathering';
    }

    return {
      response,
      updatedContext,
      shouldProceedToAnalysis
    };

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      response: "I'm having trouble connecting to my analysis engine. Could you try again in a moment?",
      updatedContext: { ...context, messageCount: context.messageCount + 1 },
      shouldProceedToAnalysis: false
    };
  }
}

export async function generateMarketAnalysis(context: ConversationContext): Promise<{
  icps: any[];
  discussions: any[];
  inboundContent: any[];
  outreachMessages: any[];
  hypothesis: string;
}> {
  try {
    // Détermine si c'est B2B ou B2C basé sur le contexte
    const isB2B = context.targetAudience?.toLowerCase().includes('business') || 
                  context.targetAudience?.toLowerCase().includes('professional') ||
                  context.targetAudience?.toLowerCase().includes('company') ||
                  context.productIdea?.toLowerCase().includes('saas') ||
                  context.productIdea?.toLowerCase().includes('enterprise');

    // Lance le pipeline de recherche complet
    const researchResults = await runCompleteResearchPipeline(
      context.problemDescription || context.productIdea || 'Product validation challenge',
      context.targetAudience || 'General users',
      isB2B
    );

    // Utilise les vraies discussions trouvées
    const realDiscussions = researchResults.discussions.map(d => ({
      platform: d.platform,
      title: d.title,
      url: d.url,
      engagement: d.engagement,
      relevance: Math.round(d.relevanceScore / 10),
      profileUrl: d.profileUrl,
      profileName: d.profileName
    }));

    // Génère les ICPs basés sur les insights réels
    const icpsFromInsights = researchResults.insights.segments.map((segment, index) => ({
      title: segment,
      description: `${segment} experiencing ${researchResults.insights.painPoints[index] || 'the core problem'}`,
      painPoints: researchResults.insights.painPoints.slice(index, index + 3),
      channels: isB2B ? ["LinkedIn", "Reddit", "Industry Forums"] : ["Reddit", "Facebook", "Twitter"]
    }));
  const analysisPrompt = `Based on the following product information, generate a comprehensive market analysis for user research and validation:

Product Idea: ${context.productIdea}
Target Audience: ${context.targetAudience}
Problem Description: ${context.problemDescription}
Resources: ${context.resources?.join(', ') || 'None provided'}
Research Insights: ${JSON.stringify(researchResults.insights)}

Generate a JSON response with:
1. "icps": Array of 2-3 detailed ICPs with title, description, painPoints array, and channels array
2. "discussions": Array of 4-5 realistic discussions from LinkedIn/Reddit/Quora with platform, title, url, engagement, relevance (1-10), profileUrl, profileName
3. "inboundContent": Array of 4-5 pieces of content for user research (LinkedIn posts, Twitter polls, newsletter content, landing page copy) with type, platform, content, cta
4. "outreachMessages": Array of 3-4 outreach templates for user research (LinkedIn DM, Reddit comment, cold email) with type, platform, message, personalization array
5. "hypothesis": Clear hypothesis statement for validation

Focus on USER RESEARCH and VALIDATION content, not sales. The goal is to validate the problem and solution fit.
Use the research insights to make the content more targeted and relevant.

Return ONLY valid JSON, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a market research expert. Generate realistic, actionable market analysis data in JSON format for user research and validation purposes." },
        { role: "user", content: analysisPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Parse the JSON response or return mock data if parsing fails
    try {
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const aiGenerated = JSON.parse(cleanedResponse);
      
      // Combine AI-generated content with real research data
      return {
        icps: icpsFromInsights.length > 0 ? icpsFromInsights : aiGenerated.icps,
        discussions: realDiscussions.length > 0 ? realDiscussions : aiGenerated.discussions,
        inboundContent: aiGenerated.inboundContent,
        outreachMessages: aiGenerated.outreachMessages,
        hypothesis: aiGenerated.hypothesis || `${context.targetAudience || 'Target users'} experience significant pain with ${context.problemDescription || 'the current problem'} and would be willing to try ${context.productIdea || 'a new solution'} if it addresses their core needs effectively.`
      };
    } catch {
      // Return structured mock data if JSON parsing fails
      const mockData = generateMockAnalysis(context);
      return {
        ...mockData,
        icps: icpsFromInsights.length > 0 ? icpsFromInsights : mockData.icps,
        discussions: realDiscussions.length > 0 ? realDiscussions : mockData.discussions
      };
    }

  } catch (error) {
    console.error('Analysis generation error:', error);
    const mockData = generateMockAnalysis(context);
    return mockData;
  }
}

function generateMockAnalysis(context: ConversationContext) {
  return {
    icps: [
      {
        title: "Early Adopter Segment",
        description: `Tech-savvy users experiencing the core problem you're solving`,
        painPoints: [
          "Struggling with current solutions",
          "Actively seeking alternatives",
          "Willing to try new approaches"
        ],
        channels: ["LinkedIn", "Reddit", "Twitter", "Industry Forums"]
      },
      {
        title: "Professional Users",
        description: `Business professionals who need this solution for work`,
        painPoints: [
          "Current tools are inefficient",
          "Need better workflow integration",
          "Looking for time-saving solutions"
        ],
        channels: ["LinkedIn", "Slack Communities", "Industry Events"]
      }
    ],
    discussions: [
      {
        platform: "LinkedIn",
        title: "Anyone else frustrated with current solutions for this problem?",
        url: "https://linkedin.com/posts/example-post",
        engagement: "45 comments, 120 likes",
        relevance: 8,
        profileUrl: "https://linkedin.com/in/potential-user",
        profileName: "Sarah Chen"
      },
      {
        platform: "Reddit",
        title: "What tools do you use for [related problem]?",
        url: "https://reddit.com/r/productivity/comments/example",
        engagement: "67 upvotes, 34 comments",
        relevance: 9,
        profileUrl: "https://reddit.com/user/productivityguru",
        profileName: "ProductivityGuru"
      },
      {
        platform: "Twitter",
        title: "Hot take: Current solutions for X are broken",
        url: "https://twitter.com/user/status/example",
        engagement: "89 likes, 23 retweets",
        relevance: 7,
        profileUrl: "https://twitter.com/techfounder",
        profileName: "TechFounder"
      }
    ],
    inboundContent: [
      {
        type: "LinkedIn Post",
        platform: "LinkedIn",
        content: `I'm researching a common problem many of us face...\n\nHow do you currently handle [specific problem]? What's your biggest frustration?\n\nBuilding something to solve this - would love your input! 👇`,
        cta: "Comment with your experience"
      },
      {
        type: "Twitter Poll",
        platform: "Twitter",
        content: `Quick poll for my network:\n\nWhat's your biggest challenge with [problem area]?\n\nA) Current tools are too complex\nB) Too expensive\nC) Missing key features\nD) Poor user experience`,
        cta: "Vote and share your thoughts"
      },
      {
        type: "Newsletter Content",
        platform: "Email",
        content: `Subject: Quick question about [problem area]\n\nHi [Name],\n\nI'm researching challenges in [problem space] and would love 2 minutes of your time.\n\nWhat's your current approach to [specific problem]? What works? What doesn't?\n\nBuilding something to help - your insights would be invaluable.`,
        cta: "Reply with your thoughts"
      },
      {
        type: "Landing Page",
        platform: "Website",
        content: `Are you tired of [problem description]?\n\nWe're building a solution and want to hear from you.\n\nShare your experience and be the first to know when we launch.`,
        cta: "Join our research community"
      }
    ],
    outreachMessages: [
      {
        type: "LinkedIn Comment",
        platform: "LinkedIn",
        message: `Great point about {specificPain}! I'm actually researching this exact problem. Would love to hear more about your experience - mind if I DM you a couple quick questions?`,
        personalization: ["{specificPain}", "{firstName}"]
      },
      {
        type: "Reddit Comment",
        platform: "Reddit",
        message: `This resonates! I'm building something to solve this exact problem. Would you be open to a quick 5-minute chat about your experience? Happy to share early access in return for feedback.`,
        personalization: ["{username}", "{specificContext}"]
      },
      {
        type: "Cold Email",
        platform: "Email",
        message: `Hi {firstName},\n\nSaw your post about {specificTopic} and it really resonated.\n\nI'm researching this problem space and would love 5 minutes of your time to understand your experience better.\n\nWould you be open to a quick call this week?`,
        personalization: ["{firstName}", "{specificTopic}", "{company}"]
      }
    ],
    hypothesis: `${context.targetAudience || 'Target users'} experience significant pain with ${context.problemDescription || 'the current problem'} and would be willing to try ${context.productIdea || 'a new solution'} if it addresses their core needs effectively.`
  };
}