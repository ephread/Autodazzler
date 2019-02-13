# ![Autodazzler](https://i.imgur.com/KgX7eIm.jpg)
[![CircleCI](https://circleci.com/gh/ephread/Autodazzler/tree/master.svg?style=shield)](https://circleci.com/gh/ephread/Autodazzler/tree/master)
[![codecov](https://codecov.io/gh/ephread/Autodazzler/branch/master/graph/badge.svg)](https://codecov.io/gh/ephread/Autodazzler)
[![License](https://img.shields.io/badge/license-GPL-green.svg)](https://github.com/ephread/autodazzler/blob/master/LICENSE.md)

Autodazzler is a small utility to perform batch rendering in Daz Studio.

## Table of contents

  * [Getting Started](#getting-started)
  * [Writing a configuration file](#writing-a-configuration-file)
  	* [Scene Configuration](#scene-configuration)
  	* [Render Configuration](#render-configuration)
  * [License](#license)

## Getting Started

Head over the [release section](https://github.com/ephread/Autodazzler/releases) to download a precompiled .dsa file. Open the downloaded file from within Daz Studio.

Upon opening the script, Daz Studio will ask you to locate the appropriate configuration file. It will then perform all the renders defined in the configuration file.

## Writing a configuration file

Autodazzler works in the following way.

1. Load the first scene configuration.
2. Load the first render configuration for the first scene.
3. Perform all the tranformations required by the render configuration, this can involve selecting a specific camera, applying a specific render preset, applying any king of preset to any object in the scene (i. e. pose, position, etc.) and/or changing the visibility of any object in the scene.
4. Render the scene to the given file.
5. Repeat with the next render configuration, until all render for the first scene have been performed.
6. Repeat with the next scene, until all renders have been performed in all specified scenes.

You can configure the renders by supplying a JSON configuration file. A full example is available is the `example/` directory.

The top level object is an array, containing configuration objects for each scene you need to render.

Note that all paths use forward slashes, even if you are working on windows.

### Scene Configuration

- `scenePath`: a string containing the path to the scene
- `renderDirectoryPath`: a string containing the path to the directory in which the render will be saved.
- `abortOnError`: `true` to stop rendering when an error is encountered, `false` to continue rendering next steps.
- `overwrite`: `true` to overwrite pre-existing renders, `false` to emit an error; if `abortOnError` is `true` as well, this will stop all renders for the current scene.
- `renderConfigurations`: an array containing the render configurations.

#### Example

```json
[{
	 "scenePath": "path/to/scene1.duf",
    "renderDirectoryPath": "path/to/renders",
    "abortOnError": false,
    "overwrite": true,
    "renderConfigurations": []
}, {
	 "scenePath": "path/to/scene2.duf",
    "renderDirectoryPath": "path/to/renders",
    "abortOnError": true,
    "overwrite": false,
    "renderConfigurations": []
}]
```

### Render Configuration

- `cameraName`: (`string`) the name of the camera to use;
- `renderFilename `: (`string`) the name of the render;
- `presets`: (`array`) contains zero or more of:
	- (`string`) a path pointing a preset that should be applied globally;
	- (`object` / `key: value`) a pair where the value a path pointing a preset and the key is the name of the object to which the preset should be applied; this is typically usueful to change poses between renders;
- `changeVisibility `: (`object`) an object defining the visibility of the obkject named by the key and whether the change should be applied to all its children (`"recursive": true`); by default visibility changes won't be recursive (see below for the format).

#### Example

```json
{
    "cameraName": "Camera 2",
    "renderFilename": "Cube 2.png",
    "presets": [
        "path/to/RenderPreset.duf",
        { "Cube 1": "path/to/CubePosePreset.duf" }
        { "Cube 2": "path/to/CubePosePreset.duf" }
    ],
    "changeVisibility": {
        "Cube 1": { "visible": false },
        "Cube 2": { "visible": true, "recursive": true }
    }
}
```

##### Make the object named `Cube 1` visible

```json
"changeVisibility": {
    "Cube 1": { "visible": true }
}
```

##### Make the object named `Cube 1` and all of its children invisible

```json
"changeVisibility": {
    "Cube 1": { "visible": false, "recursive": true }
}
```

## License

Autodazzler is released under the GPL license. See LICENSE for details.

Don't let the GPL put you off, Autodazzler is free and you can use it to create batches for all your commercial rendering at no additional cost.