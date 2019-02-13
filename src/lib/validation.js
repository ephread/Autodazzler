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

/* global DzFileInfo */

import { showConfigurationError, isNullOrUndefined, fullRenderPath } from './utils';
import { createStepContext } from './configuration';

export function isConfigurationValid(oAutodazzlerConfiguration) {
  if (!(oAutodazzlerConfiguration instanceof Array) || oAutodazzlerConfiguration.length === 0) {
    showConfigurationError('The configuration file did not contain any definitions.', null);
    return false;
  }

  for (var i = 0; i < oAutodazzlerConfiguration.length; i++) {
    var oSceneStepContext = createStepContext(i, null, true);
    var oSceneConfiguration = oAutodazzlerConfiguration[i];

    if (!isSceneConfigurationValid(oSceneConfiguration, oSceneStepContext)) {
      return false;
    }

    for (var j = 0; j < oSceneConfiguration.renderConfigurations.length; j++) {
      var oRenderStepContext = createStepContext(i, j, true);
      var oRenderConfiguration = oSceneConfiguration.renderConfigurations[j];

      if (
        !isRenderConfigurationValid(oRenderConfiguration, oSceneConfiguration, oRenderStepContext)
      ) {
        return false;
      }
    }
  }

  return true;
}

/** ***************************************************************** **/
/**
 * Checks that the given scene configuration is valid.
 *
 * @param {object} oSceneConfiguration the configuration to check.
 * @param {object} oStepContext the context of the current step.
 *
 * @returns {boolean} true if the configuration is valid, `false` otherwise.
 */
function isSceneConfigurationValid(oSceneConfiguration, oStepContext) {
  if (isNullOrUndefined(oSceneConfiguration.scenePath)) {
    showConfigurationError('`scenePath` is not defined.', oStepContext);

    return false;
  }

  var sSceneFileInfo = DzFileInfo(oSceneConfiguration.scenePath);
  if (!sSceneFileInfo.exists()) {
    const message = "Scene does not exist at '" + oSceneConfiguration.scenePath + "'.";
    showConfigurationError(message, oStepContext);

    return false;
  }

  if (isNullOrUndefined(oSceneConfiguration.renderDirectoryPath)) {
    showConfigurationError('`renderDirectoryPath` is not defined.', oStepContext);

    return false;
  }

  var oRenderDirectoryInfo = DzFileInfo(oSceneConfiguration.renderDirectoryPath);
  if (!(oRenderDirectoryInfo.exists() && oRenderDirectoryInfo.isDir())) {
    const message =
      "The render directory '" + oSceneConfiguration.renderDirectoryPath + "' does not exist.";
    showConfigurationError(message, oStepContext);

    return false;
  }

  if (isNullOrUndefined(oSceneConfiguration.renderConfigurations)) {
    showConfigurationError('`renderConfigurations` is not defined.', oStepContext);

    return false;
  }

  if (
    !(oSceneConfiguration.renderConfigurations instanceof Array) ||
    oSceneConfiguration.renderConfigurations.length === 0
  ) {
    const message = "`renderConfigurations` doesn't contain valid definitions.";
    showConfigurationError(message, oStepContext);

    return false;
  }

  return true;
}

/** ***************************************************************** **/
/**
 * Checks that the given render configuration is valid.
 *
 * @param {object} oRenderConfiguration the configuration to check.
 * @param {object} oSceneConfiguration the scene configuration to check against.
 * @param {object} oStepContext the context of the current step.
 *
 * @returns {boolean} true if the configuration is valid, `false` otherwise.
 */
