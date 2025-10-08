'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Eye, Code, ExternalLink, Folder, FileText } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  { ssr: false }
)

interface FileContent {
  [path: string]: string
}

interface FileStructureEntry {
  size?: number
  type?: string
}

interface FileStructure {
  [path: string]: FileStructureEntry
}

interface CodePreviewProps {
  submissionId: string
  files?: FileContent
  structure?: FileStructure
  className?: string
}

interface FileNode {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileNode[]
  content?: string
  size?: number
}

const buildFileTree = (files: FileContent, structure: FileStructure): FileNode[] => {
  const roots: FileNode[] = []

  Object.keys(files).forEach((path) => {
    const parts = path.split('/')
    let currentLevel = roots
    let accumulatedPath = ''

    parts.forEach((part, index) => {
      accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part
      const existingNode = currentLevel.find((node) => node.name === part)
      const isFile = index === parts.length - 1

      if (existingNode) {
        if (!isFile && existingNode.children) {
          currentLevel = existingNode.children
        }
        return
      }

      const node: FileNode = {
        name: part,
        path: accumulatedPath,
        type: isFile ? 'file' : 'folder',
        ...(isFile
          ? {
              content: files[path],
              size: structure[path]?.size
            }
          : { children: [] })
      }

      currentLevel.push(node)

      if (!isFile && node.children) {
        currentLevel = node.children
      }
    })
  })

  return roots
}

const normalizeStructure = (
  structure: FileStructure | string[] | undefined,
  files: FileContent
): FileStructure => {
  if (!structure) {
    return {}
  }

  if (Array.isArray(structure)) {
    return structure.reduce((acc, path) => {
      const content = files[path] ?? ''
      const size = typeof TextEncoder !== 'undefined'
        ? new TextEncoder().encode(content).length
        : content.length

      acc[path] = {
        size,
        type: 'file'
      }
      return acc
    }, {} as FileStructure)
  }

  return structure
}

