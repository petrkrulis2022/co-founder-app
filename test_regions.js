const { Client } = require('pg');
const regions = [
  'aws-0-eu-west-1',
  'aws-0-eu-west-2', 
  'aws-0-eu-west-3',
  'aws-0-eu-central-1',
  'aws-0-eu-north-1',
  'aws-0-us-east-1',
  'aws-0-us-west-1',
  'aws-0-ap-southeast-1',
];
async function tryRegion(region) {
  const host = region + '.pooler.supabase.com';
  const c = new Client({
    host,
    port: 5432,
    user: 'postgres.swxhhurdvhtcytinbsth',
    password: 'Slothpeter2025+-',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000
  });
  try {
    await c.connect();
    console.log('SUCCESS:', host);
    await c.end();
  } catch(e) {
    const msg = e.message.split('\n')[0];
    console.log(host, '->', msg);
  }
}
(async () => { await Promise.all(regions.map(tryRegion)); console.log('Done'); })();
