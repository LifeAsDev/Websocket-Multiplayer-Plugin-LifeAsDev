const SDK = globalThis.SDK;
const PLUGIN_CLASS = SDK.Plugins.Lifeasdev_MultiplayerWebsocketPlusPlugin;
PLUGIN_CLASS.Instance = class MultiplayerWebsocketPlusInstance extends (SDK.IInstanceBase) {
    constructor(sdkType, inst) {
        super(sdkType, inst);
    }
    Release() { }
    OnCreate() { }
    OnPropertyChanged(id, value) { }
    LoadC2Property(name, valueString) {
        return false; // not handled
    }
};
export {};
