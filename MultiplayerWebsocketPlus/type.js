const SDK = globalThis.SDK;
const PLUGIN_CLASS = SDK.Plugins.Lifeasdev_MultiplayerWebsocketPlusPlugin;
PLUGIN_CLASS.Type = class MultiplayerWebsocketPlusType extends SDK.ITypeBase {
    constructor(sdkPlugin, iObjectType) {
        super(sdkPlugin, iObjectType);
    }
};
export {};
