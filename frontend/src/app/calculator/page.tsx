'use client'

import { useState } from 'react'
import { 
  Calculator, TrendingDown, TrendingUp, Wallet, Receipt, 
  Building, PiggyBank, Info, AlertCircle,
  DollarSign
} from 'lucide-react'

type TaxType = 'usn_6' | 'usn_15' | 'patent' | 'selfemployed' | 'ooo'

interface CalculationResult {
  tax: number
  minTax?: number
  contributions: number
  total: number
  details: Array<{ label: string; value: string }>
}

const taxTypes = [
  { id: 'usn_6', name: 'УСН 6%', desc: 'Доходы', icon: TrendingUp },
  { id: 'usn_15', name: 'УСН 15%', desc: 'Доходы - Расходы', icon: TrendingDown },
  { id: 'patent', name: 'Патент', desc: 'Патентная система', icon: Receipt },
  { id: 'selfemployed', name: 'Самозанятый', desc: 'Налог на проф. доход', icon: Wallet },
  { id: 'ooo', name: 'ООО', desc: 'Общество с ограниченной ответственностью', icon: Building }
]

const TAX_RATES = {
  usn_6: { rate: 6, fixedContribution: 53000 },
  usn_15: { rate: 15, minRate: 1, fixedContribution: 53000 },
  patent: { maxIncome: 60000000, maxEmployees: 15 },
  selfemployed: { ratePhysical: 4, rateLegal: 6, limit: 2400000 },
  ooo: { rate: 6, ndflRate: 13, pensionRate: 22, fomsRate: 5.1, fssRate: 2.9 }
}

