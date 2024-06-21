/**
 * Unit tests for the action's main functionality
 */

import { jest } from '@jest/globals'

// Mock the @actions/core library used in main.ts
jest.mock('@actions/core', () => {
  const actual: typeof import('@actions/core') =
    jest.requireActual('@actions/core')

  return {
    ...actual,
    getInput: jest.fn(),
    setOutput: jest.fn(),
    setFailed: jest.fn(),
    debug: jest.fn()
  }
})

// Imports must be done dynamically to allow the mocks to be applied
// See: https://jestjs.io/docs/ecmascript-modules#module-mocking-in-esm
const core = await import('@actions/core')
const main = await import('../src/main.js')

// Regular expression to match a time string in the format HH:MM:SS
const timeRegex = /^\d{2}:\d{2}:\d{2}/

describe('main.ts', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Sets the time output', async () => {
    // Set a valid value for the milliseconds input
    jest.mocked(core.getInput).mockReturnValue('500')

    await main.run()

    // Verify that all of the core library functions were called correctly
    expect(core.debug).toHaveBeenNthCalledWith(
      1,
      'Waiting 500 milliseconds ...'
    )
    expect(core.debug).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(timeRegex)
    )
    expect(core.debug).toHaveBeenNthCalledWith(
      3,
      expect.stringMatching(timeRegex)
    )
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      'time',
      expect.stringMatching(timeRegex)
    )
  })

  it('Sets a failed status', async () => {
    // Set an invalid value for the milliseconds input
    jest.mocked(core.getInput).mockReturnValue('this is not a number')

    await main.run()

    // Verify that all of the core library functions were called correctly
    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      'milliseconds not a number'
    )
  })
})