export default function CodePreview({
  submissionId,
  files,
  structure,
  className
}: CodePreviewProps) {
  const [activeFile, setActiveFile] = useState<string>('')
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview')
  const [codeFiles, setCodeFiles] = useState<FileContent>(() => files ?? {})
  const [fileStructure, setFileStructure] = useState<FileStructure>((): FileStructure =>
    normalizeStructure(structure, files ?? {})
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerClassName = className ?? ''

  const fileTree = useMemo(() => buildFileTree(codeFiles, fileStructure), [codeFiles, fileStructure])

  useEffect(() => {
    if (files) {
      setCodeFiles(files)
    }
  }, [files])

  useEffect(() => {
    if (structure) {
      setFileStructure(normalizeStructure(structure, files ?? {}))
    }
  }, [structure, files])

  useEffect(() => {
    if (!Object.keys(codeFiles).length) {
      return
    }

    const filePaths = Object.keys(codeFiles)
    const htmlFiles = filePaths.filter((path) => path.endsWith('.html'))
    const defaultFile =
      htmlFiles.find((path) => path.includes('index.html')) || htmlFiles[0] || filePaths[0]

    setActiveFile((current) => (current && codeFiles[current] ? current : defaultFile))
  }, [codeFiles])

  const loadSubmissionPreview = useCallback(async () => {
    if (!submissionId) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/submissions/${submissionId}?preview=true`)
      if (!response.ok) {
        throw new Error('Failed to load submission preview')
      }

      const result = await response.json()
      const preview = result?.data?.preview

      if (result.success && preview?.files) {
        setCodeFiles(preview.files)
        setFileStructure(normalizeStructure(preview.structure, preview.files))
      } else {
        throw new Error('Preview not available')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview')
    } finally {
      setLoading(false)
    }
  }, [submissionId])

  useEffect(() => {
    if (!submissionId || loading || error) {
      return
    }

    if (Object.keys(codeFiles).length === 0) {
      void loadSubmissionPreview()
    }
  }, [submissionId, codeFiles, loadSubmissionPreview, loading, error])

  // Get file language for Monaco Editor
  const getFileLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'html': return 'html'
      case 'css': return 'css'
      case 'js': return 'javascript'
      case 'json': return 'json'
      case 'md': return 'markdown'
      case 'txt': return 'plaintext'
      default: return 'plaintext'
    }
  }

  // Get file icon
  const getFileIcon = (filename: string, isFolder: boolean = false) => {
    if (isFolder) return <Folder className="h-4 w-4 text-blue-500" />
    
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'html': return <FileText className="h-4 w-4 text-orange-500" />
      case 'css': return <FileText className="h-4 w-4 text-blue-500" />
      case 'js': return <FileText className="h-4 w-4 text-yellow-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  // Render file tree
  const renderFileTree = (nodes: FileNode[], level: number = 0): React.ReactElement[] =>
    nodes.map((node) => (
      <div key={node.path}>
        <div
          className={`flex items-center space-x-2 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded ${
            activeFile === node.path ? 'bg-blue-50 text-blue-700' : ''
          }`}
          style={{ paddingLeft: level * 16 }}
          onClick={() => node.type === 'file' && setActiveFile(node.path)}
        >
          {getFileIcon(node.name, node.type === 'folder')}
          <span className="text-sm truncate">{node.name}</span>
          {node.size && (
            <span className="text-xs text-gray-400 ml-auto">
              {(node.size / 1024).toFixed(1)}KB
            </span>
          )}
        </div>
        {node.children && node.children.length > 0 && renderFileTree(node.children, level + 1)}
      </div>
    ))

  // Generate preview HTML
  const generatePreviewHTML = (): string => {
    const htmlFile = codeFiles[activeFile] || Object.values(codeFiles).find(content =>
      content.includes('<html') || content.includes('<!DOCTYPE html')
    ) || ''

    if (!htmlFile) return '<h1>No HTML file found</h1>'

    // Inject CSS and JS files into HTML
    let modifiedHTML = htmlFile

    // Find and inject CSS files
    Object.keys(codeFiles).forEach(path => {
      if (path.endsWith('.css')) {
        const cssContent = codeFiles[path]
        const cssTag = `<style>\n${cssContent}\n</style>`
        
        if (modifiedHTML.includes('</head>')) {
          modifiedHTML = modifiedHTML.replace('</head>', `${cssTag}\n</head>`)
        } else {
          modifiedHTML = `<head>${cssTag}</head>\n${modifiedHTML}`
        }
      }
    })

    // Find and inject JS files
    Object.keys(codeFiles).forEach(path => {
      if (path.endsWith('.js')) {
        const jsContent = codeFiles[path]
        const scriptTag = `<script>\n${jsContent}\n</script>`
        
        if (modifiedHTML.includes('</body>')) {
          modifiedHTML = modifiedHTML.replace('</body>', `${scriptTag}\n</body>`)
        } else {
          modifiedHTML = `${modifiedHTML}\n${scriptTag}`
        }
      }
    })

    return modifiedHTML
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${containerClassName}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-64 ${containerClassName}`}>
        <div className="text-center text-red-600">
          <p className="mb-2">Error loading preview</p>
          <p className="text-sm">{error}</p>
          <Button
            onClick={loadSubmissionPreview}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (Object.keys(codeFiles).length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${containerClassName}`}>
        <p className="text-gray-500">No files to preview</p>
      </div>
    )
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${containerClassName}`}>
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={previewMode === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('preview')}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button
              variant={previewMode === 'code' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('code')}
            >
              <Code className="h-4 w-4 mr-1" />
              Code
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            {previewMode === 'preview' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const previewHTML = generatePreviewHTML()
                  const newTab = window.open()

                  if (newTab) {
                    newTab.document.write(previewHTML)
                    newTab.document.close()
                  }
                }}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open in New Tab
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-96">
        {/* File Tree Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Files</h3>
            {renderFileTree(fileTree)}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {previewMode === 'preview' ? (
            <iframe
              srcDoc={generatePreviewHTML()}
              className="w-full h-full"
              title="Code Preview"
              sandbox="allow-scripts allow-modals"
            />
          ) : (
            <div className="h-full">
              {activeFile && codeFiles[activeFile] ? (
                <MonacoEditor
                  height="100%"
                  language={getFileLanguage(activeFile)}
                  value={codeFiles[activeFile]}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    wordWrap: 'on',
                    theme: 'vs-light'
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a file to view its content
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}