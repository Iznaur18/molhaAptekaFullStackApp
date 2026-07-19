import { useMutation } from "@tanstack/react-query";

import { registerUser, type RegisterPayload } from "../api/registerUser";

/**
 * Начало регистрации: возвращает заявку `{ registrationId, email }`.
 * Сессии здесь ещё нет — она появляется в `useConfirmRegistrationMutation`.
 */
export const useRegisterMutation = () =>
  useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
  });
