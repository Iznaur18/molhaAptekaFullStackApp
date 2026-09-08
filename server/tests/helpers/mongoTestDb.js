import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

/** @type {MongoMemoryReplSet | null} */
let memoryReplSet = null;

export const connectMongoTestReplSet = async () => {
  memoryReplSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await memoryReplSet.waitUntilRunning();
  const uri = memoryReplSet.getUri();
  await mongoose.connect(
    uri.includes("?") ? `${uri}&retryWrites=false` : `${uri}?retryWrites=false`,
  );

  // Индексы mongoose строит в фоне: `connect()` завершается раньше, чем
  // `createIndexes` доходит до сервера. Тест, который проверяет unique, успевал
  // вставить обе записи до появления индекса и падал через раз — так плавал
  // partial unique в кампаниях личной категории. `init()` — штатный способ
  // дождаться сборки; ждём только те модели, которые набор уже импортировал.
  await Promise.all(
    mongoose.modelNames().map((name) => mongoose.model(name).init()),
  );
};

export const disconnectMongoTestReplSet = async () => {
  await mongoose.disconnect();
  if (memoryReplSet) {
    await memoryReplSet.stop();
    memoryReplSet = null;
  }
};

export const clearMongoCollections = async () => {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
};
