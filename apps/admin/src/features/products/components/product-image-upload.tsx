import { ImagePlus, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGES } from '../data/data'

type ProductImageUploadProps = {
  value: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
}

type PreviewItem = {
  file: File
  url: string
}

export function ProductImageUpload({
  value,
  onChange,
  disabled = false,
}: ProductImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const previews = useMemo<PreviewItem[]>(
    () =>
      value.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [value]
  )

  useEffect(() => {
    return () => {
      previews.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [previews])

  const appendFiles = useCallback(
    (incoming: FileList | File[]) => {
      const files = Array.from(incoming)
      if (files.length === 0) return

      const merged = [...value, ...files].slice(0, MAX_IMAGES)
      onChange(merged)
    },
    [onChange, value]
  )

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    if (disabled) return
    appendFiles(event.dataTransfer.files)
  }

  const canAddMore = value.length < MAX_IMAGES

  return (
    <div className="space-y-3">
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {previews.map((item, index) => (
            <div
              key={`${item.file.name}-${item.file.size}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              <img
                src={item.url}
                alt={item.file.name}
                className="h-full w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute end-1 top-1 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleRemove(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">删除图片</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              inputRef.current?.click()
            }
          }}
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
            disabled && 'pointer-events-none opacity-50'
          )}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">点击或拖拽图片到此处上传</p>
            <p className="text-xs text-muted-foreground">
              支持 JPEG、PNG、WebP，单张不超过 5MB，最多 {MAX_IMAGES} 张
            </p>
            <p className="text-xs text-muted-foreground">
              已上传 {value.length}/{MAX_IMAGES}
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          if (event.target.files) {
            appendFiles(event.target.files)
            event.target.value = ''
          }
        }}
      />
    </div>
  )
}
