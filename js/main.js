import { MVVM } from './mvvm.js'

window.vm = new MVVM({
  el: '.app',
  data: {
    message: {
      a: 'hello'
    },
    b: 2
  }
})
