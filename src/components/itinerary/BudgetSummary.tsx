import React from 'react'
import { BudgetBreakdown } from '@/types/trip'
import { formatCurrency } from '@/utils/formatters'
import { DollarSign, Home, Utensils, MapPin, ShoppingBag } from 'lucide-react'

interface BudgetSummaryProps {
  budget: BudgetBreakdown
}

const CATEGORY_CONFIG = {
  accommodation: { icon: Home, color: 'bg-blue-500', label: 'Accommodation' },
  food: { icon: Utensils, color: 'bg-green-500', label: 'Food & Dining' },
  activities: { icon: MapPin, color: 'bg-purple-500', label: 'Activities' },
  transport: { icon: ShoppingBag, color: 'bg-yellow-500', label: 'Transport' },
  miscellaneous: { icon: DollarSign, color: 'bg-gray-500', label: 'Miscellaneous' },
}

export function BudgetSummary({ budget }: BudgetSummaryProps) {
  const categories = [
    { key: 'accommodation' as const, amount: budget.accommodation },
    { key: 'food' as const, amount: budget.food },
    { key: 'activities' as const, amount: budget.activities },
    { key: 'transport' as const, amount: budget.transport },
    { key: 'miscellaneous' as const, amount: budget.miscellaneous },
  ]

  const maxAmount = Math.max(...categories.map((c) => c.amount))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Budget Summary</h3>
          <p className="text-sm text-gray-500">Estimated costs breakdown</p>
        </div>
      </div>

      {/* Total */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total Estimated Cost</span>
          <span className="text-2xl font-bold text-indigo-600">
            {formatCurrency(budget.total, budget.currency)}
          </span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        {categories.map(({ key, amount }) => {
          const config = CATEGORY_CONFIG[key]
          const Icon = config.icon
          const percentage = maxAmount > 0 ? (amount / budget.total) * 100 : 0

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{config.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(amount, budget.currency)}
                  </div>
                  <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${config.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Pie Chart Visualization */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center">
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
            {(() => {
              let currentAngle = 0
              return categories.map(({ key, amount }) => {
                const config = CATEGORY_CONFIG[key]
                const percentage = (amount / budget.total) * 100
                const angle = (percentage / 100) * 360
                const radius = 80
                const centerX = 100
                const centerY = 100

                const startAngle = currentAngle
                const endAngle = currentAngle + angle
                currentAngle = endAngle

                const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
                const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
                const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
                const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180)

                const largeArcFlag = angle > 180 ? 1 : 0

                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${startX} ${startY}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                  'Z',
                ].join(' ')

                return (
                  <path
                    key={key}
                    d={pathData}
                    className={config.color.replace('bg-', 'fill-')}
                    opacity="0.8"
                  />
                )
              })
            })()}
            {/* Center circle */}
            <circle cx="100" cy="100" r="50" fill="white" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
