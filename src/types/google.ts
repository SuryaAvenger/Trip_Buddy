import { LatLng } from './trip'

export interface PlaceResult {
  placeId: string
  name: string
  formattedAddress: string
  location: LatLng
  rating?: number
  userRatingsTotal?: number
  priceLevel?: number
  types: string[]
  photoUrl?: string
  openingHours?: {
    openNow: boolean
    weekdayText: string[]
  }
  website?: string
  phoneNumber?: string
}

export interface PlaceDetails extends PlaceResult {
  reviews?: PlaceReview[]
  photos?: PlacePhoto[]
  businessStatus?: string
  utcOffset?: number
}

export interface PlaceReview {
  authorName: string
  rating: number
  text: string
  time: number
  relativeTimeDescription: string
}

export interface PlacePhoto {
  photoReference: string
  height: number
  width: number
  htmlAttributions: string[]
}

export interface GeocodingResult {
  formattedAddress: string
  location: LatLng
  placeId: string
  types: string[]
  addressComponents: AddressComponent[]
}

export interface AddressComponent {
  longName: string
  shortName: string
  types: string[]
}

export interface RouteResult {
  routes: Route[]
  status: string
}

export interface Route {
  legs: RouteLeg[]
  overviewPolyline: string
  bounds: LatLngBounds
  copyrights: string
  warnings: string[]
  waypointOrder: number[]
  summary: string
}

export interface RouteLeg {
  startAddress: string
  endAddress: string
  startLocation: LatLng
  endLocation: LatLng
  distance: {
    text: string
    value: number
  }
  duration: {
    text: string
    value: number
  }
  steps: RouteStep[]
}

export interface RouteStep {
  distance: {
    text: string
    value: number
  }
  duration: {
    text: string
    value: number
  }
  startLocation: LatLng
  endLocation: LatLng
  htmlInstructions: string
  travelMode: string
  polyline: string
}

export interface LatLngBounds {
  northeast: LatLng
  southwest: LatLng
}

export interface DistanceMatrixResult {
  originAddresses: string[]
  destinationAddresses: string[]
  rows: DistanceMatrixRow[]
}

export interface DistanceMatrixRow {
  elements: DistanceMatrixElement[]
}

export interface DistanceMatrixElement {
  distance: {
    text: string
    value: number
  }
  duration: {
    text: string
    value: number
  }
  status: string
}

export interface CalendarEvent {
  id?: string
  summary: string
  description?: string
  location?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  colorId?: string
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: string
      minutes: number
    }>
  }
}

export interface SpreadsheetData {
  spreadsheetId?: string
  spreadsheetUrl?: string
  properties: {
    title: string
  }
  sheets: Sheet[]
}

export interface Sheet {
  properties: {
    sheetId?: number
    title: string
    index: number
  }
  data?: SheetData[]
}

export interface SheetData {
  rowData: RowData[]
}

export interface RowData {
  values: CellData[]
}

export interface CellData {
  userEnteredValue?: {
    stringValue?: string
    numberValue?: number
    boolValue?: boolean
    formulaValue?: string
  }
  userEnteredFormat?: {
    backgroundColor?: Color
    textFormat?: {
      bold?: boolean
      fontSize?: number
    }
    numberFormat?: {
      type: string
      pattern?: string
    }
  }
}

export interface Color {
  red?: number
  green?: number
  blue?: number
  alpha?: number
}

export class GoogleAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message)
    this.name = 'GoogleAPIError'
  }
}

export class GeocodingError extends GoogleAPIError {
  constructor(message: string, code: string) {
    super(message, code)
    this.name = 'GeocodingError'
  }
}

export class DirectionsError extends GoogleAPIError {
  constructor(message: string, code: string) {
    super(message, code)
    this.name = 'DirectionsError'
  }
}

export class PlacesError extends GoogleAPIError {
  constructor(message: string, code: string) {
    super(message, code)
    this.name = 'PlacesError'
  }
}

// Made with Bob
