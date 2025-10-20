const SDK = globalThis.SDK;

const PLUGIN_CLASS = SDK.Plugins.Lifeasdev_MultiplayerWebsocketPlusPlugin;

PLUGIN_CLASS.Type = class MultiplayerWebsocketPlusType extends SDK.ITypeBase {
	constructor(sdkPlugin: SDK.IPluginBase, iObjectType: SDK.IObjectType) {
		super(sdkPlugin, iObjectType);
	}
};

export {};
