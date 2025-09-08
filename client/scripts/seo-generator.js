#!/usr/bin/env node

/**
 * Advanced SEO Page Generator for Next.js
 * Generates high-quality, SEO-optimized pages from Excel keywords
 * 
 * Features:
 * - Excel file processing
 * - AI-powered content generation
 * - Image fetching (Unsplash + Pexels)
 * - Internal linking system
 * - Schema markup generation
 * - Meta optimization
 */

const fs = require('fs').promises;
const path = require('path');
const XLSX = require('xlsx');
const axios = require('axios');
const AIContentGenerator = require('./ai-content-generator');

// Load environment variables
require('dotenv').config();

// Configuration
const CONFIG = {
  EXCEL_FILE: '../keywords.xlsx',
  OUTPUT_DIR: 'src/app/(seo-pages)',
  UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY || '',
  PEXELS_API_KEY: process.env.PEXELS_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  SITE_URL: 'https://bid.nyelizabeth.com',
  COMPANY_NAME: 'NY Elizabeth Auctions',
  MIN_CONTENT_LENGTH: 800,
  MAX_CONTENT_LENGTH: 1200,
  IMAGES_PER_PAGE: 3,
  INTERNAL_LINKS_PER_PAGE: 4,
  USE_AI_CONTENT: process.env.USE_AI_CONTENT === 'true' || false
};

// Utility functions
const utils = {
  // Convert keyword to URL-safe slug
  keywordToSlug: (keyword) => {
    return keyword
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  },

  // Convert slug back to readable title
  slugToTitle: (slug) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  // Calculate keyword similarity for internal linking
  calculateSimilarity: (keyword1, keyword2) => {
    const words1 = keyword1.toLowerCase().split(/\s+/);
    const words2 = keyword2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = [...new Set([...words1, ...words2])];
    
    return commonWords.length / totalWords.length;
  },

  // Delay function for API rate limiting
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Safe file write with directory creation
  safeWriteFile: async (filePath, content) => {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
  }
};

// Enhanced Content Generation Engine
class ContentGenerator {
  constructor() {
    this.aiGenerator = CONFIG.OPENAI_API_KEY ? new AIContentGenerator(CONFIG.OPENAI_API_KEY) : null;
    
    // Premium vocabulary for luxury art content
    this.luxuryTerminology = {
      'art': ['masterwork', 'artistic achievement', 'cultural treasure', 'fine art', 'artistic excellence'],
      'antique': ['period piece', 'historical artifact', 'vintage treasure', 'heritage item', 'collectible masterpiece'],
      'painting': ['canvas masterpiece', 'artistic composition', 'painted work', 'pictorial art', 'brushwork excellence'],
      'collection': ['curated selection', 'assembled works', 'artistic portfolio', 'cultivated holdings', 'distinguished assemblage'],
      'rare': ['exceptional', 'scarce', 'coveted', 'distinguished', 'extraordinary'],
      'authentic': ['verified', 'documented', 'provenance-assured', 'certified genuine', 'authenticated'],
      'quality': ['exceptional caliber', 'museum-quality', 'investment-grade', 'premium standard', 'superior craftsmanship'],
      'expertise': ['connoisseurship', 'scholarly knowledge', 'curatorial expertise', 'specialized insight', 'professional acumen']
    };

    // Professional art market terminology
    this.artMarketTerms = {
      'provenance': 'documented ownership history',
      'condition_report': 'professional assessment',
      'attribution': 'scholarly identification',
      'catalogue_raisonné': 'comprehensive scholarly documentation',
      'conservation': 'professional preservation treatment',
      'exhibition_history': 'museum and gallery display record'
    };
  }

  // Generate SEO-optimized meta title
  generateMetaTitle(keyword) {
    const variations = [
      `${this.capitalizeWords(keyword)} | ${CONFIG.COMPANY_NAME}`,
      `Premium ${this.capitalizeWords(keyword)} - Authentic Collection`,
      `${this.capitalizeWords(keyword)} | Rare & Exclusive Pieces`,
      `Buy ${this.capitalizeWords(keyword)} | Expert Curated Selection`,
      `${this.capitalizeWords(keyword)} - Professional Art Dealers`
    ];
    
    // Select variation that's under 60 characters
    const suitable = variations.find(title => title.length <= 60);
    return suitable || variations[0].substring(0, 57) + '...';
  }

