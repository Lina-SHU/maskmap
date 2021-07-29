import { createApp } from 'vue'
import 'bootstrap'
import axios from 'axios'
import VueAxios from 'vue-axios'
import App from './App.vue'
import router from './router'

import weekToChinese from './assets/week'

const app = createApp(App)
app.config.globalProperties.$weekToChinese = weekToChinese
app.use(VueAxios, axios)
app.use(router)
app.mount('#app')
