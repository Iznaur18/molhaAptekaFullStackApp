import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("../../scripts/loboMockServer.mjs", import.meta.url));

/**
 * Поднимает мок DMS ЛОБО на время тестов.
 *
 * Раньше тесты рассчитывали на заглушку, запущенную руками: без неё вся группа
 * падала с «fetch failed», и это выглядело как поломка кода. Шаг статуса берём
 * в секунду — с двадцатью по умолчанию «забрал» наступал через 80 секунд, и
 * тест опроса не мог пройти никогда.
 *
 * @param {{ port?: number; stepSeconds?: number }} [options]
 */
export async function startLoboMock({ port = 3092, stepSeconds = 1 } = {}) {
  const child = spawn(process.execPath, [SCRIPT], {
    env: {
      ...process.env,
      LOBO_MOCK_PORT: String(port),
      LOBO_MOCK_STEP_SECONDS: String(stepSeconds),
    },
    stdio: "ignore",
  });

  const baseUrl = `http://127.0.0.1:${port}/api/v1/external`;
  const deadline = Date.now() + 10_000;
  for (;;) {
    try {
      // Заглушка отвечает 401 без ключей — значит, порт уже слушает.
      await fetch(`${baseUrl}/orders`);
      break;
    } catch {
      if (Date.now() > deadline) {
        child.kill();
        throw new Error("мок ЛОБО не поднялся за 10 секунд");
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  return {
    baseUrl,
    stop: () =>
      new Promise((resolve) => {
        child.once("exit", resolve);
        child.kill();
      }),
  };
}
