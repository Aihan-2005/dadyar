import type { CreateCasePayload } from '@/types/case'

function dateFromNow(days: number): string {
  const date = new Date()

  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)

  return date.toISOString()
}

export function createDemoCases(): CreateCasePayload[] {
  return [
    {
      lawyerId: 'demo-lawyer',
      title: 'مطالبه وجه قرارداد تجاری',
      caseNumber: '1405/101',
      status: 'in-progress',

      clients: [
        {
          clientId: 'demo-client-1',
          name: 'علی رضایی',
          phone: '09121234567',
          role: 'خواهان',
        },
      ],

      clientId: 'demo-client-1',
      clientName: 'علی رضایی',
      subject: 'مطالبه وجه',

      contractAmount: 180_000_000,
      totalFee: 180_000_000,
      paidAmount: 80_000_000,
      remainingAmount: 100_000_000,

      cashPayments: [
        {
          id: 'demo-payment-1',
          amount: 80_000_000,
          isPaid: true,
          paymentDate: dateFromNow(-40),
        },
        {
          id: 'demo-payment-2',
          amount: 50_000_000,
          isPaid: false,
          paymentDate: dateFromNow(-10),
        },
        {
          id: 'demo-payment-3',
          amount: 50_000_000,
          isPaid: false,
          paymentDate: dateFromNow(20),
        },
      ],

      expenses: [
        {
          id: 'demo-expense-1',
          title: 'هزینه کارشناسی',
          amount: 8_500_000,
          date: dateFromNow(-15),
          isPaid: true,
        },
      ],

      description:
        'پرونده نمونه برای نمایش ارتباط پرونده و گزارش مالی.',
    },

    {
      lawyerId: 'demo-lawyer',
      title: 'پرونده حقوقی ملک',
      caseNumber: '1405/118',
      status: 'pending',

      clients: [
        {
          clientId: 'demo-client-2',
          name: 'سارا کریمی',
          phone: '09123456789',
          role: 'خواهان',
        },
      ],

      clientId: 'demo-client-2',
      clientName: 'سارا کریمی',
      subject: 'الزام به تنظیم سند رسمی',

      contractAmount: 250_000_000,
      totalFee: 250_000_000,
      paidAmount: 125_000_000,
      remainingAmount: 125_000_000,

      cashPayments: [
        {
          id: 'demo-payment-4',
          amount: 125_000_000,
          isPaid: true,
          paymentDate: dateFromNow(-25),
        },
        {
          id: 'demo-payment-5',
          amount: 125_000_000,
          isPaid: false,
          paymentDate: dateFromNow(30),
        },
      ],

      expenses: [
        {
          id: 'demo-expense-2',
          title: 'هزینه ثبت و استعلام',
          amount: 5_000_000,
          date: dateFromNow(-5),
          isPaid: true,
        },
      ],
    },

    {
      lawyerId: 'demo-lawyer',
      title: 'مشاوره و تنظیم قرارداد مشارکت',
      caseNumber: '1405/126',
      status: 'completed',

      clients: [
        {
          clientId: 'demo-client-3',
          name: 'شرکت پارس آریا',
          role: 'موکل',
        },
      ],

      clientId: 'demo-client-3',
      clientName: 'شرکت پارس آریا',
      subject: 'تنظیم قرارداد',

      contractAmount: 90_000_000,
      totalFee: 90_000_000,
      paidAmount: 90_000_000,
      remainingAmount: 0,

      cashPayments: [
        {
          id: 'demo-payment-6',
          amount: 90_000_000,
          isPaid: true,
          paymentDate: dateFromNow(-12),
        },
      ],

      expenses: [],
      closedAt: dateFromNow(-8),
    },
  ]
}