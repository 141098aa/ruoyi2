<template>
  <div v-if="!item.hidden">
    <template
      v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path, onlyOneChild.query)">
        <!-- <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{ 'submenu-title-noDropdown': !isNest }">
          <item :icon="onlyOneChild.meta.icon || (item.meta && item.meta.icon)" :title="onlyOneChild.meta.title" />
        </el-menu-item> -->
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{ 'submenu-title-noDropdown': !isNest }"
          @click.native="handleMenuClick(resolvePath(onlyOneChild.path), $event)">
          <item :icon="onlyOneChild.meta.icon || (item.meta && item.meta.icon)" :title="onlyOneChild.meta.title" />
        </el-menu-item>
      </app-link>
    </template>

    <el-submenu v-else ref="subMenu" :index="resolvePath(item.path)" popper-append-to-body>
      <template slot="title">
        <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" />
      </template>
      <sidebar-item v-for="child in item.children" :key="child.path" :is-nest="true" :item="child"
        :base-path="resolvePath(child.path)" class="nest-menu" />
    </el-submenu>
  </div>
</template>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'
import Item from './Item'
import AppLink from './Link'
import FixiOSBug from './FixiOSBug'

export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  data() {
    this.onlyOneChild = null
    return {
    }
  },
  methods: {
    hasOneShowingChild(children = [], parent) {
      if (!children) {
        children = [];
      }
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          // Temp set(will be used if only has one showing child)
          this.onlyOneChild = item
          return true
        }
      })

      // When there is only one child router, the child router is displayed by default
      if (showingChildren.length === 1) {
        return true
      }

      // Show parent if there are no child router to display
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ...parent, path: '', noShowingChildren: true }
        return true
      }

      return false
    },
    resolvePath(routePath, routeQuery) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      if (routeQuery) {
        let query = JSON.parse(routeQuery);
        return { path: path.resolve(this.basePath, routePath), query: query }
      }
      return path.resolve(this.basePath, routePath)
    },
    encrypt(str) {
      const base64 = btoa(str);
      const left = "abc";
      const right = "xyz";
      return left + base64 + right;
    },
    encrypt(str) {
      const base64 = btoa(str);

      // 随机生成长度为 3 的字符串（A-Z, a-z, 0-9）
      const randomStr = (length = 3) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      }

      const left = randomStr(3);
      const right = randomStr(3);

      return left + base64 + right;
    },
    handleMenuClick(path, event) {
      const isIM = path === '/im' || path.toString().includes('/im');
      if (!isIM) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const imUser = this.$store.getters.imUser;
      const imPass = this.$store.getters.imPass;

      // 调用 encrypt
      const encUser = this.encrypt(imUser);
      const encPass = this.encrypt(imPass);

      const base = "https://chatdemo.piposocial.com/#/login";
      const url = `${base}?imUser=${encodeURIComponent(encUser)}&imPass=${encodeURIComponent(encPass)}`;

      // 打开新标签页
      let imWindow = window.imWindow || null;
      if (imWindow && !imWindow.closed) {
        imWindow.focus();
      } else {
        const imWindow = window.open(url, 'im-chat-window');
        window.imWindow = imWindow;
      }

      // **立即清理 el-menu 的 activeIndex**
      // 通过 Vue Router 暂时跳转到不存在的路径，el-menu 不会匹配到 /im
      this.$nextTick(() => {
        this.$router.replace({ path: '/empty', replace: true }).finally(() => {
          // 再跳转到首页
          setTimeout(() => {
            this.$router.replace({ path: '/index', replace: true });
          }, 50);
        });
      });

      return false;
    }

  },

}
</script>
