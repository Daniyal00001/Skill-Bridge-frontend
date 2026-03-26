import { FileText, FileArchive, Download, File } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AttachmentPreviewProps {
  fileUrl: string
  fileName?: string | null
  fileSize?: number | null
  fileMimeType?: string | null
  isOwn?: boolean
}

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(mime?: string | null) {
  if (!mime) return <File className="h-5 w-5" />
  if (mime === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />
  if (mime.includes('zip') || mime.includes('compressed'))
    return <FileArchive className="h-5 w-5 text-yellow-500" />
  if (mime.includes('word') || mime.includes('document'))
    return <FileText className="h-5 w-5 text-blue-500" />
  return <File className="h-5 w-5 text-muted-foreground" />
}

export function AttachmentPreview({ fileUrl, fileName, fileSize, fileMimeType, isOwn }: AttachmentPreviewProps) {
  const isImage = fileMimeType?.startsWith('image/')

  if (isImage) {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
        <img
          src={fileUrl}
          alt={fileName ?? 'attachment'}
          className="max-w-[240px] max-h-[200px] rounded-xl object-cover mt-1 shadow hover:opacity-90 transition-opacity cursor-pointer"
        />
      </a>
    )
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      download={fileName ?? true}
      className={cn(
        'flex items-center gap-3 py-2 px-3 rounded-xl mt-1 min-w-[180px] max-w-[260px] transition-all',
        isOwn
          ? 'bg-primary/20 hover:bg-primary/30 text-primary-foreground'
          : 'bg-muted hover:bg-muted/80 text-foreground border border-border/50'
      )}
    >
      <div className="flex-shrink-0">{getFileIcon(fileMimeType)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{fileName ?? 'File'}</p>
        {fileSize && <p className="text-[10px] opacity-70">{formatFileSize(fileSize)}</p>}
      </div>
      <Download className="h-4 w-4 flex-shrink-0 opacity-60" />
    </a>
  )
}
