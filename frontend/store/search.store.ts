
import { create } from 'zustand'

interface SearchStore {
  searchTerm: string
  setSearchTerm: (term: string) => void
  clearSearch: () => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
  clearSearch: () => set({ searchTerm: '' })
}))