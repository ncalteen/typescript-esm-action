import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import * as octokitGraphql from '../__fixtures__/octokit-graphql.js'
import * as octokit from '../__fixtures__/octokit.js'

// Mock the @actions/toolkit packages used by main.ts
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@octokit/graphql', () => octokitGraphql)
jest.unstable_mockModule('@octokit/rest', async () => {
  // This needs to return the class itself, and potentially support plugins,
  // e.g. @octokit/plugin-throttling
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  class Octokit {
    static plugin: () => typeof Octokit

    constructor() {
      return octokit
    }
  }

  // The plugin method can just return the base class
  Octokit.plugin = () => Octokit

  return {
    Octokit
  }
})

// Imports must be done dynamically to allow the mocks to be applied
// See: https://jestjs.io/docs/ecmascript-modules#module-mocking-in-esm
const main = await import('../src/main.js')
const { Octokit } = await import('@octokit/rest')
const { graphql } = await import('@octokit/graphql')

// Create an instance of the mocked Octokit client. This is used for test
// assertions and mocking return values.
const mocktokitRest = jest.mocked(new Octokit())
const mocktokitGraphql = jest.mocked(graphql)

// Regular expression to match a time string in the format HH:MM:SS
const timeRegex = /^\d{2}:\d{2}:\d{2}/

describe('main.ts', () => {
  beforeAll(() => {
    // Set a return value for the GraphQL call
    mocktokitRest.graphql.mockResolvedValue({
      viewer: {
        login: 'test-user'
      }
    })

    mocktokitGraphql.mockResolvedValue({
      viewer: {
        login: 'test-user-graphql'
      }
    } as never)
  })

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
    expect(core.info).toHaveBeenNthCalledWith(1, 'Hello, test-user!')
    expect(core.info).toHaveBeenNthCalledWith(2, 'Hello, test-user-graphql!')
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      'time',
      expect.stringMatching(timeRegex)
    )

    // Verify the API calls were made with the mocked clients
    expect(mocktokitRest.graphql).toHaveBeenCalledWith(
      expect.stringMatching(/query {/)
    )
    expect(mocktokitGraphql).toHaveBeenCalledWith(
      expect.stringMatching(/query {/)
    )
  })

  it('Sets a failed status', async () => {
    // Set an invalid value for the milliseconds input
    core.getInput.mockReturnValue('this is not a number')

    await main.run()

    // Verify that all of the core library functions were called correctly
    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      'milliseconds not a number'
    )
  })
})
