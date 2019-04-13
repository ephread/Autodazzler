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

/* global App DzFileInfo getScriptFileName DzMacAudioClip DzWinAudioClip debug */

/**
 * Plays the success sound.
 * @returns {void}
 */
export function playSuccessSound() {
  playSound('success');
}

/** ***************************************************************** **/
/**
 * Plays the given sound
 *
 * @param {string} sSoundName the name of the sound to play.
 * @returns {void}
 */
function playSound(sSoundName) {
  var nPlatform = App.platform();
  var oCurrentScriptInfo = new DzFileInfo(getScriptFileName());
  var sResourceDirectoryPath = oCurrentScriptInfo.path() + '/resources/';
  var oAudioClip;

  switch (nPlatform) {
  case App.MacOSX:
    oAudioClip = new DzMacAudioClip();
    break;
  case App.Windows:
    oAudioClip = new DzWinAudioClip();
    break;
  default:
    debug('[Autodazzler] Unknown platform, ignoring…');
    return;
  }

  switch (sSoundName) {
  case 'success':
    oAudioClip.openFile(sResourceDirectoryPath + 'success.wav');
    oAudioClip.play();
    break;
  default:
    debug('[Autodazzler] Unknown sound file, ignoring…');
  }
}
