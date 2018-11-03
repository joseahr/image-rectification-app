import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'main-controller',
      component: require('@/components/MainController').default
    },
    {
      path: '/3dviewer',
      name: '3d-viewer',
      component: require('@/components/3DViewer').default
    },
    {
      path: '/addpoint/:x/:y',
      name: 'add-point',
      component: require('@/components/AddPoint').default
    },
    {
      path: '/updatepoint/:index/:x/:y/:X/:Y/:Z',
      name: 'update-point',
      component: require('@/components/AddPoint').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
