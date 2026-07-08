import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  SITE_HEADER_BANNER_ADMIN_TAB_BUTTONS,
  SITE_HEADER_BANNER_ADMIN_TAB_GUEST,
  SITE_HEADER_BANNER_ADMIN_TAB_SLIDES,
  type SiteHeaderBannerAdminTabId,
} from "@/features/site-header-banner-admin-page/lib/siteHeaderBannerAdminTabs";
import { SiteHeaderBannerManageToggleAdminSection } from "@/features/site-header-banner-admin-page/ui/SiteHeaderBannerManageToggleAdminSection";
import { SiteHeaderBannerAdminTabBar } from "@/features/site-header-banner-admin-page/ui/SiteHeaderBannerAdminTabBar";
import { useSiteHeaderBannerAdminPage } from "@/features/site-header-banner-admin-page/model/useSiteHeaderBannerAdminPage";
import { MY_PROFILE_PAGE_UI, SITE_HEADER_BANNER_ADMIN_PAGE_UI } from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useSiteHeaderBannerAdminPageStyles } from "@/shared/theme/siteHeaderBannerAdminPageStyles";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

const ADMIN_TABS = [
  { id: SITE_HEADER_BANNER_ADMIN_TAB_SLIDES, label: SITE_HEADER_BANNER_ADMIN_PAGE_UI.TAB_SLIDES },
  { id: SITE_HEADER_BANNER_ADMIN_TAB_BUTTONS, label: SITE_HEADER_BANNER_ADMIN_PAGE_UI.TAB_BUTTONS },
  { id: SITE_HEADER_BANNER_ADMIN_TAB_GUEST, label: SITE_HEADER_BANNER_ADMIN_PAGE_UI.TAB_GUEST },
] as const;

const resolveNextSelectedSlideId = (
  items: SiteHeaderBannerAdminForm["items"],
  removedId: string,
  currentId: string | null,
) => {
  if (currentId !== removedId) {
    return currentId;
  }
  if (items.length === 0) {
    return null;
  }
  const removedIndex = items.findIndex((item) => item.id === removedId);
  const nextItem = items[removedIndex] ?? items[removedIndex - 1] ?? items[0];
  return nextItem?.id ?? null;
};

