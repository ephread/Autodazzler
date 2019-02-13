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

/* global MessageBox App debug */

/**
 * Pop a modal up explaining the configuration error.
 *
 * @param {string} sMessage the message to display/log.
 * @param {object} oStepContext the context of the current step, used to hint the user
 *                              at the potential error.
 *
 * @returns {void}
 */
export function showConfigurationError(sMessage, oStepContext) {
  var sErrorMessage = sMessage;
  if (oStepContext) {
    sErrorMessage += ' ' + oStepContext.getReadableMessage();
  }

  MessageBox.critical(sErrorMessage, 'Autodazzler Configuration Error', '&OK');
}

/**
 * If `oStepContext.abortOnError` is true, pop a modal up explaining the error.
 * Otherwise, log the error.
 *
 * @param {string} sMessage the message to display/log.
 * @param {object} oStepContext the context of the current step, used to hint the user
 *                              at the potential error.
 *
 * @returns {void}
 */
export function showOrLogError(sMessage, oStepContext) {
  var bWarnUser = true;
  var sErrorMessage = sMessage;

  if (oStepContext) {
    sErrorMessage += ' ' + oStepContext.getReadableMessage();
    sErrorMessage = sErrorMessage.trim();
    bWarnUser = oStepContext.abortOnError;
  }

  if (bWarnUser) {
    MessageBox.critical(sErrorMessage, 'Autodazzler Render Error', '&OK');
  } else {
    debug('[Autodazzler] ' + sErrorMessage);
  }
}

/**
 * Convenience method to test if a variable is either null or undefined.
 */
// TODO: Check which version of ECMA script Dazscript really is based on.
//       This function might simply be redundant with testing for false-ish
//       values through automated conversion.
export function isNullOrUndefined(variable) {
  return variable === null || typeof variable === 'undefined';
}

/**
 * Build the render path from the configuration objects.
 *
 * @param {string} oSceneConfiguration configuration of the current scene.
 * @param {string} oRenderConfiguration configuration of the current render.
 *
 * @returns {string} the path to which save the render.
 */
export function fullRenderPath(oSceneConfiguration, oRenderConfiguration) {
  if (
    isNullOrUndefined(oSceneConfiguration.renderDirectoryPath) ||
    isNullOrUndefined(oRenderConfiguration.renderFilename)
  ) {
    const renderPath = App.getTempPath() + '/' + App.createUuid() + '.png';
    const message =
      "Either 'renderDirectoryPath' or 'renderFilename' is 'undefined' " +
      "returning temporary path: '" +
      renderPath +
      "'.";
    debug(message);

    return renderPath;
  }

  return oSceneConfiguration.renderDirectoryPath + '/' + oRenderConfiguration.renderFilename;
}

/**
 * Turn the given duration into a readable hours, minutes, seconds tring.
 *
 * @param {number} nDuration configuration of the current scene.
 *
 * @returns {string} the duration, in a readable format.
 */
export function millisecondsToReadableTime(nDuration) {
  if (nDuration === 0) {
    return '0 seconds';
  }

  var _hours = parseInt((nDuration / (1000 * 60 * 60)) % 24);
  var _minutes = parseInt((nDuration / (1000 * 60)) % 60);
  var _seconds = parseInt((nDuration / 1000) % 60);

  var hours = '';
  var minutes = '';
  var seconds = '';

  if (_hours > 0) {
    hours = ('0' + _hours).substr(-2, 2) + ' hours ';
  }
  if (_hours > 0 || _minutes > 0) {
    minutes = ('0' + _minutes).substr(-2, 2) + ' minutes ';
  }
  if (_seconds > 0) {
    seconds = ('0' + _seconds).substr(-2, 2) + ' seconds ';
  }

  return (hours + minutes + seconds).trim();
}
