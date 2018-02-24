// 发布-订阅构造函数
function Event() {
    this.handlers = {}
}

// 订阅事件
Event.prototype.on = function (evtType, callback) {
    if (!(evtType in this.handlers)) {
        this.handlers[evtType] = []
    }
    this.handlers[evtType].push(callback)
    return this
}

// 发布事件
Event.prototype.emit = function (evtType, ...args) {
    // 防止事件没有订阅时仍然被发布，导致找不到事件处理程序而报错
    if (Object.prototype.toString.call(this.handlers[evtType]) === '[object Array]') {
        for (const handler of this.handlers[evtType]) {
            handler.apply(this, args)
        }
    }
    // 事件传播
    // 按照属性的层级，向上传播发布
    // 如，app.data.name.firstName
    // 既可订阅'name.firstName'
    // 也可订阅'name'
    evtType = evtType.split('.')
    evtType.pop()
    if (evtType.length > 0) {
        this.emit(evtType.join('.'), ...args)
    }
    return this
}

/*---Event类---*/

// Observer构造函数
// Observer构造函数为参数对象设置访问器属性，以实现数据观察
function Observer(data, path) {
    this.data = data
    this.walk(data)
    // 每一个属性对象，相对于根的data属性都有一条路径
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
                // 让迭代的下一级对象拥有上级的路径
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
    // 保存Observer对象的this
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
                event.emit(noPostPath, v, val)
                val = v
            }
        }
    })
}

// 实现$watch的api
// Observer.prototype.$watch(evtType,callback(newVal, oldVal) {})
Observer.prototype.$watch = function (evtType, callback) {
    event.on(evtType, callback)
}

/*---Observer类---*/

// 必须设置一个全局的EventBus，否则迭代生成的Observer类无法触发事件
const event = new Event()
