<template>
  <div class="lang-selector">
    <div class="lang-list">
      <div class="lang-item" v-for="lang in langs" :key="lang.code"
           :class="{ selected: isSelected(lang), valid: isValid(lang) }" @click="select(lang)">
        {{ lang.title }}
        <svg v-if="isValid(lang)" width="18" height="18">
          <use xlink:href="/assets/icons/icons.svg#ok-tick"/>
        </svg>
        <svg v-else width="14" height="14">
          <use xlink:href="/assets/icons/icons.svg#history"/>
        </svg>
      </div>
    </div>
    <b-btn v-if="edit" variant="outline-primary" class="langs-edit-button"
           :disabled="disabled" @click="$emit('edit')">
      <svg width="13" height="13">
        <use xlink:href="/assets/icons/icons.svg#edit"/>
      </svg>
      Edit Languages
    </b-btn>
  </div>
</template>

<script>
  import { langs } from '@/shared';

  export default {
    name: 'LangSelector',
    props: {
      value: {
        required: true,
      },
      valid: {
        required: false,
      },
      edit: {
        default: true,
      },
      disabled: {
        default: false,
      },
    },
    computed: {
      langs: {
        get: () => langs,
      },
    },
    methods: {
      isSelected(lang) {
        return this.value != null && this.value.code === lang.code;
      },
      select(lang) {
        this.$emit('input', { ...lang });
      },
      isValid(lang) {
        return Array.isArray(this.valid) && this.valid.includes(lang.code);
      },
    },
  };
</script>
