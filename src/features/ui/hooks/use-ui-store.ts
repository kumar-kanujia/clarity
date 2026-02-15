import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UiState {
  isPanelCollapsed: boolean;
  togglePanel: () => void;
  setPanelCollapsed: (collapsed: boolean) => void;
}

export const useUiStore = create<UiState>()(
  devtools((set) => ({
    isPanelCollapsed: false,
    togglePanel: () =>
      set(
        (state) => ({ isPanelCollapsed: !state.isPanelCollapsed }),
        false,
        "togglePanel",
      ),
    setPanelCollapsed: (collapsed: boolean) =>
      set({ isPanelCollapsed: collapsed }, false, "setPanelCollapsed"),
  })),
);
