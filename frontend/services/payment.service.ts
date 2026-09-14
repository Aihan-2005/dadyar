import type {
  PaymentResponse
} from '@/features/payment/types'



export async function createPayment(
  payload:{
    planId:string

    amount:number

    coupon?:string

    referral?:string
  }

):Promise<PaymentResponse>{


    
  console.log(
    'payment payload',
    payload
  )



  return {

    success:true,

    paymentUrl:
      `/payment/result?status=success&plan=${payload.planId}`,

    invoiceId:
      `INV-${Date.now()}`,

    message:
      'پرداخت آزمایشی ایجاد شد'

  }

}