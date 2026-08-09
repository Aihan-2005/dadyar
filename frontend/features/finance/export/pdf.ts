

import type {
  FinanceExportReport,
} from './types'

import {
  getFinanceStatusLabel,
} from './report-data'

const PAGE_WIDTH_PX =
  1120

interface TableColumn<T> {
  title: string

  value: (
    row: T
  ) => string
}

function money(
  value: number
) {
  return `${value.toLocaleString(
    'fa-IR'
  )} ریال`
}

function date(
  value?: string
) {
  if (!value) {
    return '—'
  }

  const parsed =
    new Date(value)

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return '—'
  }

  return parsed.toLocaleDateString(
    'fa-IR'
  )
}

function percentage(
  value: number
) {
  return `${value.toLocaleString(
    'fa-IR',
    {
      maximumFractionDigits:
        1,
    }
  )}٪`
}

function createElement(
  tag:
    keyof HTMLElementTagNameMap,

  text?: string
) {
  const element =
    document.createElement(
      tag
    )

  if (
    text !== undefined
  ) {
    element.textContent =
      text
  }

  return element
}

function styles(
  element:
    HTMLElement,

  values:
    Partial<CSSStyleDeclaration>
) {
  Object.assign(
    element.style,
    values
  )
}

function createBasePage(
  report:
    FinanceExportReport,

  pageNumber: number
) {
  const page =
    createElement(
      'section'
    )

  page.dir =
    'rtl'

  styles(page, {
    width:
      `${PAGE_WIDTH_PX}px`,

    minHeight:
      '720px',

    boxSizing:
      'border-box',

    padding:
      '34px',

    background:
      '#ffffff',

    color:
      '#18181b',

    direction:
      'rtl',

    fontFamily:
      'Vazirmatn, Arial, sans-serif',
  })

  const header =
    createElement(
      'header'
    )

  styles(header, {
    display:
      'flex',

    justifyContent:
      'space-between',

    alignItems:
      'flex-start',

    gap:
      '20px',

    paddingBottom:
      '16px',

    marginBottom:
      '20px',

    borderBottom:
      '2px solid #4f46e5',
  })

  const titleBox =
    createElement(
      'div'
    )

  const title =
    createElement(
      'h1',
      report.title
    )

  styles(title, {
    margin: '0',

    fontSize:
      '22px',

    fontWeight:
      '900',
  })

  const subtitle =
    createElement(
      'p',
      'دادیار — سامانه مدیریت حقوقی'
    )

  styles(subtitle, {
    margin:
      '6px 0 0',

    fontSize:
      '11px',

    color:
      '#71717a',
  })

  titleBox.append(
    title,
    subtitle
  )

  const meta =
    createElement(
      'div'
    )

  styles(meta, {
    textAlign:
      'left',

    fontSize:
      '10px',

    lineHeight:
      '1.9',

    color:
      '#71717a',
  })

  const generated =
    createElement(
      'div',

      `تاریخ گزارش: ${new Date(
        report.generatedAt
      ).toLocaleString(
        'fa-IR'
      )}`
    )

  const pageText =
    createElement(
      'div',

      `صفحه ${pageNumber.toLocaleString(
        'fa-IR'
      )}`
    )

  meta.append(
    generated,
    pageText
  )

  header.append(
    titleBox,
    meta
  )

  page.append(
    header
  )

  return page
}

function createFilterBox(
  report:
    FinanceExportReport
) {
  const box =
    createElement(
      'div'
    )

  styles(box, {
    padding:
      '12px',

    marginBottom:
      '18px',

    border:
      '1px solid #e0e7ff',

    borderRadius:
      '10px',

    background:
      '#eef2ff',
  })

  const title =
    createElement(
      'div',
      'فیلترهای اعمال‌شده'
    )

  styles(title, {
    marginBottom:
      '7px',

    fontSize:
      '11px',

    fontWeight:
      '800',

    color:
      '#4338ca',
  })

  const text =
    createElement(
      'div',

      report.filterLabels.join(
        ' • '
      )
    )

  styles(text, {
    fontSize:
      '10px',

    lineHeight:
      '1.8',

    color:
      '#4f46e5',
  })

  box.append(
    title,
    text
  )

  return box
}

