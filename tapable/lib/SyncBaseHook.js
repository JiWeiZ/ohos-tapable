import Hook from "./Hook";

class SyncBaseHook extends Hook {
  constructor(...args) {
    super(...args)
  }

  tapAsync() {
    throw new Error(`tapAsync is not supported on a ${this.constructor.name}`);
  }

  tapPromise() {
    throw new Error(`tapPromise is not supported on a ${this.constructor.name}`);
  }
}

export default SyncBaseHook;
