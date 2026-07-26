import { financeMockCases } from './finance.mock'

import type { Case } from '@/types/case'


const USE_MOCK_DATA = true



export async function getFinanceCases(): Promise<Case[]> {

  if (USE_MOCK_DATA) {

    await wait(400)

    return financeMockCases
  }


  const response = await fetch(
    '/api/proxy/cases'
  )


  if (!response.ok) {

    throw new Error(
      'خطا در دریافت پرونده‌ها'
    )
  }


  return response.json()
}



function wait(
  ms:number
) {

  return new Promise(
    resolve => setTimeout(resolve,ms)
  )

}