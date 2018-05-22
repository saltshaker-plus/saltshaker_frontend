import Vue from 'vue';
import Vuex from 'vuex';

import app from './modules/app';
import user from './modules/user';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        globalInfo: {
            uid: '',
            username: ''
        }
    },
    mutations: {
        setUserId (state, uid) {
            state.globalInfo.uid = uid;
        },
        setUserName (state, username) {
            state.globalInfo.username = username;
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
