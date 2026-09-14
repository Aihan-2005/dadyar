'use client'


import {
  useSearchParams,
} from 'next/navigation'



export default function PaymentResultClient(){


  const params =
    useSearchParams()



  const status =
    params.get('status')



  const plan =
    params.get('plan')



  const success =
    status === 'success'



  const invoiceNumber =
    `INV-${Date.now()}`




  return (

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
        max-w-md
        rounded-3xl
        bg-white
        p-10
        text-center
        shadow-lg
        "

      >



        <h1

          className="
          text-2xl
          font-black
          text-slate-900
          "

        >

          {
            success
            ?
            'پرداخت موفق بود'
            :
            'پرداخت ناموفق بود'
          }


        </h1>




        <p

          className="
          mt-4
          leading-8
          text-slate-600
          "

        >

          {
            success
            ?
            'اشتراک شما با موفقیت ثبت شد.'
            :
            'لطفا دوباره تلاش کنید.'
          }


        </p>





        {
          success && (

            <div

              className="
              mt-6
              rounded-2xl
              bg-slate-100
              p-5
              text-sm
              font-black
              text-slate-700
              "

            >

              شماره فاکتور:

              <br />

              <span
                className="
                text-blue-700
                "
              >

                {invoiceNumber}

              </span>


              {
                plan && (

                  <p
                    className="
                    mt-3
                    text-xs
                    text-slate-500
                    "
                  >

                    پلن انتخابی:
                    {' '}
                    {plan}

                  </p>

                )
              }


            </div>

          )
        }



      </div>



    </main>

  )

}