import test from 'node:test'
import assert from 'node:assert/strict'
import {
  countPlacedFastRails,
  getFastRailSavings,
  getFastRailSavingsMessage,
  getFastRailSavingsRank,
  isWithinTargetTime,
} from './fastRailSavings.js'

const rails = (fastCount) => [
  ...Array.from({ length: fastCount }, (_, index) => ({
    x: index,
    y: 0,
    type: 'fast',
  })),
  { x: 99, y: 99, type: 'slow' },
]

test('盤面上の高速レールを経路外も含めて数える', () => {
  const placedRails = [
    { x: 1, y: 0, type: 'fast', includedInRoute: true },
    { x: 7, y: 7, type: 'fast', includedInRoute: false },
    { x: 2, y: 0, type: 'slow', includedInRoute: true },
  ]

  assert.equal(countPlacedFastRails(placedRails), 2)
})

test('目標時間ぴったりと目標時間より早い到着をクリアにする', () => {
  assert.equal(isWithinTargetTime(5, 5), true)
  assert.equal(isWithinTargetTime(4.5, 5), true)
  assert.equal(isWithinTargetTime(5.5, 5), false)
  assert.equal(isWithinTargetTime(4.5, 5, false), false)
})

test('上限4本をすべて配置したクリアでは節約評価を付けない', () => {
  const result = getFastRailSavings({
    maxHighSpeedRails: 4,
    minimumRequiredHighSpeedRails: 2,
    placedRails: rails(4),
    cleared: isWithinTargetTime(5, 5),
    savingsEligible: true,
  })

  assert.equal(result.placedHighSpeedRails, 4)
  assert.equal(result.savedHighSpeedRails, 0)
  assert.equal(result.savingsRating, null)
  assert.equal(result.savingsMark, '')
  assert.equal(result.savingsAwarded, false)
  assert.equal(getFastRailSavingsMessage(result), '')
})

test('最小本数ではないが余らせたクリアでは◎を評価する', () => {
  const result = getFastRailSavings({
    maxHighSpeedRails: 4,
    minimumRequiredHighSpeedRails: 2,
    placedRails: rails(3),
    cleared: isWithinTargetTime(5, 5),
    savingsEligible: true,
  })

  assert.equal(result.savedHighSpeedRails, 1)
  assert.equal(result.savingsRating, 'saved')
  assert.equal(result.savingsMark, '◎')
  assert.equal(result.savingsAwarded, true)
  assert.equal(
    getFastRailSavingsMessage(result),
    '追加評価：◎ 高速レールを節約！ 残り1本',
  )
})

test('最小本数でクリアした場合は☆を評価する', () => {
  const result = getFastRailSavings({
    maxHighSpeedRails: 4,
    minimumRequiredHighSpeedRails: 2,
    placedRails: rails(2),
    cleared: isWithinTargetTime(4.5, 5),
    savingsEligible: true,
  })

  assert.equal(result.savedHighSpeedRails, 2)
  assert.equal(result.savingsRating, 'minimum')
  assert.equal(result.savingsMark, '☆')
  assert.equal(result.savingsAwarded, true)
  assert.equal(
    getFastRailSavingsMessage(result),
    '追加評価：☆ 最小本数でクリア！',
  )
})

test('上限すべてが最小本数のステージでは全使用でも☆を評価する', () => {
  const result = getFastRailSavings({
    maxHighSpeedRails: 4,
    minimumRequiredHighSpeedRails: 4,
    placedRails: rails(4),
    cleared: isWithinTargetTime(5, 5),
    savingsEligible: true,
  })

  assert.equal(result.savedHighSpeedRails, 0)
  assert.equal(result.savingsRating, 'minimum')
  assert.equal(result.savingsMark, '☆')
  assert.equal(getFastRailSavingsRank(result.savingsRating), 2)
})

test('未クリアでは高速レールが残っていても節約評価を付けない', () => {
  const result = getFastRailSavings({
    maxHighSpeedRails: 4,
    minimumRequiredHighSpeedRails: 2,
    placedRails: rails(3),
    cleared: isWithinTargetTime(5.5, 5),
    savingsEligible: true,
  })

  assert.equal(result.savedHighSpeedRails, 1)
  assert.equal(result.savingsRating, null)
  assert.equal(result.savingsAwarded, false)
  assert.equal(getFastRailSavingsMessage(result), '')
})

test('指定時間以内ステージ以外ではクリアしても評価を付けない', () => {
  const result = getFastRailSavings({
    maxHighSpeedRails: 4,
    minimumRequiredHighSpeedRails: 0,
    placedRails: rails(0),
    cleared: true,
    savingsEligible: false,
  })

  assert.equal(result.savedHighSpeedRails, 4)
  assert.equal(result.savingsRating, null)
  assert.equal(result.savingsAwarded, false)
})

test('リトライ時は空の盤面から再計算し、前回の配置数を引き継がない', () => {
  const firstAttempt = getFastRailSavings({
    maxHighSpeedRails: 4,
    minimumRequiredHighSpeedRails: 2,
    placedRails: rails(3),
    cleared: true,
    savingsEligible: true,
  })
  const retriedAttempt = getFastRailSavings({
    maxHighSpeedRails: 4,
    minimumRequiredHighSpeedRails: 2,
    placedRails: [],
    cleared: true,
    savingsEligible: true,
  })

  assert.equal(firstAttempt.placedHighSpeedRails, 3)
  assert.equal(retriedAttempt.placedHighSpeedRails, 0)
  assert.equal(retriedAttempt.savedHighSpeedRails, 4)
})
