import dotenv from 'dotenv';
import { execSync } from 'node:child_process';

dotenv.config({ path: '.env.test', override: true });

if (process.env.NODE_ENV !== 'test') {
  process.env.NODE_ENV = 'test';
}

execSync('npx prisma migrate reset --force', {
  stdio: 'inherit',
});
