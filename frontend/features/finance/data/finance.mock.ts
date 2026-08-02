import type { Case } from '@/types/case'

export const financeMockCases: Case[] = [
  {
    id: 'case-001',

    title: 'پرونده قرارداد ملکی',

    clientName: 'علی رضایی',

    clientId: 'client-001',

    status: 'open',

    createdAt: new Date('2026-01-10'),

    updatedAt: new Date('2026-02-01'),

    totalAmount: 150000000,

    paidAmount: 90000000,

    remainingAmount: 60000000,

    expenses: [
  {
    amount: 5000000,
  },
],

    dueDate: new Date('2026-08-10'),

    lastPaymentDate: new Date('2026-07-01'),
  },


  {
    id: 'case-002',

    title: 'پرونده کیفری',

    clientName: 'محمد احمدی',

    clientId: 'client-002',

    status: 'in_progress',

    createdAt: new Date('2026-03-12'),

    updatedAt: new Date('2026-05-01'),

    totalAmount: 80000000,

    paidAmount: 30000000,

    remainingAmount: 50000000,

   expenses: [
  {
    amount: 12000000,
  },
],

    dueDate: new Date('2026-06-20'),

    lastPaymentDate: new Date('2026-04-15'),
  },


  {
    id: 'case-003',

    title: 'مشاوره حقوقی',

    clientName: 'سارا کریمی',

    clientId: 'client-003',

    status: 'closed',

    createdAt: new Date('2026-02-10'),

    updatedAt: new Date('2026-04-20'),

    totalAmount: 25000000,

    paidAmount: 25000000,

    remainingAmount: 0,

    expenses: [
  {
    amount: 1000000,
  },
],

    dueDate: new Date('2026-03-10'),

    lastPaymentDate: new Date('2026-03-05'),
  },


  {
    id: 'case-004',

    title: 'دعاوی تجاری',

    clientName: 'شرکت پارس',

    clientId: 'client-004',

    status: 'open',

    createdAt: new Date('2026-04-01'),

    updatedAt: new Date('2026-06-01'),

    totalAmount: 300000000,

    paidAmount: 100000000,

    remainingAmount: 200000000,

       expenses: [
  {
    amount: 25000000,
  },
],

    dueDate: new Date('2026-05-01'),

    lastPaymentDate: new Date('2026-04-10'),
  },
]