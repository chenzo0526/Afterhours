/**
 * Enrich Emails
 * 
 * Takes plumbing_only_leads.csv and enriches it by:
 * - Fetching each website
 * - Extracting emails from mailto: links
 * - Scanning /contact, /contact-us, /about, /services pages for emails
 * - Finding emails via regex patterns
 * 
 * Usage: node enrich_emails.js [input_file]
 */

const axios = require('axios');
const cheerio = require('cheerio');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Default input file
const DEFAULT_INPUT = path.join(__dirname, 'plumbing_only_leads.csv');
const OUTPUT_FILE = path.join(__dirname, 'plumbing_only_leads.csv');

// Email regex pattern (common email formats)
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Common email patterns to exclude (info, contact, hello, etc. - we keep these but note them)
const COMMON_EMAILS = [
  'info@', 'contact@', 'hello@', 'support@', 'sales@', 'marketing@',
  'admin@', 'noreply@', 'no-reply@', 'postmaster@', 'webmaster@'
];

/**
 * Extract all emails from HTML content
 */
function extractEmails(html, currentUrl) {
  const emails = new Set();
  const $ = cheerio.load(html);
  
  // 1. Extract from mailto: links
  $('a[href^="mailto:"]').each((i, el) => {
    const href = $(el).attr('href');
    if (href) {
      const email = href.replace('mailto:', '').split('?')[0].trim().toLowerCase();
      if (email && email.match(EMAIL_REGEX)) {
        emails.add(email);
      }
    }
  });
  
  // 2. Extract from text content (body text, paragraphs, spans, etc.)
  const bodyText = $('body').text();
  const textMatches = bodyText.match(EMAIL_REGEX);
  if (textMatches) {
    textMatches.forEach(email => {
      const cleanEmail = email.trim().toLowerCase();
      // Filter out obvious non-email patterns
      if (cleanEmail && !cleanEmail.includes('example') && !cleanEmail.includes('test')) {
        emails.add(cleanEmail);
      }
    });
  }
  
  // 3. Extract from meta tags
  $('meta[content*="@"]').each((i, el) => {
    const content = $(el).attr('content');
    if (content) {
      const matches = content.match(EMAIL_REGEX);
      if (matches) {
        matches.forEach(email => emails.add(email.trim().toLowerCase()));
      }
    }
  });
  
  // 4. Extract from script tags that might contain email data
  $('script').each((i, el) => {
    const scriptText = $(el).html();
    if (scriptText) {
      const matches = scriptText.match(EMAIL_REGEX);
      if (matches) {
        matches.forEach(email => {
          const cleanEmail = email.trim().toLowerCase();
          if (cleanEmail && !cleanEmail.includes('example')) {
            emails.add(cleanEmail);
          }
        });
      }
    }
  });
  
  return Array.from(emails);
}

/**
 * Fetch a URL and extract emails
 */
async function fetchAndExtractEmails(url, options = {}) {
  const { timeout = 10000, followRedirects = true } = options;
  
  try {
    const response = await axios.get(url, {
      timeout,
      maxRedirects: followRedirects ? 5 : 0,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      validateStatus: (status) => status < 500 // Don't throw on 404, etc.
    });
    
    if (response.status >= 200 && response.status < 300) {
      return extractEmails(response.data, url);
    }
    
    return [];
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error(`  ⚠️  Connection error for ${url}`);
    } else if (error.response && error.response.status === 404) {
      console.error(`  ⚠️  404 Not Found: ${url}`);
    } else {
      console.error(`  ⚠️  Error fetching ${url}: ${error.message}`);
    }
    return [];
  }
}

/**
 * Build potential URLs to check for contact info
 */
function getPotentialUrls(baseUrl) {
  try {
    const base = new URL(baseUrl);
    const urls = [baseUrl]; // Start with homepage
    
    // Common contact page paths
    const paths = [
      '/contact',
      '/contact-us',
      '/contactus',
      '/contact.html',
      '/contactus.html',
      '/about',
      '/about-us',
      '/aboutus',
      '/services',
      '/services.html',
      '/get-in-touch',
      '/reach-us'
    ];
    
    paths.forEach(path => {
      try {
        urls.push(new URL(path, base).href);
      } catch (e) {
        // Skip invalid URLs
      }
    });
    
    return urls;
  } catch (error) {
    return [baseUrl]; // If URL parsing fails, just return original
  }
}

/**
 * Categorize email (primary vs backup)
 */
function categorizeEmails(emails) {
  const primary = [];
  const backup = [];
  
  emails.forEach(email => {
    // Check if it's a common generic email
    const isGeneric = COMMON_EMAILS.some(prefix => email.startsWith(prefix));
    
    // Primary emails: specific ones (not generic) or info@ (most common)
    if (email.startsWith('info@') || (!isGeneric && email.match(/^[a-z]+@/))) {
      primary.push(email);
    } else {
      backup.push(email);
    }
  });
  
  // Sort primary emails (info@ first, then alphabetically)
  primary.sort((a, b) => {
    if (a.startsWith('info@')) return -1;
    if (b.startsWith('info@')) return 1;
    return a.localeCompare(b);
  });
  
  // Sort backup emails
  backup.sort();
  
  return {
    primary: primary[0] || '', // Take first primary
    backup: backup[0] || '' // Take first backup
  };
}

