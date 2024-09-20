import SyncBaseHook from "./SyncBaseHook";

class SyncWaterfallHook extends SyncBaseHook {
    constructor(...args) {
        super(...args)
    }

    call(...args) {
        const hookOptions = this.getOptions("sync");
        let arg0 = args[0];
        const _restCallArgs = args.slice(1, hookOptions.args.length);

        this.executeInterceptorsCall([arg0, ..._restCallArgs]);

        for (const tap of hookOptions.taps) {
            this.executeInterceptorsTap(tap);
            const result = tap.fn(arg0, ..._restCallArgs);
            if (result !== undefined) {
                arg0 = result;
            }
        }

        this.executeInterceptorsResult(arg0);
        return arg0;
    }
}

export default SyncWaterfallHook;
