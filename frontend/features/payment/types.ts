export interface CheckoutItem {

  planId:string

  title:string

  duration:string

  price:number

}


export interface DiscountState {

  code:string

  amount:number

}


export interface CheckoutSummary {

  originalPrice:number

  discount:number

  finalPrice:number

}


export interface PaymentResponse {

  success:boolean

  paymentUrl?:string

  invoiceId?:string

  message?:string

}