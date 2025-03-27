// Define the vector data structure for signatures
export type Point = {
  x: number
  y: number
  time?: number
  pressure?: number
  velocity?: number
  width?: number
}

export type Path = Point[]

export interface VectorSignature {
  paths: Path[]
  width: number
  height: number
  settings?: SignatureSettings
}

// Define the settings type
export type SignatureSettings = {
  // Resolution
  resolutionMultiplier: number

  // Smoothing
  minSmoothingFactor: number
  maxSmoothingFactor: number

  // Interpolation
  minInterpolationPoints: number
  maxInterpolationPoints: number

  // Line width
  baseLineWidth: number
  minLineWidth: number
  maxLineWidth: number

  // Velocity sensitivity
  velocitySensitivity: number
}

// Default settings
export const defaultSettings: SignatureSettings = {
  resolutionMultiplier: 4,
  minSmoothingFactor: 0.7,
  maxSmoothingFactor: 0.95,
  minInterpolationPoints: 5,
  maxInterpolationPoints: 20,
  baseLineWidth: 2.5,
  minLineWidth: 2.3,
  maxLineWidth: 2.7,
  velocitySensitivity: 3,
}

