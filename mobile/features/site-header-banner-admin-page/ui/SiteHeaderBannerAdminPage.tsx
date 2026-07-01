import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

import {
  createEmptySiteHeaderBannerItem,
  type SiteHeaderBannerAdminForm,
} from "@/entities/site-header-banner/lib/siteHeaderBannerAdminForm";
import { ImageUrlUploadField } from "@/features/image-upload/ui/ImageUrlUploadField";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { useSiteHeaderBannerAdminPage } from "@/features/site-header-banner-admin-page/model/useSiteHeaderBannerAdminPage";
import { MY_PROFILE_PAGE_UI, SITE_HEADER_BANNER_ADMIN_PAGE_UI } from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useSiteHeaderBannerAdminPageStyles } from "@/shared/theme/siteHeaderBannerAdminPageStyles";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

export const SiteHeaderBannerAdminPage = () => {
  const router = useRouter();
  const styles = useSiteHeaderBannerAdminPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const [navSheetVisible, setNavSheetVisible] = useState(false);

  const {
    form,
    setFormState,
    phase,
    isSaving,
    queryError,
    actionError,
    saveNotice,
    handleSave,
    reloadSettings,
    refetchSettings,
  } = useSiteHeaderBannerAdminPage();

  useFocusEffect(
    useCallback(() => {
      void refetchSettings();
    }, [refetchSettings]),
  );

  const updateForm = (next: SiteHeaderBannerAdminForm) => {
    setFormState(next);
  };

  const navSheet = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="site-header-banner-admin"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/profile")}
    />
  );

  const sectionToggle = (
    <ProfileMobileSectionToggle
      activeLabel={MY_PROFILE_PAGE_UI.TAB_SITE_HEADER_BANNER_ADMIN}
      onPress={() => setNavSheetVisible(true)}
    />
  );

  const pageHeader = (
    <View style={styles.header}>
      {sectionToggle}
      <Text style={styles.title}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.TITLE}</Text>
      <Text style={styles.hint}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.HINT}</Text>
    </View>
  );

  if (phase === "loading") {
    return (
      <>
        <ScrollView
          style={[styles.container, centeredContentStyle]}
          contentContainerStyle={[styles.scroll, styles.content, { paddingBottom: contentPaddingBottom }]}
        >
          {pageHeader}
          <Text style={styles.status}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LOADING}</Text>
        </ScrollView>
        {navSheet}
      </>
    );
  }

  if (phase === "error") {
    return (
      <>
        <ScrollView
          style={[styles.container, centeredContentStyle]}
          contentContainerStyle={[styles.scroll, styles.content, { paddingBottom: contentPaddingBottom }]}
        >
          {pageHeader}
          <ScreenErrorState message={queryError} onRetry={() => void reloadSettings()} />
        </ScrollView>
        {navSheet}
      </>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, centeredContentStyle]}
        contentContainerStyle={[styles.scroll, styles.content, { paddingBottom: contentPaddingBottom }]}
      >
        {pageHeader}

        {saveNotice ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.SAVE_SUCCESS}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.fieldset}>
            <Text style={styles.legend}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.SECTION_GLOBAL}</Text>
            <View style={styles.switchRow}>
              <Text style={styles.labelText}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_ENABLED}</Text>
              <Switch
                value={form.enabled}
                onValueChange={(enabled) => updateForm({ ...form, enabled })}
              />
            </View>
          </View>

          <View style={styles.itemsHeader}>
            <Text style={styles.itemsTitle}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.SECTION_ITEMS}</Text>
            <Pressable
              style={[styles.button, styles.buttonSecondary]}
              onPress={() =>
                updateForm({
                  ...form,
                  items: [...form.items, createEmptySiteHeaderBannerItem()],
                })
              }
            >
              <Text style={styles.buttonTextSecondary}>
                {SITE_HEADER_BANNER_ADMIN_PAGE_UI.ADD_ITEM}
              </Text>
            </Pressable>
          </View>

          {form.items.length === 0 ? (
            <Text style={styles.empty}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.EMPTY_ITEMS}</Text>
          ) : null}

          {form.items.map((item, index) => (
            <View key={item.id} style={styles.fieldset}>
              <Text style={styles.legend}>
                {SITE_HEADER_BANNER_ADMIN_PAGE_UI.ITEM_TITLE(index + 1)}
              </Text>

              <View style={styles.switchRow}>
                <Text style={styles.labelText}>
                  {SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_ITEM_ENABLED}
                </Text>
                <Switch
                  value={item.enabled}
                  onValueChange={(enabled) =>
                    updateForm({
                      ...form,
                      items: form.items.map((entry) =>
                        entry.id === item.id ? { ...entry, enabled } : entry,
                      ),
                    })
                  }
                />
              </View>

              <ImageUrlUploadField
                label={SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_IMAGE}
                value={item.imageUrl}
                onChange={(imageUrl) =>
                  updateForm({
                    ...form,
                    items: form.items.map((entry) =>
                      entry.id === item.id ? { ...entry, imageUrl } : entry,
                    ),
                  })
                }
              />
              <Text style={styles.fieldHint}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.HINT_IMAGE}</Text>

              <View style={styles.label}>
                <Text style={styles.labelText}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_IMAGE_ALT}</Text>
                <TextInput
                  style={styles.input}
                  value={item.imageAlt}
                  onChangeText={(imageAlt) =>
                    updateForm({
                      ...form,
                      items: form.items.map((entry) =>
                        entry.id === item.id ? { ...entry, imageAlt } : entry,
                      ),
                    })
                  }
                  maxLength={200}
                />
              </View>

              <View style={styles.label}>
                <Text style={styles.labelText}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_LINK_PATH}</Text>
                <TextInput
                  style={styles.input}
                  value={item.linkPath}
                  onChangeText={(linkPath) =>
                    updateForm({
                      ...form,
                      items: form.items.map((entry) =>
                        entry.id === item.id ? { ...entry, linkPath } : entry,
                      ),
                    })
                  }
                  placeholder={SITE_HEADER_BANNER_ADMIN_PAGE_UI.LINK_PATH_PLACEHOLDER}
                  autoCapitalize="none"
                />
                <Text style={styles.fieldHint}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.HINT_LINK_PATH}</Text>
              </View>

              <View style={styles.label}>
                <Text style={styles.labelText}>
                  {SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_BACKGROUND_COLOR}
                </Text>
                <TextInput
                  style={styles.input}
                  value={item.backgroundColor}
                  onChangeText={(backgroundColor) =>
                    updateForm({
                      ...form,
                      items: form.items.map((entry) =>
                        entry.id === item.id ? { ...entry, backgroundColor } : entry,
                      ),
                    })
                  }
                  placeholder="#RRGGBB"
                  autoCapitalize="none"
                />
              </View>

              <Pressable
                style={[styles.button, styles.buttonDanger]}
                onPress={() =>
                  updateForm({
                    ...form,
                    items: form.items.filter((entry) => entry.id !== item.id),
                  })
                }
              >
                <Text style={styles.buttonTextDanger}>
                  {SITE_HEADER_BANNER_ADMIN_PAGE_UI.REMOVE_ITEM}
                </Text>
              </Pressable>
            </View>
          ))}

          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

          <Pressable
            style={[styles.button, styles.buttonPrimary, isSaving && { opacity: 0.7 }]}
            disabled={isSaving}
            onPress={() => void handleSave()}
          >
            <Text style={styles.buttonTextPrimary}>
              {isSaving
                ? SITE_HEADER_BANNER_ADMIN_PAGE_UI.SAVING
                : SITE_HEADER_BANNER_ADMIN_PAGE_UI.SAVE}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      {navSheet}
    </>
  );
};
