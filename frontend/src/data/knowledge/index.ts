/**
 * RAG (Retrieval Augmented Generation) система для AI-бухгалтера
 * 
 * Модуль поиска релевантных документов по вопросу пользователя
 * Использует семантическое сопоставление ключевых слов
 */

import usn from './usn.md?raw'
import patent from './patent.md?raw'
import selfemployed from './selfemployed.md?raw'
import ooo from './ooo.md?raw'
import contributions from './contributions.md?raw'

// Все документы базы знаний
export const knowledgeDocuments: Record<string, KnowledgeDocument> = {
  usn: {
    id: 'usn',
    title: 'УСН (Упрощённая система налогообложения)',
    file: 'usn.md',
    content: usn,
    keywords: [
      'усн', 'упрощенка', 'упрощенная система', 'доходы', 'расходы',
      '6 процентов', '15 процентов', 'ставка', 'авансовый платеж',
      'декларация', 'книгу учета доходов', 'кудир', 'лимит',
      '265 миллионов', '130 сотрудников', 'минимальный налог',
      'вычет', 'уменьшение налога', 'взносы', 'переход', 'совмещение'
    ],
    applicableTo: ['ip_usn', 'ooo']
  },
  patent: {
    id: 'patent',
    title: 'Патентная система (ПСН)',
    file: 'patent.md',
    content: patent,
    keywords: [
      'патент', 'псн', 'патентная система', 'стоимость патента',
      'потенциальный доход', '6 процентов', 'регион', 'лимит',
      '60 миллионов', '15 сотрудников', 'вид деятельности',
      'срок патента', 'оплата патента', 'превышение лимита'
    ],
    applicableTo: ['ip_patent']
  },
  selfemployed: {
    id: 'selfemployed',
    title: 'Самозанятые (НПД)',
    file: 'selfemployed.md',
    content: selfemployed,
    keywords: [
      'самозанятый', 'самозанятость', 'налог на профессиональный доход',
      'ндп', 'моя налог', 'чек', '4 процента', '6 процентов',
      '2 миллиона', '4 миллиона', 'лимит', 'вычет', '10 тысяч',
      'приложение', 'регистрация', 'превышение', 'совмещение'
    ],
    applicableTo: ['selfemployed']
  },
  ooo: {
    id: 'ooo',
    title: 'ООО (Общество с ограниченной ответственностью)',
    file: 'ooo.md',
    content: ooo,
    keywords: [
      'ооо', 'общество с ограниченной ответственностью', 'учредитель',
      'уставной капитал', 'генеральный директор', 'дивиденд',
      'решение участников', 'доля', 'регистрация', 'ликвидация',
      'бухгалтерский учет', 'баланс', 'отчетность', '2-ндфл', '6-ндфл'
    ],
    applicableTo: ['ooo']
  },
  contributions: {
    id: 'contributions',
    title: 'Страховые взносы',
    file: 'contributions.md',
    content: contributions,
    keywords: [
      'взнос', 'взносы', 'страховой', 'пенсионный', 'фомс', 'фсс',
      'пфр', 'сфр', 'фиксированный', '1 процент', '300 тысяч',
      '70 тысяч', 'лимит', '2 миллиона', '400 тысяч', '257 тысяч',
      'мсп', 'льгота', 'тариф', 'вычет', 'уменьшение'
    ],
    applicableTo: ['ip_usn', 'ip_patent', 'ooo', 'selfemployed']
  }
}

export interface KnowledgeDocument {
  id: string
  title: string
  file: string
  content: string
  keywords: string[]
  applicableTo: string[]
}

/**
 * Результат поиска документов
 */
export interface SearchResult {
  document: KnowledgeDocument
  score: number
  matchedKeywords: string[]
}

/**
 * Семантический поиск релевантных документов
 * 
 * @param query - вопрос пользователя
 * @param userType - тип налогоплательщика (ip_usn, ip_patent, selfemployed, ooo)
 * @param maxResults - максимальное количество результатов (по умолчанию 3)
 * @returns отсортированный массив результатов
 */
export function searchKnowledge(
  query: string, 
  userType: string = 'ip_usn',
  maxResults: number = 3
): SearchResult[] {
  const normalizedQuery = query.toLowerCase()
  
  // Разбиваем запрос на слова и расширяем семантику
  const queryWords = expandQuery(normalizedQuery)
  
  const results: SearchResult[] = []
  
  for (const doc of Object.values(knowledgeDocuments)) {
    // Пропускаем документы, неприменимые к данному типу пользователя
    if (!doc.applicableTo.includes(userType) && doc.id !== 'contributions') {
      continue
    }
    
    let score = 0
    const matchedKeywords: string[] = []
    
    // Подсчёт совпадений ключевых слов
    for (const keyword of doc.keywords) {
      if (queryWords.some(word => keyword.includes(word) || word.includes(keyword))) {
        score += 1
        matchedKeywords.push(keyword)
      }
    }
    
    // Бонус за прямое совпадение в заголовке
    if (doc.title.toLowerCase().includes(queryWords[0]) || 
        queryWords.some(w => doc.title.toLowerCase().includes(w))) {
      score += 5
    }
    
    // Бонус за совпадение в первых абзацах (более релевантная информация)
    const firstParagraphs = doc.content.split('\n').slice(0, 20).join(' ')
    if (queryWords.some(word => firstParagraphs.toLowerCase().includes(word))) {
      score += 2
    }
    
    // Документы по взносам добавляем всегда, если вопрос о них
    if (score > 0 || doc.id === 'contributions') {
      results.push({
        document: doc,
        score,
        matchedKeywords: [...new Set(matchedKeywords)]
      })
    }
  }
  
  // Сортируем по убыванию релевантности
  results.sort((a, b) => b.score - a.score)
  
  // Возвращаем топ-N результатов
  return results.slice(0, maxResults)
}

