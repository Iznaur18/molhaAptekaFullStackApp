type StatusPanelStyles = {
  statusPanel: object;
  statusPanelActive: object;
  statusPanelPending: object;
};

export const resolveIntroAdStatusPanelStyle = (
  styles: StatusPanelStyles,
  status?: string | null,
) => {
  if (status === "active") {
    return [styles.statusPanel, styles.statusPanelActive];
  }
  if (status === "pending" || status === "queued") {
    return [styles.statusPanel, styles.statusPanelPending];
  }
  return styles.statusPanel;
};

export const resolvePersonalCategoryStatusPanelStyle = (
  styles: StatusPanelStyles,
  status?: string | null,
) => {
  if (status === "active") {
    return [styles.statusPanel, styles.statusPanelActive];
  }
  if (status === "pending") {
    return [styles.statusPanel, styles.statusPanelPending];
  }
  return styles.statusPanel;
};
