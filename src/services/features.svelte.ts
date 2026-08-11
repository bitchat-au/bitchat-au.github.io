import { SvelteSet } from 'svelte/reactivity';
import EventEmitter, { type EventMap } from '../helpers/event_emitter';
import { registerOnWindow } from '../helpers/window';

type FeatureConfig = Record<Features, { parent?: Features; passwords: string[] }>;

export enum Features {
	Server = 'Server',
	Translator = 'Translator',
	ImageBuilder = 'ImageBuilder',
	KodeKnækkeren = 'KodeKnækkeren',
	Router = 'Router',
	AutoRouter = 'AutoRouter',
	Encryption = 'Encryption',
	AutoEncryption = 'AutoEncryption',
	Hacker = 'Hacker',
	Beep = 'Beep'
}

const featuresConfig: FeatureConfig = {
	[Features.Server]: { passwords: ['server'] },
	[Features.Translator]: { passwords: ['oversætter', 'translator'] },
	[Features.ImageBuilder]: { passwords: ['byg', 'billede', 'build', 'image'] },
	[Features.KodeKnækkeren]: { passwords: ['knæk', 'crack'] },
	[Features.Router]: { passwords: ['modtager', 'receiver', 'recipient', 'router'] },
	[Features.AutoRouter]: {
		parent: Features.Router,
		passwords: ['auto-modtager', 'auto-receiver', 'auto-recipient', 'auto-router']
	},
	[Features.Encryption]: { passwords: ['krypter', 'kryptering', 'encrypt', 'encryption'] },
	[Features.AutoEncryption]: {
		parent: Features.Encryption,
		passwords: ['auto-krypter', 'auto-kryptering', 'auto-encrypt', 'auto-encryption']
	},
	[Features.Hacker]: { passwords: ['hack', 'hacker'] },
	[Features.Beep]: { passwords: ['bip', 'beep'] }
};

export const featureList = Object.entries(featuresConfig).map(([key, config]) => ({
	key: key as Features,
	parent: config.parent,
	depth: config.parent ? getAllParents(config.parent).length + 1 : 0,
	passwords: config.passwords
}));

const defaultFeatures = [Features.Beep];

// What passwords unlock which features
const supplementalPasswords: Array<{ features: Features[]; passwords: string[] }> = [
	{ features: Object.values(Features), passwords: ['meget hemmelig kode', 'very secret code'] },
	{
		features: [
			Features.Server,
			Features.Translator,
			Features.ImageBuilder,
			Features.Router,
			Features.AutoRouter
		],
		passwords: ['pakke1', 'bundle1', 'package1']
	}
];

export function getAllParents(feature: Features | undefined): Features[] {
	if (!feature) return [];

	const parent = featuresConfig[feature].parent;

	if (!parent) return [];

	return [parent, ...getAllParents(parent)];
}

export function getAllChildren(feature: Features): Features[] {
	const children = featureList.filter(({ parent }) => parent === feature).map(({ key }) => key);

	return [...children, ...children.flatMap(getAllChildren)];
}

type Events = EventMap & {
	enable: (feature: Features) => void;
	disable: (feature: Features) => void;
};

/**
 * Singleton service to manage feature flags in the application.
 * It allows enabling/disabling features, marking them as available/unavailable, and checking their status.
 * The state is persisted in localStorage.
 */
class FeaturesService extends EventEmitter<Events> {
	private static StorageKey = 'bit:chat:features';

	private static _instance: FeaturesService;
	public static get instance(): FeaturesService {
		if (!FeaturesService._instance) {
			FeaturesService._instance = new FeaturesService();
		}
		return FeaturesService._instance;
	}

	private constructor() {
		super();
		this.loadState();
	}

	public enabledFeatures: Set<Features> = new SvelteSet();
	public availableFeatures: Set<Features> = new SvelteSet();

	/**
	 * Saves the current state of enabled and available features to localStorage.
	 */
	private saveState() {
		const state = {
			enabled: Array.from(this.enabledFeatures),
			available: Array.from(this.availableFeatures)
		};

		localStorage.setItem(FeaturesService.StorageKey, JSON.stringify(state));
	}

	/**
	 * Loads the state of enabled and available features from localStorage.
	 * Does nothing if no state is found or if the stored state is invalid.
	 */
	private loadState() {
		const stateStr = localStorage.getItem(FeaturesService.StorageKey);
		if (stateStr) {
			try {
				const state = JSON.parse(stateStr);
				this.enabledFeatures = new SvelteSet(state.enabled || []);
				this.availableFeatures = new SvelteSet(state.available || []);
			} catch (e) {
				console.error('Failed to load features state:', e);
			}
		}

		this.loadFromURLParams(); // Load features from URL parameters after loading from localStorage
		this.setDefaultFeatures(); // Ensure default features are set if none are available
	}

	/**
	 * Loads feature from the URL parameters and activates them if they are valid.
	 */
	private loadFromURLParams() {
		if (typeof window === 'undefined') return;

		const params = new URLSearchParams(window.location.search);
		const encoded = params.get('features');
		if (!encoded) return;

		const features = decodeFeatures(encoded);
		features.forEach((feature) => this.addAvailableFeature(feature));
	}

	private setDefaultFeatures() {
		if (this.availableFeatures.size === 0) {
			defaultFeatures.forEach((f) => this.addAvailableFeature(f));
		}
	}