  // Generate compelling meta description
  generateMetaDescription(keyword) {
    const variations = [
      `Discover authentic ${keyword} from our expertly curated collection. Premium quality, worldwide shipping, and certificate of authenticity included.`,
      `Explore rare ${keyword} at ${CONFIG.COMPANY_NAME}. Handpicked by experts, authenticated pieces with provenance. Shop with confidence today.`,
      `Find exceptional ${keyword} in our exclusive collection. Museum-quality pieces, expert authentication, and worldwide delivery available.`,
      `Premium ${keyword} collection featuring rare and authentic pieces. Professional curation, certificate of authenticity, secure worldwide shipping.`
    ];
    
    const description = variations[Math.floor(Math.random() * variations.length)];
    return description.length <= 160 ? description : description.substring(0, 157) + '...';
  }

  // Generate H1 heading
  generateH1(keyword) {
    const variations = [
      this.capitalizeWords(keyword),
      `Premium ${this.capitalizeWords(keyword)}`,
      `Authentic ${this.capitalizeWords(keyword)}`,
      `Exclusive ${this.capitalizeWords(keyword)} Collection`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)];
  }

  // Generate professional introduction paragraph
  generateIntroduction(keyword) {
    const keywordType = this.analyzeKeywordType(keyword);
    
    const expertIntros = {
      'paintings': [
        `${this.capitalizeWords(keyword)} represent centuries of artistic mastery and cultural evolution, each piece bearing witness to the creative vision of its creator. Our distinguished collection showcases works that have been carefully evaluated for their artistic merit, historical significance, and investment potential, ensuring collectors acquire pieces of lasting value and beauty.`,
        
        `The pursuit of exceptional ${keyword} demands both connoisseurship and access to authenticated works with impeccable provenance. Our curatorial team brings decades of expertise in identifying masterpieces that transcend mere decoration, offering collectors the opportunity to own cultural artifacts that embody the highest standards of artistic achievement.`
      ],
      
      'antiques': [
        `${this.capitalizeWords(keyword)} serve as tangible connections to our cultural heritage, each piece narrating stories of craftsmanship, social history, and artistic tradition. Our meticulously curated selection features objects that have survived the test of time, bearing authentic marks of their period while maintaining their relevance for contemporary collectors.`,
        
        `The world of ${keyword} encompasses objects of exceptional rarity and historical importance, each carefully preserved and documented to ensure authenticity. Our collection represents the culmination of scholarly research and market expertise, offering discerning collectors access to pieces that exemplify the finest achievements of their respective periods.`
      ],
      
      'sculptures': [
        `${this.capitalizeWords(keyword)} embody the three-dimensional mastery of form, space, and material that has captivated collectors for millennia. Our curated selection features works that demonstrate exceptional technical skill and artistic vision, each piece carefully selected for its significance within the broader context of sculptural history.`,
        
        `The appreciation of ${keyword} requires understanding the complex relationship between material, technique, and artistic expression. Our collection offers collectors the opportunity to acquire works that represent pivotal moments in sculptural development, each piece accompanied by comprehensive documentation and scholarly analysis.`
      ],
      
      'collectibles': [
        `${this.capitalizeWords(keyword)} represent specialized fields of collecting that demand expertise, patience, and access to authentic examples with verifiable provenance. Our carefully assembled collection features pieces that have been rigorously authenticated and evaluated, ensuring collectors receive objects of genuine historical and cultural significance.`,
        
        `The pursuit of exceptional ${keyword} requires deep understanding of materials, techniques, and market dynamics that distinguish remarkable pieces from ordinary examples. Our curatorial approach emphasizes quality over quantity, offering collectors access to pieces that represent the finest achievements within their specific categories.`
      ]
    };

    const selectedCategory = expertIntros[keywordType] || expertIntros['collectibles'];
    return selectedCategory[Math.floor(Math.random() * selectedCategory.length)];
  }

  // Generate main content sections
  generateMainContent(keyword) {
    const isCommercial = this.isCommercialKeyword(keyword);
    const sections = [];

    // Section 1: Value and Significance
    sections.push({
      heading: `Why ${this.capitalizeWords(keyword)} Are Highly Valued`,
      content: `The enduring appeal of ${keyword} lies in their unique combination of artistic merit, historical significance, and investment potential. These exceptional works represent not merely decorative objects, but tangible connections to cultural heritage and artistic tradition.

      Each piece in our ${keyword} collection has been selected for its outstanding quality, provenance, and aesthetic impact. The rarity and authenticity of these works contribute to their increasing value over time, making them excellent additions to both private collections and institutional holdings.

      Collectors appreciate ${keyword} for their ability to transform spaces while serving as conversation pieces that reflect sophistication and cultural awareness. The emotional and intellectual satisfaction derived from owning such pieces often exceeds their monetary value, creating lasting connections between collector and artwork.`
    });

    // Section 2: Selection Criteria
    sections.push({
      heading: `How to Choose the Perfect ${this.capitalizeWords(keyword.split(' ')[0])}`,
      content: `Selecting exceptional ${keyword} requires careful consideration of multiple factors that influence both aesthetic appeal and long-term value. Our experts evaluate condition, provenance, artistic significance, and market position to ensure each piece meets our exacting standards.

      Authentication plays a crucial role in the selection process, with our specialists conducting thorough research into each work's history, materials, and creation circumstances. This meticulous approach guarantees that collectors receive genuine pieces with complete documentation and verified authenticity.

      Consider factors such as size, subject matter, artistic period, and condition when evaluating ${keyword}. Our team provides detailed condition reports and historical context for each piece, enabling informed decision-making that aligns with individual collecting goals and aesthetic preferences.`
    });

    // Section 3: Collection and Care
    sections.push({
      heading: `Building Your ${this.capitalizeWords(keyword)} Collection`,
      content: `Developing a meaningful collection of ${keyword} involves strategic planning, market knowledge, and access to exceptional pieces. Our curatorial team assists collectors in identifying works that complement existing holdings while expanding into new areas of interest.

      Proper care and conservation ensure that ${keyword} maintain their beauty and value for future generations. We provide comprehensive guidance on display, storage, and maintenance, including recommendations for professional conservation services when needed.

      The journey of collecting ${keyword} extends beyond acquisition to include ongoing research, documentation, and appreciation of the works' cultural significance. Our ongoing support helps collectors develop deeper understanding and appreciation of their growing collections.`
    });

    // Section 4: Market and Investment (for commercial keywords)
    if (isCommercial) {
      sections.push({
        heading: `Investment Potential of ${this.capitalizeWords(keyword)}`,
        content: `The market for ${keyword} has demonstrated remarkable resilience and growth potential, with exceptional pieces consistently outperforming traditional investment vehicles. Our market expertise helps collectors identify works with strong appreciation potential while building collections of lasting cultural significance.

        Current market trends show increasing demand for ${keyword}, driven by growing collector interest and institutional acquisition programs. This sustained demand, combined with limited supply of high-quality pieces, creates favorable conditions for value appreciation over time.

        Professional appraisal and documentation services ensure that collectors maintain accurate records of their ${keyword} holdings, supporting both insurance requirements and potential future transactions. Our network of certified appraisers provides authoritative valuations recognized by leading institutions worldwide.`
      });
    }

    return sections;
  }

  // Generate conclusion paragraph
  generateConclusion(keyword) {
    const conclusions = [
      `Our commitment to excellence in ${keyword} extends beyond mere transaction to encompass education, authentication, and ongoing collector support. Each piece represents not only an aesthetic achievement but also a sound investment in cultural heritage and artistic legacy.`,
      
      `The exceptional quality and authenticity of our ${keyword} collection reflect decades of expertise in identifying and acquiring remarkable works. We invite discerning collectors to explore these extraordinary pieces and discover the perfect additions to their collections.`,
      
      `Whether seeking to begin a new collection or enhance an existing one, our ${keyword} selection offers unparalleled quality and authenticity. Contact our specialists to learn more about specific pieces and discover how these remarkable works can enrich your collecting journey.`
    ];
    
    return conclusions[Math.floor(Math.random() * conclusions.length)];
  }

  // Determine if keyword has commercial intent
  isCommercialKeyword(keyword) {
    const commercialTerms = ['for sale', 'buy', 'purchase', 'price', 'cost', 'shop', 'online', 'store'];
    return commercialTerms.some(term => keyword.toLowerCase().includes(term));
  }

  // Analyze keyword type for specialized content
  analyzeKeywordType(keyword) {
    const kw = keyword.toLowerCase();
    if (kw.includes('painting') || kw.includes('canvas') || kw.includes('portrait') || kw.includes('landscape')) return 'paintings';
    if (kw.includes('sculpture') || kw.includes('bronze') || kw.includes('marble') || kw.includes('ceramic')) return 'sculptures';
    if (kw.includes('antique') || kw.includes('vintage') || kw.includes('period') || kw.includes('historical')) return 'antiques';
    return 'collectibles';
  }

  // Enhanced content generation with AI integration
  async generateContentWithAI(keyword) {
    if (this.aiGenerator && CONFIG.USE_AI_CONTENT) {
      try {
        console.log(`🤖 Generating AI content for: ${keyword}`);
        const aiContent = await this.aiGenerator.generateContent(keyword);
        if (aiContent) return aiContent;
      } catch (error) {
        console.warn(`AI generation failed for ${keyword}, falling back to template: ${error.message}`);
      }
    }
    
    // Fallback to enhanced template generation
    return {
      metaTitle: this.generateMetaTitle(keyword),
      metaDescription: this.generateMetaDescription(keyword),
      content: {
        introduction: this.generateIntroduction(keyword),
        sections: this.generateMainContent(keyword),
        conclusion: this.generateConclusion(keyword)
      }
    };
  }

  // Capitalize words properly
  capitalizeWords(text) {
    return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}

