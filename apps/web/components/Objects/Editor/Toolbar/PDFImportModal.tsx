'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Upload, Loader2, Sparkles, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { startEditorAIChatSessionStream } from '@services/ai/ai'

interface PDFImportModalProps {
  isOpen: boolean
  onClose: () => void
  editor: any
  activityUuid: string
}

export default function PDFImportModal({ isOpen, onClose, editor, activityUuid }: PDFImportModalProps) {
  const { t } = useTranslation()
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token

  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading_pdfjs' | 'parsing' | 'sending_ai' | 'generating' | 'completed'>('idle')
  const [progress, setProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [aiResponse, setAiResponse] = useState('')
  const [error, setError] = useState<string | null>(null)

  const accumulatedResponseRef = useRef('')

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Function to dynamically load PDF.js from CDN
  const loadPDFJS = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib)
        return
      }

      setStatus('loading_pdfjs')
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js'
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'
        resolve(pdfjsLib)
      }
      script.onerror = () => reject(new Error('Failed to load PDF parser library.'))
      document.head.appendChild(script)
    })
  }

  // Parse text content from the PDF file
  const parsePDFText = async (file: File, pdfjsLib: any): Promise<string> => {
    setStatus('parsing')
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    
    setTotalPages(pdf.numPages)
    let extractedText = ''

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      setCurrentPage(pageNum)
      setProgress(Math.round((pageNum / pdf.numPages) * 100))
      
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      
      extractedText += pageText + '\n\n'
    }

    return extractedText
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please select a valid PDF file.')
    }
  }

  const handleImport = async () => {
    if (!file || !access_token) return
    setError(null)

    try {
      // 1. Load Mozilla PDF.js
      const pdfjsLib = await loadPDFJS()

      // 2. Parse text content page-by-page
      const text = await parsePDFText(file, pdfjsLib)
      if (!text.trim()) {
        throw new Error('No readable text content found in the PDF.')
      }

      // 3. Initiate AI conversion session stream
      setStatus('sending_ai')
      accumulatedResponseRef.current = ''
      setAiResponse('')

      const payload = {
        message: `Ushbu PDF darslik matnini tushunarli, juda chiroyli dizaynga ega, tizimli va to'liq o'quv darsiga aylantirib ber. Dars quyidagi bloklardan iborat bo'lishi lozim:
1. Bo'limlarni aniq sarlavhalar (h1, h2, h3) va abzaslar bilan guruhlash.
2. Muhim eslatma, qoida yoki maslahatlarni chiroyli "calloutInfo" yoki "calloutWarning" bloklariga joylash.
3. Tushunchalarni taqqoslash yoki ma'lumotlarni tartiblash uchun chiroyli jadvallar (table) yaratish.
4. Dars yakunida o'quvchilar bilimini sinash uchun kamida 2 ta savoldan iborat interaktiv test bloki ("blockQuiz") yaratish.
5. Muhim atamalarni eslab qolish uchun interaktiv flashcardlar ("flipcard") qo'shish.
6. Darslikni vizual jihatdan boyitish va zerikarli bo'lmasligi uchun mavzuga mos joylarda bo'sh rasm yuklash bloklarini ("blockImage") yarating. blockImage ob'ektining attrs qismiga hech qanday unsplash_url yoki blockObject attributlarini bermang (ya'ni blockImage bo'sh yuklash oynasi ko'rinishida tursin). Rasm blokidan oldin yoki keyin foydalanuvchiga PDF'dan qaysi rasmni qirqib yuklash kerakligi haqida yordamchi matn yozib keting (Masalan: "*Yuklash uchun rasm: Arduino platasining ulanish sxemasi*").

Barcha kontentni toza va valid TipTap JSON array formatida qaytar. Tushuntirish yoki ortiqcha matn yozma. PDF Matni:\n\n${text.substring(0, 15000)}`,
        activity_uuid: activityUuid,
        current_content: editor.getJSON(),
      }

      console.log("PDF AI Importer payload:", payload);

      setStatus('generating')

      await startEditorAIChatSessionStream(
        {
          message: payload.message,
          activity_uuid: payload.activity_uuid,
          current_content: payload.current_content,
        },
        access_token,
        {
          onStart: () => {},
          onChatChunk: (chunk) => {
            accumulatedResponseRef.current += chunk
            setAiResponse(accumulatedResponseRef.current)
          },
          onContentStart: () => {},
          onContentChunk: (chunk) => {
            accumulatedResponseRef.current += chunk
            setAiResponse(accumulatedResponseRef.current)
          },
          onContentEnd: (fullContent) => {
            accumulatedResponseRef.current = fullContent
            setAiResponse(fullContent)
          },
          onComplete: () => {
            let finalContent = accumulatedResponseRef.current.trim()

            // 1. Extract content from <<<CONTENT>>> markers if they exist
            const contentMatch = finalContent.match(/<<<CONTENT>>>\s*([\s\S]*?)\s*<<<END_CONTENT>>>/)
            if (contentMatch) {
              finalContent = contentMatch[1].trim()
            }

            // 2. Clean markdown code fences
            if (finalContent.startsWith('```json')) {
              finalContent = finalContent.replace(/^```json/, '').replace(/```$/, '').trim()
            } else if (finalContent.startsWith('```html')) {
              finalContent = finalContent.replace(/^```html/, '').replace(/```$/, '').trim()
            } else if (finalContent.startsWith('```')) {
              finalContent = finalContent.replace(/^```/, '').replace(/```$/, '').trim()
            }

            // 3. Try to parse and insert as JSON
            try {
              const sanitizeAndParseJSON = (str: string): any => {
                let clean = str.trim()
                // Remove invalid ASCII control characters
                clean = clean.replace(/[\x00-\x1F\x7F]/g, '')
                // Fix trailing commas before brackets/braces
                clean = clean.replace(/,(\s*[\]}])/g, '$1')
                // Pre-clean Uzbek escaped single quotes (e.g. \' -> ')
                clean = clean.replace(/\\'/g, "'")

                // Count brackets to auto-close incomplete JSON structures
                let openBraces = 0
                let openBrackets = 0
                let inString = false
                let escapeNext = false

                for (let i = 0; i < clean.length; i++) {
                  const char = clean[i]
                  if (escapeNext) {
                    escapeNext = false
                    continue
                  }
                  if (char === '\\') {
                    escapeNext = true
                    continue
                  }
                  if (char === '"') {
                    inString = !inString
                    continue
                  }
                  if (!inString) {
                    if (char === '{') openBraces++
                    else if (char === '}') openBraces--
                    else if (char === '[') openBrackets++
                    else if (char === ']') openBrackets--
                  }
                }

                // Auto-close open brackets/braces
                if (openBraces > 0 || openBrackets > 0) {
                  // If it ended abruptly in a property name or value, try to strip trailing comma/colon/whitespace
                  clean = clean.replace(/[,:\s]+$/, '')
                  
                  // If we are currently inside an unclosed string value, close the string first
                  if (inString) {
                    clean += '"'
                  }
                  
                  // Close open blocks
                  while (openBraces > 0) {
                    clean += '}'
                    openBraces--
                  }
                  while (openBrackets > 0) {
                    clean += ']'
                    openBrackets--
                  }
                }

                // Double-check start/end matching
                if (clean.startsWith('[') && !clean.endsWith(']')) {
                  clean += ']'
                } else if (clean.startsWith('{') && !clean.endsWith('}')) {
                  clean += '}'
                }

                return JSON.parse(clean)
              }

              if (finalContent.startsWith('{') || finalContent.startsWith('[')) {
                let parsed = sanitizeAndParseJSON(finalContent)

                // Recursively map any incorrect type names from AI (like imageBlock -> blockImage)
                const normalizeNodeTypes = (node: any): any => {
                  if (!node || typeof node !== 'object') return node
                  if (Array.isArray(node)) {
                    return node.map(normalizeNodeTypes)
                  }
                  const clone = { ...node }
                  if (clone.type === 'imageBlock') {
                    clone.type = 'blockImage'
                  }
                  if (clone.content) {
                    clone.content = normalizeNodeTypes(clone.content)
                  }
                  return clone
                }

                parsed = normalizeNodeTypes(parsed)

                const extractTextFromNode = (n: any): string => {
                  if (!n) return ''
                  if (typeof n === 'string') return n
                  if (n.text) return n.text
                  if (Array.isArray(n.content)) {
                    return n.content.map(extractTextFromNode).join(' ')
                  }
                  if (n.content && typeof n.content === 'object') {
                    return extractTextFromNode(n.content)
                  }
                  return ''
                }

                if (Array.isArray(parsed)) {
                  let chain = editor.chain().focus()
                  for (const node of parsed) {
                    if (node && node.type) {
                      // Check if node type exists in editor schema
                      if (editor.schema.nodes[node.type]) {
                        try {
                          chain = chain.insertContent(node)
                        } catch (err) {
                          console.warn(`Failed to insert valid node type "${node.type}":`, err, node)
                          const text = extractTextFromNode(node)
                          if (text) {
                            chain = chain.insertContent({
                              type: 'paragraph',
                              content: [{ type: 'text', text }]
                            })
                          }
                        }
                      } else {
                        console.warn(`Skipping unknown node type "${node.type}":`, node)
                        const text = extractTextFromNode(node)
                        if (text) {
                          chain = chain.insertContent({
                            type: 'paragraph',
                            content: [{ type: 'text', text }]
                          })
                        }
                      }
                    }
                  }
                  chain.run()
                } else {
                  editor.chain().focus().insertContent(parsed).run()
                }
              } else {
                editor.chain().focus().insertContent(finalContent).run()
              }
            } catch (e) {
              console.error("PDF Content insertion failed:", e)
              editor.chain().focus().insertContent(finalContent).run()
            }

            setStatus('completed')
            toast.success('PDF content imported successfully!')
            
            setTimeout(() => {
              onClose()
              setFile(null)
              setStatus('idle')
              setAiResponse('')
            }, 1500)
          },
          onError: (err) => {
            setError(`${err || 'AI service failed to respond.'} (Sent Activity UUID: "${activityUuid}")`);
            setStatus('idle')
          }
        }
      )
    } catch (err: any) {
      setError(err?.message || 'Failed to parse and import PDF content.')
      setStatus('idle')
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-start justify-center pt-10 md:pt-20 px-4 overflow-y-auto pb-10">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="text-sky-500 animate-pulse" size={20} />
            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
              PDF-to-Course AI Converter
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {status === 'idle' && (
            <div className="flex flex-col items-center">
              <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-sky-500 rounded-2xl p-8 cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-950/20">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="p-3 bg-sky-50 dark:bg-sky-950/20 text-sky-500 rounded-xl mb-3">
                  <Upload size={28} />
                </div>
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  {file ? file.name : 'Select or drop a PDF file'}
                </span>
                <span className="text-xs text-neutral-400 mt-1">
                  We will extract text from this PDF and use AI to create a fully editable course lesson
                </span>
              </label>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-500 mt-4 bg-red-50 dark:bg-red-950/10 p-3 rounded-xl border border-red-100 dark:border-red-950/20 w-full">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {file && (
                <button
                  onClick={handleImport}
                  className="mt-6 w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles size={16} />
                  Convert PDF to Course Content
                </button>
              )}
            </div>
          )}

          {/* Loading / Parsing States */}
          {(status === 'loading_pdfjs' || status === 'parsing' || status === 'sending_ai') && (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 size={36} className="text-sky-500 animate-spin mb-4" />
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {status === 'loading_pdfjs' && 'Loading PDF Parser...'}
                {status === 'parsing' && `Reading pages: Page ${currentPage} of ${totalPages}...`}
                {status === 'sending_ai' && 'Connecting to AI converter...'}
              </p>
              {status === 'parsing' && (
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden mt-4 max-w-xs">
                  <div
                    className="bg-sky-500 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Generating Stream State */}
          {status === 'generating' && (
            <div className="flex flex-col h-full min-h-[300px]">
              <div className="flex items-center gap-2 mb-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-950/30 p-3 rounded-xl">
                <Loader2 size={16} className="text-sky-500 animate-spin shrink-0" />
                <p className="text-xs font-medium text-sky-700 dark:text-sky-400">
                  AI is restructuring the PDF textbook into structured sections, tables, quizzes, and flashcards...
                </p>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex-1 font-mono text-xs overflow-y-auto whitespace-pre-wrap max-h-[40vh] text-neutral-600 dark:text-neutral-400">
                {aiResponse || 'Awaiting response...'}
              </div>
            </div>
          )}

          {/* Completed State */}
          {status === 'completed' && (
            <div className="flex flex-col items-center justify-center py-10">
              <CheckCircle size={48} className="text-emerald-500 animate-bounce mb-3" />
              <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                Import Completed!
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Inserting converted content into your editor...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
