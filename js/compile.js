import { Watcher } from './watcher.js'

export class Compile {
  constructor (el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el)
    this.vm = vm
    if (this.el) {
      // 如果元素能获取到, 才开始编译
      // 1. 先把真实DOM 移入内存中 DocumentFragment
      let fragment = this.node2fragment(this.el)
      // 2. 编译 => 提取 v-model 和文本节点
      this.compile(fragment)
      // 3. 把编译好的 fragment 填充到节点中
      this.el.appendChild(fragment)
    }
  }
  isElementNode (node) {
    return node.nodeType === 1
  }
  node2fragment (el) { // 需要将 el 中的内容全部放入内存中
    // 文档碎片
    let fragment = document.createDocumentFragment()
    let firstChild
    while (firstChild = el.firstChild) {
      fragment.appendChild(firstChild)
    }
    return fragment // 内存中的节点
  }
  isDirective (name) {
    return name.includes('v-')
  }
  compileElement (node) {
    let attrs = node.attributes
    Array.from(attrs).forEach(attr => {
      let attrName = attr.name
      // 判断属性名是否包含v-
      if (this.isDirective(attrName)) {
        // 取到对应的值放到对应节点中
        let expr = attr.value
        let type = attrName.slice(2)
        // node this.vm.$data expr v-model v-text v-html
        CompileUtil[type](node, this.vm, expr)
      }
    })
  }
  compileText (node) {
    let expr = node.textContent
    let reg = /\{\{([^}]+)\}\}/g
    if (reg.test(expr)) {
      // node this.vm.$data
      expr = expr.match(reg)[0]
      CompileUtil['text'](node, this.vm, expr)
    }
  }
  compile (fragment) {
    let childNodes = fragment.childNodes
    Array.from(childNodes).forEach(node => {
      if (this.isElementNode(node)) {
        this.compileElement(node)
        this.compile(node)
      } else {
        this.compileText(node)
      }
    })
  }
}
let CompileUtil = {
  parentNode: {},
  getVal (vm, expr) {
    expr = expr.split('.')
    return expr.reduce((prev, next) => {
      return prev[next]
    }, vm.$data)
  },
  getTextVal (vm, expr) {
    return expr.replace(/\{\{([^}]+)\}\}/g, (...rest) => {
      return this.getVal(vm, rest[1])
    })
  },
  setVal (vm, expr, value) {
    expr = expr.split('.')
    return expr.reduce((prev, next, currentIndex) => {
      if (currentIndex === expr.length - 1) {
        return prev[next] = value
      }
      return prev[next]
    }, vm.$data)
  },

  text (node, vm, expr) { // 文本处理
    let updateFn = this.updater['textUpdater']
    // {{message.a}} => hello
    let value = this.getTextVal(vm, expr)
    // 加入监控, 数据变化调用出watch的callback
    // {{a}}{{b}} => {a => watcher ,b => watcher}
    expr.replace(/\{\{([^}]+)\}\}/g, (...rest) => {
      new Watcher(vm, rest[1], (newVal) => {
        updateFn && updateFn(node, this.getTextVal(vm, expr))
      })
    })
    updateFn && updateFn(node, value)
  },

  model (node, vm, expr) { // 输入框
    let updateFn = this.updater['modelUpdater']
    // 加入监控, 数据变化调用出watch的callback
    new Watcher(vm, expr, (newVal) => {
      updateFn && updateFn(node, newVal)
    })

    node.addEventListener('input', (e) => {
      let newVal = e.target.value
      this.setVal(vm, expr, newVal)
    })
    updateFn && updateFn(node, this.getVal(vm, expr))
  },
  show (node, vm, expr) {
    let updateFn = this.updater['showUpdater']
    new Watcher(vm, expr, (newVal) => {
      updateFn && updateFn(node, newVal)
    })
    updateFn && updateFn(node, this.getVal(vm, expr))
  },
  click (node, vm, expr) {
    node.addEventListener('click', () => {
      console.log(0)
      let fn = vm.$methods[expr].toString().replace(/this/g, 'vm').replace(/.+\{/g, '').replace(/\}$/g, '').trim()
      new Function(fn)()
    })
  },
  updater: {
    textUpdater (node, value) {
      node.textContent = value
    },
    modelUpdater (node, value) {
      node.value = value
    },
    showUpdater (node, value) {
      if (value === true) {
        node.style.display = 'block'
      } else {
        node.style.display = 'none'
      }
    }
  }
}
