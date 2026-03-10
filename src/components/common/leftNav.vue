<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { routes } from '@/router/routes';

const route = useRoute();
const menus = ref([]);

const makeMenu = () => {
  const temp = {};

  routes.forEach(r => {
    const { groupTitle, title } = r.meta || {};
    if (!groupTitle) return;

    if (!temp[groupTitle]) {
      temp[groupTitle] = {
        title: groupTitle,
        isOpen: false,
        subMenus: []
      };
    }
    temp[groupTitle].subMenus.push({
      title: title,
      path: r.path
    });
  })
  menus.value = Object.values(temp);
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
    <div v-for="menu in menus" :key="menu.title" class="menu-group">
      <div class="menu-title" @click="toggleMenu(menu)" :class="{ 'active': menu.isOpen }">
        {{ menu.title }}
        <span class="arrow">{{ menu.isOpen ? '▲' : '▼' }}</span>
      </div>

      <ul v-show="menu.isOpen" class="sub-menu">
        <li v-for="sub in menu.subMenus" :key="sub.title">
          <router-link :to="sub.path" active-class="active">
            {{ sub.title }}
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
nav {
  padding: 10px;
}

.menu-title {
  padding: 10px 25px;
  cursor: pointer;
}

.menu-title.active {
  background-color: var(--main-color);
  color: #fff;
}

ul {}

ul.active {
  display: block;
}

.sub-menu li {}

.sub-menu li {}

.sub-menu li a {
  text-decoration: none;
  display: block;
  padding: 20px;
  background: #eee;
  color: #666;
}

.sub-menu li a.active {
  background: #999;
  color: #fff;
}
</style>
