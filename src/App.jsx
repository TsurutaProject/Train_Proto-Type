import { useEffect, useEffectEvent, useRef, useState } from 'react'
import './App.css'
import blueTrainLeftImage from './assets/train-game/blue-train-left.png'
import blueTrainRightImage from './assets/train-game/blue-train-right.png'
import curvedRailImage from './assets/train-game/curved-rail.png'
import obstacleRockImage from './assets/train-game/obstacle-rock.png'
import obstacleTreeImage from './assets/train-game/obstacle-tree.png'
import redStationBuildingImage from './assets/train-game/red-station-building.png'
import stationBuildingImage from './assets/train-game/station-building.png'
import straightRailImage from './assets/train-game/straight-rail.png'
import tunnelEntranceRailLeftImage from './assets/train-game/tunnel-entrance-rail-left.png'
import tunnelMiddleImage from './assets/train-game/tunnel-middle.png'

const TRAIN_CARS = [
  { key: 'rear', image: blueTrainLeftImage, offset: -0.21 },
  { key: 'front', image: blueTrainRightImage, offset: 0.21 },
]

const STAGES = {
  tutorial: {
    title: 'チュートリアル',
    badge: '練習',
    description: '操作ガイドを見ながら電車を走らせよう',
    isTutorial: true,
    targetTime: 3,
    width: 7,
    height: 8,
    start: { x: 0, y: 2 },
    goal: { x: 6, y: 2 },
    relayGroups: [
      {
        cells: [
          { x: 3, y: 2, part: 'entrance-right' },
          { x: 4, y: 2, part: 'entrance' },
        ],
      },
    ],
    availableRails: ['slow'],
  },
  1: {
    title: 'ステージ1',
    description: 'まずはレールを置く操作を覚えよう',
    targetTime: 6,
    width: 8,
    height: 8,
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
    height: 8,
    start: { x: 0, y: 2 },
    goal: { x: 7, y: 2 },
    relayGroups: [],
    availableRails: ['slow', 'fast'],
  },
  3: {
    title: 'ステージ3',
    description: '高速レール2本を配分して中継地点を通ろう',
    targetTime: 3,
    width: 8,
    height: 8,
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
    maxFastRails: 2,
  },
  4: {
    title: 'ステージ4',
    description: '障害物を避け、近道になる経路を比較しよう',
    targetTime: 5,
    width: 8,
    height: 8,
    start: { x: 0, y: 2 },
    goal: { x: 7, y: 2 },
    relayGroups: [],
    obstacles: [
      { x: 3, y: 2, type: 'rock' },
      { x: 2, y: 3, type: 'tree' },
      { x: 3, y: 3, type: 'tree' },
      { x: 4, y: 3, type: 'tree' },
      { x: 5, y: 3, type: 'tree' },
    ],
    availableRails: ['slow', 'fast'],
  },
  5: {
    title: 'ステージ5',
    description: '岩と木を避け、低速で中継地点へ向かおう',
    targetTime: 6,
    width: 9,
    height: 8,
    start: { x: 0, y: 2 },
    goal: { x: 8, y: 2 },
    relayGroups: [
      {
        cells: [
          { x: 4, y: 2, part: 'entrance-right' },
          { x: 5, y: 2, part: 'entrance' },
        ],
      },
    ],
    obstacles: [
      { x: 2, y: 2, type: 'rock' },
      { x: 2, y: 3, type: 'tree' },
    ],
    availableRails: ['slow', 'fast'],
    relayRequiresSlowApproach: true,
  },
  6: {
    title: 'ステージ6',
    description: '目標時間を守りながら高速レールを節約しよう',
    targetTime: 5,
    width: 10,
    height: 8,
    start: { x: 0, y: 2 },
    goal: { x: 9, y: 2 },
    relayGroups: [
      {
        cells: [
          { x: 4, y: 2, part: 'entrance-right' },
          { x: 5, y: 2, part: 'entrance' },
        ],
      },
    ],
    obstacles: [],
    availableRails: ['slow', 'fast'],
    maxFastRails: 2,
    relayRequiresSlowApproach: true,
  },
  7: {
    title: 'ステージ7',
    description: '同じ条件を満たす複数の経路を見つけよう',
    targetTime: 6.5,
    width: 10,
    height: 8,
    start: { x: 0, y: 2 },
    goal: { x: 9, y: 2 },
    relayGroups: [
      {
        cells: [
          { x: 4, y: 2, part: 'entrance-right' },
          { x: 5, y: 2, part: 'entrance' },
        ],
      },
    ],
    obstacles: [{ x: 7, y: 2, type: 'rock' }],
    availableRails: ['slow', 'fast'],
    maxFastRails: 3,
    relayRequiresSlowApproach: true,
  },
  8: {
    title: 'ステージ8',
    description: '2つの中継地点をすべて通過しよう',
    targetTime: 6,
    width: 10,
    height: 8,
    start: { x: 0, y: 3 },
    goal: { x: 9, y: 3 },
    relayGroups: [
      {
        cells: [
          { x: 3, y: 2, part: 'entrance-right' },
          { x: 4, y: 2, part: 'entrance' },
        ],
      },
      {
        cells: [
          { x: 6, y: 4, part: 'entrance-right' },
          { x: 7, y: 4, part: 'entrance' },
        ],
      },
    ],
    obstacles: [],
    availableRails: ['slow', 'fast'],
    maxFastRails: 4,
    relayRequiresSlowApproach: true,
  },
  9: {
    title: 'ステージ9',
    description: '最短経路を外れ、8秒になる遠回りを作ろう',
    targetTime: 8,
    width: 8,
    height: 8,
    start: { x: 0, y: 3 },
    goal: { x: 7, y: 3 },
    relayGroups: [],
    obstacles: [],
    availableRails: ['slow'],
    requiresDetour: true,
  },
  10: {
    title: 'ステージ10',
    description: '高さの違うゴールと、ゴール前の低速エリアに挑戦',
    targetTime: 7.5,
    width: 9,
    height: 8,
    start: { x: 0, y: 1 },
    goal: { x: 8, y: 6 },
    relayGroups: [],
    obstacles: [],
    availableRails: ['slow', 'fast'],
    slowZoneRadius: 3,
  },
  11: {
    title: 'ステージ11',
    description: '横中継を抜けて折り返し、縦中継から別の高さへ進もう',
    targetTime: 13,
    width: 11,
    height: 8,
    start: { x: 0, y: 1 },
    goal: { x: 1, y: 6 },
    relayGroups: [
      {
        cells: [
          { x: 3, y: 1 },
          { x: 4, y: 1 },
        ],
      },
      {
        orientation: 'vertical',
        cells: [
          { x: 8, y: 3 },
          { x: 8, y: 4 },
        ],
      },
    ],
    turnaroundPoints: [{ x: 10, y: 1 }],
    obstacles: [
      { x: 6, y: 2, type: 'tree' },
      { x: 7, y: 2, type: 'rock' },
      { x: 9, y: 2, type: 'tree' },
    ],
    availableRails: ['slow', 'fast'],
    maxFastRails: 8,
    relayRequiresSlowApproach: true,
  },
  12: {
    title: 'ステージ12',
    description: '複数中継・高低差・ゴール前低速をまとめて攻略しよう',
    targetTime: 8,
    width: 11,
    height: 8,
    start: { x: 0, y: 6 },
    goal: { x: 10, y: 1 },
    relayGroups: [
      {
        cells: [
          { x: 3, y: 5, part: 'entrance-right' },
          { x: 4, y: 5, part: 'entrance' },
        ],
      },
      {
        cells: [
          { x: 6, y: 2, part: 'entrance-right' },
          { x: 7, y: 2, part: 'entrance' },
        ],
      },
    ],
    obstacles: [
      { x: 4, y: 3, type: 'tree' },
      { x: 8, y: 4, type: 'rock' },
    ],
    availableRails: ['slow', 'fast'],
    maxFastRails: 4,
    relayRequiresSlowApproach: true,
    slowZoneRadius: 3,
  },
  13: {
    title: 'ステージ13',
    description: '塞がれた道を避け、縦トンネルを上下に通過しよう',
    targetTime: 10,
    width: 10,
    height: 8,
    start: { x: 0, y: 4 },
    goal: { x: 9, y: 4 },
    relayGroups: [
      {
        orientation: 'vertical',
        cells: [
          { x: 5, y: 2 },
          { x: 5, y: 3 },
          { x: 5, y: 4 },
        ],
      },
    ],
    obstacles: [
      { x: 2, y: 4, type: 'rock' },
      { x: 3, y: 4, type: 'rock' },
      { x: 4, y: 4, type: 'tree' },
    ],
    availableRails: ['slow', 'fast'],
    maxFastRails: 6,
    relayRequiresSlowApproach: true,
  },
  14: {
    title: 'ステージ14',
    description: '混雑区画を迂回するか、高速で抜けるか選ぼう',
    targetTime: 7,
    width: 11,
    height: 8,
    start: { x: 0, y: 3 },
    goal: { x: 10, y: 3 },
    relayGroups: [
      {
        cells: [
          { x: 4, y: 3 },
          { x: 5, y: 3 },
        ],
      },
    ],
    obstacles: [],
    congestionZones: [
      { x: 6, y: 2 },
      { x: 7, y: 2 },
      { x: 8, y: 2 },
      { x: 6, y: 3 },
      { x: 7, y: 3 },
      { x: 8, y: 3 },
      { x: 6, y: 4 },
      { x: 7, y: 4 },
      { x: 8, y: 4 },
    ],
    availableRails: ['slow', 'fast'],
    maxFastRails: 4,
    relayRequiresSlowApproach: true,
  },
  15: {
    title: 'ステージ15',
    description: '縦トンネルと混雑区画をまとめて攻略しよう',
    targetTime: 10,
    width: 11,
    height: 8,
    start: { x: 0, y: 6 },
    goal: { x: 10, y: 1 },
    relayGroups: [
      {
        orientation: 'vertical',
        cells: [
          { x: 6, y: 2 },
          { x: 6, y: 3 },
          { x: 6, y: 4 },
        ],
      },
    ],
    obstacles: [],
    congestionZones: [
      { x: 2, y: 5 },
      { x: 3, y: 5 },
      { x: 4, y: 5 },
      { x: 2, y: 6 },
      { x: 3, y: 6 },
      { x: 4, y: 6 },
      { x: 2, y: 7 },
      { x: 3, y: 7 },
      { x: 4, y: 7 },
    ],
    availableRails: ['slow', 'fast'],
    maxFastRails: 5,
    relayRequiresSlowApproach: true,
  },
  16: {
    title: 'ステージ16',
    description: '2つの混雑エリアを抜け、折り返してゴールへ向かおう',
    targetTime: 18,
    width: 10,
    height: 8,
    start: { x: 0, y: 1 },
    goal: { x: 1, y: 6 },
    relayGroups: [],
    turnaroundPoints: [{ x: 9, y: 1 }],
    obstacles: [],
    congestionZones: [
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 4, y: 5 },
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 4, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 4, y: 7 },
      { x: 5, y: 7 },
      { x: 6, y: 7 },
    ],
    availableRails: ['slow', 'fast'],
    maxFastRails: 8,
  },
}

