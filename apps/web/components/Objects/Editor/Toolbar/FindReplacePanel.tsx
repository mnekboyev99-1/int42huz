'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { X, Search, Replace, ReplaceAll, ChevronDown, ChevronUp } from 'lucide-react'

interface FindReplacePanelProps {
  editor: any
  isOpen: boolean
  onClose: () => void
}

export function FindReplacePanel({ editor, isOpen, onClose }: FindReplacePanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [replaceQuery, setReplaceQuery] = useState('')
  const [matches, setMatches] = useState<{ from: number; to: number }[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  // Find matches in ProseMirror doc
  const performSearch = useCallback((query: string) => {
    if (!editor || !query) {
      setMatches([])
      setCurrentIndex(-1)
      return
    }

    const foundMatches: { from: number; to: number }[] = []
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.isText) {
        const text = node.text || ''
        let index = text.toLowerCase().indexOf(query.toLowerCase())
        while (index !== -1) {
          foundMatches.push({
            from: pos + index,
            to: pos + index + query.length,
          })
          index = text.toLowerCase().indexOf(query.toLowerCase(), index + 1)
        }
      }
    })

    setMatches(foundMatches)
    if (foundMatches.length > 0) {
      setCurrentIndex(0)
      // Select first match
      const first = foundMatches[0]
      editor.commands.setTextSelection({ from: first.from, to: first.to })
    } else {
      setCurrentIndex(-1)
    }
  }, [editor])

  // Re-run search if doc updates or query changes
  useEffect(() => {
    if (!isOpen) return
    performSearch(searchQuery)
  }, [searchQuery, isOpen, performSearch])

  if (!isOpen || !editor) return null

  const handleNext = () => {
    if (matches.length === 0) return
    const nextIdx = (currentIndex + 1) % matches.length
    setCurrentIndex(nextIdx)
    const match = matches[nextIdx]
    editor.commands.setTextSelection({ from: match.from, to: match.to })
    editor.view.scrollIntoView()
  }

  const handlePrev = () => {
    if (matches.length === 0) return
    const prevIdx = (currentIndex - 1 + matches.length) % matches.length
    setCurrentIndex(prevIdx)
    const match = matches[prevIdx]
    editor.commands.setTextSelection({ from: match.from, to: match.to })
    editor.view.scrollIntoView()
  }

  const handleReplace = () => {
    if (matches.length === 0 || currentIndex === -1) return
    const match = matches[currentIndex]
    
    // Replace text at current selection/match
    editor.chain()
      .focus()
      .insertContentAt({ from: match.from, to: match.to }, replaceQuery)
      .run()

    // Re-run search at the new document state
    setTimeout(() => {
      performSearch(searchQuery)
    }, 10)
  }

  const handleReplaceAll = () => {
    if (matches.length === 0) return
    
    // Sort matches from end to start so positions don't shift
    const sorted = [...matches].sort((a, b) => b.from - a.from)
    
    let tr = editor.state.tr
    sorted.forEach((match) => {
      tr = tr.replaceWith(match.from, match.to, editor.state.schema.text(replaceQuery))
    })
    
    editor.view.dispatch(tr)
    editor.view.focus()

    // Clear queries
    setMatches([])
    setCurrentIndex(-1)
    setSearchQuery('')
  }

  return (
    <div className="absolute right-4 top-20 z-40 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl p-4 space-y-3 animate-in slide-in-from-top duration-200">
      {/* Title / Close */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Find and Replace</span>
        <button
          onClick={onClose}
          className="p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Find input */}
      <div className="space-y-1.5">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Find text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-20 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          {matches.length > 0 && (
            <div className="absolute right-3 flex items-center gap-1.5 text-[10px] font-semibold text-neutral-400 select-none">
              <span>{currentIndex + 1}/{matches.length}</span>
              <button onClick={handlePrev} className="hover:text-sky-500 p-0.5"><ChevronUp size={12} /></button>
              <button onClick={handleNext} className="hover:text-sky-500 p-0.5"><ChevronDown size={12} /></button>
            </div>
          )}
        </div>
      </div>

      {/* Replace input */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <Replace size={14} className="absolute left-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleReplace}
            disabled={matches.length === 0 || currentIndex === -1}
            className="flex-1 py-1 px-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
          >
            <Replace size={12} />
            <span>Replace</span>
          </button>
          <button
            onClick={handleReplaceAll}
            disabled={matches.length === 0}
            className="flex-1 py-1 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
          >
            <ReplaceAll size={12} />
            <span>Replace All</span>
          </button>
        </div>
      </div>
    </div>
  )
}
