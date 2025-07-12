const C3 = globalThis.C3;
class SingleGlobalInstance extends globalThis.ISDKInstanceBase {
    /* _testProperty: number;
     */
    constructor() {
        super();
        // Initialise object properties
        /* 	this._testProperty = 0; */
        const properties = this._getInitProperties();
        if (properties) {
            // note properties may be null in some cases
            /* this._testProperty = properties[0] as number; */
        }
    }
    _release() {
        super._release();
    }
    /* _setTestProperty(n: number) {
        this._testProperty = n;
    }

    _getTestProperty() {
        return this._testProperty;
    }
 */
    _saveToJson() {
        return {
        // data to be saved for savegames
        };
    }
    _loadFromJson(o) {
        // load state for savegames
    }
}
C3.Plugins.Lifeasdev_MultiplayerPlugin.Instance = SingleGlobalInstance;
export {};
