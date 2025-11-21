<template>
  <div class="full-page">
    <iframe :src="chatUrl" class="chat-iframe" frameborder="0"></iframe>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'IM',

  computed: {
    ...mapGetters([
      "openimUserID",
      "imToken",
      "chatToken"
    ]),

    chatUrl() {
      const base = "https://chatvip.pipoone.com/#/login"
      console.log(1111111111)
      console.log(this.chatToken)
      console.log(this.openimUserID)
      console.log(this.imToken)
      return (
        base +
        "?userID=" + encodeURIComponent(this.openimUserID) +
        "&chatToken=" + encodeURIComponent(this.chatToken) +
        "&imToken=" + encodeURIComponent(this.imToken)
      )
    }
  }
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
</style>
