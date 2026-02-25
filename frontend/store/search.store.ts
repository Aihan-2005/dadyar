import { create } from 'zustand'

interface SearchStore {
  query: string
  searchTerm: string
  setQuery: (q: string) => void
  setSearchTerm: (q: string) => void
  clearQuery: () => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  searchTerm: '',

  setQuery: (value) =>
    set({ query: value, searchTerm: value }),

  setSearchTerm: (value) =>
    set({ query: value, searchTerm: value }),

  clearQuery: () =>
    set({ query: '', searchTerm: '' }),
}))