export default function CalculatorPage() {
  const [selectedType, setSelectedType] = useState<TaxType>('usn_6')
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [income, setIncome] = useState('')
  const [expenses, setExpenses] = useState('')
  const [employees, setEmployees] = useState('')
  const [salary, setSalary] = useState('')

  const currentType = taxTypes.find(t => t.id === selectedType)
  const IconComponent = currentType?.icon || Calculator

  const calculate = () => {
    const inc = parseFloat(income) || 0
    const exp = parseFloat(expenses) || 0
    const emp = parseInt(employees) || 0
    const sal = parseFloat(salary) || 0
    let calcResult: CalculationResult

    switch (selectedType) {
      case 'usn_6': {
        const rate = TAX_RATES.usn_6.rate / 100
        const tax = inc * rate
        const fixed = TAX_RATES.usn_6.fixedContribution
        const additional = inc > 300000 ? (inc - 300000) * 0.01 : 0
        const contributions = fixed + additional
        const taxReduction = inc > 0 ? Math.min(tax, contributions) : 0
        const finalTax = Math.max(0, tax - taxReduction)
        calcResult = {
          tax: Math.round(finalTax),
          contributions: Math.round(contributions),
          total: Math.round(finalTax + contributions),
          details: [
            { label: 'Доходы', value: `${inc.toLocaleString()} ₽` },
            { label: 'Налог УСН', value: `${Math.round(tax).toLocaleString()} ₽` },
            { label: 'Взносы', value: `${Math.round(contributions).toLocaleString()} ₽` },
            { label: 'Вычет', value: `-${Math.round(taxReduction).toLocaleString()} ₽` },
          ]
        }
        break
      }
      case 'usn_15': {
        const rate = TAX_RATES.usn_15.rate / 100
        const profit = Math.max(0, inc - exp)
        const tax = profit * rate
        const minTax = inc * 0.01
        const finalTax = Math.max(tax, minTax)
        calcResult = {
          tax: Math.round(finalTax),
          minTax: Math.round(minTax),
          contributions: 0,
          total: Math.round(finalTax),
          details: [
            { label: 'Доходы', value: `${inc.toLocaleString()} ₽` },
            { label: 'Расходы', value: `${exp.toLocaleString()} ₽` },
            { label: 'Прибыль', value: `${profit.toLocaleString()} ₽` },
            { label: 'Налог УСН', value: `${Math.round(tax).toLocaleString()} ₽` },
          ]
        }
        break
      }
      case 'patent': {
        const potentialIncome = inc || 1000000
        const patentCost = potentialIncome * 0.06
        calcResult = {
          tax: Math.round(patentCost),
          contributions: 0,
          total: Math.round(patentCost),
          details: [
            { label: 'Потенциальный доход', value: `${potentialIncome.toLocaleString()} ₽` },
            { label: 'Стоимость патента', value: `${Math.round(patentCost).toLocaleString()} ₽` },
          ]
        }
        break
      }
      case 'selfemployed': {
        const rate = TAX_RATES.selfemployed.rateLegal / 100
        const tax = inc * rate
        calcResult = {
          tax: Math.round(tax),
          contributions: 0,
          total: Math.round(tax),
          details: [
            { label: 'Доход', value: `${inc.toLocaleString()} ₽` },
            { label: 'Ставка', value: '6%' },
            { label: 'Налог', value: `${Math.round(tax).toLocaleString()} ₽` },
          ]
        }
        break
      }
      case 'ooo': {
        const rate = TAX_RATES.ooo.rate / 100
        const profit = Math.max(0, inc - exp)
        const tax = profit * rate
        const ndfl = sal * 12 * 0.13
        const pension = sal * 12 * 0.22
        const foms = sal * 12 * 0.051
        const fss = sal * 12 * 0.029
        const contributions = pension + foms + fss
        calcResult = {
          tax: Math.round(tax),
          contributions: Math.round(contributions + ndfl),
          total: Math.round(tax + contributions + ndfl),
          details: [
            { label: 'Доходы', value: `${inc.toLocaleString()} ₽` },
            { label: 'Расходы', value: `${exp.toLocaleString()} ₽` },
            { label: 'Прибыль', value: `${profit.toLocaleString()} ₽` },
            { label: 'Налог УСН', value: `${Math.round(tax).toLocaleString()} ₽` },
          ]
        }
        break
      }
      default:
        calcResult = { tax: 0, contributions: 0, total: 0, details: [] }
    }

    setResult(calcResult)
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <a href="/" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all">
            <span className="text-white text-lg">←</span>
          </a>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Налоговый калькулятор</h1>
            <p className="text-xs text-blue-300">Расчёт налогов для малого бизнеса</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-blue-300 mb-3">Выберите систему налогообложения</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {taxTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => { setSelectedType(type.id as TaxType); setResult(null) }}
                    className={`p-3 rounded-xl border transition-all text-left ${
                      selectedType === type.id
                        ? 'bg-blue-600 border-white/40'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-white mb-2" />
                    <p className="text-sm font-semibold text-white">{type.name}</p>
                    <p className="text-xs text-gray-400">{type.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Введите данные</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Годовой доход (₽)</label>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="Например: 1200000"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {(selectedType === 'usn_15' || selectedType === 'ooo') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Годовые расходы (₽)</label>
                  <input
                    type="number"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    placeholder="Например: 800000"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              )}

              {(selectedType === 'patent' || selectedType === 'ooo') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Количество сотрудников</label>
                  <input
                    type="number"
                    value={employees}
                    onChange={(e) => setEmployees(e.target.value)}
                    placeholder="Например: 3"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              )}

              {selectedType === 'ooo' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Месячная зарплата (₽)</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="Например: 50000"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              )}
            </div>

            <button
              onClick={calculate}
              className="w-full mt-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Рассчитать налоги
            </button>
          </div>

          {result && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm">Итого к уплате за год</p>
                    <p className="text-3xl font-bold text-white">{result.total.toLocaleString()} ₽</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <PiggyBank className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Детализация</h3>
                </div>
                
                <div className="space-y-3">
                  {result.details.map((detail, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">{detail.label}</span>
                      <span className="text-white font-medium">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border-t border-amber-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <p className="text-sm text-amber-200">
                    Расчёт приблизительный. Для точного расчёта рекомендуется консультация с бухгалтером.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
