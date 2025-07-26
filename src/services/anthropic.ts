import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

// Model selection based on task complexity and cost optimization
export const MODELS = {
  // Fast and cheap for simple tasks (conversation, variations)
  FAST: 'claude-3-haiku-20240307',
  // Balanced for medium complexity (analysis, content generation)  
  BALANCED: 'claude-3-sonnet-20240229',
  // Most capable for complex tasks (deep analysis, research insights)
  ADVANCED: 'claude-3-opus-20240229'
};

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

Respond in a helpful, conversational tone in French.`;

  try {
    const completion = await anthropic.messages.create({
      model: MODELS.FAST, // Use fast model for conversation
      max_tokens: 500,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        { 
          role: "user", 
          content: `User message: "${message}"\n\nContext: ${JSON.stringify(context, null, 2)}` 
        }
      ]
    });

    const response = completion.content[0]?.type === 'text' ? completion.content[0].text : "Je n'ai pas pu traiter votre demande. Pouvez-vous réessayer ?";
    
    // Update context based on the message
    const updatedContext: ConversationContext = {
      ...context,
      messageCount: context.messageCount + 1
    };

    // Extract information from the message
    if (message.toLowerCase().includes('target') || message.toLowerCase().includes('audience') || message.toLowerCase().includes('client') || message.toLowerCase().includes('utilisateur')) {
      updatedContext.targetAudience = message;
    }
    
    if (message.toLowerCase().includes('problème') || message.toLowerCase().includes('problem') || message.toLowerCase().includes('douleur') || message.toLowerCase().includes('résoudre')) {
      updatedContext.problemDescription = message;
    }
    
    if (!context.productIdea && (message.toLowerCase().includes('produit') || message.toLowerCase().includes('app') || message.toLowerCase().includes('service') || message.toLowerCase().includes('solution'))) {
      updatedContext.productIdea = message;
    }

    // Determine if we should proceed to analysis
    const shouldProceedToAnalysis = response.includes("I have enough information to start the analysis!") || 
                                   response.includes("J'ai assez d'informations pour commencer l'analyse!") ||
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
    console.error('Anthropic API Error:', error);
    return {
      response: "J'ai des difficultés à me connecter à mon moteur d'analyse. Pouvez-vous réessayer dans un moment ?",
      updatedContext: { ...context, messageCount: context.messageCount + 1 },
      shouldProceedToAnalysis: false
    };
  }
}

export async function generateProblemVariations(originalProblem: string): Promise<any[]> {
  const prompt = `Génère 20 variations TRÈS DIFFÉRENTES de cette problématique pour la recherche utilisateur :

Problématique originale : "${originalProblem}"

Instructions :
- Utilise des synonymes techniques et le vocabulaire du domaine
- Crée des questions utilisateur ("How to...", "Why...", "What tool...")
- Explore les problèmes connexes et sous-problèmes
- Varie la complexité (débutant à expert)
- Inclus des formulations négatives et positives
- Pense aux différents angles d'approche

Format JSON requis :
{
  "variations": [
    {
      "text": "variation de la problématique",
      "reasoning": "pourquoi cette variation est pertinente",
      "type": "question|statement|pain_point"
    }
  ]
}

Retourne UNIQUEMENT le JSON, pas d'autre texte.`;

  try {
    const completion = await anthropic.messages.create({
      model: MODELS.FAST, // Use fast model for variations
      max_tokens: 2000,
      temperature: 0.8,
      messages: [{ role: "user", content: prompt }]
    });

    const response = completion.content[0]?.type === 'text' ? completion.content[0].text : '';
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedResponse);
    
    return parsed.variations || [];
  } catch (error) {
    console.error('Error generating variations:', error);
    // Fallback variations
    return [
      {
        text: originalProblem,
        reasoning: "Original problem statement",
        type: "statement"
      },
      {
        text: `How to solve ${originalProblem.toLowerCase()}`,
        reasoning: "Question format for user searches",
        type: "question"
      },
      {
        text: `Why is ${originalProblem.toLowerCase()} a problem`,
        reasoning: "Understanding the root cause",
        type: "question"
      }
    ];
  }
}

