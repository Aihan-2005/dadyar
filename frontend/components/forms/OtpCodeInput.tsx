'use client'

import {
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react'

interface OtpCodeInputProps {
  value:
    string

  onChange:
    (
      value:
        string
    ) => void

  length?:
    number

  disabled?:
    boolean
}

/*
|--------------------------------------------------------------------------
| Normalize
|--------------------------------------------------------------------------
*/

function normalizeDigits(
  value:
    string
): string {
  const persianDigits =
    '۰۱۲۳۴۵۶۷۸۹'

  const arabicDigits =
    '٠١٢٣٤٥٦٧٨٩'

  return value
    .replace(
      /[۰-۹]/g,
      (digit) =>
        String(
          persianDigits.indexOf(
            digit
          )
        )
    )
    .replace(
      /[٠-٩]/g,
      (digit) =>
        String(
          arabicDigits.indexOf(
            digit
          )
        )
    )
    .replace(
      /\D/g,
      ''
    )
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function OtpCodeInput({
  value,
  onChange,
  length =
    6,
  disabled =
    false,
}: OtpCodeInputProps) {
  const refs =
    useRef<
      Array<
        HTMLInputElement | null
      >
    >([])

  /*
  |--------------------------------------------------------------------------
  | Focus
  |--------------------------------------------------------------------------
  */

  const focus =
    (
      index:
        number
    ) => {
      const safeIndex =
        Math.max(
          0,
          Math.min(
            length - 1,
            index
          )
        )

      const input =
        refs.current[
          safeIndex
        ]

      input?.focus()
      input?.select()
    }

  /*
  |--------------------------------------------------------------------------
  | Change
  |--------------------------------------------------------------------------
  */

  const handleChange =
    (
      index:
        number,

      event:
        ChangeEvent<HTMLInputElement>
    ) => {
      const digits =
        normalizeDigits(
          event.target.value
        )

      /*
       * Mobile OTP autofill can put all digits
       * into the first field.
       */
      if (
        digits.length >
        1
      ) {
        const next =
          digits.slice(
            0,
            length
          )

        onChange(
          next
        )

        focus(
          Math.min(
            next.length,
            length - 1
          )
        )

        return
      }

      if (
        digits.length ===
        0
      ) {
        const chars =
          value
            .padEnd(
              length,
              ' '
            )
            .split('')

        chars[index] =
          ' '

        onChange(
          chars
            .join('')
            .trimEnd()
        )

        return
      }

      const chars =
        value
          .padEnd(
            length,
            ' '
          )
          .split('')

      chars[index] =
        digits[0]

      onChange(
        chars
          .join('')
          .replace(
            /\s/g,
            ''
          )
          .slice(
            0,
            length
          )
      )

      if (
        index <
        length - 1
      ) {
        focus(
          index + 1
        )
      }
    }

  /*
  |--------------------------------------------------------------------------
  | Backspace
  |--------------------------------------------------------------------------
  */

  const handleKeyDown =
    (
      index:
        number,

      event:
        KeyboardEvent<HTMLInputElement>
    ) => {
      if (
        event.key ===
          'Backspace' &&
        !value[index] &&
        index >
          0
      ) {
        event.preventDefault()

        const chars =
          value.split('')

        chars.splice(
          index - 1,
          1
        )

        onChange(
          chars.join('')
        )

        focus(
          index - 1
        )

        return
      }

      if (
        event.key ===
        'ArrowLeft'
      ) {
        event.preventDefault()

        focus(
          index - 1
        )

        return
      }

      if (
        event.key ===
        'ArrowRight'
      ) {
        event.preventDefault()

        focus(
          index + 1
        )
      }
    }

  /*
  |--------------------------------------------------------------------------
  | Paste
  |--------------------------------------------------------------------------
  */

  const handlePaste =
    (
      event:
        ClipboardEvent<HTMLInputElement>
    ) => {
      event.preventDefault()

      const digits =
        normalizeDigits(
          event.clipboardData.getData(
            'text'
          )
        ).slice(
          0,
          length
        )

      if (!digits) {
        return
      }

      onChange(
        digits
      )

      focus(
        Math.min(
          digits.length,
          length - 1
        )
      )
    }

  return (
    <div
      dir="ltr"
      className="flex w-full items-center justify-center gap-2 sm:gap-3"
    >
      {Array.from({
        length,
      }).map(
        (
          _,
          index
        ) => (
          <input
            key={
              index
            }
            ref={(
              input
            ) => {
              refs.current[
                index
              ] =
                input
            }}
            value={
              value[index] ??
              ''
            }
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete={
              index ===
              0
                ? 'one-time-code'
                : 'off'
            }
            disabled={
              disabled
            }
            aria-label={`رقم ${(
              index +
              1
            ).toLocaleString(
              'fa-IR'
            )} کد ورود`}
            onChange={(
              event
            ) =>
              handleChange(
                index,
                event
              )
            }
            onKeyDown={(
              event
            ) =>
              handleKeyDown(
                index,
                event
              )
            }
            onPaste={
              handlePaste
            }
            className="h-13 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white text-center text-xl font-black text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 sm:h-14 sm:max-w-14 sm:text-2xl"
          />
        )
      )}
    </div>
  )
}