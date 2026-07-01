import { useEffect, useRef, useState } from 'react'
import './App.css'
import blueTrainCarImage from './assets/train-game/blue-train-car.png'
import blueTrainLeftImage from './assets/train-game/blue-train-left.png'
import blueTrainRightImage from './assets/train-game/blue-train-right.png'
import curvedRailImage from './assets/train-game/curved-rail.png'
import redStationBuildingImage from './assets/train-game/red-station-building.png'
import stationBuildingImage from './assets/train-game/station-building.png'
import straightRailImage from './assets/train-game/straight-rail.png'
import tunnelEntranceRailLeftImage from './assets/train-game/tunnel-entrance-rail-left.png'
import tunnelMiddleImage from './assets/train-game/tunnel-middle.png'

const TRAIN_CARS = [
  { key: 'rear', image: blueTrainLeftImage, offset: -1 },
  { key: 'middle', image: blueTrainCarImage, offset: 0 },
  { key: 'front', image: blueTrainRightImage, offset: 1 },
]

const STAGES = {
  1: {
    title: 'ステージ1',
    description: 'まずはレールを置く操作を覚えよう',
    targetTime: 6,
    width: 8,
    height: 5,
    start: { x: 0, y: 2 },
    goal: { x: 7, y: 2 },
    relayGroups: [],
    availableRails: ['slow'],
  },
  2: {
    title: 'ステージ2',
    description: '速さの違うレールを使ってみよう',
    targetTime: 5,
    width: 8,
    height: 5,
    start: { x: 0, y: 2 },
    goal: { x: 7, y: 2 },
    relayGroups: [],
    availableRails: ['slow', 'fast'],
  },
  3: {
    title: 'ステージ3',
    description: '中継地点を通るルートを考えよう',
    targetTime: 4,
    width: 8,
    height: 5,
    start: { x: 0, y: 2 },
    goal: { x: 7, y: 2 },
    relayGroups: [
      {
        cells: [
          { x: 4, y: 2, part: 'entrance-right' },
          { x: 5, y: 2, part: 'entrance' },
        ],
      },
    ],
    availableRails: ['slow', 'fast'],
  },
}

const RAIL_TYPES = {
  slow: {
    label: '低速レール',
    speed: 1,
    description: '1マスを1秒で進む',
  },
  fast: {
    label: '高速レール',
    speed: 2,
    description: '1マスを0.5秒で進む',
  },
}

const DIRECTION_STEPS = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
}

const OPPOSITE_DIRECTIONS = {
  up: 'down',
  right: 'left',
  down: 'up',
  left: 'right',
}

const ANIMATION_MS_PER_GAME_SECOND = 550

const getDirectionBetween = (from, to) => {
  return Object.entries(DIRECTION_STEPS).find(
    ([, step]) => from.x + step.x === to.x && from.y + step.y === to.y,
  )?.[0]
}

const getRailAssetConfig = (connections) => {
  const directions = [...new Set(connections)]

  if (directions.length === 0) {
    return {
      image: straightRailImage,
      shape: 'straight',
      rotation: 90,
    }
  }

  const normalizedDirections =
    directions.length === 1
      ? [directions[0], OPPOSITE_DIRECTIONS[directions[0]]]
      : directions
  const connectionKey = [...normalizedDirections].sort().join('-')
  const straightRotations = {
    'down-up': 0,
    'left-right': 90,
  }
  const curveRotations = {
    'down-right': 0,
    'down-left': 90,
    'left-up': 180,
    'right-up': 270,
  }

  if (connectionKey in straightRotations) {
    return {
      image: straightRailImage,
      shape: 'straight',
      rotation: straightRotations[connectionKey],
    }
  }

  if (connectionKey in curveRotations) {
    return {
      image: curvedRailImage,
      shape: 'curve',
      rotation: curveRotations[connectionKey],
    }
  }

  return {
    image: straightRailImage,
    shape: 'straight',
    rotation: 90,
  }
}

function RailPiece({
  type = 'slow',
  compact = false,
  connections = ['left', 'right'],
  showSpeed = true,
}) {
  const railAsset = getRailAssetConfig(connections)

  return (
    <span
      className={`rail-piece rail-piece-${type} rail-piece-${railAsset.shape} ${compact ? 'rail-piece-compact' : ''}`}
      style={{ '--rail-rotation': `${railAsset.rotation}deg` }}
      aria-hidden="true"
    >
      <img className="rail-piece-image" src={railAsset.image} alt="" />
      {showSpeed && (
        <span className="rail-speed-badge">{RAIL_TYPES[type].speed}</span>
      )}
    </span>
  )
}

