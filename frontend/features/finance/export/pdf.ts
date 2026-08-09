import type {
  FinanceExportReport,
  FinanceExportRow,
} from './types'

import {
  getFinanceStatusLabel,
} from './report-data'

const PAGE_WIDTH_PX =
  1120

const FIRST_PAGE_ROWS =
  8

const NEXT_PAGE_ROWS =
  14

function formatNumber(
  value: number
): string {
  return value.toLocaleString(
    'fa-IR'
  )
}

function formatMoney(
  value: number
): string {
  return `${formatNumber(
    value
  )} ریال`
}

function formatDate(
  value?: string
): string {
  if (!value) {
    return '—'
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '—'
  }

  return date.toLocaleDateString(
    'fa-IR'
  )
}

function setStyles(
  element: HTMLElement,
  styles:
    Partial<CSSStyleDeclaration>
): void {
  Object.assign(
    element.style,
    styles
  )
}

function createText(
  tag:
    | 'div'
    | 'span'
    | 'p'
    | 'h1'
    | 'h2'
    | 'th'
    | 'td',

  value: string
): HTMLElement {
  const element =
    document.createElement(
      tag
    )

  element.textContent =
    value

  return element
}

function createSummaryCard(
  title: string,
  value: string
): HTMLElement {
  const card =
    document.createElement(
      'div'
    )

  setStyles(card, {
    border:
      '1px solid #e4e4e7',

    borderRadius:
      '12px',

    padding:
      '14px',

    background:
      '#fafafa',
  })

  const label =
    createText(
      'div',
      title
    )

  setStyles(label, {
    fontSize:
      '11px',

    color:
      '#71717a',

    marginBottom:
      '6px',
  })

  const amount =
    createText(
      'div',
      value
    )

  setStyles(amount, {
    fontSize:
      '15px',

    fontWeight:
      '800',

    color:
      '#18181b',
  })

  card.append(
    label,
    amount
  )

  return card
}

function createSummary(
  report: FinanceExportReport
): HTMLElement {
  const wrapper =
    document.createElement(
      'div'
    )

  setStyles(wrapper, {
    display:
      'grid',

    gridTemplateColumns:
      'repeat(4, minmax(0, 1fr))',

    gap:
      '10px',

    marginBottom:
      '20px',
  })

  wrapper.append(
    createSummaryCard(
      report.amountLabel,
      formatMoney(
        report.summary.totalFee
      )
    ),

    createSummaryCard(
      'پرداخت‌شده',
      formatMoney(
        report.summary.totalPaid
      )
    ),

    createSummaryCard(
      'مانده مطالبات',
      formatMoney(
        report.summary
          .totalRemaining
      )
    ),

    createSummaryCard(
      'مطالبات معوق',
      formatMoney(
        report.summary
          .totalOverdue
      )
    ),

    createSummaryCard(
      'هزینه‌ها',
      formatMoney(
        report.summary
          .totalExpenses
      )
    ),

    createSummaryCard(
      'خالص دریافتی',
      formatMoney(
        report.summary
          .netCollected
      )
    ),

    createSummaryCard(
      'نرخ وصول',
      `${report.summary.collectionRate.toLocaleString(
        'fa-IR',
        {
          maximumFractionDigits:
            1,
        }
      )}٪`
    ),

    createSummaryCard(
      'پرونده / موکل',
      `${report.summary.caseCount.toLocaleString(
        'fa-IR'
      )} پرونده - ${report.summary.clientCount.toLocaleString(
        'fa-IR'
      )} موکل`
    )
  )

  return wrapper
}

interface PdfColumn {
  title: string
  width: string

  value:
    (
      row: FinanceExportRow
    ) => string
}

