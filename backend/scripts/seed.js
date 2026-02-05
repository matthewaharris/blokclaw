import { pool } from '../src/utils/db.js';

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Create sample providers
    const providers = [
      { email: 'hello@openweather.com', name: 'OpenWeather', website: 'https://openweathermap.org' },
      { email: 'api@stripe.com', name: 'Stripe', website: 'https://stripe.com' },
      { email: 'dev@twilio.com', name: 'Twilio', website: 'https://twilio.com' }
    ];

    const providerIds = [];
    for (const p of providers) {
      const result = await pool.query(
        'INSERT INTO providers (email, name, website, verified) VALUES ($1, $2, $3, true) RETURNING id',
        [p.email, p.name, p.website]
      );
      providerIds.push(result.rows[0].id);
      console.log(`✓ Created provider: ${p.name}`);
    }

    // Create sample APIs
    const apis = [
      {
        provider_id: providerIds[0],
        name: 'OpenWeather API',
        slug: 'openweather-api',
        short_description: 'Current weather data, forecasts, and historical weather information for any location',
        long_description: 'Access current weather data for any location including over 200,000 cities. Get minute forecast for 1 hour, hourly forecast for 48 hours, daily forecast for 7 days and more.',
        category: 'weather',
        contract_type: 'openapi',
        contract_url: 'https://openweathermap.org/api',
        auth_type: 'apikey',
        auth_instructions: 'Sign up for a free API key at openweathermap.org',
        test_endpoint: 'https://api.openweathermap.org/data/2.5/weather',
        pricing: 'freemium',
        tags: ['weather', 'forecast', 'climate', 'data'],
        verified: true
      },
      {
        provider_id: providerIds[1],
        name: 'Stripe Payments API',
        slug: 'stripe-payments-api',
        short_description: 'Process payments, manage subscriptions, and handle financial transactions',
        long_description: 'A complete payments platform with APIs to accept payments, send payouts, and manage businesses online.',
        category: 'payments',
        contract_type: 'openapi',
        contract_url: 'https://stripe.com/docs/api',
        auth_type: 'bearer',
        auth_instructions: 'Use your Stripe secret key as a Bearer token',
        test_endpoint: 'https://api.stripe.com/v1/charges',
        pricing: 'paid',
        tags: ['payments', 'billing', 'subscriptions', 'finance'],
        verified: true
      },
      {
        provider_id: providerIds[2],
        name: 'Twilio SMS API',
        slug: 'twilio-sms-api',
        short_description: 'Send and receive SMS messages programmatically worldwide',
        long_description: 'Deliver SMS messages in 180+ countries with carrier-grade reliability and scale.',
        category: 'communication',
        contract_type: 'openapi',
        contract_url: 'https://www.twilio.com/docs/sms/api',
        auth_type: 'apikey',
        auth_instructions: 'Use your Account SID and Auth Token for HTTP Basic Auth',
        test_endpoint: 'https://api.twilio.com/2010-04-01/Accounts',
        pricing: 'paid',
        tags: ['sms', 'messaging', 'communication', 'notifications'],
        verified: true
      }
    ];

    for (const api of apis) {
      await pool.query(
        `INSERT INTO apis (
          provider_id, name, slug, short_description, long_description,
          category, contract_type, contract_url, auth_type, auth_instructions,
          test_endpoint, pricing, tags, verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          api.provider_id, api.name, api.slug, api.short_description,
          api.long_description, api.category, api.contract_type,
          api.contract_url, api.auth_type, api.auth_instructions,
          api.test_endpoint, api.pricing, api.tags, api.verified
        ]
      );
      console.log(`✓ Created API: ${api.name}`);
    }

    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
