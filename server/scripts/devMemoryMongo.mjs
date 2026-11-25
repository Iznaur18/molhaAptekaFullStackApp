import { writeFileSync } from "node:fs";
import { MongoMemoryReplSet } from "mongodb-memory-server";

const uriFile = process.argv[2] || "E:/coding/molhaAptekaFullStackApp/server/.dev-mongo-uri";

const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
await replSet.waitUntilRunning();
const uri = replSet.getUri("molhaApteka");
writeFileSync(uriFile, uri, "utf8");
console.log(`MEMORY_MONGO_READY ${uri}`);

const stop = async () => {
  await replSet.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

await new Promise(() => {});
