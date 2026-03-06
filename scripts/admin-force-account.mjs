import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function argValue(flag, fallback = '') {
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

function requireEnv() {
  const missing = [];
  if (!SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (missing.length > 0) {
    throw new Error(`missing env: ${missing.join(', ')}`);
  }
}

function deriveLegacyKakaoId(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return 9000000000 + Math.abs(hash);
}

async function findAuthUserByEmail(adminClient, email) {
  let page = 1;
  const perPage = 200;

  while (page <= 20) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) throw error;

    const found = (data?.users || []).find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
    if (found) return found;

    if (!data?.users || data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

async function ensurePublicAdminRow(adminClient, authUser, email) {
  const nickname = email.split('@')[0] || 'admin';
  const payload = {
    id: authUser.id,
    kakao_id: deriveLegacyKakaoId(authUser.id),
    email,
    name: authUser.user_metadata?.name || nickname,
    nickname: authUser.user_metadata?.nickname || nickname,
    is_admin: true,
    auth_provider: ['kakao', 'naver', 'google', 'mcp'].includes(authUser.app_metadata?.provider)
      ? authUser.app_metadata?.provider
      : 'mcp',
    profile_image_url: authUser.user_metadata?.avatar_url || null,
    last_login_at: new Date().toISOString(),
  };
  const working = { ...payload };

  while (true) {
    const { error } = await adminClient.from('users').upsert(working, { onConflict: 'id' });
    if (!error) return;

    const missingColumnMatch = error.message.match(/Could not find the '([^']+)' column/);
    if (missingColumnMatch) {
      const missingCol = missingColumnMatch[1];
      if (Object.prototype.hasOwnProperty.call(working, missingCol)) {
        delete working[missingCol];
        continue;
      }
    }

    throw error;
  }
}

async function verifyPassword(url, anonKey, email, password) {
  const anonClient = createClient(url, anonKey);
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return !!data?.session?.access_token;
}

async function main() {
  requireEnv();

  const email = argValue('--email', 'piwpiw@naver.com').trim().toLowerCase();
  const requestedPassword = argValue('--password', 'admin');

  if (!email || !requestedPassword) {
    throw new Error('email/password is required');
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authUser = await findAuthUserByEmail(adminClient, email);
  if (!authUser) {
    throw new Error(`auth user not found for email: ${email}`);
  }

  let effectivePassword = requestedPassword;
  let usedCompatAlias = false;

  const updatePassword = async (password) =>
    adminClient.auth.admin.updateUserById(authUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(authUser.user_metadata || {}),
        force_admin_email: email,
      },
    });

  let { error: updateError } = await updatePassword(effectivePassword);
  if (updateError && /at least 6 characters/i.test(updateError.message) && requestedPassword === 'admin') {
    effectivePassword = 'admin1';
    usedCompatAlias = true;
    ({ error: updateError } = await updatePassword(effectivePassword));
  }
  if (updateError) throw updateError;

  await ensurePublicAdminRow(adminClient, authUser, email);

  const verified = await verifyPassword(SUPABASE_URL, SUPABASE_ANON_KEY, email, effectivePassword);
  if (!verified) {
    throw new Error('password update verification failed');
  }

  console.log(
    `[admin-force] SUCCESS email=${email} requested_password=${requestedPassword} effective_password=${effectivePassword} compat_alias=${usedCompatAlias} public_admin=true login_verified=true`
  );
}

main().catch((error) => {
  console.error(`[admin-force] FAIL ${error.message}`);
  process.exit(1);
});
