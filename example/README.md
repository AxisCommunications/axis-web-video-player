# Axis Web Video Player example

An example how to use Axis Web Video Player

## Configuration

Copy the `.env.local.template` file to a new file called `.env.local`.
Replace the example values in the new file with values for the camera you want to stream from.

## Authorization
The file `auth.ts` has to be modified to implement an authorization flow in order to fetch a token
and provide it in the callback function returned by `createOnTokenRequest()`

How this is implemented depends on your authorization backend.

### Build and run the example
From the repository root:

1. `cp example/.env.local{.template,}`

1. `npm install && npm run build && (cd example && npm install)`

1. `npm run example`

1. Open the URL printed by the server in 4. in a web browser.