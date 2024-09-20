export const globalInterceptors = {
    _value: {},
    get value() {
        return Object.values(this._value)
    }
}

export const registerGlobalInterceptor = (id, interceptor) => {
    globalInterceptors._value[id] = interceptor;
}