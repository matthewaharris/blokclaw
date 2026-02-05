import { pool } from '../src/utils/db.js';

const providersData = [
  { email: 'hello@openweather.com', name: 'OpenWeather', website: 'https://openweathermap.org' },
  { email: 'api@stripe.com', name: 'Stripe', website: 'https://stripe.com' },
  { email: 'dev@twilio.com', name: 'Twilio', website: 'https://twilio.com' },
  { email: 'api@github.com', name: 'GitHub', website: 'https://github.com' },
  { email: 'support@google.com', name: 'Google', website: 'https://developers.google.com' },
  { email: 'api@openai.com', name: 'OpenAI', website: 'https://openai.com' },
  { email: 'support@anthropic.com', name: 'Anthropic', website: 'https://anthropic.com' },
  { email: 'info@newsapi.org', name: 'NewsAPI', website: 'https://newsapi.org' },
  { email: 'api@giphy.com', name: 'Giphy', website: 'https://giphy.com' },
  { email: 'dev@sendgrid.com', name: 'SendGrid', website: 'https://sendgrid.com' },
  { email: 'api@slack.com', name: 'Slack', website: 'https://slack.com' },
  { email: 'api@discord.com', name: 'Discord', website: 'https://discord.com' },
  { email: 'api@spotify.com', name: 'Spotify', website: 'https://spotify.com' },
  { email: 'api@youtube.com', name: 'YouTube', website: 'https://youtube.com' },
  { email: 'api@reddit.com', name: 'Reddit', website: 'https://reddit.com' },
  { email: 'api@nasa.gov', name: 'NASA', website: 'https://api.nasa.gov' }
];

