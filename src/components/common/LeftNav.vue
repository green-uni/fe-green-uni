<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { routes } from '@/router/routes';
import { useAuthStore } from '@/stores/authentication';

const authStore = useAuthStore()
const route = useRoute();
const menus = ref([]);

const makeMenu = () => {
  const temp = {};
  const role = authStore?.role;

  routes.forEach(r => {
    const { groupTitle, title, auth } = r.meta || {};
    if (!groupTitle) return; // groupTitle이 없다면 메뉴로 만들지 않음
    if (auth && !auth.includes(role)) return  // 권한 없으면 메뉴에서 제외

    if (!temp[groupTitle]) { //groupTitle이 있다면 임시 객체로 그룹화
      temp[groupTitle] = {
        title: groupTitle,
        isOpen: false,
        subMenus: []
      };
    }
    temp[groupTitle].subMenus.push({ // 그룹 안에 서브메뉴로 작업
      title: title,
      path: r.path
    });
  })
  menus.value = Object.values(temp); // 그룹 객체를 배열로 변환
}

const updateMenuState = () => {
  menus.value.forEach(menu => {
    const presentMenu = menu.subMenus.some(sub => sub.path === route.path);
    if (presentMenu) {
      menu.isOpen = true;
    }
  });
};

const toggleMenu = (targetMenu) => {
  menus.value.forEach(m => {
    if (m === targetMenu) m.isOpen = !m.isOpen;
    else m.isOpen = false;
  });
};

onMounted(() => {
  makeMenu(); // 메뉴 생성
  updateMenuState(); // 현재 경로 활성화
  // console.log(menus.value);
});

watch(() => route.path, () => {
  updateMenuState();
});
</script>

<template>
  <nav>
    <div v-for="menu in menus" :key="menu.title" class="group">
      <div class="group-title d-flex jc-space-b ai-center" @click="toggleMenu(menu)" :class="{ 'active': menu.isOpen }">
        <span>{{ menu.title }}</span>

        <span class="arrow"><font-awesome-icon :icon="menu.isOpen ? ['fas', 'angle-up'] : ['fas', 'angle-down']" /></span>
      </div>

      <div v-show="menu.isOpen" class="sub-menu">
          <router-link :to="sub.path" active-class="active" v-for="sub in menu.subMenus" :key="sub.title">
            <span>{{ sub.title }}</span>
          </router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>


nav {padding: 10px 25px;}

.group-title { padding: 10px 25px; cursor: pointer;height: 60px;font-weight: 500;}
.group-title.active span{color:var(--color-font);opacity: .5;}

.group-title.active { background-color: var(--main-color); border-radius: 15px 15px 0 0;font-weight: 500;}
.group-title.active span{color: #fff;opacity: 1;}

.sub-menu.active {display: block;}

.sub-menu a{text-decoration: none;display: block;padding: 20px; background: #F8F9FA;color: var(--color-font);}
.sub-menu a span{opacity: .5;}
.sub-menu a.active{background-color: var(--hover-color);color: var(--main-color);}
.sub-menu a.active span{opacity: 1;}

</style>
