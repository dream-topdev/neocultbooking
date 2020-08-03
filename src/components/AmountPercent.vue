<template>
  <div class="amount-percent-wrapper">
    <div class="amount-percent-field"
         :class="[`mode-${mode}`, { disabled, simple, prefixed, positive, negative }]">
      <ValidatedField
        type="number" :id="$uid" :name="$uid" class="mb-0" no-icon no-tooltip
        :value="modeValue" :disabled="disabled" @input="onInput($event)"
        :min="min" :max="max" :rules="rules" ref="field" purenumber :integer="isPercent"
      />
    </div>
    <template v-if="!simple">
      <b-btn variant="square" :class="{ active: isPercent }" :disabled="disabled"
             @click="changeMode('percent')">%</b-btn>
      <b-btn variant="square" :class="{ active: isAmount }" :disabled="disabled"
             @click="changeMode('amount')">€</b-btn>
    </template>
  </div>
</template>

<script>
  export default {
    name: 'AmountPercent',
    props: {
      value: {
        // type: [Object, undefined],
        required: true,
        validator: (prop) => ['object', 'number', 'string', 'undefined'].includes(typeof prop),
      },
      price: {
        type: [Number, String],
        default: null,
      },
      result: {
        type: [Number, String],
        default: null,
      },
      positive: {
        type: Boolean,
        default: false,
      },
      negative: {
        type: Boolean,
        default: false,
      },
      simple: {
        type: Boolean,
        default: false,
      },
      preventNegativePrice: {
        type: Boolean,
        default: false,
      },
      preventInvalidPrice: {
        type: Boolean,
        default: false,
      },
      required: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    mounted() {
      this.propagateResult();
    },
    computed: {
      mode() {
        return this.simple ? 'amount' : (this.value.mode || 'amount');
      },
      isAmount() {
        return this.mode === 'amount';
      },
      isPercent() {
        return this.mode === 'percent';
      },
      isOverflow() {
        return this.negative && this.price != null && this.preventNegativePrice && this.result < 0;
      },
      isInvalid() {
        return this.negative && this.price != null && this.preventInvalidPrice && this.result <= 0;
      },
      modeValue() {
        return (this.simple ? this.value : this.value.value) || '';
      },
      min() {
        return this.isPercent ? 1 : 0.01;
      },
      max() {
        return this.isPercent ? 100 : 999.99;
      },
      rules() {
        return {
          required: this.required,
          between: { min: this.min, max: this.max },
          numeric: this.isPercent,
          fail: this.isOverflow || this.isInvalid,
        };
      },
      prefixed() {
        return (`${this.modeValue}` || '').trim() /* && !this.disabled */ && (this.positive || this.negative);
      },
    },
    watch: {
      price() {
        this.propagateResult();
      },
      disabled(val) {
        if (!val) {
          this.propagateResult();
        }
      },
    },
    methods: {
      propagateResult() {
        if (this.price != null) {
          // calculate
          this.$nextTick(() => {
            this.$emit('update:result', this.calculate(this.price));
          });
        }
      },
      calculate(price) {
        let c = parseFloat(price) || 0;
        // eslint-disable-next-line no-nested-ternary
        const k = this.negative ? -1 : (this.positive ? 1 : 0);
        const v = parseFloat(this.modeValue) || 0;
        if (this.isAmount) {
          c += k * v;
        } else {
          c *= 1 + (k * (v / 100.0));
        }
        c = parseFloat(c.toFixed(2));
        return c;
      },
      onInput(value, mode = null) {
        if (this.simple) {
          this.$emit('input', value);
        } else {
          this.$emit('input', {
            mode: mode || this.mode,
            value,
          });
        }
        this.propagateResult();
      },
      changeMode(mode) {
        // this.$emit('update:mode', mode);
        this.onInput('', mode);
        this.$nextTick(() => {
          this.$refs.field.$emit('reset');
          this.$refs.field.$emit('focus');
        });
      },
    },
  };
</script>
