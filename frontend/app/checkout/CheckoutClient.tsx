'use client'


import {
  useMemo,
  useState,
} from 'react'


import {
  useRouter,
  useSearchParams,
} from 'next/navigation'



import OrderSummary
from '@/components/payment/OrderSummary'


import CouponInput
from '@/components/payment/CouponInput'


import ReferralInput
from '@/components/payment/ReferralInput'



import {

  SUBSCRIPTION_PLANS,

  type SubscriptionPlanKey,

  isSubscriptionPlanKey,

}
from '@/lib/subscription-plans'



import {
  createPayment,
}
from '@/services/payment.service'





export default function CheckoutClient(){



const router =
 useRouter()



const searchParams =
 useSearchParams()



const planParam =
 searchParams.get(
  'plan'
 )



const planKey:
SubscriptionPlanKey | null =

 isSubscriptionPlanKey(planParam)

 ?
 planParam

 :
 null




const plan =
 SUBSCRIPTION_PLANS.find(

  item =>
   item.key === planKey

 )




const [
 coupon,
 setCoupon
] =
useState('')



const [
 referral,
 setReferral
] =
useState('')



const [
 discount,
 setDiscount
] =
useState(0)



const [
 loading,
 setLoading
] =
useState(false)






const finalPrice =
useMemo(()=>{


 if(!plan){

  return 0

 }


 return Math.max(

  plan.price - discount,

  0

 )


},[
 plan,
 discount
])







if(!plan){


return (

<main

dir="rtl"

className="
flex
min-h-screen
items-center
justify-center
bg-slate-100
"

>

<div

className="
rounded-3xl
bg-white
p-10
shadow
"

>


<h1

className="
font-black
"

>

پلن انتخابی پیدا نشد

</h1>


</div>


</main>


)


}







async function handlePayment(){


if(!plan){

 return

}



try{


setLoading(true)



const response =
await createPayment({

 planId:
  plan.key,


 amount:
  finalPrice,


 coupon:
  coupon.trim()
  ||
  undefined,


 referral:
  referral.trim()
  ||
  undefined,

})





if(response.paymentUrl){


 router.push(
  response.paymentUrl
 )


}



}
catch(error){


console.error(
 error
)


}
finally{


setLoading(false)


}


}







return (

<main

dir="rtl"

className="
min-h-screen
bg-slate-100
py-10
"

>


<div

className="
mx-auto
grid
max-w-6xl
gap-8
px-4
lg:grid-cols-2
"

>



<section

className="
space-y-5
"

>


<OrderSummary

title={
 plan.title
}


duration={
 plan.duration
}


price={
 plan.price
}


discount={
 discount
}

/>



<CouponInput

value={
 coupon
}


onChange={
 setCoupon
}


onDiscountChange={
 setDiscount
}

/>



<ReferralInput

value={
 referral
}


onChange={
 setReferral
}

/>



</section>







<section

className="
rounded-3xl
border
border-slate-200
bg-white
p-8
shadow-sm
"

>



<h1

className="
text-2xl
font-black
text-slate-900
"

>

تایید نهایی خرید

</h1>




<p

className="
mt-4
leading-8
text-slate-600
"

>

بعد از تایید، به صفحه پرداخت منتقل می‌شوید.

</p>




<button


type="button"


disabled={
 loading
}



onClick={
 handlePayment
}



className="
mt-8
flex
h-14
w-full
items-center
justify-center
rounded-2xl
bg-blue-600
font-black
text-white
hover:bg-blue-700
disabled:opacity-50
"

>

{

loading

?

'در حال انتقال...'

:

'ادامه پرداخت'

}


</button>




</section>




</div>


</main>


)


}