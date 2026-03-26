import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CaseStatus = 'pending' | 'in-progress' | 'completed' | 'archived'
export type PaymentType = 'cash' | 'installment'

export interface Installment {
  amount: number
  isPaid: boolean
  dueDate?: Date
  paidDate?: Date
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
  clientPhone?: string
  caseNumber: string          // شماره پرونده (عمومی)
  archiveNumberOffice?: string  // شماره بایگانی دفتر (ثابت از پروفایل)
  archiveNumberLawyer?: string  // شماره بایگانی وکیل (ثابت از پروفایل)
  archiveNumberBranch?: string  // شماره بایگانی شعبه (وارد شده توسط وکیل)
  courtBranch?: CourtBranch    // شعبه دادگاه
  coLawyerName?: string        // وکیل هم‌رزم
  coLawyerInCase?: string      // وکیل توی رزمه (نفر دیگری در همان پرونده)
  status: CaseStatus
  description?: string
  
  // فیلدهای مالی
  totalFee: number              // مجموع حق‌الوکاله
  paidAmount: number            // مبلغ پرداخت شده
  remainingAmount: number       // مبلغ باقیمانده
  paymentType: PaymentType
  installments?: Installment[]
  dueDate?: Date                // سررسید پرداخت
  
  // تاریخ‌ها
  createdAt: Date
  updatedAt: Date
  closedAt?: Date               // تاریخ بسته شدن پرونده
}

interface CasesStore {
  cases: Case[]
  addCase: (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'remainingAmount'>) => void
  updateCase: (id: string, caseData: Partial<Case>) => void
  deleteCase: (id: string) => void
  getCaseById: (id: string) => Case | undefined
  getActiveCases: () => Case[]
  getPendingCases: () => Case[]
  getMonthlyCases: () => Case[]
  getTotalDebt: () => number
}

// تابع کمکی برای محاسبه مبلغ باقیمانده
const calculateRemainingAmount = (totalFee: number, paidAmount: number): number => {
  return Math.max(0, totalFee - paidAmount)
}

// تابع کمکی برای چک کردن پرونده‌های ماه جاری
const isInCurrentMonth = (date: Date): boolean => {
  const now = new Date()
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
}

export const useCasesStore = create<CasesStore>()(
  persist(
    (set, get) => ({
      cases: [],

      addCase: (caseData) => {
        const remainingAmount = calculateRemainingAmount(caseData.totalFee, caseData.paidAmount)
        
        const newCase: Case = {
          ...caseData,
          id: crypto.randomUUID(),
          remainingAmount,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({ cases: [...state.cases, newCase] }))
      },

      updateCase: (id, caseData) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.id !== id) return c
            
            const updatedCase = { ...c, ...caseData, updatedAt: new Date() }
            
            // اگر totalFee یا paidAmount تغییر کرد، remainingAmount را دوباره محاسبه کن
            if (caseData.totalFee !== undefined || caseData.paidAmount !== undefined) {
              updatedCase.remainingAmount = calculateRemainingAmount(
                updatedCase.totalFee,
                updatedCase.paidAmount
              )
            }
            
            return updatedCase
          }),
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

      // پرونده‌های فعال (غیر بسته شده و غیر آرشیو شده)
      getActiveCases: () => {
        return get().cases.filter(
          (c) => c.status !== 'archived' && !c.closedAt
        )
      },

      // پرونده‌های در انتظار بررسی
      getPendingCases: () => {
        return get().cases.filter((c) => c.status === 'pending')
      },

      // پرونده‌های ثبت شده در ماه جاری
      getMonthlyCases: () => {
        return get().cases.filter((c) => isInCurrentMonth(c.createdAt))
      },

      // مجموع بدهی‌ها
      getTotalDebt: () => {
        return get().cases.reduce((sum, c) => sum + c.remainingAmount, 0)
      },
    }),
    {
      name: 'cases-storage',
    }
  )
)
