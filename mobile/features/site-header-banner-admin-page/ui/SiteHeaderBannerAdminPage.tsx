import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

import {
  createEmptySiteHeaderBannerItem,
  type SiteHeaderBannerAdminForm,
} from "@/entities/site-header-banner/lib/siteHeaderBannerAdminForm";
import {
  normalizeSiteHeaderBannerHexColor,
  resolvePreviewSiteHeaderBannerSlidesFromForm,
  resolveSiteHeaderBannerColorPreview,
} from "@/entities/site-header-banner/lib/resolvePreviewSiteHeaderBannerSlidesFromForm";
import { SiteHeaderBannerCarousel } from "@/entities/site-header-banner/ui/SiteHeaderBannerCarousel";
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

  const previewSlides = useMemo(
    () => resolvePreviewSiteHeaderBannerSlidesFromForm(form),
    [form],
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

  const renderFormBody = () => (
    <View style={styles.form}>
      <View style={styles.controlPanel}>
      <View style={[styles.panelSection, styles.toolbar]}>
        <View style={styles.switchRow}>
          <Text style={styles.labelText}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_ENABLED}</Text>
          <Switch
            value={form.enabled}
            disabled={isSaving}
            onValueChange={(enabled) => updateForm({ ...form, enabled })}
          />
        </View>
        <Pressable
          style={[styles.button, styles.buttonSecondary, isSaving && { opacity: 0.7 }]}
          disabled={isSaving}
          onPress={() =>
            updateForm({
              ...form,
              items: [...form.items, createEmptySiteHeaderBannerItem()],
            })
          }
        >
          <Text style={styles.buttonTextSecondary}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.ADD_ITEM}</Text>
        </Pressable>
      </View>

      {previewSlides.length > 0 ? (
        <View style={[styles.panelSection, styles.preview]}>
          <SiteHeaderBannerCarousel slides={previewSlides} />
        </View>
      ) : null}

      {form.items.length === 0 ? (
        <Text style={[styles.panelSection, styles.empty]}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.EMPTY_ITEMS}</Text>
      ) : null}
      </View>

      {form.items.map((item, index) => (
        <View key={item.id} style={styles.slideZone}>
          <Text style={styles.slideTitle}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.ITEM_TITLE(index + 1)}</Text>

          <View style={styles.fieldBlock}>
            <View style={styles.switchRow}>
            <Text style={styles.labelText}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_ITEM_ENABLED}</Text>
            <Switch
              value={item.enabled}
              disabled={isSaving}
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
          </View>

          <View style={styles.fieldBlock}>
          <ImageUrlUploadField
            label={SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_IMAGE}
            value={item.imageUrl}
            disabled={isSaving}
            onChange={(imageUrl) =>
              updateForm({
                ...form,
                items: form.items.map((entry) =>
                  entry.id === item.id ? { ...entry, imageUrl } : entry,
                ),
              })
            }
          />
          </View>

          <View style={styles.fieldBlock}>
          <View style={styles.label}>
            <Text style={styles.labelText}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_IMAGE_ALT}</Text>
            <TextInput
              style={styles.input}
              value={item.imageAlt}
              editable={!isSaving}
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
          </View>

          <View style={styles.fieldBlock}>
          <View style={styles.label}>
            <Text style={styles.labelText}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_LINK_PATH}</Text>
            <TextInput
              style={styles.input}
              value={item.linkPath}
              editable={!isSaving}
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
          </View>
          </View>

          <View style={styles.fieldBlock}>
          <View style={styles.label}>
            <Text style={styles.labelText}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_BACKGROUND_COLOR}</Text>
            <View style={styles.colorField}>
              <View
                style={[
                  styles.colorSwatch,
                  resolveSiteHeaderBannerColorPreview(item.backgroundColor)
                    ? { backgroundColor: resolveSiteHeaderBannerColorPreview(item.backgroundColor) }
                    : styles.colorSwatchEmpty,
                ]}
              />
              <TextInput
                style={[styles.input, styles.colorInput]}
                value={item.backgroundColor}
                editable={!isSaving}
                onChangeText={(backgroundColor) => {
                  const normalized = normalizeSiteHeaderBannerHexColor(backgroundColor);
                  updateForm({
                    ...form,
                    items: form.items.map((entry) =>
                      entry.id === item.id
                        ? { ...entry, backgroundColor: normalized ?? backgroundColor }
                        : entry,
                    ),
                  });
                }}
                placeholder="#RRGGBB"
                autoCapitalize="none"
              />
            </View>
          </View>
          </View>

          <View style={[styles.fieldBlock, styles.fieldBlockActions]}>
          <Pressable
            style={[styles.button, styles.buttonDanger, isSaving && { opacity: 0.7 }]}
            disabled={isSaving}
            onPress={() =>
              updateForm({
                ...form,
                items: form.items.filter((entry) => entry.id !== item.id),
              })
            }
          >
            <Text style={styles.buttonTextDanger}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.REMOVE_ITEM}</Text>
          </Pressable>
          </View>
        </View>
      ))}

      {actionError ? (
        <Text style={[styles.standalonePanel, styles.error]}>{actionError}</Text>
      ) : null}

      <View style={[styles.standalonePanel, styles.actions]}>
      <Pressable
        style={[styles.button, styles.buttonPrimary, isSaving && { opacity: 0.7 }]}
        disabled={isSaving}
        onPress={() => void handleSave()}
      >
        <Text style={styles.buttonTextPrimary}>
          {isSaving ? SITE_HEADER_BANNER_ADMIN_PAGE_UI.SAVING : SITE_HEADER_BANNER_ADMIN_PAGE_UI.SAVE}
        </Text>
      </Pressable>
      </View>
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

        {renderFormBody()}
      </ScrollView>
      {navSheet}
    </>
  );
};
