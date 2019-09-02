import { Dep } from './dep.js'

export class Observer {
  constructor (data) {
    this.observer(data)
  }
  observer (data) {
    let that = this
    if (!data || typeof data !== 'object') return
    Object.keys(data).forEach(key => {
      that.defineReactive(data, key, data[key])
      that.observer(data[key])
    })
  }
  defineReactive (object, key, value) {
    let that = this
    let dep = new Dep() // 每个变化的数据都会对应一个数据, 这个数组存放所有更新的操作
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      get () {
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set (newValue) {
        that.observer(newValue)
        value = newValue
        dep.notify()
      }
    })
  }
}