const PDF_COLUMNS:
  PdfColumn[] = [
    {
      title:
        'موکل',

      width:
        '12%',

      value:
        (row) =>
          row.clientName,
    },

    {
      title:
        'پرونده',

      width:
        '9%',

      value:
        (row) =>
          row.caseNumber,
    },

    {
      title:
        'موضوع',

      width:
        '18%',

      value:
        (row) =>
          row.caseTitle,
    },

    {
      title:
        'مبلغ کل',

      width:
        '11%',

      value:
        (row) =>
          formatNumber(
            row.contractAmount
          ),
    },

    {
      title:
        'سهم موکل',

      width:
        '10%',

      value:
        (row) =>
          row.clientShareAmount ===
          undefined
            ? '—'
            : formatNumber(
                row.clientShareAmount
              ),
    },

    {
      title:
        'پرداخت',

      width:
        '10%',

      value:
        (row) =>
          formatNumber(
            row.paidAmount
          ),
    },

    {
      title:
        'مانده',

      width:
        '10%',

      value:
        (row) =>
          formatNumber(
            row.remainingAmount
          ),
    },

    {
      title:
        'معوق',

      width:
        '9%',

      value:
        (row) =>
          formatNumber(
            row.overdueAmount
          ),
    },

    {
      title:
        'وصول',

      width:
        '6%',

      value:
        (row) =>
          `${row.collectionRate.toLocaleString(
            'fa-IR',
            {
              maximumFractionDigits:
                0,
            }
          )}٪`,
    },

    {
      title:
        'وضعیت',

      width:
        '8%',

      value:
        (row) =>
          getFinanceStatusLabel(
            row.status
          ),
    },

    {
      title:
        'سررسید',

      width:
        '9%',

      value:
        (row) =>
          formatDate(
            row.dueDate
          ),
    },
  ]

function createTable(
  rows: FinanceExportRow[]
): HTMLElement {
  const table =
    document.createElement(
      'table'
    )

  setStyles(table, {
    width:
      '100%',

    borderCollapse:
      'collapse',

    tableLayout:
      'fixed',

    fontSize:
      '9.5px',
  })

  const thead =
    document.createElement(
      'thead'
    )

  const headerRow =
    document.createElement(
      'tr'
    )

  for (
    const column of
    PDF_COLUMNS
  ) {
    const th =
      createText(
        'th',
        column.title
      ) as HTMLTableCellElement

    setStyles(th, {
      width:
        column.width,

      padding:
        '9px 5px',

      background:
        '#f4f4f5',

      color:
        '#3f3f46',

      border:
        '1px solid #e4e4e7',

      textAlign:
        'center',

      fontWeight:
        '700',

      wordBreak:
        'break-word',
    })

    headerRow.appendChild(
      th
    )
  }

  thead.appendChild(
    headerRow
  )

  table.appendChild(
    thead
  )

  const tbody =
    document.createElement(
      'tbody'
    )

  for (
    const row of rows
  ) {
    const tr =
      document.createElement(
        'tr'
      )

    for (
      const column of
      PDF_COLUMNS
    ) {
      const td =
        createText(
          'td',
          column.value(row)
        ) as HTMLTableCellElement

      setStyles(td, {
        padding:
          '8px 5px',

        border:
          '1px solid #e4e4e7',

        textAlign:
          'center',

        verticalAlign:
          'middle',

        color:
          '#27272a',

        lineHeight:
          '1.7',

        wordBreak:
          'break-word',
      })

      tr.appendChild(td)
    }

    tbody.appendChild(
      tr
    )
  }

  table.appendChild(
    tbody
  )

  return table
}

