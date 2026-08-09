import { NodeViewWrapper } from '@tiptap/react'
import React, { useRef, useState, useEffect } from 'react'
import { Images, ChevronLeft, ChevronRight, Upload, Loader2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadNewImageFile } from '../../../../../services/blocks/Image/images'
import { getActivityBlockMediaDirectory } from '@services/media/media'
import { useOrg } from '@components/Contexts/OrgContext'
import { useCourse } from '@components/Contexts/CourseContext'
import { useEditorProvider } from '@components/Contexts/Editor/EditorContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { constructAcceptValue } from '@/lib/constants'
import { useTranslation } from 'react-i18next'
import ImageDRMWatermark from '../../Utils/ImageDRMWatermark'
import ImageCropModal from '../../Utils/ImageCropModal'

const SUPPORTED_FILES = constructAcceptValue(['jpg', 'png', 'webp', 'gif'])

function SliderBlockComponent(props: any) {
  const { t } = useTranslation()
  const org = useOrg() as any
  const course = useCourse() as any
  const editorState = useEditorProvider() as any
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token

  const isEditable = editorState.isEditable
  const [isLoading, setIsLoading] = useState(false)
  const [slides, setSlides] = useState<any[]>(props.node.attrs.slides || [])
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [pendingCropImage, setPendingCropImage] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleUpload = async (file: File) => {
    if (!access_token) return
    setIsLoading(true)
    try {
      const object = await uploadNewImageFile(
        file,
        props.extension.options.activity.activity_uuid,
        access_token
      )
      const newSlides = [...slides, object]
      setSlides(newSlides)
      props.updateAttributes({ slides: newSlides })
      setCurrentIndex(newSlides.length - 1)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload image.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 1) {
      setPendingCropImage(files[0])
      setCropModalOpen(true)
    } else if (files.length > 1) {
      // Multiple uploads - skip cropping
      uploadMultiple(files)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadMultiple = async (files: File[]) => {
    if (!access_token) return
    setIsLoading(true)
    const newSlides = [...slides]
    for (const file of files) {
      try {
        const object = await uploadNewImageFile(
          file,
          props.extension.options.activity.activity_uuid,
          access_token
        )
        newSlides.push(object)
      } catch (err) {
        console.error('Failed file', file.name)
      }
    }
    setSlides(newSlides)
    props.updateAttributes({ slides: newSlides })
    setIsLoading(false)
  }

  const handleCropComplete = (croppedFile: File) => {
    handleUpload(croppedFile)
  }

  const removeSlide = (index: number) => {
    const newSlides = [...slides]
    newSlides.splice(index, 1)
    setSlides(newSlides)
    props.updateAttributes({ slides: newSlides })
    if (currentIndex >= newSlides.length) {
      setCurrentIndex(Math.max(0, newSlides.length - 1))
    }
  }

  const getImageUrl = (blockObject: any) => {
    if (!blockObject) return ''
    const fileId = `${blockObject.content.file_id}.${blockObject.content.file_format}`
    return getActivityBlockMediaDirectory(
      org?.org_uuid,
      course?.courseStructure?.course_uuid,
      blockObject.content.activity_uuid || props.extension.options.activity.activity_uuid,
      blockObject.block_uuid,
      fileId,
      'imageBlock' // Using imageBlock endpoint as they share same upload logic usually
    ) || ''
  }

  const scrollNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const scrollPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  useEffect(() => {
    if (sliderRef.current) {
      const slideEl = sliderRef.current.children[currentIndex] as HTMLElement
      if (slideEl) {
        sliderRef.current.scrollTo({
          left: slideEl.offsetLeft,
          behavior: 'smooth'
        })
      }
    }
  }, [currentIndex])

  return (
    <NodeViewWrapper className="block-slider w-full my-4">
      <div className="bg-neutral-900 rounded-xl px-5 py-4 nice-shadow transition-all relative overflow-hidden">
        
        {/* Editor Controls */}
        {isEditable && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Images className="text-neutral-400" size={16} />
              <span className="uppercase tracking-widest text-xs font-bold text-neutral-400">
                Slayder (Rasmlar to'plami)
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleImageChange}
                accept={SUPPORTED_FILES}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Rasm qo'shish
              </button>
            </div>
          </div>
        )}

        {slides.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <Images className="w-12 h-12 mx-auto mb-3 text-neutral-500" />
            <p className="text-sm text-white">Slayderda rasmlar yo'q</p>
          </div>
        ) : (
          <div className="relative group">
            {/* Slider Track */}
            <div 
              ref={sliderRef}
              className="flex overflow-hidden snap-x snap-mandatory hide-scrollbar rounded-lg"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {slides.map((slide, idx) => (
                <div 
                  key={idx} 
                  className="w-full flex-shrink-0 snap-center relative aspect-video flex items-center justify-center bg-black"
                >
                  <img
                    src={getImageUrl(slide)}
                    alt={`Slide ${idx + 1}`}
                    className="max-w-full max-h-full object-contain pointer-events-none"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <ImageDRMWatermark />
                  
                  {isEditable && (
                    <button
                      onClick={() => removeSlide(idx)}
                      className="absolute top-3 right-3 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors z-50 opacity-0 group-hover:opacity-100"
                      title="O'chirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            {slides.length > 1 && (
              <>
                <button 
                  onClick={scrollPrev}
                  disabled={currentIndex === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-50 opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={scrollNext}
                  disabled={currentIndex === slides.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-50 opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Dots */}
            {slides.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-50">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => {
          setCropModalOpen(false)
          setPendingCropImage(null)
        }}
        imageFile={pendingCropImage}
        onCropComplete={handleCropComplete}
      />
    </NodeViewWrapper>
  )
}

export default SliderBlockComponent