// Image Fetching Service
class ImageService {
  constructor() {
    this.unsplashClient = axios.create({
      baseURL: 'https://api.unsplash.com',
      headers: { 'Authorization': `Client-ID ${CONFIG.UNSPLASH_ACCESS_KEY}` }
    });
    
    this.pexelsClient = axios.create({
      baseURL: 'https://api.pexels.com/v1',
      headers: { 'Authorization': CONFIG.PEXELS_API_KEY }
    });
  }

  async fetchImages(keyword, count = CONFIG.IMAGES_PER_PAGE) {
    const images = [];
    const searchTerms = this.generateSearchTerms(keyword);
    
    try {
      // Try Unsplash first
      for (let i = 0; i < Math.ceil(count / 2) && i < searchTerms.length; i++) {
        try {
          await utils.delay(1000); // Rate limiting
          const response = await this.unsplashClient.get('/search/photos', {
            params: {
              query: searchTerms[i],
              per_page: 1,
              orientation: 'landscape'
            }
          });
          
          if (response.data.results.length > 0) {
            const photo = response.data.results[0];
            images.push({
              url: photo.urls.regular,
              alt: `${keyword} - ${photo.alt_description || 'Premium artwork'}`,
              source: 'unsplash',
              credit: `Photo by ${photo.user.name} on Unsplash`
            });
          }
        } catch (error) {
          console.warn(`Unsplash fetch failed for ${searchTerms[i]}:`, error.message);
        }
      }

      // Fill remaining with Pexels
      const remaining = count - images.length;
      if (remaining > 0) {
        for (let i = 0; i < remaining && i < searchTerms.length; i++) {
          try {
            await utils.delay(1000); // Rate limiting
            const response = await this.pexelsClient.get('/search', {
              params: {
                query: searchTerms[i],
                per_page: 1,
                orientation: 'landscape'
              }
            });
            
            if (response.data.photos.length > 0) {
              const photo = response.data.photos[0];
              images.push({
                url: photo.src.large,
                alt: `${keyword} - Premium collection piece`,
                source: 'pexels',
                credit: `Photo by ${photo.photographer} on Pexels`
              });
            }
          } catch (error) {
            console.warn(`Pexels fetch failed for ${searchTerms[i]}:`, error.message);
          }
        }
      }

    } catch (error) {
      console.error('Image fetching error:', error.message);
    }

    // Fill with fallback images if needed
    while (images.length < count) {
      images.push({
        url: '/placeholder-artwork.jpg',
        alt: `${keyword} - Premium artwork collection`,
        source: 'fallback',
        credit: 'Placeholder image'
      });
    }

    return images;
  }