function createSummary(
  report:
    FinanceExportReport
) {
  const grid =
    createElement(
      'div'
    )

  styles(grid, {
    display:
      'grid',

    gridTemplateColumns:
      'repeat(4, 1fr)',

    gap:
      '10px',

    marginBottom:
      '20px',
  })

  const items:
    Array<
      [string, string]
    > = [
      [
        'ارزش قراردادها',
        money(
          report.stats.totalRevenue
        ),
      ],

      [
        'دریافتی',
        money(
          report.stats.totalReceived
        ),
      ],

      [
        'مانده',
        money(
          report.stats.totalRemaining
        ),
      ],

      [
        'معوق',
        money(
          report.stats.totalOverdue
        ),
      ],

      [
        'هزینه',
        money(
          report.stats.totalExpenses
        ),
      ],

      [
        'خالص دریافتی',
        money(
          report.stats.netCollected
        ),
      ],

      [
        'نرخ وصول',
        percentage(
          report.stats.collectionRate
        ),
      ],

      [
        'پرونده / موکل',
        `${report.filteredCaseCount.toLocaleString(
          'fa-IR'
        )} پرونده · ${report.stats.clientCount.toLocaleString(
          'fa-IR'
        )} موکل`,
      ],
    ]

  items.forEach(
    (
      [
        label,
        value,
      ]
    ) => {
      const card =
        createElement(
          'div'
        )

      styles(card, {
        border:
          '1px solid #e4e4e7',

        borderRadius:
          '10px',

        padding:
          '12px',

        background:
          '#fafafa',
      })

      const labelElement =
        createElement(
          'div',
          label
        )

      styles(
        labelElement,
        {
          fontSize:
            '10px',

          color:
            '#71717a',
        }
      )

      const valueElement =
        createElement(
          'div',
          value
        )

      styles(
        valueElement,
        {
          marginTop:
            '6px',

          fontSize:
            '14px',

          fontWeight:
            '900',
        }
      )

      card.append(
        labelElement,
        valueElement
      )

      grid.append(
        card
      )
    }
  )

  return grid
}

function createTable<T>(
  rows: T[],

  columns:
    Array<
      TableColumn<T>
    >
) {
  const table =
    createElement(
      'table'
    ) as HTMLTableElement

  styles(table, {
    width:
      '100%',

    borderCollapse:
      'collapse',

    tableLayout:
      'fixed',

    fontSize:
      '9px',
  })

  const thead =
    createElement(
      'thead'
    )

  const tr =
    createElement(
      'tr'
    )

  columns.forEach(
    (column) => {
      const th =
        createElement(
          'th',
          column.title
        )

      styles(th, {
        padding:
          '8px 5px',

        border:
          '1px solid #e4e4e7',

        background:
          '#f4f4f5',

        fontWeight:
          '800',

        textAlign:
          'center',

        color:
          '#52525b',
      })

      tr.append(
        th
      )
    }
  )

  thead.append(
    tr
  )

  table.append(
    thead
  )

  const tbody =
    createElement(
      'tbody'
    )

  rows.forEach(
    (row) => {
      const tr =
        createElement(
          'tr'
        )

      columns.forEach(
        (column) => {
          const td =
            createElement(
              'td',
              column.value(
                row
              )
            )

          styles(td, {
            padding:
              '7px 5px',

            border:
              '1px solid #e4e4e7',

            textAlign:
              'center',

            verticalAlign:
              'middle',

            lineHeight:
              '1.7',

            wordBreak:
              'break-word',
          })

          tr.append(
            td
          )
        }
      )

      tbody.append(
        tr
      )
    }
  )

  table.append(
    tbody
  )

  return table
}

function sectionTitle(
  value: string
) {
  const title =
    createElement(
      'h2',
      value
    )

  styles(title, {
    margin:
      '0 0 12px',

    fontSize:
      '15px',

    fontWeight:
      '900',
  })

  return title
}

function chunk<T>(
  values: T[],
  size: number
): T[][] {
  const result: T[][] =
    []

  for (
    let index = 0;
    index <
    values.length;
    index += size
  ) {
    result.push(
      values.slice(
        index,
        index +
          size
      )
    )
  }

  return result.length >
    0
    ? result
    : [[]]
}

