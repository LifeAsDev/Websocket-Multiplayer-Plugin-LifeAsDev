const SDK = globalThis.SDK;
////////////////////////////////////////////
// The plugin ID is how Construct identifies different kinds of plugins.
// *** NEVER CHANGE THE PLUGIN ID! ***
// If you change the plugin ID after releasing the plugin, Construct will think it is an entirely different
// plugin and assume it is incompatible with the old one, and YOU WILL BREAK ALL EXISTING PROJECTS USING THE PLUGIN.
// Only the plugin name is displayed in the editor, so to rename your plugin change the name but NOT the ID.
// If you want to completely replace a plugin, make it deprecated (it will be hidden but old projects keep working),
// and create an entirely new plugin with a different plugin ID.
const PLUGIN_ID = "Lifeasdev_MultiplayerWebsocketPlusPlugin";
////////////////////////////////////////////
const PLUGIN_CATEGORY = "web";
const PLUGIN_CLASS = (SDK.Plugins.Lifeasdev_MultiplayerWebsocketPlusPlugin = class MultiplayerWebsocketPlusPlugin extends (SDK.IPluginBase) {
    constructor() {
        super(PLUGIN_ID);
        SDK.Lang.PushContext("plugins." + PLUGIN_ID.toLowerCase());
        this._info.SetName(globalThis.lang(".name"));
        this._info.SetDescription(globalThis.lang(".description"));
        this._info.SetCategory(PLUGIN_CATEGORY);
        this._info.SetAuthor("Scirra");
        this._info.SetHelpUrl(globalThis.lang(".help-url"));
        this._info.SetIsSingleGlobal(true);
        this._info.SetRuntimeModuleMainScript("c3runtime/main.js");
        this._info.AddC3RuntimeScript("c3runtime/client-signalling.js");
        this._info.AddC3RuntimeScript("c3runtime/mymodule.js");
        this._info.AddFileDependency({
            filename: "c3runtime/waker.js",
            type: "external-runtime-script",
            fileType: "js",
            scriptType: "module",
        });
        /* 	SDK.Lang.PushContext(".properties");
         */
        /* 			this._info.SetProperties([
            new SDK.PluginProperty("integer", "test-property", 0),
        ]);
*/
        SDK.Lang.PopContext();
    }
});
PLUGIN_CLASS.Register(PLUGIN_ID, PLUGIN_CLASS);
export {};
