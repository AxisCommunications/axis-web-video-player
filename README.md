# Axis Video as a Service (VaaS) video player

## Overview

The Axis VaaS video player makes it easy to use Axis camera video inside a browser.

## Getting started

### Installation

The Axis VaaS video player is packaged as an npm package published to AxisCommunications github NPM registry.

To access packages from github NPM registry you need to provide a Personal Access Token to NPM. Add the following lines to your `~/.npmrc`:
```sh
@axiscommunications:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<github_personal_access_token>
```

Package can then be installed with:

```sh
npm install @axiscommunications/axis-vaas-video-player
```

### Api reference

See the [API reference](./docs/api/axis-vaas-video-player.md) for detailed information about the classes and interfaces in the Axis VaaS video player.

### Code examples

See the [code examples](./docs/code-examples.md) for examples of how to use the Axis VaaS video player.

### Build and run the example

1. `cp example/.env.local{.template,}`

2. Update `example/.env.local` with your settings
    - Change VITE_VIDEO_ORG_ID to your organization id and VITE_VIDEO_TARGET_ID to your device target id.
    - Change VITE_OIDC_CLIENT_ID and VITE_OIDC_ENDPOINT if you want to use OIDC authentication.
    - Change VITE_AUTH to DPOP and set VITE_DPOP_RESOURCE_ARN to your resource group ARN if you want to use DPoP authentication.

3. `npm install && npm run build && (cd example && npm install)`

4. If you are using DPoP authentication, create the folder `example/cert` and copy your key.pem and cert.pem files to it. Then start the DPoP server in another terminal with the command `(cd example && npm run start-server)`.

5. `npm run example`

6. Open the URL printed by the server in 5. in a web browser.
