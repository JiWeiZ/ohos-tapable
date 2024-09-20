import AsyncBaseHook from "./AsyncBaseHook";

class AsyncSeriesWaterfallHook extends AsyncBaseHook {
  constructor(...args) {
    super(...args)
  }

  callAsync(...args) {
    const hookOptions = this.getOptions("async");

    let arg0 = args[0];
    const _restCallArgs = args.slice(1, args.length - 1);
    const _callback = args[args.length - 1];

    if (typeof _callback !== "function") throw new Error("last argument of callAsync must be a function");

    const _done = (res) => {
      this.executeInterceptorsResult(res);
      _callback(null, res);
    };

    this.executeInterceptorsCall([arg0, ..._restCallArgs]);

    let next;

    const tapFnList = hookOptions.taps.map((tap, i, arr) => {
      return async () => {
        const fn = tap.fn;
        this.executeInterceptorsTap(tap);
        next = tapFnList[i + 1];

        if (tap.type === "sync") {
          this.handleSyncTap();
        } else if (tap.type === "async") {
          fn(arg0, ..._restCallArgs, (err, result) => {
            const index = i;
            if (err) {
              this.executeInterceptorsError(err);
              _callback(err);
            } else {
              if (result !== undefined) {
                arg0 = result;
              }

              next && next();

              if (index === hookOptions.taps.length - 1) {
                _done(arg0);
              }
            }
          });
        } else if (tap.type === "promise") {
          const index = i;
          let _hasResult = false;
          const _promise = fn(arg0, ..._restCallArgs);
          if (!_promise || !_promise.then) throw new Error("Tap function (tapPromise) did not return promise (returned " + _promise + ")");
          try {
            const result = await _promise;
            _hasResult = true;
            if (result !== undefined) {
              arg0 = result;
            }
            next && next();
            if (index === hookOptions.taps.length - 1) {
              _done(arg0);
            }
          } catch (err) {
            if (_hasResult) throw err;
            this.executeInterceptorsError(err);
            _callback(err);
          }
        }
      };
    });

    tapFnList[0]();
  }

  promise(...args) {
    const hookOptions = this.getOptions("promise");
    let arg0 = args[0];
    const _restCallArgs = args.slice(1, args.length);
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

      const _done = (res) => {
        this.executeInterceptorsResult(res);
        _resolve(res);
      };

      this.executeInterceptorsCall([arg0, ..._restCallArgs]);

      let next;

      const tapFnList = hookOptions.taps.map((tap, i, arr) => {
        return async () => {
          const fn = tap.fn;
          this.executeInterceptorsTap(tap);
          next = tapFnList[i + 1];

          if (tap.type === "sync") {
            this.handleSyncTap();
          } else if (tap.type === "async") {
            fn(arg0, ..._restCallArgs, (err, result) => {
              const index = i;
              if (err) {
                this.executeInterceptorsError(err);
                _error(err);
              } else {
                if (result !== undefined) {
                  arg0 = result;
                }

                next && next();

                if (index === hookOptions.taps.length - 1) {
                  _done(arg0);
                }
              }
            });
          } else if (tap.type === "promise") {
            const index = i;
            let _hasResult = false;
            const _promise = fn(arg0, ..._restCallArgs);
            if (!_promise || !_promise.then) throw new Error("Tap function (tapPromise) did not return promise (returned " + _promise + ")");
            try {
              const result = await _promise;
              _hasResult = true;
              if (result !== undefined) {
                arg0 = result;
              }
              next && next();
              if (index === hookOptions.taps.length - 1) {
                _done(arg0);
              }
            } catch (err) {
              if (_hasResult) throw err;
              this.executeInterceptorsError(err);
              _error(err);
            }
          }
        };
      });

      tapFnList[0]();
    });
  }
}

export default AsyncSeriesWaterfallHook;
