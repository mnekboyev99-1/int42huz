import React, { useState, useRef, useEffect } from 'react'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import Modal from '@components/Objects/StyledElements/Modal/Modal'
import { Crop as CropIcon, Check, X } from 'lucide-react'

interface ImageCropModalProps {
  isOpen: boolean
  onClose: () => void
  imageFile?: File | null
  imageUrl?: string | null
  onCropComplete: (croppedFile: File) => void
}

function ImageCropModal({ isOpen, onClose, imageFile, imageUrl, onCropComplete }: ImageCropModalProps) {
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader()
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || '')
      )
      reader.readAsDataURL(imageFile)
    } else if (imageUrl) {
      setImgSrc(imageUrl)
    } else {
      setImgSrc('')
    }
  }, [imageFile, imageUrl])

  const getCroppedImg = async (
    image: HTMLImageElement,
    crop: PixelCrop,
    fileName: string
  ): Promise<File> => {
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'))
            return
          }
          const file = new File([blob], fileName, {
            type: imageFile?.type || 'image/jpeg',
            lastModified: Date.now(),
          })
          resolve(file)
        },
        imageFile?.type || 'image/jpeg',
        1
      )
    })
  }

  const handleSave = async () => {
    if (completedCrop && imgRef.current && (imageFile || imageUrl)) {
      try {
        const originalName = imageFile?.name || `cropped-${Date.now()}.jpg`
        
        // Agar rasm URL dan kelgan bo'lsa crossOrigin muammosi chiqmasligi uchun uni proxy qilib yoki image.crossOrigin='anonymous' qilib yozgan ma'qul.
        // Lekin bizda rasm o'z serverimizdan keladi, muammo bo'lmasligi kerak.
        const croppedFile = await getCroppedImg(
          imgRef.current,
          completedCrop,
          originalName
        )
        onCropComplete(croppedFile)
        onClose()
      } catch (e) {
        console.error('Failed to crop image', e)
      }
    } else if (imageFile) {
      onCropComplete(imageFile)
      onClose()
    } else {
      onClose()
    }
  }

  return (
    <Modal
      isDialogOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      dialogTitle={
        <div className="flex items-center gap-2 text-zinc-800">
          <CropIcon size={18} />
          <span>Rasmni Qirqish (Crop)</span>
        </div>
      }
      minWidth="2xl"
      dialogContent={
        <div className="flex flex-col items-center">
          {imgSrc && (
            <div className="max-h-[60vh] overflow-auto bg-neutral-900 rounded-lg nice-shadow flex items-center justify-center p-4 w-full">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  className="max-h-[50vh] object-contain"
                  crossOrigin="anonymous"
                  onLoad={(e) => {
                    const { width, height } = e.currentTarget
                    // Initial crop set to 90% of center
                    setCrop({
                      unit: '%',
                      width: 90,
                      height: 90,
                      x: 5,
                      y: 5
                    })
                  }}
                />
              </ReactCrop>
            </div>
          )}

          <div className="flex justify-end gap-3 w-full mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <X size={16} />
              Bekor qilish
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Check size={16} />
              Saqlash va Yuklash
            </button>
          </div>
        </div>
      }
    />
  )
}

export default ImageCropModal
