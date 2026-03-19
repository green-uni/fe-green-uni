<script setup>
import { computed } from 'vue';

const props = defineProps({
  password: {
    type: String,
    default: ''
  }
});

// 정규식 로직을 컴포넌트 안으로 응집시킴 (부모는 몰라도 됨)
const checks = computed(() => ({
  length:  props.password.length >= 10,
  letter:  /[A-Za-z]/.test(props.password),
  number:  /\d/.test(props.password),
  special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(props.password)
}));
</script>

<template>
  <ul class="pw-check-list">
    <li :class="{ pass: checks.letter }">
      <font-awesome-icon :icon="checks.letter ? 'fa-solid fa-check' : 'fa-solid fa-xmark'" />
      영문자 포함
    </li>
    <li :class="{ pass: checks.number }">
      <font-awesome-icon :icon="checks.number ? 'fa-solid fa-check' : 'fa-solid fa-xmark'" />
      숫자 포함
    </li>
    <li :class="{ pass: checks.special }">
      <font-awesome-icon :icon="checks.special ? 'fa-solid fa-check' : 'fa-solid fa-xmark'" />
      특수기호 포함
    </li>
    <li :class="{ pass: checks.length }">
      <font-awesome-icon :icon="checks.length ? 'fa-solid fa-check' : 'fa-solid fa-xmark'" />
      10자 이상
    </li>
  </ul>
</template>

<style scoped>
.pw-check-list{font-size: .8em;color: #ccc;display: flex;gap: 2px;padding: 5px;margin-top: 5px;}
.pw-check-list li{background: var(--error-bg);color: var(--error);padding: 2px 5px;border-radius: 5px;transition: 0.4s;}
.pw-check-list li svg{}

.pw-check-list li.pass{color: var(--success);background-color: var(--success-bg);}
.pw-check-list li.pass svg{}
</style>
