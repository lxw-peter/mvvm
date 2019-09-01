import { MVVM } from './mvvm.js'

let vm = new MVVM({
  el: '.app',
  data: {
    message: {
      a: 'hello'
    }
  }
})