function SpecialCellAsset({ type, label }) {
  const images = {
    start: redStationBuildingImage,
    goal: stationBuildingImage,
    'tunnel-entrance': tunnelEntranceRailLeftImage,
    'tunnel-entrance-right': tunnelEntranceRailLeftImage,
    'tunnel-middle': tunnelMiddleImage,
  }

  return (
    <span className={`special-cell-asset special-cell-asset-${type}`}>
      <img src={images[type]} alt="" aria-hidden="true" />
      {label && <span className="special-cell-badge">{label}</span>}
    </span>
  )
}

function App() {
  const [screen, setScreen] = useState('title')
  const [selectedStage, setSelectedStage] = useState(null)
  const [selectedRailType, setSelectedRailType] = useState('slow')
  const [placedRails, setPlacedRails] = useState([])
  const [result, setResult] = useState(null)
  const [message, setMessage] = useState('')
  const [trainRun, setTrainRun] = useState(null)
  const mapRef = useRef(null)

  const currentStage = selectedStage ? STAGES[selectedStage] : null

  const startStage = (stageNumber) => {
    setSelectedStage(stageNumber)
    setSelectedRailType('slow')
    setPlacedRails([])
    setResult(null)
    setMessage('')
    setTrainRun(null)
    setScreen('game')
  }

  const isSamePosition = (a, b) => a.x === b.x && a.y === b.y

  const getRelayCells = () => {
    if (!currentStage) return []

    return currentStage.relayGroups.flatMap((relayGroup, relayIndex) =>
      relayGroup.cells.map((cell, cellIndex) => ({
        ...cell,
        relayIndex,
        relayNumber: relayIndex + 1,
        cellIndex,
      })),
    )
  }

  const getRelayCellAt = (position) => {
    return getRelayCells().find((relayCell) =>
      isSamePosition(position, relayCell),
    )
  }

  const getRelayTargets = () => {
    if (!currentStage) return []

    return currentStage.relayGroups.map((relayGroup, index) => ({
      relayNumber: index + 1,
      position: relayGroup.cells[relayGroup.cells.length - 1],
    }))
  }

  const isSpecialCell = (x, y) => {
    if (!currentStage) return false

    const position = { x, y }

    return (
      isSamePosition(position, currentStage.start) ||
      isSamePosition(position, currentStage.goal) ||
      Boolean(getRelayCellAt(position))
    )
  }

  const getRailAt = (x, y) => {
    return placedRails.find((rail) => rail.x === x && rail.y === y)
  }

  const toggleRail = (x, y) => {
    if (isSpecialCell(x, y) || trainRun) return
    setMessage('')

    const rail = getRailAt(x, y)

    if (rail?.type === selectedRailType) {
      setPlacedRails(placedRails.filter((item) => !(item.x === x && item.y === y)))
      return
    }

    setPlacedRails([
      ...placedRails.filter((item) => !(item.x === x && item.y === y)),
      {
        x,
        y,
        type: selectedRailType,
      },
    ])
  }

  const positionToKey = (position) => `${position.x}-${position.y}`

  const getNeighborPositions = (position) => [
    { x: position.x, y: position.y - 1 },
    { x: position.x + 1, y: position.y },
    { x: position.x, y: position.y + 1 },
    { x: position.x - 1, y: position.y },
  ]

  const getConnectionsFromRoute = (position, routePositions) => {
    if (!routePositions) return []

    return [
      ...new Set(
        routePositions.flatMap((routePosition, routeIndex) => {
          if (!isSamePosition(routePosition, position)) return []

          return [routePositions[routeIndex - 1], routePositions[routeIndex + 1]]
            .filter(Boolean)
            .map((neighbor) => getDirectionBetween(position, neighbor))
            .filter(Boolean)
        }),
      ),
    ]
  }

  const isInsideMap = (position) => {
    return (
      position.x >= 0 &&
      position.x < currentStage.width &&
      position.y >= 0 &&
      position.y < currentStage.height
    )
  }

  const canTrainPass = (position) => {
    if (!isInsideMap(position)) return false

    return (
      isSamePosition(position, currentStage.start) ||
      isSamePosition(position, currentStage.goal) ||
      Boolean(getRelayCellAt(position)) ||
      Boolean(getRailAt(position.x, position.y))
    )
  }

  const getTravelTimeAt = (position) => {
    const rail = getRailAt(position.x, position.y)
    return rail ? 1 / RAIL_TYPES[rail.type].speed : 0
  }

  const getRelayMaskAt = (position) => {
    return getRelayCells().reduce((mask, relayCell, index) => {
      return isSamePosition(position, relayCell) ? mask | (1 << index) : mask
    }, 0)
  }

  const findShortestRoute = (requireRelayPoints = true) => {
    if (!currentStage) return null

    const allRelayMask = (1 << getRelayCells().length) - 1
    const startMask = getRelayMaskAt(currentStage.start)
    const startKey = `${positionToKey(currentStage.start)}-${startMask}`
    const openStates = [
      {
        key: startKey,
        position: currentStage.start,
        relayMask: startMask,
        steps: 0,
        time: 0,
      },
    ]
    const distances = new Map([[startKey, { steps: 0, time: 0 }]])
    const parents = new Map([[startKey, null]])
    const states = new Map([
      [startKey, { position: currentStage.start, relayMask: startMask }],
    ])

    while (openStates.length > 0) {
      let bestIndex = 0

      for (let index = 1; index < openStates.length; index += 1) {
        const candidate = openStates[index]
        const best = openStates[bestIndex]

        if (
          candidate.steps < best.steps ||
          (candidate.steps === best.steps && candidate.time < best.time)
        ) {
          bestIndex = index
        }
      }

      const current = openStates.splice(bestIndex, 1)[0]
      const recordedDistance = distances.get(current.key)

      if (
        recordedDistance.steps !== current.steps ||
        Math.abs(recordedDistance.time - current.time) > 0.0001
      ) {
        continue
      }

      const hasRequiredRelays =
        !requireRelayPoints || current.relayMask === allRelayMask

      if (isSamePosition(current.position, currentStage.goal) && hasRequiredRelays) {
        const positions = []
        let routeKey = current.key

        while (routeKey) {
          positions.unshift(states.get(routeKey).position)
          routeKey = parents.get(routeKey)
        }

        return {
          positions,
          time: current.time,
        }
      }

      getNeighborPositions(current.position).forEach((neighbor) => {
        if (!canTrainPass(neighbor)) return

        const relayMask = current.relayMask | getRelayMaskAt(neighbor)
        const key = `${positionToKey(neighbor)}-${relayMask}`
        const nextDistance = {
          steps: current.steps + 1,
          time: current.time + getTravelTimeAt(neighbor),
        }
        const previousDistance = distances.get(key)
        const isBetterRoute =
          !previousDistance ||
          nextDistance.steps < previousDistance.steps ||
          (nextDistance.steps === previousDistance.steps &&
            nextDistance.time < previousDistance.time)

        if (!isBetterRoute) return

        distances.set(key, nextDistance)
        parents.set(key, current.key)
        states.set(key, { position: neighbor, relayMask })
        openStates.push({
          key,
          position: neighbor,
          relayMask,
          ...nextDistance,
        })
      })
    }

    return null
  }

  const findRouteToPosition = (targetPosition) => {
    if (!currentStage) return null

    const startKey = positionToKey(currentStage.start)
    const openStates = [
      {
        key: startKey,
        position: currentStage.start,
        steps: 0,
        time: 0,
      },
    ]
    const distances = new Map([[startKey, { steps: 0, time: 0 }]])
    const parents = new Map([[startKey, null]])
    const states = new Map([[startKey, currentStage.start]])

    while (openStates.length > 0) {
      let bestIndex = 0

      for (let index = 1; index < openStates.length; index += 1) {
        const candidate = openStates[index]
        const best = openStates[bestIndex]

        if (
          candidate.steps < best.steps ||
          (candidate.steps === best.steps && candidate.time < best.time)
        ) {
          bestIndex = index
        }
      }

      const current = openStates.splice(bestIndex, 1)[0]
      const recordedDistance = distances.get(current.key)

      if (
        recordedDistance.steps !== current.steps ||
        Math.abs(recordedDistance.time - current.time) > 0.0001
      ) {
        continue
      }

      if (isSamePosition(current.position, targetPosition)) {
        const positions = []
        let routeKey = current.key

        while (routeKey) {
          positions.unshift(states.get(routeKey))
          routeKey = parents.get(routeKey)
        }

        return {
          positions,
          time: current.time,
        }
      }

      getNeighborPositions(current.position).forEach((neighbor) => {
        if (!canTrainPass(neighbor)) return

        const key = positionToKey(neighbor)
        const nextDistance = {
          steps: current.steps + 1,
          time: current.time + getTravelTimeAt(neighbor),
        }
        const previousDistance = distances.get(key)
        const isBetterRoute =
          !previousDistance ||
          nextDistance.steps < previousDistance.steps ||
          (nextDistance.steps === previousDistance.steps &&
            nextDistance.time < previousDistance.time)

        if (!isBetterRoute) return

        distances.set(key, nextDistance)
        parents.set(key, current.key)
        states.set(key, neighbor)
        openStates.push({
          key,
          position: neighbor,
          ...nextDistance,
        })
      })
    }

    return null
  }

  const createTrainMotion = (route) => {
    const mapElement = mapRef.current

    if (!mapElement) return null

    const mapRect = mapElement.getBoundingClientRect()
    const routePoints = route.positions.map((position) => {
      const cell = mapElement.querySelector(
        `[data-cell-key="${positionToKey(position)}"]`,
      )

      if (!cell) return null

      const cellRect = cell.getBoundingClientRect()

      return {
        position,
        x: cellRect.left - mapRect.left + cellRect.width / 2,
        y: cellRect.top - mapRect.top + cellRect.height / 2,
        size: Math.min(cellRect.width, cellRect.height),
      }
    })

    if (routePoints.some((point) => !point)) return null

    const commands = [`M ${routePoints[0].x} ${routePoints[0].y}`]

    for (let index = 1; index < routePoints.length - 1; index += 1) {
      const previous = routePoints[index - 1]
      const current = routePoints[index]
      const next = routePoints[index + 1]
      const incomingDirection = getDirectionBetween(
        current.position,
        previous.position,
      )
      const outgoingDirection = getDirectionBetween(
        current.position,
        next.position,
      )
      const isStraight =
        OPPOSITE_DIRECTIONS[incomingDirection] === outgoingDirection

      if (isStraight) {
        commands.push(`L ${current.x} ${current.y}`)
        continue
      }

      const turnRadius = current.size * 0.22
      const incomingStep = DIRECTION_STEPS[incomingDirection]
      const outgoingStep = DIRECTION_STEPS[outgoingDirection]
      const entryPoint = {
        x: current.x + incomingStep.x * turnRadius,
        y: current.y + incomingStep.y * turnRadius,
      }
      const exitPoint = {
        x: current.x + outgoingStep.x * turnRadius,
        y: current.y + outgoingStep.y * turnRadius,
      }

      commands.push(
        `L ${entryPoint.x} ${entryPoint.y}`,
        `Q ${current.x} ${current.y} ${exitPoint.x} ${exitPoint.y}`,
      )
    }

    const lastPoint = routePoints[routePoints.length - 1]
    commands.push(`L ${lastPoint.x} ${lastPoint.y}`)

    return {
      path: commands.join(' '),
      width: mapRect.width,
      height: mapRect.height,
      trainCarWidth: routePoints[0].size * 0.62,
      trainCarHeight: routePoints[0].size * 0.5,
      trainCarGap: routePoints[0].size * 0.16,
    }
  }

  useEffect(() => {
    if (!trainRun || screen !== 'game') return undefined

    const timer = window.setTimeout(() => {
      setResult(trainRun.result)
      setTrainRun(null)
      setScreen('result')
    }, trainRun.duration + 450)

    return () => window.clearTimeout(timer)
  }, [screen, trainRun])

  const startTrain = () => {
    if (trainRun) return

    const route = findShortestRoute()

    if (!route) {
      const routeWithoutRelayRequirement = findShortestRoute(false)
      const errorMessage =
        routeWithoutRelayRequirement && getRelayCells().length > 0
          ? '中継地点を通るようにレールをつなげてください。'
          : 'スタートからゴールまでレールがつながっていません。'
      setMessage(errorMessage)
      return
    }

    const actualTime = route.time
    const difference = actualTime - currentStage.targetTime

    const nextResult = {
      targetTime: currentStage.targetTime,
      actualTime,
      difference,
    }
    const motion = createTrainMotion(route)

    if (!motion) {
      setMessage('電車の走行位置を読み込めませんでした。もう一度お試しください。')
      return
    }
    const duration = Math.max(
      1400,
      actualTime * ANIMATION_MS_PER_GAME_SECOND,
    )

    setResult(null)
    setMessage('')
    setTrainRun({
      id: Date.now(),
      route,
      result: nextResult,
      duration,
      motion,
    })
  }

  const getFallbackConnections = (position) => {
    const connections = Object.entries(DIRECTION_STEPS)
      .filter(([, step]) =>
        canTrainPass({
          x: position.x + step.x,
          y: position.y + step.y,
        }),
      )
      .map(([direction]) => direction)

    if (connections.length === 1) {
      return [connections[0], OPPOSITE_DIRECTIONS[connections[0]]]
    }

    return connections
  }

  const renderCell = (x, y, route) => {
    const position = { x, y }
    const rail = getRailAt(x, y)
    const routeConnections = getConnectionsFromRoute(position, route?.positions)
    const isOnRoute = routeConnections.length > 0
    const connections = isOnRoute
      ? routeConnections
      : rail
        ? getFallbackConnections(position)
        : []

    if (currentStage && isSamePosition(position, currentStage.start)) {
      return (
        <span className="special-cell-content">
          {isOnRoute && (
            <RailPiece
              type="station"
              compact
              connections={connections}
              showSpeed={false}
            />
          )}
          <SpecialCellAsset type="start" label="S" />
        </span>
      )
    }

    if (currentStage && isSamePosition(position, currentStage.goal)) {
      return (
        <span className="special-cell-content">
          {isOnRoute && (
            <RailPiece
              type="station"
              compact
              connections={connections}
              showSpeed={false}
            />
          )}
          <SpecialCellAsset type="goal" label="G" />
        </span>
      )
    }

    const relayCell = currentStage ? getRelayCellAt(position) : null

    if (relayCell) {
      const tunnelPart =
        relayCell.part === 'entrance-right'
          ? 'tunnel-entrance-right'
          : relayCell.part === 'middle'
            ? 'tunnel-middle'
            : 'tunnel-entrance'
      const label = relayCell.cellIndex === 0 ? '中' : null

      return (
        <span className="special-cell-content">
          {isOnRoute && (
            <RailPiece
              type="station"
              compact
              connections={connections}
              showSpeed={false}
            />
          )}
          <SpecialCellAsset type={tunnelPart} label={label} />
        </span>
      )
    }

    if (rail) {
      return (
        <RailPiece
          type={rail.type}
          compact
          connections={connections}
        />
      )
    }

    return ''
  }

  const getResultMessage = () => {
    if (!result) return ''

    if (result.difference === 0) {
      return '時間ぴったり！'
    }

    const seconds = Math.abs(result.difference).toFixed(1)
    return result.difference > 0 ? `${seconds}秒遅い！` : `${seconds}秒早い！`
  }

  const shortestRoute = currentStage ? findShortestRoute() : null
  const shortestRouteRailCount =
    shortestRoute?.positions.filter((position) => getRailAt(position.x, position.y))
      .length ?? 0
  const connectedRelayRoute =
    currentStage
      ? getRelayTargets()
        .map((relayTarget) => ({
          relayNumber: relayTarget.relayNumber,
          route: findRouteToPosition(relayTarget.position),
        }))
        .find((relayRoute) => relayRoute.route) ?? null
      : null
  const visibleRoute = shortestRoute ?? connectedRelayRoute?.route ?? null
  const visibleRouteRailCount =
    visibleRoute?.positions.filter((position) => getRailAt(position.x, position.y))
      .length ?? 0
  const timePanelStatus = shortestRoute
    ? 'connected'
    : connectedRelayRoute
      ? 'partial'
      : 'waiting'

  return (
    <div className="app">
      {screen === 'title' && (
        <div className="screen title-screen">
          <h1>時間ぴったりトレイン</h1>

          <label className="player-label">
            番号
            <input type="text" className="player-input" />
          </label>

          <button className="main-button" onClick={() => setScreen('stageSelect')}>
            START
          </button>
        </div>
      )}

      {screen === 'stageSelect' && (
        <div className="screen">
          <h1>ステージ選択</h1>
          <p>遊ぶステージを選んでください</p>

          <div className="stage-list">
            {Object.entries(STAGES).map(([stageNumber, stage]) => (
              <button key={stageNumber} onClick={() => startStage(Number(stageNumber))}>
                <span>{stageNumber}</span>
                <small>{stage.description}</small>
              </button>
            ))}
          </div>

          <button className="sub-button" onClick={() => setScreen('title')}>
            タイトルへ戻る
          </button>
        </div>
      )}

      {screen === 'game' && currentStage && (
        <div className="screen game-screen">
          <div className="game-header">
            <button disabled={Boolean(trainRun)} onClick={() => setScreen('title')}>🏠</button>
            <h2>{currentStage.title}</h2>
            <button disabled={Boolean(trainRun)} onClick={() => setScreen('stageSelect')}>↩</button>
          </div>

          <p className="target-time">目標時間：{currentStage.targetTime}秒</p>

          <div className="rail-yard">
            <div className="rail-yard-heading">
              <div>
                <h3>レール置き場</h3>
                <p>使いたいレールを選んでから、盤面のマスを押してください。</p>
              </div>
              <button
                className="clear-rails-button"
                disabled={placedRails.length === 0 || Boolean(trainRun)}
                onClick={() => {
                  setPlacedRails([])
                  setMessage('')
                }}
              >
                全て片付ける
              </button>
            </div>

            <div className="rail-selector">
              {currentStage.availableRails.map((railType) => (
                <button
                  key={railType}
                  className={`rail-card ${selectedRailType === railType ? 'selected' : ''}`}
                  disabled={Boolean(trainRun)}
                  onClick={() => setSelectedRailType(railType)}
                >
                  <RailPiece type={railType} />
                  <span className="rail-card-copy">
                    <strong>{RAIL_TYPES[railType].label}</strong>
                    <small>{RAIL_TYPES[railType].description}</small>
                  </span>
                  {selectedRailType === railType && (
                    <span className="rail-selected-label">選択中</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={mapRef}
            className={`grid-map ${trainRun ? 'train-running' : ''}`}
            style={{
              gridTemplateColumns: `repeat(${currentStage.width}, 1fr)`,
            }}
          >
            {Array.from({ length: currentStage.height }).map((_, y) =>
              Array.from({ length: currentStage.width }).map((__, x) => {
                const rail = getRailAt(x, y)
                const isStart = isSamePosition({ x, y }, currentStage.start)
                const isGoal = isSamePosition({ x, y }, currentStage.goal)
                const relayCell = getRelayCellAt({ x, y })
                const isRelay = Boolean(relayCell)
                const isShortestRoute = visibleRoute?.positions.some((position) =>
                  isSamePosition({ x, y }, position),
                )
                const cellLabel = isStart
                  ? 'スタート'
                  : isGoal
                    ? 'ゴール'
                    : isRelay
                      ? `中継地点 ${relayCell.cellIndex + 1}マス目`
                      : rail
                        ? `${RAIL_TYPES[rail.type].label} ${x + 1}列 ${y + 1}行`
                        : `空きマス ${x + 1}列 ${y + 1}行`

                return (
                  <button
                    key={`${x}-${y}`}
                    data-cell-key={`${x}-${y}`}
                    aria-label={cellLabel}
                    disabled={Boolean(trainRun)}
                    className={`map-cell ${rail ? `rail-${rail.type}` : ''} ${isStart ? 'start-cell' : ''} ${isGoal ? 'goal-cell' : ''} ${isRelay ? 'relay-cell' : ''} ${isShortestRoute ? 'shortest-route-cell' : ''}`}
                    onClick={() => toggleRail(x, y)}
                  >
                    {renderCell(x, y, visibleRoute)}
                  </button>
                )
              })
            )}

            {trainRun && (
              <svg
                key={trainRun.id}
                className="train-motion-layer"
                viewBox={`0 0 ${trainRun.motion.width} ${trainRun.motion.height}`}
                preserveAspectRatio="none"
                overflow="visible"
                role="img"
                aria-label="走行中の電車"
              >
                <path
                  className="train-motion-guide"
                  d={trainRun.motion.path}
                />
                <g className="train-image-vehicle" overflow="visible">
                  {[-0.5, 0.5].map((offset) => (
                    <rect
                      key={offset}
                      className="train-coupler"
                      x={
                        offset *
                          (trainRun.motion.trainCarWidth + trainRun.motion.trainCarGap) -
                        trainRun.motion.trainCarGap / 2
                      }
                      y={-trainRun.motion.trainCarHeight * 0.1}
                      width={trainRun.motion.trainCarGap}
                      height={trainRun.motion.trainCarHeight * 0.2}
                      rx={trainRun.motion.trainCarGap * 0.25}
                    />
                  ))}
                  {TRAIN_CARS.map((car) => (
                    <image
                      key={car.key}
                      className={`train-image train-image-${car.key}`}
                      href={car.image}
                      x={
                        car.offset *
                          (trainRun.motion.trainCarWidth + trainRun.motion.trainCarGap) -
                        trainRun.motion.trainCarWidth / 2
                      }
                      y={-trainRun.motion.trainCarHeight / 2}
                      width={trainRun.motion.trainCarWidth}
                      height={trainRun.motion.trainCarHeight}
                      preserveAspectRatio="xMidYMid meet"
                    />
                  ))}
                  <animateMotion
                    dur={`${trainRun.duration}ms`}
                    path={trainRun.motion.path}
                    rotate="auto"
                    fill="freeze"
                  />
                </g>
              </svg>
            )}
          </div>

          <div className={`time-panel time-panel-${timePanelStatus}`} aria-live="polite">
            <span className="time-panel-label">予想時間</span>
            <span className="time-panel-scope">
              {shortestRoute
                ? 'ゴールまで'
                : connectedRelayRoute
                  ? `中継地点${connectedRelayRoute.relayNumber}まで`
                  : getRelayCells().length > 0
                    ? '中継地点まで'
                    : 'ゴールまで'}
            </span>
            <strong>
              {shortestRoute
                ? `${shortestRoute.time.toFixed(1)}秒`
                : connectedRelayRoute
                  ? `${connectedRelayRoute.route.time.toFixed(1)}秒`
                  : '未接続'}
            </strong>
            <small className="time-panel-note">
              {shortestRoute
                ? `最短経路 ${shortestRouteRailCount}マス / 目標 ${currentStage.targetTime}秒`
                : connectedRelayRoute
                  ? `ここまで ${visibleRouteRailCount}マス。ゴールまでつなげると最終予想時間に変わります。`
                  : getRelayCells().length > 0
                    ? 'まずはスタートから中継地点までレールをつなげてください。'
                    : 'スタートからゴールまでレールをつなげると表示されます。'}
            </small>
          </div>

          <div className="rail-info">
            <p>S：スタート</p>
            <p>G：ゴール</p>
            <p>中：中継地点</p>
            <p>配置したレール数：{placedRails.length}マス</p>
            <p>
              表示中の経路：
              {visibleRoute ? `${visibleRouteRailCount}マス` : '未接続'}
            </p>
          </div>

          <p className="route-hint">
            {shortestRoute
              ? '予想時間には、黄色で示した最短経路上のレールだけが含まれます。'
              : connectedRelayRoute
                ? '黄色の経路は、現在つながっている中継地点までのルートです。'
                : '黄色の経路が表示されたら、時間もここに表示されます。'}
          </p>

          {trainRun && (
            <p className="train-status" aria-live="polite">
              電車が走行中です
              <span>最短経路を走行中</span>
            </p>
          )}

          {message && <p className="game-message">{message}</p>}

          <button className="main-button" disabled={Boolean(trainRun)} onClick={startTrain}>
            {trainRun ? '走行中...' : '出発'}
          </button>
        </div>
      )}

      {screen === 'result' && result && (
        <div className="screen result-screen">
          <div className="result-box">
            <h1>リザルト</h1>
            <p>目標：{result.targetTime}秒</p>
            <p>実際：{result.actualTime.toFixed(1)}秒</p>
            <p>{getResultMessage()}</p>

            <div className="result-buttons">
              <button onClick={() => setScreen('title')}>🏠</button>
              <button onClick={() => setScreen('game')}>↩</button>
              <button onClick={() => setScreen('stageSelect')}>▶</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
