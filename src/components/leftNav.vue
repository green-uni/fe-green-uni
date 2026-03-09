<script setup>
</script>

<template>
  <nav>
    <div class="nav">
      <div class="depth1">내정보 관리</div> <!-- 모든 ROLE 공통 -->
      <div class="depth2">
        <router-link to="/">내정보 조회</router-link>
      </div>
    </div>
    <div class="nav">
      <div class="depth1">인사정보관리</div> <!-- #TODO ROLE에 따라 다른 메뉴 보일 수 있게-->
      <div class="depth2">
        <router-link to="/admin/m">인사정보관리 </router-link>
        <router-link to="/admin/m/create">계정생성</router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
nav{padding: 10px;}
.nav{padding: 10px 25px;}
.nav .depth1{padding: 20px;}
.nav .depth2{}
.nav .depth2 a{text-decoration: none;display: block;padding: 20px;background: #eee;color: #666;}
</style>
