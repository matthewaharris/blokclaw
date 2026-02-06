import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from '../src/utils/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  try {
    console.log('🔄 Running migrations...');
    
    const migrations = [
      '001_initial_schema.sql',
      '002_agent_tracking.sql',
      '003_stats_tracking.sql',
      '004_tos_and_security.sql',
      '005_features.sql'
    ];
    
    for (const file of migrations) {
      console.log(`  Running ${file}...`);
      const migration = readFileSync(join(__dirname, file), 'utf8');
      await pool.query(migration);
    }
    
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
