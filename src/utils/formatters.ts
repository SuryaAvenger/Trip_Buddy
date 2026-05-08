export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(d.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(d.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatTime(time: string): string {
  // Expects time in HH:mm format
  const parts = time.split(':').map(Number)
  const hours = parts[0]
  const minutes = parts[1]
  
  if (hours === undefined || minutes === undefined || isNaN(hours) || isNaN(minutes)) {
    return time
  }

  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`
  }

  return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes} min`
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }

  const km = meters / 1000
  return `${km.toFixed(1)} km`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(1)}%`
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Invalid date range'
  }

  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()

  if (sameMonth) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`
  }

  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return 'just now'
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else {
    return formatDate(d)
  }
}

export function formatRating(rating: number): string {
  return `${rating.toFixed(1)} ★`
}

export function formatPriceRange(priceLevel: number): string {
  const symbols = ['$', '$$', '$$$', '$$$$']
  return symbols[priceLevel - 1] || '$'
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength - 3) + '...'
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`
  }
  
  return phone
}

export function formatAddress(address: string): string {
  // Remove country if it's at the end
  const parts = address.split(',').map(p => p.trim())
  if (parts.length > 3) {
    return parts.slice(0, -1).join(', ')
  }
  return address
}

export function capitalizeFirst(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function formatListWithAnd(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0] || ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  
  const allButLast = items.slice(0, -1).join(', ')
  const last = items[items.length - 1]
  return `${allButLast}, and ${last || ''}`
}

export function formatTripDuration(days: number): string {
  if (days === 1) return '1 day'
  if (days < 7) return `${days} days`
  
  const weeks = Math.floor(days / 7)
  const remainingDays = days % 7
  
  if (remainingDays === 0) {
    return `${weeks} week${weeks > 1 ? 's' : ''}`
  }
  
  return `${weeks} week${weeks > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`
}

export function formatBudgetLevel(level: 'budget' | 'mid-range' | 'luxury'): string {
  const labels = {
    budget: 'Budget',
    'mid-range': 'Mid-Range',
    luxury: 'Luxury',
  }
  return labels[level]
}

export function formatPace(pace: 'relaxed' | 'moderate' | 'packed'): string {
  const labels = {
    relaxed: 'Relaxed',
    moderate: 'Moderate',
    packed: 'Packed',
  }
  return labels[pace]
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  
  if (isNaN(date.getTime())) {
    return 'Invalid timestamp'
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function hashWaypoints(waypoints: Array<{ lat: number; lng: number }>): string {
  return waypoints.map(w => `${w.lat.toFixed(6)},${w.lng.toFixed(6)}`).join('|')
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Made with Bob
