// 发布-订阅构造函数
function Event() {
    this.handlers = {}
}

Event.prototype.on = function (evtType, callback) {
    if (!(evtType in this.handlers)) {
        this.handlers[evtType] = []
    }
    this.handlers[evtType].push(callback)
    return this
}

Event.prototype.emit = function (evtType, ...args) {
    if (Object.prototype.toString.call(this.handlers[evtType]) === '[object Array]') {
        for (const handler of this.handlers[evtType]) {
            handler.apply(this, args)
        }
    }
    // 事件传播
    evtType = evtType.split('.')
    evtType.pop()
    if (evtType.length > 0) {
        this.emit(evtType.join('.'), ...args)
    }
    return this
}

// 必须设置一个全局的EventBus，否则迭代生成的Observer类无法触发事件
const event = new Event()

// Observer构造函数
// Observer构造函数为参数对象设置访问器属性，以实现数据观察
function Observer(data, path) {
    this.data = data
    this.walk(data)
    this._eventBus = event
    this._path = path || ''
}

Observer.prototype.walk = function (data) {
    let val
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            // 以对象属性的初始值设置val
            val = data[key]
            if (typeof val === 'object') {
                // 如果val仍是对象，以val为参数调用Observer构造函数
                // 该构造函数调用为val对象中的属性设置getter和setter
                let path
                if (this._path) {
                    path = this._path + key + '.'
                }
                else {
                    path = key + '.'
                }
                new Observer(val, path)
            }
            // 调用convert函数，将对对象数据属性的访问转换为对访问器属性的访问
            this.convert(val, key)
        }
    }
}

Observer.prototype.convert = function (val, key) {
    const _self = this
    // this.data表示data对象，为data的属性设置同名的访问器属性
    // 访问器实际上访问和修改的值是闭包val，仅仅用data对象数据属性进行初始化
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
            const noPostPath = _self._path + key
            if (typeof v === 'object') {
                new Observer(v, noPostPath + '.')
            }

            if (v !== val) {
                _self._eventBus.emit(noPostPath, v, val)
                val = v
            }
        }
    })
}

// 只需要实现$watch的api
Observer.prototype.$watch = function (evtType, callback) {
    this._eventBus.on(evtType, callback)
}
