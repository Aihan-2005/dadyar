'use client'

interface Props {
  title: string
  duration: string
  price: number
  discount: number
}

const priceFormatter =
  new Intl.NumberFormat(
    'fa-IR',
  )

function formatPrice(
  value: number,
): string {
  return `${priceFormatter.format(
    Math.max(
      0,
      value,
    ),
  )} تومان`
}

export default function OrderSummary({
  title,
  duration,
  price,
  discount,
}: Props) {
  const normalizedPrice =
    Math.max(
      0,
      Math.round(
        price,
      ),
    )

  const normalizedDiscount =
    Math.max(
      0,
      Math.round(
        discount,
      ),
    )

  const finalPrice =
    Math.max(
      normalizedPrice -
        normalizedDiscount,
      0,
    )

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">
        خلاصه سفارش
      </h2>

      <div className="mt-5 space-y-4 text-sm text-slate-600">
        <SummaryRow
          label="پلن"
          value={
            title
          }
        />

        <SummaryRow
          label="مدت"
          value={
            duration
          }
        />

        <SummaryRow
          label="مبلغ"
          value={
            formatPrice(
              normalizedPrice,
            )
          }
        />

        {
          normalizedDiscount >
            0 &&
          (
            <SummaryRow
              label="تخفیف"
              value={`-${formatPrice(
                normalizedDiscount,
              )}`}
              accent
            />
          )
        }

        <hr className="border-slate-200" />

        <div className="flex items-center justify-between gap-4 text-lg font-black text-slate-950">
          <span>
            مبلغ نهایی
          </span>

          <strong>
            {
              formatPrice(
                finalPrice,
              )
            }
          </strong>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div
      className={`flex justify-between gap-4 ${
        accent
          ? 'text-emerald-600'
          : ''
      }`}
    >
      <span>
        {
          label
        }
      </span>

      <strong className="text-left">
        {
          value
        }
      </strong>
    </div>
  )
}