/**
 * Расширение запроса для лучшего поиска
 * Добавляем синонимы и связанные термины
 */
function expandQuery(query: string): string[] {
  const words = query.split(/\s+/).filter(w => w.length > 2)
  
  // Синонимы и связанные термины
  const synonyms: Record<string, string[]> = {
    'налог': ['налог', 'налогов', 'налога', 'налогу', 'налогом', 'уплата', 'платить', 'платеж'],
    'упрощен': ['усн', 'упрощенк', 'упрощенная', 'упрощён'],
    'ип': ['ип', 'предприниматель', 'индивидуальн'],
    'взнос': ['взнос', 'взносы', 'взносов', 'страхов'],
    'ставка': ['ставк', 'процент', 'процентов', 'размер'],
    'срок': ['срок', 'сроки', 'дедлайн', 'когда', 'до'],
    'отчет': ['отчет', 'отчетност', 'декларац', 'сдавать', 'подавать'],
    'лимит': ['лимит', 'огранич', 'максимум', 'не более'],
    'доход': ['доход', 'выручк', 'получил', 'прибыль'],
    'расход': ['расход', 'затрат', 'потратил', 'покупк'],
    'сотрудник': ['сотрудник', 'работник', 'персонал', 'нанял'],
    'штраф': ['штраф', 'пеня', 'неустойк', 'ответственност'],
    'кбк': ['кбк', 'реквизит', 'платежн'],
    'вычет': ['вычет', 'уменьшить', 'снизить', 'экономия'],
    'регистрац': ['регистрац', 'открыть', 'оформить', 'создать'],
    'патент': ['патент', 'псн'],
    'самозанят': ['самозанят', 'ндп', 'моя налог'],
    'ооо': ['ооо', 'обществ', 'юридическ'],
    'страхов': ['страхов', 'взнос', 'пенсион', 'медицин']
  }
  
  const expanded = new Set<string>(words)
  
  // Добавляем синонимы
  for (const word of words) {
    for (const [key, syns] of Object.entries(synonyms)) {
      if (key.includes(word) || word.includes(key)) {
        syns.forEach(s => expanded.add(s))
      }
    }
  }
  
  return Array.from(expanded)
}

/**
 * Получить контекст для промпта из найденных документов
 * 
 * @param results - результаты поиска
 * @param maxChars - максимальное количество символов (по умолчанию 3000)
 * @returns форматированный контекст для LLM
 */
export function buildContextFromResults(
  results: SearchResult[], 
  maxChars: number = 3000
): string {
  if (results.length === 0) {
    return ''
  }
  
  let context = '## Релевантная информация из базы знаний:\n\n'
  
  let totalChars = context.length
  
  for (const result of results) {
    if (result.score === 0) continue
    
    const docTitle = result.document.title
    const matchedInfo = result.matchedKeywords.length > 0 
      ? `\n*Найдено по ключевым словам: ${result.matchedKeywords.slice(0, 5).join(', ')}*`
      : ''
    
    // Ограничиваем длину документа
    let docContent = result.document.content
    const remainingChars = maxChars - totalChars - docTitle.length - matchedInfo.length - 100
    
    if (remainingChars < 500) {
      // Берём только начало документа, если места мало
      docContent = docContent.split('\n').slice(0, 30).join('\n')
    } else if (docContent.length > remainingChars) {
      // Режим поиска наиболее релевантных частей
      docContent = extractRelevantSections(docContent, result.matchedKeywords)
    }
    
    context += `### ${docTitle}${matchedInfo}\n\n`
    context += docContent + '\n\n'
    context += '---\n\n'
    
    totalChars = context.length
    
    if (totalChars > maxChars) break
  }
  
  return context
}

/**
 * Извлечение наиболее релевантных секций из документа
 */
function extractRelevantSections(content: string, keywords: string[]): string {
  const lines = content.split('\n')
  const relevantLines: string[] = []
  
  // Находим строки с ключевыми словами
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lowerLine = line.toLowerCase()
    
    // Заголовки и важные секции
    if (line.startsWith('# ') || line.startsWith('## ')) {
      relevantLines.push(line)
      continue
    }
    
    // Строки с ключевыми словами
    if (keywords.some(kw => lowerLine.includes(kw))) {
      // Добавляем контекст (предыдущие 2 строки)
      if (i >= 2) relevantLines.push(lines[i - 2])
      if (i >= 1) relevantLines.push(lines[i - 1])
      relevantLines.push(line)
    }
  }
  
  const result = relevantLines.join('\n')
  
  // Если слишком мало - возвращаем начало документа
  return result.length > 500 ? result : content.split('\n').slice(0, 40).join('\n')
}

/**
 * Проверка, нужно ли использовать RAG для данного запроса
 */
export function shouldUseRAG(query: string): boolean {
  // Для очень коротких запросов RAG не нужен
  if (query.length < 10) return false
  
  // Для приветствий RAG не нужен
  const greetings = ['привет', 'здравствуй', 'hello', 'hi', 'здорово', 'прив']
  const lowerQuery = query.toLowerCase()
  if (greetings.some(g => lowerQuery.startsWith(g))) return false
  
  return true
}
