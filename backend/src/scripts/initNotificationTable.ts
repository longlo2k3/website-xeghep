import { loadEnv } from 'payload/node';
import pg from 'pg';

loadEnv();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URI || 'postgresql://cms:cms_dev_password@localhost:5433/cms',
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "notification_settings" (
        "id" serial PRIMARY KEY NOT NULL,
        "telegram_enabled" boolean DEFAULT true,
        "telegram_bot_token" varchar,
        "telegram_chat_id" varchar,
        "email_enabled" boolean DEFAULT true,
        "email_webhook_url" varchar,
        "email_to" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      );

      INSERT INTO "notification_settings" ("id", "telegram_enabled", "email_enabled", "updated_at", "created_at")
      VALUES (1, true, true, now(), now())
      ON CONFLICT ("id") DO NOTHING;
    `);
    console.log('[initNotificationTable] SUCCESS: Bảng notification_settings đã được tạo thành công.');
  } catch (err) {
    console.error('[initNotificationTable] ERROR:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

void run();
