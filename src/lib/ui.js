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

/* global FileDialog DzBasicDialog DzLabel DzTimer connect processEvents */

/**
 * Display a dialog requesting the user to provide a configuration file.
 *
 * @returns {string|null} the path to the configuration file, or
 *                        null if the dialog was cancelled.
 */
export function askForConfigurationFilePath() {
  return FileDialog.doFileDialog(
    true,
    'Please provide a configuration file to Autodazzler.',
    '',
    'JSON files (*.json)'
  );
}

export function askUserIfTheyWantToStopAutodazzler() {
  const dialogDuration = 15;

  var text =
    'Autodazzler could not complete the render. If you manually canceled the ' +
    'render and wish to cancel all subsequent render, press the button below. ' +
    'Otherwise, this dialog will close in %1 seconds, and the renders will ' +
    'carry on.';

  var wQueryDialog = new DzBasicDialog();
  var oDialogWidget = wQueryDialog.getWidget();

  wQueryDialog.caption = 'Autodazzler render error';
  oDialogWidget.objectName = 'AD_ConfigurationDialog';

  var wLabel = new DzLabel(wQueryDialog);
  wLabel.whatsThis = text.arg(dialogDuration);
  wLabel.alignment = wLabel.AlignVCenter;
  wLabel.wordWrap = true;

  wQueryDialog.addWidget(wLabel);

  var sizeHint = oDialogWidget.minimumSizeHint;
  wQueryDialog.setFixedWidth(sizeHint.width + 100);

  // Set the text on the accept button
  wQueryDialog.setAcceptButtonText('&Cancel all renders');
  // Hide the cancel button
  wQueryDialog.showCancelButton(false);

  var counter = dialogDuration * 1000;
  var textUpdaterTimer = new DzTimer();
  textUpdaterTimer.singleShot = false;
  textUpdaterTimer.interval = 500;
  connect(
    textUpdaterTimer,
    'timeout()',
    function updateTimer() {
      processEvents();
      wLabel.text = text.arg(Math.floor(counter / 1000));
      counter -= 500;
    }
  );
  textUpdaterTimer.start();

  var timer = new DzTimer();
  timer.singleShot = true;
  timer.interval = dialogDuration * 1000;
  connect(
    timer,
    'timeout()',
    function closeDialog() {
      wQueryDialog.close();
    }
  );
  timer.start();

  if (wQueryDialog.exec()) {
    return true;
  }

  return false;

  // eslint-disable-next-line no-unreachable
  textUpdaterTimer.stop();
  // eslint-disable-next-line no-unreachable
  if (counter === 0) {
    return false;
  }
}
