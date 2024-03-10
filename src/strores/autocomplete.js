import axios from "axios";
import { create } from "zustand";

export const useAutocompleteStore = create((set) => ({
  items: [],
  variants: [],
  error: "",

  getItems: async () => {
    try {
      const res = await axios.get(
        "https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete"
      );
      const data = res.data.map((item, i) => ({ ...item, id: i + 1 }));
      set({ items: data });
    } catch (err) {
      set({
        error:
          "Failed to get autocomplete items. Check server or internet connection",
      });
    }
  },
  setVariants: (variants) => set({ variants }),
}));
