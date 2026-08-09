'use client'
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface SymbolsModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectSymbol: (symbol: string) => void
}

const CATEGORIES = {
  Math: ['±', '×', '÷', '≠', '≈', '≤', '≥', '√', '∞', 'π', '∑', '∏', '∆', '∂', '∫', '¬', '∧', '∨', '∩', '∪', '−', '％', '‰', '¹', '²', '³', '½', '¼', '¾'],
  Greek: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Γ', '∆', 'Θ', 'Λ', 'Ξ', 'Π', 'Σ', 'Φ', 'Ψ', 'Ω'],
  Arrows: ['←', '→', '↑', '↓', '↔', '↕', '↖', '↗', '↘', '↙', '↚', '↛', '⇐', '⇒', '⇑', '⇓', '⇔', '⇕', '➔', '➕', '➖'],
  Currency: ['$', '€', '£', '¥', '₩', '₽', '₺', '₹', '¤', '¢', '৳', '₪', '₫'],
  Misc: ['©', '®', '™', '°', '§', '¶', '•', '†', '‡', '♠', '♣', '♥', '♦', '★', '☆', '✔', '✖', '✉', '☎', '✂', '✏', '⌚', '⌛'],
}

export function SymbolsModal({ isOpen, onClose, onSelectSymbol }: SymbolsModalProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof CATEGORIES>('Math')

  // Listen for Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!isOpen) return null

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer overflow-y-auto p-4 pt-10 md:pt-20"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-md font-bold text-neutral-900 dark:text-white">Insert Special Character</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 px-2 py-1.5 overflow-x-auto gap-1">
          {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeCategory === category
                  ? 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Symbol Grid */}
        <div className="p-5 max-h-[300px] overflow-y-auto">
          <div className="grid grid-cols-7 gap-2">
            {CATEGORIES[activeCategory].map((symbol) => (
              <button
                key={symbol}
                onClick={() => {
                  onSelectSymbol(symbol)
                  onClose()
                }}
                className="w-10 h-10 flex items-center justify-center text-lg font-medium rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/20 hover:text-sky-600 dark:hover:text-sky-400 border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-950/20 hover:scale-105 hover:border-sky-100 dark:hover:border-sky-900/30 transition-all cursor-pointer text-neutral-800 dark:text-neutral-200"
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}