function buildPages(
  report:
    FinanceExportReport
) {
  const pages:
    HTMLElement[] = []

  let pageNumber = 1


  const firstPage =
    createBasePage(
      report,
      pageNumber++
    )

  firstPage.append(
    createFilterBox(
      report
    ),

    createSummary(
      report
    )
  )

  if (
    report.mode ===
    'management'
  ) {
    firstPage.append(
      sectionTitle(
        'پیشنهاد اقدامات'
      )
    )

    report.insights
      .slice(
        0,
        5
      )
      .forEach(
        (item) => {
          const insight =
            createElement(
              'div'
            )

          styles(
            insight,
            {
              padding:
                '9px 11px',

              marginBottom:
                '7px',

              border:
                '1px solid #e4e4e7',

              borderRadius:
                '8px',

              fontSize:
                '10px',

              lineHeight:
                '1.7',
            }
          )

          const title =
            createElement(
              'strong',
              item.title
            )

          const desc =
            createElement(
              'span',
              ` — ${item.description}`
            )

          insight.append(
            title,
            desc
          )

          firstPage.append(
            insight
          )
        }
      )
  }

  pages.push(
    firstPage
  )



  if (
    report.mode ===
      'cases' ||
    report.mode ===
      'management'
  ) {
    const columns:
      Array<
        TableColumn<
          FinanceExportReport['caseRows'][number]
        >
      > = [
        {
          title:
            'پرونده',

          value:
            (row) =>
              row.caseNumber,
        },

        {
          title:
            'عنوان',

          value:
            (row) =>
              row.caseTitle,
        },

        {
          title:
            'موکلین',

          value:
            (row) =>
              row.clientNames,
        },

        {
          title:
            'قرارداد',

          value:
            (row) =>
              money(
                row.contractAmount
              ),
        },

        {
          title:
            'دریافتی',

          value:
            (row) =>
              money(
                row.paidAmount
              ),
        },

        {
          title:
            'مانده',

          value:
            (row) =>
              money(
                row.remainingAmount
              ),
        },

        {
          title:
            'معوق',

          value:
            (row) =>
              money(
                row.overdueAmount
              ),
        },

        {
          title:
            'وضعیت',

          value:
            (row) =>
              getFinanceStatusLabel(
                row.status
              ),
        },

        {
          title:
            'سررسید',

          value:
            (row) =>
              date(
                row.dueDate
              ),
        },
      ]

    for (
      const rows of
      chunk(
        report.caseRows,
        11
      )
    ) {
      const page =
        createBasePage(
          report,
          pageNumber++
        )

      page.append(
        sectionTitle(
          'جزئیات پرونده‌ها'
        ),

        createTable(
          rows,
          columns
        )
      )

      pages.push(
        page
      )
    }
  }



  if (
    report.mode ===
      'clients' ||
    report.mode ===
      'management'
  ) {
    const columns:
      Array<
        TableColumn<
          FinanceExportReport['clientRows'][number]
        >
      > = [
        {
          title:
            'موکل',

          value:
            (row) =>
              row.clientName,
        },

        {
          title:
            'پرونده',

          value:
            (row) =>
              row.caseCount.toLocaleString(
                'fa-IR'
              ),
        },

        {
          title:
            'سهم قرارداد',

          value:
            (row) =>
              money(
                row.totalFee
              ),
        },

        {
          title:
            'دریافتی',

          value:
            (row) =>
              money(
                row.totalPaid
              ),
        },

        {
          title:
            'مانده',

          value:
            (row) =>
              money(
                row.totalRemaining
              ),
        },

        {
          title:
            'معوق',

          value:
            (row) =>
              money(
                row.totalOverdue
              ),
        },

        {
          title:
            'وصول',

          value:
            (row) =>
              percentage(
                row.collectionRate
              ),
        },
      ]

    for (
      const rows of
      chunk(
        report.clientRows,
        13
      )
    ) {
      const page =
        createBasePage(
          report,
          pageNumber++
        )

      page.append(
        sectionTitle(
          'خلاصه مالی موکلین'
        ),

        createTable(
          rows,
          columns
        )
      )

      pages.push(
        page
      )
    }

    const allocationColumns:
      Array<
        TableColumn<
          FinanceExportReport['clientCaseRows'][number]
        >
      > = [
        {
          title:
            'موکل',

          value:
            (row) =>
              row.clientName,
        },

        {
          title:
            'پرونده',

          value:
            (row) =>
              row.caseNumber,
        },

        {
          title:
            'مبلغ پرونده',

          value:
            (row) =>
              money(
                row.caseContractAmount
              ),
        },

        {
          title:
            'سهم موکل',

          value:
            (row) =>
              money(
                row.clientShareAmount
              ),
        },

        {
          title:
            'پرداخت',

          value:
            (row) =>
              money(
                row.paidAmount
              ),
        },

        {
          title:
            'مانده',

          value:
            (row) =>
              money(
                row.remainingAmount
              ),
        },

        {
          title:
            'معوق',

          value:
            (row) =>
              money(
                row.overdueAmount
              ),
        },

        {
          title:
            'نوع سهم',

          value:
            (row) =>
              row.allocationEstimated
                ? 'تخمینی'
                : 'ثبت‌شده',
        },
      ]

    for (
      const rows of
      chunk(
        report.clientCaseRows,
        12
      )
    ) {
      const page =
        createBasePage(
          report,
          pageNumber++
        )

      page.append(
        sectionTitle(
          'سهم موکلین در پرونده‌ها'
        ),

        createTable(
          rows,
          allocationColumns
        )
      )

      pages.push(
        page
      )
    }
  }

 

  if (
    report.mode ===
    'management'
  ) {
    const page =
      createBasePage(
        report,
        pageNumber++
      )

    page.append(
      sectionTitle(
        'جریان نقدی'
      ),

      createTable(
        report.cashflow,
        [
          {
            title:
              'ماه',

            value:
              (row) =>
                row.label,
          },

          {
            title:
              'دریافتی',

            value:
              (row) =>
                money(
                  row.received
                ),
          },

          {
            title:
              'هزینه',

            value:
              (row) =>
                money(
                  row.expenses
                ),
          },

          {
            title:
              'خالص',

            value:
              (row) =>
                money(
                  row.net
                ),
          },

          {
            title:
              'پرداخت',

            value:
              (row) =>
                row.paymentCount.toLocaleString(
                  'fa-IR'
                ),
          },
        ]
      ),

      sectionTitle(
        'سن مطالبات'
      ),

      createTable(
        report.aging,
        [
          {
            title:
              'دسته',

            value:
              (row) =>
                row.label,
          },

          {
            title:
              'مبلغ',

            value:
              (row) =>
                money(
                  row.amount
                ),
          },

          {
            title:
              'پرونده',

            value:
              (row) =>
                row.caseCount.toLocaleString(
                  'fa-IR'
                ),
          },

          {
            title:
              'درصد',

            value:
              (row) =>
                percentage(
                  row.percentage
                ),
          },
        ]
      )
    )

    pages.push(
      page
    )
  }

  return pages
}

