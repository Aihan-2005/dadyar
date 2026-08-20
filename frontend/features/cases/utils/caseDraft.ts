export const CASE_DRAFT_KEY =
'new_case_draft'


export function saveCaseDraft(
 data:unknown
){
 if(typeof window==='undefined'){
  return
 }

 localStorage.setItem(
  CASE_DRAFT_KEY,
  JSON.stringify(data)
 )
}



export function loadCaseDraft(){

 if(typeof window==='undefined'){
  return null
 }

 const value =
 localStorage.getItem(
 CASE_DRAFT_KEY
 )

 if(!value){
  return null
 }

 try{
  return JSON.parse(value)
 }catch{
  return null
 }
}



export function clearCaseDraft(){

 if(typeof window==='undefined'){
  return
 }

 localStorage.removeItem(
 CASE_DRAFT_KEY
 )
}