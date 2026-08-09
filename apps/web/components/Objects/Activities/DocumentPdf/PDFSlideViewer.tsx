'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  LayoutGrid,
  ShieldAlert,
  Lock,
  Loader2,
  AlertCircle,
  BookOpen,
  FileText,
  Sliders,
  Moon,
  Sun,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react'
import { useLHSession } from '@components/Contexts/LHSessionContext'

interface PDFSlideViewerProps {
  pdfUrl: string
  title?: string
  className?: string
}

declare global {
  interface Window {
    pdfjsLib: any
  }
}

export default function PDFSlideViewer({ pdfUrl, title, className }: PDFSlideViewerProps) {
  const session = useLHSession() as any
  const userName = session?.data?.user?.name || session?.data?.user?.username || 'Learner'
  const userEmail = session?.data?.user?.email || ''

  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [scale, setScale] = useState<number>(1.1)
  const [rotation, setRotation] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false)
  const [isScreenBlurred, setIsScreenBlurred] = useState<boolean>(false)
  const [securityReason, setSecurityReason] = useState<string>('Skrinshot va nusxalash taqiqlangan!')
  const [jumpInput, setJumpInput] = useState<string>('1')

  // 📖 UX Features: Book mode & Reading theme
  const [isBookMode, setIsBookMode] = useState<boolean>(false)
  const [isDarkBg, setIsDarkBg] = useState<boolean>(true)
  const [isFlipping, setIsFlipping] = useState<'next' | 'prev' | null>(null)

  // 🛡️ DRM Watermark Options: 'subtle_corner' | 'moving' | 'diagonal' | 'off'
  const [watermarkMode, setWatermarkMode] = useState<'subtle_corner' | 'moving' | 'diagonal' | 'off'>('subtle_corner')
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [watermarkPos, setWatermarkPos] = useState<number>(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasLeftRef = useRef<HTMLCanvasElement>(null)
  const canvasRightRef = useRef<HTMLCanvasElement>(null)
  const renderTaskLeftRef = useRef<any>(null)
  const renderTaskRightRef = useRef<any>(null)

  // Dynamic moving watermark position interval
  useEffect(() => {
    if (watermarkMode !== 'moving') return
    const interval = setInterval(() => {
      setWatermarkPos((prev) => (prev + 1) % 4)
    }, 7000)
    return () => clearInterval(interval)
  }, [watermarkMode])

  // Feature D: DevTools Inspection Detection (Amazon Kindle Web Style)
  useEffect(() => {
    const threshold = 160
    const detectDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth > threshold
      const heightDiff = window.outerHeight - window.innerHeight > threshold
      if (widthDiff || heightDiff) {
        setIsScreenBlurred(true)
        setSecurityReason('DevTools (Inspeksiya oynasi) aniqlandi!')
      }
    }

    const interval = setInterval(detectDevTools, 1200)
    return () => clearInterval(interval)
  }, [])

  // 1. Dynamic Script Loader & Feature B: Memory ArrayBuffer Streaming (Udemy & O'Reilly Style)
  useEffect(() => {
    let isMounted = true

    const loadPdfJs = async () => {
      if (window.pdfjsLib) {
        return window.pdfjsLib
      }

      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
        script.onload = () => {
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
            resolve(window.pdfjsLib)
          } else {
            reject(new Error('PDF.js failed to load'))
          }
        }
        script.onerror = () => reject(new Error('Failed to load PDF library script'))
        document.body.appendChild(script)
      })
    }

    setLoading(true)
    setError(null)

    loadPdfJs()
      .then(async (pdfjs) => {
        if (!isMounted) return

        // Feature B: Fetch PDF into in-memory ArrayBuffer so raw URL is never exposed to DOM or PDF.js worker
        try {
          const response = await fetch(pdfUrl, { credentials: 'include' })
          if (!response.ok) throw new Error('PDF stream fetch error')
          const arrayBuffer = await response.arrayBuffer()
          return pdfjs.getDocument({
            data: new Uint8Array(arrayBuffer),
          }).promise
        } catch {
          // Fallback to direct loading if fetch is restricted
          return pdfjs.getDocument({
            url: pdfUrl,
            withCredentials: true,
          }).promise
        }
      })
      .then((doc) => {
        if (!isMounted || !doc) return
        setPdfDoc(doc)
        setTotalPages(doc.numPages)
        setLoading(false)
      })
      .catch((err) => {
        if (!isMounted) return
        console.error('Error loading PDF document:', err)
        setError('PDF hujjatini yuklashda xatolik yuz berdi.')
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [pdfUrl])

  // Restore & Save Last Read Page Position
  useEffect(() => {
    if (!pdfUrl || totalPages === 0) return
    try {
      const key = `lh_pdf_page_${btoa(pdfUrl).slice(0, 32)}`
      const saved = localStorage.getItem(key)
      if (saved) {
        const pageNum = parseInt(saved, 10)
        if (pageNum >= 1 && pageNum <= totalPages) {
          setCurrentPage(pageNum)
          setJumpInput(pageNum.toString())
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [pdfUrl, totalPages])

  useEffect(() => {
    if (!pdfUrl || currentPage === 0) return
    try {
      const key = `lh_pdf_page_${btoa(pdfUrl).slice(0, 32)}`
      localStorage.setItem(key, currentPage.toString())
    } catch {
      // Ignore storage errors
    }
  }, [pdfUrl, currentPage])

  // 2. Render Page Helper with Feature C: Invisible Forensic Fingerprinting (Coursera & edX Steganography)
  const renderSingleCanvas = useCallback(
    async (
      doc: any,
      pageNum: number,
      canvasEl: HTMLCanvasElement | null,
      taskRef: React.MutableRefObject<any>,
      effectiveScale: number
    ) => {
      if (!doc || !canvasEl) return

      try {
        if (taskRef.current) {
          taskRef.current.cancel()
        }

        const page = await doc.getPage(pageNum)
        const viewport = page.getViewport({ scale: effectiveScale, rotation })

        const context = canvasEl.getContext('2d')
        if (!context) return

        canvasEl.height = viewport.height
        canvasEl.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }

        const renderTask = page.render(renderContext)
        taskRef.current = renderTask
        await renderTask.promise

        // Feature C: Invisible Forensic Steganographic Watermark (Coursera & edX Style)
        // Embeds microscopic, 0.008 opacity user session data onto canvas pixel layers
        context.save()
        context.font = '11px monospace'
        context.fillStyle = 'rgba(0, 0, 0, 0.008)' // Completely imperceptible to human eyes
        const forensicId = `LH-SECURITY-FORENSIC-ID:[${userEmail || userName}-${Date.now()}]`
        context.fillText(forensicId, 15, 25)
        context.fillText(forensicId, viewport.width - 320, 25)
        context.fillText(forensicId, 15, viewport.height - 15)
        context.fillText(forensicId, viewport.width - 320, viewport.height - 15)
        context.fillText(forensicId, viewport.width / 2 - 160, viewport.height / 2)
        context.restore()
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error(`Error rendering page ${pageNum}:`, err)
        }
      }
    },
    [rotation, userEmail, userName]
  )

  useEffect(() => {
    if (!pdfDoc) return

    const effectiveScale = isBookMode ? scale * 0.75 : scale

    // Render Left / Single Page
    renderSingleCanvas(pdfDoc, currentPage, canvasLeftRef.current, renderTaskLeftRef, effectiveScale)

    // Render Right Page (only in book mode)
    if (isBookMode && currentPage + 1 <= totalPages) {
      renderSingleCanvas(pdfDoc, currentPage + 1, canvasRightRef.current, renderTaskRightRef, effectiveScale)
    }

    setJumpInput(currentPage.toString())
  }, [pdfDoc, currentPage, scale, rotation, isBookMode, totalPages, renderSingleCanvas])

  // 3. Navigation Handlers
  const step = isBookMode ? 2 : 1

  const handlePrevPage = () => {
    if (currentPage > 1 && !isFlipping) {
      if (isBookMode) {
        setIsFlipping('prev')
        setTimeout(() => {
          setCurrentPage((prev) => Math.max(1, prev - step))
          setIsFlipping(null)
        }, 350)
      } else {
        setCurrentPage((prev) => Math.max(1, prev - step))
      }
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages && !isFlipping) {
      if (isBookMode) {
        setIsFlipping('next')
        setTimeout(() => {
          setCurrentPage((prev) => Math.min(totalPages, prev + step))
          setIsFlipping(null)
        }, 350)
      } else {
        setCurrentPage((prev) => Math.min(totalPages, prev + step))
      }
    }
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.15, 2.5))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.15, 0.5))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const toggleBookMode = () => {
    setIsBookMode((prev) => {
      const nextMode = !prev
      if (nextMode && currentPage % 2 === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
      return nextMode
    })
  }

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pageNum = parseInt(jumpInput, 10)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum)
    } else {
      setJumpInput(currentPage.toString())
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err)
      })
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Feature D: Keyboard Security Shortcut Blocking (Mac Cmd+Shift+3/4/5 & Windows Snipping Tool)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // macOS Screenshot Hotkeys (Cmd + Shift + 3 / 4 / 5 / 6)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault()
        e.stopPropagation()
        setIsScreenBlurred(true)
        setSecurityReason('Skrinshot majmualari (Cmd+Shift+3/4/5) taqiqlangan!')
        setTimeout(() => setIsScreenBlurred(false), 3500)
        return false
      }

      // Block Ctrl+S, Cmd+S, Ctrl+P, Cmd+P, Ctrl+U, Cmd+U
      if ((e.ctrlKey || e.metaKey) && ['s', 'S', 'p', 'P', 'u', 'U'].includes(e.key)) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }

      // Block F12, Ctrl+Shift+I/J/C
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key))) {
        e.preventDefault()
        e.stopPropagation()
        setIsScreenBlurred(true)
        setSecurityReason('DevTools (Inspeksiya oynasi) taqiqlangan!')
        return false
      }

      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return
      }

      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault()
        handleNextPage()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevPage()
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      } else if (e.key === 'PrintScreen') {
        e.preventDefault()
        if (navigator.clipboard) {
          navigator.clipboard.writeText('')
        }
        setIsScreenBlurred(true)
        setSecurityReason('Skrinshot va nusxalash taqiqlangan!')
        setTimeout(() => setIsScreenBlurred(false), 3500)
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [currentPage, totalPages, isBookMode, isFlipping])

  // Feature D: Anti-Screenshot Window Blur & Tab Switch Protection
  useEffect(() => {
    const handleBlur = () => {
      setIsScreenBlurred(true)
      setSecurityReason('Oyna faolligi yo\'qoldi. Ekranni ko\'rish uchun ushbu dars oynasiga bosing.')
    }

    const handleFocus = () => {
      setIsScreenBlurred(false)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsScreenBlurred(true)
        setSecurityReason('Dars oynasi berkildi / boshqa tabga o\'tildi.')
      } else {
        setIsScreenBlurred(false)
      }
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Dynamic positions for moving watermark
  const getMovingWatermarkStyle = () => {
    switch (watermarkPos) {
      case 0:
        return 'bottom-4 right-4'
      case 1:
        return 'top-4 left-4'
      case 2:
        return 'bottom-4 left-4'
      case 3:
      default:
        return 'top-4 right-4'
    }
  }

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative flex flex-col rounded-xl overflow-hidden shadow-2xl select-none print:hidden transition-colors ${
        isDarkBg ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-900'
      } ${className || 'w-full h-[85vh] min-h-[600px]'}`}
      style={{
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      <style jsx global>{`
        @media print {
          body {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Header & Security Bar */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b backdrop-blur z-20 ${
          isDarkBg
            ? 'bg-zinc-900/90 border-zinc-800 text-white'
            : 'bg-white/90 border-zinc-200 text-zinc-900 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-emerald-500" />
          <span className="text-sm font-semibold truncate max-w-xs sm:max-w-md">
            {title || 'Himoyalangan Kitob / Slayd'}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md">
            Himoyalangan
          </span>
        </div>

        {/* Top Header Controls */}
        <div className="flex items-center gap-2 text-xs">
          <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-500">
            <ShieldCheck size={14} />
            <span className="font-medium">{userName}</span>
            {userEmail && <span className="opacity-75">({userEmail})</span>}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkBg(!isDarkBg)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDarkBg
                ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200'
            }`}
            title={isDarkBg ? 'Yorug\' fon rejimi' : 'Qorong\'u fon rejimi'}
          >
            {isDarkBg ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* DRM Watermark Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-lg border transition-colors ${
                showSettings
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : isDarkBg
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                  : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200'
              }`}
              title="Xavfsizlik & Suv belgisi sozlamalari"
            >
              <Sliders size={16} />
            </button>

            {showSettings && (
              <div
                className={`absolute right-0 mt-2 w-64 p-3 rounded-xl border shadow-xl z-30 space-y-3 text-xs ${
                  isDarkBg ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                }`}
              >
                <div className="font-semibold border-b pb-1.5 border-zinc-700/50 flex items-center justify-between">
                  <span>Suv belgisi (Watermark)</span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">DRM</span>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => setWatermarkMode('subtle_corner')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      watermarkMode === 'subtle_corner'
                        ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                        : 'hover:bg-zinc-800'
                    }`}
                  >
                    <span>📌 Burchakli shaffof (Subtle)</span>
                    {watermarkMode === 'subtle_corner' && '✓'}
                  </button>

                  <button
                    onClick={() => setWatermarkMode('moving')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      watermarkMode === 'moving'
                        ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                        : 'hover:bg-zinc-800'
                    }`}
                  >
                    <span>🔄 Harakatlanuvchi DRM (Dynamic)</span>
                    {watermarkMode === 'moving' && '✓'}
                  </button>

                  <button
                    onClick={() => setWatermarkMode('diagonal')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      watermarkMode === 'diagonal'
                        ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                        : 'hover:bg-zinc-800'
                    }`}
                  >
                    <span>📐 Diagonal Matn (Diagonal)</span>
                    {watermarkMode === 'diagonal' && '✓'}
                  </button>

                  <button
                    onClick={() => setWatermarkMode('off')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      watermarkMode === 'off'
                        ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                        : 'hover:bg-zinc-800'
                    }`}
                  >
                    <span>🚫 Minimal (Faqat tepa nishon)</span>
                    {watermarkMode === 'off' && '✓'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnails Drawer Toggle */}
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showThumbnails
                ? 'bg-emerald-600 text-white border-emerald-500'
                : isDarkBg
                ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200'
            }`}
            title="Slaydlar / Betlar ro'yxati"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Main Slide / Book Viewing Area */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Left Thumbnails Drawer */}
        {showThumbnails && totalPages > 0 && (
          <div
            className={`w-48 border-r p-3 overflow-y-auto z-10 flex flex-col gap-2 transition-colors ${
              isDarkBg ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <div className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-60">
              Betlar ({totalPages})
            </div>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                onClick={() => setCurrentPage(pNum)}
                className={`relative flex items-center justify-between py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  currentPage === pNum || (isBookMode && currentPage + 1 === pNum)
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-sm font-bold'
                    : isDarkBg
                    ? 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
                }`}
              >
                <span>Bet {pNum}</span>
                {(currentPage === pNum || (isBookMode && currentPage + 1 === pNum)) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Center Viewing Viewport */}
        <div className="flex-1 relative flex items-center justify-center p-4 overflow-auto scrollbar-thin scrollbar-thumb-zinc-700">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm">Hujjat yuklanmoqda...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center gap-3 text-red-500 max-w-md text-center">
              <AlertCircle size={32} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Render Area: Single Page vs Book Mode Spread */}
          {!loading && !error && (
            <div className="relative flex items-center justify-center gap-0 max-w-full max-h-full [perspective:1400px]">
              {/* Left Page (or Single Page) Canvas */}
              <div
                className={`relative inline-block shadow-2xl transition-all duration-300 origin-right ${
                  isFlipping === 'prev' ? '[transform:rotateY(180deg)] opacity-40' : ''
                }`}
              >
                <canvas
                  ref={canvasLeftRef}
                  className={`rounded-l-lg border bg-white ${
                    isBookMode ? 'rounded-r-none border-r-0' : 'rounded-lg'
                  } ${isDarkBg ? 'border-zinc-800' : 'border-zinc-300'}`}
                  onContextMenu={(e) => e.preventDefault()}
                />

                {/* Left Page Watermark Overlay */}
                {watermarkMode !== 'off' && (
                  <div
                    className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${
                      watermarkMode === 'diagonal'
                        ? 'flex flex-col justify-between p-6 opacity-15'
                        : watermarkMode === 'moving'
                        ? `absolute transition-all duration-700 p-3 opacity-30 ${getMovingWatermarkStyle()}`
                        : 'absolute bottom-3 right-3 opacity-25'
                    }`}
                  >
                    {watermarkMode === 'diagonal' ? (
                      <div className="rotate-[-25deg] transform text-center text-xs font-bold tracking-widest uppercase my-auto space-y-6 text-zinc-900">
                        <div>{userName} • {userEmail}</div>
                        <div>Nusxalash va Tarqatish Taqiqlangan</div>
                        <div>ID: {btoa(userEmail || userName).slice(0, 10)}</div>
                      </div>
                    ) : (
                      <div className="bg-zinc-900/80 text-white backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-mono border border-zinc-700/60 shadow-lg">
                        🔒 {userName} ({userEmail || 'Protected'})
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Book Crease Shadow Line (Shown only in Book Mode) */}
              {isBookMode && currentPage + 1 <= totalPages && (
                <div className="w-4 h-full bg-gradient-to-r from-black/50 via-black/20 to-black/50 z-10 pointer-events-none shadow-2xl border-x border-black/20" />
              )}

              {/* Right Page Canvas (Only in Book Mode) */}
              {isBookMode && currentPage + 1 <= totalPages && (
                <div
                  className={`relative inline-block shadow-2xl transition-all duration-300 origin-left ${
                    isFlipping === 'next' ? '[transform:rotateY(-180deg)] opacity-40' : ''
                  }`}
                >
                  <canvas
                    ref={canvasRightRef}
                    className={`rounded-r-lg border border-l-0 bg-white ${
                      isDarkBg ? 'border-zinc-800' : 'border-zinc-300'
                    }`}
                    onContextMenu={(e) => e.preventDefault()}
                  />

                  {/* Right Page Watermark Overlay */}
                  {watermarkMode !== 'off' && (
                    <div
                      className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${
                        watermarkMode === 'diagonal'
                          ? 'flex flex-col justify-between p-6 opacity-15'
                          : watermarkMode === 'moving'
                          ? `absolute transition-all duration-700 p-3 opacity-30 ${getMovingWatermarkStyle()}`
                          : 'absolute bottom-3 right-3 opacity-25'
                      }`}
                    >
                      {watermarkMode === 'diagonal' ? (
                        <div className="rotate-[-25deg] transform text-center text-xs font-bold tracking-widest uppercase my-auto space-y-6 text-zinc-900">
                          <div>{userName} • {userEmail}</div>
                          <div>Nusxalash va Tarqatish Taqiqlangan</div>
                        </div>
                      ) : (
                        <div className="bg-zinc-900/80 text-white backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-mono border border-zinc-700/60 shadow-lg">
                          🔒 {userName} ({userEmail || 'Protected'})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Feature D: Pitch Black Anti-Screenshot & DevTools Overlay (Bank App Style) */}
          {isScreenBlurred && (
            <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-3 text-center p-6 transition-all duration-100 select-none">
              <ShieldAlert className="w-12 h-12 text-emerald-500 animate-bounce" />
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                🔒 Bank Xavfsizlik Rejimi (Blackout)
              </h3>
              <p className="text-sm text-zinc-400 max-w-md font-medium">
                {securityReason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Control Bar */}
      {!loading && !error && (
        <div
          className={`flex items-center justify-between px-4 py-3 border-t backdrop-blur z-20 ${
            isDarkBg
              ? 'bg-zinc-900/90 border-zinc-800 text-white'
              : 'bg-white/90 border-zinc-200 text-zinc-900 shadow-sm'
          }`}
        >
          {/* Left: Navigation Buttons & Book Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className={`p-2 rounded-lg transition-colors ${
                isDarkBg
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-40'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 disabled:opacity-40'
              }`}
              title="Oldingi bet (Chapga)"
            >
              <ChevronLeft size={18} />
            </button>

            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 text-xs font-medium">
              <input
                type="text"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                onBlur={() => setJumpInput(currentPage.toString())}
                className={`w-10 px-1.5 py-1 border rounded-md text-center font-semibold focus:outline-none focus:border-emerald-500 ${
                  isDarkBg ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
                }`}
              />
              <span className="opacity-70">
                {isBookMode && currentPage + 1 <= totalPages
                  ? `-${currentPage + 1} / ${totalPages}`
                  : `/ ${totalPages}`}
              </span>
            </form>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className={`p-2 rounded-lg transition-colors ${
                isDarkBg
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-40'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 disabled:opacity-40'
              }`}
              title="Keyingi bet (O'ngga)"
            >
              <ChevronRight size={18} />
            </button>

            <div className="w-px h-5 bg-zinc-700/50 mx-1 hidden sm:block" />

            {/* 📖 Book View Mode Toggle */}
            <button
              onClick={toggleBookMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                isBookMode
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : isDarkBg
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                  : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200'
              }`}
              title="2-betli kitobcha shakli"
            >
              {isBookMode ? <BookOpen size={16} /> : <FileText size={16} />}
              <span className="hidden sm:inline">
                {isBookMode ? 'Kitobcha (2 bet)' : '1 bet'}
              </span>
            </button>
          </div>

          {/* Middle: Progress Bar */}
          <div className="hidden md:flex flex-1 max-w-xs mx-6">
            <div className="w-full bg-zinc-800/40 border border-zinc-700/40 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(currentPage / totalPages) * 100}%` }}
              />
            </div>
          </div>

          {/* Right: Zoom & Fullscreen Tools */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleZoomOut}
              className={`p-2 rounded-lg transition-colors ${
                isDarkBg ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
              }`}
              title="Kichiklashtirish"
            >
              <ZoomOut size={16} />
            </button>

            <span className="hidden md:inline-block text-xs font-bold w-10 text-center opacity-80">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              className={`p-2 rounded-lg transition-colors ${
                isDarkBg ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
              }`}
              title="Kattalashtirish"
            >
              <ZoomIn size={16} />
            </button>

            <button
              onClick={handleRotate}
              className={`p-2 rounded-lg transition-colors ${
                isDarkBg ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
              }`}
              title="Burish"
            >
              <RotateCw size={16} />
            </button>

            <div className="w-px h-5 bg-zinc-700/50 mx-1" />

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors text-white shadow-md"
              title={isFullscreen ? 'Chiqish (Esc)' : 'To\'liq ekran (F)'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
