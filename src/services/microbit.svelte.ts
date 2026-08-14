import { t } from '@i18n';
import {
	COMMON_IMAGES,
	createImageWithCaption,
	packImage,
	unpackImage,
	type ImageMatrix
} from '../helpers/images';
import { alert } from '../helpers/popup';
import { registerOnWindow } from '../helpers/window';
import { showPrompt, unpackDialogResult } from './dialog_manager.svelte';
import { Features, features } from './features.svelte';
import { friendlyLogService, LogType } from './friendly_log.svelte';
import { MicrobitSerialConnection } from './serial_connection';
import { userImages } from './user_images.svelte';

type BooleanInt = 0 | 1;
interface MessagesToMicrobit {
	nmComp: [];
	sendMessage: [senderName: string, recipientName: string, packedImage: string];
	newImg: [packedImage: string];
	known: [microbitName: string];
	knownImg: [packedImage: string];
	removeImg: [packedImage: string];
	settings: [
		encryptable: BooleanInt,
		autoEncryptable: BooleanInt,
		allowRecipient: BooleanInt,
		shouldBeep: BooleanInt
	];
	forgetAll: [];
	start: [];
	count: [];
}

class MicrobitService {
	private static _instance: MicrobitService;
	public static get instance(): MicrobitService {
		if (!MicrobitService._instance) {
			MicrobitService._instance = new MicrobitService();
		}
		return MicrobitService._instance;
	}

	public static VERSION = 1;

	private microbitSerial: MicrobitSerialConnection = new MicrobitSerialConnection();
	private logService = friendlyLogService;

	public knownMicrobits: Array<{ name: string; index: number; image: ImageMatrix }> = $state([]);
	public connected: boolean = $state(false);

	private hasRepliedToStart: boolean = false;

	private constructor() {
		this.microbitSerial
			.addEventListener('message', this.checkMessage.bind(this))
			.addEventListener('connected', () => (this.connected = true))
			.addEventListener('disconnected', () => (this.connected = false));

		features
			.addEventListener('enable', this.broadcastSettings.bind(this))
			.addEventListener('disable', this.broadcastSettings.bind(this));
	}

	public async connect() {
		await this.microbitSerial.connect();
		await this.writeToMB('start');
	}

	private checkForNewUser(newUser: string) {
		const exists = !!this.knownMicrobits.find((mb) => mb.name === newUser);
		if (exists) return;

		const mbIndex = this.knownMicrobits.length + 1;
		this.knownMicrobits.push({
			name: newUser,
			index: mbIndex,
			image: createImageWithCaption(
				COMMON_IMAGES[mbIndex as unknown as keyof typeof COMMON_IMAGES],
				`Microbit ${mbIndex}`
			)
		});
	}

	public checkMessage(message: string) {
		//console.log("nm = " + message.toString())
		//console.log("lm = " + lastMessage.toString())
		if (message.startsWith('debug') || message.startsWith('echo')) {
			console.debug(message);

			return;
		}

		const messageCode = message.split('_')[0];

		if (messageCode === 'dummy') {
			alert(
				t('serial.clientMicrobitDetected.title'),
				t('serial.clientMicrobitDetected.text')
			)
			this.microbitSerial.disconnect();
			return;
		}

		if (!this.hasRepliedToStart && messageCode != 'start') {
			alert(
				t('serial.unknownConnection.title'),
				t('serial.unknownConnection.text')
			)
			console.warn('Microbit has not replied to start message yet, ignoring message:', message);
			this.microbitSerial.disconnect();
			return;
		}

		switch (messageCode) {
			case 'start': {
				this.hasRepliedToStart = true;
				const communicationVersion = message.split('_')[1];
				if (communicationVersion != MicrobitService.VERSION.toString()) {
					alert(
						t('serial.outdatedVersion.title'),
						t('serial.outdatedVersion.text', { version: MicrobitService.VERSION })
					)
					this.microbitSerial.disconnect();
				}
				break;
			}
			case 'nu': {
				const mbID = message.split('_')[2];
				this.checkForNewUser(mbID);
				this.logService.addLog(LogType.Device, mbID, 'join');
				break;
			}
			case 'nm':
				this.handleNewMessage(message);
				break;
			case 'mbc':
				if (this.knownMicrobits.length != Number(message.split('_')[1])) {
					console.log(
						'microbit count mismatch, rebuilding connection',
						this.knownMicrobits.length,
						Number(message.split('_')[1])
					);
					this.writeToMB('count');
				}
				break;
			case 'lc':
				console.log('Lost connection!');
				this.writeToMB('start');
				this.rebuildConnection();
				break;
			default:
				console.log('Unknown message: ' + message);
				break;
		}
	}

