import { pool } from '../src/utils/db.js';

async function backfillStats() {
  try {
    console.log('🔄 Backfilling historical stats...\n');

    // Backfill last 30 days with synthetic data for demo purposes
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Count APIs created on or before this date
      const apisResult = await pool.query(
        'SELECT COUNT(*) FROM apis WHERE DATE(created_at) <= $1',
        [dateStr]
      );
      const totalApis = parseInt(apisResult.rows[0].count);

      // Count APIs created exactly on this date
      const newApisResult = await pool.query(
        'SELECT COUNT(*) FROM apis WHERE DATE(created_at) = $1',
        [dateStr]
      );
      const apisRegistered = parseInt(newApisResult.rows[0].count);

      // Count agents that have been seen on or before this date
      const agentsResult = await pool.query(
        'SELECT COUNT(*) FROM agents WHERE DATE(first_seen) <= $1',
        [dateStr]
      );
      const totalAgents = parseInt(agentsResult.rows[0].count);

      // Count agents active on this specific date
      const activeAgentsResult = await pool.query(
        'SELECT COUNT(*) FROM agents WHERE DATE(last_seen) = $1',
        [dateStr]
      );
      const uniqueAgents = parseInt(activeAgentsResult.rows[0].count);

      // Insert daily stats
      await pool.query(
        `INSERT INTO daily_stats (date, apis_registered, unique_agents, total_api_count, total_agent_count)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (date) DO UPDATE SET
           apis_registered = EXCLUDED.apis_registered,
           unique_agents = EXCLUDED.unique_agents,
           total_api_count = EXCLUDED.total_api_count,
           total_agent_count = EXCLUDED.total_agent_count`,
        [dateStr, apisRegistered, uniqueAgents, totalApis, totalAgents]
      );

      console.log(`✓ ${dateStr}: ${apisRegistered} APIs registered, ${uniqueAgents} agents active (Total: ${totalApis} APIs, ${totalAgents} agents)`);
    }

    console.log('\n✅ Historical stats backfilled successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  }
}

backfillStats();
