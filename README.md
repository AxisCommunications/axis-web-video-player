*©2026 Axis Communications AB. AXIS COMMUNICATIONS, AXIS, ARTPEC and VAPIX are registered trademarks of Axis AB in various jurisdictions. All other trademarks are the property of their respective owners.*

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

See the [API reference](./docs/api/axis-web-video-player.md) for detailed information about the classes and interfaces in the Axis Web Video Player.

### Code example

See the [code example](./example/README.md) for a basic example on how to use the Axis Web Video Player.

### WebAssembly binary, bundling and CSP

The published npm package built from this repository includes a WebAssembly binary that contains the vast majority of the application logic. It includes performance-sensitive media features for live and playback functionality as well as Axis-specific signaling protocols (used in WebRTC).
That packaged WebAssembly binary is located in the bundled file `webrtcvideo_bg.wasm`, and it is loaded at runtime by the dependency initialization code.

#### Bundler behavior and path resolution

Internally the published package resolves the wasm URL with `new URL("webrtcvideo_bg.wasm", import.meta.url)` and then fetches it.
This means your build must:

- include the `.wasm` asset in the final output,
- preserve a working URL from the emitted JS to the emitted wasm file,
- serve the wasm file with `Content-Type: application/wasm`.

Usually a modern bundler will do all this for you, but some bundlers may fail to detect or emit wasm assets correctly when dependencies are transformed, externalized, or copied without their adjacent binary files. If you see runtime fetch/404 errors for `webrtcvideo_bg.wasm`, verify the emitted asset path and bundler wasm handling in the npm package build.

The example app in this repository enables wasm handling in Vite via `vite-plugin-wasm` so you can verify the published package behavior in a browser build.

#### Content Security Policy (CSP) requirements

Because the runtime initializes WebAssembly and performs dynamic JS glue operations, your CSP must allow these operations in the page where the player runs.

Use this as a baseline and then tighten it for your deployment:

```http
Content-Security-Policy:
	default-src 'self';
	script-src 'self' 'wasm-unsafe-eval' 'unsafe-eval';
	worker-src 'self';
	connect-src 'self' https: wss:;
```

Notes:

- `connect-src` must include your actual signaling, API, and stream endpoints.
- If your browser baseline does not support `wasm-unsafe-eval`, `unsafe-eval` may still be required.
- If you register the provided service worker (`webrtc-service-worker.js`), keep `worker-src` and service worker serving paths aligned with your deployment.

## License

The repository source code is MIT-licensed. See [LICENSE.md](./LICENSE.md) for the repository license and [LICENSE-NPM.md](./LICENSE-NPM.md) for the separate terms that apply to the bundled wasm binary in the npm package.