export async function generateResearchInsights(
  discussions: any[],
  originalProblem: string
): Promise<any> {
  const prompt = `Analyse ces discussions utilisateur et génère des insights pour la recherche utilisateur :

Problématique : "${originalProblem}"

Discussions trouvées :
${discussions.map(d => `[${d.platform}] ${d.title}\n${d.content}`).join('\n\n')}

Génère un JSON avec :
{
  "overview": "Résumé général (2-3 phrases)",
  "painPoints": ["Point de douleur 1", "Point de douleur 2", "Point de douleur 3"],
  "segments": ["Segment utilisateur 1", "Segment utilisateur 2", "Segment utilisateur 3"],
  "opportunities": ["Opportunité business 1", "Opportunité business 2"],
  "sentiment": "negative|positive|neutral",
  "keyInsights": ["Insight clé 1", "Insight clé 2", "Insight clé 3"]
}

Retourne UNIQUEMENT le JSON, pas d'autre texte.`;

  try {
    const completion = await anthropic.messages.create({
      model: MODELS.BALANCED, // Use balanced model for insights
      max_tokens: 1500,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }]
    });

    const response = completion.content[0]?.type === 'text' ? completion.content[0].text : '';
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error generating insights:', error);
    // Fallback insights
    return {
      overview: "Analysis of user discussions reveals common patterns and pain points related to the problem.",
      painPoints: ["Current solutions are inadequate", "Process is time-consuming", "Lack of proper tools"],
      segments: ["Early adopters", "Professional users", "Casual users"],
      opportunities: ["Streamline the process", "Provide better tools"],
      sentiment: "negative",
      keyInsights: ["Users are actively seeking solutions", "Market demand exists", "Competition is limited"]
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
    // Extract the actual problem from context - prioritize problemDescription, then productIdea
    const actualProblem = context.problemDescription || context.productIdea || 'Product validation challenge';
    const actualTarget = context.targetAudience || 'General users';
    
    // Détermine si c'est B2B ou B2C basé sur le contexte
    const isB2B = actualTarget.toLowerCase().includes('business') || 
                  actualTarget.toLowerCase().includes('professional') ||
                  actualTarget.toLowerCase().includes('company') ||
                  actualProblem.toLowerCase().includes('saas') ||
                  actualProblem.toLowerCase().includes('enterprise') ||
                  actualProblem.toLowerCase().includes('b2b');

    // Import research pipeline here to avoid circular dependency
    const { runCompleteResearchPipeline } = await import('./researchPipeline');
    
    // Lance le pipeline de recherche complet
    const researchResults = await runCompleteResearchPipeline(
      actualProblem,
      actualTarget,
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

Product Idea: ${context.productIdea || 'Not specified'}
Target Audience: ${actualTarget}
Problem Description: ${actualProblem}
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
Respond in French.

Return ONLY valid JSON, no additional text.`;

    const completion = await anthropic.messages.create({
      model: MODELS.BALANCED, // Use balanced model for analysis
      max_tokens: 3000,
      temperature: 0.7,
      system: "You are a market research expert. Generate realistic, actionable market analysis data in JSON format for user research and validation purposes.",
      messages: [{ role: "user", content: analysisPrompt }]
    });

    const response = completion.content[0]?.type === 'text' ? completion.content[0].text : '';
    
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
      }
    ],
    inboundContent: [
      {
        type: "LinkedIn Post",
        platform: "LinkedIn",
        content: `Je recherche un problème commun que beaucoup d'entre nous rencontrent...\n\nComment gérez-vous actuellement [problème spécifique] ? Quelle est votre plus grande frustration ?\n\nJe construis quelque chose pour résoudre cela - j'aimerais avoir votre avis ! 👇`,
        cta: "Commentez avec votre expérience"
      }
    ],
    outreachMessages: [
      {
        type: "LinkedIn Comment",
        platform: "LinkedIn",
        message: `Excellent point sur {specificPain} ! Je recherche actuellement ce problème exact. J'aimerais en savoir plus sur votre expérience - puis-je vous envoyer quelques questions rapides en DM ?`,
        personalization: ["{specificPain}", "{firstName}"]
      }
    ],
    hypothesis: `${context.targetAudience || 'Target users'} experience significant pain with ${context.problemDescription || 'the current problem'} and would be willing to try ${context.productIdea || 'a new solution'} if it addresses their core needs effectively.`
  };
}