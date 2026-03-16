<script setup>
import { useAuthStore } from '@/stores/authentication';
const authStore = useAuthStore()

</script>

<template>
  <div class="container">
    <div class="content-wrap g20">
      <h3>학적 정보</h3>
      <div class="form-grid" style="--grid-cols: 1fr 1fr 1fr">

        <div class="input-wrap" v-if="['student', 'professor'].includes(state.data.role)">
          <div class="input-label">학과</div>
          <div class="input-content">
            <select name="status" v-model="state.data.majorId">
              <option value="">----학과선택----</option>
              <option v-for="major in state.majorList" :key="major.majorId" :value="major.majorId">{{ major.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped></style>
