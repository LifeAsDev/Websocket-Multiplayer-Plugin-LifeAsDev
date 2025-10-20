const C3 = globalThis.C3;
const DOM_COMPONENT_ID = "LifeAsDevWebRTC_DOMMessaging";

class SingleGlobalInstance extends globalThis.ISDKInstanceBase {
	/* _testProperty: number;
	 */

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

	_loadFromJson(o: any) {
		// load state for savegames
	}
}

C3.Plugins.Lifeasdev_MultiplayerWebsocketPlusPlugin.Instance = SingleGlobalInstance;

export type { SingleGlobalInstance as SDKInstanceClass };