  generateSearchTerms(keyword) {
    const terms = [keyword];
    
    // Add variations
    if (keyword.includes('art')) terms.push('fine art museum');
    if (keyword.includes('painting')) terms.push('oil painting canvas');
    if (keyword.includes('antique')) terms.push('vintage collectible');
    if (keyword.includes('sculpture')) terms.push('bronze sculpture art');
    
    return terms.slice(0, 3);
  }
}

// Schema Markup Generator
class SchemaGenerator {
  generateSchema(keyword, pageData) {
    const isCommercial = this.isCommercial(keyword);
    const baseSchema = this.getBaseSchema(pageData);
    
    if (isCommercial) {
      return this.generateProductSchema(keyword, pageData);
    } else {
      return this.generateArticleSchema(keyword, pageData);
    }
  }

  getBaseSchema(pageData) {
    return {
      "@context": "https://schema.org",
      "url": `${CONFIG.SITE_URL}/${pageData.slug}`,
      "publisher": {
        "@type": "Organization",
        "name": CONFIG.COMPANY_NAME,
        "url": CONFIG.SITE_URL
      }
    };
  }

  generateProductSchema(keyword, pageData) {
    return {
      ...this.getBaseSchema(pageData),
      "@type": "Product",
      "name": pageData.metaTitle,
      "description": pageData.metaDescription,
      "category": "Art & Collectibles",
      "brand": {
        "@type": "Brand",
        "name": CONFIG.COMPANY_NAME
      },
      "offers": {
        "@type": "AggregateOffer",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "USD",
        "seller": {
          "@type": "Organization",
          "name": CONFIG.COMPANY_NAME
        }
      },
      "image": pageData.images.map(img => img.url)
    };
  }

