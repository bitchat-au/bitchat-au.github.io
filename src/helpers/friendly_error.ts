import { t } from "@i18n";

export class FriendlyError extends Error {
	public static fromError(error: Error | string, friendlyMessage: string): FriendlyError {
		if (error instanceof FriendlyError) {
			return error;
		}

		if (typeof error === 'string') {
			return new FriendlyError(friendlyMessage, new Error(error));
		}

		return new FriendlyError(friendlyMessage, error);
	}

	public static getMessage(error: Error | string | undefined): string | undefined {
		if (!error) {
			return undefined;
		}
		
		if (error instanceof FriendlyError) {
			return error.friendlyMessage;
		}

		return t('genericError');
	}

	public readonly name = 'FriendlyError';

	constructor(
		public readonly friendlyMessage: string,
		cause?: Error | string
	) {
		super(friendlyMessage, { cause });
		this.friendlyMessage = friendlyMessage;
	}
}