function isRenderConfigurationValid(oRenderConfiguration, oSceneConfiguration, oStepContext) {
  if (isNullOrUndefined(oRenderConfiguration.cameraName)) {
    showConfigurationError('`cameraName` is not a valid string.', oStepContext);

    return false;
  }

  if (isNullOrUndefined(oRenderConfiguration.renderFilename)) {
    showConfigurationError('`renderFilename` is not a valid string.', oStepContext);

    return false;
  }

  if (!oSceneConfiguration.overwrite) {
    var sRenderSavePath = fullRenderPath(oSceneConfiguration, oRenderConfiguration);

    var oRenderSaveFileInfo = DzFileInfo(sRenderSavePath);
    if (oRenderSaveFileInfo.exists()) {
      const message =
        "The render would be saved at '" +
        sRenderSavePath +
        "', but there is already a file there. To allow overwriting files," +
        'set `overwrite` to `true`.';
      showConfigurationError(message, oStepContext);

      return false;
    }
  }

  if (
    !isNullOrUndefined(oRenderConfiguration.presets) &&
    !isPresetConfigurationValid(oRenderConfiguration.presets, oStepContext)
  ) {
    return false;
  }

  if (
    !isNullOrUndefined(oRenderConfiguration.visibilities) &&
    !isVisibilityConfigurationValid(oRenderConfiguration.visibilities, oStepContext)
  ) {
    return false;
  }

  return true;
}

function isPresetConfigurationValid(oPresetConfiguration, oStepContext) {
  if (!(oPresetConfiguration instanceof Array)) {
    showConfigurationError('`presets` must be an Array.', oStepContext);

    return false;
  }

  for (var i = 0; i < oPresetConfiguration.length; i++) {
    var _presetConfiguration = oPresetConfiguration[i];

    if (isNullOrUndefined(_presetConfiguration)) {
      showConfigurationError('Preset cannot be null or undefined.', oStepContext);
      return false;
    }

    if (typeof _presetConfiguration === 'string' || _presetConfiguration instanceof String) {
      if (!checkThatPresetExists(_presetConfiguration)) {
        return false;
      }
    } else if (typeof _presetConfiguration === 'object') {
      var oSinglePresetConfiguration = _presetConfiguration;

      var aKeys = Object.keys(oSinglePresetConfiguration);
      if (aKeys.length !== 1) {
        const message =
          'Invalid number of keys in preset at index ' + i + '. ' + 'Only one key is allowed';
        showConfigurationError(message, oStepContext);
        return false;
      }

      var node = aKeys[0];
      if (!checkThatPresetExists(oSinglePresetConfiguration[node])) {
        return false;
      }
    }
  }

  return true;
}

function isVisibilityConfigurationValid(oVisibilityConfiguration, oStepContext) {
  if (!(typeof oVisibilityConfiguration === 'object')) {
    showConfigurationError('`visibilities` must be an Object.', oStepContext);

    return false;
  }

  var aKeys = Object.keys(oVisibilityConfiguration);
  for (var i = 0; i < aKeys.length; i++) {
    var sKey = aKeys[i];
    var oNodeVisibilityConfiguration = oVisibilityConfiguration[sKey];

    if (!(typeof oNodeVisibilityConfiguration === 'object')) {
      const message =
        'Visibility configuration value at key `' + sKey + '` ' + 'must be an Object.';
      showConfigurationError(message, oStepContext);

      return false;
    }

    var aVisibilityKeys = Object.keys(oNodeVisibilityConfiguration);
    if (aVisibilityKeys.length === 0) {
      const message = "No parameters found for the visibility of '" + sKey + "'.";
      showConfigurationError(message, oStepContext);
      return false;
    }

    if (!oNodeVisibilityConfiguration.hasOwnProperty('visible')) {
      const message =
        'Visibility configuration value at key `' +
        sKey +
        '` ' +
        'must contains a `visible` property.';
      showConfigurationError(message, oStepContext);

      return false;
    }
  }

  return true;
}

function checkThatPresetExists(sPreset, oStepContext) {
  var oPresetInfo = DzFileInfo(sPreset);

  if (!oPresetInfo.exists()) {
    showConfigurationError("The preset '" + sPreset + "' does not exist.", oStepContext);

    return false;
  }

  return true;
}
