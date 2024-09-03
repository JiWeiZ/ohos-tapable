import AsyncBaseHook from './AsyncBaseHook';

class AsyncParallelBailHook extends AsyncBaseHook {
    callAsync(...args) {
        const hookOptions = this.getOptions("async");

        const _callArgs = args.slice(0, args.length - 1);
        const _callback = args[args.length - 1];
        if (typeof _callback !== "function") {
            throw new Error("last argument of callAsync must be a function");
        }

        const _done = () => {
            this.executeInterceptorsDone();
            _callback();
        };

        this.executeInterceptorsCall(_callArgs);
        const _results = new Array(hookOptions.args.length);
        const _checkDone = () => {
            for (var i = 0; i < _results.length; i++) {
                var item = _results[i];
                if (item === undefined) {
                    return false;
                }
                if (item.result !== undefined) {
                    this.executeInterceptorsResult(item.result);
                    _callback(null, item.result);
                    return true;
                }
                if (item.error) {
                    this.executeInterceptorsError(item.error);
                    _callback(item.error);
                    return true;
                }
            }
            return false;
        };
        let _counter = hookOptions.taps.length;
        let next;

        const tapFnList = hookOptions.taps.map((tap, i, arr) => {
            return () => {
                const fn = tap.fn;
                this.executeInterceptorsTap(tap);
                next = tapFnList[i + 1];
                if (tap.type === "sync") {
                    this.handleSyncTap();
                } else if (tap.type === "async") {
                    const index = i;
                    fn(..._callArgs, (err, result) => {
                        if (err) {
                            if (_counter > 0) {
                                if (index < _results.length &&
                                    (result !== undefined && (_results.length = index + 1), (_results[index] =
                                        { result: result }), _checkDone())) {
                                    _counter = 0;
                                } else {
                                    if (--_counter === 0) {
                                        _done();
                                    }
                                }
                            }
                        } else {
                            if (_counter > 0) {
                                if (index < _results.length &&
                                    ((_results.length = index + 1), (_results[i] = { error: err }), _checkDone())) {
                                    _counter = 0;
                                } else {
                                    if (--_counter === 0) {
                                        _done();
                                    }
                                }
                            }
                        }
                    });
                    if (_counter <= 0) {
                        return;
                    }
                    if (index + 1 >= _results.length) {
                        if (--_counter === 0) {
                            _done();
                        }
                    } else {
                        next && next();
                    }
                } else if (tap.type === "promise") {
                    const index = i;
                    let _hasResult = false;
                    const _promise = fn(..._callArgs);
                    if (!_promise ||
                        !_promise.then) {
                        throw new Error("Tap function (tapPromise) did not return promise (returned " +
                            _promise + ")");
                    }
                    _promise.then(
                        (result) => {
                            _hasResult = true;
                            if (_counter > 0) {
                                if (index < _results.length &&
                                    (result !== undefined && (_results.length = index + 1), (_results[index] =
                                        { result: result }), _checkDone())) {
                                    _counter = 0;
                                } else {
                                    if (--_counter === 0) {
                                        _done();
                                    }
                                }
                            }
                        },
                        (err) => {
                            if (_hasResult) {
                                throw _err;
                            }
                            if (_counter > 0) {
                                if (index < _results.length &&
                                    ((_results.length = index + 1), (_results[i] = { error: err }), _checkDone())) {
                                    _counter = 0;
                                } else {
                                    if (--_counter === 0) {
                                        _done();
                                    }
                                }
                            }
                        }
                    );
                    if (_counter <= 0) {
                        return;
                    }
                    if (index + 1 >= _results.length) {
                        if (--_counter === 0) {
                            _done();
                        }
                    } else {
                        next && next();
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

            const _done = () => {
                this.executeInterceptorsDone();
                _resolve();
            };

            this.executeInterceptorsCall(_callArgs);
            const _results = new Array(hookOptions.args.length);
            var _checkDone = () => {
                for (var i = 0; i < _results.length; i++) {
                    var item = _results[i];
                    if (item === undefined) {
                        return false;
                    }
                    if (item.result !== undefined) {
                        this.executeInterceptorsResult(item.result);
                        _resolve(item.result);
                        return true;
                    }
                    if (item.error) {
                        this.executeInterceptorsError(item.error);
                        _error(item.error);
                        return true;
                    }
                }
                return false;
            };
            let _counter = hookOptions.taps.length;

            let next;

            const tapFnList = hookOptions.taps.map((tap, i, arr) => {
                return () => {
                    const fn = tap.fn;
                    this.executeInterceptorsTap(tap);
                    next = tapFnList[i + 1];
                    if (tap.type === "sync") {
                        this.handleSyncTap();
                    } else if (tap.type === "async") {
                        const index = i;
                        fn(..._callArgs, (err, result) => {
                            if (err) {
                                if (_counter > 0) {
                                    if (index < _results.length &&
                                        (result !== undefined && (_results.length = index + 1), (_results[index] =
                                            { result: result }), _checkDone())) {
                                        _counter = 0;
                                    } else {
                                        if (--_counter === 0) {
                                            _done();
                                        }
                                    }
                                }
                            } else {
                                if (_counter > 0) {
                                    if (index < _results.length &&
                                        ((_results.length = index + 1), (_results[i] = { error: err }), _checkDone())) {
                                        _counter = 0;
                                    } else {
                                        if (--_counter === 0) {
                                            _done();
                                        }
                                    }
                                }
                            }
                        });
                        if (_counter <= 0) {
                            return;
                        }
                        if (index + 1 >= _results.length) {
                            if (--_counter === 0) {
                                _done();
                            }
                        } else {
                            next && next();
                        }
                    } else if (tap.type === "promise") {
                        const index = i;
                        let _hasResult = false;
                        const _promise = fn(..._callArgs);
                        if (!_promise ||
                            !_promise.then) {
                            throw new Error("Tap function (tapPromise) did not return promise (returned " +
                                _promise + ")");
                        }
                        _promise.then(
                            (result) => {
                                _hasResult = true;
                                if (_counter > 0) {
                                    if (index < _results.length &&
                                        (result !== undefined && (_results.length = index + 1), (_results[index] =
                                            { result: result }), _checkDone())) {
                                        _counter = 0;
                                    } else {
                                        if (--_counter === 0) {
                                            _done();
                                        }
                                    }
                                }
                            },
                            (err) => {
                                if (_hasResult) {
                                    throw _err;
                                }
                                if (_counter > 0) {
                                    if (index < _results.length &&
                                        ((_results.length = index + 1), (_results[i] = { error: err }), _checkDone())) {
                                        _counter = 0;
                                    } else {
                                        if (--_counter === 0) {
                                            _done();
                                        }
                                    }
                                }
                            }
                        );
                        if (_counter <= 0) {
                            return;
                        }
                        if (index + 1 >= _results.length) {
                            if (--_counter === 0) {
                                _done();
                            }
                        } else {
                            next && next();
                        }
                    }
                };
            });

            tapFnList[0]();
        });
    }
}

export default AsyncParallelBailHook;
