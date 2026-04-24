import type { Token, TokenRequest } from "@axiscommunications/axis-web-video-player";

export class AuthClient {
	createOnTokenRequest(): (request: TokenRequest) => Promise<Token> {
		return async (_request) => {
			// Placeholder for an implementation which fetches an appropriately scoped access token

			return { type: "Bearer", token: "REPLACE_ME" };
		};
	}
}
