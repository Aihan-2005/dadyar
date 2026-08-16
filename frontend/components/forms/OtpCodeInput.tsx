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

  autoFocus?:
    boolean
}



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

export default function OtpCodeInput({
  value,
  onChange,
  length =
    6,
  disabled =
    false,
  autoFocus =
    true,
}: OtpCodeInputProps) {
  const inputRefs =
    useRef<
      Array<
        HTMLInputElement | null
      >
    >([])

 


  const focusIndex =
    (
      index:
        number
    ) => {
      const safeIndex =
        Math.min(
          Math.max(
            index,
            0
          ),
          length - 1
        )

      inputRefs.current[
        safeIndex
      ]?.focus()

      inputRefs.current[
        safeIndex
      ]?.select()
    }




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

      if (
        digits.length ===
        0
      ) {
        const nextValue =
          value.slice(
            0,
            index
          ) +
          value.slice(
            index + 1
          )

        onChange(
          nextValue.slice(
            0,
            length
          )
        )

        return
      }

   


      if (
        digits.length >
        1
      ) {
        const prefix =
          value.slice(
            0,
            index
          )

        const suffix =
          value.slice(
            index +
              digits.length
          )

        const nextValue =
          (
            prefix +
            digits +
            suffix
          ).slice(
            0,
            length
          )

        onChange(
          nextValue
        )

        focusIndex(
          Math.min(
            index +
              digits.length,
            length - 1
          )
        )

        return
      }

      const nextValue =
        (
          value.slice(
            0,
            index
          ) +
          digits[0] +
          value.slice(
            index + 1
          )
        ).slice(
          0,
          length
        )

      onChange(
        nextValue
      )

      if (
        index <
        length - 1
      ) {
        focusIndex(
          index + 1
        )
      }
    }

  


  const handlePaste =
    (
      index:
        number,

      event:
        ClipboardEvent<HTMLInputElement>
    ) => {
      event.preventDefault()

      const pastedDigits =
        normalizeDigits(
          event.clipboardData.getData(
            'text'
          )
        ).slice(
          0,
          length - index
        )

      if (
        pastedDigits.length ===
        0
      ) {
        return
      }

      const nextValue =
        (
          value.slice(
            0,
            index
          ) +
          pastedDigits +
          value.slice(
            index +
              pastedDigits.length
          )
        ).slice(
          0,
          length
        )

      onChange(
        nextValue
      )

      focusIndex(
        Math.min(
          index +
            pastedDigits.length,
          length - 1
        )
      )
    }

 

    

  const handleKeyDown =
    (
      index:
        number,

      event:
        KeyboardEvent<HTMLInputElement>
    ) => {
      if (
        event.key ===
        'Backspace'
      ) {
        if (
          !value[index] &&
          index >
            0
        ) {
          event.preventDefault()

          const previousIndex =
            index - 1

          const nextValue =
            value.slice(
              0,
              previousIndex
            ) +
            value.slice(
              previousIndex +
                1
            )

          onChange(
            nextValue
          )

          focusIndex(
            previousIndex
          )
        }

        return
      }

      if (
        event.key ===
        'ArrowLeft'
      ) {
        event.preventDefault()

        focusIndex(
          index - 1
        )

        return
      }

      if (
        event.key ===
        'ArrowRight'
      ) {
        event.preventDefault()

        focusIndex(
          index + 1
        )
      }
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
              element
            ) => {
              inputRefs.current[
                index
              ] =
                element
            }}
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
            autoFocus={
              autoFocus &&
              index ===
                0
            }
            disabled={
              disabled
            }
            value={
              value[index] ??
              ''
            }
            onChange={(
              event
            ) =>
              handleChange(
                index,
                event
              )
            }
            onPaste={(
              event
            ) =>
              handlePaste(
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
            aria-label={`رقم ${(
              index +
              1
            ).toLocaleString(
              'fa-IR'
            )} کد تأیید`}
            className="h-13 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white text-center text-xl font-black text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 sm:h-14 sm:max-w-14 sm:text-2xl"
          />
        )
      )}
    </div>
  )
}