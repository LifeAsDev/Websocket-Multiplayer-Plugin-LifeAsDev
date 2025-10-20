import type { SDKInstanceClass } from "./instance.ts";

const C3 = globalThis.C3;

C3.Plugins.Lifeasdev_MultiplayerPlugin.Acts = {
	connect(this: SDKInstanceClass, url: string, tag: string): void {},
};
