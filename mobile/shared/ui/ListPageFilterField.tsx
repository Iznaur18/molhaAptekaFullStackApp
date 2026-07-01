import { useCallback, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  type LayoutRectangle,
} from "react-native";

import { useListPageFilterBarStyles } from "@/shared/theme/catalogProductStyles";

type ListPageFilterFieldOption = {
  value: string;
  label: string;
};

type ListPageFilterFieldProps = {
  label: string;
  value: string;
  options: ListPageFilterFieldOption[];
  onChange: (value: string) => void;
};

const MENU_GAP = 4;

export const ListPageFilterField = ({
  label,
  value,
  options,
  onChange,
}: ListPageFilterFieldProps) => {
  const styles = useListPageFilterBarStyles();
  const controlRef = useRef<View>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<LayoutRectangle | null>(null);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? value;

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const openMenu = useCallback(() => {
    controlRef.current?.measureInWindow((x, y, width, height) => {
      setMenuAnchor({ x, y, width, height });
      setMenuOpen(true);
    });
  }, []);

  const handleToggleMenu = useCallback(() => {
    if (menuOpen) {
      closeMenu();
      return;
    }
    openMenu();
  }, [closeMenu, menuOpen, openMenu]);

  const handleSelect = useCallback(
    (nextValue: string) => {
      onChange(nextValue);
      closeMenu();
    },
    [closeMenu, onChange],
  );

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        ref={controlRef}
        style={styles.control}
        onPress={handleToggleMenu}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: menuOpen }}
      >
        <Text style={styles.controlText} numberOfLines={1}>
          {selectedLabel}
        </Text>
        <Text style={styles.controlChevron}>{menuOpen ? "▲" : "▾"}</Text>
      </Pressable>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.menuBackdrop} onPress={closeMenu} accessibilityLabel="Закрыть" />
        {menuAnchor ? (
          <View
            style={[
              styles.menu,
              {
                top: menuAnchor.y + menuAnchor.height + MENU_GAP,
                left: menuAnchor.x,
                width: menuAnchor.width,
              },
            ]}
          >
            <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {options.map((option, index) => {
                const isActive = option.value === value;
                const isLast = index === options.length - 1;
                return (
                  <Pressable
                    key={option.value || "all"}
                    style={[
                      styles.menuItem,
                      isLast && styles.menuItemLast,
                      isActive && styles.menuItemActive,
                    ]}
                    onPress={() => handleSelect(option.value)}
                  >
                    <Text
                      style={[styles.menuItemText, isActive && styles.menuItemTextActive]}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
      </Modal>
    </View>
  );
};
