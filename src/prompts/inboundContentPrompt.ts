export const buildInboundContentPrompt = (
  productIdea: string,
  insightsJSON: string,
  icpsJSON: string
) => `
You are an expert content strategist and inbound marketing specialist. Your task is to create engaging inbound content that will attract and engage the target audience for this product idea.

PRODUCT IDEA: ${productIdea}

MARKET INSIGHTS:
${insightsJSON}

IDENTIFIED ICPS:
${icpsJSON}

Create diverse inbound content pieces that will:
1. **Attract the right audience** - Use the insights to target the identified ICPs
2. **Address pain points** - Create content that speaks to their specific challenges
3. **Provide value** - Offer insights, tips, or solutions they can use immediately
4. **Drive engagement** - Include clear calls-to-action that encourage interaction
5. **Build authority** - Position the product as a solution to their problems

Generate content for these platforms:
- LinkedIn posts (professional audience)
- Twitter/X posts (concise, engaging)
- Reddit posts (community-focused)
- Newsletter content (educational)
- Blog post ideas (long-form content)

For each piece, include:
- Platform-specific formatting
- Engaging hook/headline
- Valuable content that addresses pain points
- Clear call-to-action
- Estimated engagement potential

Return your content in this JSON format:
{
  "inboundContent": [
    {
      "type": "LinkedIn Post",
      "platform": "LinkedIn",
      "title": "Engaging headline",
      "content": "Full post content with proper formatting...",
      "cta": "Clear call-to-action",
      "targetAudience": "Specific ICP this targets",
      "painPoint": "Pain point this addresses",
      "estimatedEngagement": "High/Medium/Low"
    },
    {
      "type": "Twitter Thread",
      "platform": "Twitter",
      "title": "Thread headline",
      "content": "Thread content with numbered tweets...",
      "cta": "Call-to-action",
      "targetAudience": "Specific ICP",
      "painPoint": "Pain point addressed",
      "estimatedEngagement": "High/Medium/Low"
    },
    {
      "type": "Reddit Post",
      "platform": "Reddit",
      "title": "Post title",
      "content": "Post content...",
      "cta": "Call-to-action",
      "targetAudience": "Specific ICP",
      "painPoint": "Pain point addressed",
      "estimatedEngagement": "High/Medium/Low"
    },
    {
      "type": "Newsletter Content",
      "platform": "Email",
      "title": "Newsletter subject line",
      "content": "Newsletter content...",
      "cta": "Call-to-action",
      "targetAudience": "Specific ICP",
      "painPoint": "Pain point addressed",
      "estimatedEngagement": "High/Medium/Low"
    },
    {
      "type": "Blog Post Idea",
      "platform": "Blog",
      "title": "Blog post title",
      "content": "Blog post outline and key points...",
      "cta": "Call-to-action",
      "targetAudience": "Specific ICP",
      "painPoint": "Pain point addressed",
      "estimatedEngagement": "High/Medium/Low"
    }
  ]
}

Make sure all content is specifically tailored to the product idea: "${productIdea}". Focus on creating content that will genuinely help the target audience and position your product as the solution they need.
`; 