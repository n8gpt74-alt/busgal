'use client'

import { useState } from 'react'
import { documentTemplates, documentCategories, fillTemplate, DocumentTemplate } from '@/data/document-templates'

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('dogovor')
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [generatedDocument, setGeneratedDocument] = useState<string>('')

  const filteredTemplates = documentTemplates.filter(t => t.category === selectedCategory)

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template)
    setFormData({})
    setGeneratedDocument('')
  }

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
  }

  const handleGenerate = () => {
    if (!selectedTemplate) return
    const filled = fillTemplate(selectedTemplate, formData)
    setGeneratedDocument(filled)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDocument)
    alert('Документ скопирован в буфер обмена!')
  }

  const handleDownload = () => {
    const blob = new Blob([generatedDocument], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedTemplate?.name.replace(/\s+/g, '_')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center hover:from-gray-300 hover:to-gray-400 transition-all">
              <span className="text-lg">←</span>
            </a>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <span className="text-xl">📄</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Генератор документов</h1>
              <p className="text-xs text-gray-500 font-medium">Шаблоны для малого бизнеса</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar - Categories & Templates */}
        <div className="w-72 bg-white/60 backdrop-blur-sm border-r border-gray-200/50 overflow-y-auto">
          {/* Categories */}
          <div className="p-4 border-b border-gray-200/50">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Категории</h3>
            <div className="space-y-1">
              {documentCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setSelectedTemplate(null); setGeneratedDocument('') }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedCategory === cat.id 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-gray-700 hover:bg-white/50 hover:shadow-sm'
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span> {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Шаблоны</h3>
            <div className="space-y-2">
              {filteredTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-500/10'
                      : 'border-gray-200/50 bg-white/30 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <p className="font-semibold text-gray-900 text-sm">{template.name}</p>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{template.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedTemplate ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl">📝</span>
                </div>
                <p className="text-xl font-semibold text-gray-700">Выберите шаблон документа</p>
                <p className="text-gray-500 mt-2">Нажмите на шаблон слева</p>
              </div>
            </div>
          ) : generatedDocument ? (
            // Generated Document View
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/50 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedTemplate.name}</h3>
                    <p className="text-sm text-gray-500">Документ готов к использованию</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-all flex items-center gap-2"
                    >
                      📋 Копировать
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                      ⬇️ Скачать
                    </button>
                  </div>
                </div>
                <pre className="p-6 text-sm whitespace-pre-wrap font-mono text-gray-800 overflow-x-auto bg-white">
                  {generatedDocument}
                </pre>
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setGeneratedDocument('')}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  ← Вернуться к редактированию
                </button>
              </div>
            </div>
          ) : (
            // Form View
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                    <p className="text-sm text-gray-500">Заполните поля ниже</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {selectedTemplate.fields.map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'text' || field.type === 'inn' || field.type === 'kpp' || field.type === 'phone' ? (
                        <input
                          type="text"
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 transition-all"
                        />
                      ) : field.type === 'number' ? (
                        <input
                          type="number"
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 transition-all"
                        />
                      ) : field.type === 'date' ? (
                        <input
                          type="date"
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 transition-all"
                        />
                      ) : field.type === 'address' ? (
                        <textarea
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 transition-all resize-none"
                        />
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleGenerate}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25"
                  >
                    Сгенерировать документ
                  </button>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
