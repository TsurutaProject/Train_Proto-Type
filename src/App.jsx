import { useEffect, useEffectEvent, useRef, useState } from 'react'
import './App.css'
import {
  getFastRailSavings,
  getFastRailSavingsMessage,
  isWithinTargetTime,
} from './fastRailSavings.js'
import blueTrainLeftImage from './assets/train-game/blue-train-left.png'
import blueTrainRightImage from './assets/train-game/blue-train-right.png'
import curvedRailImage from './assets/train-game/curved-rail.png'
import leverImage from './assets/train-game/lever.png'
import obstacleRockImage from './assets/train-game/obstacle-rock.png'
import obstacleTreeImage from './assets/train-game/obstacle-tree.png'
import redStationBuildingImage from './assets/train-game/red-station-building.png'
import stationBuildingImage from './assets/train-game/station-building.png'
import straightRailImage from './assets/train-game/straight-rail.png'
import tunnelEntranceRailLeftImage from './assets/train-game/tunnel-entrance-rail-left.png'
import tunnelMiddleImage from './assets/train-game/tunnel-middle.png'
import tunnelOnePassImage from './assets/train-game/tunnel-one-pass.png'

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
    targetTime: 6,
    width: 7,
    height: 8,
    start: { x: 0, y: 2 },
    goal: { x: 6, y: 3 },
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
  estimateTutorial: {
    title: '見積もりチュートリアル',
    badge: '見積練習',
    description: 'メモと予想時間を入力して答え合わせしよう',
    isTutorial: true,
    isEstimateTutorial: true,
    targetTime: 6,
    width: 7,
    height: 8,
    start: { x: 0, y: 2 },
    goal: { x: 6, y: 3 },
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
    targetTime: 7,
    width: 8,
    height: 8,
    start: { x: 0, y: 2 },
    goal: { x: 7, y: 3 },
    relayGroups: [],
    availableRails: ['slow'],
  },
  2: {
    title: 'ステージ2',
    description: '速さの違うレールを使ってみよう',
    isFastRailTutorial: true,
    targetTime: 5,
    width: 8,
    height: 8,
    start: { x: 0, y: 2 },
    goal: { x: 7, y: 2 },
    relayGroups: [],
    availableRails: ['slow', 'fast'],
    maxFastRails: 6,
    minimumRequiredFastRails: 2,
    clearCondition: 'within',
    enableFastRailSaving: true,
  },
  3: {
    title: 'ステージ3',
    description: '直進と高速レールを使う遠回りを比べよう',
    targetTime: 6,
    width: 8,
    height: 8,
    start: { x: 0, y: 2 },
    goal: { x: 7, y: 2 },
    relayGroups: [
      {
        cells: [
          { x: 4, y: 2 },
        ],
      },
    ],
    availableRails: ['slow', 'fast'],
    maxFastRails: 4,
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
    maxFastRails: 8,
    minimumRequiredFastRails: 6,
    clearCondition: 'within',
    enableFastRailSaving: true,
  },
  5: {
    title: 'ステージ5',
    description: '岩と木を避け、低速で中継地点へ向かおう',
    targetTime: 8,
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
    targetTime: 7,
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
    maxFastRails: 6,
    minimumRequiredFastRails: 2,
    relayRequiresSlowApproach: true,
    clearCondition: 'within',
    enableFastRailSaving: true,
  },
  7: {
    title: 'ステージ7',
    description: '同じ条件を満たす複数の経路を見つけよう',
    targetTime: 8.5,
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
    minimumRequiredFastRails: 3,
    relayRequiresSlowApproach: true,
    clearCondition: 'within',
  },
  8: {
    title: 'ステージ8',
    description: '2つの中継地点をすべて通過しよう',
    targetTime: 10,
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
    description: '高さの違うゴールと、ゴール前の「のんびり」に挑戦',
    targetTime: 7.5,
    width: 9,
    height: 8,
    start: { x: 0, y: 1 },
    goal: { x: 8, y: 6 },
    relayGroups: [],
    obstacles: [],
    availableRails: ['slow', 'fast'],
    maxFastRails: 10,
    minimumRequiredFastRails: 9,
    slowZoneRadius: 3,
    clearCondition: 'within',
    enableFastRailSaving: true,
  },
  11: {
    title: 'ステージ11',
    description: '横中継を抜けて折り返し、縦中継から別の高さへ進もう',
    isTurnaroundTutorial: true,
    targetTime: 15.5,
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
    turnaroundPoints: [{ x: 9, y: 1 }],
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
    description: '複数中継・高低差・ゴール前の「のんびり」をまとめて攻略しよう',
    targetTime: 12,
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
    minimumRequiredFastRails: 4,
    relayRequiresSlowApproach: true,
    slowZoneRadius: 3,
    clearCondition: 'within',
  },
  13: {
    title: 'ステージ13',
    description: '塞がれた道を避け、縦トンネルを上下に通過しよう',
    targetTime: 13,
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
    targetTime: 10,
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
    maxFastRails: 9,
    relayRequiresSlowApproach: true,
  },
  15: {
    title: 'ステージ15',
    description: '縦トンネルと混雑区画をまとめて攻略しよう',
    targetTime: 13,
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
    minimumRequiredFastRails: 5,
    relayRequiresSlowApproach: true,
    clearCondition: 'within',
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

const STAGE_WORLD_COLUMNS = STAGE_ORDER.length
const STAGE_WORLD_ROWS = 3
const STAGE_WORLD_VISIBLE_COLUMNS = 4
const STAGE_WORLD_CELL_PX = 250
const STAGE_WORLD_ROW_PX = 88
const STAGE_WORLD_GAP_PX = 28
const STAGE_WORLD_PADDING_X_PX = 28
const STAGE_WORLD_PADDING_TOP_PX = 30
const STAGE_WORLD_PADDING_BOTTOM_PX = 22
const STAGE_WORLD_COLUMN_STEP_PX = STAGE_WORLD_CELL_PX + STAGE_WORLD_GAP_PX
const STAGE_WORLD_WINDOW_WIDTH_PX =
  STAGE_WORLD_VISIBLE_COLUMNS * STAGE_WORLD_CELL_PX +
  (STAGE_WORLD_VISIBLE_COLUMNS - 1) * STAGE_WORLD_GAP_PX +
  STAGE_WORLD_PADDING_X_PX * 2
const STAGE_WORLD_MAP_WIDTH_PX =
  STAGE_WORLD_COLUMNS * STAGE_WORLD_CELL_PX +
  (STAGE_WORLD_COLUMNS - 1) * STAGE_WORLD_GAP_PX +
  STAGE_WORLD_PADDING_X_PX * 2
const STAGE_WORLD_MAP_HEIGHT_PX =
  STAGE_WORLD_ROWS * STAGE_WORLD_ROW_PX +
  (STAGE_WORLD_ROWS - 1) * STAGE_WORLD_GAP_PX +
  STAGE_WORLD_PADDING_TOP_PX +
  STAGE_WORLD_PADDING_BOTTOM_PX
const STAGE_WORLD_STATUS_ROWS = {
  cleared: 0,
  improve: 1,
  unplayed: 2,
}
const STAGE_WORLD_NODES = [
  { stageNumber: 'tutorial', x: 0, y: 1 },
  { stageNumber: '1', x: 1, y: 1 },
  { stageNumber: '2', x: 2, y: 1 },
  { stageNumber: '3', x: 3, y: 0 },
  { stageNumber: '4', x: 4, y: 0 },
  { stageNumber: '5', x: 5, y: 1 },
  { stageNumber: '6', x: 6, y: 1 },
  { stageNumber: '7', x: 7, y: 2 },
  { stageNumber: '8', x: 8, y: 2 },
  { stageNumber: '9', x: 9, y: 1 },
  { stageNumber: '10', x: 10, y: 1 },
  { stageNumber: '11', x: 11, y: 0 },
  { stageNumber: '12', x: 12, y: 0 },
  { stageNumber: '13', x: 13, y: 1 },
  { stageNumber: '14', x: 14, y: 1 },
  { stageNumber: '15', x: 15, y: 2 },
  { stageNumber: '16', x: 16, y: 2 },
]

const getStageWorldNodeLeftPx = (node) =>
  STAGE_WORLD_PADDING_X_PX + node.x * STAGE_WORLD_COLUMN_STEP_PX

const getStageWorldNodeTopPx = (node) =>
  STAGE_WORLD_PADDING_TOP_PX +
  node.y * (STAGE_WORLD_ROW_PX + STAGE_WORLD_GAP_PX)

const getStageWorldNodePoint = (node) => ({
  x: getStageWorldNodeLeftPx(node) + STAGE_WORLD_CELL_PX / 2,
  y: getStageWorldNodeTopPx(node) + STAGE_WORLD_ROW_PX / 2,
})

const getStageWorldTrackPath = (nodes) =>
  nodes
    .map(getStageWorldNodePoint)
    .map(
      (point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`,
    )
    .join(' ')
const STAGE_WORLD_WHEEL_STEP_DELTA = 58
const STAGE_WORLD_WHEEL_REPEAT_MS = 180
const STAGE_WORLD_WHEEL_FAST_REPEAT_DELTA = 160

const getStageWorldIndexForStageId = (stageId) => {
  const stageNumber = stageId === 'estimateTutorial' ? 'tutorial' : stageId
  return STAGE_WORLD_NODES.findIndex((node) => node.stageNumber === stageNumber)
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

const ESTIMATE_MEMO_FIELDS = [
  { key: 'slowRails', label: '低速レール' },
  { key: 'fastRails', label: '高速レール' },
  { key: 'congestionPasses', label: '通過する混雑マス' },
  { key: 'repeatedCells', label: '2回通るマス' },
]

const EMPTY_ESTIMATE_MEMO = {
  slowRails: '',
  fastRails: '',
  congestionPasses: '',
  repeatedCells: '',
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
const STAGE_RESULTS_STORAGE_KEY = 'train-game-stage-results-v2'
const EXACT_TIME_TOLERANCE = 0.0001

const getDirectionBetween = (from, to) => {
  return Object.entries(DIRECTION_STEPS).find(
    ([, step]) => from.x + step.x === to.x && from.y + step.y === to.y,
  )?.[0]
}

const getClearCondition = () => 'within'

const isExactTimeResult = (stageResult) =>
  Boolean(
    stageResult &&
      Number.isFinite(stageResult.difference) &&
      Math.abs(stageResult.difference) <= EXACT_TIME_TOLERANCE,
  )

const isStageCleared = (stage, stageResult) => {
  if (!stageResult) return false

  return getClearCondition(stage) === 'within'
    ? isWithinTargetTime(
      stageResult.actualTime,
      stage.targetTime,
      true,
      EXACT_TIME_TOLERANCE,
    )
    : isExactTimeResult(stageResult)
}

const getEarlyArrivalSeconds = (stageResult) => {
  if (!stageResult) return 0

  if (Number.isFinite(stageResult.earlyArrivalSeconds)) {
    return Math.max(0, stageResult.earlyArrivalSeconds)
  }

  if (
    Number.isFinite(stageResult.targetTime) &&
    Number.isFinite(stageResult.actualTime)
  ) {
    return Math.max(0, stageResult.targetTime - stageResult.actualTime)
  }

  return Number.isFinite(stageResult.difference)
    ? Math.max(0, -stageResult.difference)
    : 0
}

const getStageFastRailBonusLabel = (stageResult) => {
  if (stageResult?.fastRailSavingsRating === 'minimum') return '☆ 最小本数'
  if (stageResult?.fastRailSavingsRating === 'saved') return '◎ レール節約'
  return ''
}

const getStageEvaluationTags = (stage, stageResult) => {
  const tags = [
    {
      key: 'target',
      tone: 'target',
      text: `目標 ${stage.targetTime}秒以内`,
    },
  ]

  if (!stageResult) {
    return [
      ...tags,
      {
        key: 'unplayed',
        tone: 'unplayed',
        text: '未プレイ',
      },
    ]
  }

  if (!isStageCleared(stage, stageResult)) {
    return [
      ...tags,
      {
        key: 'late',
        tone: 'late',
        text: `${Math.max(0, stageResult.difference).toFixed(1)}秒遅い`,
      },
    ]
  }

  tags.push({
    key: 'within',
    tone: 'within',
    text: '時間以内',
  })

  if (isExactTimeResult(stageResult)) {
    tags.push({
      key: 'perfect',
      tone: 'perfect',
      text: 'ぴったり',
    })
  }

  const fastRailBonusLabel = getStageFastRailBonusLabel(stageResult)

  if (fastRailBonusLabel) {
    tags.push({
      key: 'fast-rail-bonus',
      tone: 'bonus',
      text: fastRailBonusLabel,
    })
  }

  return tags
}

const getStageResultKey = (stageId, isEstimateMode) => {
  const normalizedStageId = stageId === 'estimateTutorial' ? 'tutorial' : stageId
  return `${isEstimateMode ? 'estimate' : 'normal'}:${normalizedStageId}`
}

const getResultTone = (stageResult) => {
  if (!stageResult?.cleared) return 'miss'
  return isExactTimeResult(stageResult) ? 'perfect' : 'early'
}

const getResultStatusLabel = (stageResult) => {
  if (!stageResult?.cleared) return '条件未達成'
  return isExactTimeResult(stageResult) ? '時間ぴったり' : '時間以内'
}

const normalizeStageResult = (stageResult) => ({
  ...stageResult,
  earlyArrivalSeconds: getEarlyArrivalSeconds(stageResult),
})

const loadStageResults = () => {
  try {
    const savedResults =
      JSON.parse(window.localStorage.getItem(STAGE_RESULTS_STORAGE_KEY)) ?? {}

    return Object.fromEntries(
      Object.entries(savedResults).map(([key, stageResult]) => [
        key,
        normalizeStageResult(stageResult),
      ]),
    )
  } catch {
    return {}
  }
}

const getBoundedInputValue = (value, wholeNumber = false) => {
  if (value === '') return ''

  const number = Number(value)
  if (!Number.isFinite(number)) return ''

  const boundedNumber = Math.min(99, Math.max(0, number))
  return String(wholeNumber ? Math.floor(boundedNumber) : boundedNumber)
}

const getRelayGroupOrientation = (relayGroup) => {
  if (relayGroup.orientation) return relayGroup.orientation
  if (relayGroup.cells.length === 1) return 'single'

  const firstCell = relayGroup.cells[0]
  const lastCell = relayGroup.cells[relayGroup.cells.length - 1]

  return firstCell.x === lastCell.x ? 'vertical' : 'horizontal'
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
    'tunnel-single': tunnelOnePassImage,
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

function TurnaroundAsset({ flipped = false }) {
  return (
    <span
      className={`turnaround-asset ${flipped ? 'turnaround-asset-flipped' : ''}`}
      aria-hidden="true"
    >
      <img src={leverImage} alt="" />
    </span>
  )
}

function StageListIcon() {
  return (
    <span className="stage-list-icon" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <span key={index} />
      ))}
    </span>
  )
}

const RUBY_DEFINITIONS = {
  中継地点: 'ちゅうけいちてん',
  目標時間: 'もくひょうじかん',
  予想時間: 'よそうじかん',
  混雑区画: 'こんざつくかく',
  最短経路: 'さいたんけいろ',
  追加評価: 'ついかひょうか',
  最小本数: 'さいしょうほんすう',
  時間以内: 'じかんいない',
  未プレイ: 'みぷれい',
  接続済: 'せつぞくず',
  半透明: 'はんとうめい',
  準備完了: 'じゅんびかんりょう',
  計算結果: 'けいさんけっか',
  選択中: 'せんたくちゅう',
  現在地: 'げんざいち',
  最終予想時間: 'さいしゅうよそうじかん',
  区間時間: 'くかんじかん',
  再生: 'さいせい',
  一度: 'いちど',
  見積: 'みつ',
  通常: 'つうじょう',
  条件: 'じょうけん',
  一覧: 'いちらん',
  地点: 'ちてん',
  必要: 'ひつよう',
  節約: 'せつやく',
  本数: 'ほんすう',
  到着: 'とうちゃく',
  出発: 'しゅっぱつ',
  実際: 'じっさい',
  結果: 'けっか',
  選択: 'せんたく',
  操作: 'そうさ',
  確認: 'かくにん',
  予想: 'よそう',
  目標: 'もくひょう',
  時間: 'じかん',
  以内: 'いない',
  通過: 'つうか',
  配置: 'はいち',
  経路: 'けいろ',
  電車: 'でんしゃ',
  走行中: 'そうこうちゅう',
  低速: 'ていそく',
  高速: 'こうそく',
  迂回: 'うかい',
  障害物: 'しょうがいぶつ',
  複数: 'ふくすう',
  近道: 'ちかみち',
  遠回: 'とおまわ',
  直進: 'ちょくしん',
  挑戦: 'ちょうせん',
  攻略: 'こうりゃく',
  入力: 'にゅうりょく',
  実績: 'じっせき',
  説明: 'せつめい',
  表示: 'ひょうじ',
  場所: 'ばしょ',
  役割: 'やくわり',
  移動: 'いどう',
  設置: 'せっち',
  方向: 'ほうこう',
  途中: 'とちゅう',
  黄色: 'きいろ',
  連続: 'れんぞく',
  盤面: 'ばんめん',
  自分: 'じぶん',
  差: 'さ',
  内訳: 'うちわけ',
  縦: 'たて',
  横: 'よこ',
  横長: 'よこなが',
  岩: 'いわ',
  木: 'き',
  全: 'すべ',
  同: 'おな',
  列: 'れつ',
  右: 'みぎ',
  左: 'ひだり',
  左右: 'さゆう',
  上下: 'じょうげ',
  秒: 'びょう',
  遅: 'おそ',
  本: 'ほん',
  枠: 'わく',
  折: 'お',
  返: 'かえ',
  閉: 'と',
  動: 'うご',
  答: 'こた',
  合: 'あ',
  強: 'きょう',
  調: 'ちょう',
  比: 'くら',
  覚: 'おぼ',
  守: 'まも',
  見: 'み',
  作: 'つく',
  塞: 'ふさ',
  使: 'つか',
  方: 'かた',
  切: 'き',
  替: 'か',
  戻: 'もど',
  避: 'さ',
  向: 'む',
  進: 'すす',
  選: 'えら',
  遊: 'あそ',
  開: 'ひら',
  片: 'かた',
  付: 'づ',
  空: 'あ',
  残: 'のこ',
}

const KANJI_RUBY_DEFINITIONS = {
  一: 'いち',
  上: 'じょう',
  下: 'げ',
  中: 'ちゅう',
  了: 'りょう',
  予: 'よ',
  以: 'い',
  件: 'けん',
  位: 'い',
  低: 'てい',
  価: 'か',
  倍: 'ばい',
  備: 'び',
  先: 'さき',
  入: 'にゅう',
  内: 'ない',
  再: 'さい',
  出: 'しゅつ',
  分: 'ぶん',
  別: 'べつ',
  到: 'とう',
  前: 'まえ',
  力: 'りょく',
  加: 'か',
  区: 'く',
  半: 'はん',
  回: 'かい',
  地: 'ち',
  場: 'ば',
  変: 'か',
  外: 'がい',
  完: 'かん',
  実: 'じつ',
  害: 'がい',
  常: 'じょう',
  度: 'ど',
  後: 'あと',
  必: 'かなら',
  少: 'すこ',
  想: 'そう',
  戦: 'せん',
  所: 'しょ',
  扱: 'あつか',
  抜: 'ぬ',
  択: 'たく',
  押: 'お',
  挑: 'ちょう',
  接: 'せつ',
  操: 'そう',
  攻: 'こう',
  数: 'すう',
  早: 'はや',
  明: 'めい',
  時: 'じ',
  曲: 'ま',
  最: 'さい',
  未: 'み',
  条: 'じょう',
  果: 'か',
  標: 'ひょう',
  次: 'つぎ',
  混: 'こん',
  済: 'ず',
  満: 'み',
  準: 'じゅん',
  点: 'てん',
  物: 'ぶつ',
  生: 'せい',
  画: 'が',
  略: 'りゃく',
  発: 'はつ',
  盤: 'ばん',
  目: 'もく',
  直: 'ちょく',
  着: 'ちゃく',
  短: 'たん',
  確: 'かく',
  示: 'じ',
  積: 'つ',
  算: 'さん',
  節: 'せつ',
  約: 'やく',
  終: 'しゅう',
  経: 'けい',
  結: 'けつ',
  継: 'けい',
  続: 'つづ',
  練: 'れん',
  績: 'せき',
  繰: 'く',
  置: 'お',
  習: 'しゅう',
  自: 'じ',
  色: 'いろ',
  行: 'ぎょう',
  表: 'ひょう',
  複: 'ふく',
  要: 'よう',
  計: 'けい',
  訳: 'わけ',
  評: 'ひょう',
  試: 'ため',
  認: 'にん',
  説: 'せつ',
  読: 'よ',
  走: 'そう',
  路: 'ろ',
  車: 'しゃ',
  較: 'かく',
  込: 'こ',
  迂: 'う',
  近: 'ちか',
  追: 'つい',
  透: 'とう',
  途: 'と',
  通: 'つう',
  速: 'そく',
  連: 'れん',
  過: 'か',
  道: 'みち',
  違: 'ちが',
  遠: 'とお',
  長: 'なが',
  配: 'はい',
  間: 'かん',
  際: 'さい',
  障: 'しょう',
  雑: 'ざつ',
  電: 'でん',
  面: 'めん',
  項: 'こう',
  高: 'こう',
  黄: 'き',
}

const RUBY_TOKENS = Object.keys(RUBY_DEFINITIONS).sort(
  (a, b) => b.length - a.length,
)

function RubyText({ balancePlainText = false, children, text }) {
  const value = text ?? children

  if (typeof value !== 'string') return value

  const parts = []
  let index = 0

  while (index < value.length) {
    const token = RUBY_TOKENS.find((candidate) =>
      value.startsWith(candidate, index),
    )

    if (token) {
      parts.push(
        <ruby key={`${token}-${index}`}>
          {token}
          <rt>{RUBY_DEFINITIONS[token]}</rt>
        </ruby>,
      )
      index += token.length
    } else {
      const character = value[index]
      const characterRuby =
        RUBY_DEFINITIONS[character] ?? KANJI_RUBY_DEFINITIONS[character]

      if (characterRuby && /\p{Script=Han}/u.test(character)) {
        parts.push(
          <ruby key={`${character}-${index}`}>
            {character}
            <rt>{characterRuby}</rt>
          </ruby>,
        )
      } else {
        parts.push(
          balancePlainText && !/\s/u.test(character) ? (
            <ruby className="ruby-placeholder" key={`plain-${character}-${index}`}>
              {character}
              <rt aria-hidden="true">{'\u00a0'}</rt>
            </ruby>
          ) : (
            character
          ),
        )
      }
      index += 1
    }
  }

  return <>{parts}</>
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
  const [routePhase, setRoutePhase] = useState(0)
  const [ghostMotion, setGhostMotion] = useState(null)
  const [stageResults, setStageResults] = useState(loadStageResults)
  const [estimateMode, setEstimateMode] = useState(false)
  const [stageWorldIndex, setStageWorldIndex] = useState(0)
  const [stageWorldFacing, setStageWorldFacing] = useState('right')
  const [estimateRevealed, setEstimateRevealed] = useState(false)
  const [userEstimatedTime, setUserEstimatedTime] = useState('')
  const [estimateMemo, setEstimateMemo] = useState(EMPTY_ESTIMATE_MEMO)
  const [tutorialSkipped, setTutorialSkipped] = useState(false)
  const [turnaroundDemoOpen, setTurnaroundDemoOpen] = useState(false)
  const [turnaroundDemoPlaying, setTurnaroundDemoPlaying] = useState(false)
  const mapRef = useRef(null)
  const stageWorldMapWindowRef = useRef(null)
  const stageWorldWheelRef = useRef({ delta: 0, lastMovedAt: 0 })
  const trainMotionLayerRef = useRef(null)
  const trainRunIdRef = useRef(0)
  const slowRailDragRef = useRef({
    active: false,
    pointerId: null,
    lastCellKey: null,
    moved: false,
    startedWithSlowRail: false,
  })

  const currentStage = selectedStage ? STAGES[selectedStage] : null

  useEffect(() => {
    window.localStorage.setItem(
      STAGE_RESULTS_STORAGE_KEY,
      JSON.stringify(stageResults),
    )
  }, [stageResults])

  const startStage = (stageNumber) => {
    const worldIndex = getStageWorldIndexForStageId(stageNumber)

    if (worldIndex >= 0) setStageWorldIndex(worldIndex)

    setSelectedStage(stageNumber)
    setSelectedRailType('slow')
    setPlacedRails([])
    setResult(null)
    setMessage('')
    setTrainRun(null)
    setRoutePhase(0)
    setGhostMotion(null)
    setEstimateRevealed(false)
    setUserEstimatedTime('')
    setEstimateMemo(EMPTY_ESTIMATE_MEMO)
    setTutorialSkipped(false)
    setTurnaroundDemoOpen(false)
    setTurnaroundDemoPlaying(false)
    setScreen('game')
  }

  const openStageSelect = () => {
    const worldIndex = getStageWorldIndexForStageId(selectedStage)

    if (worldIndex >= 0) setStageWorldIndex(worldIndex)

    setScreen('stageSelect')
  }

  const isSamePosition = (a, b) => a.x === b.x && a.y === b.y

  const getRelayCells = () => {
    if (!currentStage) return []

    return currentStage.relayGroups.flatMap((relayGroup, relayIndex) =>
      relayGroup.cells.map((cell, cellIndex) => {
        const orientation = getRelayGroupOrientation(relayGroup)

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
        relayCell.orientation === 'single'
          ? ['up', 'down', 'left', 'right']
          : relayCell.orientation === 'vertical'
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

  const placeSlowRail = (x, y) => {
    const position = { x, y }

    if (isSpecialCell(x, y) || getObstacleAt(position) || trainRun) return

    setMessage('')
    setPlacedRails((previousRails) => {
      const currentRail = previousRails.find(
        (rail) => rail.x === x && rail.y === y,
      )

      if (currentRail?.type === 'slow') return previousRails

      return [
        ...previousRails.filter((rail) => rail.x !== x || rail.y !== y),
        { x, y, type: 'slow' },
      ]
    })
  }

  const removeRail = (x, y) => {
    setPlacedRails((previousRails) =>
      previousRails.filter((rail) => rail.x !== x || rail.y !== y),
    )
  }

  const getCellFromPointerEvent = (event) => {
    const element = document.elementFromPoint(event.clientX, event.clientY)
    const cell = element?.closest('[data-cell-key]')

    if (!cell || !mapRef.current?.contains(cell)) return null

    const [x, y] = cell.dataset.cellKey.split('-').map(Number)
    return { cell, x, y, key: cell.dataset.cellKey }
  }

  const startSlowRailDrag = (event) => {
    if (
      selectedRailType !== 'slow' ||
      trainRun ||
      (event.pointerType === 'mouse' && event.button !== 0)
    ) {
      return
    }

    const target = getCellFromPointerEvent(event)
    if (!target || target.cell.disabled || isSpecialCell(target.x, target.y)) return

    const startedWithSlowRail = getRailAt(target.x, target.y)?.type === 'slow'
    slowRailDragRef.current = {
      active: true,
      pointerId: event.pointerId,
      lastCellKey: target.key,
      moved: false,
      startedWithSlowRail,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    placeSlowRail(target.x, target.y)
  }

  const continueSlowRailDrag = (event) => {
    const drag = slowRailDragRef.current
    if (!drag.active || drag.pointerId !== event.pointerId) return

    const target = getCellFromPointerEvent(event)
    if (!target || target.key === drag.lastCellKey) return

    drag.lastCellKey = target.key
    drag.moved = true
    placeSlowRail(target.x, target.y)
  }

  const finishSlowRailDrag = (event) => {
    const drag = slowRailDragRef.current
    if (!drag.active || drag.pointerId !== event.pointerId) return

    if (!drag.moved && drag.startedWithSlowRail && drag.lastCellKey) {
      const [x, y] = drag.lastCellKey.split('-').map(Number)
      removeRail(x, y)
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    slowRailDragRef.current = {
      active: false,
      pointerId: null,
      lastCellKey: null,
      moved: false,
      startedWithSlowRail: false,
    }
  }

  const cancelSlowRailDrag = (event) => {
    const drag = slowRailDragRef.current
    if (!drag.active || drag.pointerId !== event.pointerId) return

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    slowRailDragRef.current = {
      active: false,
      pointerId: null,
      lastCellKey: null,
      moved: false,
      startedWithSlowRail: false,
    }
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

  const getConnectionVariantsFromRoute = (position, routePositions) => {
    if (!routePositions) return []

    const variants = routePositions.flatMap((routePosition, routeIndex) => {
      if (!isSamePosition(routePosition, position)) return []

      const connections = [
        ...new Set(
          [routePositions[routeIndex - 1], routePositions[routeIndex + 1]]
            .filter(Boolean)
            .map((neighbor) => getDirectionBetween(position, neighbor))
            .filter(Boolean),
        ),
      ]
      const phase = routePositions
        .slice(0, routeIndex)
        .filter((routePositionBefore) =>
          getTurnaroundPointAt(routePositionBefore),
        ).length

      return connections.length > 0 ? [{ phase, connections }] : []
    })

    return variants.filter(
      (variant, index) =>
        variants.findIndex(
          (candidate) =>
            candidate.phase === variant.phase &&
            candidate.connections.join('-') === variant.connections.join('-'),
        ) === index,
    )
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
        relayCell.orientation === 'single'
          ? ['up', 'down', 'left', 'right']
          : relayCell.orientation === 'vertical'
          ? ['up', 'down']
          : ['left', 'right']

      return allowedDirections.includes(direction)
    })
  }

  const getRailTravelDetails = (position) => {
    const rail = getRailAt(position.x, position.y)
    if (!rail) return null

    const congestionMultiplier = getCongestionAt(position) ? 2 : 1
    const effectiveRailType =
      rail.type === 'fast' &&
      (isSlowZonePosition(position) || isRelayConnectionPosition(position))
        ? 'slow'
        : rail.type
    const baseTime = 1 / RAIL_TYPES[effectiveRailType].speed

    return {
      rail,
      baseTime,
      congestionTime: baseTime * (congestionMultiplier - 1),
      totalTime: baseTime * congestionMultiplier,
    }
  }

  const getTravelTimeAt = (position) => {
    if (getRelayCellAt(position)) return 1 / RAIL_TYPES.slow.speed

    return getRailTravelDetails(position)?.totalTime ?? 0
  }

  const getRouteMemoBreakdown = (route) => {
    const breakdown = {
      slowRails: { count: 0, time: 0 },
      fastRails: { count: 0, time: 0 },
      congestionPasses: { count: 0, time: 0 },
      repeatedCells: { count: 0, time: 0 },
    }
    const visitCounts = new Map()

    route.positions.slice(1).forEach((position) => {
      const details = getRailTravelDetails(position)
      if (!details) return

      const key = positionToKey(position)
      const previousVisits = visitCounts.get(key) ?? 0

      if (previousVisits === 0) {
        const railKey = details.rail.type === 'fast' ? 'fastRails' : 'slowRails'
        breakdown[railKey].count += 1
        breakdown[railKey].time += details.baseTime
      } else {
        if (previousVisits === 1) breakdown.repeatedCells.count += 1
        breakdown.repeatedCells.time += details.baseTime
      }

      if (details.congestionTime > 0) {
        breakdown.congestionPasses.count += 1
        breakdown.congestionPasses.time += details.congestionTime
      }

      visitCounts.set(key, previousVisits + 1)
    })

    return breakdown
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
        relayCell.relayIndex <= requiredRelayIndex ? mask | (1 << index) : mask,
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
      keyTimeValues: keyTimes,
      width: mapRect.width,
      height: mapRect.height,
      trainCarWidth: routePoints[0].size * 0.62,
      trainCarHeight: routePoints[0].size * 0.5,
    }
  }

  useEffect(() => {
    if (!trainRun || screen !== 'game') return undefined

    const elapsedDuration = trainRun.elapsedDuration ?? 0
    const playbackRate = trainRun.playbackRate ?? 1
    const remainingDuration = Math.max(
      0,
      trainRun.duration - elapsedDuration,
    )

    const timer = window.setTimeout(() => {
      setResult(trainRun.result)
      setStageResults((previousResults) => ({
        ...previousResults,
        [trainRun.resultKey]: trainRun.result,
      }))
      setTrainRun(null)
      setScreen('result')
    }, remainingDuration / playbackRate + 450)

    return () => window.clearTimeout(timer)
  }, [screen, trainRun])

  useEffect(() => {
    if (!trainRun || screen !== 'game') return undefined

    const elapsedDuration = trainRun.elapsedDuration ?? 0
    const playbackRate = trainRun.playbackRate ?? 1
    let nextPhase = 0
    const timers = trainRun.route.positions.flatMap((position, routeIndex) => {
      const isTurnaround = currentStage.turnaroundPoints?.some(
        (turnaroundPoint) =>
          position.x === turnaroundPoint.x && position.y === turnaroundPoint.y,
      )
      if (!isTurnaround) return []

      nextPhase += 1
      const phase = nextPhase
      const phaseTime =
        trainRun.duration * (trainRun.motion.keyTimeValues[routeIndex] ?? 0)
      const delay = Math.max(0, phaseTime - elapsedDuration) / playbackRate

      return [
        window.setTimeout(() => {
          setRoutePhase(phase)
        }, delay),
      ]
    })

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [currentStage, screen, trainRun])

  useEffect(() => {
    if (
      !trainRun ||
      screen !== 'game' ||
      trainRun.playbackRate !== 2 ||
      !trainMotionLayerRef.current
    ) {
      return undefined
    }

    const motionLayer = trainMotionLayerRef.current
    let animationFrame
    let previousTimestamp = window.performance.now()

    const advanceAnimation = (timestamp) => {
      const elapsedSeconds = (timestamp - previousTimestamp) / 1000
      previousTimestamp = timestamp

      if (typeof motionLayer.getCurrentTime === 'function') {
        motionLayer.setCurrentTime(
          motionLayer.getCurrentTime() + elapsedSeconds,
        )
      }

      animationFrame = window.requestAnimationFrame(advanceAnimation)
    }

    animationFrame = window.requestAnimationFrame(advanceAnimation)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [screen, trainRun])

  const toggleTrainSpeed = () => {
    setTrainRun((currentRun) => {
      if (!currentRun) return currentRun

      const now = window.performance.now()
      const elapsedSinceSpeedChange = now - currentRun.startedAt
      const elapsedDuration = Math.min(
        currentRun.duration,
        (currentRun.elapsedDuration ?? 0) +
          elapsedSinceSpeedChange * (currentRun.playbackRate ?? 1),
      )

      return {
        ...currentRun,
        elapsedDuration,
        playbackRate: currentRun.playbackRate === 2 ? 1 : 2,
        startedAt: now,
      }
    })
  }

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

    const parsedUserEstimatedTime = Number(userEstimatedTime)
    if (
      estimateMode &&
      (userEstimatedTime.trim() === '' ||
        !Number.isFinite(parsedUserEstimatedTime) ||
        parsedUserEstimatedTime < 0 ||
        parsedUserEstimatedTime > 99)
    ) {
      setMessage('出発前に、自分の予想時間を入力してください。')
      return
    }

    const actualTime = route.time
    const difference = actualTime - currentStage.targetTime
    const clearCondition = getClearCondition(currentStage)
    const cleared = clearCondition === 'within'
      ? isWithinTargetTime(
        actualTime,
        currentStage.targetTime,
        true,
        EXACT_TIME_TOLERANCE,
      )
      : Math.abs(difference) < EXACT_TIME_TOLERANCE
    const fastRailSavings = getFastRailSavings({
      maxHighSpeedRails: currentStage.maxFastRails,
      minimumRequiredHighSpeedRails: currentStage.minimumRequiredFastRails,
      placedRails,
      cleared,
      savingsEligible: clearCondition === 'within',
    })

    const nextResult = {
      targetTime: currentStage.targetTime,
      actualTime,
      difference,
      earlyArrivalSeconds: Math.max(0, currentStage.targetTime - actualTime),
      clearCondition,
      cleared,
      maxFastRails: currentStage.maxFastRails ?? null,
      minimumRequiredFastRails: fastRailSavings.minimumRequiredHighSpeedRails,
      placedFastRails: fastRailSavings.placedHighSpeedRails,
      remainingFastRails: fastRailSavings.savedHighSpeedRails,
      fastRailSavingsRating: fastRailSavings.savingsRating,
      fastRailSavingsMark: fastRailSavings.savingsMark,
      fastRailSavingsAwarded: fastRailSavings.savingsAwarded,
      fastRailSavingsEligible: clearCondition === 'within',
      estimate: estimateMode
        ? {
          userTime: parsedUserEstimatedTime,
          memo: Object.fromEntries(
            Object.entries(estimateMemo).map(([key, value]) => [
              key,
              value.trim() === '' ? 0 : Number(value),
            ]),
          ),
          breakdown: getRouteMemoBreakdown(route),
          segments: getRouteSegmentTimes(route),
        }
        : null,
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
    setRoutePhase(0)
    setEstimateRevealed(true)
    trainRunIdRef.current += 1
    setTrainRun({
      id: trainRunIdRef.current,
      stageId: selectedStage,
      resultKey: getStageResultKey(selectedStage, estimateMode),
      route,
      result: nextResult,
      duration,
      motion,
      elapsedDuration: 0,
      playbackRate: 1,
      startedAt: window.performance.now(),
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
    const routeConnectionVariants = getConnectionVariantsFromRoute(
      position,
      route?.positions,
    )
    const activeConnectionVariant =
      routeConnectionVariants.find((variant) => variant.phase === routePhase) ??
      routeConnectionVariants.at(-1)
    const routeConnections = activeConnectionVariant?.connections ?? []
    const isOnRoute = routeConnectionVariants.length > 0
    const connections = isOnRoute
      ? routeConnections
      : rail
        ? getFallbackConnections(position)
        : []
    const renderRouteRail = (type, showSpeed = true) => {
      const connectionVariants =
        !trainRun && routeConnectionVariants.length > 1
          ? routeConnectionVariants.filter(
            (variant, index, variants) =>
              variants.findIndex(
                (candidate) =>
                  candidate.connections.join('-') ===
                  variant.connections.join('-'),
              ) === index,
          )
          : [{ phase: routePhase, connections }]

      if (connectionVariants.length === 1) {
        return (
          <RailPiece
            type={type}
            compact
            connections={connectionVariants[0].connections}
            showSpeed={showSpeed}
          />
        )
      }

      return (
        <span className="rail-switch-stack" aria-hidden="true">
          {connectionVariants.map((variant, index) => (
            <RailPiece
              key={`${variant.phase}-${variant.connections.join('-')}`}
              type={type}
              compact
              connections={variant.connections}
              showSpeed={showSpeed && index === 0}
            />
          ))}
        </span>
      )
    }

    if (obstacle) {
      return <ObstacleAsset type={obstacle.type} />
    }

    if (getTurnaroundPointAt(position)) {
      const turnaroundPassOrder = trainRun
        ? trainRun.route.positions
          .filter((routePosition) => getTurnaroundPointAt(routePosition))
          .findIndex((routePosition) =>
            isSamePosition(routePosition, position),
          ) + 1
        : 0
      const hasPassedTurnaround =
        turnaroundPassOrder > 0 && routePhase >= turnaroundPassOrder

      return (
        <span className="special-cell-content">
          {isOnRoute && renderRouteRail('station', false)}
          <TurnaroundAsset flipped={hasPassedTurnaround} />
        </span>
      )
    }

    if (currentStage && isSamePosition(position, currentStage.start)) {
      return (
        <span className="special-cell-content">
          {isOnRoute && (
            renderRouteRail('station', false)
          )}
          <SpecialCellAsset type="start" label="S" />
        </span>
      )
    }

    if (currentStage && isSamePosition(position, currentStage.goal)) {
      return (
        <span className="special-cell-content">
          {isOnRoute && (
            renderRouteRail('station', false)
          )}
          <SpecialCellAsset type="goal" label="G" />
        </span>
      )
    }

    const relayCell = currentStage ? getRelayCellAt(position) : null

    if (relayCell) {
      const tunnelPart =
        relayCell.relayLength === 1
          ? 'tunnel-single'
          : relayCell.cellIndex === 0
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
      return renderRouteRail(rail.type)
    }

    return ''
  }

  const getResultMessage = () => {
    if (!result) return ''

    if (result.cleared && isExactTimeResult(result)) {
      return '時間ぴったり！'
    }

    if (result.clearCondition === 'within') {
      if (!result.cleared) {
        return `${Math.abs(result.difference).toFixed(1)}秒早くできそう`
      }

      return `${getEarlyArrivalSeconds(result).toFixed(1)}秒早く到着！`
    }

    const seconds = Math.abs(result.difference).toFixed(1)
    return result.difference > 0
      ? `${seconds}秒早くできそう`
      : `${seconds}秒ゆっくりできそう`
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
        .filter((relayRoute) => relayRoute.route)
        .at(-1) ?? null
      : null
  const visibleRoute = shortestRoute ?? connectedRelayRoute?.route ?? null
  const visibleRouteRailCount =
    visibleRoute?.positions.filter((position) => getRailAt(position.x, position.y))
      .length ?? 0
  const currentFastRailSavings = getFastRailSavings({
    maxHighSpeedRails: currentStage?.maxFastRails,
    minimumRequiredHighSpeedRails: currentStage?.minimumRequiredFastRails,
    placedRails,
    savingsEligible: currentStage ? getClearCondition(currentStage) === 'within' : false,
  })
  const remainingFastRails = currentFastRailSavings.savedHighSpeedRails
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
          relayIndex,
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
  const shouldRevealEstimate = !estimateMode || estimateRevealed
  const revealedEstimateBreakdown =
    trainRun?.result.estimate?.breakdown ??
    (estimateRevealed && shortestRoute
      ? getRouteMemoBreakdown(shortestRoute)
      : null)
  const mapSegmentTimeLabels = (() => {
    const usedPositions = new Set()

    return visibleRouteSegments.flatMap((segment) => {
      if (segment.relayIndex === undefined) return []

      const relayGroup = currentStage.relayGroups[segment.relayIndex]
      const labelAnchorCell = relayGroup.cells[relayGroup.cells.length - 1]
      const orientation = getRelayGroupOrientation(relayGroup)
      const nearbyCandidates =
        orientation === 'vertical'
          ? [
            { x: labelAnchorCell.x + 1, y: labelAnchorCell.y },
            { x: labelAnchorCell.x - 1, y: labelAnchorCell.y },
            { x: labelAnchorCell.x + 2, y: labelAnchorCell.y },
            { x: labelAnchorCell.x - 2, y: labelAnchorCell.y },
          ]
          : [
            { x: labelAnchorCell.x, y: labelAnchorCell.y - 1 },
            { x: labelAnchorCell.x, y: labelAnchorCell.y + 1 },
            { x: labelAnchorCell.x, y: labelAnchorCell.y - 2 },
            { x: labelAnchorCell.x, y: labelAnchorCell.y + 2 },
          ]
      const fallbackCandidates = Array.from(
        { length: currentStage.width * currentStage.height },
        (_, index) => ({
          x: index % currentStage.width,
          y: Math.floor(index / currentStage.width),
        }),
      ).sort((a, b) => {
        const distanceA =
          Math.abs(a.x - labelAnchorCell.x) + Math.abs(a.y - labelAnchorCell.y)
        const distanceB =
          Math.abs(b.x - labelAnchorCell.x) + Math.abs(b.y - labelAnchorCell.y)
        return distanceA - distanceB
      })
      const labelPosition = [...nearbyCandidates, ...fallbackCandidates].find(
        (position) => {
          const key = positionToKey(position)
          return (
            isInsideMap(position) &&
            !usedPositions.has(key) &&
            !isSpecialCell(position.x, position.y) &&
            !getObstacleAt(position) &&
            !getRailAt(position.x, position.y)
          )
        },
      )

      if (!labelPosition) return []

      usedPositions.add(positionToKey(labelPosition))
      return [{ ...segment, position: labelPosition }]
    })
  })()
  const mapSegmentTimeLabelByPosition = new Map(
    mapSegmentTimeLabels.map((label) => [positionToKey(label.position), label]),
  )
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

  const isFastRailTutorialActive =
    Boolean(currentStage?.isFastRailTutorial) && !estimateMode
  const isGuidedTutorialActive =
    !tutorialSkipped &&
    (Boolean(currentStage?.isTutorial) || isFastRailTutorialActive)
  const tutorialFirstRail = currentStage?.isTutorial
    ? getRailAt(1, currentStage.start.y)
    : null
  const tutorialExitRail = currentStage?.isTutorial
    ? getRailAt(5, currentStage.start.y)
    : null
  const fastRailTutorialFirstSlowComplete =
    isFastRailTutorialActive &&
    getRailAt(1, currentStage.start.y)?.type === 'slow'
  const fastRailTutorialFirstFastComplete =
    isFastRailTutorialActive &&
    getRailAt(2, currentStage.start.y)?.type === 'fast'
  const fastRailTutorialSecondFastComplete =
    isFastRailTutorialActive &&
    getRailAt(3, currentStage.start.y)?.type === 'fast'
  const fastRailTutorialTailComplete =
    isFastRailTutorialActive &&
    [4, 5, 6].every(
      (x) => getRailAt(x, currentStage.start.y)?.type === 'slow',
    )
  const estimateTutorialMemoComplete =
    estimateMemo.slowRails === '4' &&
    estimateMemo.fastRails === '0' &&
    estimateMemo.congestionPasses === '0' &&
    estimateMemo.repeatedCells === '0'
  const tutorialTotalSteps =
    currentStage?.isEstimateTutorial || isFastRailTutorialActive ? 7 : 5
  const fastRailTutorialStep = !isFastRailTutorialActive
    ? null
    : !fastRailTutorialFirstSlowComplete
      ? 1
      : (!fastRailTutorialFirstFastComplete ||
          !fastRailTutorialSecondFastComplete) &&
        selectedRailType !== 'fast'
        ? 2
        : !fastRailTutorialFirstFastComplete
          ? 3
          : !fastRailTutorialSecondFastComplete
            ? 4
            : !fastRailTutorialTailComplete && selectedRailType !== 'slow'
              ? 5
              : !fastRailTutorialTailComplete || !shortestRoute
                ? 6
                : 7
  const tutorialStep = trainRun || !isGuidedTutorialActive
    ? null
    : isFastRailTutorialActive
      ? fastRailTutorialStep
      : shortestRoute
      ? currentStage.isEstimateTutorial
        ? userEstimatedTime === '6'
          ? 7
          : estimateTutorialMemoComplete
            ? 6
            : 5
        : 5
      : tutorialExitRail
        ? 4
        : connectedRelayRoute
          ? 3
          : tutorialFirstRail
            ? 2
            : 1
  const specialTutorialKind =
    !tutorialSkipped && !trainRun && !tutorialStep && !currentStage?.isTutorial
      ? selectedStage === '3' &&
          currentStage?.relayGroups?.length > 0 &&
          !currentStage?.isTurnaroundTutorial
          ? 'relay'
          : null
      : null
  const currentStageResultKey = selectedStage
    ? getStageResultKey(selectedStage, estimateMode)
    : null
  const currentStagePlayed = currentStageResultKey
    ? Boolean(stageResults[currentStageResultKey])
    : false
  const shouldForceTurnaroundDemo =
    !tutorialSkipped &&
    !trainRun &&
    !tutorialStep &&
    Boolean(currentStage?.isTurnaroundTutorial) &&
    !currentStagePlayed
  const shouldShowTurnaroundDemo =
    Boolean(currentStage?.turnaroundPoints?.length) &&
    (turnaroundDemoOpen || shouldForceTurnaroundDemo)
  const hasTutorialOverlay = Boolean(
    tutorialStep || specialTutorialKind || shouldShowTurnaroundDemo,
  )
  const standardTutorialInstructions = {
    1: {
      title: 'レールを置いてみよう',
      body: '低速レールは選択済みです。スタートの右にある、黄色い枠の空きマスを押してください。',
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
      title: '2つのルートから選ぼう',
      body: '右へ進んでから下へ曲がるか、先に下へ曲がるかを選び、どちらか1マスにレールを置いてください。',
    },
    5: {
      title: '準備完了！ 出発しよう',
      body: 'ゴールまでつながりました。予想時間を確認して「出発」を押してください。',
    },
  }
  const fastRailTutorialInstructions = {
    1: {
      title: 'まずは低速レールを置こう',
      body: '低速レールは選択済みです。スタートの右にある、黄色い枠の空きマスを押してください。',
    },
    2: {
      title: '高速レールに切り替えよう',
      body: 'レール選択の「高速レール」を押してください。高速レールは1マスを0.5秒で進みます。',
    },
    3: {
      title: '高速レールを置こう',
      body: '黄色い枠のマスを押して、高速レールを1本置いてください。',
    },
    4: {
      title: 'もう1本高速レールを置こう',
      body: '続けて黄色い枠のマスに高速レールを置き、目標時間に近づけましょう。',
    },
    5: {
      title: '低速レールに戻そう',
      body: 'レール選択の「低速レール」を押してください。必要な場所だけ高速にする練習です。',
    },
    6: {
      title: 'ゴールまでつなごう',
      body: '黄色い枠の3マスを低速レールでつなげてください。ドラッグでまとめて配置できます。',
    },
    7: {
      title: '準備完了！ 出発しよう',
      body: '低速と高速を切り替えて、5秒のルートができました。「出発」を押してください。',
    },
  }
  const estimateTutorialInstructions = {
    1: {
      title: '低速レールを置こう',
      body: '低速レールは選択済みです。盤面で黄色い枠になっている、スタート右のマスを押してください。',
    },
    2: {
      title: '中継地点までつなごう',
      body: '次に黄色い枠になったマスを押して、中継地点までレールをつなげてください。',
    },
    3: {
      title: 'プレビューを確認しよう',
      body: 'ゴースト電車が接続済みルートを走ります。確認したら、トンネル右の黄色い枠のマスを押してください。',
    },
    4: {
      title: 'ゴールへつなごう',
      body: '黄色い枠の2マスからどちらか一方を押すと、ゴールまで接続できます。',
    },
    5: {
      title: '見積もりメモを入力しよう',
      body: '強調されたメモへ、低速レール「4」、残り3項目へ「0」を入力してください。',
    },
    6: {
      title: '予想時間を入力しよう',
      body: '強調された「自分の予想」へ「6」と入力してください。',
    },
    7: {
      title: '出発して答え合わせしよう',
      body: '準備完了です。黄色い枠の「出発」を押すと、予想時間と内訳が表示されます。',
    },
  }
  const tutorialInstructions = currentStage?.isEstimateTutorial
    ? estimateTutorialInstructions
    : isFastRailTutorialActive
      ? fastRailTutorialInstructions
    : standardTutorialInstructions
  const tutorialRequiredRailType = isFastRailTutorialActive
    ? tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 4
      ? 'fast'
      : tutorialStep === 1 || tutorialStep === 5 || tutorialStep === 6
        ? 'slow'
        : null
    : null
  const tutorialRailControlTarget = isFastRailTutorialActive
    ? tutorialStep === 2
      ? 'fast'
      : tutorialStep === 5
        ? 'slow'
        : null
    : null
  const isSpecialTutorialTargetCell = (x, y) => {
    if (specialTutorialKind === 'relay') {
      return Boolean(getRelayCellAt({ x, y }))
    }

    if (specialTutorialKind === 'turnaround') {
      return Boolean(getTurnaroundPointAt({ x, y }))
    }

    return false
  }

  const isTutorialTargetCell = (x, y) => {
    if (!tutorialStep) return false

    if (isFastRailTutorialActive) {
      if (tutorialStep === 1) return x === 1 && y === currentStage.start.y
      if (tutorialStep === 3) return x === 2 && y === currentStage.start.y
      if (tutorialStep === 4) return x === 3 && y === currentStage.start.y
      if (tutorialStep === 6) {
        return x >= 4 && x <= 6 && y === currentStage.start.y
      }
      return false
    }

    if (tutorialStep === 1) return x === 1 && y === currentStage.start.y
    if (tutorialStep === 2) return x === 2 && y === currentStage.start.y
    if (tutorialStep === 3) return x === 5 && y === currentStage.start.y
    if (tutorialStep === 4) {
      return (
        (x === 6 && y === currentStage.start.y) ||
        (x === 5 && y === currentStage.goal.y)
      )
    }
    return false
  }
  const getStageIdForWorldNode = (node) =>
    node.stageNumber === 'tutorial' && estimateMode
      ? 'estimateTutorial'
      : node.stageNumber
  const getStageWorldNeighborIndex = (fromIndex, direction) => {
    if (direction === 'left') return fromIndex > 0 ? fromIndex - 1 : -1
    if (direction === 'right') {
      return fromIndex < STAGE_WORLD_NODES.length - 1 ? fromIndex + 1 : -1
    }

    return -1
  }
  const moveStageWorldTo = (targetIndex) => {
    const nextIndex = Math.min(
      Math.max(targetIndex, 0),
      STAGE_WORLD_NODES.length - 1,
    )

    if (nextIndex === stageWorldIndex) return

    setStageWorldFacing(nextIndex > stageWorldIndex ? 'right' : 'left')
    setStageWorldIndex(nextIndex)
  }
  const moveStageWorld = (direction) => {
    const nextIndex = getStageWorldNeighborIndex(stageWorldIndex, direction)

    if (nextIndex >= 0) moveStageWorldTo(nextIndex)
  }
  const handleStageWorldWheel = useEffectEvent((event) => {
    if (screen !== 'stageSelect') return

    if (event.cancelable) event.preventDefault()
    event.stopPropagation()

    const dominantDelta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY

    if (Math.abs(dominantDelta) < 4) return

    const wheel = stageWorldWheelRef.current
    const now = window.performance.now()
    wheel.delta += dominantDelta

    if (
      now - wheel.lastMovedAt < STAGE_WORLD_WHEEL_REPEAT_MS &&
      Math.abs(wheel.delta) < STAGE_WORLD_WHEEL_FAST_REPEAT_DELTA
    ) {
      return
    }

    if (Math.abs(wheel.delta) < STAGE_WORLD_WHEEL_STEP_DELTA) return

    moveStageWorld(wheel.delta > 0 ? 'right' : 'left')
    wheel.delta = 0
    wheel.lastMovedAt = now
  })

  useEffect(() => {
    const mapWindow = stageWorldMapWindowRef.current
    if (!mapWindow) return undefined

    mapWindow.addEventListener('wheel', handleStageWorldWheel, {
      passive: false,
    })

    return () => {
      mapWindow.removeEventListener('wheel', handleStageWorldWheel)
    }
  }, [screen])

  const stageWorldNodes = STAGE_WORLD_NODES.map((node) => {
    const stageId = getStageIdForWorldNode(node)
    const stage = STAGES[stageId]
    const stageResult = stageResults[getStageResultKey(stageId, estimateMode)]
    const stageCleared = isStageCleared(stage, stageResult)
    const stageWorldStatus =
      stageCleared
        ? 'cleared'
        : stageResult
          ? 'improve'
          : 'unplayed'

    return {
      ...node,
      y: STAGE_WORLD_STATUS_ROWS[stageWorldStatus],
      baseY: node.y,
      stageId,
      stage,
      stageResult,
      stageCleared,
      stageWorldStatus,
    }
  })
  const stageWorldTrackPath = getStageWorldTrackPath(stageWorldNodes)
  const selectedStageWorldNode =
    stageWorldNodes[stageWorldIndex] ?? stageWorldNodes[0]
  const selectedStageWorldId = selectedStageWorldNode.stageId
  const selectedStageWorldStage = selectedStageWorldNode.stage
  const selectedStageWorldResult = selectedStageWorldNode.stageResult
  const selectedStageWorldEvaluationTags = getStageEvaluationTags(
    selectedStageWorldStage,
    selectedStageWorldResult,
  )
  const stageWorldOffsetColumns = Math.min(
    Math.max(
      selectedStageWorldNode.x - (STAGE_WORLD_VISIBLE_COLUMNS - 1) / 2,
      0,
    ),
    STAGE_WORLD_COLUMNS - STAGE_WORLD_VISIBLE_COLUMNS,
  )
  const stageWorldOffsetPx =
    Math.round(stageWorldOffsetColumns * STAGE_WORLD_COLUMN_STEP_PX)
  const stageWorldPlayerLeftPx =
    getStageWorldNodeLeftPx(selectedStageWorldNode) + STAGE_WORLD_CELL_PX / 2
  const stageWorldPlayerTopPx = getStageWorldNodeTopPx(selectedStageWorldNode) - 24
  const stageWorldCanMove = {
    right: getStageWorldNeighborIndex(stageWorldIndex, 'right') >= 0,
    left: getStageWorldNeighborIndex(stageWorldIndex, 'left') >= 0,
  }
  const selectedStageOrderKey =
    selectedStage === 'estimateTutorial' ? 'tutorial' : selectedStage
  const selectedStageOrderIndex = STAGE_ORDER.findIndex(
    (stageNumber) => stageNumber === selectedStageOrderKey,
  )
  const nextStageOrderKey =
    selectedStageOrderIndex >= 0
      ? STAGE_ORDER[selectedStageOrderIndex + 1]
      : null
  const nextStageId =
    nextStageOrderKey === 'tutorial' && estimateMode
      ? 'estimateTutorial'
      : nextStageOrderKey
  const playTurnaroundDemo = () => {
    setTurnaroundDemoPlaying(false)
    window.setTimeout(() => {
      setTurnaroundDemoPlaying(true)
    }, 0)
  }
  const closeTurnaroundDemo = () => {
    setTurnaroundDemoOpen(false)
    setTurnaroundDemoPlaying(false)
    setTutorialSkipped(true)
  }
  const renderTurnaroundDemoCell = (row, column) => {
    const cellKey = `${row}-${column}`
    const classNames = ['turnaround-demo-cell']
    let content = null

    if (cellKey === '1-0') {
      classNames.push('turnaround-demo-start')
      content = (
        <>
          <img src={redStationBuildingImage} alt="" aria-hidden="true" />
          <b>S</b>
        </>
      )
    } else if (cellKey === '3-1') {
      classNames.push('turnaround-demo-goal')
      content = (
        <>
          <img src={stationBuildingImage} alt="" aria-hidden="true" />
          <b>G</b>
        </>
      )
    } else if (cellKey === '1-3') {
      classNames.push('turnaround-demo-lever')
      content = <img src={leverImage} alt="" aria-hidden="true" />
    } else if (cellKey === '1-1') {
      classNames.push('turnaround-demo-switch')
      content = (
        <>
          <img
            className="turnaround-demo-straight-rail"
            src={straightRailImage}
            alt=""
            aria-hidden="true"
          />
          <img
            className="turnaround-demo-curve-rail"
            src={curvedRailImage}
            alt=""
            aria-hidden="true"
          />
        </>
      )
    } else if (cellKey === '1-2') {
      classNames.push('turnaround-demo-rail', 'turnaround-demo-rail-to-lever')
      content = <img src={straightRailImage} alt="" aria-hidden="true" />
    } else if (cellKey === '2-1') {
      classNames.push('turnaround-demo-rail', 'turnaround-demo-rail-down')
      content = <img src={straightRailImage} alt="" aria-hidden="true" />
    } else {
      classNames.push('turnaround-demo-empty')
    }

    return (
      <span key={cellKey} className={classNames.join(' ')}>
        {content}
      </span>
    )
  }

  return (
    <div className="app">
      {screen === 'title' && (
        <div className="screen title-screen">
          <h1><RubyText>時間ぴったりトレイン</RubyText></h1>

          <button className="main-button" onClick={() => setScreen('stageSelect')}>
            START
          </button>
        </div>
      )}

      {screen === 'stageSelect' && (
        <div className={`screen stage-select-screen ${estimateMode ? 'estimate-stage-select' : ''}`}>
          <h1><RubyText>ステージ選択</RubyText></h1>

          <section className="stage-mode-selector" aria-label="プレイモード選択">
            <div>
              <button
                type="button"
                aria-pressed={!estimateMode}
                className={!estimateMode ? 'active' : ''}
                onClick={() => setEstimateMode(false)}
              >
                <RubyText>通常モード</RubyText>
              </button>
              <button
                type="button"
                aria-pressed={estimateMode}
                className={estimateMode ? 'active' : ''}
                onClick={() => setEstimateMode(true)}
              >
                <RubyText>見積もりモード</RubyText>
              </button>
            </div>
            <p>
              <RubyText
                text={
                  estimateMode
                    ? '時間を予想してから出発し、あとで答え合わせします。'
                    : '予想時間を確認しながらレールを配置します。'
                }
              />
            </p>
          </section>

          <section className="stage-world" aria-label="ステージ移動マップ">
            <div
              ref={stageWorldMapWindowRef}
              className="stage-world-map-window"
              style={{
                '--stage-world-window-width': `${STAGE_WORLD_WINDOW_WIDTH_PX}px`,
              }}
            >
              <div
                className="stage-world-map"
                style={{
                  '--stage-world-columns': String(STAGE_WORLD_COLUMNS),
                  '--stage-world-rows': String(STAGE_WORLD_ROWS),
                  '--stage-world-cell': `${STAGE_WORLD_CELL_PX}px`,
                  '--stage-world-gap': `${STAGE_WORLD_GAP_PX}px`,
                  '--stage-world-map-width': `${STAGE_WORLD_MAP_WIDTH_PX}px`,
                  '--stage-world-map-height': `${STAGE_WORLD_MAP_HEIGHT_PX}px`,
                  '--stage-world-padding-x': `${STAGE_WORLD_PADDING_X_PX}px`,
                  '--stage-world-row': `${STAGE_WORLD_ROW_PX}px`,
                  '--stage-world-padding-top': `${STAGE_WORLD_PADDING_TOP_PX}px`,
                  '--stage-world-padding-bottom': `${STAGE_WORLD_PADDING_BOTTOM_PX}px`,
                  '--stage-world-offset': `${stageWorldOffsetPx}px`,
                }}
              >
                <div className="stage-world-ground" aria-hidden="true" />
                <svg
                  className="stage-world-track-layer"
                  viewBox={`0 0 ${STAGE_WORLD_MAP_WIDTH_PX} ${STAGE_WORLD_MAP_HEIGHT_PX}`}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    className="stage-world-track-shadow"
                    d={stageWorldTrackPath}
                  />
                  <path
                    className="stage-world-track-sleepers"
                    d={stageWorldTrackPath}
                  />
                  <path
                    className="stage-world-track-rails"
                    d={stageWorldTrackPath}
                  />
                  <path
                    className="stage-world-track-gap"
                    d={stageWorldTrackPath}
                  />
                </svg>
                {stageWorldNodes.map((node, index) => {
                  const {
                    stageId,
                    stage,
                    stageResult,
                    stageCleared,
                    stageWorldStatus,
                  } = node
                  const isCurrentWorldNode = index === stageWorldIndex
                  const isClearedStage = stageCleared
                  const isStageConditionUnmet = Boolean(stageResult) && !stageCleared

                  return (
                    <button
                      key={node.stageNumber}
                      type="button"
                      className={`stage-world-node stage-world-node-${stageWorldStatus} ${isCurrentWorldNode ? 'current-stage-world-node' : ''} ${stage.isTutorial || stage.isTurnaroundTutorial ? 'tutorial-stage-card' : ''} ${isClearedStage ? 'completed-stage-card' : ''} ${isStageConditionUnmet ? 'off-time-stage-card' : ''}`}
                      style={{
                        '--stage-world-node-x': `${getStageWorldNodeLeftPx(node)}px`,
                        '--stage-world-node-y': `${getStageWorldNodeTopPx(node)}px`,
                      }}
                      aria-label={`${stage.title}へ移動`}
                      aria-current={isCurrentWorldNode ? 'step' : undefined}
                      onClick={() => {
                        if (isCurrentWorldNode) {
                          startStage(stageId)
                          return
                        }

                        moveStageWorldTo(index)
                      }}
                    >
                      <span className="stage-number">
                        <RubyText text={String(stage.badge ?? node.stageNumber)} />
                      </span>
                    </button>
                  )
                })}
                <span
                  className={`stage-world-player stage-world-player-facing-${stageWorldFacing}`}
                  style={{
                    '--stage-world-player-x': `${stageWorldPlayerLeftPx}px`,
                    '--stage-world-player-y': `${stageWorldPlayerTopPx}px`,
                  }}
                  aria-hidden="true"
                >
                  <img
                    className="stage-world-player-car stage-world-player-car-rear"
                    src={blueTrainLeftImage}
                    alt=""
                  />
                  <img
                    className="stage-world-player-car stage-world-player-car-front"
                    src={blueTrainRightImage}
                    alt=""
                  />
                </span>
              </div>
            </div>

            <div className="stage-world-panel">
              <span className="stage-world-current-label">
                <RubyText>現在地</RubyText>
              </span>
              <h2><RubyText text={selectedStageWorldStage.title} /></h2>
              <p><RubyText text={selectedStageWorldStage.description} /></p>
              <div className="stage-world-panel-tags">
                {selectedStageWorldEvaluationTags.map((tag) => (
                  <span
                    key={tag.key}
                    className={`stage-world-panel-tag stage-world-panel-tag-${tag.tone}`}
                  >
                    <span className="stage-world-panel-tag-text">
                      <RubyText balancePlainText text={tag.text} />
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div className="stage-world-controls" aria-label="移動ボタン">
              <button
                type="button"
                className="stage-world-move-button stage-world-move-left"
                disabled={!stageWorldCanMove.left}
                onClick={() => moveStageWorld('left')}
              >
                <RubyText>前へ</RubyText>
              </button>
              <button
                type="button"
                className="main-button stage-world-enter-button"
                onClick={() => startStage(selectedStageWorldId)}
              >
                <RubyText>このステージへ入る</RubyText>
              </button>
              <button
                type="button"
                className="stage-world-move-button stage-world-move-right"
                disabled={!stageWorldCanMove.right}
                onClick={() => moveStageWorld('right')}
              >
                <RubyText>次へ</RubyText>
              </button>
            </div>
          </section>

        </div>
      )}

      {screen === 'game' && currentStage && (
        <div className={`screen game-screen ${estimateMode ? 'estimate-mode' : ''} ${hasTutorialOverlay ? 'tutorial-active' : ''}`}>
          <div className="game-header">
            <h2><RubyText text={currentStage.title} /></h2>
            <button
              aria-label="ステージ一覧を開く"
              title="ステージ一覧"
              disabled={Boolean(trainRun)}
              onClick={openStageSelect}
            >
              <StageListIcon />
            </button>
          </div>

          <p className="target-time">
            <RubyText text={`目標時間：${currentStage.targetTime}秒`} />
          </p>

          <div className="stage-constraints" aria-label="ステージの条件">
            <span><RubyText>中継地点を全て通ること</RubyText></span>
            {currentStage.turnaroundPoints?.length > 0 && (
              <span><RubyText>折り返し地点を通過する</RubyText></span>
            )}
            <span>
              <RubyText
                text={
                  getClearCondition(currentStage) === 'within'
                    ? '時間以内でゴールする'
                    : '時間ぴったりでゴールする'
                }
              />
            </span>
          </div>

          {currentStage.turnaroundPoints?.length > 0 && (
            <button
              type="button"
              className="turnaround-demo-open-button"
              disabled={Boolean(trainRun)}
              onClick={() => {
                setTurnaroundDemoOpen(true)
                setTurnaroundDemoPlaying(false)
              }}
            >
              <RubyText>折り返しデモを見る</RubyText>
            </button>
          )}

          {tutorialStep && (
            <section className="tutorial-guide" aria-live="polite">
              <div className="tutorial-guide-heading">
                <span>
                  <RubyText text={`操作 ${tutorialStep} / ${tutorialTotalSteps}`} />
                </span>
                <h3><RubyText text={tutorialInstructions[tutorialStep].title} /></h3>
                <button
                  type="button"
                  className="tutorial-skip-button"
                  onClick={() => setTutorialSkipped(true)}
                >
                  <RubyText>スキップ</RubyText>
                </button>
              </div>
              <p><RubyText text={tutorialInstructions[tutorialStep].body} /></p>
              <div className="tutorial-progress" aria-hidden="true">
                {Array.from(
                  { length: tutorialTotalSteps },
                  (_, index) => index + 1,
                ).map((step) => (
                  <span
                    key={step}
                    className={step <= tutorialStep ? 'active' : ''}
                  />
                ))}
              </div>
            </section>
          )}

          {specialTutorialKind === 'relay' && (
            <section className="tutorial-guide tutorial-guide-info" aria-live="polite">
              <div className="tutorial-guide-heading">
                <span><RubyText>説明</RubyText></span>
                <h3><RubyText>中継地点を確認しよう</RubyText></h3>
                <button
                  type="button"
                  className="tutorial-skip-button"
                  onClick={() => setTutorialSkipped(true)}
                >
                  <RubyText>スキップ</RubyText>
                </button>
              </div>
              <p>
                <RubyText>
                  黄色い枠で強調されたトンネルが中継地点です。クリアするには、スタートからゴールまでの経路の途中で必ず通過してください。
                </RubyText>
              </p>
            </section>
          )}

          {shouldShowTurnaroundDemo && (
            <section className="tutorial-guide turnaround-demo-guide" aria-live="polite">
              <div className="tutorial-guide-heading">
                <span><RubyText>デモ</RubyText></span>
                <h3><RubyText>折り返し地点の動きを見よう</RubyText></h3>
                <button
                  type="button"
                  className="tutorial-skip-button"
                  onClick={closeTurnaroundDemo}
                >
                  <RubyText>閉じる</RubyText>
                </button>
              </div>
              <div
                className={`turnaround-demo-board ${turnaroundDemoPlaying ? 'turnaround-demo-playing' : ''}`}
                aria-label="折り返し地点の小さいデモ盤面"
              >
                {Array.from({ length: 4 }, (_, row) =>
                  Array.from({ length: 4 }, (__, column) =>
                    renderTurnaroundDemoCell(row, column),
                  ),
                )}
                <span className="turnaround-demo-train" aria-hidden="true">
                  <img src={blueTrainRightImage} alt="" />
                </span>
              </div>
              <button
                type="button"
                className="turnaround-demo-play-button"
                onClick={playTurnaroundDemo}
              >
                <RubyText>{turnaroundDemoPlaying ? 'もう一度再生' : '再生'}</RubyText>
              </button>
              <p>
                <RubyText>
                  電車はスタートからレバーへ進み、折り返して同じレールを戻ります。戻ってきた途中でレールが曲がるルートに切り替わり、ゴールへ向かいます。
                </RubyText>
              </p>
            </section>
          )}

          <div className="rail-yard">
            <div className="rail-yard-heading">
              <h3><RubyText>レール選択</RubyText></h3>
            </div>

            <div className="rail-selector">
              {currentStage.availableRails.map((railType) => (
                <button
                  key={railType}
                  className={`rail-card ${selectedRailType === railType ? 'selected' : ''} ${tutorialRailControlTarget === railType ? 'tutorial-control-highlight' : ''}`}
                  disabled={
                    Boolean(trainRun) ||
                    Boolean(
                      tutorialRequiredRailType &&
                        tutorialRequiredRailType !== railType,
                    )
                  }
                  onClick={() => setSelectedRailType(railType)}
                  aria-pressed={selectedRailType === railType}
                >
                  <strong>
                    <RubyText
                      text={
                        railType === 'fast' && remainingFastRails !== null
                          ? `高速レール：あと${remainingFastRails}本`
                          : RAIL_TYPES[railType].label
                      }
                    />
                  </strong>
                </button>
              ))}
              <button
                className="clear-rails-button"
                disabled={
                  placedRails.length === 0 ||
                  Boolean(trainRun) ||
                  Boolean(tutorialStep)
                }
                onClick={() => {
                  setPlacedRails([])
                  setMessage('')
                }}
              >
                <RubyText>全て片付ける</RubyText>
              </button>
            </div>

            <p className="rail-selection-description">
              <RubyText
                text={`選択中：${RAIL_TYPES[selectedRailType].description}${
                  selectedRailType === 'slow' ? '・ドラッグで連続配置できます' : ''
                }${
                  selectedRailType === 'fast' &&
                  (currentStage.slowZoneRadius ||
                    currentStage.relayRequiresSlowApproach)
                    ? '・「のんびり」のマスでは1マスを1秒で進みます'
                    : ''
                }`}
              />
            </p>

          </div>

          <div
            ref={mapRef}
            className={`grid-map ${trainRun ? 'train-running' : ''} ${selectedRailType === 'slow' && !trainRun ? 'slow-drag-enabled' : ''}`}
            style={{
              gridTemplateColumns: `repeat(${currentStage.width}, 1fr)`,
              width: `min(100%, ${(currentStage.width / currentStage.height) * 82}vh)`,
            }}
            onPointerDown={startSlowRailDrag}
            onPointerMove={continueSlowRailDrag}
            onPointerUp={finishSlowRailDrag}
            onPointerCancel={cancelSlowRailDrag}
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
                const isFastRailLimited =
                  rail?.type === 'fast' &&
                  (isSlowZonePosition({ x, y }) ||
                    isRelayConnectionPosition({ x, y }))
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
                const mapSegmentTimeLabel =
                  mapSegmentTimeLabelByPosition.get(positionToKey({ x, y }))
                const isTutorialTarget =
                  isTutorialTargetCell(x, y) ||
                  isSpecialTutorialTargetCell(x, y)
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
                        ? `${isCongestion ? '混雑区画 ' : ''}${RAIL_TYPES[rail.type].label}${isFastRailLimited ? ' のんびり扱い' : ''} ${x + 1}列 ${y + 1}行`
                        : `${isCongestion ? '混雑区画 ' : ''}空きマス ${x + 1}列 ${y + 1}行`

                return (
                  <button
                    key={`${x}-${y}`}
                    data-cell-key={`${x}-${y}`}
                    aria-label={cellLabel}
                    disabled={
                      Boolean(trainRun) ||
                      Boolean(obstacle) ||
                      Boolean(tutorialStep && !isTutorialTarget)
                    }
                    className={`map-cell ${rail ? `rail-${rail.type}` : ''} ${isFastRailLimited ? 'rail-fast-limited' : ''} ${isStart ? 'start-cell' : ''} ${isGoal ? 'goal-cell' : ''} ${isRelay ? 'relay-cell' : ''} ${isTurnaround ? 'turnaround-cell' : ''} ${obstacle ? `obstacle-cell obstacle-cell-${obstacle.type}` : ''} ${isCongestion ? 'congestion-cell' : ''} ${isLowSpeedRequired ? 'low-speed-required-cell' : ''} ${isShortestRoute ? 'shortest-route-cell' : ''} ${isTutorialTarget ? 'tutorial-target-cell' : ''}`}
                    onClick={(event) => {
                      if (selectedRailType === 'slow' && event.detail !== 0) return
                      toggleRail(x, y)
                    }}
                  >
                    {renderCell(x, y, visibleRoute)}
                    {shouldRevealEstimate && mapSegmentTimeLabel && (
                      <span className="map-segment-time-label" aria-hidden="true">
                        <small><RubyText text={mapSegmentTimeLabel.label} /></small>
                        <strong><RubyText text={`${mapSegmentTimeLabel.time.toFixed(1)}秒`} /></strong>
                      </span>
                    )}
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
                ref={trainMotionLayerRef}
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

          <div
            className={`time-panel time-panel-${shouldRevealEstimate ? timePanelStatus : 'waiting'}`}
            aria-live="polite"
          >
            {shouldRevealEstimate ? (
              <>
                <span className="time-panel-label"><RubyText>予想時間</RubyText></span>
                <span className="time-panel-scope">
                  <RubyText
                    text={
                      shortestRoute
                        ? 'ゴールまで'
                        : connectedRelayRoute
                          ? `中継地点${connectedRelayRoute.relayNumber}まで`
                          : getRelayCells().length > 0
                            ? '中継地点まで'
                            : 'ゴールまで'
                    }
                  />
                </span>
                <strong>
                  <RubyText
                    text={
                      shortestRoute
                        ? `${shortestRoute.time.toFixed(1)}秒`
                        : connectedRelayRoute
                          ? `${connectedRelayRoute.route.time.toFixed(1)}秒`
                          : '未接続'
                    }
                  />
                </strong>
                {visibleRouteSegments.length > 0 && (
                  <div className="route-segment-times">
                    {visibleRouteSegments.map((segment) => (
                      <span key={segment.label}>
                        <small><RubyText text={segment.label} /></small>
                        <b><RubyText text={`${segment.time.toFixed(1)}秒`} /></b>
                      </span>
                    ))}
                  </div>
                )}
                <small className="time-panel-note">
                  <RubyText
                    text={
                      shortestRoute
                        ? `最短経路 ${shortestRouteRailCount}マス / 目標 ${currentStage.targetTime}秒`
                        : connectedRelayRoute
                          ? `ここまで ${visibleRouteRailCount}マス。ゴールまでつなげると最終予想時間に変わります。`
                          : getRelayCells().length > 0
                            ? 'まずはスタートから中継地点までレールをつなげてください。'
                            : 'スタートからゴールまでレールをつなげると表示されます。'
                    }
                  />
                </small>
              </>
            ) : (
              <>
                <span className="time-panel-label"><RubyText>見積もりモード</RubyText></span>
                <span className="time-panel-scope"><RubyText>出発後に答え合わせ</RubyText></span>
                <strong>？？？</strong>
                <small className="time-panel-note">
                  <RubyText>区間時間と最終予想時間は、出発するまで表示されません。</RubyText>
                </small>
              </>
            )}
          </div>

          <div className="rail-info" aria-label="マップの凡例">
            <span className="rail-info-item">
              <img src={redStationBuildingImage} alt="" aria-hidden="true" />
              <span><RubyText>スタート</RubyText></span>
            </span>
            <span className="rail-info-item">
              <img src={stationBuildingImage} alt="" aria-hidden="true" />
              <span><RubyText>ゴール</RubyText></span>
            </span>
            <span className="rail-info-item">
              <img src={tunnelEntranceRailLeftImage} alt="" aria-hidden="true" />
              <span><RubyText>中継地点</RubyText></span>
            </span>
            {currentStage.turnaroundPoints?.length > 0 && (
              <span className="rail-info-item">
                <img src={leverImage} alt="" aria-hidden="true" />
                <span><RubyText>折り返し地点</RubyText></span>
              </span>
            )}
            <span className="rail-info-item">
              <img src={straightRailImage} alt="" aria-hidden="true" />
              <span><RubyText text={`配置 ${placedRails.length}マス`} /></span>
            </span>
            <span className="rail-info-item rail-info-route">
              <img src={straightRailImage} alt="" aria-hidden="true" />
              <span>
                <RubyText
                  text={`経路 ${visibleRoute ? `${visibleRouteRailCount}マス` : '未接続'}`}
                />
              </span>
            </span>
          </div>

          {trainRun && (
            <p className="train-status" aria-live="polite">
              <RubyText>電車が走行中です</RubyText>
              <span><RubyText>最短経路を走行中</RubyText></span>
            </p>
          )}

          {message && <p className="game-message"><RubyText text={message} /></p>}

          {estimateMode && (
            <section
              className={`estimate-memo ${currentStage.isEstimateTutorial && tutorialStep === 5 ? 'tutorial-control-highlight' : ''}`}
              aria-label="見積もりメモ"
            >
              <div className="estimate-memo-heading">
                <h3><RubyText>見積もりメモ</RubyText></h3>
                <span>
                  <RubyText text={estimateRevealed ? '実績' : '入力'} />
                </span>
              </div>

              <div className="estimate-memo-fields">
                {ESTIMATE_MEMO_FIELDS.map((field) => (
                  <label key={field.key}>
                    <span><RubyText text={field.label} /></span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="99"
                      step="1"
                      value={estimateMemo[field.key]}
                      disabled={
                        estimateRevealed ||
                        (currentStage.isEstimateTutorial && tutorialStep !== 5)
                      }
                      onChange={(event) => {
                        setEstimateMemo((memo) => ({
                          ...memo,
                          [field.key]: getBoundedInputValue(
                            event.target.value,
                            true,
                          ),
                        }))
                      }}
                    />
                    {estimateRevealed && revealedEstimateBreakdown && (
                      <small>
                        <RubyText
                          text={`${revealedEstimateBreakdown[field.key].count}マス・${revealedEstimateBreakdown[field.key].time.toFixed(1)}秒`}
                        />
                      </small>
                    )}
                  </label>
                ))}
              </div>

              <label
                className={`user-time-estimate ${currentStage.isEstimateTutorial && tutorialStep === 6 ? 'tutorial-control-highlight' : ''}`}
              >
                <span><RubyText>自分の予想</RubyText></span>
                <span className="user-time-estimate-input">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="99"
                    step="0.5"
                    value={userEstimatedTime}
                    disabled={
                      estimateRevealed ||
                      (currentStage.isEstimateTutorial && tutorialStep !== 6)
                    }
                    onChange={(event) =>
                      setUserEstimatedTime(
                        getBoundedInputValue(event.target.value),
                      )
                    }
                  />
                  <RubyText>秒</RubyText>
                </span>
              </label>
            </section>
          )}

          <button
            className={`main-button ${tutorialStep === tutorialTotalSteps ? 'tutorial-departure-button' : ''}`}
            disabled={
              Boolean(tutorialStep && tutorialStep !== tutorialTotalSteps)
            }
            onClick={trainRun ? toggleTrainSpeed : startTrain}
            aria-pressed={trainRun ? trainRun.playbackRate === 2 : undefined}
            aria-label={
              trainRun
                ? `2倍速を${trainRun.playbackRate === 2 ? 'OFF' : 'ON'}にする`
                : undefined
            }
          >
            <RubyText
              text={
                trainRun
                  ? `2倍速：${trainRun.playbackRate === 2 ? 'ON' : 'OFF'}`
                  : '出発'
              }
            />
          </button>
        </div>
      )}

      {screen === 'result' && result && (
        <div className="screen result-screen">
          <div
            className={`result-box result-box-${getResultTone(result)} ${result.estimate ? 'result-box-estimate' : ''}`}
          >
            <span className="result-status-badge">
              <RubyText text={getResultStatusLabel(result)} />
            </span>
            <h1><RubyText>リザルト</RubyText></h1>
            <div className="result-summary-grid">
              <p className="result-summary-card result-summary-condition">
                <span><RubyText>クリア条件</RubyText></span>
                <strong>
                  <RubyText
                    text={
                      result.clearCondition === 'within'
                        ? '目標時間以内'
                        : '目標時間ぴったり'
                    }
                  />
                </strong>
              </p>
              <p className="result-summary-card">
                <span><RubyText>目標</RubyText></span>
                <strong><RubyText text={`${result.targetTime}秒`} /></strong>
              </p>
              <p className="result-summary-card">
                <span><RubyText>実際</RubyText></span>
                <strong><RubyText text={`${result.actualTime.toFixed(1)}秒`} /></strong>
              </p>
            </div>
            <p className="result-message">
              <RubyText text={getResultMessage()} />
            </p>
            {result.fastRailSavingsAwarded && (
              <p className="fast-rail-saving-feedback">
                <RubyText
                  text={getFastRailSavingsMessage({
                    savingsAwarded: result.fastRailSavingsAwarded,
                    savingsRating: result.fastRailSavingsRating,
                    savedHighSpeedRails: result.remainingFastRails,
                  })}
                />
              </p>
            )}

            {result.estimate && (
              <section className="estimate-result">
                <h2><RubyText>見積もりの答え合わせ</RubyText></h2>
                <div className="estimate-result-summary">
                  <span>
                    <RubyText>自分の予想</RubyText>{' '}
                    <strong><RubyText text={`${result.estimate.userTime.toFixed(1)}秒`} /></strong>
                  </span>
                  <span>
                    <RubyText>計算結果</RubyText>{' '}
                    <strong><RubyText text={`${result.actualTime.toFixed(1)}秒`} /></strong>
                  </span>
                  <span>
                    <RubyText>予想との差</RubyText>{' '}
                    <strong>
                      <RubyText
                        text={`${Math.abs(result.estimate.userTime - result.actualTime).toFixed(1)}秒`}
                      />
                    </strong>
                  </span>
                </div>

                {result.estimate.segments.length > 0 && (
                  <div className="estimate-result-segments">
                    {result.estimate.segments.map((segment) => (
                      <span key={segment.label}>
                        <RubyText text={`${segment.label}：${segment.time.toFixed(1)}秒`} />
                      </span>
                    ))}
                  </div>
                )}

                <div className="estimate-result-breakdown">
                  {ESTIMATE_MEMO_FIELDS.map((field) => (
                    <div key={field.key}>
                      <strong><RubyText text={field.label} /></strong>
                      <span>
                        <RubyText text={`メモ ${result.estimate.memo[field.key]}マス`} />
                      </span>
                      <span>
                        <RubyText
                          text={`実際 ${result.estimate.breakdown[field.key].count}マス・${result.estimate.breakdown[field.key].time.toFixed(1)}秒`}
                        />
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="result-buttons">
              <button
                aria-label="ステージ一覧を開く"
                title="ステージ一覧"
                onClick={openStageSelect}
              >
                <StageListIcon />
              </button>
              <button
                aria-label="このステージをもう一度遊ぶ"
                title="もう一度遊ぶ"
                onClick={() => startStage(selectedStage)}
              >
                ↻
              </button>
              <button
                aria-label="次のステージへ進む"
                title="次のステージ"
                disabled={!nextStageId}
                onClick={() => {
                  if (nextStageId) startStage(nextStageId)
                }}
              >
                ▶︎
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
