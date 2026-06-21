import { create } from "zustand"

type User = {
  _id: string
  clerkId: string
  name: string
  email: string
  role: "admin" | "manager" | "rep"
}

type AuthStore = {
  user: User | null
  setUser: (user: User | null) => void
  role: () => string | null
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  role: () => get().user?.role ?? null,
}))
