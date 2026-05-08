import { Itinerary } from '../types/trip'
import { GoogleAPIError } from '../types/google'
import { formatCurrency, formatDate } from '../utils/formatters'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_SHEETS_CLIENT_ID
const API_SCOPE = import.meta.env.VITE_GOOGLE_API_SCOPE

if (!CLIENT_ID) {
  throw new Error('VITE_GOOGLE_SHEETS_CLIENT_ID is not set in environment variables')
}

let accessToken: string | null = null

export async function requestSheetsAccess(): Promise<string> {
  // Check if we have a valid cached token
  const cachedToken = sessionStorage.getItem('google_access_token')
  const expiry = sessionStorage.getItem('google_token_expiry')
  
  if (cachedToken && expiry && Date.now() < parseInt(expiry)) {
    accessToken = cachedToken
    return cachedToken
  }

  // This would use the same OAuth flow as calendar service
  // For now, we'll assume the token is already available from calendar auth
  const token = sessionStorage.getItem('google_access_token')
  if (token) {
    accessToken = token
    return token
  }

  throw new GoogleAPIError('Not authenticated. Please authenticate first.', 'AUTH_ERROR')
}

export async function exportBudgetToSheets(itinerary: Itinerary): Promise<string> {
  if (!accessToken) {
    await requestSheetsAccess()
  }

  const spreadsheetTitle = `TripBuddy - ${itinerary.destination} (${formatDate(itinerary.days[0]?.date || '')} - ${formatDate(itinerary.days[itinerary.days.length - 1]?.date || '')})`

  // Create spreadsheet
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: spreadsheetTitle,
      },
      sheets: [
        { properties: { title: 'Overview' } },
        { properties: { title: 'Daily Breakdown' } },
        { properties: { title: 'Budget Summary' } },
      ],
    }),
  })

  if (!createResponse.ok) {
    throw new GoogleAPIError(
      `Failed to create spreadsheet: ${createResponse.statusText}`,
      'SHEETS_ERROR',
      createResponse.status
    )
  }

  const spreadsheet = await createResponse.json()
  const spreadsheetId = spreadsheet.spreadsheetId

  // Populate sheets
  await populateOverviewSheet(spreadsheetId, itinerary)
  await populateDailyBreakdownSheet(spreadsheetId, itinerary)
  await populateBudgetSummarySheet(spreadsheetId, itinerary)

  // Apply formatting
  await formatSpreadsheet(spreadsheetId)

  return spreadsheet.spreadsheetUrl
}

async function populateOverviewSheet(spreadsheetId: string, itinerary: Itinerary): Promise<void> {
  const values = [
    ['Trip Overview'],
    [],
    ['Destination', itinerary.destination],
    ['Start Date', formatDate(itinerary.days[0]?.date || '')],
    ['End Date', formatDate(itinerary.days[itinerary.days.length - 1]?.date || '')],
    ['Duration', `${itinerary.days.length} days`],
    ['Travelers', itinerary.preferences.travelers.toString()],
    ['Budget Level', itinerary.preferences.budgetLevel],
    [],
    ['Total Budget Estimate', formatCurrency(itinerary.totalBudgetEstimate.total, itinerary.totalBudgetEstimate.currency)],
    ['Accommodation', formatCurrency(itinerary.totalBudgetEstimate.accommodation, itinerary.totalBudgetEstimate.currency)],
    ['Food', formatCurrency(itinerary.totalBudgetEstimate.food, itinerary.totalBudgetEstimate.currency)],
    ['Activities', formatCurrency(itinerary.totalBudgetEstimate.activities, itinerary.totalBudgetEstimate.currency)],
    ['Transport', formatCurrency(itinerary.totalBudgetEstimate.transport, itinerary.totalBudgetEstimate.currency)],
    ['Miscellaneous', formatCurrency(itinerary.totalBudgetEstimate.miscellaneous, itinerary.totalBudgetEstimate.currency)],
  ]

  await updateSheetValues(spreadsheetId, 'Overview!A1', values)
}

