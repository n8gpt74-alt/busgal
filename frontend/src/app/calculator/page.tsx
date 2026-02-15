'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calculator, TrendingDown, TrendingUp, Wallet, Receipt, 
  Building, Users, PiggyBank, Info, AlertCircle,
  DollarSign, Percent, Calendar
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
  { 
    id: 'usn_6', 
    name: 'УСН 6%', 
    desc: 'Доходы',
    icon: TrendingUp,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-50 to-emerald-50'
  },
  { 
    id: 'usn_15', 
    name: 'УСН 15%', 
    desc: 'Доходы - Расходы',
    icon: TrendingDown,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50'
  },
  { 
    id: 'patent', 
    name: 'Патент', 
    desc: 'Патентная система',
    icon: Receipt,
    gradient: 'from-purple-500 to-violet-500',
    bgGradient: 'from-purple-50 to-violet-50'
  },
  { 
    id: 'selfemployed', 
    name: 'Самозанятый', 
    desc: 'Налог на проф. доход',
    icon: Wallet,
    gradient: 'from-orange-500 to-amber-500',
    bgGradient: 'from-orange-50 to-amber-50'
  },
  { 
    id: 'ooo', 
    name: 'ООО', 
    desc: 'Общество с ограниченной ответственностью',
    icon: Building,
    gradient: 'from-red-500 to-pink-500',
    bgGradient: 'from-red-50 to-pink-50'
  }
]

// Лимиты и ставки на 2026 год
const TAX_RATES = {
  usn_6: {
    rate: 6,
    limit: 265500000,
    contributionsLimit: 300000,
    fixedContribution: 53000,
    additionalRate: 1,
  },
  usn_15: {
    rate: 15,
    minRate: 1,
    limit: 265500000,
    contributionsLimit: 300000,
    fixedContribution: 53000,
    additionalRate: 1,
  },
  patent: {
    maxEmployees: 15,
    maxIncome: 60000000,
  },
  selfemployed: {
    ratePhysical: 4,
    rateLegal: 6,
    limit: 2400000,
  },
  ooo: {
    rate: 6,
    limit: 265500000,
    ndflRate: 13,
    pensionRate: 22,
    fomsRate: 5.1,
    fssRate: 2.9,
  }
}

