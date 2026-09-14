'use client'


interface Props{

value:string

onChange:
(value:string)=>void

}



export default function ReferralInput({

value,

onChange

}:Props){



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
کد دعوت
</h3>



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
کد دعوت دارید؟
"


className="
mt-4
h-12
w-full
rounded-xl
border
px-4
outline-none
focus:border-blue-500
"

/>



</div>

)

}