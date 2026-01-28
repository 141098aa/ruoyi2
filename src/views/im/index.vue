<!-- <template>
  <div class="full-page">
    <div v-if="loading" class="loading-mask">
      <i class="el-icon-loading"></i>
      <span>消息页面加载中...</span>
    </div>
    <iframe v-show="!loading" :src="chatUrl" class="chat-iframe" frameborder="0" @load="loading = false" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'IM',
  data() {
    return { loading: true };
  },
  computed: {
    ...mapGetters([
      // "openimUserID",
      // "imToken",
      // "chatToken",
      "imUser",
      "imPass"
    ]),

    chatUrl() {
      const base = "https://chatvip.pipoone.com/#/login"

      return (
        base +
        // "?userID=" + encodeURIComponent(this.openimUserID) +
        // "&chatToken=" + encodeURIComponent(this.chatToken) +
        // "&imToken=" + encodeURIComponent(this.imToken) +
        "?imUser=" + encodeURIComponent(this.imUser) +
        "&imPass=" + encodeURIComponent(this.imPass)
      );
    },
  },
  methods: {
    handleLoad() {
      this.loading = false;
    },
  },
}
</script>

<style scoped>
.full-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.chat-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.loading-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* 垂直居中 */
  background: #fff;
  font-size: 16px;
  color: #666;
}
</style> -->
