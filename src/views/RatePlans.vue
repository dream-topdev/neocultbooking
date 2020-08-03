<template>
  <div class="page-rateplans">
    <div class="">
      <div class="panel-title position-relative w-100 title">
        <p>Rate plans</p>
      </div>

      <b-modal
        id="planModal"
        ref="planModal"
        no-fade
        centered
        static
        size="lg"
        modal-class="form-modal"
        :ok-title="plan.pid != null ? 'Update' : 'Save'"
        ok-variant="primary"
        cancel-title="Cancel"
        cancel-variant="outline-primary"
        :ok-disabled="updatePending || !$refs.planForm || !formValid || !$refs.planForm.flags.valid"
        :cancel-disabled="updatePending"
        :no-close-on-esc="updatePending"
        :no-close-on-backdrop="updatePending"
        :hide-header-close="updatePending"
        @ok.prevent="processForm"
      >
        <template #modal-header-close>
          <svg width="20" height="20" class="d-none d-md-block"><use xlink:href="/assets/icons/icons.svg#times"/></svg>
          <svg width="10" height="18" class="d-md-none"><use xlink:href="/assets/icons/icons.svg#arrow-left"/></svg>
        </template>
        <template #modal-title>
          {{ plan.pid != null ? 'Edit' : 'New' }} rate plan
        </template>
        <ValidationObserver ref="planForm" slim>
          <div class="edge" :class="{ active: edgeRoomLang }">
            <h3 content="Connect rate plan with room type"></h3>
            <lang-selector v-model="lang" :valid="langsValid" />
            <div class="link-figure">
              <svg width="22" height="22" class="link-figure-icon">
                <use xlink:href="/assets/icons/icons.svg#link"/>
              </svg>
              <h5>What is the name of your rate plan?</h5>
              <div class="lang-choice" v-for="code in langCodes" :key="code" v-show="lang.code === code">
                <ValidatedField type="text" :name="`lang-${code}`" class="plan-name" no-icon
                                v-model="plan.langs[code].name" :disabled="updatePending"
                                @input="toggleLangValid($event, code)"
                                :rules="code === 'en' ? 'required' : ''"/>
                <b-textarea no-resize class="plan-desc" placeholder="Description"
                            v-model="plan.langs[code].desc" :disabled="updatePending"></b-textarea>
              </div>
              <h5>Room type selection</h5>
            </div>
            <drop-down
              id="dd-rooms"
              v-model="plan.room"
              :items="rooms"
              id-key="pid"
              :disabled="updatePending || plan.protected"
            />
          </div>
          <div class="edge edge-settings">
            <h4 :class="{ opened: settingsOpened }" @click="settingsOpened=!settingsOpened">
              Settings
              <svg width="12" height="7" stroke-width="2">
                <use xlink:href="/assets/icons/icons.svg#arrow-down"/>
              </svg>
            </h4>
            <div>
              <h3 content="Travel days"></h3>
              <div class="row row-travel d-none d-md-flex">
                <div class="col cell-travel">
                  <div class="cell-travel-title">
                    <p v-for="{ key, text } in travelOpts" :key="`tt-${key}`" v-text="key?`${text} days`:''"></p>
                  </div>
                  <div class="cell-travel-alls">
                    <p v-for="{ key } in travelOpts" :key="`ta-${key}`">
                      <template v-if="!key">All</template>
                      <check-box v-else empty :disabled="updatePending"
                                 :value="isTravelAll(key)" @input="toggleTravelAll(key, $event)" />
                    </p>
                  </div>
                  <div class="cell-travel-wd" v-for="wd in weekdays" :key="`twd-${wd}`">
                    <p v-for="{ key } in travelOpts" :key="`td-${key}`">
                      <template v-if="!key">{{ wd }}</template>
                      <check-box v-else empty :disabled="updatePending"
                                 :value="isTravelDay(key, wd)" @input="toggleTravelDay(key, wd, $event)" />
                    </p>
                  </div>
                </div>
              </div>
              <div class="row row-travel d-md-none" v-for="{ key, text } in travelOptsFiltered" :key="`tt-sm-${key}`">
                <div class="col-12 cell-travel-title">
                  <h5>{{ text}} days</h5>
                </div>
                <div class="col">
                  <div class="d-flex cell-travel">
                    <div class="wd-item wd-all">
                      <check-box :disabled="updatePending" :value="isTravelAll(key)"
                                 @input="toggleTravelAll(key, $event)"
                      >All</check-box>
                    </div>
                    <div class="wd-item" v-for="wd in weekdays" :key="`ttwd-sm-${key}-${wd}`">
                      <check-box :disabled="updatePending" :value="isTravelDay(key, wd)"
                                 @input="toggleTravelDay(key, wd, $event)"
                      >{{ wd }}</check-box>
                    </div>
                  </div>
                </div>
              </div>
              <h3 content="Length of stay"></h3>
              <div class="row row-settings">
                <div class="col cell-minlos">
                  <label class="text-xs" for="minlos">Minimum</label>
                  <ValidatedField
                    type="number" id="minlos" name="minlos" min="1" max="999" class="mb-0" no-icon no-tooltip
                    v-model="plan.minlos" :disabled="updatePending"
                    :rules="rulesFor('minlos')"
                  />
                </div>
                <div class="col cell-maxlos">
                  <label class="text-xs" for="maxlos">Maximum</label>
                  <ValidatedField
                    type="number" id="maxlos" name="maxlos" min="1" max="999" class="mb-0" no-icon no-tooltip
                    v-model="plan.maxlos" :disabled="updatePending"
                    :rules="rulesFor('maxlos')"
                  />
                </div>
              </div>
              <h3 content="Meal type"></h3>
              <div class="row row-settings">
                <div class="col cell-meals">
                  <drop-down
                    id="dd-meals"
                    v-model="plan.meals"
                    :items="meals"
                    :disabled="updatePending"
                  />
                </div>
              </div>
              <h3 content="Cancellation policies"></h3>
              <div class="row row-settings">
                <div class="col cell-cancels">
                  <drop-down
                    id="dd-cancels"
                    select-all
                    multiple
                    title="policies"
                    v-model="plan.cancels"
                    :items="cancels"
                    :disabled="updatePending"
                  />
                  <p class="data-desc oneline" v-for="{ id, desc } in selectedCancels" :key="`cpd-${id}`">
                    <button class="btn-icon btn-tiny" @click="removeCancelPolicy(id)">
                      <svg width="7" height="7">
                        <use xlink:href="/assets/icons/icons.svg#times"/>
                      </svg>
                    </button>
                    {{ desc }}
                  </p>
                </div>
              </div>
              <h3 content="Booking guaranty"></h3>
              <div class="row row-settings">
                <div class="col cell-bgarants">
                  <drop-down
                    id="dd-bgarants"
                    v-model="plan.bgarant"
                    :items="bgarants"
                    :disabled="updatePending"
                  />
                  <p class="data-desc">
                    {{ bgarantDesc }}
                  </p>
                </div>
              </div>
              <h3 content="Payment policy"></h3>
            </div>
          </div>
          <div class="edge edge-price">
            <h4 :class="{ opened: priceOpened }" @click="priceOpened=!priceOpened">
              Price section
              <svg width="12" height="7" stroke-width="2">
                <use xlink:href="/assets/icons/icons.svg#arrow-down"/>
              </svg>
            </h4>
            <div>
              <h3 :content="roomSelected ? `Price for ${plan.occupancy.std} people/night` : 'Price'"></h3>
              <div class="row row-edit">
                <div class="col cell-edit-label double">
                  <radio v-model="plan.price.mode" :disabled="updatePending || !roomSelected"
                         name="price_mode" val="standard">Standard price</radio>
                </div>
                <div class="col cell-edit-tip">
                  <span class="d-none d-md-inline">
                    Daily standard price is taken from calendar. Price can fluctuate.
                  </span>
                  <span class="d-md-none">
                    Daily standard price is taken from calendar.
                  </span>
                </div>
              </div>
              <div class="row row-edit">
                <div class="col cell-edit-label smaller">
                  <radio v-model="plan.price.mode" :disabled="updatePending || !roomSelected"
                         name="price_mode" val="fixed" class="text-nowrap">Fixed price</radio>
                </div>
                <div class="col cell-edit-field single bigger">
                  <amount-percent simple v-model="plan.price.fixed"
                                  :required="plan.price.mode==='fixed'"
                                  :disabled="updatePending || !roomSelected || plan.price.mode!=='fixed'"
                  />
                </div>
                <div class="col cell-edit-tip">
                  Price is the same for all time.
                </div>
              </div>
              <h3 class="stdcalc-title" content="Surcharge or reduction on standard price"></h3>
              <div class="row row-edit no-tip">
                <div class="col cell-edit-label smaller">
                  <radio
                    v-model="plan.price.stdcalc.mode"
                    :disabled="updatePending || !roomSelected || plan.price.mode!=='standard'"
                    name="price_std_fix"
                    val="surcharge"
                  >Surcharge</radio>
                </div>
                <div class="col cell-edit-field bigger">
                  <amount-percent
                    positive :price="plan.price.std" :result.sync="plan.price.stdres"
                    v-model="plan.price.stdcalc.surcharge"
                    :disabled="updatePending || !roomSelected
                      || plan.price.mode!=='standard' || plan.price.stdcalc.mode!=='surcharge'
                    "
                  />
                  <!-- :required="plan.price.mode==='standard' && plan.price.stdfix.mode==='surcharge'"-->
                </div>
              </div>
              <div class="row row-edit no-tip">
                <div class="col cell-edit-label smaller">
                  <radio
                    v-model="plan.price.stdcalc.mode"
                    :disabled="updatePending || !roomSelected || plan.price.mode!=='standard'"
                    name="price_std_fix"
                    val="reduction"
                  >Reduction</radio>
                </div>
                <div class="col cell-edit-field bigger">
                  <amount-percent
                    negative :price="plan.price.std" :result.sync="plan.price.stdres"
                    v-model="plan.price.stdcalc.reduction"
                    :disabled="updatePending || !roomSelected
                      || plan.price.mode!=='standard' || plan.price.stdcalc.mode!=='reduction'
                    "
                  />
                  <!-- :required="plan.price.mode==='standard' && plan.price.stdfix.mode==='reduction'"-->
                </div>
              </div>
              <h3 content="Do you allow count of guests more or less than standard occupancy?"></h3>
              <div class="row row-edit row-occupancy no-tip">
                <div class="col cell-edit-field single">
                  <label class="text-xs" for="occ-min">Minimum</label>
                  <ValidatedField
                    type="number" integer purenumber no-icon no-tooltip
                    id="occ-min" name="occ-min" min="1" max="999" class="mb-0"
                    v-model="plan.occupancy.min" :disabled="updatePending || !roomSelected"
                    :rules="rulesFor('minocc')"
                  />
                </div>
                <div class="col cell-edit-field single inverted">
                  <label class="text-xs">Standard</label>
                  <b-input disabled :value="plan.occupancy.std"/>
                </div>
                <div class="col cell-edit-field single">
                  <label class="text-xs" for="occ-max">Maximum</label>
                  <ValidatedField
                    type="number" integer purenumber no-icon no-tooltip
                    id="occ-max" name="occ-min" min="1" max="999" class="mb-0"
                    v-model="plan.occupancy.max" :disabled="updatePending || !roomSelected"
                    :rules="rulesFor('maxocc')"
                  />
                </div>
                <div class="col cell-edit-fields cell-guests-price d-none d-md-flex">
                  <guests-price :std="plan.price.mode==='standard'" currency="EUR" :guests="plan.occupancy.std"
                                :price="planFinalPrice"/>
                </div>
              </div>
              <div class="inner" v-if="notStandardOccupancy">
                <h3 class="line" content="Surcharge or reduction for 1 person"></h3>
                <div class="row row-edit row-surcharge d-none d-md-flex">
                  <div class="col cell-edit-field">
                    <div class="row row-edit">
                      <div class="col cell-edit-label">
                        Surcharge
                      </div>
                      <div class="col cell-edit-field">
                        <amount-percent
                          positive :price="planFinalPrice"
                          v-model="plan.price.calc.surcharge"
                          :disabled="updatePending"
                        />
                      </div>
                    </div>
                    <div class="w-100"></div>
                    <div class="row row-edit">
                      <div class="col cell-edit-label">
                        Reduction
                      </div>
                      <div class="col cell-edit-field">
                        <amount-percent
                          negative :price="planFinalPrice"
                          v-model="plan.price.calc.reduction"
                          :disabled="updatePending"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="col cell-edit-fields cell-guests-price">
                    <guests-price-multiple
                      currency="EUR" :occupancy="plan.occupancy" :price="planFinalPrice"
                      :surcharge="plan.price.calc.surcharge" :reduction="plan.price.calc.reduction"/>
                  </div>
                </div>
                <div class="row row-edit d-md-none no-tip">
                  <div class="col cell-edit-label smaller">
                    Surcharge
                  </div>
                  <div class="col cell-edit-field bigger">
                    <amount-percent
                      positive :price="planFinalPrice"
                      v-model="plan.price.calc.surcharge"
                      :disabled="updatePending"
                    />
                  </div>
                </div>
                <div class="row row-edit d-md-none no-tip">
                  <div class="col cell-edit-label smaller">
                    Reduction
                  </div>
                  <div class="col cell-edit-field bigger">
                    <amount-percent
                      negative :price="planFinalPrice"
                      v-model="plan.price.calc.reduction"
                      :disabled="updatePending"
                    />
                  </div>
                </div>
                <h3 class="line" content="Extra bed for children"></h3>
                <div class="row row-edit no-tip" v-for="cs in plan.price.calc.children" :key="`cbed-${cs.id}`">
                  <div class="col cell-edit-field single smaller">
                    <ValidatedField type="number" purenumber integer min="1" max="18" no-icon no-tooltip
                                    placeholder="Age" :rules="rulesFor('child-age')"
                                    v-model="cs.age" :name="`cha-${cs.id}`" class="mb-0"
                    />
                  </div>
                  <div class="col cell-edit-field bigger">
                    <amount-percent
                      positive v-model="cs.surcharge"
                      :disabled="updatePending"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="edge">
            <h3 content="Validity period"></h3>
            <div class="row row-validity">
              <div class="col-12 cell-val-from">
                <label class="text-xs" for="date-val-from">From</label>
                <date-picker id="date-val-from" v-model="plan.validity.from" :min-date="today" grow="md-up"
                             :disabled="updatePending" @input="validityFromChanged" />
              </div>
              <div class="col-12 cell-val-until">
                <label class="text-xs" for="date-val-until">Until</label>
                <div class="d-flex align-center">
                  <radio v-model="plan.validity.unlim" :val="false"/>
                  <date-picker id="date-val-until" v-model="plan.validity.until" :min-date="today" grow="md-up"
                               ref="validityUntil" position="left-md-right"
                               :disabled="plan.validity.unlim || updatePending" @input="validityUntilChanged" />
                </div>
                <div class="validity-unlim-wrapper">
                  <radio v-model="plan.validity.unlim" :val="true">Unlimited</radio>
                </div>
              </div>
            </div>
            <h6 :class="{ opened: blockoutsOpened }" @click="blockoutsOpened=!blockoutsOpened">
              Blockout periods
              <svg width="12" height="7" stroke-width="2">
                <use xlink:href="/assets/icons/icons.svg#arrow-down"/>
              </svg>
            </h6>
            <div class="danger">
              <div class="row row-blockout" v-for="(blockout, idx) in plan.blockouts" :key="`bl-${idx}`">
                <div class="col-12 cell-block-from">
                  <label class="text-xs" :for="`date-block-from-${idx}`">From</label>
                  <date-picker :id="`date-block-from-${idx}`" v-model="blockout.from" :min-date="today"
                               grow="up" :disabled="updatePending" @input="blockFromChanged($event, idx)" />
                </div>
                <div class="col-12 cell-block-until">
                  <label class="text-xs" :for="`date-block-until-${idx}`">Until</label>
                  <date-picker :id="`date-block-until-${idx}`" v-model="blockout.until" :min-date="today"
                               grow="up" ref="blockUntil" position="left-md-right"
                               :disabled="updatePending" @input="blockUntilChanged($event, idx)" />
                </div>
                <div class="col-12 cell-block-delete">
                  <b-btn class="btn-icon btn-tiny" @click="removeBlockout(idx)">
                    <svg width="18" height="18">
                      <use xlink:href="/assets/icons/icons.svg#delete"/>
                    </svg>
                  </b-btn>
                </div>
              </div>
              <div class="row row-blockout">
                <div class="col">
                  <b-btn pill variant="outline-danger" class="add-new-blockout" @click="addBlockout">
                    <svg width="10" height="11">
                      <use xlink:href="/assets/icons/icons.svg#plus"/>
                    </svg>
                    Add blockout period
                  </b-btn>
                </div>
              </div>
            </div>
          </div>
        </ValidationObserver>
      </b-modal>

      <div class="panel position-relative panel-content">
        <div class="list d-none d-md-block left-edge">
          <p class="head-line">Your rate plans</p>
          <div class="plans-table" v-if="loaded">
            <table class="w-100">
              <thead>
                <tr>
                  <th class="w-id">ID</th>
                  <th class="w-name">Name</th>
                  <th class="w-meal">Meal plan</th>
                  <th class="w-minlos">Minimum stay</th>
                  <th class="w-cancels">Cancellation policy</th>
                  <th class="w-actions">Actions</th>
                </tr>
              </thead>

              <tbody v-for="row in plans" :key="row.id">
                <tr class="separator before"></tr>
                <tr>
                  <td>
                    {{ row.id }}
                  </td>
                  <td>
                    <p>{{ row.langs.en.name }}</p>
                  </td>
                  <td>
                    <p>{{ mealNameById(row.meals) }}</p>
                  </td>
                  <td>
                    {{ row.minlos }}
                  </td>
                  <td>
                    {{ cancelNamesByIds(row.cancels) }}
                  </td>
                  <td class="actions">
                    <b-btn class="btn-icon btn-tiny" @click="editPlan(row)" :disabled="updatePending">
                      <svg width="17" height="17">
                        <use xlink:href="/assets/icons/icons.svg#edit"/>
                      </svg>
                    </b-btn>
                    <b-btn class="btn-icon btn-tiny" @click="duplicatePlan(row.id)" :disabled="updatePending">
                      <svg width="18" height="18">
                        <use xlink:href="/assets/icons/icons.svg#copy"/>
                      </svg>
                    </b-btn>
                    <b-btn class="btn-icon btn-tiny" @click="deletePlan(row.id)"
                           :disabled="updatePending || row.protected">
                      <svg width="19" height="19">
                        <use xlink:href="/assets/icons/icons.svg#delete"/>
                      </svg>
                    </b-btn>
                  </td>
                </tr>
                <tr class="separator after"></tr>
              </tbody>
            </table>
          </div>
          <div v-if="loaded">
            <b-btn pill variant="outline-primary" class="add-new-plan"
                   @click="openCreateForm">
              <svg width="10" height="11">
                <use xlink:href="/assets/icons/icons.svg#plus"/>
              </svg>
              Add new rate plan
            </b-btn>
          </div>
        </div>

        <p class="head-line d-md-none">Your rate plans</p>
        <div class="d-md-none list-item" v-for="row in plans" :key="row.id">
          <div class="d-flex">
            <div class="c-1">
              <p class="label">Name</p>
              <p>{{ row.langs.en.name }}</p>
            </div>
            <div class="dots">
              <b-dropdown size="sm" toggle-tag="span" variant="link" no-caret right :disabled="updatePending">
                <template #button-content>
                  <svg width="20" height="19" class="label"><use xlink:href="/assets/icons/icons.svg#dots-h"/></svg>
                </template>
                <b-dropdown-item @click="duplicatePlan(row.id)">Duplicate</b-dropdown-item>
                <b-dropdown-item @click="editPlan(row)">Edit</b-dropdown-item>
                <b-dropdown-item @click="deletePlan(row.id, true)"
                                 :disabled="row.protected">Delete</b-dropdown-item>
              </b-dropdown>
            </div>
          </div>
          <div class="d-flex line">
            <div class="w-50">
              <p class="label">ID</p>
              <p>{{ row.id }}</p>
            </div>
            <div class="w-50">
              <p class="label">Minimum stay</p>
              <p>{{ row.minlos }}</p>
            </div>
          </div>
          <div class="d-flex line">
            <div class="c-1">
              <p class="label">Meal plan</p>
              <p>{{ mealNameById(row.meals) }}</p>
            </div>
          </div>
          <div class="d-flex line">
            <div class="c-1">
              <p class="label">Cancellation policy</p>
              <p>{{ cancelNamesByIds(row.cancels) }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="d-md-none add-new-plan-block" v-if="loaded">
        <b-btn pill variant="outline-primary" class="add-new-plan" @click="openCreateForm">
          <svg width="10" height="10">
            <use xlink:href="/assets/icons/icons.svg#plus"/>
          </svg>
          Add new room
        </b-btn>
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment';
  import { mapState, mapGetters, mapActions } from 'vuex';
  import { langCodes, weekdays } from '@/shared';

  const travelOpts = [
    { key: '' },
    { key: 'bdays', text: 'Bookable' },
    { key: 'adays', text: 'Arrival' },
    { key: 'ddays', text: 'Departure' },
  ];

  export default {
    name: 'RatePlans',
    data: () => ({
      plan: {},
      lang: { code: 'en' },
      langsValid: [],
      settingsOpened: false,
      priceOpened: false,
      blockoutsOpened: false,
      today: moment(),
    }),
    async created() {
      this.resetPlanModal();
      await this.fetchData(true);
      // document.querySelector('.add-new-plan').click();
    },
    beforeMount() {
    },
    computed: {
      ...mapGetters('rateplans', ['loaded', 'plans', 'rooms', 'meals', 'cancels', 'bgarants']),
      ...mapState('rateplans', [
        'error', 'pending',
        'updatePending',
      ]),
      langCodes: () => langCodes,
      weekdays: () => weekdays,
      travelOpts: () => travelOpts,
      travelOptsFiltered: () => travelOpts.filter(({ key }) => !!key),
      edgeRoomLang() {
        return this.plan.room != null && this.langsValid.includes('en');
      },
      formValid() {
        return true;
      },
      planFinalPrice() {
        return this.plan.price.mode === 'standard'
          ? this.plan.price.stdres : this.plan.price.fixed;
      },
      roomSelected() {
        return !!this.plan.room;
      },
      planRoom() {
        const val = this.plan.room;
        if (!val) return null;
        return this.rooms.find((room) => room.pid === val);
      },
      notStandardOccupancy() {
        const { min, std, max } = this.plan.occupancy;
        return min < std || max > std;
      },
      selectedCancels() {
        if (this.plan == null || this.plan.cancels == null || !this.plan.cancels) return [];
        return this.cancels.filter((c) => this.plan.cancels.includes(c.id));
      },
      bgarantDesc() {
        if (this.plan == null || this.plan.bgarant == null) return '';
        const bgarant = this.bgarants.find((bg) => (bg.id - this.plan.bgarant) === 0);
        return bgarant != null ? bgarant.desc : '';
      },
    },
    watch: {
      'plan.room': function watchRoom(room) {
        if (room) {
          this.updateRoomData();
        }
      },
    },
    methods: {
      ...mapActions('rateplans', ['fetchData', 'createPlan', 'updatePlan', 'duplicatePlan', 'deletePlan']),

      // TODO: add normalize method

      resetPlanModal() {
        this.langs = { code: 'en' };
        this.langsValid = [];
        this.settingsOpened = false;
        this.priceOpened = false;
        this.blockoutsOpened = false;
        this.plan = {
          room: false,
          langs: Object.fromEntries(langCodes.map((c) => [c, {}])),
          bdays: [...weekdays],
          adays: [...weekdays],
          ddays: [...weekdays],
          minlos: 1,
          maxlos: 999,
          price: {
            mode: 'standard',
            std: 0,
            fixed: 0,
            stdres: 0,
            stdcalc: {
              mode: 'surcharge',
              surcharge: [],
              reduction: [],
            },
            calc: {
              children: [
                {
                  id: 0,
                  age: '',
                  surcharge: {
                    value: '',
                    mode: 'amount',
                  },
                },
                {
                  id: 1,
                  age: '',
                  surcharge: {
                    value: '',
                    mode: 'amount',
                  },
                },
                {
                  id: 2,
                  age: '',
                  surcharge: {
                    value: '',
                    mode: 'amount',
                  },
                },
              ],
              surcharge: {
                value: '',
                mode: 'amount',
              },
              reduction: {
                value: '',
                mode: 'amount',
              },
            },
          },
          occupancy: {
            std: '',
            min: '',
            max: '',
          },
          meals: 0,
          bgarant: 1,
          cancels: [],
          validity: {
            from: moment(),
            until: moment().add(1, 'year'),
            unlim: false,
          },
          blockouts: [],
        };
        this.$nextTick(() => {
          // this.updateMinOcc();
          // this.updateMaxOcc();
        });
        if (this.$refs.planForm != null) {
          this.$refs.planForm.reset();
        }
      },
      openCreateForm() {
        this.resetPlanModal();
        this.$nextTick(this.$refs.planModal.show);
      },
      editPlan(plan) {
        this.plan = {};
        this.resetPlanModal();
        this.plan = {
          ...this.plan,
          ...JSON.parse(JSON.stringify(plan)), // deep clone without bindings
          ...{
            std: 0,
            fixed: 0,
            stdres: 0,
          },
        };
        this.blockoutsOpened = this.plan.blockouts.length > 0;
        Object.keys(this.plan.langs).forEach((code) => {
          this.toggleLangValid(this.plan.langs[code].name, code);
        });
        this.updateRoomData();
        this.$nextTick(this.$refs.planModal.show);
      },
      async processForm() {
        const plan = { ...this.plan };
        // fix dates
        ['from', 'until'].forEach((k) => {
          const v = plan.validity[k];
          if (moment.isMoment(v)) {
            plan.validity[k] = v.format('YYYY-MM-DD');
          }
        });
        (plan.blockouts || []).forEach((b) => {
          ['from', 'until'].forEach((k) => {
            const v = b[k];
            if (moment.isMoment(v)) {
              // eslint-disable-next-line no-param-reassign
              b[k] = v.format('YYYY-MM-DD');
            }
          });
        });
        try {
          if (plan.id != null) {
            await this.updatePlan(plan);
          } else {
            await this.createPlan(plan);
          }
          this.$refs.planModal.hide();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
      updateRoomData() {
        const room = this.planRoom;
        if (room == null) return;
        this.plan.price.std = 0;
        this.$nextTick(() => {
          this.plan.price.std = parseFloat(room.price);
        });
        if (this.plan.id != null) return;
        const base = parseInt(room.occupancy.std, 10);
        this.plan.occupancy = {
          min: base,
          std: base,
          max: base,
        };
        this.plan.price.calc = {
          children: [
            {
              id: 0,
              age: '',
              surcharge: {
                value: '',
                mode: 'amount',
              },
            },
            {
              id: 1,
              age: '',
              surcharge: {
                value: '',
                mode: 'amount',
              },
            },
            {
              id: 2,
              age: '',
              surcharge: {
                value: '',
                mode: 'amount',
              },
            },
          ],
          surcharge: {
            value: '',
            mode: 'amount',
          },
          reduction: {
            value: '',
            mode: 'amount',
          },
        };
      },
      toggleLangValid(val, code) {
        const idx = this.langsValid.indexOf(code);
        if (`${val}`.trim()) {
          if (idx === -1) {
            this.langsValid.push(code);
          }
        } else if (idx !== -1) {
          this.langsValid.splice(idx, 1);
        }
      },
      validityFromChanged(dt) {
        if (dt.isAfter(this.plan.validity.until, 'date')) {
          this.plan.validity.until = moment(dt);
        }
        this.$nextTick(() => {
          this.$refs.validityUntil.$el.focus();
        });
      },
      validityUntilChanged(dt) {
        if (dt.isBefore(this.plan.validity.from, 'date')) {
          this.plan.validity.from = moment(dt);
        }
      },
      addBlockout() {
        this.plan.blockouts.push({
          from: moment(),
          until: moment(),
        });
      },
      removeBlockout(idx) {
        this.plan.blockouts.splice(idx, 1);
      },
      blockFromChanged(dt, idx) {
        if (dt.isAfter(this.plan.blockouts[idx].until, 'date')) {
          this.plan.blockouts[idx].until = moment(dt);
        }
        this.$nextTick(() => {
          this.$refs.blockUntil[idx].$el.focus();
        });
      },
      blockUntilChanged(dt, idx) {
        if (dt.isBefore(this.plan.blockouts[idx].from, 'date')) {
          this.plan.blockouts[idx].from = moment(dt);
        }
      },
      rulesFor(field) {
        const rules = {
          required: true,
        };
        switch (field) {
          case 'avail':
            rules.between = { min: 0, max: 999 };
            rules.numeric = true;
            break;
          case 'price':
            rules.between = { min: 0.01, max: 999.99 };
            break;
          case 'minlos':
            rules.between = { min: 1, max: 999 };
            rules.numeric = true;
            rules.maxvalue = this.plan.maxlos;
            break;
          case 'maxlos':
            rules.between = { min: 1, max: 999 };
            rules.numeric = true;
            rules.minvalue = this.plan.minlos;
            break;
          case 'minocc':
            rules.between = { min: 1, max: this.plan.occupancy.std };
            rules.numeric = true;
            break;
          case 'maxocc':
            rules.between = { min: this.plan.occupancy.std, max: 999 };
            rules.numeric = true;
            break;
          case 'child-age':
            rules.between = { min: 1, max: 18 };
            rules.numeric = true;
            rules.required = false;
            break;
          default:
            break;
        }
        return rules;
      },
      isTravelAll(key) {
        return this.plan[key].length === weekdays.length;
      },
      toggleTravelAll(key, on) {
        this.plan[key] = on ? [...weekdays] : [];
      },
      isTravelDay(key, wd) {
        return this.plan[key].includes(wd);
      },
      toggleTravelDay(key, wd, on) {
        const idx = this.plan[key].indexOf(wd);
        if (on) {
          if (idx < 0) {
            this.plan[key].push(wd);
          }
        } else if (idx >= 0) {
          this.plan[key].splice(idx, 1);
        }
      },
      removeCancelPolicy(id) {
        const idx = this.plan.cancels.findIndex((cid) => cid === id);
        if (idx !== -1) {
          this.plan.cancels.splice(idx, 1);
        }
      },
      mealNameById(id) {
        return this.meals.find((meal) => meal.id === id).text;
      },
      cancelNamesByIds(ids) {
        return this.cancels
          .filter(({ id }) => ids.includes(id))
          .map(({ text }) => text)
          .join(', ');
      },
    },
  };
</script>
