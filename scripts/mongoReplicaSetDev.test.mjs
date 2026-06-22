import assert from "node:assert/strict";
import test from "node:test";

import {
  LOCAL_DEV_MONGO_URI,
  MONGO_DEV_MEMBER_HOST,
  MONGO_REPLICA_SET_NAME,
  buildReplicaInitEvalScript,
  buildReplicaStatusEvalScript,
} from "./mongoReplicaSetDev.mjs";

test("LOCAL_DEV_MONGO_URI содержит replicaSet=rs0", () => {
  assert.equal(
    LOCAL_DEV_MONGO_URI,
    "mongodb://127.0.0.1:27017/molhaApteka?replicaSet=rs0",
  );
});

test("buildReplicaInitEvalScript инициализирует rs0 на 127.0.0.1:27017", () => {
  const script = buildReplicaInitEvalScript();

  assert.match(script, /_id:\s*replicaSetName/);
  assert.match(script, /host:\s*desiredHost/);
  assert.match(script, new RegExp(JSON.stringify(MONGO_REPLICA_SET_NAME)));
  assert.match(script, new RegExp(JSON.stringify(MONGO_DEV_MEMBER_HOST)));
});

test("buildReplicaStatusEvalScript проверяет PRIMARY", () => {
  const script = buildReplicaStatusEvalScript();

  assert.match(script, /stateStr === "PRIMARY"/);
  assert.match(script, new RegExp(JSON.stringify(MONGO_REPLICA_SET_NAME)));
});
