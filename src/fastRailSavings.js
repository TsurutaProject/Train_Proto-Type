export const countPlacedFastRails = (placedRails = []) =>
  placedRails.filter((rail) => rail.type === 'fast').length

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
  placedRails = [],
  cleared = false,
  savingsEligible = false,
}) => {
  const placedHighSpeedRails = countPlacedFastRails(placedRails)
  const hasLimit = Number.isFinite(maxHighSpeedRails)
  const savedHighSpeedRails = hasLimit
    ? Math.max(0, maxHighSpeedRails - placedHighSpeedRails)
    : null
  const savingsAwarded = Boolean(
    cleared &&
      savingsEligible &&
      hasLimit &&
      placedHighSpeedRails < maxHighSpeedRails,
  )

  return {
    placedHighSpeedRails,
    savedHighSpeedRails,
    savingsAwarded,
  }
}

export const getFastRailSavingsMessage = (savings) =>
  savings?.savingsAwarded
    ? `節約成功！ 残り${savings.savedHighSpeedRails}本`
    : ''
