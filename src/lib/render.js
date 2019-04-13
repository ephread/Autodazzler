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

/* global Scene App debug sleep */

import {
  isNullOrUndefined,
  showOrLogError,
  fullRenderPath,
  millisecondsToReadableTime
} from './utils';
import {
  updateSceneConfigurationWithDefaults,
  createStepContext
} from './configuration';
import {
  loadScene,
  retrieve3DViewport,
  applyPresets,
  applyVisibilities
} from './scene_setup';
import { askUserIfTheyWantToStopAutodazzler } from './ui';
import { canWriteRenderFile } from './validation';

export const TaskResult = {
  Completed: 1,
  Failed: 2,
  FailedSilently: 3,
  Aborted: 4,
  NotStarted: 5
};

/**
 * Perform all requested renders for all scenes specified in `oAutodazzlerConfiguration`.
 *
 * @param {Object} oAutodazzlerConfiguration the main configuration to read.
 * @param {Object} bIsTestModeActive true to enable test mode.
 * @returns {TaskResult} the appropriate task result.
 */
export function renderScenes(oAutodazzlerConfiguration, bIsTestModeActive) {
  var nNumberOfError = 0;

  for (var i = 0; i < oAutodazzlerConfiguration.length; i++) {
    var oSceneConfiguration = oAutodazzlerConfiguration[i];
    var oSceneStepContext = createStepContext(
      i,
      null,
      oSceneConfiguration.abortOnError,
      oSceneConfiguration.interactive
    );
    oSceneConfiguration = updateSceneConfigurationWithDefaults(
      oSceneConfiguration
    );

    if (!loadScene(oSceneConfiguration.scenePath, oSceneStepContext)) {
      nNumberOfError++;

      if (oSceneConfiguration.abortOnError) {
        return TaskResult.NotStarted;
      }

      continue;
    }

    var o3dViewport = retrieve3DViewport(oSceneStepContext);

    if (!o3dViewport) {
      showOrLogError(
        "Couldn't load the default 3D viewport.",
        oSceneStepContext
      );
      nNumberOfError++;
      if (oSceneConfiguration.abortOnError) {
        return TaskResult.NotStarted;
      }

      continue;
    }

    for (var j = 0; j < oSceneConfiguration.renderConfigurations.length; j++) {
      var oRenderStepContext = createStepContext(
        i,
        j,
        oSceneConfiguration.abortOnError,
        oSceneConfiguration.interactive
      );
      var oRenderConfiguration = oSceneConfiguration.renderConfigurations[j];

      var result = renderUsingConfigurations(
        oSceneConfiguration,
        oRenderConfiguration,
        oRenderStepContext,
        o3dViewport,
        bIsTestModeActive
      );

      switch (result) {
      case TaskResult.NotStarted:
        nNumberOfError++;

        if (oSceneConfiguration.abortOnError) {
          return TaskResult.NotStarted;
        }

        continue;
      case TaskResult.Failed:
        nNumberOfError++;

        if (oSceneConfiguration.abortOnError) {
          return TaskResult.Failed;
        }

        if (askUserIfTheyWantToStopAutodazzler()) {
          return TaskResult.Aborted;
        }

        continue;
      default:
        break;
      }
    }
  }

  return nNumberOfError > 0 ? TaskResult.FailedSilently : TaskResult.Completed;
}

/** ***************************************************************** **/
/**
 * Perform all renders specified in the given render configuration.
 *
 * @param {Object} oSceneConfiguration configuration for the scen in which this render takes place.
 * @param {Object} oRenderConfiguration configuration of the current render.
 * @param {Object} oStepContext curent step context.
 * @param {Dz3DViewport} o3dViewport 3D viewport to use.
 * @param {boolean} bIsTestModeActive true to enable test mode.
 *
 * @returns {number} the result of the render (TaskResult).
 */
function renderUsingConfigurations(
  oSceneConfiguration,
  oRenderConfiguration,
  oStepContext,
  o3dViewport,
  bIsTestModeActive
) {
  var startTime = Date.now();
  var oRenderMgr = App.getRenderMgr();

  if (!isNullOrUndefined(oRenderConfiguration.presets)) {
    if (
      !applyPresets(
        oRenderConfiguration.presets,
        oStepContext,
        oSceneConfiguration.abortOnError
      )
    ) {
      return TaskResult.NotStarted;
    }
  }

  if (!isNullOrUndefined(oRenderConfiguration.visibilities)) {
    if (
      !applyVisibilities(
        oRenderConfiguration.visibilities,
        oStepContext,
        oSceneConfiguration.abortOnError
      )
    ) {
      return TaskResult.NotStarted;
    }
  }

  Scene.update();

  if (oRenderConfiguration.cameraName) {
    var oCamera = Scene.findCameraByLabel(oRenderConfiguration.cameraName);

    if (isNullOrUndefined(oCamera)) {
      const message =
        "The camera named '" +
        oRenderConfiguration.cameraName +
        "' wasn't found in the scene.";
      showOrLogError(message, oStepContext);

      return TaskResult.NotStarted;
    }

    o3dViewport.setCamera(oCamera);
  }

  var sTargetFilename = fullRenderPath(
    oSceneConfiguration,
    oRenderConfiguration
  );

  if (!bIsTestModeActive) {
    var oRenderOptions = App.getRenderMgr().getRenderOptions()
    oRenderOptions.renderImgFilename = sTargetFilename
    oRenderOptions.renderImgToId = oRenderOptions.DirectToFile

    var bCanWrite = canWriteRenderFile(oRenderConfiguration, oSceneConfiguration, oStepContext, false)
    if (!bCanWrite) {
      return TaskResult.Failed;
    }

    if (oSceneConfiguration.overwrite) {
      var oFile = new DzFileInfo(sTargetFilename);
      if (oFile.exists()) {
        if (oFile.isDir()) {
          const message =
            'Autodazzler will not overwrite a directory, aborting the current render.';
          showOrLogError(message, oStepContext);
          return TaskResult.Failed;
        } else {
          oFile.remove()
        }
      }
    }

    if (!oRenderMgr.doRender(oRenderOptions)) {
      if (oSceneConfiguration.abortOnError) {
        const message =
          'The render was either canceled or encountered an error. ' +
          'Autodazzler will stop.';
        showOrLogError(message, oStepContext);
      }

      return TaskResult.Failed;
    }

    var endTime = Date.now();
    var elapsedTime = millisecondsToReadableTime(endTime - startTime);

    debug(
      '[Autodazzler] Render ' +
        oStepContext.getReadableMessage() +
        ' completed in: ' +
        elapsedTime +
        '.'
    );
  }

  return TaskResult.Completed;
}