async function populateDailyBreakdownSheet(spreadsheetId: string, itinerary: Itinerary): Promise<void> {
  const values: string[][] = [
    ['Day', 'Date', 'Activity/Meal', 'Category', 'Time', 'Duration (min)', 'Cost', 'Address'],
    [],
  ]

  for (const day of itinerary.days) {
    // Add day header
    values.push([`Day ${day.dayNumber}`, formatDate(day.date), day.theme, '', '', '', formatCurrency(day.estimatedCost, itinerary.totalBudgetEstimate.currency), ''])
    values.push([])

    // Add activities
    for (const activity of day.activities) {
      values.push([
        '',
        '',
        activity.name,
        activity.category,
        `${activity.startTime} - ${activity.endTime}`,
        activity.duration.toString(),
        formatCurrency(activity.cost, itinerary.totalBudgetEstimate.currency),
        activity.address,
      ])
    }

    // Add meals
    for (const meal of day.meals) {
      values.push([
        '',
        '',
        `${meal.type} - ${meal.restaurantName}`,
        'Food',
        '',
        '',
        formatCurrency(meal.estimatedCost, itinerary.totalBudgetEstimate.currency),
        meal.address,
      ])
    }

    values.push([])
  }

  await updateSheetValues(spreadsheetId, 'Daily Breakdown!A1', values)
}

async function populateBudgetSummarySheet(spreadsheetId: string, itinerary: Itinerary): Promise<void> {
  const budget = itinerary.totalBudgetEstimate
  
  const values = [
    ['Budget Summary'],
    [],
    ['Category', 'Amount', 'Percentage'],
    ['Accommodation', formatCurrency(budget.accommodation, budget.currency), `${((budget.accommodation / budget.total) * 100).toFixed(1)}%`],
    ['Food', formatCurrency(budget.food, budget.currency), `${((budget.food / budget.total) * 100).toFixed(1)}%`],
    ['Activities', formatCurrency(budget.activities, budget.currency), `${((budget.activities / budget.total) * 100).toFixed(1)}%`],
    ['Transport', formatCurrency(budget.transport, budget.currency), `${((budget.transport / budget.total) * 100).toFixed(1)}%`],
    ['Miscellaneous', formatCurrency(budget.miscellaneous, budget.currency), `${((budget.miscellaneous / budget.total) * 100).toFixed(1)}%`],
    [],
    ['Total', formatCurrency(budget.total, budget.currency), '100%'],
  ]

  await updateSheetValues(spreadsheetId, 'Budget Summary!A1', values)
}

async function updateSheetValues(
  spreadsheetId: string,
  range: string,
  values: string[][]
): Promise<void> {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  )

  if (!response.ok) {
    throw new GoogleAPIError(
      `Failed to update sheet values: ${response.statusText}`,
      'SHEETS_ERROR',
      response.status
    )
  }
}

async function formatSpreadsheet(spreadsheetId: string): Promise<void> {
  const requests = [
    // Format Overview sheet
    {
      repeatCell: {
        range: {
          sheetId: 0,
          startRowIndex: 0,
          endRowIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.26, green: 0.27, blue: 0.96 },
            textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 14 },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)',
      },
    },
    // Format Daily Breakdown headers
    {
      repeatCell: {
        range: {
          sheetId: 1,
          startRowIndex: 0,
          endRowIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.26, green: 0.27, blue: 0.96 },
            textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)',
      },
    },
    // Format Budget Summary headers
    {
      repeatCell: {
        range: {
          sheetId: 2,
          startRowIndex: 0,
          endRowIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.26, green: 0.27, blue: 0.96 },
            textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)',
      },
    },
    // Auto-resize columns
    {
      autoResizeDimensions: {
        dimensions: {
          sheetId: 0,
          dimension: 'COLUMNS',
          startIndex: 0,
          endIndex: 10,
        },
      },
    },
    {
      autoResizeDimensions: {
        dimensions: {
          sheetId: 1,
          dimension: 'COLUMNS',
          startIndex: 0,
          endIndex: 10,
        },
      },
    },
    {
      autoResizeDimensions: {
        dimensions: {
          sheetId: 2,
          dimension: 'COLUMNS',
          startIndex: 0,
          endIndex: 10,
        },
      },
    },
  ]

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    }
  )

  if (!response.ok) {
    console.error('Failed to format spreadsheet:', response.statusText)
  }
}

// Made with Bob
