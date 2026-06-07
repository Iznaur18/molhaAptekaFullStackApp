import { dataConfirmationStatusQueryKeys } from "../model/dataConfirmationStatusQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function invalidateDataConfirmationStatus(queryClient) {
  await queryClient.invalidateQueries({
    queryKey: dataConfirmationStatusQueryKeys.all,
  });
}