export async function downloadFinancePdf(
  report:
    FinanceExportReport
): Promise<void> {
  if (
    typeof window ===
    'undefined'
  ) {
    throw new Error(
      'ساخت PDF فقط در مرورگر امکان‌پذیر است.'
    )
  }

  const [
    html2canvasModule,
    jsPdfModule,
  ] = await Promise.all([
    import(
      'html2canvas'
    ),

    import(
      'jspdf'
    ),
  ])

  const html2canvas =
    html2canvasModule.default

  const {
    jsPDF,
  } =
    jsPdfModule

  if (
    document.fonts
      ?.ready
  ) {
    await document.fonts.ready
  }

  const pages =
    buildPages(report)

  const pdf =
    new jsPDF({
      orientation:
        'landscape',

      unit:
        'mm',

      format:
        'a4',

      compress:
        true,
    })

  const pageWidth =
    pdf.internal.pageSize.getWidth()

  const pageHeight =
    pdf.internal.pageSize.getHeight()

  for (
    let index = 0;
    index <
    pages.length;
    index += 1
  ) {
    if (
      index > 0
    ) {
      pdf.addPage(
        'a4',
        'landscape'
      )
    }

    const page =
      pages[index]

    styles(page, {
      position:
        'fixed',

      left:
        '-20000px',

      top:
        '0',

      zIndex:
        '-100',
    })

    document.body.append(
      page
    )

    try {
      const canvas =
        await html2canvas(
          page,
          {
            scale:
              1.5,

            backgroundColor:
              '#ffffff',

            logging:
              false,

            useCORS:
              true,

            windowWidth:
              PAGE_WIDTH_PX,
          }
        )

      const image =
        canvas.toDataURL(
          'image/jpeg',
          0.94
        )

      const margin =
        6

      const availableWidth =
        pageWidth -
        margin * 2

      const availableHeight =
        pageHeight -
        margin * 2

      const scale =
        Math.min(
          availableWidth /
            canvas.width,

          availableHeight /
            canvas.height
        )

      const imageWidth =
        canvas.width *
        scale

      const imageHeight =
        canvas.height *
        scale

      pdf.addImage(
        image,
        'JPEG',

        (
          pageWidth -
          imageWidth
        ) /
          2,

        (
          pageHeight -
          imageHeight
        ) /
          2,

        imageWidth,

        imageHeight,

        undefined,

        'FAST'
      )
    } finally {
      page.remove()
    }
  }

  pdf.save(
    `${report.fileBaseName}.pdf`
  )
}