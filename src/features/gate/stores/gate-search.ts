import { create } from 'zustand'

interface GateSearchState {
  /** Topbar search box value, consumed by the overview table filter. */
  query: string
  setQuery: (query: string) => void
}

export const useGateSearch = create<GateSearchState>()((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
}))
