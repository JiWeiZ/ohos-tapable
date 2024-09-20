import AsyncBaseHook from "./AsyncBaseHook";

class AsyncSeriesHook extends AsyncBaseHook {
  constructor(...args) {
    super(...args)
  }

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

    (async () => {
      for (const tap of hookOptions.taps) {
        this.executeInterceptorsTap(tap);
        const fn = tap.fn;
        if (tap.type === "sync") {
          this.handleSyncTap();
        } else if (tap.type === "async") {
          await new Promise((resolve) => {
            fn(..._callArgs, (err) => {
              if (err) {
                this.executeInterceptorsError(err);
                _callback(err);
                return;
              } else {
                resolve();
              }
            });
          });
        } else if (tap.type === "promise") {
          let _hasResult = false;
          const _promise = fn(..._callArgs);
          if (!_promise || !_promise.then) throw new Error("Tap function (tapPromise) did not return promise (returned " + _promise + ")");
          try {
            const result = await _promise;
            _hasResult = true;
          } catch (err) {
            if (_hasResult) throw err;
            this.executeInterceptorsError(err);
            _callback(err);
            return;
          }
        }
      }
      _done();
    })();
  }

  promise(...args) {
    const hookOptions = this.getOptions("promise");

    const _callArgs = args.slice(0, args.length);
    return new Promise((_resolve, _reject) => {
      let _sync = true;

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
      (async () => {
        for (let i = 0; i < hookOptions.taps.length; i++) {
          const tap = hookOptions.taps[i];
          this.executeInterceptorsTap(tap);
          const fn = tap.fn;
          if (tap.type === "sync") {
            this.handleSyncTap();
          } else if (tap.type === "async") {
            await new Promise((resolve) => {
              fn(..._callArgs, (err) => {
                if (err) {
                  this.executeInterceptorsError(err);
                  _error(err);
                  return;
                } else {
                  resolve();
                }
              });
              if (i === 0) _sync = false;
            });
          } else if (tap.type === "promise") {
            let _hasResult = false;
            const _promise = fn(..._callArgs);
            if (!_promise || !_promise.then) throw new Error("Tap function (tapPromise) did not return promise (returned " + _promise + ")");
            if (i === 0) _sync = false;
            try {
              const result = await _promise;
            } catch (err) {
              if (_hasResult) throw _err;
              this.executeInterceptorsError(err);
              _error(err);
              return;
            }
          }
        }
        _done();
      })();
    });
  }
}

export default AsyncSeriesHook;
