import { AsyncSeriesHook } from 'tapable';
import { callAsyncHook, console, intercept } from './util';

@Entry
@Component
struct Index {
  @State message: string = 'Hello World';

  aboutToAppear() {
    const hook = new AsyncSeriesHook<[string, string, string]>(["arg1", "arg2", "arg3"]);

    hook.tapPromise("flag0", (arg1, arg2, arg3) => {
      console.log("flag0:", arg1, arg2, arg3);
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    });

    hook.tapAsync("flag1", (arg1, arg2, arg3, callback) => {
      console.log("flag1:", arg1, arg2, arg3);
      setTimeout(() => {
        callback(false);
      }, 1000);
    });

    hook.tapPromise("flag2", (arg1, arg2, arg3) => {
      console.log("flag2:", arg1, arg2, arg3);
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    });

    hook.tapPromise("flag3", (arg1, arg2, arg3) => {
      console.log("flag3:", arg1, arg2, arg3);
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    });

    intercept(hook);
    callAsyncHook(hook);
  }

  build() {
    RelativeContainer() {
      Text(this.message)
        .id('HelloWorld')
        .fontSize(50)
        .fontWeight(FontWeight.Bold)
        .alignRules({
          center: { anchor: '__container__', align: VerticalAlign.Center },
          middle: { anchor: '__container__', align: HorizontalAlign.Center }
        })
    }
    .height('100%')
    .width('100%')
  }
}