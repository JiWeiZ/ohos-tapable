import SyncBaseHook from "./SyncBaseHook";

class SyncBailHook extends SyncBaseHook {
  call(...args) {
    const hookOptions = this.getOptions("sync");
    const _callArgs = args.slice(0, hookOptions.args.length);

    this.executeInterceptorsCall(_callArgs);
    for (const tap of hookOptions.taps) {
      this.executeInterceptorsTap(tap);
      const result = tap.fn(..._callArgs);
      if (result !== undefined) {
        this.executeInterceptorsResult(result);
        return result;
      }
    }
    this.executeInterceptorsDone();
  }
}

export default SyncBailHook;
