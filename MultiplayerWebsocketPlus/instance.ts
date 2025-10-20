const SDK = globalThis.SDK;

const PLUGIN_CLASS = SDK.Plugins.Lifeasdev_MultiplayerWebsocketPlusPlugin;

PLUGIN_CLASS.Instance = class MultiplayerWebsocketPlusInstance extends (
	SDK.IInstanceBase
) {
	constructor(sdkType: SDK.ITypeBase, inst: SDK.IObjectInstance) {
		super(sdkType, inst);
	}

	Release() {}

	OnCreate() {}

	OnPropertyChanged(id: string, value: EditorPropertyValueType) {}

	LoadC2Property(name: string, valueString: string) {
		return false; // not handled
	}
};

export {};
