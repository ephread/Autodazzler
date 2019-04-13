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

/* global DzFile MessageBox debug */

import { isNullOrUndefined } from './utils';

/**
 * Load the given configuration file.
 *
 * @param {string} sConfigurationPath path to hte configuration file.
 * @returns {object} the loaded configuration as a plain script object.
 */
export function loadConfigurationFile(sConfigurationPath) {
  var oConfigurationFile = new DzFile(sConfigurationPath);

  if (!oConfigurationFile.exists()) {
    MessageBox.critical(
      "The provided configuration doesn't exist.",
      '[Autodazzler] Configuration Error',
      '&OK'
    );

    return null;
  }

  oConfigurationFile.open(oConfigurationFile.ReadOnly);
  var sJsonString = oConfigurationFile.read();

  if (isNullOrUndefined(sJsonString)) {
    MessageBox.critical(
      'Could not read the provided configuration',
      '[Autodazzler] Configuration Error',
      '&OK'
    );

    return null;
  }

  try {
    var oLocalDazzleConfiguration = JSON.parse(sJsonString);
    return oLocalDazzleConfiguration;
  } catch (error) {
    MessageBox.critical(error, '[Autodazzler] Configuration Error', '&OK');
    return null;
  }
}

/**
 * Merge the given configuration with sensible defaults in case they are missing.
 * Be careful, this function both updates the given configuration and returns it.
 *
 * @param {object} oSceneConfiguration the configuration to check.
 *
 * @returns {boolean} the new configuration.
 */
export function updateSceneConfigurationWithDefaults(oSceneConfiguration) {
  var bAbort = oSceneConfiguration.abortOnError;
  oSceneConfiguration.abortOnError = isNullOrUndefined(bAbort) ? false : bAbort;

  return oSceneConfiguration;
}

/**
 * Holds the current context of the step we're in. The structure is used to
 * to report misconfiguration.
 *
 * @param { number } nSceneIndex index of the Scene in the related configuration array
 * @param { number } nRenderIndex index of the Render in the related configuration array
 * @param { boolean } bAbortOnError a optional value indicating whether or not the user
 *                                  expects autodazzler to stop on error;
*                                   defaults to `true`.
 * @param { boolean } bInteractive a optional value indicating whether or autodazzler
 *                                 should display messages (`interative` = `true`);
 *                                 defaults to `true`.
 *
 * @returns { object } An fairly simple object which can output the context through
 *                    `getReadableMessage()`
 */
export function createStepContext(nSceneIndex, nRenderIndex, bAbortOnError, bInteractive) {
  return {
    sceneIndex: nSceneIndex,
    renderIndex: nRenderIndex,
    abortOnError: isNullOrUndefined(bAbortOnError) ? true : bAbortOnError,
    interactive: isNullOrUndefined(bInteractive) ? true : bInteractive,
    getReadableMessage: function getReadableMessage() {
      if (isNullOrUndefined(this.sceneIndex) && isNullOrUndefined(this.renderIndex)) {
        return '';
      }

      var sMessage = '(';

      if (!isNullOrUndefined(this.sceneIndex)) {
        sMessage += 'Scene ' + this.sceneIndex;
      }

      if (!isNullOrUndefined(this.renderIndex)) {
        if (!isNullOrUndefined(this.sceneIndex)) {
          sMessage += ', ';
        }
        sMessage += 'Render ' + this.renderIndex;
      }

      sMessage += ')';

      return sMessage;
    }
  };
}

/**
 * Parse arguments provided to Daz Studio through -scriptArgs.
 * The expected format is `<key>=<value>` with <key> containing only letters
 * and value being either a string (single or double quoted), a number or
 * a bolean (`true` or `false`).
 *
 * @param { number } aScriptArgs an array of arguments retrieved from the
 *                               Studio.
 *
 * @returns { object } An object containg `<key>=<value>` pairs.
 */
export function parseScriptArgs(aScriptArgs) {
  if (aScriptArgs.length == 0) { return null }

  var oParsedArguments = {}
  for (var i = 0; i < aScriptArgs.length; i++) {
    var sArgString = aScriptArgs[i]
    var aMatches = /^([a-zA-Z]+)=(.*)$/g.exec(sArgString)

    if (aMatches && aMatches.length == 3) {
      // Strip quotes if necessary.
      var value = aMatches[2]
      var aStringMatches = /^(?:\"(.*)\")|(?:\'(.*)\')$/g.exec(aMatches[2])
      if (aStringMatches && aStringMatches.length == 3) {
        value = aStringMatches[1] || aStringMatches[2]
      }

      oParsedArguments[aMatches[1]] = value
    } else {
      MessageBox.information(
        'Argument: ' + sArgString + ' is malformed.',
        '[Autodazzler]',
        '&OK'
      );

      return null
    }
  }

  return oParsedArguments
}
