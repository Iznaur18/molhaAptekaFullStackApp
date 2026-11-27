import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import {
  useOneCCategoryMappingsQuery,
  usePutOneCCategoryMappingsMutation,
} from "@/entities/onec/model/useOneCQueries";
import { useProductCategorySearchQuery } from "@/entities/product-category-tree/model/useProductCategorySearchQuery";
import { ONEC_INTEGRATION_PAGE_UI as UI } from "@/shared/config";
import { useServicesProfilePageStyles } from "@/shared/theme/servicesProfilePageStyles";
import { AppButton } from "@/shared/ui/AppButton";

type Draft = { categoryId: string | null; label: string };

type CategoryPickerProps = {
  draftLabel: string | null;
  disabled: boolean;
  onPick: (categoryId: string | null, label: string) => void;
  pathNames?: string[];
};

const CategoryPicker = ({
  draftLabel,
  disabled,
  onPick,
  pathNames,
}: CategoryPickerProps) => {
  const styles = useServicesProfilePageStyles();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchQuery = useProductCategorySearchQuery(open ? query : "");

  return (
    <View style={{ gap: 8 }}>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen((value) => !value)}
        style={[styles.channel, open && styles.channelOn]}
      >
        <Text style={styles.channelTitle}>{draftLabel ?? UI.MAPPING_NOT_SET}</Text>
      </Pressable>
      {pathNames?.length ? (
        <Text style={styles.hint}>{pathNames.join(" › ")}</Text>
      ) : null}
      {open ? (
        <View style={{ gap: 8 }}>
          <TextInput
            style={styles.input}
            value={query}
            placeholder={UI.MAPPING_SEARCH_PLACEHOLDER}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          <Pressable
            onPress={() => {
              onPick(null, UI.MAPPING_NOT_SET);
              setOpen(false);
            }}
            style={styles.channel}
          >
            <Text style={styles.channelTitle}>{UI.MAPPING_CLEAR}</Text>
          </Pressable>
          {searchQuery.isFetching ? (
            <Text style={styles.muted}>{UI.LOADING}</Text>
          ) : (
            (searchQuery.data ?? []).map((category) => {
              const label = [...(category.pathLabelRu ?? []), category.labelRu]
                .filter(Boolean)
                .join(" › ");
              return (
                <Pressable
                  key={category.id}
                  onPress={() => {
                    onPick(String(category.id), label);
                    setOpen(false);
                  }}
                  style={styles.channel}
                >
                  <Text style={styles.channelTitle}>{label}</Text>
                </Pressable>
              );
            })
          )}
        </View>
      ) : null}
    </View>
  );
};

type OneCCategoryMappingTableProps = {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
};

export const OneCCategoryMappingTable = ({
  onError,
  onSuccess,
}: OneCCategoryMappingTableProps) => {
  const styles = useServicesProfilePageStyles();
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const mappingsQuery = useOneCCategoryMappingsQuery();
  const saveMutation = usePutOneCCategoryMappingsMutation();
  const rows = useMemo(() => mappingsQuery.data ?? [], [mappingsQuery.data]);

  const unmappedCount = useMemo(
    () =>
      rows.filter((row) => {
        const draft = drafts[row.externalId];
        return draft ? draft.categoryId === null : !row.categoryId;
      }).length,
    [rows, drafts],
  );

  if (mappingsQuery.isPending) {
    return <Text style={styles.muted}>{UI.LOADING}</Text>;
  }

  if (rows.length === 0) {
    return <Text style={styles.muted}>{UI.MAPPING_EMPTY}</Text>;
  }

  return (
    <View style={{ gap: 12 }}>
      <Text style={styles.hint}>{UI.MAPPING_HINT}</Text>
      <Text style={styles.status}>{UI.MAPPING_UNMAPPED_COUNT(unmappedCount)}</Text>

      {rows.map((row) => {
        const draft = drafts[row.externalId];
        return (
          <View key={row.externalId} style={styles.mapRow}>
            <Text style={styles.channelTitle}>{row.name || row.externalId}</Text>
            <Text style={styles.hint}>
              {UI.MAPPING_PRODUCTS(row.productCount ?? 0)}
            </Text>
            <CategoryPicker
              draftLabel={draft ? draft.label : row.categoryLabel || null}
              disabled={saveMutation.isPending}
              pathNames={row.pathNames}
              onPick={(categoryId, label) =>
                setDrafts((current) => ({
                  ...current,
                  [row.externalId]: { categoryId, label },
                }))
              }
            />
          </View>
        );
      })}

      <AppButton
        label={saveMutation.isPending ? UI.MAPPING_SAVE_PENDING : UI.MAPPING_SAVE}
        variant="primary"
        disabled={Object.keys(drafts).length === 0 || saveMutation.isPending}
        onPress={() => {
          saveMutation.mutate(
            Object.entries(drafts).map(([externalId, value]) => ({
              externalId,
              categoryId: value.categoryId,
            })),
            {
              onSuccess: (result) => {
                setDrafts({});
                onSuccess(String(result.message ?? "Сохранено"));
              },
              onError: (error) => onError(error.message),
            },
          );
        }}
      />

      {Object.keys(drafts).length === 0 ? (
        <Text style={styles.hint}>{UI.MAPPING_NOTHING_PICKED}</Text>
      ) : (
        <Text style={styles.ok}>
          {UI.MAPPING_PENDING_COUNT(Object.keys(drafts).length)}
        </Text>
      )}
    </View>
  );
};
