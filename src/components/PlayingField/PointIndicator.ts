import {
  absolute,
  fontBold,
  lineHeight12,
  opacity90,
  pointerNone,
  text16,
  text24,
  text2xl,
  textCenter,
  textIcon,
  textOrange,
  textPink,
  textRed,
  textShadowDark,
  textShadowPinkGlow,
  textShadowRedGlow,
  textSm,
  textXl,
  textYellowBright,
  zIndexHighest,
} from '@/styles.module.css'
import { classify, div, van } from '@van13k'
import { CollisionResult } from './MovementController'
import { critical, high, low, medium, pointIndicator } from './PointIndicator.module.css'

export interface PointIndicatorData {
  id: string
  result: CollisionResult
  x: number
  y: number
  timestamp: number
}

export const usePointIndicators = () => {
  const indicators = van.state<PointIndicatorData[]>([])

  const addIndicator = (result: CollisionResult, x: number, y: number) => {
    const id = `indicator-${Date.now()}-${Math.random()}`

    const newIndicator: PointIndicatorData = {
      id,
      result,
      x,
      y,
      timestamp: Date.now(),
    }

    indicators.val = [...indicators.val, newIndicator]

    // Remove indicator after animation completes
    setTimeout(() => {
      indicators.val = indicators.val.filter((ind) => ind.id !== id)
    }, 4100) // Slightly longer than animation duration
  }

  const getSeverityClass = (points: number): string => {
    if (points >= 35) return critical
    if (points >= 25) return high
    if (points >= 15) return medium
    return low
  }

  const getSeverityUtilityClasses = (points: number): string[] => {
    if (points >= 35) return [textPink, text2xl, textShadowPinkGlow]
    if (points >= 25) return [textRed, text24, textShadowRedGlow]
    if (points >= 15) return [textOrange, textXl]
    return [textYellowBright, text16]
  }

  const formatBreakdown = (result: CollisionResult): string[] => {
    const lines: string[] = []

    // Main score with emoji
    lines.push(`💥+${result.totalPoints}`)

    // Zone bonus
    if (result.breakdown.zone && result.breakdown.zoneType) {
      lines.push(`+${result.breakdown.zone} ${result.breakdown.zoneType}`)
    }

    // Rotation bonus
    if (result.breakdown.rotation) {
      lines.push(`+${result.breakdown.rotation} turning`)
    }

    return lines
  }

  const component = () => {
    const container = div()

    // Keep track of rendered indicators
    const renderedIndicators = new Map<string, HTMLElement>()

    van.derive(() => {
      const currentIds = new Set(indicators.val.map((ind) => ind.id))
      const renderedIds = new Set(renderedIndicators.keys())

      // Remove indicators that are no longer in the list
      for (const id of renderedIds) {
        if (!currentIds.has(id)) {
          const element = renderedIndicators.get(id)
          if (element && container.contains(element)) {
            container.removeChild(element)
          }
          renderedIndicators.delete(id)
        }
      }

      // Add new indicators
      for (const indicator of indicators.val) {
        if (!renderedIds.has(indicator.id)) {
          const lines = formatBreakdown(indicator.result)
          const severityUtilities = getSeverityUtilityClasses(indicator.result.totalPoints)
          const severityClass = getSeverityClass(indicator.result.totalPoints)

          const element = div(
            {
              ...classify(
                absolute,
                fontBold,
                textIcon,
                pointerNone,
                zIndexHighest,
                textShadowDark,
                textCenter,
                lineHeight12,
                pointIndicator,
                severityClass,
                ...severityUtilities
              ),
              style: `left: ${indicator.x}px; top: ${indicator.y}px;`,
            },
            div({ ...classify(textXl) }, lines[0]), // Main score line
            ...lines.slice(1).map((line) => div({ ...classify(textSm, opacity90) }, line)) // Bonus lines
          )
          container.appendChild(element)
          renderedIndicators.set(indicator.id, element)
        }
      }
    })

    return container
  }

  return {
    addIndicator,
    component,
  }
}
