export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REVERSED'


export type PaymentFulfillmentStatus =
  | 'PENDING'
  | 'FULFILLED'
  | 'REQUIRES_ACTION'
  | 'NOT_APPLICABLE'


export interface CreateSubscriptionPaymentResult {
  paymentId:
    string

  redirectUrl:
    string

  amount:
    number

  currency:
    string
}


export interface LawyerPaymentPlan {
  id:
    string

  title:
    string

  tier:
    string

  durationMonths:
    number | null
}


export interface LawyerPayment {
  id:
    string

  plan:
    LawyerPaymentPlan

  amount:
    number

  currency:
    string

  status:
    PaymentStatus

  fulfillmentStatus:
    PaymentFulfillmentStatus

  referenceId:
    string | null

  cardPan:
    string | null

  paidAt:
    string | null

  cancelledAt:
    string | null

  failedAt:
    string | null

  reversedAt:
    string | null

  createdAt:
    string
}


export interface CheckoutItem {
  planId:
    string

  title:
    string

  duration:
    string

  price:
    number
}


export interface DiscountState {
  code:
    string

  amount:
    number
}


export interface CheckoutSummary {
  originalPrice:
    number

  discount:
    number

  finalPrice:
    number
}


export interface PaymentResponse {
  success:
    boolean

  paymentUrl?:
    string

  invoiceId?:
    string

  message?:
    string
}

