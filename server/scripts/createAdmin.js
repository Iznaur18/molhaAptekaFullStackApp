import 'dotenv/config';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import { DEFAULT_AVATAR_URL, DEFAULT_BACKGROUND_URL } from '../constants/constants.js';
import { UserModel } from '../models/index.js';
import {
  assertUserNameFormat,
  normalizeUserNameInput,
  USER_NAME_MIN_LENGTH,
} from '../validations/user/userNameRules.js';

const ADMIN_ROLE = 'admin';
const PASSWORD_MIN_LENGTH = 6;
const BCRYPT_ROUNDS = 10;

const USAGE = `Использование:
  npm run create-admin -- <email> <password> [userName] [--reset-password]

Пример:
  npm run create-admin -- admin@molha.ru MyPassword123 adminboss

Если пользователь с email уже есть — роль станет admin (пароль не меняется).
  --reset-password — задать новый пароль существующему пользователю.`;

function parseArgs(argv) {
  const resetPassword = argv.includes('--reset-password');
  const positional = argv.filter((arg) => !arg.startsWith('--'));
  const [email, password, userName] = positional;
  return { email, password, userName, resetPassword };
}

function normalizeEmail(raw) {
  const email = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (!email.includes('@') || email.startsWith('@') || email.endsWith('@')) {
    throw new Error('Некорректный email');
  }
  return email;
}

function assertPassword(raw) {
  const password = String(raw ?? '');
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`Пароль не короче ${PASSWORD_MIN_LENGTH} символов`);
  }
  return password;
}

function buildUserNameFromEmail(email) {
  const local = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  if (local.length >= USER_NAME_MIN_LENGTH) {
    try {
      assertUserNameFormat(local);
      return local;
    } catch {
      // fall through
    }
  }
  const suffix = Date.now().toString(36).slice(-6);
  const generated = `admin${suffix}`;
  assertUserNameFormat(generated);
  return generated;
}

async function resolveUniqueUserName(email, userNameArg) {
  const normalized = userNameArg
    ? normalizeUserNameInput(userNameArg)
    : buildUserNameFromEmail(email);
  if (!normalized) {
    throw new Error('Некорректный никнейм');
  }
  assertUserNameFormat(normalized);

  let candidate = normalized;
  let attempt = 0;
  while (attempt < 20) {
    const taken = await UserModel.exists({ userName: candidate });
    if (!taken) return candidate;
    attempt += 1;
    candidate = `${normalized.slice(0, USER_NAME_MIN_LENGTH)}${attempt}`;
    assertUserNameFormat(candidate);
  }
  throw new Error('Не удалось подобрать свободный никнейм');
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  return bcrypt.hash(password, salt);
}

async function createAdminUser({ email, password, userName }) {
  const finalUserName = await resolveUniqueUserName(email, userName);
  const passwordHash = await hashPassword(password);

  const user = await UserModel.create({
    email,
    passwordHash,
    userName: finalUserName,
    userRole: ADMIN_ROLE,
    userAvatarUrl: DEFAULT_AVATAR_URL,
    userBackgroundUrl: DEFAULT_BACKGROUND_URL,
    isActiveUser: true,
    isBlockedUser: false,
  });

  return { user, created: true, passwordUpdated: true };
}

async function promoteExistingUser(user, { password, resetPassword }) {
  const update = { userRole: ADMIN_ROLE };

  if (resetPassword) {
    update.passwordHash = await hashPassword(password);
  }

  const updated = await UserModel.findByIdAndUpdate(user._id, update, {
    returnDocument: 'after',
    runValidators: true,
  }).select('email userName userRole');

  if (!updated) {
    throw new Error('Не удалось обновить пользователя');
  }

  return {
    user: updated,
    created: false,
    passwordUpdated: resetPassword,
  };
}

async function main() {
  const { email: emailArg, password: passwordArg, userName, resetPassword } =
    parseArgs(process.argv.slice(2));

  if (!emailArg || !passwordArg) {
    console.error(USAGE);
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI не задан в server/.env');
    process.exit(1);
  }

  const email = normalizeEmail(emailArg);
  const password = assertPassword(passwordArg);

  await mongoose.connect(process.env.MONGO_URI);

  try {
    const existing = await UserModel.findOne({ email }).select(
      '+passwordHash email userName userRole',
    );

    const result = existing
      ? await promoteExistingUser(existing, { password, resetPassword })
      : await createAdminUser({ email, password, userName });

    const { user, created, passwordUpdated } = result;

    console.log(created ? 'Создан администратор:' : 'Пользователь повышен до admin:');
    console.log(`  email:    ${user.email}`);
    console.log(`  userName: ${user.userName}`);
    console.log(`  userRole: ${user.userRole}`);
    if (!created && !passwordUpdated) {
      console.log('  пароль:   без изменений (добавьте --reset-password, чтобы сменить)');
    } else {
      console.log('  пароль:   установлен из аргумента команды');
    }
    console.log('\nВойдите на сайте: Войти → email и пароль → «Мой профиль» → «Все заказы».');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
