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
