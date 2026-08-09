import type {
  FinanceExportReport,
} from './types'

import {
  getFinanceStatusLabel,
} from './report-data'

function formatDate(
  value?: string
): string {
  if (!value) {
    return ''
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return ''
  }

  return date.toLocaleDateString(
    'fa-IR'
  )
}

export async function downloadFinanceExcel(
  report: FinanceExportReport
): Promise<void> {
  const XLSX =
    await import('xlsx')

  const workbook =
    XLSX.utils.book_new()

  

  const summaryRows:
    Array<
      Array<string | number>
    > = [
      [
        'گزارش مالی دادیار',
        '',
      ],

      [
        'نوع گزارش',
        report.scopeLabel,
      ],

      [
        'تاریخ تهیه گزارش',
        new Date(
          report.generatedAt
        ).toLocaleString(
          'fa-IR'
        ),
      ],

      [
        'تعداد پرونده',
        report.summary
          .caseCount,
      ],

      [
        'تعداد موکل',
        report.summary
          .clientCount,
      ],

      [
        report.amountLabel,
        report.summary
          .totalFee,
      ],

      [
        'مجموع پرداخت‌شده',
        report.summary
          .totalPaid,
      ],

      [
        'مانده مطالبات',
        report.summary
          .totalRemaining,
      ],

      [
        'مطالبات معوق',
        report.summary
          .totalOverdue,
      ],

      [
        'هزینه‌ها',
        report.summary
          .totalExpenses,
      ],

      [
        'خالص دریافتی',
        report.summary
          .netCollected,
      ],

      [
        'نرخ وصول',
        report.summary
          .collectionRate /
          100,
      ],
    ]

  if (
    report.selectedClientNames
      .length > 0
  ) {
    summaryRows.push([
      'موکلین گزارش',
      report.selectedClientNames
        .join('، '),
    ])
  }

  const summarySheet =
    XLSX.utils.aoa_to_sheet(
      summaryRows
    )

  summarySheet['!merges'] = [
    {
      s: {
        r: 0,
        c: 0,
      },

      e: {
        r: 0,
        c: 1,
      },
    },
  ]

  summarySheet['!cols'] = [
    {
      wch: 25,
    },
    {
      wch: 60,
    },
  ]

  
  for (
    let row = 5;
    row <= 10;
    row += 1
  ) {
    const address =
      XLSX.utils.encode_cell({
        r: row,
        c: 1,
      })

    const cell =
      summarySheet[
        address
      ]

    if (cell) {
      cell.z = '#,##0'
    }
  }

  const rateCell =
    summarySheet['B12']

  if (rateCell) {
    rateCell.z = '0.0%'
  }

  XLSX.utils.book_append_sheet(
    workbook,
    summarySheet,
    'خلاصه'
  )

  
  const headers = [
    'ردیف',
    'موکل',
    'شماره پرونده',
    'عنوان پرونده',
    'مبلغ کل پرونده',
    'سهم موکل',
    'پرداخت‌شده',
    'مانده',
    'معوق',
    'هزینه',
    'نرخ وصول',
    'وضعیت',
    'سررسید',
    'آخرین پرداخت',
    'نوع سهم',
  ]

  const detailRows =
    report.rows.map(
      (row, index) => [
        index + 1,

        row.clientName,

        row.caseNumber,

        row.caseTitle,

        row.contractAmount,

        row.clientShareAmount ??
          '',

        row.paidAmount,

        row.remainingAmount,

        row.overdueAmount,

        row.expensesAmount,

        row.collectionRate /
          100,

        getFinanceStatusLabel(
          row.status
        ),

        formatDate(
          row.dueDate
        ),

        formatDate(
          row.lastPaymentDate
        ),

        row.allocationEstimated
          ? 'تخمینی'
          : 'ثبت‌شده',
      ]
    )

  const detailsSheet =
    XLSX.utils.aoa_to_sheet([
      headers,
      ...detailRows,
    ])

  detailsSheet['!cols'] = [
    {
      wch: 8,
    },
    {
      wch: 24,
    },
    {
      wch: 18,
    },
    {
      wch: 34,
    },
    {
      wch: 20,
    },
    {
      wch: 20,
    },
    {
      wch: 20,
    },
    {
      wch: 20,
    },
    {
      wch: 20,
    },
    {
      wch: 20,
    },
    {
      wch: 14,
    },
    {
      wch: 18,
    },
    {
      wch: 18,
    },
    {
      wch: 18,
    },
    {
      wch: 14,
    },
  ]

  if (
    detailsSheet['!ref']
  ) {
    detailsSheet[
      '!autofilter'
    ] = {
      ref:
        detailsSheet[
          '!ref'
        ],
    }
  }

  
  const numberColumns = [
    4,
    5,
    6,
    7,
    8,
    9,
  ]

  for (
    let rowIndex = 1;
    rowIndex <=
    detailRows.length;
    rowIndex += 1
  ) {
    for (
      const columnIndex of
      numberColumns
    ) {
      const address =
        XLSX.utils.encode_cell({
          r: rowIndex,
          c: columnIndex,
        })

      const cell =
        detailsSheet[
          address
        ]

      if (
        cell &&
        typeof cell.v ===
          'number'
      ) {
        cell.z =
          '#,##0'
      }
    }

    const rateAddress =
      XLSX.utils.encode_cell({
        r: rowIndex,
        c: 10,
      })

    const rateCell =
      detailsSheet[
        rateAddress
      ]

    if (rateCell) {
      rateCell.z =
        '0.0%'
    }
  }

  XLSX.utils.book_append_sheet(
    workbook,
    detailsSheet,
    'جزئیات'
  )

  
  workbook.Workbook = {
    Views: [
      {
        RTL: true,
      },
    ],
  }

  XLSX.writeFileXLSX(
    workbook,
    `${report.fileBaseName}.xlsx`,
    {
      compression: true,
    }
  )
}