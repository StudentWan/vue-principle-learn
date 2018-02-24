// Observer构造函数
// Observer构造函数为参数对象设置访问器属性，以实现数据观察
function Observer(data) {
    this.data = data
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

            // 如果新设置的值是一个对象的话，继续监测该对象
            if (typeof v === 'object') {
                new Observer(v)
            }

            if (v !== val) {
                val = v
            }
        }
    })
}