import { readFileSync } from 'node:fs'

const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const stagesStart = appSource.indexOf('const STAGES =') + 'const STAGES ='.length
const stagesEnd = appSource.indexOf('\n\nconst STAGE_ORDER')
const STAGES = Function(`"use strict"; return (${appSource.slice(stagesStart, stagesEnd)})`)()

const directions = [
  { x: 0, y: -1, name: 'up' },
  { x: 1, y: 0, name: 'right' },
  { x: 0, y: 1, name: 'down' },
  { x: -1, y: 0, name: 'left' },
]

const positionKey = ({ x, y }) => `${x}-${y}`
const samePosition = (a, b) => a.x === b.x && a.y === b.y

function getDirection(from, to) {
  return directions.find(
    (direction) => from.x + direction.x === to.x && from.y + direction.y === to.y,
  )?.name
}

function getRelayOrientation(group) {
  if (group.orientation) return group.orientation
  if (group.cells.length === 1) return 'single'

  const first = group.cells[0]
  const last = group.cells[group.cells.length - 1]

  return first.x === last.x ? 'vertical' : 'horizontal'
}

function createStageAudit(stage) {
  const relayCells = stage.relayGroups.flatMap((group, relayIndex) => {
    const orientation = getRelayOrientation(group)

    return group.cells.map((cell, cellIndex) => ({
      ...cell,
      relayIndex,
      relayBit: 1 << (relayCellsOffset(group, stage.relayGroups) + cellIndex),
      orientation,
    }))
  })
  const relayByPosition = new Map(relayCells.map((cell) => [positionKey(cell), cell]))
  const turnarounds = stage.turnaroundPoints ?? []
  const turnaroundByPosition = new Map(
    turnarounds.map((position, index) => [positionKey(position), 1 << index]),
  )
  const obstacleKeys = new Set((stage.obstacles ?? []).map(positionKey))
  const congestionKeys = new Set((stage.congestionZones ?? []).map(positionKey))
  const specialKeys = new Set([
    positionKey(stage.start),
    positionKey(stage.goal),
    ...relayCells.map(positionKey),
    ...turnarounds.map(positionKey),
  ])
  const allRelayMask = relayCells.reduce((mask, cell) => mask | cell.relayBit, 0)
  const allTurnaroundMask = turnarounds.reduce((mask, _, index) => mask | (1 << index), 0)
  const allowsFast = stage.availableRails.includes('fast')
  const maxFastRails = stage.maxFastRails ?? Number.POSITIVE_INFINITY

  function relayCellsOffset(group, groups) {
    const groupIndex = groups.indexOf(group)
    return groups.slice(0, groupIndex).reduce((total, item) => total + item.cells.length, 0)
  }

  function isInside(position) {
    return position.x >= 0 && position.x < stage.width && position.y >= 0 && position.y < stage.height
  }

  function canMove(from, to) {
    if (!isInside(to) || obstacleKeys.has(positionKey(to))) return false

    const direction = getDirection(from, to)
    const connectedRelays = [relayByPosition.get(positionKey(from)), relayByPosition.get(positionKey(to))]
      .filter(Boolean)

    return connectedRelays.every((relay) => {
      const allowed =
        relay.orientation === 'single'
          ? ['up', 'down', 'left', 'right']
          : relay.orientation === 'vertical'
            ? ['up', 'down']
            : ['left', 'right']
      return allowed.includes(direction)
    })
  }

  function isRelayConnection(position) {
    if (!stage.relayRequiresSlowApproach) return false

    return relayCells.some((relay) => {
      const direction = getDirection(position, relay)
      const allowed =
        relay.orientation === 'single'
          ? ['up', 'down', 'left', 'right']
          : relay.orientation === 'vertical'
            ? ['up', 'down']
            : ['left', 'right']
      return allowed.includes(direction)
    })
  }

  function isSlowZone(position) {
    if (!stage.slowZoneRadius) return false

    return Math.abs(position.x - stage.goal.x) + Math.abs(position.y - stage.goal.y) <= stage.slowZoneRadius
  }

  function getRouteTiming(path) {
    let baseTimeUnits = 0
    const savingUnitsByRail = new Map()

    path.slice(1).forEach((position) => {
      const key = positionKey(position)
      if (specialKeys.has(key)) return

      const timeUnits = congestionKeys.has(key) ? 4 : 2
      baseTimeUnits += timeUnits

      if (allowsFast && !isRelayConnection(position) && !isSlowZone(position)) {
        savingUnitsByRail.set(
          key,
          (savingUnitsByRail.get(key) ?? 0) + timeUnits / 2,
        )
      }
    })

    return { baseTimeUnits, savings: [...savingUnitsByRail.values()] }
  }

  function canMatchTarget(path) {
    const { baseTimeUnits, savings } = getRouteTiming(path)
    const targetUnits = Math.round(stage.targetTime * 2)
    const requiredSaving = baseTimeUnits - targetUnits
    if (requiredSaving < 0) return false

    let choices = new Map([[0, 0]])
    savings.forEach((saving) => {
      const nextChoices = new Map(choices)
      choices.forEach((usedRails, totalSaving) => {
        if (usedRails >= maxFastRails) return
        const nextSaving = totalSaving + saving
        const nextUsedRails = usedRails + 1
        if ((nextChoices.get(nextSaving) ?? Number.POSITIVE_INFINITY) > nextUsedRails) {
          nextChoices.set(nextSaving, nextUsedRails)
        }
      })
      choices = nextChoices
    })

    return choices.has(requiredSaving)
  }

  function minimumTimeUnits(path) {
    const { baseTimeUnits, savings } = getRouteTiming(path)
    const usableSavings = savings
      .sort((a, b) => b - a)
      .slice(0, Number.isFinite(maxFastRails) ? maxFastRails : savings.length)
      .reduce((total, saving) => total + saving, 0)
    return baseTimeUnits - usableSavings
  }

  function minimumFastRailsForTarget(path) {
    const { baseTimeUnits, savings } = getRouteTiming(path)
    const targetUnits = Math.round(stage.targetTime * 2)
    const usableSavings = savings
      .sort((a, b) => b - a)
      .slice(0, Number.isFinite(maxFastRails) ? maxFastRails : savings.length)

    if (baseTimeUnits <= targetUnits) return 0

    let totalSaving = 0
    for (let index = 0; index < usableSavings.length; index += 1) {
      totalSaving += usableSavings[index]
      if (baseTimeUnits - totalSaving <= targetUnits) return index + 1
    }

    return null
  }

  const solutions = []
  let minimumRequiredFastRails = Number.POSITIVE_INFINITY
  const auditsWithinTime = stage.clearCondition === 'within'
  const startRelayMask = relayByPosition.get(positionKey(stage.start))?.relayBit ?? 0
  const startTurnaroundMask = turnaroundByPosition.get(positionKey(stage.start)) ?? 0
  const visitCounts = new Map([[positionKey(stage.start), 1]])
  const maxSteps = Math.ceil(stage.targetTime * 2) + specialKeys.size + turnarounds.length + 6

  function search(path, relayMask, turnaroundMask) {
    if (!auditsWithinTime && solutions.length >= 2) return

    const current = path.at(-1)
    const previous = path.at(-2) ?? null
    const hasRequirements = relayMask === allRelayMask && turnaroundMask === allTurnaroundMask

    if (samePosition(current, stage.goal) && hasRequirements) {
      const requiredFastRails = minimumFastRailsForTarget(path)
      const isSolution = auditsWithinTime
        ? requiredFastRails !== null
        : canMatchTarget(path)

      if (isSolution) {
        if (solutions.length < 2) solutions.push(path.map(positionKey).join('|'))
        if (auditsWithinTime) {
          minimumRequiredFastRails = Math.min(
            minimumRequiredFastRails,
            requiredFastRails,
          )
        }
      }
      return
    }

    if (path.length - 1 >= maxSteps) return
    if (minimumTimeUnits(path) > Math.round(stage.targetTime * 2)) return

    const turnaroundBit = turnaroundByPosition.get(positionKey(current))
    const nextPositions = turnaroundBit && previous
      ? [previous]
      : directions
        .map((direction) => ({ x: current.x + direction.x, y: current.y + direction.y }))
        .filter((position) => !previous || !samePosition(position, previous))

    const nextRequiredPosition =
      turnarounds.find((_, index) => !(turnaroundMask & (1 << index))) ??
      relayCells.find((relay) => !(relayMask & relay.relayBit)) ??
      stage.goal

    nextPositions.sort((a, b) => {
      const distanceA = Math.abs(a.x - nextRequiredPosition.x) + Math.abs(a.y - nextRequiredPosition.y)
      const distanceB = Math.abs(b.x - nextRequiredPosition.x) + Math.abs(b.y - nextRequiredPosition.y)
      return distanceA - distanceB
    })

    nextPositions.forEach((next) => {
      if ((!auditsWithinTime && solutions.length >= 2) || !canMove(current, next)) return

      const nextKey = positionKey(next)
      const isForcedTurnaroundReturn = Boolean(turnaroundBit && previous && samePosition(next, previous))
      const visits = visitCounts.get(nextKey) ?? 0
      if (visits > 0 && !isForcedTurnaroundReturn) return

      visitCounts.set(nextKey, visits + 1)
      const relayBit = relayByPosition.get(nextKey)?.relayBit ?? 0
      const nextTurnaroundBit = turnaroundByPosition.get(nextKey) ?? 0
      search(path.concat(next), relayMask | relayBit, turnaroundMask | nextTurnaroundBit)
      if (visits === 0) visitCounts.delete(nextKey)
      else visitCounts.set(nextKey, visits)
    })
  }

  search([stage.start], startRelayMask, startTurnaroundMask)
  return {
    solutions,
    minimumRequiredFastRails: Number.isFinite(minimumRequiredFastRails)
      ? minimumRequiredFastRails
      : null,
  }
}

const requestedStageId = process.argv[2]
const stagesToAudit = Object.entries(STAGES).filter(
  ([stageId]) => !requestedStageId || stageId === requestedStageId,
)
const results = []

stagesToAudit.forEach(([stageId, stage]) => {
  const audit = createStageAudit(stage)
  results.push({ stageId, ...audit })
  const benchmark = stage.clearCondition === 'within'
    ? `, minimum fast rails: ${audit.minimumRequiredFastRails ?? 'unreachable'}`
    : ''
  console.log(
    `${stageId}: ${audit.solutions.length >= 2 ? '2+' : audit.solutions.length} routes${benchmark}`,
  )
})

const insufficientStages = results.filter(({ solutions }) => solutions.length < 2)
if (insufficientStages.length > 0) process.exitCode = 1
