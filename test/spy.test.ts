import { describe, expect, spyOn, test } from 'vitest'

/**
 * @vitest-environment happy-dom
 */

describe('spyOn', () => {
  test.skip('correctly infers method types', async() => {
    spyOn(localStorage, 'getItem').mockReturnValue('world')
    expect(window.localStorage.getItem('hello')).toEqual('world')
  })
})