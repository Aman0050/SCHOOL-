const { Client } = require('pg');

const testConn = async (url, name) => {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log(`✅ Success connecting to ${name}`);
    await client.end();
  } catch (err) {
    console.error(`❌ Failed connecting to ${name}:`, err.message);
  }
};

const main = async () => {
  const pgbouncerUrl = "postgresql://postgres.dgfvqtzncztjohxucnkw:aman_qureshi_0@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
  const sessionUrl = "postgresql://postgres.dgfvqtzncztjohxucnkw:aman_qureshi_0@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";
  
  await testConn(pgbouncerUrl, '6543 (transaction pooler)');
  await testConn(sessionUrl, '5432 (session pooler)');
};

main();
