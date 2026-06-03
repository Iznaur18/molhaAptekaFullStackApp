import 'dotenv/config';

import { assertProductionEnv } from '../utils/assertProductionEnv.js';

process.env.NODE_ENV = process.env.NODE_ENV ?? 'production';

const { ok, errors, warnings } = assertProductionEnv();

for (const message of warnings) {
    console.warn(`⚠ ${message}`);
}

if (errors.length > 0) {
    for (const message of errors) {
        console.error(`✗ ${message}`);
    }
    console.error('\nИсправьте server/.env и повторите: npm run validate:prod');
    process.exit(1);
}

console.log('✓ Production env OK');
if (warnings.length > 0) {
    console.log(`  (${warnings.length} предупреждений — см. выше)`);
}
