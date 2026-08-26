import { useEffect, useRef } from "react";
import { AppState } from "react-native";

import {
  clearCreateProductFormDraft,
  writeCreateProductFormDraft,
} from "@/entities/product/lib/createProductFormDraftStorage";

const AUTOSAVE_DEBOUNCE_MS = 700;

type UseCreateProductFormDraftOptions<TForm> = {
  /** Черновик ведём только для «чистого» создания — как `draftEnabled` в вебе. */
  enabled: boolean;
  form: TForm;
  stepIndex: number;
  /** Во время отправки писать нечего: успех черновик и так сотрёт. */
  isSubmitting: boolean;
};

/**
 * Автосохранение черновика мастера.
 *
 * Веб пишет черновик только по кнопке «сохранить и выйти» — там этого хватает:
 * вкладку закрывает сам пользователь. На телефоне так нельзя: система выгружает
 * фоновое приложение молча и без шанса что-либо нажать, а `beforeunload` в RN
 * не существует. Поэтому кнопка здесь — удобство, а механика — автосейв:
 *
 * — с задержкой на каждое изменение формы или шага (набор текста не должен
 *   бить по диску на каждую букву);
 * — немедленно, когда приложение уходит из `active` (сворачивание — последний
 *   момент, когда мы ещё живы гарантированно);
 * — немедленно при уходе с экрана.
 */
export const useCreateProductFormDraft = <TForm,>({
  enabled,
  form,
  stepIndex,
  isSubmitting,
}: UseCreateProductFormDraftOptions<TForm>) => {
  // Через ref, чтобы слушатели вешались один раз и всё равно видели свежее.
  const latestRef = useRef({ enabled, form, stepIndex, isSubmitting });
  latestRef.current = { enabled, form, stepIndex, isSubmitting };

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useRef(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const latest = latestRef.current;
    if (!latest.enabled || latest.isSubmitting) {
      return;
    }
    writeCreateProductFormDraft(latest.form, latest.stepIndex);
  }).current;

  useEffect(() => {
    if (!enabled || isSubmitting) {
      return;
    }
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      writeCreateProductFormDraft(latestRef.current.form, latestRef.current.stepIndex);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, form, isSubmitting, stepIndex]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        flush();
      }
    });
    return () => {
      subscription.remove();
    };
  }, [flush]);

  // Размонтирование = уход с экрана: дописываем то, что не успел таймер.
  useEffect(() => () => flush(), [flush]);

  return {
    /** Явное «сохранить и выйти» — та же кнопка, что в вебе. */
    saveNow: flush,
    discard: clearCreateProductFormDraft,
  };
};
