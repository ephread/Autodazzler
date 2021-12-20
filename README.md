# ![Autodazzler](https://i.imgur.com/KgX7eIm.jpg)

[![build](https://github.com/ephread/Autodazzler/actions/workflows/build.yml/badge.svg)](https://github.com/ephread/Autodazzler/actions/workflows/build.yml)
[![codebeat badge](https://codebeat.co/badges/0ca53387-6f52-4349-8b41-b02fd7ae0786)](https://codebeat.co/projects/github-com-ephread-autodazzler-master)
[![codecov](https://codecov.io/gh/ephread/Autodazzler/branch/master/graph/badge.svg)](https://codecov.io/gh/ephread/Autodazzler)
[![License](https://img.shields.io/badge/license-GPL-green.svg)](https://github.com/ephread/autodazzler/blob/master/LICENSE.md)

Autodazzler is a small utility to perform batch rendering in Daz Studio.

## Table of contents

  * [Getting Started](#getting-started)
  * [Writing a configuration file](#writing-a-configuration-file)
  	* [Top Level Configuration](#top-level-configuration)
  	* [Scene Configuration](#scene-configuration)
  	* [Render Configuration](#render-configuration)
  * [License](#license)

## Getting Started

Head over the [release section](https://github.com/ephread/Autodazzler/releases) to download a precompiled .dsa file. Open the downloaded file from within Daz Studio.

Upon opening the script, Daz Studio will ask you to locate the appropriate configuration file. It will then perform all the renders defined in the configuration file.

Alternatively, you can run Autodazzler from the command line.

### macOS

```bash
$ <pathToDazStudio.app>/Contents/MacOS/DAZStudio <pathToAutodazzler.dsa> -scriptArg "autodazzlerConfigPath='<pathToConfigurationPath.json>'"
```
For instance, with the default installation path, assuming that both Autodazzler.dsa and the configuration are in the current directory (`/User/ephread/Daz/`), you would need to run:

```bash
$ /Applications/DAZ\ 3D/DAZStudio4\ 64-bit/DAZStudio.app/Contents/MacOS/DAZStudio Autodazzler.dsa -scriptArg "autodazzlerConfigPath='/User/ephread/Daz/config.json'"
```

⚠️ `autodazzlerConfigPath` should be absolute.

### Windows

```powershell
> <pathToDazStudio.exe> <pathToAutodazzler.dsa> -scriptArg "autodazzlerConfigPath='<pathToConfigurationPath.json>'"
```

For instance, with the default installation path and Autodazzler.dsa in the current directory (`C:\Users\ephread\Daz\`), you would need to run:


```powershell
> C:\Programs\DazStudio\DazStudio.exe Autodazzler.dsa -scriptArg "autodazzlerConfigPath='C:/Users/ephread/Daz/config.json'"
```

⚠️ Note that forward slashes should be used in the `-scriptArg` argument.

⚠️ `autodazzlerConfigPath` should be absolute.

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

### Top Level Configuration

- `interactive `: if set to `true` errors, warnings and the completion of the process might trigger popup dialogs; if set to `false`, warning and errors will only be written to the log file.
- `quitAutomatically`: `true` to quit Daz Studio automatically after the render, `false` to keep it alive.

```json
{
    "interactive": false,
    "quitAutomatically": true,
    "scenes": []
}
```

Note that is left unspecified, `interactive` and `quitAutomatically` will be inferred from the context. For instance, if you run Daz Studio from the command line and provide a configuration through `-scriptArg`, `interactive` will be set to `false` and `quitAutomatically` will be set to `true`. Vice versa if you provide the configuration from the dialog box.

You also can't set `quitAutomatically` to `true` if you also set `interactive` to `false`.

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
    "quitAfterCompletion": true,
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

- `cameraName`: (`string`) the name of the camera to use; this parameter is optional, if not specified, Autodazzler will fallback to the camera selected in the scene;
- `renderFilename `: (`string`) the name of the render;
- `presets`: (`array`) contains zero or more of:
    - (`string`) a path pointing a preset that should be applied globally;
    - (`object` / `key: value`) a pair where the value a path pointing a preset and the key is the name of the object to which the preset should be applied; this is typically usueful to change poses between renders;
- `visibilities`: (`object`) an object defining the visibility of the object named by the key and whether the change should be applied to all its children (`"recursive": true`); by default visibility changes won't be recursive (see below for the format).

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
    "visibilities": {
        "Cube 1": { "visible": false },
        "Cube 2": { "visible": true, "recursive": true }
    }
}
```

##### Make the object named `Cube 1` visible

```json
"visibilities": {
    "Cube 1": { "visible": true }
}
```

##### Make the object named `Cube 1` and all of its children invisible

```json
"visibilities": {
    "Cube 1": { "visible": false, "recursive": true }
}
```

## License

Autodazzler is released under the GPL license. See LICENSE for details.

Don't let the GPL put you off, Autodazzler is free and you can use it to create batches for all your commercial rendering at no additional cost.