  generateArticleSchema(keyword, pageData) {
    return {
      ...this.getBaseSchema(pageData),
      "@type": "Article",
      "headline": pageData.h1,
      "description": pageData.metaDescription,
      "author": {
        "@type": "Organization",
        "name": CONFIG.COMPANY_NAME
      },
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "image": pageData.images.map(img => img.url),
      "articleSection": "Art & Collectibles"
    };
  }

  isCommercial(keyword) {
    const commercialTerms = ['for sale', 'buy', 'purchase', 'price', 'shop'];
    return commercialTerms.some(term => keyword.toLowerCase().includes(term));
  }
}

// Internal Linking System
class LinkingService {
  constructor(keywords) {
    this.keywords = keywords;
    this.linkingMap = new Map();
    this.buildLinkingMap();
  }

  buildLinkingMap() {
    this.keywords.forEach(keyword => {
      const relatedKeywords = this.findRelatedKeywords(keyword);
      this.linkingMap.set(keyword, relatedKeywords);
    });
  }

  findRelatedKeywords(targetKeyword) {
    const similarities = this.keywords
      .filter(keyword => keyword !== targetKeyword)
      .map(keyword => ({
        keyword,
        similarity: utils.calculateSimilarity(targetKeyword, keyword)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, CONFIG.INTERNAL_LINKS_PER_PAGE);

    return similarities.map(item => ({
      keyword: item.keyword,
      slug: utils.keywordToSlug(item.keyword),
      anchorText: this.generateAnchorText(item.keyword)
    }));
  }

  generateAnchorText(keyword) {
    const variations = [
      keyword,
      `premium ${keyword}`,
      `authentic ${keyword}`,
      `${keyword} collection`,
      `rare ${keyword}`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)];
  }

  getInternalLinks(keyword) {
    return this.linkingMap.get(keyword) || [];
  }
}

// Progress Tracking Class
class ProgressTracker {
  constructor(total) {
    this.total = total;
    this.completed = 0;
    this.failed = 0;
    this.startTime = Date.now();
    this.generatedPages = [];
    this.errors = [];
  }

  update(success, pageData = null, error = null) {
    if (success) {
      this.completed++;
      if (pageData) this.generatedPages.push(pageData);
    } else {
      this.failed++;
      if (error) this.errors.push(error);
    }
    this.displayProgress();
  }

