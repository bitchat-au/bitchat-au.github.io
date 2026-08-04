import { SvelteSet } from "svelte/reactivity";
import { microbitService } from "./microbit.svelte";
import { scope } from "@i18n";
import EventEmitter, { type EventMap } from "../helpers/event_emitter";

////////////////////////////////////////////////////////////////////////////
/////// Helper shenanigans for creating a strongly type feature enum ///////
////////////////////////////////////////////////////////////////////////////
export type FeatItem = {
    readonly key: string;
    readonly children?: readonly FeatItem[];
};

type ExtractKeys<T extends readonly FeatItem[]> = T[number] extends infer U
    ? U extends { readonly key: infer K extends string; readonly children: infer C extends readonly FeatItem[] }
        ? K | ExtractKeys<C>
        : U extends { readonly key: infer K extends string }
        ? K
        : never
    : never;

type FeatureRecord<T extends readonly FeatItem[]> = {
    [K in ExtractKeys<T>]: K;
};

export function createFeatureMap<T extends readonly FeatItem[]>(arr: T): FeatureRecord<T> {
    const result = {} as any;

    function traverse(nodes: readonly FeatItem[]) {
        for (const node of nodes) {
            result[node.key] = node.key;
            if (node.children) {
                traverse(node.children);
            }
        }
    }

    traverse(arr);
    return Object.freeze(result);
}
///////////////////////////////////////////////
///////////////////// END /////////////////////
///////////////////////////////////////////////

export const featureMap = [
    { key: "Server" },
    { key: "Translator" },
    { key: "ImageBuilder" },
    { key: "KodeKnækkeren" },
    { key: "Router", children: [{ key: "AutoRouter" }] },
    { key: "Encryption", children: [{ key: "AutoEncryption" }] },
    { key: "Hacker" },
    { key: "Beep" }
] as const satisfies readonly FeatItem[];

// Generate the features enum from the feature map. This will create a type-safe enum.
export const Features = createFeatureMap(featureMap);
export type Features = keyof typeof Features;

const isFeature = (value: any): value is Features => {
    return Object.values(Features).includes(value);
}

// What passwords unlock which features
const passwordT = scope("features.passwords");
const featurePasswords: Array<{ features: Features[]; passwords: string[] }> = [
    { features: [Features.Server], passwords: [passwordT("Server")] },
    { features: [Features.Translator], passwords: [passwordT("Translator")] },
    { features: [Features.ImageBuilder], passwords: [passwordT("ImageBuilder")] },
    { features: [Features.KodeKnækkeren], passwords: [passwordT("KodeKnækkeren")] },
    { features: [Features.Router], passwords: [passwordT("Router")] },
    { features: [Features.AutoRouter, Features.Router], passwords: [passwordT("AutoRouter")] },
    { features: [Features.Encryption], passwords: [passwordT("Encryption")] },
    { features: [Features.AutoEncryption, Features.Encryption], passwords: [passwordT("AutoEncryption")] },
    { features: [Features.Hacker], passwords: [passwordT("Hacker")] },
    { features: [Features.Beep], passwords: [passwordT("Beep")] },
    { features: Object.values(Features), passwords: [passwordT("all")] },
]

type Events = EventMap & {
    enable: (feature: Features) => void;
    disable: (feature: Features) => void;
}

/**
 * Singleton service to manage feature flags in the application.
 * It allows enabling/disabling features, marking them as available/unavailable, and checking their status.
 * The state is persisted in localStorage.
 */
class FeaturesService extends EventEmitter<Events> {
    private static StorageKey = "bit:chat:features";

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
            available: Array.from(this.availableFeatures),
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
                console.error("Failed to load features state:", e);
            }
        }

        this.loadFromURLParams(); // Load features from URL parameters after loading from localStorage
    }

    /**
     * Loads feature from the URL parameters and activates them if they are valid.
     */
    private loadFromURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const featuresParam = decodeURIComponent(urlParams.get("features") || "");
        if (featuresParam) {
            const featuresToEnable = featuresParam.split(",") as Features[];
            featuresToEnable.forEach(f => {
                if (isFeature(f)) {
                    this.addAvailableFeature(f);
                }
            });
        }
    }

    /**
     * Generates a shareable URL that includes the currently enabled features as query parameters.
     * @returns A shareable URL that includes the currently enabled features as query parameters.
     */
    private getFeatureShareURL() {
        const baseUrl = window.location.origin + window.location.pathname;
        const featuresParam = Array.from(this.enabledFeatures).join(",");
        return `${baseUrl}?features=${encodeURIComponent(featuresParam)}`;
    }

    /**
     * Enables a feature.
     * @param feature Feature to enable
     */
    public enable(feature: Features): void {
        this.enabledFeatures.add(feature);
        this.saveState();
        this.emit("enable", feature);
    }

    /**
     * Disables a feature.
     * @param feature Feature to disable
     */
    public disable(feature: Features): void {
        this.enabledFeatures.delete(feature);
        this.saveState();
        this.emit("disable", feature);
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
        Object.values(Features).forEach(f => this.availableFeatures.add(f));
        this.saveState();
    }

    /**
     * Clears all enabled and available features, effectively resetting the feature state.
     */
    public clearAll(): void {
        this.enabledFeatures.clear();
        this.availableFeatures.clear();
        this.saveState();
    }

    /**
     * Checks if the password provided is correct, and makes the corresponding features available if it is.
     * @param password Password to check
     * @returns True if the password was correct, false otherwise
     */
    public checkPassword(password: string): boolean {
        const foundFeatures = featurePasswords
            .filter(cur => cur.passwords.includes(password))
            .flatMap(cur => cur.features);

        foundFeatures.forEach(f => this.addAvailableFeature(f));

        return foundFeatures.length > 0;
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
(window as any).featureService = features;
(window as any).Features = Features;