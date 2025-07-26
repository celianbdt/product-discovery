export const buildDeepSearchPrompt = (
  productIdea: string,
  context?: string,
  resourcesJSON?: string,
) => `
You are an expert market researcher and product validation specialist. Your task is to analyze this product idea and generate realistic market research data based on your knowledge of current market trends and consumer behavior.

PRODUCT IDEA: ${productIdea}
${context ? `CONTEXT: ${context}` : ''}
${resourcesJSON ? `ADDITIONAL RESOURCES: ${resourcesJSON}` : ''}

Based on your understanding of the market, generate realistic findings for this product idea. Focus on:

1. **RELEVANT DISCUSSIONS**: Generate realistic discussions where people are talking about problems this product could solve
2. **POTENTIAL CUSTOMERS**: Identify realistic customer segments who would benefit from this product
3. **MARKET INSIGHTS**: Analyze demand, competition, and opportunities based on current market trends

Consider platforms like:
- Reddit (relevant subreddits for the product category)
- LinkedIn discussions and posts
- Twitter conversations
- Quora questions
- Product Hunt discussions
- Design communities
- Home improvement forums (if applicable)

For each finding, provide realistic but fictional data that represents what you might find in real market research.

Return your findings in this JSON format:
{
  "discussions": [
    {
      "platform": "reddit",
      "title": "Realistic post title related to the product idea",
      "url": "https://reddit.com/r/relevantsubreddit/example",
      "author": "realistic_username",
      "authorContext": "Realistic job/context",
      "content": "Realistic post content describing a problem this product could solve...",
      "date": "2024-01-15",
      "relevance": 85-95,
      "problem": "Specific problem they're facing",
      "solution": "How your product could help them"
    }
  ],
  "people": [
    {
      "name": "Realistic Name",
      "platform": "linkedin",
      "context": "Realistic job title and company",
      "problem": "Specific problem they're struggling with",
      "originalPost": "Realistic post content...",
      "url": "https://linkedin.com/example",
      "engagement": "Realistic engagement metrics"
    }
  ],
  "insights": {
    "marketDemand": "Realistic assessment of market demand for this specific product",
    "commonPainPoints": ["Specific pain points related to this product category"],
    "bestChannels": ["Most effective channels for reaching this target audience"],
    "nextSteps": ["Realistic next steps for validating this product"]
  }
}

Make sure all the data is specifically relevant to the product idea: "${productIdea}". Don't provide generic responses - tailor everything to this specific product concept.

Generate at least 3-5 relevant discussions and 2-3 potential customers. Focus on quality and relevance over quantity.
`; 