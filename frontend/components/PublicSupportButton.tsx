'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Headphones, Phone, X } from 'lucide-react'

const supportOptions = [
  {
    id: 'phone',
    label: '۰۹۹۱۶۳۹۳۶۸۴',
    icon: <Phone size={20} />,
    color: 'bg-blue-500',
    href: 'tel:09916393684',
  },
  {
    id: 'telegram',
    label: '@mojtaba_2A',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </svg>
    ),
    color: 'bg-[#229ED9]',
    href: 'https://t.me/mojtaba_2A',
  },
  {
    id: 'whatsapp',
    label: '@mojtaba_2A',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z" />
      </svg>
    ),
    color: 'bg-[#25D366]',
    href: 'https://wa.me/09916393684',
  },
]

export default function PublicSupportButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (

    <div dir="rtl" className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-4 w-60 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-2xl"
          >
            <div className="space-y-1 p-2">
              {supportOptions.map((option) => (
                <a
                  key={option.id}
                  href={option.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-zinc-50"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${option.color} text-white shadow-sm transition-transform group-hover:scale-110`}
                  >
                    {option.icon}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-400">
                      ارتباط در {option.id === 'phone' ? 'تماس' : option.id}
                    </span>

                    <span className="text-sm font-bold text-zinc-800">
                      {option.label}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label="پشتیبانی"
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? 'bg-slate-900 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <div className="relative">
          {isOpen ? <X size={22} /> : <Headphones size={22} />}

          {!isOpen && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-white bg-green-400" />
          )}
        </div>
      </button>
    </div>
  )
  
}