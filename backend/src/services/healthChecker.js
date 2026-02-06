import cron from 'node-cron';
import { pool } from '../utils/db.js';

let cronJob = null;

async function checkApiHealth(api) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(api.test_endpoint, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.ok) {
      await pool.query(
        `UPDATE apis SET health_status = 'healthy', health_check_failures = 0, last_health_check = CURRENT_TIMESTAMP WHERE id = $1`,
        [api.id]
      );
    } else {
      await handleFailure(api);
    }
  } catch {
    clearTimeout(timeout);
    await handleFailure(api);
  }
}

async function handleFailure(api) {
  const threshold = parseInt(process.env.HEALTH_CHECK_THRESHOLD || '3');
  const newFailures = (api.health_check_failures || 0) + 1;
  const status = newFailures >= threshold ? 'unhealthy' : 'degraded';

  await pool.query(
    `UPDATE apis SET health_status = $1, health_check_failures = $2, last_health_check = CURRENT_TIMESTAMP WHERE id = $3`,
    [status, newFailures, api.id]
  );
}

async function runHealthChecks() {
  try {
    const result = await pool.query(
      `SELECT id, test_endpoint, health_check_failures FROM apis WHERE active = true AND test_endpoint IS NOT NULL AND test_endpoint != ''`
    );

    const apis = result.rows;
    if (apis.length === 0) return;

    // Process in batches of 10
    for (let i = 0; i < apis.length; i += 10) {
      const batch = apis.slice(i, i + 10);
      await Promise.all(batch.map(api => checkApiHealth(api)));
    }

    console.log(`✅ Health check completed for ${apis.length} APIs`);
  } catch (error) {
    console.error('Health check error:', error.message);
  }
}

export function startHealthChecks() {
  const schedule = process.env.HEALTH_CHECK_INTERVAL || '0 * * * *';

  if (!cron.validate(schedule)) {
    console.error('Invalid HEALTH_CHECK_INTERVAL cron expression:', schedule);
    return;
  }

  cronJob = cron.schedule(schedule, runHealthChecks);
  console.log(`🏥 Health checks scheduled: ${schedule}`);
}

export function stopHealthChecks() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
  }
}
