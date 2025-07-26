interface SerpResult {
  title: string;
  url: string;
  description: string;
  position: number;
}

interface SerpResponse {
  results: SerpResult[];
  related_keywords?: string[];
}

const RAPIDAPI_KEY = 'fb00df1ae4msha58581349d26d16p1f3f24jsne7ab1d3e49d1';
const RAPIDAPI_HOST = 'google-search74.p.rapidapi.com';

export async function searchWithGoogleDorks(query: string, limit: number = 10): Promise<SerpResponse> {
  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}/?query=${encodeURIComponent(query)}&limit=${limit}&related_keywords=true`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`SERP API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('SERP API Error:', error);
    throw error;
  }
}

export const PLATFORM_CONFIG = {
  'reddit.com': {
    contentSelector: '[data-testid="post-content"], .usertext-body, .md',
    authorSelector: '[data-testid="post_author_link"], .author',
    dateSelector: 'time[datetime], [data-testid="post_timestamp"]',
    engagementSelector: '[data-testid="post-vote-count"], .score',
    scoreBoost: 25
  },
  'linkedin.com': {
    contentSelector: '.feed-shared-text, .attributed-text-segment-list__content',
    authorSelector: '.feed-shared-actor__name, .attributed-text-segment-list__content',
    dateSelector: '.feed-shared-actor__sub-description time',
    engagementSelector: '.social-counts-reactions__count',
    scoreBoost: 30
  },
  'quora.com': {
    contentSelector: '.puppeteer_test_question_title, .ui_qtext_expanded',
    authorSelector: '.user_name, .author_info',
    dateSelector: '.datetime, .answer_permalink',
    engagementSelector: '.count, .vote_item',
    scoreBoost: 20
  },
  'medium.com': {
    contentSelector: 'article p, .graf--p',
    authorSelector: '.author-name, .ds-link',
    dateSelector: 'time',
    engagementSelector: '.clapCount, .js-multirecommendCountButton',
    scoreBoost: 15
  },
  'news.ycombinator.com': {
    contentSelector: '.storylink, .comment',
    authorSelector: '.hnuser',
    dateSelector: '.age',
    engagementSelector: '.score',
    scoreBoost: 20
  },
  'stackoverflow.com': {
    contentSelector: '.question-summary, .post-text',
    authorSelector: '.user-details',
    dateSelector: '.relativetime',
    engagementSelector: '.vote-count-post',
    scoreBoost: 25
  }
};

export const B2B_PLATFORMS = [
  'reddit.com',
  'linkedin.com', 
  'quora.com',
  'medium.com',
  'news.ycombinator.com',
  'stackoverflow.com',
  'github.com',
  'producthunt.com',
  'indiehackers.com'
];

export const B2C_PLATFORMS = [
  'reddit.com',
  'quora.com',
  'commentcamarche.net',
  'doctissimo.fr',
  'aufeminin.com',
  'marmiton.org',
  'psychologies.com',
  'tomsguide.fr'
];