/**
 * Enrich a single business record with emails
 */
async function enrichBusiness(business) {
  console.log(`Enriching: ${business.Company}`);
  
  if (!business.Website) {
    console.log('  ⚠️  No website provided');
    return business;
  }
  
  // Get all potential URLs to check
  const urls = getPotentialUrls(business.Website);
  console.log(`  🔍 Checking ${urls.length} URL(s)...`);
  
  const allEmails = new Set();
  
  // Check each URL
  for (const url of urls) {
    console.log(`  📄 Fetching: ${url}`);
    const emails = await fetchAndExtractEmails(url);
    
    if (emails.length > 0) {
      console.log(`  ✅ Found ${emails.length} email(s): ${emails.join(', ')}`);
      emails.forEach(email => allEmails.add(email));
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // Categorize emails
  const categorized = categorizeEmails(Array.from(allEmails));
  
  // Update business record
  const enriched = {
    ...business,
    PrimaryEmail: categorized.primary || business.PrimaryEmail || '',
    BackupEmail: categorized.backup || business.BackupEmail || ''
  };
  
  if (categorized.primary) {
    console.log(`  ✅ Enriched with PrimaryEmail: ${categorized.primary}`);
  }
  if (categorized.backup) {
    console.log(`  ✅ Enriched with BackupEmail: ${categorized.backup}`);
  }
  
  if (allEmails.size === 0) {
    console.log(`  ⚠️  No emails found`);
  }
  
  console.log('');
  
  return enriched;
}

/**
 * Read CSV file
 */
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const records = [];
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    parser.on('readable', function() {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });
    
    parser.on('error', function(err) {
      reject(err);
    });
    
    parser.on('end', function() {
      resolve(records);
    });
    
    fs.createReadStream(filePath)
      .pipe(parser);
  });
}

/**
 * Write CSV file
 */
async function writeCSV(records, filePath) {
  const csvWriterInstance = csvWriter({
    path: filePath,
    header: [
      { id: 'Company', title: 'Company' },
      { id: 'Website', title: 'Website' },
      { id: 'City', title: 'City' },
      { id: 'State', title: 'State' },
      { id: 'PrimaryEmail', title: 'PrimaryEmail' },
      { id: 'BackupEmail', title: 'BackupEmail' },
      { id: 'Phone', title: 'Phone' },
      { id: 'Notes', title: 'Notes' },
      { id: 'SourceURL', title: 'SourceURL' }
    ]
  });
  
  await csvWriterInstance.writeRecords(records);
}

/**
 * Main enrichment function
 */
async function enrichEmails(inputFile = DEFAULT_INPUT) {
  console.log('=== Afterhours Email Enrichment ===\n');
  console.log(`Input file: ${inputFile}\n`);
  
  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Error: Input file not found: ${inputFile}`);
    console.error('Please run generate_plumbing_leads.js first to create the CSV file.\n');
    process.exit(1);
  }
  
  // Read CSV
  console.log('Reading CSV...');
  let businesses;
  try {
    businesses = await readCSV(inputFile);
    console.log(`✅ Loaded ${businesses.length} businesses\n`);
  } catch (error) {
    console.error(`❌ Error reading CSV: ${error.message}`);
    process.exit(1);
  }
  
  // Filter businesses that need enrichment (no PrimaryEmail)
  const toEnrich = businesses.filter(b => !b.PrimaryEmail);
  console.log(`Businesses needing enrichment: ${toEnrich.length}\n`);
  
  if (toEnrich.length === 0) {
    console.log('✅ All businesses already have emails!\n');
    return;
  }
  
  // Enrich each business
  const enriched = [];
  for (const business of businesses) {
    if (business.PrimaryEmail) {
      // Already has email, skip
      enriched.push(business);
    } else {
      // Needs enrichment
      const enrichedBusiness = await enrichBusiness(business);
      enriched.push(enrichedBusiness);
    }
  }
  
  // Write back to CSV
  console.log('Writing enriched data to CSV...');
  await writeCSV(enriched, OUTPUT_FILE);
  
  // Summary
  const withPrimary = enriched.filter(b => b.PrimaryEmail).length;
  const withBackup = enriched.filter(b => b.BackupEmail).length;
  
  console.log('\n✅ Enrichment complete!\n');
  console.log('Summary:');
  console.log(`  Total businesses: ${enriched.length}`);
  console.log(`  With PrimaryEmail: ${withPrimary}`);
  console.log(`  With BackupEmail: ${withBackup}`);
  console.log(`  Without email: ${enriched.length - withPrimary}\n`);
  console.log(`📄 Output: ${OUTPUT_FILE}\n`);
}

// Run if executed directly
if (require.main === module) {
  const inputFile = process.argv[2] || DEFAULT_INPUT;
  enrichEmails(inputFile).catch(error => {
    console.error('Error enriching emails:', error);
    process.exit(1);
  });
}

module.exports = { enrichEmails, enrichBusiness, extractEmails };