  displayProgress() {
    const percentage = Math.round((this.completed + this.failed) / this.total * 100);
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const rate = (this.completed + this.failed) / elapsed;
    const eta = this.completed + this.failed < this.total 
      ? Math.round((this.total - this.completed - this.failed) / rate) 
      : 0;

    // Progress bar
    const barLength = 30;
    const filled = Math.round(barLength * percentage / 100);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    
    console.clear();
    console.log('🚀 SEO Page Generation Progress\n');
    console.log(`[${bar}] ${percentage}%`);
    console.log(`\n📊 Statistics:`);
    console.log(`   Total: ${this.total} pages`);
    console.log(`   ✅ Completed: ${this.completed}`);
    console.log(`   ❌ Failed: ${this.failed}`);
    console.log(`   ⏱️  Time: ${elapsed}s`);
    if (eta > 0) console.log(`   🔮 ETA: ${eta}s`);
    console.log(`   🚀 Rate: ${rate.toFixed(1)} pages/sec`);
    
    if (this.failed > 0) {
      console.log(`\n⚠️  Recent Errors:`);
      this.errors.slice(-3).forEach(error => {
        console.log(`   • ${error.keyword}: ${error.message}`);
      });
    }
  }

  generateCSV() {
    const csvHeaders = 'Keyword,URL,Slug,Status,Meta Title,Meta Description,Images Count,Internal Links Count\n';
    const csvRows = this.generatedPages.map(page => {
      return [
        `"${page.keyword}"`,
        `"${CONFIG.SITE_URL}/${page.slug}"`,
        `"${page.slug}"`,
        '"Success"',
        `"${page.metaTitle}"`,
        `"${page.metaDescription}"`,
        page.images.length,
        page.internalLinks.length
      ].join(',');
    }).join('\n');

    return csvHeaders + csvRows;
  }

  getSummary() {
    return {
      total: this.total,
      completed: this.completed,
      failed: this.failed,
      successRate: Math.round((this.completed / this.total) * 100),
      duration: Math.round((Date.now() - this.startTime) / 1000),
      generatedPages: this.generatedPages,
      errors: this.errors
    };
  }
}

// Main Generator Class
class SEOPageGenerator {
  constructor() {
    this.contentGenerator = new ContentGenerator();
    this.imageService = new ImageService();
    this.schemaGenerator = new SchemaGenerator();
    this.linkingService = null;
    this.keywords = [];
    this.progressTracker = null;
  }

  async initialize() {
    console.log('🚀 Initializing SEO Page Generator...');
    
    // Read Excel file
    this.keywords = await this.readExcelFile();
    console.log(`📊 Loaded ${this.keywords.length} keywords from Excel file`);
    
    // Initialize progress tracker
    this.progressTracker = new ProgressTracker(this.keywords.length);
    
    // Initialize linking service
    this.linkingService = new LinkingService(this.keywords);
    console.log('🔗 Internal linking system initialized');
    
    return this;
  }

  async readExcelFile() {
    try {
      const workbook = XLSX.readFile(CONFIG.EXCEL_FILE);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Extract keywords (from second column - row[1])
      return data
        .slice(1) // Skip header row
        .map(row => row[1])
        .filter(keyword => keyword && typeof keyword === 'string')
        .map(keyword => keyword.trim());
        
    } catch (error) {
      throw new Error(`Failed to read Excel file: ${error.message}`);
    }
  }

  async generatePage(keyword) {
    try {
      const slug = utils.keywordToSlug(keyword);
      const metaTitle = this.contentGenerator.generateMetaTitle(keyword);
      const metaDescription = this.contentGenerator.generateMetaDescription(keyword);
      const h1 = this.contentGenerator.generateH1(keyword);
      const introduction = this.contentGenerator.generateIntroduction(keyword);
      const sections = this.contentGenerator.generateMainContent(keyword);
      const conclusion = this.contentGenerator.generateConclusion(keyword);
      const images = await this.imageService.fetchImages(keyword);
      const internalLinks = this.linkingService.getInternalLinks(keyword);
      
      const pageData = {
        slug,
        keyword,
        metaTitle,
        metaDescription,
        h1,
        introduction,
        sections,
        conclusion,
        images,
        internalLinks
      };
      
      const schema = this.schemaGenerator.generateSchema(keyword, pageData);
      const pageContent = this.generatePageTemplate(pageData, schema);
      
      // Write page file
      const filePath = path.join(CONFIG.OUTPUT_DIR, `${slug}`, 'page.tsx');
      await utils.safeWriteFile(filePath, pageContent);
      
      // Update progress tracker
      this.progressTracker.update(true, pageData);
      
      return pageData;
    } catch (error) {
      // Update progress tracker with error
      this.progressTracker.update(false, null, { keyword, message: error.message });
      throw error;
    }
  }

