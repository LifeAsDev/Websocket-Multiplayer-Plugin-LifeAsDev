import type { SDKInstanceClass } from "./instance.ts";

const C3 = globalThis.C3;

C3.Plugins.Lifeasdev_MultiplayerPlugin.Type = class SingleGlobalType extends (
	globalThis.ISDKObjectTypeBase
)<SDKInstanceClass> {
	constructor() {
		super();
	}

	_onCreate() {}
};
