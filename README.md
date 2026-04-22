# Axis Web Video Player

## Overview

The Axis Web Video Player makes it easy to use Axis camera video inside a browser.

## Getting started

### Installation

The Axis Web Video Player is packaged as an npm package published to AxisCommunications github NPM registry.

To access packages from github NPM registry you need to provide a Personal Access Token to NPM. Add the following lines to your `~/.npmrc`:
```sh
@axiscommunications:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<github_personal_access_token>
```

Package can then be installed with:

```sh
npm install @axiscommunications/axis-web-video-player
```

### Api reference

See the [API reference](https://github.com/AxisCommunications/axis-web-video-player/blob/main/docs/api/axis-web-video-player.md) for detailed information about the classes and interfaces in the Axis Web Video Player.

### Code example

See the [code example](https://github.com/AxisCommunications/axis-web-video-player/blob/main/example/README.md) for a basic example on how to use the Axis Web Video Player.

### Build and run the example

1. `cp example/.env.local{.template,}`

2. Update `example/.env.local` with your settings
    - Change VITE_VIDEO_ORG_ID to your organization id and VITE_VIDEO_TARGET_ID to your device target id.
    - Change VITE_OIDC_CLIENT_ID and VITE_OIDC_ENDPOINT.

3. `npm install && npm run build && (cd example && npm install)`

4. `npm run example`

5. Open the URL printed by the server in 4. in a web browser.
