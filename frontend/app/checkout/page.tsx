import { Suspense } from 'react'

import CheckoutClient from './CheckoutClient'



export default function CheckoutPage(){


  return (

    <Suspense

      fallback={

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
              در حال بارگذاری...
            </p>

          </div>

        </main>

      }

    >

      <CheckoutClient />

    </Suspense>

  )

}
