import OpenAI from 'openai';

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
  
  const systemPrompt = `You are an AI product validation expert helping entrepreneurs refine their product ideas. Your goal is to gather enough information through 2-3 messages before proceeding to deep analysis.

Current context:
- Message count: ${context.messageCount}
- Stage: ${context.stage}
- Has product idea: ${!!context.productIdea}
- Has resources: ${hasResources}
- Has target audience: ${!!context.targetAudience}
- Has problem description: ${!!context.problemDescription}

Guidelines:
1. If user only provides a vague product idea, ask for more details about the problem they're solving and target audience
2. If user only provides resources, ask about their specific product concept and target market
3. If user provides both but lacks clarity on target audience or problem depth, dig deeper
4. After 2-3 meaningful exchanges, suggest moving to analysis phase
5. Be conversational, helpful, and focused on gathering actionable insights
6. Don't ask more than 2 questions per response
7. Show enthusiasm and expertise

Respond in a helpful, conversational tone. If you think we have enough information after this exchange, end with: "I think we have enough to start the analysis! Let me dive deep into your market and generate some insights."`;

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
    const shouldProceedToAnalysis = response.includes("I think we have enough to start the analysis!") || 
                                   (updatedContext.messageCount >= 3 && updatedContext.productIdea && updatedContext.targetAudience);

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
  const analysisPrompt = `Based on the following product information, generate a comprehensive market analysis:

Product Idea: ${context.productIdea}
Target Audience: ${context.targetAudience}
Problem Description: ${context.problemDescription}
Resources: ${context.resources?.join(', ') || 'None provided'}

Generate:
1. 2-3 detailed ICPs with pain points and channels
2. 3-4 relevant discussions (simulate realistic LinkedIn/Reddit/Quora posts)
3. 4 pieces of inbound content (LinkedIn posts, Twitter polls, newsletter, landing page)
4. 3 outreach message templates
5. A clear hypothesis statement

Format as JSON with the exact structure expected by the frontend.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a market research expert. Generate realistic, actionable market analysis data in JSON format." },
        { role: "user", content: analysisPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Parse the JSON response or return mock data if parsing fails
    try {
      return JSON.parse(response);
    } catch {
      // Return structured mock data if JSON parsing fails
      return generateMockAnalysis(context);
    }

  } catch (error) {
    console.error('Analysis generation error:', error);
    return generateMockAnalysis(context);
  }
}

function generateMockAnalysis(context: ConversationContext) {
  return {
    icps: [
      {
        title: "Primary Target Segment",
        description: `Based on your product idea: ${context.productIdea?.substring(0, 100)}...`,
        painPoints: [
          "Main challenge identified from your description",
          "Secondary pain point in the market",
          "Opportunity for improvement"
        ],
        channels: ["LinkedIn", "Industry Forums", "Direct Outreach"]
      }
    ],
    discussions: [
      {
        platform: "LinkedIn",
        title: "Discussion related to your product space",
        url: "https://linkedin.com/posts/example",
        engagement: "25 comments, 80 likes",
        relevance: 8,
        profileUrl: "https://linkedin.com/in/potential-customer",
        profileName: "Potential Customer"
      }
    ],
    inboundContent: [
      {
        type: "LinkedIn Post",
        platform: "LinkedIn",
        content: `What if there was a solution for ${context.problemDescription?.substring(0, 50)}...?\n\nDrop a comment if this resonates with you 👇`,
        cta: "Comment your thoughts"
      }
    ],
    outreachMessages: [
      {
        type: "LinkedIn DM",
        platform: "LinkedIn",
        message: `Hi {firstName},\n\nI noticed your interest in ${context.productIdea?.substring(0, 30)}... Would love to get your thoughts on something I'm building.\n\nMind if I share a quick demo?`,
        personalization: ["{firstName}", "{company}"]
      }
    ],
    hypothesis: `${context.targetAudience} struggle with ${context.problemDescription} and would benefit from ${context.productIdea}.`
  };
}