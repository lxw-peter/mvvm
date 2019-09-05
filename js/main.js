import { MVVM } from './mvvm.js'

window.vm = new MVVM({
  el: '.app',
  data: {
    message: {
      a: 'hello'
    },
    isShow: false
  },
  methods: {
    hideUl () {
      this.isShow = !this.isShow
    }
  }
})
