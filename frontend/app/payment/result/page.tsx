import { Suspense } from 'react'

import PaymentResultClient from './PaymentResultClient'



export default function PaymentResultPage(){


  return (

    <Suspense

      fallback={

        <main
          dir="rtl"
          className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-slate-100
          px-4
          "
        >

          <div
            className="
            rounded-3xl
            bg-white
            px-10
            py-8
            shadow
            "
          >

            <p
              className="
              font-black
              text-slate-700
              "
            >
              در حال بررسی نتیجه پرداخت...
            </p>


          </div>


        </main>

      }

    >

      <PaymentResultClient />

    </Suspense>

  )

}
