import SyncBaseHook from "./SyncBaseHook";

class SyncLoopHook extends SyncBaseHook {
  call(...args) {
    const hookOptions = this.getOptions("sync");
    const _callArgs = args.slice(0, hookOptions.args.length);

    this.executeInterceptorsCall(_callArgs);

    let _loop;
    let next;

    do {
      _loop = false;
      this.executeInterceptorsLoop(_callArgs);
      const tapFnList = hookOptions.taps.map((tap, i, arr) => {
        return () => {
          const fn = tap.fn;
          this.executeInterceptorsTap(tap);
          next = tapFnList[i + 1];
          const result = fn(..._callArgs);
          if (result !== undefined) {
            _loop = true;
          } else {
            next && next();
          }
        };
      });

      tapFnList[0]();

      if (!_loop) {
        this.executeInterceptorsDone();
      }
    } while (_loop);
  }
}

export default SyncLoopHook;
