export const buildContactsPrompt = (targetPersonJSON: string) => `
You are an expert in finding professional contact information and conducting web research.

PERSON TO FIND (JSON):
${targetPersonJSON}

Please search for their contact information, including:
1. Professional email address
2. LinkedIn profile URL
3. Twitter handle (if relevant)
4. Company website
5. Any other professional contact methods

Return the results in this JSON format:
{
  "email": "person@company.com",
  "linkedin": "https://linkedin.com/in/username",
  "twitter": "@username",
  "company": "Company Name",
  "website": "https://company.com",
  "other": "Any other relevant contact info"
}

If you can't find certain information, omit those fields. Focus on finding at least their LinkedIn profile and professional email if possible.
`; 