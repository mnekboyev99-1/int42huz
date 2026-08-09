'use client'
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Upload, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { uploadOrgFont, deleteOrgFont } from '@services/settings/org'
import { useOrg } from '@components/Contexts/OrgContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { mutate } from 'swr'
import { getAPIUrl } from '@services/config/config'
import toast from 'react-hot-toast'

interface FontManagerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FontManagerModal({ isOpen, onClose }: FontManagerModalProps) {
  const org = useOrg() as any
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token

  const [fontName, setFontName] = useState('')
  const [fontFile, setFontFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Listen for Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!isOpen || !org) return null

  const customFonts =
    org.config?.config?.customization?.general?.custom_fonts ||
    org.config?.config?.custom_fonts ||
    []

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFontFile(file)
      // Auto-populate name if empty
      if (!fontName) {
        const baseName = file.name.substring(0, file.name.lastIndexOf('.'))
        setFontName(baseName.replace(/[-_]/g, ' '))
      }
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fontFile || !fontName.trim() || !accessToken) return

    setIsUploading(true)
    try {
      await uploadOrgFont(org.id, fontName.trim(), fontFile, accessToken)
      toast.success('Font successfully uploaded!')
      setFontName('')
      setFontFile(null)
      // Reset input
      const fileInput = document.getElementById('font-file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
      // Refresh SWR
      await mutate(`${getAPIUrl()}orgs/slug/${org.slug}`)
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (name: string) => {
    if (!accessToken) return
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    setIsDeleting(name)
    try {
      await deleteOrgFont(org.id, name, accessToken)
      toast.success('Font successfully deleted!')
      // Refresh SWR
      await mutate(`${getAPIUrl()}orgs/slug/${org.slug}`)
    } catch (err: any) {
      toast.error(err.message || 'Delete failed')
    } finally {
      setIsDeleting(null)
    }
  }

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer overflow-y-auto p-4 pt-10 md:pt-20"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Custom Font Manager</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Upload Form */}
          <form onSubmit={handleUpload} className="space-y-4 bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
            <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Upload New Font</h4>
            
            <div className="grid gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Font Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Custom Sans"
                  value={fontName}
                  onChange={(e) => setFontName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Font File (.ttf, .otf, .woff, .woff2)
                </label>
                <input
                  id="font-file-input"
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={handleFileChange}
                  className="w-full text-sm text-neutral-500 dark:text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 dark:file:bg-sky-950/30 dark:file:text-sky-400 hover:file:bg-sky-100 dark:hover:file:bg-sky-900/50 cursor-pointer"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading || !fontFile || !fontName.trim()}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Upload Font</span>
                </>
              )}
            </button>
          </form>

          {/* List custom fonts */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Installed Fonts</h4>
            
            {customFonts.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 py-4 justify-center">
                <AlertCircle size={16} />
                <span>No custom fonts installed yet.</span>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
                {customFonts.map((font: any) => (
                  <div key={font.name} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors">
                    <span 
                      className="text-sm font-medium text-neutral-900 dark:text-white"
                      style={{ fontFamily: `'${font.name}'` }}
                    >
                      {font.name}
                    </span>
                    <button
                      onClick={() => handleDelete(font.name)}
                      disabled={isDeleting === font.name}
                      className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
                      title="Delete Font"
                    >
                      {isDeleting === font.name ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}
