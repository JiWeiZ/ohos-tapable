import AsyncBaseHook from "./AsyncBaseHook";

class AsyncParallelHook extends AsyncBaseHook {
  callAsync(...args) {
    const hookOptions = this.getOptions("async");

    const _callArgs = args.slice(0, args.length - 1);
    const _callback = args[args.length - 1];
    if (typeof _callback !== "function") throw new Error("last argument of callAsync must be a function");

    const _done = () => {
      this.executeInterceptorsDone();
      _callback();
    };

    this.executeInterceptorsCall(_callArgs);
    let _counter = hookOptions.taps.length;

    for (const tap of hookOptions.taps) {
      this.executeInterceptorsTap(tap);
      const fn = tap.fn;
      if (tap.type === "sync") {
        this.handleSyncTap();
      } else if (tap.type === "async") {
        fn(..._callArgs, (err) => {
          if (err) {
            if (_counter > 0) {
              this.executeInterceptorsError(err);
              _callback(err);
              _counter = 0;
            }
          } else {
            if (--_counter === 0) _done();
          }
        });
      } else if (tap.type === "promise") {
        let _hasResult = false;
        const _promise = fn(..._callArgs);
        if (!_promise || !_promise.then) throw new Error("Tap function (tapPromise) did not return promise (returned " + _promise + ")");
        _promise.then(
          (result) => {
            _hasResult = true;
            if (--_counter === 0) _done();
          },
          (err) => {
            if (_hasResult) throw _err;
            if (_counter > 0) {
              this.executeInterceptorsError(err);
              _callback(_err);
              _counter = 0;
            }
          }
        );
      }
    }
  }

  promise(...args) {
    const hookOptions = this.getOptions("promise");

    const _callArgs = args.slice(0, args.length);

    return new Promise((_resolve, _reject) => {
      let _sync = true;

      // 定义 error 函数
      const _error = (_err) =>
        _sync
          ? _resolve(
              Promise.resolve().then(() => {
                throw _err;
              })
            )
          : _reject(_err);

      const _done = () => {
        this.executeInterceptorsDone();
        _resolve();
      };

      this.executeInterceptorsCall(_callArgs);
      let _counter = hookOptions.taps.length;

      for (const tap of hookOptions.taps) {
        this.executeInterceptorsTap(tap);
        const fn = tap.fn;
        if (tap.type === "sync") {
          this.handleSyncTap();
        } else if (tap.type === "async") {
          fn(..._callArgs, (err) => {
            if (err) {
              if (_counter > 0) {
                this.executeInterceptorsError(err);
                _error(err);
                _counter = 0;
              }
            } else {
              if (--_counter === 0) _done();
            }
          });
        } else if (tap.type === "promise") {
          let _hasResult = false;
          const _promise = fn(..._callArgs);
          if (!_promise || !_promise.then) throw new Error("Tap function (tapPromise) did not return promise (returned " + _promise + ")");
          _promise.then(
            (result) => {
              _hasResult = true;
              if (--_counter === 0) _done();
            },
            (err) => {
              if (_hasResult) throw _err;
              if (_counter > 0) {
                this.executeInterceptorsError(err);
                _error(_err);
                _counter = 0;
              }
            }
          );
        }
      }
      _sync = false;
    });
  }
}

export default AsyncParallelHook;
