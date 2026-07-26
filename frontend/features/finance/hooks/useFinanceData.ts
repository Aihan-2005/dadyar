'use client'


import {
  useCallback,
  useEffect,
  useState
} from 'react'


import {
  getFinanceCases
}
from '../data/finance.repository'


import type {
  Case
} from '@/types/case'



export function useFinanceData(){

  const [cases,setCases]
  =
  useState<Case[]>([])


  const [
    loading,
    setLoading
  ]
  =
  useState(true)



  const [
    error,
    setError
  ]
  =
  useState<string | null>(null)




  const load = useCallback(
    async()=>{


      try {

        setLoading(true)

        setError(null)


        const data =
          await getFinanceCases()


        setCases(data)


      }
      catch(error){

        setError(
          error instanceof Error
          ?
          error.message
          :
          'خطای ناشناخته'
        )

      }
      finally{

        setLoading(false)

      }


    },
    []
  )




  useEffect(()=>{

    load()

  },[load])




  return {

    cases,

    loading,

    error,

    refresh:load

  }

}