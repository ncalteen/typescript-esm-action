import * as core from '@actions/core'
import type { User } from '@octokit/graphql-schema'
import { Octokit } from '@octokit/rest'
import { wait } from './wait.js'

/**
 * The main function for the action
 */
export async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` env var is true
    core.debug(`Waiting ${ms} milliseconds ...`)

    // Log the current timestamp, wait, then log the new timestamp
    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    })
    const response: { viewer: User } = await octokit.graphql(
      `query {
        viewer {
          login
        }
      }`
    )
    core.info(`Hello, ${response.viewer.login}!`)

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