const apisData = [
  // Weather & Maps
  {
    provider_email: 'hello@openweather.com',
    name: 'OpenWeather API',
    slug: 'openweather-api',
    short_description: 'Current weather data, forecasts, and historical weather information for any location',
    long_description: 'Access current weather data for any location including over 200,000 cities. Get minute forecast for 1 hour, hourly forecast for 48 hours, daily forecast for 7 days and more.',
    category: 'weather',
    contract_url: 'https://openweathermap.org/api',
    auth_type: 'apikey',
    auth_instructions: 'Sign up for a free API key at openweathermap.org',
    test_endpoint: 'https://api.openweathermap.org/data/2.5/weather',
    pricing: 'freemium',
    tags: ['weather', 'forecast', 'climate', 'data']
  },
  {
    provider_email: 'support@google.com',
    name: 'Google Maps API',
    slug: 'google-maps-api',
    short_description: 'Maps, geocoding, directions, places, and location services',
    long_description: 'Comprehensive mapping platform with geocoding, reverse geocoding, directions, distance matrix, places search, and more.',
    category: 'maps',
    contract_url: 'https://developers.google.com/maps/documentation',
    auth_type: 'apikey',
    auth_instructions: 'Create a project in Google Cloud Console and enable Maps APIs',
    test_endpoint: 'https://maps.googleapis.com/maps/api/geocode/json',
    pricing: 'freemium',
    tags: ['maps', 'geocoding', 'location', 'directions', 'places']
  },
  
  // AI & ML
  {
    provider_email: 'api@openai.com',
    name: 'OpenAI API',
    slug: 'openai-api',
    short_description: 'GPT models, embeddings, image generation, and more AI capabilities',
    long_description: 'Access powerful AI models including GPT-4, DALL-E, Whisper for text generation, image creation, speech-to-text, and embeddings.',
    category: 'ai',
    contract_url: 'https://platform.openai.com/docs/api-reference',
    auth_type: 'bearer',
    auth_instructions: 'Generate an API key from your OpenAI account',
    test_endpoint: 'https://api.openai.com/v1/models',
    pricing: 'paid',
    tags: ['ai', 'ml', 'gpt', 'embeddings', 'image-generation']
  },
  {
    provider_email: 'support@anthropic.com',
    name: 'Claude API',
    slug: 'claude-api',
    short_description: 'Anthropic Claude AI models for conversation and analysis',
    long_description: 'Access Claude AI models for advanced natural language understanding, conversation, and analysis tasks.',
    category: 'ai',
    contract_url: 'https://docs.anthropic.com/claude/reference',
    auth_type: 'apikey',
    auth_instructions: 'Sign up for Anthropic API access',
    test_endpoint: 'https://api.anthropic.com/v1/messages',
    pricing: 'paid',
    tags: ['ai', 'ml', 'claude', 'conversation', 'nlp']
  },
  
  // Communication
  {
    provider_email: 'dev@twilio.com',
    name: 'Twilio SMS API',
    slug: 'twilio-sms-api',
    short_description: 'Send and receive SMS messages programmatically worldwide',
    long_description: 'Deliver SMS messages in 180+ countries with carrier-grade reliability and scale.',
    category: 'communication',
    contract_url: 'https://www.twilio.com/docs/sms/api',
    auth_type: 'apikey',
    auth_instructions: 'Use your Account SID and Auth Token for HTTP Basic Auth',
    test_endpoint: 'https://api.twilio.com/2010-04-01/Accounts',
    pricing: 'paid',
    tags: ['sms', 'messaging', 'communication', 'notifications']
  },
  {
    provider_email: 'dev@sendgrid.com',
    name: 'SendGrid Email API',
    slug: 'sendgrid-email-api',
    short_description: 'Reliable email delivery service with tracking and analytics',
    long_description: 'Send transactional and marketing emails at scale with delivery optimization, analytics, and detailed tracking.',
    category: 'communication',
    contract_url: 'https://docs.sendgrid.com/api-reference',
    auth_type: 'bearer',
    auth_instructions: 'Create an API key in your SendGrid dashboard',
    test_endpoint: 'https://api.sendgrid.com/v3/mail/send',
    pricing: 'freemium',
    tags: ['email', 'communication', 'notifications', 'marketing']
  },
  {
    provider_email: 'api@slack.com',
    name: 'Slack API',
    slug: 'slack-api',
    short_description: 'Send messages, manage channels, and automate workflows in Slack',
    long_description: 'Integrate with Slack to send messages, create channels, manage users, and build custom workflows and bots.',
    category: 'communication',
    contract_url: 'https://api.slack.com/web',
    auth_type: 'oauth2',
    auth_instructions: 'Create a Slack app and use OAuth 2.0 for authentication',
    test_endpoint: 'https://slack.com/api/auth.test',
    pricing: 'free',
    tags: ['slack', 'messaging', 'collaboration', 'bots']
  },
  {
    provider_email: 'api@discord.com',
    name: 'Discord API',
    slug: 'discord-api',
    short_description: 'Build bots, manage servers, and interact with Discord',
    long_description: 'Create Discord bots, manage guilds, channels, messages, and build rich integrations with Discord communities.',
    category: 'communication',
    contract_url: 'https://discord.com/developers/docs/intro',
    auth_type: 'bearer',
    auth_instructions: 'Create a Discord application and use bot token',
    test_endpoint: 'https://discord.com/api/v10/users/@me',
    pricing: 'free',
    tags: ['discord', 'bots', 'messaging', 'gaming']
  },
  
  // Payments
  {
    provider_email: 'api@stripe.com',
    name: 'Stripe Payments API',
    slug: 'stripe-payments-api',
    short_description: 'Process payments, manage subscriptions, and handle financial transactions',
    long_description: 'A complete payments platform with APIs to accept payments, send payouts, and manage businesses online.',
    category: 'payments',
    contract_url: 'https://stripe.com/docs/api',
    auth_type: 'bearer',
    auth_instructions: 'Use your Stripe secret key as a Bearer token',
    test_endpoint: 'https://api.stripe.com/v1/charges',
    pricing: 'paid',
    tags: ['payments', 'billing', 'subscriptions', 'finance']
  },
  
  // Developer Tools
  {
    provider_email: 'api@github.com',
    name: 'GitHub REST API',
    slug: 'github-rest-api',
    short_description: 'Manage GitHub repositories, issues, pull requests, and more',
    long_description: 'The GitHub REST API allows you to create integrations, retrieve data, and automate workflows.',
    category: 'developer-tools',
    contract_url: 'https://docs.github.com/en/rest',
    auth_type: 'bearer',
    auth_instructions: 'Generate a personal access token from GitHub settings',
    test_endpoint: 'https://api.github.com/user',
    pricing: 'free',
    tags: ['github', 'git', 'version-control', 'developer']
  },
  
  // News & Data
  {
    provider_email: 'info@newsapi.org',
    name: 'NewsAPI',
    slug: 'newsapi',
    short_description: 'Access headlines and articles from news sources and blogs worldwide',
    long_description: 'Search through millions of articles from over 80,000 news sources and blogs. Get breaking news headlines with live data.',
    category: 'news',
    contract_url: 'https://newsapi.org/docs',
    auth_type: 'apikey',
    auth_instructions: 'Sign up for a free API key at newsapi.org',
    test_endpoint: 'https://newsapi.org/v2/top-headlines',
    pricing: 'freemium',
    tags: ['news', 'articles', 'headlines', 'media']
  },
  {
    provider_email: 'api@nasa.gov',
    name: 'NASA API',
    slug: 'nasa-api',
    short_description: 'Access NASA data including astronomy pictures, Mars rover photos, and more',
    long_description: 'The NASA API provides access to various NASA datasets including Astronomy Picture of the Day, Mars Rover Photos, Earth imagery, and more.',
    category: 'data',
    contract_url: 'https://api.nasa.gov/',
    auth_type: 'apikey',
    auth_instructions: 'Sign up for a free API key at api.nasa.gov',
    test_endpoint: 'https://api.nasa.gov/planetary/apod',
    pricing: 'free',
    tags: ['space', 'astronomy', 'science', 'nasa', 'data']
  },
  
  // Media
  {
    provider_email: 'api@giphy.com',
    name: 'Giphy API',
    slug: 'giphy-api',
    short_description: 'Search and access millions of GIFs and stickers',
    long_description: 'Search, discover, and embed GIFs and stickers from the world\'s largest library of short-form content.',
    category: 'media',
    contract_url: 'https://developers.giphy.com/docs/api',
    auth_type: 'apikey',
    auth_instructions: 'Create an app in the Giphy Developers Dashboard',
    test_endpoint: 'https://api.giphy.com/v1/gifs/trending',
    pricing: 'free',
    tags: ['gifs', 'media', 'images', 'entertainment']
  },
  {
    provider_email: 'api@spotify.com',
    name: 'Spotify Web API',
    slug: 'spotify-web-api',
    short_description: 'Access Spotify music catalog, playlists, and user data',
    long_description: 'Integrate Spotify functionality into your app. Search tracks, albums, artists, manage playlists, and control playback.',
    category: 'media',
    contract_url: 'https://developer.spotify.com/documentation/web-api',
    auth_type: 'oauth2',
    auth_instructions: 'Register your app and use OAuth 2.0 for authentication',
    test_endpoint: 'https://api.spotify.com/v1/browse/new-releases',
    pricing: 'free',
    tags: ['music', 'spotify', 'audio', 'playlists']
  },
  {
    provider_email: 'api@youtube.com',
    name: 'YouTube Data API',
    slug: 'youtube-data-api',
    short_description: 'Access YouTube videos, channels, playlists, and comments',
    long_description: 'Retrieve YouTube content, manage uploads, create playlists, and interact with the YouTube platform programmatically.',
    category: 'media',
    contract_url: 'https://developers.google.com/youtube/v3',
    auth_type: 'apikey',
    auth_instructions: 'Create a project in Google Cloud Console and enable YouTube Data API',
    test_endpoint: 'https://www.googleapis.com/youtube/v3/videos',
    pricing: 'free',
    tags: ['youtube', 'video', 'media', 'streaming']
  },
  
  // Social
  {
    provider_email: 'api@reddit.com',
    name: 'Reddit API',
    slug: 'reddit-api',
    short_description: 'Access Reddit posts, comments, subreddits, and user data',
    long_description: 'Read and submit posts, retrieve subreddit information, manage comments, and build Reddit integrations.',
    category: 'social',
    contract_url: 'https://www.reddit.com/dev/api',
    auth_type: 'oauth2',
    auth_instructions: 'Create a Reddit app and use OAuth 2.0',
    test_endpoint: 'https://oauth.reddit.com/api/v1/me',
    pricing: 'free',
    tags: ['reddit', 'social', 'community', 'discussions']
  }
];

