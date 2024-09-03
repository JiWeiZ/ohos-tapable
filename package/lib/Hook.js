"use strict";

class Hook {
  constructor(args = [], name = undefined) {
    this._args = args;
    this.name = name;
    this.taps = [];
    this.interceptors = [];
  }

  getOptions(type) {
    return {
      taps: this.taps,
      interceptors: this.interceptors,
      args: this._args,
      type,
    };
  }

  call() {
    throw new Error("call is not implemented");
  }

  callAsync() {
    throw new Error("callAsync is not implemented");
  }

  promise() {
    throw new Error("promise is not implemented");
  }

  _tap(type, options, fn) {
    if (typeof options === "string") {
      options = {
        name: options.trim(),
      };
    } else if (typeof options !== "object" || options === null) {
      throw new Error("Invalid tap options");
    }
    if (typeof options.name !== "string" || options.name === "") {
      throw new Error("Missing name for tap");
    }
    if (typeof options.context !== "undefined") {
      throw new Error("Hook.context is deprecated");
    }
    options = Object.assign({ type, fn }, options);
    options = this._runRegisterInterceptors(options);
    this._insert(options);
  }

  tap(options, fn) {
    this._tap("sync", options, fn);
  }

  tapAsync(options, fn) {
    this._tap("async", options, fn);
  }

  tapPromise(options, fn) {
    this._tap("promise", options, fn);
  }

  _runRegisterInterceptors(options) {
    for (const interceptor of this.interceptors) {
      if (interceptor.register) {
        const newOptions = interceptor.register(options);
        if (newOptions !== undefined) {
          options = newOptions;
        }
      }
    }
    return options;
  }

  withOptions(options) {
    const mergeOptions = (opt) => Object.assign({}, options, typeof opt === "string" ? { name: opt } : opt);

    return {
      name: this.name,
      tap: (opt, fn) => this.tap(mergeOptions(opt), fn),
      tapAsync: (opt, fn) => this.tapAsync(mergeOptions(opt), fn),
      tapPromise: (opt, fn) => this.tapPromise(mergeOptions(opt), fn),
      intercept: (interceptor) => this.intercept(interceptor),
      isUsed: () => this.isUsed(),
      withOptions: (opt) => this.withOptions(mergeOptions(opt)),
    };
  }

  isUsed() {
    return this.taps.length > 0 || this.interceptors.length > 0;
  }

  intercept(interceptor) {
    this.interceptors.push(Object.assign({}, interceptor));
    if (interceptor.register) {
      for (let i = 0; i < this.taps.length; i++) {
        this.taps[i] = interceptor.register(this.taps[i]);
      }
    }
  }

  _insert(item) {
    let before;
    if (typeof item.before === "string") {
      before = new Set([item.before]);
    } else if (Array.isArray(item.before)) {
      before = new Set(item.before);
    }
    let stage = 0;
    if (typeof item.stage === "number") {
      stage = item.stage;
    }
    let i = this.taps.length;
    while (i > 0) {
      i--;
      const x = this.taps[i];
      this.taps[i + 1] = x;
      const xStage = x.stage || 0;
      if (before) {
        if (before.has(x.name)) {
          before.delete(x.name);
          continue;
        }
        if (before.size > 0) {
          continue;
        }
      }
      if (xStage > stage) {
        continue;
      }
      i++;
      break;
    }
    this.taps[i] = item;
  }

  // =============================== 复用的方法 ===============================

  executeInterceptorsCall(_callArgs) {
    this.interceptors.forEach((e) => e.call(..._callArgs));
  }

  executeInterceptorsTap(tap) {
    this.interceptors.forEach((e) => e.tap(tap));
  }

  executeInterceptorsError(err) {
    this.interceptors.forEach((e) => e.error(err));
  }

  executeInterceptorsDone() {
    this.interceptors.forEach((e) => e.done());
  }

  executeInterceptorsLoop(_callArgs) {
    this.interceptors.forEach((e) => e.loop(..._callArgs));
  }

  executeInterceptorsResult(res) {
    this.interceptors.forEach((e) => e.result(res));
  }
}

export default Hook;
