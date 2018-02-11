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
function Vue({el, data}, path) {
    this.data = data
    this._eventBus = event
    this._path = path || ''
    this.walk(data)
    if (el) {
        this.$el = document.getElementById(el.slice(1))
        this._html = this.$el.innerHTML
        this.render(this._html)
    }
}

Vue.prototype.walk = function (data) {
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
                new Vue({data: val}, path)
            }
            // 调用convert函数，将对对象数据属性的访问转换为对访问器属性的访问
            this.convert(val, key)
        }
    }
}

Vue.prototype.convert = function (val, key) {
    const _self = this
    // this.data表示data对象，为data的属性设置同名的访问器属性
    // 访问器实际上访问和修改的值是闭包val，仅仅用data对象数据属性进行初始化
    Object.defineProperty(this.data, key, {
        configurable: true,
        enumerable: true,
        get: function () {
            return val
        },
        set: function (v) {
            const noPostPath = _self._path + key
            if (typeof v === 'object') {
                new Vue({data: v}, noPostPath + '.')
            }

            if (v !== val) {
                _self._eventBus.emit(noPostPath, v, val)
                val = v
            }
        }
    })
}

// 只需要实现$watch的api
Vue.prototype.$watch = function (evtType, callback) {
    this._eventBus.on(evtType, callback)
}

// 渲染HTML
Vue.prototype.render = function (html) {
    const pattern = /\{\{(.*)\}\}/g
    while (true) {
        // 匹配innerHTML，修改html，防止lastIndex越界导致有元素没有匹配到
        const res = pattern.exec(this._html)
        if (!res) {
            break
        }

        let renderText = this.parse(res[1].trim())
        if (!renderText) {
            renderText = ''
        }
        html = html.replace(res[0], renderText)
    }
    this.$el.innerHTML = html
}

// parse出绑定的数据内容
Vue.prototype.parse = function (path) {
    const props = path.split('.')
    let data = this.data
    while (props.length > 0) {
        const prop = props.shift()
        data = data[prop]
    }
    return data
}