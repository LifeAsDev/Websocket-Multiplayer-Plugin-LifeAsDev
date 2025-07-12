const SDK = globalThis.SDK;
const PLUGIN_CLASS = SDK.Plugins.Multiplayer2;
PLUGIN_CLASS.Type = class Multiplayer2Type extends SDK.ITypeBase {
    constructor(sdkPlugin, iObjectType) {
        super(sdkPlugin, iObjectType);
    }
};
export {};