  generatePageTemplate(data, schema) {
    const { slug, keyword, metaTitle, metaDescription, h1, introduction, sections, conclusion, images, internalLinks } = data;
    
    return `import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

// SEO-optimized page for: ${keyword}
export const metadata = {
  title: "${metaTitle}",
  description: "${metaDescription}",
  keywords: "${keyword}, art collection, authentic artwork, premium art",
  openGraph: {
    title: "${metaTitle}",
    description: "${metaDescription}",
    url: "${CONFIG.SITE_URL}/${slug}",
    type: "website",
    images: [
      {
        url: "${images[0]?.url || '/placeholder-artwork.jpg'}",
        width: 1200,
        height: 630,
        alt: "${images[0]?.alt || keyword}"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "${metaTitle}",
    description: "${metaDescription}",
    images: ["${images[0]?.url || '/placeholder-artwork.jpg'}"]
  }
};

export default function ${this.toPascalCase(slug)}Page() {
  const jsonLd = ${JSON.stringify(schema, null, 2)};

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Header />

      <section className="py-12 md:py-20 mt-[80px] bg-gradient-to-b from-gray-50 to-white overflow-hidden">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                ${h1}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                ${introduction}
              </p>
            </div>
            
            {/* Hero Image */}
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="${images[0]?.url || '/placeholder-artwork.jpg'}"
                alt="${images[0]?.alt || keyword}"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <article className="prose prose-lg mx-auto">
              ${sections.map((section, index) => `
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">${section.heading}</h2>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  ${section.content.split('\n\n').map(paragraph => `
                  <p>${paragraph.trim()}</p>
                  `).join('')}
                </div>
                
                ${index === 1 && images[1] ? `
                <div className="my-8">
                  <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="${images[1].url}"
                      alt="${images[1].alt}"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                  </div>
                </div>
                ` : ''}
              </section>
              `).join('')}
              
              {/* Internal Links Section */}
              ${internalLinks.length > 0 ? `
              <section className="my-12 p-6 bg-gray-50 rounded-xl">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Related Collections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  ${internalLinks.map(link => `
                  <Link href="/${link.slug}" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      ${link.anchorText}
                    </span>
                  </Link>
                  `).join('')}
                </div>
              </section>
              ` : ''}
              
              {/* Final Image and Conclusion */}
              ${images[2] ? `
              <div className="my-8">
                <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="${images[2].url}"
                    alt="${images[2].alt}"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              </div>
              ` : ''}
              
              <section className="mt-12">
                <p className="text-lg text-gray-700 leading-relaxed">
                  ${conclusion}
                </p>
              </section>
            </article>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h2 className="text-3xl font-bold mb-4">
              Discover Your Next Masterpiece
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Explore our curated collection of authentic ${keyword} and find the perfect addition to your collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/Auctions" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors">
                Browse Auctions
              </Link>
              <Link href="/Buy-now" className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg font-semibold transition-colors">
                Shop Collection
              </Link>
            </div>
          </div>
        </section>
      
