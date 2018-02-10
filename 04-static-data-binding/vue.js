function Vue({el, data}) {
    this.$el = document.getElementById(el.slice(1))
    this.data = data
    this.render(this.$el.outerHTML)
}

Vue.prototype.render = function (html) {
    const pattern = /\{\{(.*)\}\}/g
    while (true) {
        const res = pattern.exec(html)
        if (!res) {
            break
        }

        let renderText = this.parse(res[1].trim())
        if (!renderText) {
            renderText = ''
        }
        html = html.replace(res[0], renderText)
    }
    this.$el.outerHTML = html
}

Vue.prototype.parse = function (path) {
    const props = path.split('.')
    let data = this.data
    while (props.length > 0) {
        const prop = props.shift()
        data = data[prop]
    }
    return data
}