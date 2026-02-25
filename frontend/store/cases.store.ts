import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CaseStatus = 'pending' | 'in-progress' | 'completed' | 'archived'
export type PaymentType = 'cash' | 'installment'

export interface Installment {
  amount: number
  isPaid: boolean
  dueDate?: Date
}

export interface CourtBranch {
  branchNumber: string   // شماره شعبه
  courtName: string      // اسم دادگاه
  city: string           // اسم شهر
}

export interface Case {
  id: string
  lawyerId: string
  title: string
  clientName: string
  caseNumber: string          // شماره پرونده (عمومی)
  archiveNumberOffice?: string  // شماره بایگانی دفتر (ثابت از پروفایل)
  archiveNumberLawyer?: string  // شماره بایگانی وکیل (ثابت از پروفایل)
  archiveNumberBranch?: string  // شماره بایگانی شعبه (وارد شده توسط وکیل)
  courtBranch?: CourtBranch    // شعبه دادگاه
  coLawyerName?: string        // وکیل هم‌رزم
  coLawyerInCase?: string      // وکیل توی رزمه (نفر دیگری در همان پرونده)
  status: CaseStatus
  description?: string
  totalAmount: number
  paymentType: PaymentType
  installments?: Installment[]
  createdAt: Date
  updatedAt: Date
}

interface CasesStore {
  cases: Case[]
  addCase: (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateCase: (id: string, caseData: Partial<Case>) => void
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
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({ cases: [...state.cases, newCase] }))
      },

      updateCase: (id, caseData) => {
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id ? { ...c, ...caseData, updatedAt: new Date() } : c
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
