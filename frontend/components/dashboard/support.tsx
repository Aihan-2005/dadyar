'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Headphones, Phone, X, MessageCircle } from 'lucide-react'

const supportOptions = [
  { 
    id: 'phone', 
    label: '۰۹۹۱۶۳۹۳۶۸۴', 
    icon: <Phone size={20} />, 
    color: 'bg-blue-500',
    href: 'tel:09123456789' 
  },
  { 
    id: 'telegram', 
    label: '@mojtaba_2A', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
    ), 
    color: 'bg-[#229ED9]',
    href: 'https://t.me/mojtaba_2A' 
  },

  { 
    id: 'whatsapp', 
    label:'@mojtaba_2A', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>
    ), 
    color: 'bg-[#25D366]',
    href: 'https://wa.me/09916393684' 
  },
]

export default function SupportButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative mt-4 px-2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-4 w-56 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden z-50"
          >
            <div className="p-2 space-y-1">
              {supportOptions.map((option) => (
                <a
                  key={option.id}
                  href={option.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-lg ${option.color} text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    {option.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-400 font-medium">ارتباط در {option.id === 'phone' ? 'تماس' : option.id}</span>
                    <span className="text-sm text-zinc-800 font-bold">{option.label}</span>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 group
          ${isOpen 
            ? 'bg-zinc-900 text-white shadow-lg' 
            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
      >
        <div className="relative">
          {isOpen ? <X size={20} /> : <Headphones size={20} />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pulse" />
          )}
        </div>
        <span className="flex-1 text-right">پشتیبانی دادیار</span>
      </button>
    </div>
  )
}
