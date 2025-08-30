// Script to create a user with proper password hash
import crypto from 'crypto';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.randomBytes(16).toString('hex');
  const data = encoder.encode(password + salt);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${salt}:${hashHex}`;
}

// Generate hash for admin123
const password = 'admin123';
console.log('Generating hash for password:', password);
hashPassword(password).then(hash => {
  console.log('Hash:', hash);
  console.log('\nSQL to insert user:');
  console.log(`INSERT OR IGNORE INTO users (id, username, password_hash, email, name) VALUES`);
  console.log(`  (1, 'admin', '${hash}', 'admin@salon.local', 'システム管理者');`);
});