async function seed() {
  try {
    console.log('🌱 Seeding comprehensive API database...\n');

    // Create providers
    const providerMap = {};
    for (const p of providersData) {
      try {
        const result = await pool.query(
          'INSERT INTO providers (email, name, website, verified) VALUES ($1, $2, $3, true) ON CONFLICT (email) DO NOTHING RETURNING id',
          [p.email, p.name, p.website]
        );
        if (result.rows.length > 0) {
          providerMap[p.email] = result.rows[0].id;
          console.log(`✓ Created provider: ${p.name}`);
        } else {
          // Provider exists, get ID
          const existing = await pool.query('SELECT id FROM providers WHERE email = $1', [p.email]);
          providerMap[p.email] = existing.rows[0].id;
          console.log(`  Provider exists: ${p.name}`);
        }
      } catch (err) {
        console.log(`  Provider exists: ${p.name}`);
        const existing = await pool.query('SELECT id FROM providers WHERE email = $1', [p.email]);
        providerMap[p.email] = existing.rows[0].id;
      }
    }

    console.log('\n');

    // Create APIs
    for (const api of apisData) {
      try {
        const providerId = providerMap[api.provider_email];
        await pool.query(
          `INSERT INTO apis (
            provider_id, name, slug, short_description, long_description,
            category, contract_type, contract_url, auth_type, auth_instructions,
            test_endpoint, pricing, tags, verified
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (slug) DO NOTHING`,
          [
            providerId, api.name, api.slug, api.short_description,
            api.long_description, api.category, 'openapi',
            api.contract_url, api.auth_type, api.auth_instructions,
            api.test_endpoint, api.pricing, api.tags, true
          ]
        );
        console.log(`✓ Created API: ${api.name}`);
      } catch (err) {
        console.log(`  API exists: ${api.name}`);
      }
    }

    console.log('\n✅ Comprehensive seeding complete!');
    console.log(`📊 Total: ${providersData.length} providers, ${apisData.length} APIs`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
