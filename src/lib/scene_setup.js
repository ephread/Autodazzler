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

/* global Scene App MainWindow */

import { isNullOrUndefined, showOrLogError } from './utils';

/**
 * Returns the default 3D viewport of the scene if it was found, or null otherwise.
 *
 * @param {object} oStepContext context of the current step we are in.
 *
 * @returns {Dz3DViewport|null} the 3D Viewport or null if it couldn't be found.
 */
export function retrieve3DViewport(oStepContext) {
  var oViewportManager = MainWindow.getViewportMgr();
  var oViewPort = null;
  var o3dViewport = null;

  if (oViewportManager) {
    oViewPort = oViewportManager.getActiveViewport();
  } else {
    showOrLogError("Couldn't load the Viewport Manager.", oStepContext);
    return null;
  }

  if (oViewPort) {
    o3dViewport = oViewPort.get3DViewport();
  } else {
    showOrLogError("Couldn't load the default viewport.", oStepContext);
    return null;
  }

  return o3dViewport;
}

/**
 * Loads a scene from the specified .duf.
 *
 * @param {string} sScenePath the path to the scene
 * @param {object} oStepContext context of the current step we are in.
 *                              (should only hold the scene index at this point).
 *
 * @returns {boolean} `true` if the scene was loaded correctly, `false` otherwise.
 */
export function loadScene(sScenePath, oStepContext) {
  if (!App.getContentMgr().openNativeFile(sScenePath, false)) {
    showOrLogError('Could not load scene at: ' + sScenePath, oStepContext);

    return false;
  }

  return true;
}

export function applyPresets(oPresetConfiguration, oStepContext) {
  var nNumberOfErrors = 0;
  for (var i = 0; i < oPresetConfiguration.length; i++) {
    var _presetConfiguration = oPresetConfiguration[i];

    if (typeof _presetConfiguration === 'string' || _presetConfiguration instanceof String) {
      if (!applyGlobalPreset(_presetConfiguration, oStepContext)) {
        nNumberOfErrors++;
      }
    } else if (typeof _presetConfiguration === 'object') {
      var oSinglePresetConfiguration = _presetConfiguration;
      var nodeName = Object.keys(oSinglePresetConfiguration)[0];

      const result = applyPresetToNode(nodeName, oSinglePresetConfiguration[nodeName], oStepContext);
      if (!result) { nNumberOfErrors++; }
    }
  }

  return nNumberOfErrors === 0;
}

export function applyVisibilities(oVisibilityConfiguration, oStepContext) {
  var aKeys = Object.keys(oVisibilityConfiguration);
  var nNumberOfErrors = 0;
  for (var i = 0; i < aKeys.length; i++) {
    var sNodeName = aKeys[i];
    var oNodeVisibilityConfiguration = oVisibilityConfiguration[sNodeName];

    const result = showNode(
      sNodeName, oNodeVisibilityConfiguration.visible,
      oNodeVisibilityConfiguration.recursive, oStepContext
    );

    if (!result) {
      nNumberOfErrors++;
    }
  }

  return nNumberOfErrors === 0;
}

function showNode(sName, bShow, bRecursively, oStepContext) {
  var oNode = Scene.findNodeByLabel(sName);

  if (isNullOrUndefined(oNode)) {
    showOrLogError("The node named '" + sName + "' could not be found in the scene.", oStepContext);
    return false;
  }

  oNode.setVisible(bShow);

  if (bRecursively) {
    var aChildNodes = oNode.getNodeChildren();
    for (var i = 0; i < aChildNodes.length; i++) {
      var oChildNode = aChildNodes[i];

      oChildNode.setVisible(bShow);
    }
  }

  return true;
}

function applyPresetToNode(sName, sPresetPath, oStepContext) {
  Scene.selectAllNodes(false);

  var oNode = Scene.findNodeByLabel(sName);

  if (isNullOrUndefined(oNode)) {
    showOrLogError("The node named '" + sName + "' could not be found in the scene.", oStepContext);
    return false;
  }

  oNode.select(true);
  return applyPreset(sPresetPath, oStepContext);
}

function applyGlobalPreset(sPresetPath, oStepContext) {
  Scene.selectAllNodes(false);
  return applyPreset(sPresetPath, oStepContext);
}

function applyPreset(sPresetPath, oStepContext) {
  var oContentMgr = App.getContentMgr();

  if (!oContentMgr.openFile(sPresetPath, true)) {
    const message = "The presets named '" + sPresetPath + "' could not be loaded.";
    showOrLogError(message, oStepContext);

    return false;
  }

  return true;
}
