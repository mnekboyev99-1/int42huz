import { NodeViewWrapper } from '@tiptap/react'
import React, { useEffect } from 'react'
import { FileText, Download, Upload, Loader2, AlertCircle, FileSpreadsheet, FileArchive, FileCheck, FileCode } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadNewGenericFile } from '../../../../../services/blocks/File/file'
import { getActivityBlockMediaDirectory } from '@services/media/media'
import { useOrg } from '@components/Contexts/OrgContext'
import { useCourse } from '@components/Contexts/CourseContext'
import { useEditorProvider } from '@components/Contexts/Editor/EditorContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { constructAcceptValue } from '@/lib/constants'
import { useTranslation } from 'react-i18next'

const SUPPORTED_FILES = constructAcceptValue(['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'csv', 'json', 'zip', 'rar'])

// Helper to format file size
function formatBytes(bytes: number, decimals = 2) {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Helper to get matching premium colors & icons for file types
function getFileInfo(format: string) {
  const fmt = format?.toLowerCase() || ''
  if (fmt === 'pdf') {
    return {
      icon: FileText,
      colorClass: 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30',
      label: 'PDF Document'
    }
  }
  if (['docx', 'doc'].includes(fmt)) {
    return {
      icon: FileText,
      colorClass: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30',
      label: 'Word Document'
    }
  }
  if (['xlsx', 'xls', 'csv'].includes(fmt)) {
    return {
      icon: FileSpreadsheet,
      colorClass: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30',
      label: 'Spreadsheet'
    }
  }
  if (['zip', 'rar', '7z'].includes(fmt)) {
    return {
      icon: FileArchive,
      colorClass: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30',
      label: 'Archive File'
    }
  }
  if (['json', 'txt', 'js', 'ts', 'html', 'css'].includes(fmt)) {
    return {
      icon: FileCode,
      colorClass: 'text-violet-500 bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-900/30',
      label: 'Text/Code File'
    }
  }
  return {
    icon: FileCheck,
    colorClass: 'text-neutral-500 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800',
    label: 'File Attachment'
  }
}

function AttachmentBlockComponent(props: any) {
  const { t } = useTranslation()
  const org = useOrg() as any
  const course = useCourse() as any
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token
  const [file, setFile] = React.useState<File | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [blockObject, setblockObject] = React.useState(
    props.node.attrs.blockObject
  )
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const fileId = blockObject
    ? `${blockObject.content.file_id}.${blockObject.content.file_format}`
    : null
    
  const editorState = useEditorProvider() as any
  const isEditable = editorState.isEditable

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setIsLoading(true)
    setError(null)
    try {
      const object = await uploadNewGenericFile(
        file,
        props.extension.options.activity.activity_uuid,
        access_token
      )
      setblockObject(object)
      props.updateAttributes({
        blockObject: object,
      })
      setFile(null)
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to upload attachment. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!fileId) return

    // Resolve file directory dynamic routing name
    const fileUrl = getActivityBlockMediaDirectory(
      org?.org_uuid,
      course?.courseStructure.course_uuid,
      blockObject.content.activity_uuid || props.extension.options.activity.activity_uuid,
      blockObject.block_uuid,
      fileId,
      'fileBlock' // Matches block_type used in fileBlock.py
    )

    const link = document.createElement('a')
    link.href = fileUrl || ''
    link.download = blockObject.content.file_name || `attachment-${blockObject.block_uuid}.${blockObject.content.file_format}`
    link.setAttribute('download', '')
    link.setAttribute('target', '_blank')
    link.setAttribute('rel', 'noopener noreferrer')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const { icon: FileIcon, colorClass, label } = getFileInfo(
    blockObject?.content?.file_format || ''
  )

  // Edit Mode - Empty State / Upload Card
  if (isEditable && !blockObject) {
    return (
      <NodeViewWrapper className="block-attachment my-4">
        <div className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 transition-all hover:border-sky-500">
          <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={SUPPORTED_FILES}
              className="hidden"
            />
            <div className="p-3 bg-sky-50 dark:bg-sky-950/20 text-sky-500 rounded-xl mb-3">
              <Upload size={24} />
            </div>
            
            {file ? (
              <div className="mb-4">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{file.name}</p>
                <p className="text-xs text-neutral-500">{formatBytes(file.size)}</p>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Drag and drop or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sky-600 hover:underline font-semibold"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Supported formats: PDF, DOCX, XLSX, PPTX, ZIP, RAR, TXT, CSV, JSON (Max 500MB)
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-500 mb-3">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {file && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  disabled={isLoading}
                  className="px-4 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-xs font-semibold text-white flex items-center gap-1 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload File'
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </NodeViewWrapper>
    )
  }

  // View mode without file block object
  if (!blockObject) {
    return (
      <NodeViewWrapper className="block-attachment my-4">
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-center gap-3">
          <FileText className="text-neutral-300" size={24} />
          <p className="text-sm text-neutral-500">Empty Attachment Block</p>
        </div>
      </NodeViewWrapper>
    )
  }

  // Premium Download Card (Works in both View and Edit modes once uploaded)
  return (
    <NodeViewWrapper className="block-attachment my-4 select-none">
      <div className="group relative flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:shadow-md transition-all">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`p-3 rounded-xl border flex items-center justify-center shrink-0 ${colorClass}`}>
            <FileIcon size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate pr-4">
              {blockObject?.content?.file_name || 'Attached File'}
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              <span className="font-medium bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded uppercase text-[10px]">
                {blockObject?.content?.file_format || 'File'}
              </span>
              <span>•</span>
              <span>{formatBytes(blockObject?.content?.file_size || 0)}</span>
              <span>•</span>
              <span>{label}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditable && (
            <button
              onClick={() => {
                setblockObject(null)
                props.updateAttributes({
                  blockObject: null,
                })
              }}
              className="p-2 border border-red-200 hover:bg-red-50 text-red-500 rounded-xl transition-all"
              title="Delete Attachment"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
          )}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            title="Download File"
          >
            <Download size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default AttachmentBlockComponent
