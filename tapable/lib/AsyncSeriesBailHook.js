import AsyncBaseHook from './AsyncBaseHook';

class AsyncSeriesBailHook extends AsyncBaseHook {
    constructor(...args) {
        super(...args)
    }

    callAsync(...args) {
        const hookOptions = this.getOptions("async");

        const _callArgs = args.slice(0, args.length - 1);
        const _callback = args[args.length - 1];
        if (typeof _callback !== "function") {
            throw new Error("last argument of callAsync must be a function");
        }

        const _done = (result) => {
            this.executeInterceptorsDone();
            _callback(undefined, result);
        };

        this.executeInterceptorsCall(_callArgs);

        let next;

        const tapFnList = hookOptions.taps.map((tap, i, arr) => {
            return async () => {
                const fn = tap.fn;
                this.executeInterceptorsTap(tap);
                next = tapFnList[i + 1];

                if (tap.type === "sync") {
                    this.handleSyncTap();
                } else if (tap.type === "async") {
                    fn(..._callArgs, (err, result) => {
                        const index = i;
                        if (err) {
                            this.executeInterceptorsError(err);
                            _callback(err);
                        } else {
                            if (result !== undefined) {
                                this.executeInterceptorsResult(result);
                                _callback(null, result);
                            } else {
                                next && next();
                                if (index === hookOptions.taps.length - 1) {
                                    _done();
                                }
                            }
                        }
                    });
                } else if (tap.type === "promise") {
                    const index = i;
                    let _hasResult = false;
                    const _promise = fn(..._callArgs);
                    if (!_promise ||
                        !_promise.then) {
                        throw new Error("Tap function (tapPromise) did not return promise (returned " +
                            _promise + ")");
                    }
                    try {
                        const result = await _promise;
                        _hasResult = true;
                        if (result !== undefined) {
                            this.executeInterceptorsResult(result);
                            _callback(null, result);
                        } else {
                            next && next();
                            if (index === hookOptions.taps.length - 1) {
                                _done(arg0);
                            }
                        }
                    } catch (err) {
                        if (_hasResult) {
                            throw err;
                        }
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

            const _done = (res) => {
                this.executeInterceptorsDone();
                _resolve(res);
            };

            this.executeInterceptorsCall(_callArgs);

            let next;

            const tapFnList = hookOptions.taps.map((tap, i, arr) => {
                return async () => {
                    const fn = tap.fn;
                    this.executeInterceptorsTap(tap);
                    next = tapFnList[i + 1];

                    if (tap.type === "sync") {
                        this.handleSyncTap();
                    } else if (tap.type === "async") {
                        fn(..._callArgs, (err, result) => {
                            if (err) {
                                this.executeInterceptorsError(err);
                                _error(err);
                            } else {
                                if (result !== undefined) {
                                    this.executeInterceptorsResult(result);
                                    _resolve(result);
                                } else {
                                    next && next();
                                }
                            }
                        });
                    } else if (tap.type === "promise") {
                        let _hasResult = false;
                        const _promise = fn(..._callArgs);
                        if (!_promise ||
                            !_promise.then) {
                            throw new Error("Tap function (tapPromise) did not return promise (returned " +
                                _promise + ")");
                        }
                        try {
                            const result = await _promise;
                            _hasResult = true;
                            if (result !== undefined) {
                                this.executeInterceptorsResult(result);
                                _resolve(result);
                            } else {
                                next && next();
                            }
                        } catch (err) {
                            if (_hasResult) {
                                throw err;
                            }
                            this.executeInterceptorsError(err);
                            _error(err);
                        }
                    }
                    if (i === hookOptions.taps.length - 1) {
                        _done();
                    }
                };
            });

            tapFnList[0]();
        });
    }
}

export default AsyncSeriesBailHook;
