/**
 * Copyright (C) 2026 Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

import type { Token, TokenRequest } from "@axiscommunications/axis-web-video-player";

export class AuthClient {
	createOnTokenRequest(): (request: TokenRequest) => Promise<Token> {
		return async (_request) => {
			// Placeholder for an implementation which fetches an appropriately scoped access token

			return { type: "Bearer", token: "REPLACE_ME" };
		};
	}
}