export default function CalculatorPage() {
  const [selectedType, setSelectedType] = useState<TaxType>('usn_6')
  const [result, setResult] = useState<CalculationResult | null>(null)
  
  const [income, setIncome] = useState('')
  const [expenses, setExpenses] = useState('')
  const [employees, setEmployees] = useState('')
  const [salary, setSalary] = useState('')

  const currentType = taxTypes.find(t => t.id === selectedType)

  const calculate = () => {
    const inc = parseFloat(income) || 0
    const exp = parseFloat(expenses) || 0
    const emp = parseInt(employees) || 0
    const sal = parseFloat(salary) || 0

    let calcResult: CalculationResult

    switch (selectedType) {
      case 'usn_6':
        calcResult = calculateUSN6(inc)
        break
      case 'usn_15':
        calcResult = calculateUSN15(inc, exp)
        break
      case 'patent':
        calcResult = calculatePatent(inc, emp)
        break
      case 'selfemployed':
        calcResult = calculateSelfemployed(inc)
        break
      case 'ooo':
        calcResult = calculateOOO(inc, exp, emp, sal)
        break
      default:
        calcResult = { tax: 0, contributions: 0, total: 0, details: [] }
    }

    setResult(calcResult)
  }

  const calculateUSN6 = (income: number): CalculationResult => {
    const rate = TAX_RATES.usn_6.rate / 100
    const tax = income * rate
    
    const fixed = TAX_RATES.usn_6.fixedContribution
    const additional = income > TAX_RATES.usn_6.contributionsLimit 
      ? (income - TAX_RATES.usn_6.contributionsLimit) * 0.01 
      : 0
    const contributions = fixed + additional

    const taxReduction = income > 0 ? Math.min(tax, contributions) : 0
    const finalTax = Math.max(0, tax - taxReduction)

    return {
      tax: Math.round(finalTax),
      contributions: Math.round(contributions),
      total: Math.round(finalTax + contributions),
      details: [
        { label: 'Доходы', value: `${income.toLocaleString()} ₽` },
        { label: 'Ставка налога', value: '6%' },
        { label: 'Налог УСН', value: `${Math.round(tax).toLocaleString()} ₽` },
        { label: 'Фиксированный взнос', value: `${fixed.toLocaleString()} ₽` },
        { label: 'Доп. взнос (1%)', value: `${Math.round(additional).toLocaleString()} ₽` },
        { label: 'Вычет из налога', value: `-${Math.round(taxReduction).toLocaleString()} ₽` },
      ]
    }
  }

  const calculateUSN15 = (income: number, expenses: number): CalculationResult => {
    const rate = TAX_RATES.usn_15.rate / 100
    const profit = Math.max(0, income - expenses)
    const tax = profit * rate
    
    const minTax = income * 0.01
    const finalTax = Math.max(tax, minTax)
    
    const fixed = TAX_RATES.usn_15.fixedContribution
    const additional = income > TAX_RATES.usn_15.contributionsLimit 
      ? (income - TAX_RATES.usn_15.contributionsLimit) * 0.01 
      : 0
    const contributions = fixed + additional

    return {
      tax: Math.round(finalTax),
      minTax: Math.round(minTax),
      contributions: Math.round(contributions),
      total: Math.round(finalTax + contributions),
      details: [
        { label: 'Доходы', value: `${income.toLocaleString()} ₽` },
        { label: 'Расходы', value: `${expenses.toLocaleString()} ₽` },
        { label: 'Прибыль', value: `${profit.toLocaleString()} ₽` },
        { label: 'Налог УСН (15%)', value: `${Math.round(tax).toLocaleString()} ₽` },
        { label: 'Мин. налог (1%)', value: `${Math.round(minTax).toLocaleString()} ₽` },
        { label: 'Страховые взносы', value: `${Math.round(contributions).toLocaleString()} ₽` },
      ]
    }
  }

  const calculatePatent = (income: number, employeesCount: number): CalculationResult => {
    const potentialIncome = income || 1000000
    const patentCost = potentialIncome * 0.06
    
    const contributions = employeesCount > 0 
      ? employeesCount * 40000 * 0.30 
      : 0

    return {
      tax: Math.round(patentCost),
      contributions: Math.round(contributions),
      total: Math.round(patentCost + contributions),
      details: [
        { label: 'Потенциальный доход', value: `${potentialIncome.toLocaleString()} ₽` },
        { label: 'Стоимость патента', value: `${Math.round(patentCost).toLocaleString()} ₽` },
        { label: 'Сотрудников', value: `${employeesCount} чел.` },
        { label: 'Взносы за сотрудников', value: `${Math.round(contributions).toLocaleString()} ₽/год` },
        { label: 'Лимит доходов', value: '60 млн ₽' },
        { label: 'Лимит сотрудников', value: '15 чел.' },
      ]
    }
  }

  const calculateSelfemployed = (income: number): CalculationResult => {
    const ratePhysical = TAX_RATES.selfemployed.ratePhysical / 100
    const rateLegal = TAX_RATES.selfemployed.rateLegal / 100
    
    const taxPhysical = income * ratePhysical
    const taxLegal = income * rateLegal

    return {
      tax: Math.round(taxLegal),
      contributions: 0,
      total: Math.round(taxLegal),
      details: [
        { label: 'Доход', value: `${income.toLocaleString()} ₽` },
        { label: 'Ставка (физлица)', value: '4%' },
        { label: 'Налог (физлица)', value: `${Math.round(taxPhysical).toLocaleString()} ₽` },
        { label: 'Ставка (ЮЛ/ИП)', value: '6%' },
        { label: 'Налог (ЮЛ/ИП)', value: `${Math.round(taxLegal).toLocaleString()} ₽` },
        { label: 'Лимит доходов', value: '2,4 млн ₽/год' },
      ]
    }
  }

  const calculateOOO = (income: number, expenses: number, employeesCount: number, salaryAmount: number): CalculationResult => {
    const rate = TAX_RATES.ooo.rate / 100
    const profit = Math.max(0, income - expenses)
    const tax = profit * rate
    
    const ndfl = salaryAmount * 12 * (TAX_RATES.ooo.ndflRate / 100)
    
    const pension = salaryAmount * 12 * (TAX_RATES.ooo.pensionRate / 100)
    const foms = salaryAmount * 12 * (TAX_RATES.ooo.fomsRate / 100)
    const fss = salaryAmount * 12 * (TAX_RATES.ooo.fssRate / 100)
    const contributions = pension + foms + fss

    return {
      tax: Math.round(tax),
      contributions: Math.round(contributions + ndfl),
      total: Math.round(tax + contributions + ndfl),
      details: [
        { label: 'Доходы', value: `${income.toLocaleString()} ₽` },
        { label: 'Расходы', value: `${expenses.toLocaleString()} ₽` },
        { label: 'Прибыль', value: `${profit.toLocaleString()} ₽` },
        { label: 'Налог УСН', value: `${Math.round(tax).toLocaleString()} ₽` },
        { label: 'НДФЛ с зарплат', value: `${Math.round(ndfl).toLocaleString()} ₽` },
        { label: 'Страховые взносы', value: `${Math.round(contributions).toLocaleString()} ₽` },
      ]
    }
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ru-RU')
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 py-3"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all">
              <span className="text-white text-lg">←</span>
            </a>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Налоговый калькулятор</h1>
              <p className="text-xs text-blue-300">Расчёт налогов для малого бизнеса</p>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Tax Type Selector */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <h2 className="text-sm font-semibold text-blue-300 mb-3">Выберите систему налогообложения</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {taxTypes.map((type) => (
                <motion.button
                  key={type.id}
                  onClick={() => { setSelectedType(type.id as TaxType); setResult(null) }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-xl border transition-all text-left ${
                    selectedType === type.id
                      ? `bg-gradient-to-r ${type.bgGradient} border-white/40 shadow-lg`
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-2`}>
                    <type.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className={`text-sm font-semibold ${selectedType === type.id ? 'text-gray-900' : 'text-white'}`}>
                    {type.name}
                  </p>
                  <p className={`text-xs ${selectedType === type.id ? 'text-gray-600' : 'text-gray-400'}`}>
                    {type.desc}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Input Form */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Введите данные</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Income */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Годовой доход (₽)
                </label>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="Например: 1200000"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Expenses - only for USN 15 and OOO */}
              {(selectedType === 'usn_15' || selectedType === 'ooo') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Годовые расходы (₽)
                  </label>
                  <input
                    type="number"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    placeholder="Например: 800000"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              )}

              {/* Employees */}
              {(selectedType === 'patent' || selectedType === 'ooo') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Количество сотрудников
                  </label>
                  <input
                    type="number"
                    value={employees}
                    onChange={(e) => setEmployees(e.target.value)}
                    placeholder="Например: 3"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              )}

              {/* Salary - only for OOO */}
              {selectedType === 'ooo' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Месячная зарплата сотрудника (₽)
                  </label>
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

            <motion.button
              onClick={calculate}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Рассчитать налоги
            </motion.button>
          </motion.div>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
              >
                {/* Summary */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-blue-300 text-sm">Итого к уплате за год</p>
                      <p className="text-3xl font-bold text-white">{formatNumber(result.total)} ₽</p>
                    </div>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentType?.gradient} flex items-center justify-center`}>
                      <PiggyBank className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                      <p className="text-blue-300 text-xs">Налог</p>
                      <p className="text-lg font-bold text-white">{formatNumber(result.tax)} ₽</p>
                    </div>
                    {result.minTax && (
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-blue-300 text-xs">Мин. налог</p>
                        <p className="text-lg font-bold text-white">{formatNumber(result.minTax)} ₽</p>
                      </div>
                    )}
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                      <p className="text-blue-300 text-xs">Взносы</p>
                      <p className="text-lg font-bold text-white">{formatNumber(result.contributions)} ₽</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Детализация</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {result.details.map((detail, index) => (
                      <motion.div 
                        key={index}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
                      >
                        <span className="text-gray-400">{detail.label}</span>
                        <span className="text-white font-medium">{detail.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Warning */}
                <div className="p-4 bg-amber-500/10 border-t border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-200">
                      Расчёт приблизительный. Для точного расчёта рекомендуется консультация с бухгалтером. 
                      Учитывайте региональные коэффициенты и специфику вашего бизнеса.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Cards */}
          {!result && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6"
            >
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-semibold text-white">Сроки уплаты</h4>
                </div>
                <p className="text-xs text-gray-400">
                  Авансовые платежи - до 25 числа каждого квартала. Годовой налог - до 30 апреля.
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-4 h-4 text-green-400" />
                  <h4 className="text-sm font-semibold text-white">Выбор системы</h4>
                </div>
                <p className="text-xs text-gray-400">
                  УСН 6% выгоднее при расходах <60% от дохода. УСН 15% - при больших расходах.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
