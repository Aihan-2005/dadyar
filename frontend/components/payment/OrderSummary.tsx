'use client'


interface Props {

 title:string

 duration:string

 price:number

 discount:number

}



export default function OrderSummary({

 title,

 duration,

 price,

 discount

}:Props){


const finalPrice =
 Math.max(
  price-discount,
  0
 )



return (

<div
 className="
 rounded-3xl
 border
 border-slate-200
 bg-white
 p-6
 shadow-sm
 "
>


<h2
className="
text-xl
font-black
text-slate-900
"
>
خلاصه سفارش
</h2>


<div className="mt-5 space-y-4">


<div className="flex justify-between">

<span>
پلن
</span>


<strong>
{title}
</strong>


</div>



<div className="flex justify-between">

<span>
مدت
</span>

<strong>
{duration}
</strong>


</div>



<div className="flex justify-between">

<span>
مبلغ
</span>


<strong>
{price.toLocaleString()}
 تومان
</strong>


</div>



{
discount > 0 &&
<div className="flex justify-between text-emerald-600">

<span>
تخفیف
</span>

<strong>
-
{discount.toLocaleString()}
 تومان
</strong>


</div>
}



<hr/>


<div
className="
flex
justify-between
text-lg
font-black
"
>

<span>
مبلغ نهایی
</span>


<strong>
{finalPrice.toLocaleString()}
 تومان
</strong>


</div>


</div>


</div>

)


}