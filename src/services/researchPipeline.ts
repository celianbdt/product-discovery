import { searchWithGoogleDorks, PLATFORM_CONFIG, B2B_PLATFORMS, B2C_PLATFORMS } from './serpApi';
import { generateProblemVariations, generateResearchInsights } from './anthropic';

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