export function formatMoneyInput(
value:string
){

const number =
value
.replace(/[^\d]/g,'')


if(!number)
return ''


return Number(number)
.toLocaleString('en-US')

}