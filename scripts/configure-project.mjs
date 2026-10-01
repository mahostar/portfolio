import fs from 'node:fs';
const file = JSON.parse(fs.readFileSync('package.json', 'utf8'));
file.name = 'iot-ai-portfolio';
file.type = 'module';
file.scripts = { ...file.scripts, lint: 'eslint src scripts tests playwright.config.ts next.config.ts', typecheck: 'tsc --noEmit', 'check:content': 'node scripts/check-content.mjs', prebuild: 'pnpm check:content', 'make-images': 'node scripts/make-images.mjs', test: 'playwright test', 'test:content': 'node --test tests/content.test.mjs', 'test:ui': 'playwright test --ui' };
fs.writeFileSync('package.json', JSON.stringify(file, null, 2) + '\n');
