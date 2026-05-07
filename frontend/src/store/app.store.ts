import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  sidebarOpen: boolean
  darkMode: boolean
  setSidebarOpen: (v: boolean) => void
  toggleSidebar: () => void
  toggleDarkMode: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      sidebarOpen: true,
      darkMode: false,
      setSidebarOpen: v  => set({ sidebarOpen: v }),
      toggleSidebar:  () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      toggleDarkMode: () => set(s => {
        const next = !s.darkMode
        document.documentElement.classList.toggle('dark', next)
        return { darkMode: next }
      }),
    }),
    {
      name: 'cejumeva_app',
      onRehydrateStorage: () => state => {
        if (state?.darkMode) document.documentElement.classList.add('dark')
      },
    }
  )
)
