import { APP_STACK_LABEL, APP_TITLE } from "@/shared/config";
import styles from "./HomePage.module.css";

export function HomePage() {
  return (
    <main className={styles.root}>
      <h1>{APP_TITLE}</h1>
      <p>{APP_STACK_LABEL}</p>
    </main>
  );
}
