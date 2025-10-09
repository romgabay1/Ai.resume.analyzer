import React from 'react'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { formatSize } from '../lib/utils'

interface FileUploaderProps {
    onFileSelect: (file: File | null) => void;
}

const FileUploader = ({onFileSelect}: FileUploaderProps) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;

        onFileSelect?.(file);
    }, [onFileSelect])

    const { getRootProps, getInputProps, isDragActive, acceptedFiles, fileRejections } = useDropzone({
        onDrop,
        multiple: false,
        accept:{'application/pdf': ['.pdf']},
        maxSize: 20 *1024*1024,
        noClick: false,
        noKeyboard: false,
    })
    const file = acceptedFiles[0] || null;
    const maxSize = 20 * 1024 * 1024; // 20MB
    const rejectedFile = fileRejections[0] || null;

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFileSelect?.(null);
    };
    
  return (
    <div className="w-full gradient-border">
    <div {...getRootProps()} className={`uplader-drag-area ${file ? '!min-h-0' : ''}`}>
        <input {...getInputProps()} />
        <div className="space-y-4 cursor-pointer">
            
            {file ? (
               <div className="uploader-selected-file" onClick={(e)=>e.stopPropagation()}>
              <img src="/images/pdf.png" alt="PDF" className="size-10" />

                <div className="flex items-center space-x-3">
                    <div>
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                    </div>
                </div>
                <button className="p-2 cursor-pointer" onClick={handleRemove}>
                    <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                </button>
               </div>
            ) : rejectedFile ? (
                
                <div className="text-center space-y-2">
                    <img src="/icons/warning.svg" alt="Warning" className="mx-auto w-16 h-16" />
                    <p className="text-lg font-semibold text-red-600">File Rejected</p>
                    <p className="text-sm text-gray-700">{rejectedFile.file.name}</p>
                    <p className="text-sm text-gray-500">{formatSize(rejectedFile.file.size)}</p>
                    {rejectedFile.errors.map((error) => (
                        <p key={error.code} className="text-sm text-red-500">
                            {error.code === 'file-too-large' 
                                ? `File size exceeds ${formatSize(maxSize)}` 
                                : error.message}
                        </p>
                    ))}
                </div>
            ) : (
                <div>
                    <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                      <img src="/icons/info.svg" alt="upload" className="size-20"/>
                     </div>
                    <p className="text-lg text-gray-500">
                        <span className="font-semibold"> Click to Upload </span>
                          or drag and drop
                    </p>
                    <p className="text-lg text-gray-500"> PDF (max 20MB) </p>
                </div>
            )}
            

            
        </div>
    </div>
    </div>
  )
}

export default FileUploader