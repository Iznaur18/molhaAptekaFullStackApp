export const HOME_FEED_SECTION_TABS = ["home", "sellers", "categories"] as const;

export type HomeFeedSectionTab = (typeof HOME_FEED_SECTION_TABS)[number];

export const HOME_FEED_SECTION_TAB_HOME: HomeFeedSectionTab = "home";
