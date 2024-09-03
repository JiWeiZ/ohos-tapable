import SyncBaseHook from "./SyncBaseHook";

class SyncHook extends SyncBaseHook {
  call(...args) {
    const hookOptions = this.getOptions("sync");
    const _callArgs = args.slice(0, hookOptions.args.length);

    this.executeInterceptorsCall(_callArgs);

    for (const tap of hookOptions.taps) {
      this.executeInterceptorsTap(tap);
      tap.fn(..._callArgs);
    }

    this.executeInterceptorsDone();
  }
}

export default SyncHook;
