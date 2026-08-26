import { Redirect } from "expo-router";

/** Легаси `/profile` → web-паритет `/me` (edit остаётся `/profile/edit`). */
export default function ProfileLegacyRedirect() {
  return <Redirect href="/me" />;
}
