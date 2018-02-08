function Observer(data) {
    this.data = data
    this.handlers = {}
    this.walk(data)
}

const proto = Observer.prototype

proto.walk = function (data) {
    let val
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            val = data[key]
            if (typeof val === 'object') {
                new Observer(val)
            }

            this.convert(val, key)
        }
    }
}

proto.convert = function (val, key) {
    const self = this
    Object.defineProperty(this.data, key, {
        configurable: true,
        enumerable: true,
        get: function () {
            console.log('你访问了：' + key)
            return val
        },
        set: function (v) {
            console.log('你设置了：' + key)
            console.log(key + ' = ' + v)

            if (typeof v === 'object') {
                new Observer(v)
            }

            if (v !== val) {
                val = v
            }

            self.$emit(key, v)
        }
    })
}

proto.$watch = function (evtType, handler) {
    // 订阅事件
    if (!(evtType in this.handlers)) {
        this.handlers[evtType] = []
    }
    this.handlers[evtType].push(handler)
    return this
}

proto.$emit = function (evtType, ...args) {
    // 发布事件
    // 判断条件的用处在于防止没有观察者时报错
    if (Object.prototype.toString.call(this.handlers[evtType]) === '[object Array]') {
        for (const handler of this.handlers[evtType]) {
            handler.apply(this, args)
        }
    }
}
