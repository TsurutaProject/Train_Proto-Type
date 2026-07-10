export const countPlacedFastRails = (placedRails = []) =>
  placedRails.filter((rail) => rail.type === 'fast').length

export const FAST_RAIL_SAVINGS_RANKS = {
  none: 0,
  saved: 1,
  minimum: 2,
}

export const getFastRailSavingsRank = (savingsRating) =>
  FAST_RAIL_SAVINGS_RANKS[savingsRating] ?? FAST_RAIL_SAVINGS_RANKS.none

export const isWithinTargetTime = (
  actualTime,
  targetTime,
  conditionsMet = true,
  tolerance = 0.0001,
) =>
  Boolean(
    conditionsMet &&
      Number.isFinite(actualTime) &&
      Number.isFinite(targetTime) &&
      actualTime <= targetTime + tolerance,
  )

export const getFastRailSavings = ({
  maxHighSpeedRails,
  minimumRequiredHighSpeedRails,
  placedRails = [],
  cleared = false,
  savingsEligible = false,
}) => {
  const placedHighSpeedRails = countPlacedFastRails(placedRails)
  const hasLimit = Number.isFinite(maxHighSpeedRails)
  const hasMinimum = Number.isFinite(minimumRequiredHighSpeedRails)
  const savedHighSpeedRails = hasLimit
    ? Math.max(0, maxHighSpeedRails - placedHighSpeedRails)
    : null
  const canAwardSavings = Boolean(
    cleared && savingsEligible && hasLimit && hasMinimum,
  )
  const savingsRating =
    canAwardSavings && placedHighSpeedRails <= minimumRequiredHighSpeedRails
      ? 'minimum'
      : canAwardSavings && placedHighSpeedRails < maxHighSpeedRails
        ? 'saved'
        : null
  const savingsMark =
    savingsRating === 'minimum' ? '☆' : savingsRating === 'saved' ? '◎' : ''
  const savingsAwarded = Boolean(savingsRating)

  return {
    placedHighSpeedRails,
    savedHighSpeedRails,
    minimumRequiredHighSpeedRails: hasMinimum
      ? minimumRequiredHighSpeedRails
      : null,
    savingsRating,
    savingsMark,
    savingsAwarded,
  }
}

export const getFastRailSavingsMessage = (savings) =>
  savings?.savingsRating === 'minimum'
    ? '追加評価：☆ 最小本数でクリア！'
    : savings?.savingsRating === 'saved'
      ? `追加評価：◎ 高速レールを節約！ 残り${savings.savedHighSpeedRails}本`
      : ''
