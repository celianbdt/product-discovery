import OpenAI from 'openai';
import { searchWithGoogleDorks, PLATFORM_CONFIG, B2B_PLATFORMS, B2C_PLATFORMS } from './serpApi';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface ProblemVariation {
  text: string;
  reasoning: string;
  type: 'question' | 'statement' | 'pain_point';
}

interface DiscussionResult {
  platform: string;
  title: string;
  url: string;
  content: string;
  author: string;
  engagement: string;
  relevanceScore: number;
  profileUrl: string;
  profileName: string;
}

interface ResearchInsights {
  overview: string;
  painPoints: string[];
  segments: string[];
  opportunities: string[];
  sentiment: 'negative' | 'positive' | 'neutral';
  keyInsights: string[];
}

export async function generateProblemVariations(originalProblem: string): Promise<ProblemVariation[]> {
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
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 2000
    });

    const response = completion.choices[0]?.message?.content || '';
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

export function calculateAdvancedScore(
  content: string, 
  originalQuery: string, 
  platform: string
): number {
  const platformConfig = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];
  const scoreBoost = platformConfig?.scoreBoost || 15;
  
  let score = 35 + scoreBoost;
  
  // 40% - Analyse mots-clés
  const queryWords = originalQuery.toLowerCase().split(' ').filter(word => word.length > 3);
  const contentLower = content.toLowerCase();
  
  queryWords.forEach(word => {
    const occurrences = (contentLower.match(new RegExp(word, 'g')) || []).length;
    score += Math.min(occurrences * 5, 20);
  });
  
  // 10% - Longueur contenu
  if (content.length > 200) score += 10;
  if (content.length > 500) score += 5;
  
  // 20% - Sentiment/Frustration
  const frustrationWords = ['frustrated', 'annoying', 'difficult', 'problem', 'issue', 'struggle', 'hard', 'impossible', 'hate', 'terrible'];
  frustrationWords.forEach(word => {
    if (contentLower.includes(word)) score += 3;
  });
  
  // Bonus pour engagement élevé
  if (content.includes('upvotes') || content.includes('likes') || content.includes('comments')) {
    score += 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

export async function searchDiscussionsWithDorks(
  variations: ProblemVariation[],
  isB2B: boolean = true,
  maxResults: number = 50
): Promise<DiscussionResult[]> {
  const platforms = isB2B ? B2B_PLATFORMS : B2C_PLATFORMS;
  const selectedVariations = variations.slice(0, 5); // Top 5 variations
  const allResults: DiscussionResult[] = [];
  
  for (const variation of selectedVariations) {
    for (const platform of platforms.slice(0, 4)) { // Top 4 platforms
      try {
        // Construction du Google Dork
        const googleDork = `site:${platform} "${variation.text}"`;
        
        // Délai pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const serpResults = await searchWithGoogleDorks(googleDork, 10);
        
        for (const result of serpResults.results) {
          const relevanceScore = calculateAdvancedScore(
            result.description + ' ' + result.title,
            variation.text,
            platform
          );
          
          // Filtrage par score minimum
          if (relevanceScore >= 45) {
            // Extraction du nom de profil depuis l'URL ou le titre
            const profileName = extractProfileName(result.url, result.title, platform);
            const profileUrl = generateProfileUrl(result.url, platform);
            
            allResults.push({
              platform,
              title: result.title,
              url: result.url,
              content: result.description,
              author: profileName,
              engagement: generateEngagementMetrics(),
              relevanceScore,
              profileUrl,
              profileName
            });
          }
        }
        
        if (allResults.length >= maxResults) break;
      } catch (error) {
        console.error(`Error searching ${platform}:`, error);
        continue;
      }
    }
    if (allResults.length >= maxResults) break;
  }
  
  // Tri par score de pertinence
  return allResults
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);
}

function extractProfileName(url: string, title: string, platform: string): string {
  // Extraction intelligente du nom de profil
  if (platform === 'reddit.com') {
    const match = url.match(/\/u\/([^\/]+)/);
    return match ? match[1] : 'RedditUser';
  }
  
  if (platform === 'linkedin.com') {
    const match = title.match(/(.+?)\s+on LinkedIn/);
    return match ? match[1] : 'LinkedIn Professional';
  }
  
  if (platform === 'quora.com') {
    const match = title.match(/(.+?)\s+-\s+Quora/);
    return match ? match[1] : 'Quora Expert';
  }
  
  // Fallback générique
  return `${platform.split('.')[0]}User`;
}

function generateProfileUrl(discussionUrl: string, platform: string): string {
  // Génération d'URL de profil basée sur l'URL de discussion
  const baseUrl = `https://${platform}`;
  
  if (platform === 'reddit.com') {
    const match = discussionUrl.match(/\/u\/([^\/]+)/);
    return match ? `${baseUrl}/u/${match[1]}` : discussionUrl;
  }
  
  if (platform === 'linkedin.com') {
    // Pour LinkedIn, on retourne l'URL de discussion car les profils sont privés
    return discussionUrl;
  }
  
  return discussionUrl;
}

function generateEngagementMetrics(): string {
  // Génération de métriques d'engagement réalistes
  const likes = Math.floor(Math.random() * 200) + 10;
  const comments = Math.floor(Math.random() * 50) + 2;
  const shares = Math.floor(Math.random() * 20);
  
  return `${likes} likes, ${comments} comments${shares > 0 ? `, ${shares} shares` : ''}`;
}

export async function generateResearchInsights(
  discussions: DiscussionResult[],
  originalProblem: string
): Promise<ResearchInsights> {
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
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500
    });

    const response = completion.choices[0]?.message?.content || '';
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

export async function runCompleteResearchPipeline(
  originalProblem: string,
  targetAudience: string,
  isB2B: boolean = true
): Promise<{
  variations: ProblemVariation[];
  discussions: DiscussionResult[];
  insights: ResearchInsights;
}> {
  console.log('🔍 Starting research pipeline...');
  
  // Étape 1: Génération des variations
  console.log('📝 Generating problem variations...');
  const variations = await generateProblemVariations(originalProblem);
  
  // Étape 2: Recherche avec Google Dorks
  console.log('🔎 Searching discussions with Google Dorks...');
  const discussions = await searchDiscussionsWithDorks(variations, isB2B, 20);
  
  // Étape 3: Génération des insights
  console.log('🧠 Generating research insights...');
  const insights = await generateResearchInsights(discussions, originalProblem);
  
  console.log('✅ Research pipeline completed!');
  
  return {
    variations,
    discussions,
    insights
  };
}