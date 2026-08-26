import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

import { useAppIntroAdminPage } from "@/features/app-intro-admin-page/model/useAppIntroAdminPage";
import { IntroVideoUploadField } from "@/features/image-upload/ui/IntroVideoUploadField";
import { ImageUrlUploadField } from "@/features/image-upload/ui/ImageUrlUploadField";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { APP_INTRO_ADMIN_PAGE_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppIntroAdminPageStyles } from "@/shared/theme/appIntroAdminPageStyles";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

export const AppIntroAdminPage = () => {
  const router = useRouter();
  const styles = useAppIntroAdminPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled, resolveListStyle } =
    useProfileAccountNestedListScroll();
  const [navSheetVisible, setNavSheetVisible] = useState(false);

  const {
    form,
    phase,
    isSaving,
    queryError,
    actionError,
    saveNotice,
    updateField,
    handlePreview,
    handleSave,
    handleWatchSaved,
    reloadSettings,
    refetchSettings,
  } = useAppIntroAdminPage();

  useFocusEffect(
    useCallback(() => {
      void refetchSettings();
    }, [refetchSettings]),
  );

  const navSheet = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="app-intro-admin"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/me")}
    />
  );

  const sectionToggle = (
    <ProfileMobileSectionToggle
      activeLabel={MY_PROFILE_PAGE_UI.TAB_APP_INTRO_ADMIN}
      onPress={() => setNavSheetVisible(true)}
    />
  );

  const pageHeader = (
    <View style={styles.header}>
      {sectionToggle}
      <Text style={styles.title}>{APP_INTRO_ADMIN_PAGE_UI.TITLE}</Text>
      <Text style={styles.hint}>{APP_INTRO_ADMIN_PAGE_UI.HINT}</Text>
    </View>
  );

  if (phase === "loading") {
    return (
      <>
        <ScrollView
          style={resolveListStyle([
            styles.container,
            scrollEnabled ? centeredContentStyle : null,
          ])}
          scrollEnabled={scrollEnabled}
          contentContainerStyle={[
            styles.scroll,
            styles.content,
            { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
          ]}
        >
          {pageHeader}
          <Text style={styles.status}>{APP_INTRO_ADMIN_PAGE_UI.LOADING}</Text>
        </ScrollView>
        {navSheet}
      </>
    );
  }

  if (phase === "error") {
    return (
      <>
        <ScrollView
          style={resolveListStyle([
            styles.container,
            scrollEnabled ? centeredContentStyle : null,
          ])}
          scrollEnabled={scrollEnabled}
          contentContainerStyle={[
            styles.scroll,
            styles.content,
            { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
          ]}
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
        style={resolveListStyle([
          styles.container,
          scrollEnabled ? centeredContentStyle : null,
        ])}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
        ]}
      >
        {pageHeader}

        {saveNotice ? (
          <View style={styles.notice} accessibilityRole="text">
            <Text style={styles.noticeText}>{APP_INTRO_ADMIN_PAGE_UI.SAVE_SUCCESS}</Text>
            <Pressable style={styles.noticeButton} onPress={handleWatchSaved}>
              <Text style={styles.noticeButtonText}>{APP_INTRO_ADMIN_PAGE_UI.WATCH_AFTER_SAVE}</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={[styles.form, isSaving && styles.fieldsetDisabled]}>
          <View style={styles.fieldset} pointerEvents={isSaving ? "none" : "auto"}>
            <Text style={styles.legend}>{APP_INTRO_ADMIN_PAGE_UI.SECTION_MEDIA}</Text>

            <IntroVideoUploadField
              label={APP_INTRO_ADMIN_PAGE_UI.LABEL_VIDEO}
              value={form.videoMp4Url}
              onChange={(value) => updateField("videoMp4Url", value)}
              disabled={isSaving}
            />

            <ImageUrlUploadField
              label={APP_INTRO_ADMIN_PAGE_UI.LABEL_POSTER}
              value={form.posterUrl}
              onChange={(value) => updateField("posterUrl", value)}
              disabled={isSaving}
            />
          </View>

          <View style={styles.fieldset} pointerEvents={isSaving ? "none" : "auto"}>
            <Text style={styles.legend}>{APP_INTRO_ADMIN_PAGE_UI.SECTION_FALLBACK}</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{APP_INTRO_ADMIN_PAGE_UI.LABEL_FALLBACK_TITLE}</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.fallbackTitle}
                onChangeText={(value) => updateField("fallbackTitle", value)}
                maxLength={80}
                editable={!isSaving}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{APP_INTRO_ADMIN_PAGE_UI.LABEL_FALLBACK_HINT}</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.fallbackHint}
                onChangeText={(value) => updateField("fallbackHint", value)}
                maxLength={200}
                editable={!isSaving}
              />
            </View>
          </View>

          <View style={styles.fieldset} pointerEvents={isSaving ? "none" : "auto"}>
            <Text style={styles.legend}>{APP_INTRO_ADMIN_PAGE_UI.SECTION_PRIORITY}</Text>
            <View style={styles.checkboxRow}>
              <Switch
                value={form.prioritizePlatformIntro}
                onValueChange={(value) => updateField("prioritizePlatformIntro", value)}
                disabled={isSaving}
              />
              <Text style={styles.checkboxLabel}>
                {APP_INTRO_ADMIN_PAGE_UI.LABEL_PRIORITIZE_PLATFORM_INTRO}
              </Text>
            </View>
            <Text style={styles.fieldHint}>
              {APP_INTRO_ADMIN_PAGE_UI.HINT_PRIORITIZE_PLATFORM_INTRO}
            </Text>
          </View>

          {actionError ? (
            <Text style={styles.error} accessibilityRole="alert">
              {actionError}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              style={[styles.secondaryButton, isSaving && styles.secondaryButtonDisabled]}
              onPress={handlePreview}
              disabled={isSaving}
            >
              <Text style={styles.secondaryButtonText}>{APP_INTRO_ADMIN_PAGE_UI.PREVIEW}</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryButton, isSaving && styles.primaryButtonDisabled]}
              onPress={() => void handleSave()}
              disabled={isSaving}
            >
              <Text style={styles.primaryButtonText}>
                {isSaving ? APP_INTRO_ADMIN_PAGE_UI.SAVING : APP_INTRO_ADMIN_PAGE_UI.SAVE}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      {navSheet}
    </>
  );
};