	/**
	 * Generates a shareable URL that includes the specified features.
	 * @param featuresToShare Optional array of features to include in the URL. If not provided, all currently enabled features will be included.
	 * @returns A shareable URL that includes the currently enabled features as query parameters.
	 */
	public getFeatureShareURL(
		featuresToShare: Features[] = Array.from(this.enabledFeatures)
	): string {
		const url = new URL(window.location.origin);
		const encoded = encodeFeatures(featuresToShare);
		url.searchParams.set('features', encoded);
		return url.toString();
	}

	/**
	 * Enables a feature.
	 * @param feature Feature to enable
	 */
	public enable(feature: Features): void {
		this.enabledFeatures.add(feature);
		this.saveState();
		this.emit('enable', feature);
	}

	/**
	 * Disables a feature.
	 * @param feature Feature to disable
	 */
	public disable(feature: Features): void {
		this.enabledFeatures.delete(feature);
		this.saveState();
		this.emit('disable', feature);
	}

	/**
	 * Toggles the state of a feature. If it's enabled, it will be disabled, and vice versa.
	 * @param feature Feature to toggle
	 */
	public toggle(feature: Features): void {
		if (this.enabledFeatures.has(feature)) {
			this.disable(feature);
		} else {
			this.enable(feature);
		}
	}

	/**
	 * Marks a feature as available, but doesn't necessarily enable it.
	 * @param feature Feature to make available
	 */
	public addAvailableFeature(feature: Features): void {
		this.availableFeatures.add(feature);
		this.enable(feature);
		this.saveState();
	}

	/**
	 * Marks a feature as unavailable, removing it from the available features set.
	 * @param feature Feature to remove
	 */
	public removeAvailableFeature(feature: Features): void {
		this.availableFeatures.delete(feature);
		this.saveState();
	}

	/**
	 * Marks all features as available.
	 */
	public makeAllAvailable(): void {
		Object.values(Features).forEach((f) => this.availableFeatures.add(f));
		this.saveState();
	}

	/**
	 * Clears all enabled and available features, effectively resetting the feature state.
	 */
	public clearAll(): void {
		this.enabledFeatures.clear();
		this.availableFeatures.clear();
		this.saveState();
		this.setDefaultFeatures();
	}

	/**
	 * Checks if the password provided is correct, and makes the corresponding features available if it is.
	 * @param password Password to check
	 * @returns True if the password was correct, false otherwise
	 */
	public checkPassword(password: string): boolean {
		const normalizedPassword = password.trim().toLowerCase();
		const foundFeature = featureList.find((f) => f.passwords.includes(normalizedPassword));

		const supplementalPackages = supplementalPasswords
			.filter((cur) => cur.passwords.includes(normalizedPassword))
			.flatMap((cur) => cur.features);

		const featuresToUnlock = [
			foundFeature?.key,
			...getAllParents(foundFeature?.key as Features),
			...supplementalPackages,
			...decodeFeatures(password) // Dont use the normalized password as it may be base64 encoded and case sensitive
		].filter(Boolean) as Features[];

		console.log(password, decodeFeatures(password));

		featuresToUnlock.forEach((feature) => this.addAvailableFeature(feature));

		return featuresToUnlock.length > 0;
	}

	/**
	 * Checks if a feature is available.
	 * @param feature Feature to check
	 * @returns True if the feature is available, false otherwise
	 */
	public has(feature: Features): boolean {
		return this.availableFeatures.has(feature);
	}

	/**
	 * Checks if a feature is active (both available and enabled).
	 * @param feature Feature to check
	 * @returns True if the feature is active, false otherwise
	 */
	public isActive(feature: Features): boolean {
		return this.has(feature) && this.enabledFeatures.has(feature);
	}
}

/**
 * Instance of the FeaturesService, used to manage feature flags across the application.
 */
export const features = FeaturesService.instance;

// Expose the features service and enum to the global window object for easy access in the browser console
registerOnWindow('featureService', features);
registerOnWindow('Features', Features);

export function encodeFeatures(features: Features[]): string {
	if (features.length === 0) {
		return '';
	}
	
	// Convert the features to a number using bitwise operations
	const number = Object.keys(Features).reduce(
		(acc, key, index) => acc + (features.includes(key as Features) ? 1 : 0) * Math.pow(2, index),
		0
	);

	// Convert the number to a base16 string
	const string = number.toString(16);

	// Add a random padding to the string to make it less predictable, it's completely unnessary and is removed when decoding, but it makes the URL look less like a simple number
	const padding =
		string.length < 5
			? '|' +
				Math.random()
					.toString(36)
					.substring(2, 5 - string.length + 2)
			: '';

	// Encode the string to base64 and remove any padding characters
	const encoded = btoa(string + padding).replaceAll('=', '');

	return encoded;
}

export function decodeFeatures(encoded: string): Features[] {
	try {
		const decoded = atob(encoded).split('|')[0]; // Remove any padding after the '|' character
		const number = parseInt(decoded, 16);
		const bitString = number.toString(2);
		const features = Object.keys(Features).filter(
			(_, index) => bitString[bitString.length - 1 - index] === '1'
		) as Features[];
		return features;
	} catch (e) {
		console.error('Failed to decode features from URL:', e);
		return [];
	}
}

registerOnWindow('encodeFeatures', encodeFeatures);
registerOnWindow('decodeFeatures', decodeFeatures);
