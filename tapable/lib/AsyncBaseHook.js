import Hook from "./Hook";

class AsyncBaseHook extends Hook {
  handleSyncTap() {
    throw new Error(`${this.constructor.name} does not support sync tap`);
  }
}

export default AsyncBaseHook;