export const SiteHeaderBannerAdminPage = () => {
  const router = useRouter();
  const styles = useSiteHeaderBannerAdminPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<SiteHeaderBannerAdminTabId>(
    SITE_HEADER_BANNER_ADMIN_TAB_SLIDES,
  );
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);

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

  useEffect(() => {
    if (form.items.length === 0) {
      setSelectedSlideId(null);
      return;
    }
    if (!selectedSlideId || !form.items.some((item) => item.id === selectedSlideId)) {
      setSelectedSlideId(form.items[0]?.id ?? null);
    }
  }, [form.items, selectedSlideId]);

  const previewSlides = useMemo(
    () => resolvePreviewSiteHeaderBannerSlidesFromForm(form),
    [form],
  );

  const selectedSlide = form.items.find((item) => item.id === selectedSlideId) ?? null;
  const selectedSlideIndex = selectedSlide
    ? form.items.findIndex((item) => item.id === selectedSlide.id)
    : -1;
  const showFormSave =
    activeTab === SITE_HEADER_BANNER_ADMIN_TAB_SLIDES
    || activeTab === SITE_HEADER_BANNER_ADMIN_TAB_GUEST;

  const updateForm = (next: SiteHeaderBannerAdminForm) => {
    setFormState(next);
  };

  const handleAddSlide = () => {
    const nextItem = createEmptySiteHeaderBannerItem();
    updateForm({
      ...form,
      items: [...form.items, nextItem],
    });
    setSelectedSlideId(nextItem.id);
    setActiveTab(SITE_HEADER_BANNER_ADMIN_TAB_SLIDES);
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
      <SiteHeaderBannerAdminTabBar tabs={[...ADMIN_TABS]} activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );

  const renderSlidesTab = () => (
    <View style={styles.tabPanel}>
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
          onPress={handleAddSlide}
        >
          <Text style={styles.buttonTextSecondary}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.ADD_ITEM}</Text>
        </Pressable>
      </View>

      <View style={styles.previewCard}>
        <Text style={styles.sectionTitle}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.SECTION_PREVIEW}</Text>
        <Text style={styles.fieldHint}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.HINT_PREVIEW}</Text>
        {previewSlides.length > 0 ? (
          <View style={styles.preview}>
            <SiteHeaderBannerCarousel slides={previewSlides} />
          </View>
        ) : (
          <Text style={styles.previewEmpty}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.PREVIEW_EMPTY}</Text>
        )}
      </View>

      <View style={styles.slidePicker}>
        <Text style={styles.sectionTitle}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.SECTION_ITEMS}</Text>
        <Text style={styles.fieldHint}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.SELECT_SLIDE_HINT}</Text>
        {form.items.length === 0 ? (
          <Text style={styles.empty}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.EMPTY_ITEMS}</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slidePickerRow}>
            {form.items.map((item, index) => {
              const isActive = item.id === selectedSlideId;
              const label =
                item.imageAlt.trim() || SITE_HEADER_BANNER_ADMIN_PAGE_UI.ITEM_TITLE(index + 1);
              return (
                <Pressable
                  key={item.id}
                  style={[styles.slidePickerItem, isActive && styles.slidePickerItemActive]}
                  disabled={isSaving}
                  onPress={() => setSelectedSlideId(item.id)}
                >
                  <Text style={[styles.slidePickerIndex, isActive && styles.slidePickerIndexActive]}>
                    {index + 1}
                  </Text>
                  <Text style={styles.slidePickerLabel} numberOfLines={1}>
                    {label}
                  </Text>
                  {!item.enabled ? (
                    <Text style={styles.slidePickerBadge}>
                      {SITE_HEADER_BANNER_ADMIN_PAGE_UI.ITEM_DISABLED_BADGE}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {selectedSlide && selectedSlideIndex >= 0 ? (
        <View style={styles.slideZone}>
          <Text style={styles.slideTitle}>
            {SITE_HEADER_BANNER_ADMIN_PAGE_UI.ITEM_TITLE(selectedSlideIndex + 1)}
          </Text>

          <View style={styles.fieldBlock}>
            <View style={styles.switchRow}>
              <Text style={styles.labelText}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_ITEM_ENABLED}</Text>
              <Switch
                value={selectedSlide.enabled}
                disabled={isSaving}
                onValueChange={(enabled) =>
                  updateForm({
                    ...form,
                    items: form.items.map((entry) =>
                      entry.id === selectedSlide.id ? { ...entry, enabled } : entry,
                    ),
                  })
                }
              />
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <ImageUrlUploadField
              label={SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_IMAGE}
              value={selectedSlide.imageUrl}
              disabled={isSaving}
              onChange={(imageUrl) =>
                updateForm({
                  ...form,
                  items: form.items.map((entry) =>
                    entry.id === selectedSlide.id ? { ...entry, imageUrl } : entry,
                  ),
                })
              }
            />
            <Text style={styles.fieldHint}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.HINT_IMAGE}</Text>
          </View>

          <View style={styles.fieldBlock}>
            <View style={styles.label}>
              <Text style={styles.labelText}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_IMAGE_ALT}</Text>
              <TextInput
                style={styles.input}
                value={selectedSlide.imageAlt}
                editable={!isSaving}
                onChangeText={(imageAlt) =>
                  updateForm({
                    ...form,
                    items: form.items.map((entry) =>
                      entry.id === selectedSlide.id ? { ...entry, imageAlt } : entry,
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
                value={selectedSlide.linkPath}
                editable={!isSaving}
                onChangeText={(linkPath) =>
                  updateForm({
                    ...form,
                    items: form.items.map((entry) =>
                      entry.id === selectedSlide.id ? { ...entry, linkPath } : entry,
                    ),
                  })
                }
                placeholder={SITE_HEADER_BANNER_ADMIN_PAGE_UI.LINK_PATH_PLACEHOLDER}
                autoCapitalize="none"
              />
            </View>
            <Text style={styles.fieldHint}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.HINT_LINK_PATH}</Text>
          </View>

          <View style={styles.fieldBlock}>
            <View style={styles.label}>
              <Text style={styles.labelText}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_BACKGROUND_COLOR}</Text>
              <View style={styles.colorField}>
                <View
                  style={[
                    styles.colorSwatch,
                    resolveSiteHeaderBannerColorPreview(selectedSlide.backgroundColor)
                      ? {
                          backgroundColor: resolveSiteHeaderBannerColorPreview(
                            selectedSlide.backgroundColor,
                          ),
                        }
                      : styles.colorSwatchEmpty,
                  ]}
                />
                <TextInput
                  style={[styles.input, styles.colorInput]}
                  value={selectedSlide.backgroundColor}
                  editable={!isSaving}
                  onChangeText={(backgroundColor) => {
                    const normalized = normalizeSiteHeaderBannerHexColor(backgroundColor);
                    updateForm({
                      ...form,
                      items: form.items.map((entry) =>
                        entry.id === selectedSlide.id
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
              onPress={() => {
                const nextItems = form.items.filter((entry) => entry.id !== selectedSlide.id);
                setSelectedSlideId((currentId) =>
                  resolveNextSelectedSlideId(nextItems, selectedSlide.id, currentId),
                );
                updateForm({ ...form, items: nextItems });
              }}
            >
              <Text style={styles.buttonTextDanger}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.REMOVE_ITEM}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.slideEditorEmpty}>
          <Text style={styles.empty}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.NO_SLIDE_SELECTED}</Text>
        </View>
      )}
    </View>
  );

  const renderGuestTab = () => (
    <View style={styles.tabPanel}>
      <View style={styles.standalonePanel}>
        <Text style={styles.sectionTitle}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.TAB_GUEST}</Text>
        <Text style={styles.fieldHint}>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.HINT_GUEST_PROFILE}</Text>
        <ImageUrlUploadField
          label={SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_GUEST_PROFILE_LOGIN_MENU_BANNER_IMAGE}
          value={form.guestProfileLoginMenuBannerImageUrl}
          disabled={isSaving}
          onChange={(imageUrl) =>
            updateForm({ ...form, guestProfileLoginMenuBannerImageUrl: imageUrl })
          }
        />
      </View>
    </View>
  );

  const renderFormBody = () => (
    <View style={styles.form}>
      {activeTab === SITE_HEADER_BANNER_ADMIN_TAB_SLIDES ? renderSlidesTab() : null}
      {activeTab === SITE_HEADER_BANNER_ADMIN_TAB_BUTTONS ? (
        <View style={styles.tabPanel}>
          <SiteHeaderBannerManageToggleAdminSection embedded />
        </View>
      ) : null}
      {activeTab === SITE_HEADER_BANNER_ADMIN_TAB_GUEST ? renderGuestTab() : null}

      {actionError ? (
        <Text style={[styles.standalonePanel, styles.error]}>{actionError}</Text>
      ) : null}

      {showFormSave ? (
        <View style={styles.saveBar}>
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
      ) : null}
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
