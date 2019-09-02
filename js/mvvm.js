import { Compile } from './compile.js'
import { Observer } from './observer.js'
export class MVVM {
  constructor (options) {
    this.$el = options.el
    this.$data = options.data

    if (this.$el) {
      new Observer(this.$data)
      this.proxyData(this.$data)
      // 对数据和元素编译
      new Compile(this.$el, this)
    }
  }
  proxyData (data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        get () {
          return data[key]
        },
        set (newVal) {
          data[key] = newVal
        }
      })
    })
  }
}
