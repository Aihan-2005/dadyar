import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CaseStatus = 'pending' | 'in-progress' | 'completed' | 'archived'

export type Case = {
  id: string
  title: string
  clientName: string
  caseNumber: string
  status: CaseStatus
  createdAt: string
  updatedAt: string
  description?: string
  lawyerId: string
}

type CasesStore = {
  cases: Case[]
  addCase: (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateCase: (id: string, data: Partial<Case>) => void
  deleteCase: (id: string) => void
  getCaseById: (id: string) => Case | undefined
}

export const useCasesStore = create<CasesStore>()(
  persist(
    (set, get) => ({
      cases: [],
      
      addCase: (caseData) => {
        const newCase: Case = {
          ...caseData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ cases: [...state.cases, newCase] }))
      },
      
      updateCase: (id, data) => {
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
          ),
        }))
      },
      
      deleteCase: (id) => {
        set((state) => ({
          cases: state.cases.filter((c) => c.id !== id),
        }))
      },
      
      getCaseById: (id) => {
        return get().cases.find((c) => c.id === id)
      },
    }),
    {
      name: 'cases-storage',
    }
  )
)
