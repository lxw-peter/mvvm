import { Compile } from './compile.js'
export class MVVM {
  constructor (options) {
    this.$el = options.el
    this.$data = options.data

    if (this.$el) {
      // 对数据和元素编译
      new Compile(this.$el, this)
    }
  }
}
