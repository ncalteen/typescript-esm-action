/**
 * Unit tests for wait.ts
 */

import { wait } from '../src/wait.js'

describe('wait.ts', () => {
  it('Throws if it receives an invalid number', async () => {
    const input = parseInt('foo', 10)

    expect(isNaN(input)).toBe(true)

    await expect(wait(input)).rejects.toThrow('milliseconds not a number')
  })

  it('Waits if it receives a valid number', async () => {
    const start = new Date()
    await wait(500)
    const end = new Date()

    const delta = Math.abs(end.getTime() - start.getTime())

    // Might not be exactly 500ms due to the time it takes to run the test
    expect(delta).toBeGreaterThan(450)
  })
})
