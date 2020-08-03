/* eslint-disable no-shadow */

import ApiService from '@/services/api.service';
import { apiEndpoint } from '@/shared';

const endpoint = `${apiEndpoint}/calendar`;

const state = {
  rooms: null,
  roomsPending: false,
  roomsError: null,
  data: null,
  dataPending: false,
  dataError: null,
  dataUpdating: false,
  dataUpdateError: null,
};

const getters = {
  rooms: (state) => state.rooms,
  data: (state) => state.data,
  roomsLoaded: (state) => state.rooms != null,
  dataLoaded: (state) => state.data != null,
  roomsPending: (state) => state.roomsPending,
  dataPending: (state) => state.dataPending,
  roomsError: (state) => state.roomsError,
  dataError: (state) => state.dataError,
};

const mutations = {
  clearErrors(state) {
    state.roomsError = null;
    state.dataError = null;
    state.dataUpdateError = null;
  },
  beforeRooms(state, initial = false) {
    if (initial) {
      state.rooms = null;
    }
    state.roomsError = null;
    state.roomsPending = true;
  },
  beforeData(state) {
    state.data = null;
    state.dataError = null;
    state.dataPending = true;
  },
  roomsError(state, error) {
    state.roomsPending = false;
    state.roomsError = error;
  },
  dataError(state, error) {
    state.dataPending = false;
    state.dataError = error;
  },
  rooms(state, rooms) {
    state.roomsPending = false;
    state.rooms = rooms;
  },
  data(state, data) {
    state.dataPending = false;
    state.data = data;
  },
};

const actions = {
  async fetchRooms({ commit }, forced = false) {
    commit('beforeRooms', forced);
    try {
      const response = await ApiService.get(`${endpoint}/rooms`);
      commit('rooms', response.data);
    } catch (error) {
      commit('roomsError', error);
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
