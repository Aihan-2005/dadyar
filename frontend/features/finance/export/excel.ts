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
  report:
    FinanceExportReport
): Promise<void> {
  const XLSX =
    await import('xlsx')

  const workbook =
    XLSX.utils.book_new()

  workbook.Workbook = {
    Views: [
      {
        RTL: true,
      },
    ],
  }

  /*
  |--------------------------------------------------------------------------
  | Summary
  |--------------------------------------------------------------------------
  */

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
        report.title,
      ],

      [
        'تاریخ ایجاد',
        new Date(
          report.generatedAt
        ).toLocaleString(
          'fa-IR'
        ),
      ],

      [
        'تعداد کل پرونده‌های منبع',
        report.sourceCaseCount,
      ],

      [
        'تعداد پرونده در گزارش',
        report.filteredCaseCount,
      ],

      [
        'تعداد موکل',
        report.stats.clientCount,
      ],

      [
        'ارزش قراردادها',
        report.stats.totalRevenue,
      ],

      [
        'دریافتی',
        report.stats.totalReceived,
      ],

      [
        'مانده',
        report.stats.totalRemaining,
      ],

      [
        'معوق',
        report.stats.totalOverdue,
      ],

      [
        'هزینه‌ها',
        report.stats.totalExpenses,
      ],

      [
        'خالص دریافتی',
        report.stats.netCollected,
      ],

      [
        'نرخ وصول',
        report.stats.collectionRate /
          100,
      ],

      [
        'فیلترهای گزارش',
        report.filterLabels.join(
          ' | '
        ),
      ],
    ]

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
      wch: 28,
    },
    {
      wch: 70,
    },
  ]

  for (
    let rowIndex = 6;
    rowIndex <= 11;
    rowIndex += 1
  ) {
    const address =
      XLSX.utils.encode_cell({
        r: rowIndex,
        c: 1,
      })

    if (
      summarySheet[
        address
      ]
    ) {
      summarySheet[
        address
      ].z = '#,##0'
    }
  }

  const collectionRateCell =
    summarySheet['B13']

  if (
    collectionRateCell
  ) {
    collectionRateCell.z =
      '0.0%'
  }

  XLSX.utils.book_append_sheet(
    workbook,
    summarySheet,
    'خلاصه'
  )

  /*
  |--------------------------------------------------------------------------
  | Management Report
  |--------------------------------------------------------------------------
  */

  if (
    report.mode ===
    'management'
  ) {
    const cashflowSheet =
      XLSX.utils.aoa_to_sheet([
        [
          'ماه',
          'دریافتی',
          'هزینه',
          'خالص',
          'تعداد پرداخت',
          'تعداد هزینه',
        ],

        ...report.cashflow.map(
          (item) => [
            item.label,
            item.received,
            item.expenses,
            item.net,
            item.paymentCount,
            item.expenseCount,
          ]
        ),
      ])

    cashflowSheet['!cols'] = [
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
        wch: 18,
      },
      {
        wch: 18,
      },
    ]

    applyMoneyColumns(
      XLSX,
      cashflowSheet,
      report.cashflow.length,
      [
        1,
        2,
        3,
      ]
    )

    XLSX.utils.book_append_sheet(
      workbook,
      cashflowSheet,
      'جریان نقدی'
    )

    const agingSheet =
      XLSX.utils.aoa_to_sheet([
        [
          'سن مطالبات',
          'مبلغ',
          'تعداد پرونده',
          'درصد',
        ],

        ...report.aging.map(
          (item) => [
            item.label,
            item.amount,
            item.caseCount,
            item.percentage /
              100,
          ]
        ),
      ])

    agingSheet['!cols'] = [
      {
        wch: 26,
      },
      {
        wch: 22,
      },
      {
        wch: 18,
      },
      {
        wch: 14,
      },
    ]

    applyMoneyColumns(
      XLSX,
      agingSheet,
      report.aging.length,
      [1]
    )

    applyPercentColumn(
      XLSX,
      agingSheet,
      report.aging.length,
      3
    )

    XLSX.utils.book_append_sheet(
      workbook,
      agingSheet,
      'سن مطالبات'
    )

    const insightsSheet =
      XLSX.utils.aoa_to_sheet([
        [
          'اولویت',
          'عنوان',
          'توضیح',
          'مبلغ',
          'تعداد',
        ],

        ...report.insights.map(
          (item) => [
            severityLabel(
              item.severity
            ),

            item.title,

            item.description,

            item.amount ?? '',

            item.count ?? '',
          ]
        ),
      ])

    insightsSheet['!cols'] = [
      {
        wch: 18,
      },
      {
        wch: 30,
      },
      {
        wch: 80,
      },
      {
        wch: 22,
      },
      {
        wch: 12,
      },
    ]

    applyMoneyColumns(
      XLSX,
      insightsSheet,
      report.insights.length,
      [3]
    )

    XLSX.utils.book_append_sheet(
      workbook,
      insightsSheet,
      'پیشنهاد اقدامات'
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Cases
  |--------------------------------------------------------------------------
  */

  if (
    report.mode ===
      'cases' ||
    report.mode ===
      'management'
  ) {
    const caseHeaders = [
      'ردیف',
      'شماره پرونده',
      'عنوان پرونده',
      'موکلین',
      'مبلغ قرارداد',
      'دریافتی',
      'مانده',
      'معوق',
      'هزینه',
      'نرخ وصول',
      'وضعیت',
      'سررسید',
      'آخرین پرداخت',
    ]

    const caseRows =
      report.caseRows.map(
        (row, index) => [
          index + 1,

          row.caseNumber,

          row.caseTitle,

          row.clientNames,

          row.contractAmount,

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
        ]
      )

    const caseSheet =
      XLSX.utils.aoa_to_sheet([
        caseHeaders,
        ...caseRows,
      ])

    caseSheet['!cols'] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 36 },
      { wch: 32 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
    ]

    applyMoneyColumns(
      XLSX,
      caseSheet,
      caseRows.length,
      [
        4,
        5,
        6,
        7,
        8,
      ]
    )

    applyPercentColumn(
      XLSX,
      caseSheet,
      caseRows.length,
      9
    )

    addAutoFilter(
      caseSheet
    )

    XLSX.utils.book_append_sheet(
      workbook,
      caseSheet,
      'پرونده‌ها'
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Clients
  |--------------------------------------------------------------------------
  */

  if (
    report.mode ===
      'clients' ||
    report.mode ===
      'management'
  ) {
    const clientRows =
      report.clientRows.map(
        (row, index) => [
          index + 1,

          row.clientName,

          row.caseCount,

          row.totalFee,

          row.totalPaid,

          row.totalRemaining,

          row.totalOverdue,

          row.totalExpenses,

          row.collectionRate /
            100,

          row.estimatedAllocationCases,
        ]
      )

    const clientSheet =
      XLSX.utils.aoa_to_sheet([
        [
          'ردیف',
          'موکل',
          'تعداد پرونده',
          'سهم قرارداد',
          'دریافتی',
          'مانده',
          'معوق',
          'هزینه',
          'نرخ وصول',
          'سهم تخمینی',
        ],

        ...clientRows,
      ])

    clientSheet['!cols'] = [
      { wch: 8 },
      { wch: 28 },
      { wch: 16 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 14 },
      { wch: 16 },
    ]

    applyMoneyColumns(
      XLSX,
      clientSheet,
      clientRows.length,
      [
        3,
        4,
        5,
        6,
        7,
      ]
    )

    applyPercentColumn(
      XLSX,
      clientSheet,
      clientRows.length,
      8
    )

    addAutoFilter(
      clientSheet
    )

    XLSX.utils.book_append_sheet(
      workbook,
      clientSheet,
      'موکلین'
    )

    /*
    |--------------------------------------------------------------------------
    | Client / Case allocations
    |--------------------------------------------------------------------------
    */

    const allocationRows =
      report.clientCaseRows.map(
        (row, index) => [
          index + 1,

          row.clientName,

          row.caseNumber,

          row.caseTitle,

          row.caseContractAmount,

          row.clientShareAmount,

          row.paidAmount,

          row.remainingAmount,

          row.overdueAmount,

          row.expensesAmount,

          row.collectionRate /
            100,

          getFinanceStatusLabel(
            row.status
          ),

          row.allocationEstimated
            ? 'تخمینی'
            : 'ثبت‌شده',

          formatDate(
            row.dueDate
          ),

          formatDate(
            row.lastPaymentDate
          ),
        ]
      )

    const allocationSheet =
      XLSX.utils.aoa_to_sheet([
        [
          'ردیف',
          'موکل',
          'شماره پرونده',
          'عنوان پرونده',
          'مبلغ کل پرونده',
          'سهم موکل',
          'پرداختی',
          'مانده',
          'معوق',
          'هزینه',
          'نرخ وصول',
          'وضعیت',
          'نوع سهم',
          'سررسید',
          'آخرین پرداخت',
        ],

        ...allocationRows,
      ])

    allocationSheet['!cols'] = [
      { wch: 8 },
      { wch: 26 },
      { wch: 20 },
      { wch: 34 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 14 },
      { wch: 18 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
    ]

    applyMoneyColumns(
      XLSX,
      allocationSheet,
      allocationRows.length,
      [
        4,
        5,
        6,
        7,
        8,
        9,
      ]
    )

    applyPercentColumn(
      XLSX,
      allocationSheet,
      allocationRows.length,
      10
    )

    addAutoFilter(
      allocationSheet
    )

    XLSX.utils.book_append_sheet(
      workbook,
      allocationSheet,
      'سهم موکل در پرونده'
    )
  }

  XLSX.writeFileXLSX(
    workbook,
    `${report.fileBaseName}.xlsx`,
    {
      compression: true,
    }
  )
}

function applyMoneyColumns(
  XLSX:
    typeof import('xlsx'),

  sheet:
    import('xlsx').WorkSheet,

  rowCount:
    number,

  columns:
    number[]
) {
  for (
    let row = 1;
    row <= rowCount;
    row += 1
  ) {
    for (
      const column of
      columns
    ) {
      const address =
        XLSX.utils.encode_cell({
          r: row,
          c: column,
        })

      const cell =
        sheet[address]

      if (
        cell &&
        typeof cell.v ===
          'number'
      ) {
        cell.z =
          '#,##0'
      }
    }
  }
}

function applyPercentColumn(
  XLSX:
    typeof import('xlsx'),

  sheet:
    import('xlsx').WorkSheet,

  rowCount:
    number,

  column:
    number
) {
  for (
    let row = 1;
    row <= rowCount;
    row += 1
  ) {
    const address =
      XLSX.utils.encode_cell({
        r: row,
        c: column,
      })

    const cell =
      sheet[address]

    if (cell) {
      cell.z =
        '0.0%'
    }
  }
}

function addAutoFilter(
  sheet:
    import('xlsx').WorkSheet
) {
  if (
    sheet['!ref']
  ) {
    sheet['!autofilter'] = {
      ref:
        sheet['!ref'],
    }
  }
}

function severityLabel(
  value:
    'success'
    | 'info'
    | 'warning'
    | 'critical'
) {
  switch (value) {
    case 'critical':
      return 'بحرانی'

    case 'warning':
      return 'هشدار'

    case 'info':
      return 'اطلاع'

    default:
      return 'مناسب'
  }
}