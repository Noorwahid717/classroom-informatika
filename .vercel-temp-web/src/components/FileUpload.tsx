'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'
import JSZip from 'jszip'

interface FileUploadProps {
  assignmentId: string
  maxFileSize?: number
  allowedFileTypes?: string
  onUploadSuccess?: (submission: { id: string; filePath: string; submittedAt: string }) => void
  onUploadError?: (error: string) => void
}

interface FileInfo {
  name: string
  size: number
  type: string
  content?: string
}

export default function FileUpload({
  assignmentId,
  maxFileSize = 10485760, // 10MB default
  allowedFileTypes = '.zip',
  onUploadSuccess,
  onUploadError
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileStructure, setFileStructure] = useState<FileInfo[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [description, setDescription] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validate ZIP file structure
  const validateZipFile = async (file: File): Promise<{ isValid: boolean; errors: string[]; structure: FileInfo[] }> => {
    const errors: string[] = []
    const structure: FileInfo[] = []

    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip = new JSZip()
      const zipContent = await zip.loadAsync(arrayBuffer)

      let hasHTML = false
      let hasCSS = false
      let hasJS = false

      for (const [path, zipEntry] of Object.entries(zipContent.files)) {
        if (!zipEntry.dir) {
          const extension = path.split('.').pop()?.toLowerCase()
          const size = 0 // JSZip doesn't expose size easily, set to 0 for now

          structure.push({
            name: path,
            size,
            type: extension || 'unknown'
          })

          // Check file types
          if (extension === 'html') hasHTML = true
          if (extension === 'css') hasCSS = true
          if (extension === 'js') hasJS = true

          // Check for disallowed files
          const allowedExtensions = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.txt', '.md']
          if (!allowedExtensions.some(ext => path.toLowerCase().endsWith(ext))) {
            errors.push(`File type not allowed: ${path}`)
          }
        }
      }

      // Validation rules
      if (!hasHTML) {
        errors.push('ZIP file must contain at least one HTML file')
      }

      if (structure.length === 0) {
        errors.push('ZIP file appears to be empty')
      }

      if (structure.length > 50) {
        errors.push('Too many files (max 50 files)')
      }

      return {
        isValid: errors.length === 0,
        errors,
        structure
      }
    } catch (error) {
      return {
        isValid: false,
        errors: ['Invalid ZIP file format'],
        structure: []
      }
    }
  }

  const handleFileSelect = async (file: File) => {
    setValidationErrors([])
    setFileStructure([])

    // Basic validations
    const errors: string[] = []

    if (file.size > maxFileSize) {
      errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds limit of ${(maxFileSize / 1024 / 1024).toFixed(2)}MB`)
    }

    if (!file.name.toLowerCase().endsWith('.zip')) {
      errors.push('Only ZIP files are allowed')
    }

    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    // Validate ZIP contents
    const validation = await validateZipFile(file)
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    setSelectedFile(file)
    setFileStructure(validation.structure)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('assignmentId', assignmentId)
      formData.append('description', description)

      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()
      setUploadProgress(100)
      
      setTimeout(() => {
        onUploadSuccess?.(result.data)
        resetForm()
      }, 1000)

    } catch (error) {
      console.error('Upload error:', error)
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed')
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setFileStructure([])
    setValidationErrors([])
    setDescription('')
    setIsUploading(false)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = () => {
    resetForm()
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : validationErrors.length > 0
            ? 'border-red-300 bg-red-50'
            : selectedFile
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {!selectedFile ? (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your ZIP file here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse files
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Select File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".zip"
              onChange={handleFileInputChange}
              aria-label="Select ZIP file to upload"
            />
            <p className="text-xs text-gray-400 mt-2">
              Maximum file size: {(maxFileSize / 1024 / 1024).toFixed(2)}MB
            </p>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-700">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)}MB • {fileStructure.length} files
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="text-gray-400 hover:text-gray-600"
                title="Remove selected file"
                aria-label="Remove selected file"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {validationErrors.length === 0 && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">File validated successfully</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-2">
                Validation Errors:
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* File Structure Preview */}
      {fileStructure.length > 0 && validationErrors.length === 0 && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-3">File Structure:</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {fileStructure.map((file, index) => (
              <div key={index} className="flex justify-between text-xs text-gray-600">
                <span className="truncate flex-1">{file.name}</span>
                <span className="ml-2 text-gray-400">
                  {(file.size / 1024).toFixed(1)}KB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description Input */}
      {selectedFile && validationErrors.length === 0 && (
        <div className="mt-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Submission Description (Optional)
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any notes about your submission..."
          />
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && validationErrors.length === 0 && (
        <div className="mt-6">
          {isUploading ? (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          ) : (
            <button
              onClick={handleUpload}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Assignment
            </button>
          )}
        </div>
      )}
    </div>
  )
}