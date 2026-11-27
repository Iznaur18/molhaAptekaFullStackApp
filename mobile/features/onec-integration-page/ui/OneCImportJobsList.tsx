import { Text, View } from "react-native";

import { useOneCImportJobsQuery } from "@/entities/onec/model/useOneCQueries";
import { ONEC_INTEGRATION_PAGE_UI as UI } from "@/shared/config";
import { useServicesProfilePageStyles } from "@/shared/theme/servicesProfilePageStyles";

const summarize = (stats: Record<string, unknown> | null | undefined): string => {
  if (!stats) return "";
  const parts: string[] = [];
  const catalog = stats.catalog as Record<string, number> | undefined;
  if (catalog) {
    parts.push(`${UI.IMPORT_CREATED}: ${catalog.created ?? 0}`);
    parts.push(`${UI.IMPORT_UPDATED}: ${catalog.updated ?? 0}`);
    if ((catalog.unchanged ?? 0) > 0) {
      parts.push(`${UI.IMPORT_UNCHANGED}: ${catalog.unchanged}`);
    }
    if ((catalog.uncategorized ?? 0) > 0) {
      parts.push(`${UI.IMPORT_UNCATEGORIZED}: ${catalog.uncategorized}`);
    }
    if ((catalog.imagesUploaded ?? 0) > 0) {
      parts.push(`${UI.IMPORT_IMAGES}: ${catalog.imagesUploaded}`);
    }
    if ((catalog.held ?? 0) > 0) {
      parts.push(`${UI.IMPORT_HELD}: ${catalog.held}`);
    }
  }
  if (stats.offers && typeof stats.offers === "object") {
    const rows = Object.values(stats.offers as Record<string, Record<string, number>>);
    const sum = (key: string) => rows.reduce((acc, row) => acc + (row?.[key] ?? 0), 0);
    parts.push(`цены и остатки: ${sum("matched")}`);
    if (sum("restored") > 0) parts.push(`${UI.IMPORT_RESTORED}: ${sum("restored")}`);
    if (sum("held") > 0) parts.push(`${UI.IMPORT_HELD}: ${sum("held")}`);
  }
  if (Number(stats.deactivated) > 0) {
    parts.push(`${UI.IMPORT_DEACTIVATED}: ${String(stats.deactivated)}`);
  }
  return parts.join(" · ");
};

export const OneCImportJobsList = () => {
  const styles = useServicesProfilePageStyles();
  const jobsQuery = useOneCImportJobsQuery();

  if (jobsQuery.isPending) {
    return <Text style={styles.muted}>{UI.LOADING}</Text>;
  }

  const jobs = jobsQuery.data ?? [];
  if (jobs.length === 0) {
    return <Text style={styles.muted}>{UI.IMPORTS_EMPTY}</Text>;
  }

  return (
    <View>
      {jobs.map((job) => (
        <View key={job.id} style={styles.logItem}>
          <Text style={styles.badgeText}>
            {UI.IMPORT_STATUS[job.status ?? ""] ?? job.status}
          </Text>
          <Text style={styles.metaValue}>{job.filename}</Text>
          <Text style={styles.hint}>
            {job.createdAt ? new Date(job.createdAt).toLocaleString("ru-RU") : ""}
          </Text>
          {job.errorMessage ? (
            <Text style={styles.error}>{job.errorMessage}</Text>
          ) : (
            <Text style={styles.hint}>{summarize(job.stats)}</Text>
          )}
        </View>
      ))}
    </View>
  );
};
