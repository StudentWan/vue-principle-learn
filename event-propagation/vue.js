// Observer构造函数
// Observer构造函数为参数对象设置访问器属性，以实现数据观察
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
            // 以对象属性的初始值设置val
            val = data[key]
            if (typeof val === 'object') {
                // 如果val仍是对象，以val为参数调用Observer构造函数
                // 该构造函数调用为val对象中的属性设置getter和setter
                new Observer(val)
            }

            // 调用convert函数，将对对象数据属性的访问转换为对访问器属性的访问
            this.convert(val, key)
        }
    }
}

proto.convert = function (val, key) {
    const self = this
    // 访问器实际上访问和修改的值是闭包val，仅仅用对象数据属性进行初始化
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

    console.log(this)
}

