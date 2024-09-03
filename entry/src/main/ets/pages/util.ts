import hilog from '@ohos.hilog';

export const console = {
  log: (...args) => {
    hilog.debug(0x0100, "tapable", args.map(e => typeof e === "string" ? e : JSON.stringify(e)).join(","))
  }
}

export const intercept = (hook) => {
  const i = {
    register: (tapInfo) => {
      console.log("register", `${tapInfo.name} is doing its job`);
      return tapInfo;
    },
    call: (...args) => {
      console.log("call", args);
    },
    tap: (tapInfo) => {
      console.log("🚀 ==> tapInfo:", tapInfo);
    },
    loop: (...args) => {
      console.log("loop", args);
    },
    done: (...args) => {
      console.log("done", args);
    },
    error: (...args) => {
      console.log("error", args);
    },
    result: (...args) => {
      console.log("result", args);
    },
    name: "test",
  };
  hook.intercept(i);
};

export const callAsyncHook = (hook) => {
  hook.callAsync("a", "b", "c", (err, res) => {
    console.log("🚀 ==> callAsync err:", err);
    console.log("callAsync done", res);

    hook
      .promise("a", "b", "c")
      .then((res) => {
        console.log("promise done", res);
      })
      .catch((err) => {
        console.log("🚀 ==> promise err:", err);
      });
  });
};

export const callSyncHook = (hook) => {
  hook.call("a", "b", "c", (err, res) => {
    console.log("🚀 ==> err:", err);
    console.log("call sync done", res);
  });
};


