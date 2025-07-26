export const buildOutreachPrompt = (
  productIdea: string,
  searchResultsJSON: string,
  targetPersonJSON: string,
) => `
You are an expert in customer outreach and sales messaging. Your task is to create a highly personalized outreach message for a potential customer.

PRODUCT IDEA: ${productIdea}

TARGET PERSON JSON:
${targetPersonJSON}

SEARCH CONTEXT:
${searchResultsJSON}

Create a personalized outreach message that:
1. **Shows understanding**: reference their specific problem and situation
2. **Provides value**: explain how your product could help them
3. **Is platform‑appropriate**: use the right tone
4. **Has clear CTA**: tell them exactly what you want them to do next
5. **Is concise**: keep it under 150 words

Return only the message text, no additional formatting or explanations.
`; 