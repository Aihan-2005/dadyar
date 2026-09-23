export type LawyerSubscriptionStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'CANCELLED'


export type LawyerSubscriptionActivationSource =
  | 'TRIAL'
  | 'ADMIN'
  | 'PAYMENT'


export type LawyerSubscriptionFeatureCode =
  string


export interface LawyerSubscriptionPlanSnapshot {
  title:
    string

  description:
    string

  tier:
    string

  tags:
    string[]

  durationDays:
    number
 
  durationMonths:
    number

  price:
    number

  discountPercent:
    number

  features:
    LawyerSubscriptionFeatureCode[]
}


export interface LawyerSubscription {
  id:
    string

  lawyerId:
    string

 
  planId:
    string | null

  planSnapshot:
    LawyerSubscriptionPlanSnapshot

  startsAt:
    string

  endsAt:
    string

  cancelledAt:
    string | null

  activationSource:
    LawyerSubscriptionActivationSource

  activatedByUserId:
    string | null

  createdAt:
    string

  updatedAt:
    string

  status:
    LawyerSubscriptionStatus
}