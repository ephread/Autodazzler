// Autodazzler - Batch render for Daz Studio
// Copyright (c) 2018-present Frédéric Maquin <fred@ephread.com>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

/* global jest it expect describe beforeEach */

import {
  isNullOrUndefined, millisecondsToReadableTime, showOrLogError,
  showConfigurationError, fullRenderPath
} from '../src/lib/utils.js'

import { createStepContext } from '../src/lib/configuration.js'

const spyMessageBoxCritical = jest.fn()
const spyDebug = jest.fn()

global.MessageBox = {
  critical: spyMessageBoxCritical
}

global.App = {
  getTempPath: function () { return '/path/to/render/' },
  createUuid: function () { return '0c04439f-4bb8-455c-8317-16d2cce75f00' }
}

global.debug = spyDebug

describe('isNullOrUndefined', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns what it's supposed to return", () => {
    expect(isNullOrUndefined(null)).toBeTruthy()
    expect(isNullOrUndefined(undefined)).toBeTruthy()
    expect(isNullOrUndefined(0)).toBeFalsy()
    expect(isNullOrUndefined('')).toBeFalsy()
  })
})

describe('millisecondsToReadableTime', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns what it's supposed to return", () => {
    expect(millisecondsToReadableTime(0)).toEqual('0 seconds')
    expect(millisecondsToReadableTime(25000)).toEqual('25 seconds')
    expect(millisecondsToReadableTime(85000)).toEqual('01 minutes 25 seconds')
    expect(millisecondsToReadableTime(60000)).toEqual('01 minutes')
    expect(millisecondsToReadableTime(7285000)).toEqual('02 hours 01 minutes 25 seconds')
    expect(millisecondsToReadableTime(7225000)).toEqual('02 hours 00 minutes 25 seconds')
  })
})

describe('showConfigurationError', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses MessageBox', () => {
    showConfigurationError('Error', undefined)
    expect(spyMessageBoxCritical.mock.calls.length).toBe(1)
    expect(spyMessageBoxCritical.mock.calls[0][0]).toBe('Error')
  })

  it('displays the step context indices when they are defined', () => {
    const oStepContext = createStepContext(0, 0, true)
    const sErrorMessage = 'Error ' + oStepContext.getReadableMessage()

    showConfigurationError('Error', oStepContext)
    expect(spyMessageBoxCritical.mock.calls.length).toBe(1)
    expect(spyMessageBoxCritical.mock.calls[0][0]).toBe(sErrorMessage)
  })
})

describe('showOrLogError', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses MessageBox is context is undefined', () => {
    showOrLogError('ERROR', undefined, true)
    expect(spyMessageBoxCritical.mock.calls.length).toBe(1)
    expect(spyMessageBoxCritical.mock.calls[0][0]).toBe('ERROR')
  })

  it('uses MessageBox if context requires it', () => {
    const oStepContext = createStepContext(0, 0, true)

    showOrLogError('ERROR', oStepContext)
    expect(spyMessageBoxCritical.mock.calls.length).toBe(1)
    expect(spyMessageBoxCritical.mock.calls[0][0]).toBe('ERROR (Scene 0, Render 0)')
  })

  it('uses debug if context requires it', () => {
    const oStepContext = createStepContext(0, 0, false)

    showOrLogError('ERROR', oStepContext)
    expect(spyDebug.mock.calls.length).toBe(1)
    expect(spyDebug.mock.calls[0][0]).toBe('[Autodazzler] ERROR (Scene 0, Render 0)')
  })

  it('outputs the step context indices', () => {
    const oStepContext1 = createStepContext(undefined, undefined)
    const oStepContext2 = createStepContext(0, undefined)
    const oStepContext3 = createStepContext(undefined, 0)
    const oStepContext4 = createStepContext(0, 0)

    showOrLogError('ERROR', oStepContext1)
    expect(spyMessageBoxCritical.mock.calls[0][0]).toBe('ERROR')

    showOrLogError('ERROR', oStepContext2)
    expect(spyMessageBoxCritical.mock.calls[1][0]).toBe('ERROR (Scene 0)')

    showOrLogError('ERROR', oStepContext3)
    expect(spyMessageBoxCritical.mock.calls[2][0]).toBe('ERROR (Render 0)')

    showOrLogError('ERROR', oStepContext4)
    expect(spyMessageBoxCritical.mock.calls[3][0]).toBe('ERROR (Scene 0, Render 0)')
  })
})

describe('fullRenderPath', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns defaultPath if `renderDirectoryPath` is undefined', () => {
    const path = fullRenderPath({ }, {
      renderFilename: 'test.png'
    })

    expect(spyDebug.mock.calls.length).toBe(1)
    expect(path).toEqual('/path/to/render//0c04439f-4bb8-455c-8317-16d2cce75f00.png')
  })

  it('returns defaultPath if `renderFilename` is undefined', () => {
    const path = fullRenderPath({
      renderDirectoryPath: '/test/'
    }, { })

    expect(spyDebug.mock.calls.length).toBe(1)
    expect(path).toEqual('/path/to/render//0c04439f-4bb8-455c-8317-16d2cce75f00.png')
  })

  it('returns defaultPath if the parameters are incorrect', () => {
    const path = fullRenderPath({ }, { })

    expect(spyDebug.mock.calls.length).toBe(1)
    expect(path).toEqual('/path/to/render//0c04439f-4bb8-455c-8317-16d2cce75f00.png')
  })

  it('returns correct path', () => {
    const path = fullRenderPath({
      renderDirectoryPath: '/test/'
    }, {
      renderFilename: 'test.png'
    })

    expect(spyDebug.mock.calls.length).toBe(0)
    expect(path).toEqual('/test//test.png')
  })
})
