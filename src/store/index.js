import Vue from 'vue';
import Vuex from 'vuex';

import app from './modules/app';
import user from './modules/user';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        globalInfo: {
            uid: ''
        }
    },
    mutations: {
        setUserId (state, uid) {
            state.globalInfo.uid = uid;
        }
    },
    actions: {

    },
    modules: {
        app,
        user
    }
});

export default store;
