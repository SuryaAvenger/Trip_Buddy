import React, { useState } from 'react'
import { Activity } from '@/types/trip'
import { formatTime, formatDuration, formatCurrency } from '@/utils/formatters'
import { Clock, DollarSign, MapPin, Star, ExternalLink, GripVertical } from 'lucide-react'

interface ActivityCardProps {
  activity: Activity
  onReorder?: (activityId: string, direction: 'up' | 'down') => void
  isDragging?: boolean
  onDragStart?: (activityId: string) => void
  onDragEnd?: () => void
  onDrop?: (activityId: string) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  culture: 'bg-purple-100 text-purple-700 border-purple-200',
  food: 'bg-green-100 text-green-700 border-green-200',
  nature: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  adventure: 'bg-orange-100 text-orange-700 border-orange-200',
  shopping: 'bg-pink-100 text-pink-700 border-pink-200',
  nightlife: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  history: 'bg-amber-100 text-amber-700 border-amber-200',
  art: 'bg-violet-100 text-violet-700 border-violet-200',
  wellness: 'bg-teal-100 text-teal-700 border-teal-200',
}

export function ActivityCard({
  activity,
  onReorder,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDrop,
}: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const categoryColor = CATEGORY_COLORS[activity.category] || 'bg-gray-100 text-gray-700 border-gray-200'

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', activity.id)
    onDragStart?.(activity.id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const draggedId = e.dataTransfer.getData('text/plain')
    onDrop?.(draggedId)
    onDragEnd?.()
  }

  return (
    <div
      draggable={!!onReorder}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-lg border-2 transition-all ${
        isDragging ? 'border-indigo-400 opacity-50 scale-95' : 'border-gray-200 hover:border-gray-300'
      } ${onReorder ? 'cursor-move' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          {onReorder && (
            <div className="flex-shrink-0 pt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
              <GripVertical className="w-5 h-5" />
            </div>
          )}

          {/* Time Badge */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-indigo-50 rounded-lg flex flex-col items-center justify-center border border-indigo-100">
              <div className="text-xs font-medium text-indigo-600">{formatTime(activity.startTime)}</div>
              <div className="text-xs text-gray-500 mt-0.5">{formatDuration(activity.duration)}</div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h4 className="text-base font-semibold text-gray-900 mb-1">{activity.name}</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${categoryColor}`}>
                    {activity.category}
                  </span>
                  {activity.rating && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{activity.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cost */}
              <div className="flex-shrink-0 text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(activity.cost, 'USD')}
                </div>
                <div className="text-xs text-gray-500">per person</div>
              </div>
            </div>

            {/* Description */}
            <p className={`text-sm text-gray-600 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
              {activity.description}
            </p>

            {activity.description.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}

            {/* Location */}
            <div className="flex items-start gap-2 mt-3 text-sm text-gray-600">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
              <span className="flex-1">{activity.address}</span>
            </div>

            {/* Additional Info */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{activity.startTime} - {activity.endTime}</span>
              </div>
              {activity.bookingUrl && (
                <a
                  href={activity.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Book tickets</span>
                </a>
              )}
            </div>

            {/* Photo */}
            {activity.photoUrl && isExpanded && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img
                  src={activity.photoUrl}
                  alt={activity.name}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
