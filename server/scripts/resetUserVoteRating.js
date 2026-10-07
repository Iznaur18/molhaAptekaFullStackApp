/**
 * Разовое обнуление рейтинга одного пользователя: удаляет все голоса ЗА него
 * и ставит счётчики `userRatingByVotes` в ноль.
 *
 *   node scripts/resetUserVoteRating.js --userId=<id>                      # dry-run (только отчёт)
 *   node scripts/resetUserVoteRating.js --userId=<id> --expectVotes=5 --apply
 *
 * Зачем скрипт, а не миграция. Миграция из `scripts/migrations` выполняется на
 * каждом окружении и привязана к конкретному пользователю прода; это же —
 * ручная операция по запросу, с обязательным указанием, кого обнуляем.
 *
 * Безопасность:
 *   - Без `--apply` ничего не пишет.
 *   - `--expectVotes=N` — предохранитель: если голосов сейчас не N (кто-то успел
 *     проголосовать после dry-run), скрипт останавливается.
 *   - Перед записью складывает прежние счётчики и все голоса в JSON
 *     (`--backupDir`, по умолчанию рядом со скриптом) — для отката.
 *   - Голоса и счётчики меняются в одной транзакции: рейтинг не останется
 *     числом без голосов или голосами без числа.
 *   - Чужие голоса, поставленные САМИМ пользователем другим людям, не трогает.
 */
import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import mongoose from "mongoose";

import { UserModel, UserVoteRatingModel } from "../models/index.js";
import { runInTransaction, withMongoSession } from "../utils/mongoTransaction.js";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {string} name
 * @returns {string | null}
 */
function readArg(name) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix));
  return raw ? raw.slice(prefix.length).trim() : null;
}

const isApply = process.argv.includes("--apply");
const userId = readArg("userId");
const expectVotesRaw = readArg("expectVotes");
const backupDir = readArg("backupDir") ?? SCRIPT_DIR;

async function main() {
  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new Error("Укажите --userId=<id пользователя>");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI не задан в .env");
  }
  const expectVotes = expectVotesRaw == null ? null : Number(expectVotesRaw);
  if (expectVotes != null && !Number.isInteger(expectVotes)) {
    throw new Error("--expectVotes должен быть целым числом");
  }
  if (isApply && expectVotes == null) {
    throw new Error("Для --apply обязателен --expectVotes=N из отчёта dry-run");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`База: ${mongoose.connection.db.databaseName}`);

  const user = await UserModel.findById(userId)
    .select("userName userFullName userRatingByVotes")
    .lean();
  if (!user) {
    throw new Error(`Пользователь ${userId} не найден`);
  }

  const votes = await UserVoteRatingModel.find({ userVoteTarget: user._id }).lean();
  const votesSum = votes.reduce(
    (sum, vote) => sum + Number(vote.userVoteValue || 0),
    0,
  );

  console.log(`Пользователь: ${user.userName} / ${user.userFullName} (${userId})`);
  console.log(
    `Счётчики сейчас: голосов ${user.userRatingByVotes?.countVotes ?? 0}, сумма ${user.userRatingByVotes?.totalRating ?? 0}`,
  );
  console.log(`Записей о голосах: ${votes.length}, сумма ${votesSum}`);

  if (expectVotes != null && votes.length !== expectVotes) {
    throw new Error(
      `Ожидалось голосов: ${expectVotes}, сейчас: ${votes.length}. Ничего не изменено.`,
    );
  }

  if (!isApply) {
    console.log("dry-run: ничего не изменено. Для записи добавьте --apply.");
    return;
  }

  await mkdir(backupDir, { recursive: true });
  const backupPath = path.join(
    backupDir,
    `resetUserVoteRating.backup-${userId}-${Date.now()}.json`,
  );
  await writeFile(
    backupPath,
    JSON.stringify(
      { userId, userRatingByVotes: user.userRatingByVotes ?? null, votes },
      null,
      2,
    ),
  );
  console.log(`Бэкап: ${backupPath}`);

  await runInTransaction(async (session) => {
    const deleted = await UserVoteRatingModel.deleteMany(
      { userVoteTarget: user._id },
      withMongoSession({}, session),
    );
    if (deleted.deletedCount !== votes.length) {
      throw new Error(
        `Удалилось ${deleted.deletedCount} голосов вместо ${votes.length} — откат.`,
      );
    }
    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          "userRatingByVotes.countVotes": 0,
          "userRatingByVotes.totalRating": 0,
        },
      },
      withMongoSession({}, session),
    );
  });

  const after = await UserModel.findById(userId).select("userRatingByVotes").lean();
  const votesLeft = await UserVoteRatingModel.countDocuments({
    userVoteTarget: user._id,
  });
  console.log(
    `Готово. Счётчики: голосов ${after?.userRatingByVotes?.countVotes}, сумма ${after?.userRatingByVotes?.totalRating}; записей о голосах осталось: ${votesLeft}`,
  );
}

try {
  await main();
} catch (error) {
  console.error(`ОШИБКА: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