const STAGE_ORDER = [
  'tutorial',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
]

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
const TRAIN_ANIMATION_SPEED_MULTIPLIER = 1.5

const getDirectionBetween = (from, to) => {
  return Object.entries(DIRECTION_STEPS).find(
    ([, step]) => from.x + step.x === to.x && from.y + step.y === to.y,
  )?.[0]
}

const getStageResultLabel = (stageResult) => {
  if (Math.abs(stageResult.difference) < 0.0001) return '✓ 時間ぴったり'

  const seconds = Math.abs(stageResult.difference).toFixed(1)
  return `✓ ${seconds}秒${stageResult.difference > 0 ? '遅い' : '早い'}`
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

function SpecialCellAsset({ type, label, orientation = 'horizontal' }) {
  const images = {
    start: redStationBuildingImage,
    goal: stationBuildingImage,
    'tunnel-entrance': tunnelEntranceRailLeftImage,
    'tunnel-entrance-right': tunnelEntranceRailLeftImage,
    'tunnel-middle': tunnelMiddleImage,
  }

  return (
    <span
      className={`special-cell-asset special-cell-asset-${type} special-cell-asset-${orientation}`}
    >
      <img src={images[type]} alt="" aria-hidden="true" />
      {label && <span className="special-cell-badge">{label}</span>}
    </span>
  )
}

function ObstacleAsset({ type }) {
  const isTree = type === 'tree'

  return (
    <span className={`obstacle-asset obstacle-asset-${type}`} aria-hidden="true">
      <img src={isTree ? obstacleTreeImage : obstacleRockImage} alt="" />
    </span>
  )
}

function TurnaroundAsset() {
  return (
    <span className="turnaround-asset" aria-hidden="true">
      <strong>↩</strong>
      <small>折返</small>
    </span>
  )
}

function MovingTrain({ motion, duration, ghost = false }) {
  return (
    <g
      className={`train-image-vehicle ${ghost ? 'ghost-train-vehicle' : ''}`}
      overflow="visible"
    >
      {TRAIN_CARS.map((car) => (
        <image
          key={car.key}
          className={`train-image train-image-${car.key}`}
          href={car.image}
          x={car.offset * motion.trainCarWidth - motion.trainCarWidth / 2}
          y={-motion.trainCarHeight / 2}
          width={motion.trainCarWidth}
          height={motion.trainCarHeight}
          preserveAspectRatio="xMidYMid meet"
        />
      ))}
      <animateMotion
        calcMode="linear"
        dur={`${duration}ms`}
        keyPoints={motion.keyPoints}
        keyTimes={motion.keyTimes}
        path={motion.path}
        rotate="auto"
        fill={ghost ? 'remove' : 'freeze'}
        repeatCount={ghost ? 'indefinite' : undefined}
      />
    </g>
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
  const [ghostMotion, setGhostMotion] = useState(null)
  const [stageResults, setStageResults] = useState({})
  const mapRef = useRef(null)
  const trainRunIdRef = useRef(0)

  const currentStage = selectedStage ? STAGES[selectedStage] : null

  const startStage = (stageNumber) => {
    setSelectedStage(stageNumber)
    setSelectedRailType('slow')
    setPlacedRails([])
    setResult(null)
    setMessage('')
    setTrainRun(null)
    setGhostMotion(null)
    setScreen('game')
  }

  const isSamePosition = (a, b) => a.x === b.x && a.y === b.y

  const getRelayCells = () => {
    if (!currentStage) return []

    return currentStage.relayGroups.flatMap((relayGroup, relayIndex) =>
      relayGroup.cells.map((cell, cellIndex) => {
        const firstCell = relayGroup.cells[0]
        const lastCell = relayGroup.cells[relayGroup.cells.length - 1]
        const orientation =
          relayGroup.orientation ??
          (firstCell.x === lastCell.x ? 'vertical' : 'horizontal')

        return {
          ...cell,
          relayIndex,
          relayNumber: relayIndex + 1,
          cellIndex,
          relayLength: relayGroup.cells.length,
          orientation,
        }
      }),
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
      relayIndex: index,
      relayNumber: index + 1,
      positions: [relayGroup.cells[0], relayGroup.cells[relayGroup.cells.length - 1]],
    }))
  }

  const getObstacleAt = (position) => {
    return currentStage?.obstacles?.find((obstacle) =>
      isSamePosition(position, obstacle),
    )
  }

  const getCongestionAt = (position) => {
    return currentStage?.congestionZones?.find((congestionCell) =>
      isSamePosition(position, congestionCell),
    )
  }

  const getTurnaroundPointAt = (position) => {
    return currentStage?.turnaroundPoints?.find((turnaroundPoint) =>
      isSamePosition(position, turnaroundPoint),
    )
  }

  const isRelayConnectionPosition = (position) => {
    if (!currentStage?.relayRequiresSlowApproach) return false

    return getRelayCells().some((relayCell) => {
      const direction = getDirectionBetween(position, relayCell)
      const allowedDirections =
        relayCell.orientation === 'vertical'
          ? ['up', 'down']
          : ['left', 'right']

      return allowedDirections.includes(direction)
    })
  }

  const isSlowZonePosition = (position) => {
    if (!currentStage?.slowZoneRadius) return false

    return (
      Math.abs(position.x - currentStage.goal.x) +
        Math.abs(position.y - currentStage.goal.y) <=
      currentStage.slowZoneRadius
    )
  }

  const getFastRestrictionMessage = (position) => {
    if (isRelayConnectionPosition(position)) {
      return '中継地点に接続できるのは低速レールだけです。'
    }

    if (isSlowZonePosition(position)) {
      return `ゴールから${currentStage.slowZoneRadius}マス以内は低速エリアです。`
    }

    return ''
  }

  const isSpecialCell = (x, y) => {
    if (!currentStage) return false

    const position = { x, y }

    return (
      isSamePosition(position, currentStage.start) ||
      isSamePosition(position, currentStage.goal) ||
      Boolean(getRelayCellAt(position)) ||
      Boolean(getTurnaroundPointAt(position))
    )
  }

  const getRailAt = (x, y) => {
    return placedRails.find((rail) => rail.x === x && rail.y === y)
  }

  const toggleRail = (x, y) => {
    const position = { x, y }

    if (isSpecialCell(x, y) || getObstacleAt(position) || trainRun) return
    setMessage('')

    const rail = getRailAt(x, y)

    if (rail?.type === selectedRailType) {
      setPlacedRails(placedRails.filter((item) => !(item.x === x && item.y === y)))
      return
    }

    const fastRestrictionMessage = getFastRestrictionMessage(position)

    if (selectedRailType === 'fast' && fastRestrictionMessage) {
      setMessage(fastRestrictionMessage)
      return
    }

    const fastRailCount = placedRails.filter((item) => item.type === 'fast').length

    if (
      selectedRailType === 'fast' &&
      currentStage.maxFastRails &&
      fastRailCount >= currentStage.maxFastRails
    ) {
      setMessage(`高速レールは${currentStage.maxFastRails}本までです。`)
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
      Boolean(getTurnaroundPointAt(position)) ||
      Boolean(getRailAt(position.x, position.y))
    )
  }

  const canTrainMove = (from, to) => {
    if (!canTrainPass(to)) return false

    const direction = getDirectionBetween(from, to)
    const connectedRelayCells = [getRelayCellAt(from), getRelayCellAt(to)].filter(
      Boolean,
    )

    return connectedRelayCells.every((relayCell) => {
      const allowedDirections =
        relayCell.orientation === 'vertical'
          ? ['up', 'down']
          : ['left', 'right']

      return allowedDirections.includes(direction)
    })
  }

  const getTravelTimeAt = (position) => {
    const rail = getRailAt(position.x, position.y)
    const congestionMultiplier = getCongestionAt(position) ? 2 : 1
    return rail
      ? congestionMultiplier / RAIL_TYPES[rail.type].speed
      : 0
  }

  const getRelayMaskAt = (position) => {
    return getRelayCells().reduce((mask, relayCell, index) => {
      return isSamePosition(position, relayCell) ? mask | (1 << index) : mask
    }, 0)
  }

  const getTurnaroundMaskAt = (position) => {
    return (currentStage.turnaroundPoints ?? []).reduce(
      (mask, turnaroundPoint, index) =>
        isSamePosition(position, turnaroundPoint) ? mask | (1 << index) : mask,
      0,
    )
  }

  const findShortestRoute = (requireSpecialPoints = true) => {
    if (!currentStage) return null

    const allRelayMask = (1 << getRelayCells().length) - 1
    const allTurnaroundMask =
      (1 << (currentStage.turnaroundPoints?.length ?? 0)) - 1
    const startRelayMask = getRelayMaskAt(currentStage.start)
    const startTurnaroundMask = getTurnaroundMaskAt(currentStage.start)
    const startKey = `${positionToKey(currentStage.start)}-start-${startRelayMask}-${startTurnaroundMask}`
    const openStates = [
      {
        key: startKey,
        position: currentStage.start,
        previousPosition: null,
        relayMask: startRelayMask,
        turnaroundMask: startTurnaroundMask,
        steps: 0,
        time: 0,
      },
    ]
    const distances = new Map([[startKey, { steps: 0, time: 0 }]])
    const parents = new Map([[startKey, null]])
    const states = new Map([
      [
        startKey,
        {
          position: currentStage.start,
          previousPosition: null,
          relayMask: startRelayMask,
          turnaroundMask: startTurnaroundMask,
        },
      ],
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
        !requireSpecialPoints || current.relayMask === allRelayMask
      const hasRequiredTurnarounds =
        !requireSpecialPoints || current.turnaroundMask === allTurnaroundMask

      if (
        isSamePosition(current.position, currentStage.goal) &&
        hasRequiredRelays &&
        hasRequiredTurnarounds
      ) {
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

      const neighborPositions = getTurnaroundPointAt(current.position)
        ? current.previousPosition
          ? [current.previousPosition]
          : []
        : getNeighborPositions(current.position).filter(
          (neighbor) =>
            !current.previousPosition ||
              !isSamePosition(neighbor, current.previousPosition),
        )

      neighborPositions.forEach((neighbor) => {
        if (!canTrainMove(current.position, neighbor)) return

        const relayMask = current.relayMask | getRelayMaskAt(neighbor)
        const turnaroundMask =
          current.turnaroundMask | getTurnaroundMaskAt(neighbor)
        const key = `${positionToKey(neighbor)}-${positionToKey(current.position)}-${relayMask}-${turnaroundMask}`
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
        states.set(key, {
          position: neighbor,
          previousPosition: current.position,
          relayMask,
          turnaroundMask,
        })
        openStates.push({
          key,
          position: neighbor,
          previousPosition: current.position,
          relayMask,
          turnaroundMask,
          ...nextDistance,
        })
      })
    }

    return null
  }

  const findRouteToPosition = (targetPositions, requiredRelayIndex) => {
    if (!currentStage) return null

    const requiredRelayMask = getRelayCells().reduce(
      (mask, relayCell, index) =>
        relayCell.relayIndex === requiredRelayIndex ? mask | (1 << index) : mask,
      0,
    )
    const startRelayMask = getRelayMaskAt(currentStage.start)
    const startKey = `${positionToKey(currentStage.start)}-${startRelayMask}`
    const openStates = [
      {
        key: startKey,
        position: currentStage.start,
        relayMask: startRelayMask,
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

      const isAtTarget = targetPositions.some((targetPosition) =>
        isSamePosition(current.position, targetPosition),
      )
      const hasTraversedRelay =
        (current.relayMask & requiredRelayMask) === requiredRelayMask

      if (isAtTarget && hasTraversedRelay) {
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
        if (!canTrainMove(current.position, neighbor)) return

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
        states.set(key, neighbor)
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
      const isTurnaround = incomingDirection === outgoingDirection

      if (isTurnaround) {
        commands.push(`L ${current.x} ${current.y}`)
        continue
      }

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

    let currentSegmentTime = null
    const segmentTimes = route.positions.slice(1).map((position, index) => {
      const rail = getRailAt(position.x, position.y)

      if (rail) {
        currentSegmentTime = getTravelTimeAt(position)
      } else if (currentSegmentTime === null) {
        const nextRail = route.positions
          .slice(index + 1)
          .map((nextPosition) => getRailAt(nextPosition.x, nextPosition.y))
          .find(Boolean)

        currentSegmentTime = nextRail
          ? 1 / RAIL_TYPES[nextRail.type].speed
          : 1 / RAIL_TYPES.slow.speed
      }

      return currentSegmentTime
    })
    const totalSegmentTime = segmentTimes.reduce(
      (total, segmentTime) => total + segmentTime,
      0,
    )
    let elapsedSegmentTime = 0
    const keyTimes = [0]

    segmentTimes.forEach((segmentTime) => {
      elapsedSegmentTime += segmentTime
      keyTimes.push(elapsedSegmentTime / totalSegmentTime)
    })
    const keyPoints = routePoints.map((_, index) =>
      index / (routePoints.length - 1),
    )

    return {
      path: commands.join(' '),
      keyPoints: keyPoints.join(';'),
      keyTimes: keyTimes.join(';'),
      width: mapRect.width,
      height: mapRect.height,
      trainCarWidth: routePoints[0].size * 0.62,
      trainCarHeight: routePoints[0].size * 0.5,
    }
  }

  useEffect(() => {
    if (!trainRun || screen !== 'game') return undefined

    const timer = window.setTimeout(() => {
      setResult(trainRun.result)
      setStageResults((previousResults) => {
        const previousResult = previousResults[trainRun.stageId]

        if (
          previousResult &&
          Math.abs(previousResult.difference) <=
            Math.abs(trainRun.result.difference)
        ) {
          return previousResults
        }

        return {
          ...previousResults,
          [trainRun.stageId]: trainRun.result,
        }
      })
      setTrainRun(null)
      setScreen('result')
    }, trainRun.duration + 450)

    return () => window.clearTimeout(timer)
  }, [screen, trainRun])

  const startTrain = () => {
    if (trainRun) return

    const route = findShortestRoute()

    if (!route) {
      const routeWithoutSpecialRequirements = findShortestRoute(false)
      const errorMessage = routeWithoutSpecialRequirements
        ? currentStage.turnaroundPoints?.length > 0
          ? '中継地点と折り返し地点をすべて通るルートにしてください。'
          : 'すべての中継地点を通るようにレールをつなげてください。'
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
    const duration =
      (actualTime * ANIMATION_MS_PER_GAME_SECOND) /
      TRAIN_ANIMATION_SPEED_MULTIPLIER

    setResult(null)
    setMessage('')
    trainRunIdRef.current += 1
    setTrainRun({
      id: trainRunIdRef.current,
      stageId: selectedStage,
      route,
      result: nextResult,
      duration,
      motion,
    })
  }

  const getFallbackConnections = (position) => {
    const connections = Object.entries(DIRECTION_STEPS)
      .filter(([, step]) =>
        canTrainMove(position, {
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
    const obstacle = getObstacleAt(position)
    const routeConnections = getConnectionsFromRoute(position, route?.positions)
    const isOnRoute = routeConnections.length > 0
    const connections = isOnRoute
      ? routeConnections
      : rail
        ? getFallbackConnections(position)
        : []

    if (obstacle) {
      return <ObstacleAsset type={obstacle.type} />
    }

    if (getTurnaroundPointAt(position)) {
      return <TurnaroundAsset />
    }

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
        relayCell.cellIndex === 0
          ? 'tunnel-entrance-right'
          : relayCell.cellIndex === relayCell.relayLength - 1
            ? 'tunnel-entrance'
            : 'tunnel-middle'
      const label = relayCell.cellIndex === 0 ? '中' : null

      return (
        <span className="special-cell-content">
          <SpecialCellAsset
            type={tunnelPart}
            label={label}
            orientation={relayCell.orientation}
          />
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
          route: findRouteToPosition(
            relayTarget.positions,
            relayTarget.relayIndex,
          ),
        }))
        .find((relayRoute) => relayRoute.route) ?? null
      : null
  const visibleRoute = shortestRoute ?? connectedRelayRoute?.route ?? null
  const visibleRouteRailCount =
    visibleRoute?.positions.filter((position) => getRailAt(position.x, position.y))
      .length ?? 0
  const placedFastRailCount = placedRails.filter((rail) => rail.type === 'fast').length
  const remainingFastRails = currentStage?.maxFastRails
    ? Math.max(0, currentStage.maxFastRails - placedFastRailCount)
    : null
  const getRouteSegmentTimes = (route) => {
    if (!route) return []

    const seenPositions = new Set()
    const completedRelayIndexes = new Set()
    const segments = []
    let elapsedTime = 0
    let previousMilestoneTime = 0
    let previousMilestoneLabel = 'S'

    route.positions.forEach((position, routeIndex) => {
      if (routeIndex > 0) elapsedTime += getTravelTimeAt(position)
      seenPositions.add(positionToKey(position))

      currentStage.relayGroups.forEach((relayGroup, relayIndex) => {
        if (completedRelayIndexes.has(relayIndex)) return

        const isComplete = relayGroup.cells.every((cell) =>
          seenPositions.has(positionToKey(cell)),
        )

        if (!isComplete) return

        const milestoneLabel = `中${relayIndex + 1}`
        segments.push({
          label: `${previousMilestoneLabel} → ${milestoneLabel}`,
          time: elapsedTime - previousMilestoneTime,
        })
        completedRelayIndexes.add(relayIndex)
        previousMilestoneTime = elapsedTime
        previousMilestoneLabel = milestoneLabel
      })

      if (
        routeIndex === route.positions.length - 1 &&
        isSamePosition(position, currentStage.goal)
      ) {
        segments.push({
          label: `${previousMilestoneLabel} → G`,
          time: elapsedTime - previousMilestoneTime,
        })
      }
    })

    return segments
  }
  const visibleRouteSegments = getRouteSegmentTimes(visibleRoute)
  const timePanelStatus = shortestRoute
    ? 'connected'
    : connectedRelayRoute
      ? 'partial'
      : 'waiting'
  const visibleRouteSignature =
    visibleRoute?.positions.map(positionToKey).join('|') ?? ''

  const updateGhostMotion = useEffectEvent(() => {
    const route = visibleRoute

    if (screen !== 'game' || trainRun || !route || route.positions.length < 2) {
      setGhostMotion(null)
      return
    }

    const motion = createTrainMotion(route)

    setGhostMotion(
      motion
        ? {
          ...motion,
          duration: Math.max(
            1200,
            (route.time * ANIMATION_MS_PER_GAME_SECOND) /
              TRAIN_ANIMATION_SPEED_MULTIPLIER,
          ),
        }
        : null,
    )
  })

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      updateGhostMotion()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [placedRails, screen, selectedStage, trainRun, visibleRouteSignature])

  const tutorialFirstRail = currentStage?.isTutorial
    ? getRailAt(1, currentStage.start.y)
    : null
  const tutorialStep = !currentStage?.isTutorial
    ? null
    : shortestRoute
      ? 4
      : connectedRelayRoute
        ? 3
        : tutorialFirstRail
          ? 2
          : 1
  const tutorialInstructions = {
    1: {
      title: 'レールを置いてみよう',
      body: '低速レールは選択済みです。スタートの右にある点滅中の空きマスを押してください。',
    },
    2: {
      title: '中継地点までつなごう',
      body: '同じ列の空きマスにもう1本レールを置き、黄色い中継地点までつなげてください。',
    },
    3: {
      title: 'ゴースト電車を確認しよう',
      body: '半透明の電車が接続済みルートを繰り返し走ります。確認できたら、トンネルの右にレールを置いてゴールへつなげましょう。',
    },
    4: {
      title: '準備完了！ 出発しよう',
      body: 'ゴールまでつながりました。予想時間を確認して「出発」を押してください。',
    },
  }

  const isTutorialTargetCell = (x, y) => {
    if (!tutorialStep || y !== currentStage.start.y) return false

    if (tutorialStep === 1) return x === 1
    if (tutorialStep === 2) return x === 2
    if (tutorialStep === 3) return x === 5
    return false
  }

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
            {STAGE_ORDER.map((stageNumber) => {
              const stage = STAGES[stageNumber]
              const stageResult = stageResults[stageNumber]

              return (
                <button
                  key={stageNumber}
                  className={`${stage.isTutorial ? 'tutorial-stage-card' : ''} ${stageResult ? 'completed-stage-card' : ''}`}
                  onClick={() => startStage(stageNumber)}
                >
                  <span>{stage.badge ?? stageNumber}</span>
                  <small>{stage.description}</small>
                  {stageResult && (
                    <em className="stage-result-mark">
                      {getStageResultLabel(stageResult)}
                    </em>
                  )}
                </button>
              )
            })}
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

          <div className="stage-constraints" aria-label="ステージの条件">
            <span>中継地点を全て通ること</span>
            {currentStage.turnaroundPoints?.length > 0 && (
              <span>折り返し地点を通過する</span>
            )}
            <span>目標時間：{currentStage.targetTime}秒</span>
          </div>

          {tutorialStep && (
            <section className="tutorial-guide" aria-live="polite">
              <div className="tutorial-guide-heading">
                <span>操作 {tutorialStep} / 4</span>
                <h3>{tutorialInstructions[tutorialStep].title}</h3>
              </div>
              <p>{tutorialInstructions[tutorialStep].body}</p>
              <div className="tutorial-progress" aria-hidden="true">
                {[1, 2, 3, 4].map((step) => (
                  <span
                    key={step}
                    className={step <= tutorialStep ? 'active' : ''}
                  />
                ))}
              </div>
            </section>
          )}

          <div className="rail-yard">
            <div className="rail-yard-heading">
              <h3>レール選択</h3>
            </div>

            <div className="rail-selector">
              {currentStage.availableRails.map((railType) => (
                <button
                  key={railType}
                  className={`rail-card ${selectedRailType === railType ? 'selected' : ''}`}
                  disabled={Boolean(trainRun)}
                  onClick={() => setSelectedRailType(railType)}
                  aria-pressed={selectedRailType === railType}
                >
                  <strong>
                    {railType === 'fast' && remainingFastRails !== null
                      ? `高速レール：あと${remainingFastRails}本`
                      : RAIL_TYPES[railType].label}
                  </strong>
                </button>
              ))}
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

            <p className="rail-selection-description">
              選択中：{RAIL_TYPES[selectedRailType].description}
            </p>
          </div>

          <div
            ref={mapRef}
            className={`grid-map ${trainRun ? 'train-running' : ''}`}
            style={{
              gridTemplateColumns: `repeat(${currentStage.width}, 1fr)`,
              width: `min(100%, ${(currentStage.width / currentStage.height) * 78}vh)`,
            }}
          >
            {Array.from({ length: currentStage.height }).map((_, y) =>
              Array.from({ length: currentStage.width }).map((__, x) => {
                const rail = getRailAt(x, y)
                const isStart = isSamePosition({ x, y }, currentStage.start)
                const isGoal = isSamePosition({ x, y }, currentStage.goal)
                const relayCell = getRelayCellAt({ x, y })
                const isRelay = Boolean(relayCell)
                const obstacle = getObstacleAt({ x, y })
                const isCongestion = Boolean(getCongestionAt({ x, y }))
                const isTurnaround = Boolean(getTurnaroundPointAt({ x, y }))
                const isLowSpeedRequired =
                  !isStart &&
                  !isRelay &&
                  !obstacle &&
                  !isTurnaround &&
                  (isRelayConnectionPosition({ x, y }) ||
                    isSlowZonePosition({ x, y }))
                const isShortestRoute = visibleRoute?.positions.some((position) =>
                  isSamePosition({ x, y }, position),
                )
                const cellLabel = isStart
                  ? 'スタート'
                  : isGoal
                    ? 'ゴール'
                    : isRelay
                      ? `${relayCell.orientation === 'vertical' ? '縦' : '横'}中継地点 ${relayCell.cellIndex + 1}マス目`
                      : obstacle
                        ? `${obstacle.type === 'tree' ? '木' : '岩'} ${x + 1}列 ${y + 1}行`
                        : isTurnaround
                          ? `折り返し地点 ${x + 1}列 ${y + 1}行`
                      : rail
                        ? `${isCongestion ? '混雑区画 ' : ''}${RAIL_TYPES[rail.type].label} ${x + 1}列 ${y + 1}行`
                        : `${isCongestion ? '混雑区画 ' : ''}空きマス ${x + 1}列 ${y + 1}行`

                return (
                  <button
                    key={`${x}-${y}`}
                    data-cell-key={`${x}-${y}`}
                    aria-label={cellLabel}
                    disabled={Boolean(trainRun) || Boolean(obstacle)}
                    className={`map-cell ${rail ? `rail-${rail.type}` : ''} ${isStart ? 'start-cell' : ''} ${isGoal ? 'goal-cell' : ''} ${isRelay ? 'relay-cell' : ''} ${isTurnaround ? 'turnaround-cell' : ''} ${obstacle ? `obstacle-cell obstacle-cell-${obstacle.type}` : ''} ${isCongestion ? 'congestion-cell' : ''} ${isLowSpeedRequired ? 'low-speed-required-cell' : ''} ${isShortestRoute ? 'shortest-route-cell' : ''} ${isTutorialTargetCell(x, y) ? 'tutorial-target-cell' : ''}`}
                    onClick={() => toggleRail(x, y)}
                  >
                    {renderCell(x, y, visibleRoute)}
                  </button>
                )
              })
            )}

            {ghostMotion && !trainRun && (
              <svg
                key={`ghost-${visibleRouteSignature}`}
                className="train-motion-layer ghost-train-layer"
                viewBox={`0 0 ${ghostMotion.width} ${ghostMotion.height}`}
                preserveAspectRatio="none"
                overflow="visible"
                aria-hidden="true"
              >
                <path className="train-motion-guide" d={ghostMotion.path} />
                <MovingTrain
                  motion={ghostMotion}
                  duration={ghostMotion.duration}
                  ghost
                />
              </svg>
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
                <MovingTrain
                  motion={trainRun.motion}
                  duration={trainRun.duration}
                />
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
            {visibleRouteSegments.length > 0 && (
              <div className="route-segment-times">
                {visibleRouteSegments.map((segment) => (
                  <span key={segment.label}>
                    <small>{segment.label}</small>
                    <b>{segment.time.toFixed(1)}秒</b>
                  </span>
                ))}
              </div>
            )}
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

          <button
            className={`main-button ${tutorialStep === 4 ? 'tutorial-departure-button' : ''}`}
            disabled={Boolean(trainRun)}
            onClick={startTrain}
          >
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
