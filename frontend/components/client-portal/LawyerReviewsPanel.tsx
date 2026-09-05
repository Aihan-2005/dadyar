'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  BadgeCheck,
  MessageCircle,
  Send,
  Star,
} from 'lucide-react'

import ClientAuthGateModal from '@/components/client-portal/ClientAuthGateModal'

import {
  getCurrentClientPortalAccount,
  type ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import type {
  ClientPortalLawyer,
} from '@/features/client-portal/types/lawyer'

import type {
  LawyerMarketplaceProfile,
  LawyerReview,
} from '@/features/client-portal/types/marketplace'

interface LawyerReviewsPanelProps {
  lawyer: ClientPortalLawyer
  profile: LawyerMarketplaceProfile
}

const MAX_COMMENT_LENGTH =
  600

function storageKey(
  lawyerId: string
): string {
  return `dadyar:client-portal:reviews:${lawyerId}`
}

function readStoredReviews(
  lawyerId: string
): LawyerReview[] {
  if (
    typeof window ===
    'undefined'
  ) {
    return []
  }

  try {
    const raw =
      window.sessionStorage.getItem(
        storageKey(
          lawyerId
        )
      )

    if (!raw) {
      return []
    }

    const parsed: unknown =
      JSON.parse(raw)

    return Array.isArray(parsed)
      ? parsed as LawyerReview[]
      : []
  } catch {
    return []
  }
}

function saveStoredReviews(
  lawyerId: string,
  reviews: LawyerReview[]
): void {
  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  window.sessionStorage.setItem(
    storageKey(
      lawyerId
    ),
    JSON.stringify(
      reviews
    )
  )
}

export default function LawyerReviewsPanel({
  lawyer,
  profile,
}: LawyerReviewsPanelProps) {
  const [
    localReviews,
    setLocalReviews,
  ] =
    useState<LawyerReview[]>(
      []
    )

  const [
    rating,
    setRating,
  ] =
    useState(5)

  const [
    comment,
    setComment,
  ] =
    useState('')

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    )

  const [
    submitted,
    setSubmitted,
  ] =
    useState(false)

  const [
    authOpen,
    setAuthOpen,
  ] =
    useState(false)

  useEffect(() => {
    setLocalReviews(
      readStoredReviews(
        lawyer.id
      )
    )

    setRating(5)
    setComment('')
    setError(null)
    setSubmitted(false)
    setAuthOpen(false)
  }, [
    lawyer.id,
  ])

  const reviews =
    useMemo(
      () => [
        ...localReviews,
        ...profile.reviews,
      ],
      [
        localReviews,
        profile.reviews,
      ]
    )

  const averageRating =
    useMemo(
      () => {
        if (!reviews.length) {
          return 0
        }

        return (
          reviews.reduce(
            (
              sum,
              review
            ) =>
              sum +
              review.rating,
            0
          ) /
          reviews.length
        )
      },
      [reviews]
    )

  const finalizeReview =
    (
      account:
        ClientPortalAccount
    ) => {
      const normalizedComment =
        comment.trim()

      const review:
        LawyerReview = {
          id:
            typeof crypto !==
              'undefined' &&
            typeof crypto.randomUUID ===
              'function'
              ? crypto.randomUUID()
              : `review-${Date.now()}`,

          lawyerId:
            lawyer.id,

          authorName:
            account.fullName,

          rating,

          comment:
            normalizedComment,

          createdAtLabel:
            'همین حالا',

          verifiedClient:
            false,
        }

      const next = [
        review,
        ...localReviews,
      ]

      setLocalReviews(
        next
      )

      saveStoredReviews(
        lawyer.id,
        next
      )

      setComment('')
      setRating(5)
      setSubmitted(true)
      setAuthOpen(false)

      window.setTimeout(
        () =>
          setSubmitted(false),
        3000
      )
    }

  const submitReview =
    () => {
      setError(null)

      if (
        comment.trim().length <
        10
      ) {
        setError(
          'نظر شما باید حداقل ۱۰ کاراکتر باشد.'
        )

        return
      }

      const account =
        getCurrentClientPortalAccount()

      if (!account) {
        setAuthOpen(true)
        return
      }

      finalizeReview(
        account
      )
    }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MessageCircle
                size={19}
                className="text-blue-600"
              />

              <h3 className="text-lg font-black">
                نظرات درباره
                {' '}
                {lawyer.fullName}
              </h3>
            </div>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              تجربه کاربران از ارتباط با این وکیل
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 px-4 py-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-700">
              <Star
                size={17}
                fill="currentColor"
              />

              <span className="text-lg font-black">
                {averageRating.toLocaleString(
                  'fa-IR',
                  {
                    minimumFractionDigits:
                      1,
                    maximumFractionDigits:
                      1,
                  }
                )}
              </span>
            </div>

            <p className="text-[11px] font-bold text-slate-500">
              {reviews.length.toLocaleString(
                'fa-IR'
              )}
              {' '}
              نظر
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {reviews.map(
            (review) => (
              <article
                key={
                  review.id
                }
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black">
                        {review.authorName}
                      </p>

                      {review.verifiedClient && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-700">
                          <BadgeCheck
                            size={12}
                          />

                          موکل تأییدشده
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {review.createdAtLabel}
                    </p>
                  </div>

                  <div
                    dir="ltr"
                    className="flex gap-0.5"
                  >
                    {Array.from({
                      length: 5,
                    }).map(
                      (
                        _,
                        index
                      ) => (
                        <Star
                          key={
                            index
                          }
                          size={14}
                          fill={
                            index <
                            review.rating
                              ? 'currentColor'
                              : 'none'
                          }
                          className={
                            index <
                            review.rating
                              ? 'text-amber-500'
                              : 'text-slate-300'
                          }
                        />
                      )
                    )}
                  </div>
                </div>

                <p className="mt-3 text-sm font-medium leading-7 text-slate-700">
                  {review.comment}
                </p>
              </article>
            )
          )}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <h4 className="font-black">
            نظر شما
          </h4>

          <div
            dir="ltr"
            className="mt-3 flex w-fit gap-1"
          >
            {[1, 2, 3, 4, 5].map(
              (value) => (
                <button
                  key={
                    value
                  }
                  type="button"
                  onClick={() =>
                    setRating(
                      value
                    )
                  }
                  className="p-1"
                >
                  <Star
                    size={25}
                    fill={
                      value <=
                      rating
                        ? 'currentColor'
                        : 'none'
                    }
                    className={
                      value <=
                      rating
                        ? 'text-amber-500'
                        : 'text-slate-300'
                    }
                  />
                </button>
              )
            )}
          </div>

          <textarea
            rows={3}
            value={
              comment
            }
            onChange={(
              event
            ) => {
              setComment(
                event.target.value.slice(
                  0,
                  MAX_COMMENT_LENGTH
                )
              )

              setError(null)
            }}
            placeholder="نظر خود را بنویسید..."
            className="mt-3 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <div className="mt-1 flex justify-between">
            <div>
              {error && (
                <p className="text-xs font-bold text-red-600">
                  {error}
                </p>
              )}

              {submitted && (
                <p className="text-xs font-black text-emerald-600">
                  نظر شما ثبت شد.
                </p>
              )}
            </div>

            <span className="text-[11px] text-slate-400">
              {comment.length.toLocaleString(
                'fa-IR'
              )}
              {' / '}
              {MAX_COMMENT_LENGTH.toLocaleString(
                'fa-IR'
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={
              submitReview
            }
            className="mt-3 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-black text-white"
          >
            <Send
              size={16}
            />

            ثبت نظر
          </button>
        </div>
      </section>

      <ClientAuthGateModal
        open={
          authOpen
        }
        title="برای ثبت نظر وارد شوید"
        onClose={() =>
          setAuthOpen(
            false
          )
        }
        onAuthenticated={
          finalizeReview
        }
      />
    </>
  )
}