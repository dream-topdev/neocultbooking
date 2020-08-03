<template>
  <div class="page-roomtypes">
    <div class="">
      <div class="panel-title position-relative w-100 title">
        <p>Room types</p>
      </div>

      <div class="panel position-relative panel-content">
        <div class="list d-none d-md-block">
          <p class="head-line">Your room types</p>
          <div class="room-table">
            <table class="w-100">
              <thead>
                <tr>
                  <th class="w-id">ID</th>
                  <th class="w-name">Name</th>
                  <th class="w-number">Number</th>
                  <th class="w-occupancy">Occupancy</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>

              <tbody v-for="row in rooms" :key="row.id">
                <tr class="separator before"></tr>
                <tr>
                  <td>
                    <p>{{row.id}}</p>
                  </td>
                  <td>
                    <p>{{row.text}}</p>
                  </td>
                  <td>
                    <p class="numbers">{{row.qty}}</p>
                  </td>
                  <td>
                    <p v-if="row.occupancy.min" class="numbers">{{row.occupancy.min}}-{{row.occupancy.max}}</p>
                    <p v-else class="numbers">{{row.occupancy.std}}</p>
                  </td>
                  <td class="text-right nr">
                    <svg width="20" height="20">
                      <use xlink:href="/assets/icons/icons.svg#edit"/>
                    </svg>
                    <svg width="20" height="20">
                      <use xlink:href="/assets/icons/icons.svg#copy"/>
                    </svg>
                    <svg width="20" height="20">
                      <use xlink:href="/assets/icons/icons.svg#delete"/>
                    </svg>
                  </td>
                </tr>
                <tr class="separator after"></tr>
              </tbody>
            </table>
          </div>
          <div class="d-xl-flex">
            <b-btn pill variant="outline-primary" class="add-new-room">
              <svg width="10" height="10">
                <use xlink:href="/assets/icons/icons.svg#plus"/>
              </svg>
              Add new room
            </b-btn>
          </div>
          <span class="description">Room ID and Property ID is the information relevant to connect your PMS. </span>
        </div>

        <div class="d-md-none list-item">
          <p class="head-line">Your room types</p>
          <div class="row-card" v-for="row in rooms" :key="row.id">
            <div class="d-flex wrap-1">
              <div class="flex-grow-1">
                <p class="label">Name</p>
              </div>
              <div class="dots">
                <svg width="20" height="19" class="label"><use xlink:href="/assets/icons/icons.svg#dots-h"/></svg>
              </div>
            </div>
            <div class="d-flex wrap-2">
              <div class="w-75">
                {{row.text}}
              </div>
            </div>
            <div class="d-flex wrap-3">
              <div class="w-id">
                <p class="label">ID</p>
              </div>
              <div class="w-number">
                <p class="label">Number</p>
              </div>
              <div class="w-occupancy">
                <p class="label">Occupancy</p>
              </div>
            </div>
            <div class="d-flex wrap-4">
              <div class="w-id">
                {{row.id}}
              </div>
              <div class="w-number">
                {{row.qty}}
              </div>
              <div class="text-left">
                <p v-if="row.occupancy.min">{{row.occupancy.min}}-{{row.occupancy.max}}</p>
                <p v-else>{{row.occupancy.std}}</p>
              </div>
            </div>
          </div>
          <div class="d-flex">
            <b-btn pill variant="outline-primary" class="add-new-room">
              <svg width="10" height="10">
                <use xlink:href="/assets/icons/icons.svg#plus"/>
              </svg>
              Add new room
            </b-btn>
          </div>
          <div class="d-flex">
            <span class="description">Room ID and Property ID is the information relevant to connect your PMS. </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { mapState, mapGetters, mapActions } from 'vuex';

  export default {
    name: 'RoomTypes',
    async created() {
      await this.fetchRooms(true);
    },
    computed: {
      ...mapGetters('roomtypes', ['roomsLoaded']),
      ...mapState('roomtypes', [
        'roomsError', 'roomsPending', 'rooms',
      ]),
    },
    methods: {
      ...mapActions('roomtypes', ['fetchRooms']),
    },
  };
</script>
