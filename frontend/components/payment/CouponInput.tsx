'use client'


interface Props{

value:string

onChange:
(value:string)=>void

onDiscountChange:
(value:number)=>void

}



export default function CouponInput({

value,

onChange,

onDiscountChange

}:Props){



function applyCoupon(){


if(
 value.trim().toUpperCase()
 ===
 'WELCOME20'
){

onDiscountChange(
 20000
)

}else{

onDiscountChange(
 0
)

}


}



return (

<div
className="
rounded-3xl
border
bg-white
p-6
"
>


<h3
className="
font-black
text-slate-900
"
>
کد تخفیف
</h3>



<div
className="
mt-4
flex
gap-3
"
>


<input

value={
 value
}

onChange={
 e=>onChange(
 e.target.value
 )
}

placeholder="
کد تخفیف را وارد کنید
"

className="
h-12
flex-1
rounded-xl
border
px-4
outline-none
focus:border-blue-500
"

/>



<button

onClick={
 applyCoupon
}

className="
rounded-xl
bg-slate-900
px-5
font-bold
text-white
"
>

اعمال

</button>


</div>


</div>

)

}