function createPdfPage(
  report: FinanceExportReport,
  rows: FinanceExportRow[],
  pageNumber: number,
  totalPages: number,
  showSummary: boolean
): HTMLElement {
  const page =
    document.createElement(
      'section'
    )

  page.dir = 'rtl'

  setStyles(page, {
    width:
      `${PAGE_WIDTH_PX}px`,

    minHeight:
      '720px',

    padding:
      '34px',

    boxSizing:
      'border-box',

    background:
      '#ffffff',

    color:
      '#18181b',

    fontFamily:
      'Vazirmatn, Arial, sans-serif',

    direction:
      'rtl',
  })

  /*
  |--------------------------------------------------------------------------
  | Header
  |--------------------------------------------------------------------------
  */

  const header =
    document.createElement(
      'div'
    )

  setStyles(header, {
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
      '18px',

    borderBottom:
      '2px solid #4f46e5',
  })

  const titleWrapper =
    document.createElement(
      'div'
    )

  const title =
    createText(
      'h1',
      report.title
    )

  setStyles(title, {
    margin:
      '0',

    fontSize:
      '22px',

    fontWeight:
      '900',

    color:
      '#18181b',
  })

  const subtitle =
    createText(
      'p',
      `دادیار - ${report.scopeLabel}`
    )

  setStyles(subtitle, {
    margin:
      '5px 0 0',

    fontSize:
      '12px',

    color:
      '#71717a',
  })

  titleWrapper.append(
    title,
    subtitle
  )

  const date =
    createText(
      'div',
      `تاریخ گزارش: ${new Date(
        report.generatedAt
      ).toLocaleString(
        'fa-IR'
      )}`
    )

  setStyles(date, {
    fontSize:
      '11px',

    color:
      '#71717a',

    textAlign:
      'left',
  })

  header.append(
    titleWrapper,
    date
  )

  page.appendChild(
    header
  )

  if (showSummary) {
    page.appendChild(
      createSummary(report)
    )

    if (
      report.selectedClientNames
        .length > 0
    ) {
      const clients =
        createText(
          'div',
          `موکلین: ${report.selectedClientNames.join(
            '، '
          )}`
        )

      setStyles(clients, {
        marginBottom:
          '14px',

        padding:
          '10px 12px',

        border:
          '1px solid #e0e7ff',

        borderRadius:
          '9px',

        background:
          '#eef2ff',

        fontSize:
          '11px',

        color:
          '#4338ca',
      })

      page.appendChild(
        clients
      )
    }
  }

  page.appendChild(
    createTable(rows)
  )

  /*
  |--------------------------------------------------------------------------
  | Footer
  |--------------------------------------------------------------------------
  */

  const footer =
    createText(
      'div',
      `صفحه ${pageNumber.toLocaleString(
        'fa-IR'
      )} از ${totalPages.toLocaleString(
        'fa-IR'
      )}`
    )

  setStyles(footer, {
    marginTop:
      '14px',

    paddingTop:
      '10px',

    borderTop:
      '1px solid #e4e4e7',

    fontSize:
      '10px',

    color:
      '#a1a1aa',

    textAlign:
      'center',
  })

  page.appendChild(
    footer
  )

  return page
}

function createPageChunks(
  rows: FinanceExportRow[]
): FinanceExportRow[][] {
  if (rows.length === 0) {
    return [[]]
  }

  const result:
    FinanceExportRow[][] = []

  result.push(
    rows.slice(
      0,
      FIRST_PAGE_ROWS
    )
  )

  let cursor =
    FIRST_PAGE_ROWS

  while (
    cursor <
    rows.length
  ) {
    result.push(
      rows.slice(
        cursor,
        cursor +
          NEXT_PAGE_ROWS
      )
    )

    cursor +=
      NEXT_PAGE_ROWS
  }

  return result
}

export async function downloadFinancePdf(
  report: FinanceExportReport
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
  } = jsPdfModule

  if (
    document.fonts?.ready
  ) {
    await document.fonts.ready
  }

  const chunks =
    createPageChunks(
      report.rows
    )

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
    pdf.internal.pageSize
      .getWidth()

  const pageHeight =
    pdf.internal.pageSize
      .getHeight()

  const margin =
    6

  for (
    let index = 0;
    index <
    chunks.length;
    index += 1
  ) {
    if (index > 0) {
      pdf.addPage(
        'a4',
        'landscape'
      )
    }

    const page =
      createPdfPage(
        report,
        chunks[index],
        index + 1,
        chunks.length,
        index === 0
      )

    setStyles(page, {
      position:
        'fixed',

      left:
        '-20000px',

      top:
        '0',

      zIndex:
        '-1',
    })

    document.body.appendChild(
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

      const x =
        (
          pageWidth -
          imageWidth
        ) /
        2

      const y =
        (
          pageHeight -
          imageHeight
        ) /
        2

      pdf.addImage(
        image,
        'JPEG',
        x,
        y,
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