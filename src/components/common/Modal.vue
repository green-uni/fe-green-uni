<script setup>
import { useModalStore } from '@/stores/modal';
const modal = useModalStore();
</script>

<template>
<!--Transition: 엘리먼트나 컴포넌트가 나타나고 사라질 때 애니메이션 효과를 쉽게 적용할 수 있도록 도와주는 내장 컴포넌트-->
  <Transition name="modal-fade">
    <div v-if="modal.isOpen" class="modal-dim" @click.self="modal.close(false)">
      <div class="modal-box">
        <div class="modal-body">
          {{ modal.message }}
        </div>
        <div class="modal-footer">
          <button v-if="modal.isConfirm" class="btn-cancel" @click="modal.close(false)">취소</button>
          <button class="btn-ok" @click="modal.close(true)">확인</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-dim {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex; justify-content: center; align-items: center;
  z-index: 9999;
}
.modal-box {
  background: #fff; width: 500px; border-radius: 8px;
  overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}
.modal-body {
  padding: 30px 20px; text-align: center; font-size: 15px; color: #333;
  line-height: 1.5; white-space: pre-wrap;
}
.modal-footer {
  display: flex; border-top: 1px solid #eee;
}
.modal-footer button {
  flex: 1; border: none; padding: 12px; cursor: pointer; font-size: 14px; background: #fff;
}
.modal-footer button:hover { background: var(--hover-color); }
.btn-ok { color: var(--main-color); font-weight: bold; }
.btn-cancel { border-right: 1px solid #eee !important; color: #888; }

/* 애니메이션 */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>