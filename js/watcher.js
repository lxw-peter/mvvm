import { Dep } from './dep.js'

export class Watcher {
  constructor (vm, expr, cb) {
    this.vm = vm
    this.expr = expr
    this.cb = cb
    this.value = this.get() // 旧值
  }
  getVal (vm, expr) {
    expr = expr.split('.')
    return expr.reduce((prev, next) => {
      return prev[next]
    }, vm.$data)
  }
  get () {
    Dep.target = this
    let value = this.getVal(this.vm, this.expr)
    Dep.target = null
    return value
  }
  update () {
    let newValue = this.getVal(this.vm, this.expr)
    let oldValue = this.value
    this.value = newValue
    if (newValue !== oldValue) {
      this.cb(newValue)
    }
  }
}
