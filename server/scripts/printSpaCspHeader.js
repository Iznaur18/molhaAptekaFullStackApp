import "dotenv/config";

import { buildSpaContentSecurityPolicy } from "../utils/buildSpaContentSecurityPolicy.js";

const policy = buildSpaContentSecurityPolicy();

console.log("# Вставь в nginx location / { ... }");
console.log(`add_header Content-Security-Policy "${policy}" always;`);
