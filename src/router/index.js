import Vue from 'vue';
import VueRouter from 'vue-router';
// import Home from '../views/Home.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    // component: Home,
    redirect: { name: 'calendar' },
  },
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Welcome',
      public: true,
      guestOnly: true,
    },
    component: () => import(/* webpackChunkName: "auth" */ '@/views/Auth/Login.vue'),
  },
  {
    path: '/register',
    name: 'register',
    meta: {
      title: 'Sign Up',
      sideBar: false,
      public: true,
      guestOnly: true,
    },
    component: () => import(/* webpackChunkName: "auth" */ '@/views/Auth/Register.vue'),
  },
  {
    path: '/password/email',
    name: 'password.email',
    meta: {
      title: 'Forgot Password',
      public: true,
      guestOnly: true,
    },
    component: () => import(/* webpackChunkName: "auth" */ '@/views/Auth/ForgotPassword.vue'),
  },
  {
    path: '/password/reset',
    name: 'password.reset',
    meta: {
      title: 'Reset Password',
      public: true,
      guestOnly: true,
    },
    component: () => import(/* webpackChunkName: "auth" */ '@/views/Auth/ResetPassword.vue'),
  },
  {
    path: '/email/verify/:id?/:hash?',
    name: 'verification.notice',
    meta: {
      sideBar: false,
      title: 'Verification',
      centered: true,
    },
    component: () => import(/* webpackChunkName: "user" */ '@/views/User/VerifyEmailNotice.vue'),
  },
  {
    path: '/details',
    name: 'details',
    meta: {
      centered: true,
    },
    component: () => import(/* webpackChunkName: "user" */ '@/views/User/Details.vue'),
  },
  {
    path: '/calendar',
    name: 'calendar',
    meta: {
      title: 'Calendar',
    },
    component: () => import(/* webpackChunkName: "calendar" */ '@/views/Calendar.vue'),
  },
  {
    path: '/reservations',
    name: 'reservations',
    meta: {
      title: 'Reservations',
    },
    component: () => import(/* webpackChunkName: "reservations" */ '@/views/Reservations.vue'),
  },
  {
    path: '/room-types',
    name: 'room-types',
    meta: {
      title: 'Room Types',
    },
    component: () => import(/* webpackChunkName: "roomtypes" */ '@/views/RoomTypes.vue'),
  },
  {
    path: '/rate-plans',
    name: 'rate-plans',
    meta: {
      title: 'Rate Plans',
    },
    component: () => import(/* webpackChunkName: "rateplans" */ '@/views/RatePlans.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  linkExactActiveClass: 'exact-active',
  linkActiveClass: 'active',
  routes,
});

export default router;

const initialRoute = 'calendar';
export { initialRoute, router };

// router.beforeResolve((to, from, next) => {
//   const { title, sideBar, centered } = to.meta;
//   // const { $store } = router.app;
//   $store.commit('pageTitle', title);
//   $store.commit('sidebar', sideBar);
//   $store.commit('centered', centered);
//   next();
// });
