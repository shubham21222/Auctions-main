/**
 * AI-Powered Content Generator for SEO Pages
 * Uses OpenAI GPT-4 for high-quality content generation
 */

const axios = require('axios');

// Load environment variables
require('dotenv').config();

class AIContentGenerator {
  constructor(apiKey) {
    this.openaiClient = axios.create({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    this.model = 'gpt-4o-mini'; // Cost-effective option
  }

  async generateContent(keyword, contentType = 'comprehensive') {
    const prompts = this.getPrompts(keyword, contentType);
    
    try {
      const responses = await Promise.all([
        this.generateMetaTitle(keyword),
        this.generateMetaDescription(keyword),
        this.generateMainContent(keyword)
      ]);

      return {
        metaTitle: responses[0],
        metaDescription: responses[1],
        content: responses[2]
      };
    } catch (error) {
      console.warn(`AI generation failed for "${keyword}": ${error.message}`);
      // Fallback to template-based generation
      return null;
    }
  }

  async generateMetaTitle(keyword) {
    const prompt = `Create a compelling, SEO-optimized meta title for a luxury auction/art website page about "${keyword}".

Requirements:
- Maximum 60 characters
- Include the keyword naturally
- Focus on luxury, authenticity, and quality
- Make it click-worthy
- Brand: NY Elizabeth Auctions
- Style: Professional, upscale

Examples of good titles:
- "Antique Paintings for Sale | Rare & Authentic Collections"
- "Premium Oil Paintings | Expert Curated Selection"

Create ONE title only:`;

    const response = await this.callOpenAI(prompt, 60);
    return response.trim().replace(/^["']|["']$/g, ''); // Remove quotes
  }

  async generateMetaDescription(keyword) {
    const prompt = `Write a compelling meta description for a luxury auction/art website page about "${keyword}".

Requirements:
- 150-160 characters maximum
- Include the keyword naturally
- Include a clear call-to-action
- Emphasize luxury, authenticity, expertise
- Make it click-worthy
- Brand: NY Elizabeth Auctions

Examples:
- "Discover authentic antique paintings for sale. Rare, handpicked art collections with worldwide delivery. Shop antique art today."
- "Explore premium oil paintings from our curated collection. Expert authentication, provenance included. Browse luxury art now."

Create ONE description only:`;

    const response = await this.callOpenAI(prompt, 160);
    return response.trim().replace(/^["']|["']$/g, '');
  }

  async generateMainContent(keyword) {
    const isCommercial = this.isCommercialKeyword(keyword);
    
    const prompt = `Write high-quality, SEO-optimized content for a luxury auction/art website page about "${keyword}".

Context:
- Brand: NY Elizabeth Auctions - premium art dealer and auction house
- Target audience: Art collectors, investors, luxury buyers
- Tone: Professional, authoritative, trustworthy, sophisticated
- Purpose: ${isCommercial ? 'Convert visitors to buyers' : 'Educate and build trust'}

Content Requirements:
- 800-1000 words total
- Include keyword naturally (1-1.5% density)
- Use LSI keywords and synonyms
- Structure with clear H2 and H3 headings
- Provide genuine value and expertise
- Focus on quality, authenticity, provenance
- Professional art market knowledge
- No fluff or keyword stuffing

Content Structure Needed:
1. Engaging introduction paragraph (include keyword in first sentence)
2. Main section 1: Value and significance of ${keyword}
3. Main section 2: How to evaluate/select quality pieces
4. Main section 3: Collection building and care
${isCommercial ? '4. Investment and market potential' : '4. Cultural and historical importance'}
5. Strong conclusion paragraph

Guidelines:
- Write for humans first, search engines second  
- Show expertise in art and antiques
- Use specific, authoritative language
- Include subtle trust signals
- Make it engaging and informative
- Natural paragraph flow

Write the complete content now:`;

    const response = await this.callOpenAI(prompt, 1200);
    return this.parseContentSections(response);
  }

  async callOpenAI(prompt, maxTokens = 500) {
    const response = await this.openaiClient.post('/chat/completions', {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO copywriter and art specialist writing for a luxury auction house. Write professional, engaging content that ranks well and converts visitors.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.9
    });

    return response.data.choices[0].message.content;
  }

  parseContentSections(content) {
    // Parse the AI-generated content into structured sections
    const sections = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    let currentSection = null;
    let introduction = '';
    let conclusion = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this is a heading (starts with ## or #)
      if (line.startsWith('##') || line.startsWith('#')) {
        // Save previous section if exists
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          heading: line.replace(/^#+\s*/, ''),
          content: ''
        };
      } else if (line.length > 0) {
        if (!currentSection && sections.length === 0 && !introduction) {
          // This is likely the introduction
          introduction += line + '\n\n';
        } else if (currentSection) {
          currentSection.content += line + '\n\n';
        } else if (sections.length > 0) {
          // This might be conclusion
          conclusion += line + '\n\n';
        }
      }
    }
    
    // Add final section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return {
      introduction: introduction.trim(),
      sections: sections,
      conclusion: conclusion.trim() || this.generateFallbackConclusion()
    };
  }

  generateFallbackConclusion() {
    return "Our commitment to excellence ensures that every piece in our collection meets the highest standards of quality and authenticity. Explore our curated selection and discover the perfect addition to your collection.";
  }

  isCommercialKeyword(keyword) {
    const commercialTerms = ['for sale', 'buy', 'purchase', 'price', 'cost', 'shop', 'online', 'store'];
    return commercialTerms.some(term => keyword.toLowerCase().includes(term));
  }

  // Generate H1 variations
  async generateH1(keyword) {
    const prompt = `Create a compelling H1 heading for "${keyword}" on a luxury art website.

Requirements:
- Include the keyword or close variation
- Professional and authoritative
- Maximum 70 characters
- Engaging for art collectors

Provide ONE heading only:`;

    const response = await this.callOpenAI(prompt, 50);
    return response.trim().replace(/^["']|["']$/g, '');
  }
}

module.exports = AIContentGenerator;