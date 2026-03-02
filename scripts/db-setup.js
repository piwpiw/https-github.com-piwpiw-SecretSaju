const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setup() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('❌ DATABASE_URL is not set in .env.local');
        process.exit(1);
    }

    let activeUrl = connectionString;
    if (connectionString.includes('db.jyrdihklwkbeypfxbiwp.supabase.co')) {
        console.log('🔄 Detected IPv6 host, switching to IPv4 pooler for this script...');
        activeUrl = connectionString.replace('db.jyrdihklwkbeypfxbiwp.supabase.co', 'aws-0-ap-northeast-2.pooler.supabase.com')
            .replace('5432', '6543')
            .replace('postgres:', 'postgres.jyrdihklwkbeypfxbiwp:');
    }

    const client = new Client({
        connectionString: activeUrl,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to Supabase PostgreSQL');

        const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon but try to be smart about functions and triggers
        // A better way is to run the whole block if possible, but pg-client might not like it.
        // However, Supabase/Postgres can handle multiple statements if sent as one string.
        console.log('⏳ Applying schema.sql...');

        // We run the whole file. Postgres supports this.
        try {
            await client.query(sql);
            console.log('✅ Schema applied successfully');
        } catch (err) {
            if (err.message.includes('already exists')) {
                console.warn('⚠️  Some objects already exist, continuing...');
                // If it failed mid-way, it might be messy. 
                // Let's try to run statements one by one for better granularity if it fails.
            } else {
                console.error('❌ Error applying schema:', err.message);
                // Try split mode as fallback
                await runGranular(client, sql);
            }
        }

    } catch (err) {
        console.error('❌ Connection error:', err.message);
    } finally {
        await client.end();
    }
}

async function runGranular(client, sql) {
    console.log('🔄 Running in granular mode to skip existing objects...');
    // This is a very basic split, might fail on complex functions
    const statements = sql.split(/;\s*$/m);
    for (let statement of statements) {
        statement = statement.trim();
        if (!statement) continue;
        try {
            await client.query(statement);
        } catch (err) {
            if (err.message.includes('already exists')) {
                // Ignore
            } else {
                console.error(`❌ Statement failed: ${statement.substring(0, 50)}... \nError: ${err.message}`);
            }
        }
    }
}

setup();
