// @ts-nocheck

import { create } from "zustand";

const useFilterStore = create((set) => ({
  type: ["concepts", "tools", "resources"],
  time: 2,
  minDate: Date.parse("2022-12-20"),
  maxDate: Date.parse(new Date().toISOString().slice(0, 10)),
  nodeLocation: "any",
  addType: (newType) => {
    set((state) => ({
      type: [newType],
      time: state.time,
      nodeLocation: state.nodeLocation,
    }));
  },
  resetType: () => {
    set((state) => ({
      type: ["concepts", "tools", "resources"],
      time: state.time,
      nodeLocation: state.nodeLocation,
    }));
  },
  removeType: (key) => {
    set((state) => ({
      items: state.items.filter((item) => item.key !== key),
    }));
  },
  setMinDate: (newTime) => set({ minDate: newTime }),
  setMaxDate: (newTime) => set({ maxDate: newTime }),
  setLocation: (newNodeLocation) =>
    set((state) => ({ ...state, nodeLocation: newNodeLocation })),
}));
export default useFilterStore;