      <Footer />
    </>
  );
}`;
  }

  toPascalCase(str) {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  async generateAllPages() {
    console.log(`🎯 Starting generation of ${this.keywords.length} SEO pages...\n`);
    
    const batchSize = 5; // Process in batches to avoid rate limits
    
    for (let i = 0; i < this.keywords.length; i += batchSize) {
      const batch = this.keywords.slice(i, i + batchSize);
      const batchPromises = batch.map(async (keyword) => {
        try {
          await this.generatePage(keyword);
          return { keyword, status: 'fulfilled' };
        } catch (error) {
          return { keyword, status: 'rejected', error: error.message };
        }
      });
      
      await Promise.allSettled(batchPromises);
      
      // Rate limiting between batches
      if (i + batchSize < this.keywords.length) {
        await utils.delay(2000);
      }
    }
    
    // Final progress update
    console.clear();
    const summary = this.progressTracker.getSummary();
    
    console.log('🎉 SEO Page Generation Complete!\n');
    console.log('📊 Final Statistics:');
    console.log(`   Total Keywords: ${summary.total}`);
    console.log(`   ✅ Successfully Generated: ${summary.completed}`);
    console.log(`   ❌ Failed: ${summary.failed}`);
    console.log(`   🎯 Success Rate: ${summary.successRate}%`);
    console.log(`   ⏱️  Total Duration: ${summary.duration}s`);
    console.log(`   🚀 Average Rate: ${(summary.completed / summary.duration).toFixed(2)} pages/sec`);
    
    // Generate and save CSV file
    let csvFilename = null;
    if (summary.completed > 0) {
      const csvContent = this.progressTracker.generateCSV();
      csvFilename = `generated-seo-pages-${new Date().toISOString().split('T')[0]}.csv`;
      await utils.safeWriteFile(csvFilename, csvContent);
      console.log(`\n📄 CSV Report Generated: ${csvFilename}`);
      console.log(`   Contains all ${summary.completed} successfully generated page URLs`);
    }
    
    // Save detailed JSON report
    const report = {
      timestamp: new Date().toISOString(),
      summary,
      generatedPages: this.progressTracker.generatedPages.map(page => ({
        keyword: page.keyword,
        url: `${CONFIG.SITE_URL}/${page.slug}`,
        slug: page.slug,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        imagesCount: page.images.length,
        internalLinksCount: page.internalLinks.length
      })),
      errors: this.progressTracker.errors
    };
    
    const reportFilename = `seo-generation-report-${new Date().toISOString().split('T')[0]}.json`;
    await utils.safeWriteFile(reportFilename, JSON.stringify(report, null, 2));
    console.log(`📊 Detailed Report: ${reportFilename}`);
    
    // Show next steps
    if (summary.completed > 0) {
      console.log('\n🚀 Next Steps:');
      console.log(`1. Review generated pages in: ${CONFIG.OUTPUT_DIR}`);
      console.log(`2. Update sitemap to include new URLs`);
      console.log(`3. Test pages locally: npm run dev`);
      console.log(`4. Deploy and monitor SEO performance`);
      console.log(`\n📁 Generated Files:`);
      console.log(`   • ${summary.completed} page directories in ${CONFIG.OUTPUT_DIR}`);
      if (csvFilename) {
        console.log(`   • ${csvFilename} (CSV with all URLs)`);
      }
      console.log(`   • ${reportFilename} (detailed JSON report)`);
    }
    
    if (summary.failed > 0) {
      console.log(`\n⚠️  ${summary.failed} pages failed to generate. Check the report for details.`);
    }
    
    return report;
  }
}

// Main execution function
async function main() {
  try {
    console.log('🚀 Advanced SEO Page Generator Starting...\n');
    
    // Debug environment variables
    console.log('🔧 Environment Check:');
    console.log(`   OpenAI: ${CONFIG.OPENAI_API_KEY ? '✅ Loaded' : '❌ Missing'}`);
    console.log(`   Unsplash: ${CONFIG.UNSPLASH_ACCESS_KEY ? '✅ Loaded' : '❌ Missing'}`);
    console.log(`   Pexels: ${CONFIG.PEXELS_API_KEY ? '✅ Loaded' : '❌ Missing'}`);
    console.log(`   Use AI: ${CONFIG.USE_AI_CONTENT ? '✅ Enabled' : '❌ Disabled'}`);
    console.log('');
    
    // Check for image API keys
    if (!CONFIG.UNSPLASH_ACCESS_KEY && !CONFIG.PEXELS_API_KEY) {
      console.warn('⚠️  No image API keys found. Images will use fallback placeholders.');
      console.log('💡 Get free keys from:');
      console.log('   • Unsplash: https://unsplash.com/developers');
      console.log('   • Pexels: https://www.pexels.com/api/\n');
    }
    
    // Initialize and run generator
    const generator = new SEOPageGenerator();
    await generator.initialize();
    await generator.generateAllPages();
    
    console.log('\n🎉 All SEO pages generated successfully!');
    console.log(`📁 Pages created in: ${CONFIG.OUTPUT_DIR}`);
    console.log(`🌐 Don't forget to update your sitemap and navigation!`);
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { SEOPageGenerator, CONFIG };