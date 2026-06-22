export const MONGO_REPLICA_SET_NAME = "rs0";

export const LOCAL_DEV_MONGO_URI = `mongodb://127.0.0.1:27017/molhaApteka?replicaSet=${MONGO_REPLICA_SET_NAME}`;

export const MONGO_DEV_MEMBER_HOST = "127.0.0.1:27017";

export const MONGO_COMPOSE_SERVICE = "mongo";

/**
 * @param {{ replicaSetName?: string; memberHost?: string }} [options]
 */
export const buildReplicaInitEvalScript = ({
  replicaSetName = MONGO_REPLICA_SET_NAME,
  memberHost = MONGO_DEV_MEMBER_HOST,
} = {}) => `
const desiredHost = ${JSON.stringify(memberHost)};
const replicaSetName = ${JSON.stringify(replicaSetName)};

try {
  const status = rs.status();
  if (status.ok === 1) {
    print("READY");
    quit(0);
  }
} catch (error) {
  const message = String(error);
  if (!message.includes("no replset config") && !message.includes("NotYetInitialized")) {
    print(message);
    quit(1);
  }
}

const result = rs.initiate({
  _id: replicaSetName,
  members: [{ _id: 0, host: desiredHost }],
});

if (result.ok !== 1) {
  printjson(result);
  quit(1);
}

print("INITIATED");
quit(0);
`.trim();

/**
 * @param {{ replicaSetName?: string }} [options]
 */
export const buildReplicaStatusEvalScript = ({
  replicaSetName = MONGO_REPLICA_SET_NAME,
} = {}) => `
const status = rs.status();
if (status.ok !== 1 || status.set !== ${JSON.stringify(replicaSetName)}) {
  printjson(status);
  quit(1);
}
const hasPrimary = status.members.some((member) => member.stateStr === "PRIMARY");
if (!hasPrimary) {
  print("NO_PRIMARY");
  quit(2);
}
print("OK");
quit(0);
`.trim();
