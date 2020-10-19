import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    source: uni.getStorageSync('source') || '笔趣阁'
  },
  mutations: {
    SET_SOURCE (state, source) {
			uni.setStorageSync('source', source)
      state.source = source
    }
  }
})
export default store