	private async handleNewMessage(message: string) {
		// "nm_" + senderId + "_" + str(recipientName) + "_" + packedImage + ("_" + encryptionCode if encryptable else "")
		const messageParts = message.split('_');

		const sender = messageParts[1];
		let receiver = messageParts[2];
		let messageImage = unpackImage(messageParts[3]);
		const encryptionCode = messageParts[4] || null;

		console.log('New message received', messageImage);

		this.logService.addLog(LogType.Message, sender, receiver, messageImage, !!encryptionCode);
		console.log({ sender, receiver, messageImage });

		if (features.isActive(Features.Router) && !features.isActive(Features.AutoRouter)) {
			this.writeToMB('nmComp');
			const result = await showPrompt(
				'RouterModal',
				{
					sender,
					requestedReceiver: receiver,
					message: messageImage
				},
				{ timeout: 30000 }
			);

			if (result.type != 'success') {
				console.log('Router modal closed without sending message');
				return;
			}

			// Update the receiver to the new receiver selected in the router modal
			receiver = result.data.newReceiver;

			console.log('Router modal result:', result);
		}

		if (features.isActive(Features.Hacker)) {
			this.writeToMB('nmComp');
			const result = await showPrompt(
				'HackerModal',
				{
					message: messageImage,
					sender,
					receiver
				},
				{ timeout: 30000 }
			);

			messageImage = unpackDialogResult(result)?.newMessage || messageImage;
		}

		this.writeToMB('sendMessage', sender, receiver, packImage(messageImage));
	}

	public async rebuildConnection() {
		console.log('rebuilding');

		for await (const mb of this.knownMicrobits) {
			await this.writeToMB('known', mb.name);
		}
		if (this.knownMicrobits.length == 0) {
			await this.writeToMB('forgetAll');
		}

		await this.broadcastSettings();
		await this.broadcastImages();
	}

	/**
	 * Send a string to the micro:bit
	 * If the connection has not been established yet, it will log an error and return.
	 * @param type The type of message to send, e.g. "newImg"
	 * @param args The arguments to send with the message, e.g. the image string
	 */
	async writeToMB<T extends keyof MessagesToMicrobit>(type: T, ...args: MessagesToMicrobit[T]) {
		const message = type + '_' + args.join('_');
		await this.microbitSerial.write(message);
	}

	/**
	 * Should convert the input string to a binary string, to be able to send eveything in one message.
	 * The micro:bit will then convert the binary back to an image and display it.
	 * @param image The image to send to the micro:bit
	 */
	async writeImageToMB(image: ImageMatrix) {
		await this.writeToMB('newImg', packImage(image));
	}

	async removeImageFromMB(image: ImageMatrix) {
		await this.writeToMB('removeImg', packImage(image));
	}

	private async broadcastSettings() {
		await this.writeToMB(
			'settings',
			features.enabledFeatures.has(Features.Encryption) ? 1 : 0,
			features.enabledFeatures.has(Features.AutoEncryption) ? 1 : 0,
			features.enabledFeatures.has(Features.Router) ? 1 : 0,
			features.enabledFeatures.has(Features.Beep) ? 1 : 0
		);
	}

	public async broadcastImages() {
		for await (const image of userImages) {
			await this.writeToMB('knownImg', packImage(image));
			await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for 100ms to avoid overwhelming the micro:bit
		}
		// userImages.forEach(image => this.writeToMB("knownImg", packImage(image)));
	}
}

export const microbitService = MicrobitService.instance;
registerOnWindow('microbitService', microbitService);
