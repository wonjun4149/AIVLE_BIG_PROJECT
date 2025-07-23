import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../components/pages/Index.vue'),
    },
    {
      path: '/ais',
      component: () => import('../components/ui/AiGrid.vue'),
    },
    {
      path: '/terms',
      component: () => import('../components/ui/TermGrid.vue'),
    },
    {
      path: '/users',
      component: () => import('../components/ui/UserGrid.vue'),
    },
    {
      path: '/points',
      component: () => import('../components/ui/PointGrid.vue'),
    },
    {
      path: '/getPoints',
      component: () => import('../components/GetPointView.vue'),
    },
  ],
})

export default router;
