const SDK = globalThis.SDK;
const PLUGIN_CLASS = SDK.Plugins.Lifeasdev_MultiplayerPlugin;
PLUGIN_CLASS.Type = class Multiplayer2Type extends SDK.ITypeBase {
    constructor(sdkPlugin, iObjectType) {
        super(sdkPlugin, iObjectType);
    }
};
export {};
