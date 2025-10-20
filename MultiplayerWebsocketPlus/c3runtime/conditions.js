const C3 = globalThis.C3;
C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds = {
    /* 	IsLargeNumber(this: SDKInstanceClass, num: number) {
        return num > 100;
    }, */
    onConnectedToSgWs(tag) {
        return true;
    },
};
export {};
