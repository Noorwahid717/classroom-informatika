'use client'

import React, { useState, useEffect } from 'react'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Eye, Code, Download, ExternalLink, Folder, FileText } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  { ssr: false }
)

interface FileContent {
  [path: string]: string
}

interface FileStructure {
  [path: string]: {
    size: number
    type: string
  }
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

export default function CodePreview({ 
  submissionId, 
  files = {}, 
  structure = {},
  className = '' 
}: CodePreviewProps) {
  const [activeFile, setActiveFile] = useState<string>('')
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview')
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Build file tree structure
  useEffect(() => {
    const buildFileTree = (files: FileContent, structure: FileStructure): FileNode[] => {
      const tree: { [key: string]: FileNode } = {}
      const roots: FileNode[] = []

      Object.keys(files).forEach(path => {
        const parts = path.split('/')
        let currentLevel = tree

        parts.forEach((part, index) => {
          const fullPath = parts.slice(0, index + 1).join('/')
          
          if (!currentLevel[part]) {
            const isFile = index === parts.length - 1
            currentLevel[part] = {
              name: part,
              path: fullPath,
              type: isFile ? 'file' : 'folder',
              children: isFile ? undefined : [],
              content: isFile ? files[path] : undefined,
              size: isFile ? structure[path]?.size : undefined
            }

            if (index === 0) {
              roots.push(currentLevel[part])
            }
          }

          if (currentLevel[part].children && index < parts.length - 1) {
            const childrenObj: { [key: string]: FileNode } = {}
            currentLevel[part].children!.forEach(child => {
              childrenObj[child.name] = child
            })
            currentLevel = childrenObj
          }
        })
      })

      return roots
    }

    const tree = buildFileTree(files, structure)
    setFileTree(tree)

    // Set default active file (first HTML file or first file)
    const htmlFiles = Object.keys(files).filter(path => path.endsWith('.html'))
    const defaultFile = htmlFiles.find(path => path.includes('index.html')) || 
                       htmlFiles[0] || 
                       Object.keys(files)[0]
    
    if (defaultFile) {
      setActiveFile(defaultFile)
    }
  }, [files, structure])

  // Load submission preview if not provided
  useEffect(() => {
    if (Object.keys(files).length === 0 && submissionId) {
      loadSubmissionPreview()
    }
  }, [submissionId])

  const loadSubmissionPreview = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/submissions/${submissionId}?preview=true`)
      if (!response.ok) {
        throw new Error('Failed to load submission preview')
      }

      const result = await response.json()
      if (result.success && result.data.preview) {
        // Update files and structure from API response
        // This would need to be handled by parent component
      } else {
        throw new Error('Preview not available')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview')
    } finally {
      setLoading(false)
    }
  }

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
  const renderFileTree = (nodes: FileNode[], level: number = 0): React.ReactElement[] => {
    return nodes.map((node) => (
      <div key={node.path} className={`ml-${level * 4}`}>
        <div
          className={`flex items-center space-x-2 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded ${
            activeFile === node.path ? 'bg-blue-50 text-blue-700' : ''
          }`}
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
        {node.children && node.children.length > 0 && (
          <div className="ml-4">
            {renderFileTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  // Generate preview HTML
  const generatePreviewHTML = (): string => {
    const htmlFile = files[activeFile] || Object.values(files).find(content => 
      content.includes('<html') || content.includes('<!DOCTYPE html')
    ) || ''

    if (!htmlFile) return '<h1>No HTML file found</h1>'

    // Inject CSS and JS files into HTML
    let modifiedHTML = htmlFile

    // Find and inject CSS files
    Object.keys(files).forEach(path => {
      if (path.endsWith('.css')) {
        const cssContent = files[path]
        const cssTag = `<style>\n${cssContent}\n</style>`
        
        if (modifiedHTML.includes('</head>')) {
          modifiedHTML = modifiedHTML.replace('</head>', `${cssTag}\n</head>`)
        } else {
          modifiedHTML = `<head>${cssTag}</head>\n${modifiedHTML}`
        }
      }
    })

    // Find and inject JS files
    Object.keys(files).forEach(path => {
      if (path.endsWith('.js')) {
        const jsContent = files[path]
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
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
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

  if (Object.keys(files).length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <p className="text-gray-500">No files to preview</p>
      </div>
    )
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            {previewMode === 'preview' && (
              <Button variant="outline" size="sm">
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
              {activeFile && files[activeFile] ? (
                <MonacoEditor
                  height="100%"
                  language={getFileLanguage(activeFile)}
                  value={files[activeFile]}
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