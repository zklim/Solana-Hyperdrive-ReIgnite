import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// The info about a grant that will be checked out
interface GrantCheckoutItem {
  id: number;
  image: string;
  name: string;
  description?: string;
  amount: number;
}

interface GrantCartState {
  grants: GrantCheckoutItem[];
  addToCart: (grant: { id: number; image: string; name: string }) => void;
  updateCart: (id: number, amount: number) => void;
  removeFromCart: (grantId: number) => void;
  clearCart: () => void;
}

export const useGrantCartStore = create<GrantCartState>()(
  devtools(
    persist(
      (set) => ({
        grants: [],
        addToCart: (grant) =>
          set((state) => ({
            grants: [
              ...state.grants,
              {
                id: grant.id,
                image: grant.image,
                name: grant.name,
                amount: 0,
              },
            ],
          })),
        updateCart: (id: number, amount: number) =>
          set((state) => ({
            grants: state.grants.map((g) =>
              g.id === id
                ? {
                    ...g,
                    amount: amount,
                  }
                : g
            ),
          })),
        removeFromCart: (grantId) =>
          set((state) => {
            const grants = state.grants.filter((grant) => grant.id !== grantId);
            return { grants: grants };
          }),
        clearCart: () => set(() => ({ grants: [] })),
      }),
      {
        name: "grant-cart-storage",
      }
    )
  )
);
