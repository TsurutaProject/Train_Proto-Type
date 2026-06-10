import { useEffect, useRef, useState } from 'react'
import './App.css'

const STAGES = {
  1: {
    title: 'ステージ1',
    description: 'まずはレールを置く操作を覚えよう',
    targetTime: 6,
    width: 8,
    height: 5,
    start: { x: 0, y: 2 },
    goal: { x: 7, y: 2 },
    relayPoints: [],
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
    relayPoints: [],
    availableRails: ['slow', 'fast'],
  },
  3: {
    title: 'ステージ3',
    description: '中継地点を通るルートを考えよう',
    targetTime: 6,
    width: 8,
    height: 5,
    start: { x: 0, y: 2 },
    goal: { x: 7, y: 2 },
    relayPoints: [{ x: 4, y: 2 }],
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

const getRailPath = (connections) => {
  const directions = [...new Set(connections)]

  if (directions.length === 0) {
    return 'M 0 50 L 100 50'
  }

  if (directions.length === 1) {
    const endpointPaths = {
      up: 'M 50 0 L 50 50',
      right: 'M 100 50 L 50 50',
      down: 'M 50 100 L 50 50',
      left: 'M 0 50 L 50 50',
    }

    return endpointPaths[directions[0]]
  }

  if (directions.length === 2) {
    const connectionKey = directions.sort().join('-')
    const paths = {
      'left-right': 'M 0 50 L 100 50',
      'down-up': 'M 50 0 L 50 100',
      'right-up': 'M 50 0 L 50 28 Q 50 50 72 50 L 100 50',
      'down-right': 'M 100 50 L 72 50 Q 50 50 50 72 L 50 100',
      'down-left': 'M 50 100 L 50 72 Q 50 50 28 50 L 0 50',
      'left-up': 'M 0 50 L 28 50 Q 50 50 50 28 L 50 0',
    }

    return paths[connectionKey] ?? 'M 0 50 L 100 50'
  }

  const edgePoints = {
    up: '50 0',
    right: '100 50',
    down: '50 100',
    left: '0 50',
  }

  return directions.map((direction) => `M 50 50 L ${edgePoints[direction]}`).join(' ')
}

function RailPiece({
  type = 'slow',
  compact = false,
  connections = ['left', 'right'],
  showSpeed = true,
}) {
  const path = getRailPath(connections)

  return (
    <span
      className={`rail-piece rail-piece-${type} ${compact ? 'rail-piece-compact' : ''}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path className="rail-sleeper-line" d={path} pathLength="100" />
        <path className="rail-base-line" d={path} />
        <path className="rail-metal-line" d={path} />
        <path className="rail-gap-line" d={path} />
      </svg>
      {showSpeed && (
        <span className="rail-speed-badge">{RAIL_TYPES[type].speed}</span>
      )}
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

  const isSpecialCell = (x, y) => {
    if (!currentStage) return false

    const position = { x, y }

    return (
      isSamePosition(position, currentStage.start) ||
      isSamePosition(position, currentStage.goal) ||
      currentStage.relayPoints.some((point) => isSamePosition(position, point))
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
      currentStage.relayPoints.some((point) => isSamePosition(position, point)) ||
      Boolean(getRailAt(position.x, position.y))
    )
  }

  const getTravelTimeAt = (position) => {
    const rail = getRailAt(position.x, position.y)
    return rail ? 1 / RAIL_TYPES[rail.type].speed : 0
  }

  const getRelayMaskAt = (position) => {
    return currentStage.relayPoints.reduce((mask, relayPoint, index) => {
      return isSamePosition(position, relayPoint) ? mask | (1 << index) : mask
    }, 0)
  }

  const findShortestRoute = (requireRelayPoints = true) => {
    if (!currentStage) return null

    const allRelayMask = (1 << currentStage.relayPoints.length) - 1
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
      trainWidth: routePoints[0].size * 0.72,
      trainHeight: routePoints[0].size * 0.42,
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
        routeWithoutRelayRequirement && currentStage.relayPoints.length > 0
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
          <span className="special-cell-label">S</span>
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
          <span className="special-cell-label">G</span>
        </span>
      )
    }

    if (currentStage && currentStage.relayPoints.some((point) => isSamePosition(position, point))) {
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
          <span className="special-cell-label relay-label">中</span>
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
                const isRelay = currentStage.relayPoints.some((point) => isSamePosition({ x, y }, point))
                const isShortestRoute = shortestRoute?.positions.some((position) =>
                  isSamePosition({ x, y }, position),
                )
                const cellLabel = isStart
                  ? 'スタート'
                  : isGoal
                    ? 'ゴール'
                    : isRelay
                      ? '中継地点'
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
                    {renderCell(x, y, shortestRoute)}
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
                role="img"
                aria-label="走行中の電車"
              >
                <path
                  className="train-motion-guide"
                  d={trainRun.motion.path}
                />
                <g className="train-svg-vehicle">
                  <rect
                    className="train-svg-cab"
                    x={-trainRun.motion.trainWidth * 0.42}
                    y={-trainRun.motion.trainHeight * 0.66}
                    width={trainRun.motion.trainWidth * 0.68}
                    height={trainRun.motion.trainHeight * 0.68}
                    rx={trainRun.motion.trainHeight * 0.14}
                  />
                  <path
                    className="train-svg-front"
                    d={`
                      M ${trainRun.motion.trainWidth * 0.2} ${-trainRun.motion.trainHeight * 0.66}
                      Q ${trainRun.motion.trainWidth * 0.47} ${-trainRun.motion.trainHeight * 0.58}
                        ${trainRun.motion.trainWidth * 0.48} ${-trainRun.motion.trainHeight * 0.3}
                      Q ${trainRun.motion.trainWidth * 0.47} ${-trainRun.motion.trainHeight * 0.05}
                        ${trainRun.motion.trainWidth * 0.2} ${trainRun.motion.trainHeight * 0.02}
                      Z
                    `}
                  />
                  <rect
                    className="train-svg-window"
                    x={-trainRun.motion.trainWidth * 0.29}
                    y={-trainRun.motion.trainHeight * 0.5}
                    width={trainRun.motion.trainWidth * 0.18}
                    height={trainRun.motion.trainHeight * 0.2}
                    rx="3"
                  />
                  <rect
                    className="train-svg-window"
                    x={-trainRun.motion.trainWidth * 0.06}
                    y={-trainRun.motion.trainHeight * 0.5}
                    width={trainRun.motion.trainWidth * 0.18}
                    height={trainRun.motion.trainHeight * 0.2}
                    rx="3"
                  />
                  <circle
                    className="train-svg-wheel"
                    cx={-trainRun.motion.trainWidth * 0.23}
                    cy="0"
                    r={trainRun.motion.trainHeight * 0.12}
                  />
                  <circle
                    className="train-svg-wheel"
                    cx={trainRun.motion.trainWidth * 0.17}
                    cy="0"
                    r={trainRun.motion.trainHeight * 0.12}
                  />
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

          <div className="rail-info">
            <p>S：スタート</p>
            <p>G：ゴール</p>
            <p>中：中継地点</p>
            <p>配置したレール数：{placedRails.length}マス</p>
            <p>
              最短経路：
              {shortestRoute ? `${shortestRouteRailCount}マス` : '未接続'}
            </p>
            <p>
              予想時間：
              {shortestRoute ? `${shortestRoute.time.toFixed(1)}秒` : '未接続'}
            </p>
          </div>

          <p className="route-hint">
            予想時間には、黄色で示した最短経路上のレールだけが含まれます。
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
