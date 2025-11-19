<template>
  <div class="app-container im-container">
    <el-row :gutter="20" class="im-layout">
      <!-- 左侧会话列表 -->
      <el-col :span="8" class="conversation-list-panel">
        <div class="panel-header">
          <h3>会话列表</h3>
          <el-button type="primary" size="mini" @click="handleRefreshConversations" :loading="loading">
            刷新
          </el-button>
        </div>

        <div class="connection-status">
          <el-tag :type="statusTagType">{{ connectionStatusText }}</el-tag>
        </div>

        <div class="conversation-list">
          <div v-for="conversation in conversations" :key="conversation.conversationID" class="conversation-item"
            :class="{
              active:
                currentConversation &&
                currentConversation.conversationID === conversation.conversationID,
            }" @click="handleSelectConversation(conversation)">
            <div class="conversation-avatar">
              <el-avatar :size="40" :src="conversation.faceURL"></el-avatar>
            </div>
            <div class="conversation-info">
              <div class="conversation-name">{{ conversation.showName }}</div>
              <div class="conversation-preview">
                {{ getMessageText(conversation.latestMsg) || conversation.draftText }}
              </div>

            </div>
            <div class="conversation-meta">
              <div class="conversation-time">
                {{ formatTime(conversation.latestMsgSendTime) }}
              </div>
              <div v-if="conversation.unreadCount > 0" class="unread-badge">
                {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
              </div>
            </div>
          </div>

          <div v-if="conversations.length === 0" class="empty-conversation">
            暂无会话
          </div>
        </div>
      </el-col>

      <!-- 右侧聊天窗口 -->
      <el-col :span="16" class="chat-panel">
        <div v-if="currentConversation" class="chat-window">
          <div class="chat-header">
            <div class="chat-user-info">
              <el-avatar :size="32" :src="currentConversation.faceURL"></el-avatar>
              <span class="chat-user-name">{{ currentConversation.showName }}</span>
            </div>
          </div>

          <div class="chat-messages" ref="messagesContainer">
            <div v-for="message in currentMessages" :key="message.clientMsgID || message.serverMsgID"
              class="message-item" :class="{
                'message-sent': message.sendID === currentUserID,
                'message-received': message.sendID !== currentUserID,
              }">
              <!-- 添加头像 -->
              <el-avatar v-if="message.sendID !== currentUserID" :size="32" :src="getUserAvatar(message.sendID)"
                class="message-avatar"></el-avatar>

              <div class="message-content">
                <div class="message-text">
                  {{ getMessageText(message) }}
                </div>
                <div class="message-time">
                  {{ formatMessageTime(message.sendTime) }}
                </div>
              </div>

              <el-avatar v-if="message.sendID === currentUserID" :size="32" :src="getUserAvatar(message.sendID)"
                class="message-avatar"></el-avatar>
            </div>

            <div v-if="messages.length === 0" class="empty-messages">
              暂无消息
            </div>
          </div>

          <div class="chat-input">
            <el-input v-model="inputText" type="textarea" :rows="3" placeholder="输入消息..."
              @keyup.ctrl.enter.native="handleSendMessage"></el-input>
            <div class="input-actions">
              <el-button type="primary" @click="handleSendMessage" :disabled="!inputText.trim()">
                发送 (Ctrl+Enter)
              </el-button>
            </div>
          </div>
        </div>

        <div v-else class="empty-chat">
          <el-empty description="请选择一个会话开始聊天"></el-empty>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import openIMService from '@/utils/openim'
import { LogLevel } from '@openim/wasm-client-sdk/lib/index.js'

export default {
  name: 'IM',
  data() {
    return {
      loading: false,
      inputText: '',
      currentUserID: '',
      refreshTimer: null,
      // IM 收发用
      im: null,
      myID: "2244324323",         // 登录后赋值
      activePeerID: '',   // 当前正在聊天的对方 ID
      //token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOiIyMjQ0MzI0MzIzIiwiUGxhdGZvcm1JRCI6NSwiZXhwIjoxNzcxMzI4NjEzLCJpYXQiOjE3NjM1NTI2MDh9.7Iqs1oQCQ2CE44jpp1SZ5KlN_Mu_RQjUiELnJ_BH90M",        // 登录接口返回的 IM token
      inputMsg: '',
      sendingText: false,

    }
  },
  computed: {
    ...mapGetters([
      'imConnectionStatus',
      'imIsLoggedIn',
      'imConversations',
      'imCurrentConversation',
      'imMessages',
      'id',
      'imToken',        // 添加
      'openimUserID'    // 添加
    ]),
    conversations() {
      return this.imConversations || []  // 添加 || [] 防止 undefined
    },
    currentConversation() {
      return this.imCurrentConversation
    },
    messages() {
      return this.imMessages || []  // 添加 || []
    },
    //新增：只显示当前会话的消息
    currentMessages() {
      if (!this.currentConversation) return []
      return this.messages.filter(
        msg => msg.conversationID === this.currentConversation.conversationID
      )
    },
    connectionStatusText() {
      const statusMap = {
        connecting: '连接中...',
        connected: '已连接',
        disconnected: '未连接',
        failed: '连接失败',
      }
      return statusMap[this.imConnectionStatus] || '未知'
    },
    statusTagType() {
      const typeMap = {
        connecting: 'warning',
        connected: 'success',
        disconnected: 'info',
        failed: 'danger',
      }
      return typeMap[this.imConnectionStatus] || 'info'
    },
  },
  created() {
    // 使用 OpenIM 的 userID
    this.currentUserID = this.$store.getters.openimUserID || this.id
    this.initOpenIM()   // 登录成功后自动 bindIMListeners()
  },
  beforeDestroy() {
    this.removeEventListeners()
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  },
  methods: {
    ...mapActions([
      'InitOpenIM',
      'LoginOpenIM',
      'GetConversationList',
      'SendMessage',
      'GetHistoryMessages',
      'SetCurrentConversation',
      'AddMessage',
      'UpdateConnectionStatus',
      'UpdateConversation',
    ]),
    bindIMListeners() {
      // 防止重复绑定先取消
      openIMService.off('connectSuccess')
      openIMService.off('connectFailed')
      openIMService.off('newMessages')
      openIMService.off('conversationChanged')

      // 重新绑定监听
      this.setupEventListeners()

      console.log('🔗 OpenIM 事件监听绑定完成')
    },
    getPeerID(conversation) {
      if (!conversation) return ''
      return (
        conversation.recvID ||
        conversation.showUserID ||
        (conversation.conversationID
          ? conversation.conversationID.split('_').pop()
          : '')
      )
    },
    // 获取消息文本内容
    getMessageText(message) {
      if (!message) return '[空消息]';

      //  优先处理 SDK 标准 textElem
      if (message.textElem && message.textElem.content) {
        return message.textElem.content;
      }

      //  如果 message.content 是文本
      if (typeof message.content === 'string' && message.content.trim()) {
        return message.content;
      }

      //  message.text
      if (typeof message.text === 'string' && message.text.trim()) {
        return message.text;
      }

      //  message.elements 数组（OpenIM 新版 SDK）
      if (Array.isArray(message.elements)) {
        const textElems = message.elements.filter(el => el.type === 'TEXT');
        if (textElems.length) {
          return textElems.map(el => el.content).join('');
        }
      }

      //  如果 message 本身是 JSON 字符串
      if (typeof message === 'string') {
        try {
          const parsed = JSON.parse(message);
          if (parsed.textElem?.content) return parsed.textElem.content;
          if (parsed.content) return parsed.content;
          if (Array.isArray(parsed.elements)) {
            const textElems = parsed.elements.filter(el => el.type === 'TEXT');
            if (textElems.length) return textElems.map(el => el.content).join('');
          }
        } catch (e) {
          // 不是 JSON，直接返回原字符串
          return message;
        }
      }

      console.warn('无法解析消息内容:', message);
      return '[不支持的消息类型]';
    }
    ,

    // 获取用户头像
    getUserAvatar(userID) {
      if (!userID) return ''

      // 当前用户头像
      if (userID === this.currentUserID) {
        return this.$store.getters.avatar || ''
      }

      // 从当前会话获取对方头像
      if (this.currentConversation) {
        const convUserID = this.currentConversation.userID ||
          this.currentConversation.recvID ||
          this.currentConversation.showUserID

        if (userID === convUserID) {
          return this.currentConversation.faceURL || ''
        }
      }

      // 从会话列表中查找
      const conversation = this.conversations.find(
        conv => (conv.userID === userID) ||
          (conv.recvID === userID) ||
          (conv.showUserID === userID)
      )

      return conversation ? (conversation.faceURL || '') : ''
    },
    // 恢复当前会话
    async restoreCurrentConversation() {
      const conversationID = localStorage.getItem('currentConversationID')
      if (conversationID && this.conversations.length > 0) {
        const conversation = this.conversations.find(
          conv => conv.conversationID === conversationID
        )
        if (conversation) {
          await this.handleSelectConversation(conversation)
        }
      } else if (this.conversations.length > 0) {
        // 如果没有保存的会话，自动选择第一个
        await this.handleSelectConversation(this.conversations[0])
      }
    },

    // 修改消息接收处理
    setupEventListeners() {
      // 连接成功/失败
      openIMService.on('connectSuccess', () => {
        this.UpdateConnectionStatus('connected')
        this.$message.success('连接成功')
      })

      openIMService.on('connectFailed', (data) => {
        this.UpdateConnectionStatus('failed')
        this.$message.error('连接失败: ' + data.errMsg)
      })

      // 新消息
      openIMService.on('newMessages', (data) => {
        let messages = []
        if (data?.data) {
          messages = Array.isArray(data.data) ? data.data : [data.data]
        } else if (data) {
          messages = Array.isArray(data) ? data : [data]
        }

        messages.forEach(message => {
          //  给消息补 conversationID
          if (!message.conversationID && this.currentConversation) {
            message.conversationID = this.currentConversation.conversationID
          }
          this.AddMessage(message)
          console.log('收到新消息:', message)
        })

        this.$nextTick(() => {
          this.scrollToBottom()
        })
      })

      // 会话更新
      openIMService.on('conversationChanged', (data) => {
        if (data?.data) {
          data.data.forEach(conversation => {
            this.UpdateConversation(conversation)
          })
        }
      })
    }
    ,
    async initOpenIM() {
      try {
        // 从环境变量获取配置
        const config = {
          apiAddr: process.env.VUE_APP_OPENIM_API_ADDR || 'http://web.pipoone.com:10002',
          wsAddr: process.env.VUE_APP_OPENIM_WS_ADDR || 'ws://web.pipoone.com:10001',  // 改为 ws://
          platformID: 5,
          logLevel: LogLevel.Error
        }

        await this.InitOpenIM(config)
        // 从 store 获取 OpenIM token 和 userID
        const imToken = this.$store.getters.imToken
        const openimUserID = this.$store.getters.openimUserID

        if (!imToken || !openimUserID) {
          this.$message.error('OpenIM 登录信息缺失，请重新登录')
          return
        }

        await this.LoginOpenIM({
          userID: openimUserID,  // 使用 openimUserID
          token: imToken,        // 使用 imToken，不要用未定义的 token 变量
          apiAddr: config.apiAddr,
          wsAddr: config.wsAddr
        })
        this.bindIMListeners()

        // 登录成功后立即获取会话列表
        await this.GetConversationList()

        // 恢复选中会话
        await this.restoreCurrentConversation()
        // this.refreshTimer = setInterval(() => {
        //   this.GetConversationList()
        // }, 5000)
      } catch (error) {
        this.$message.error('OpenIM 初始化失败: ' + error.message)
      }
    },
    removeEventListeners() {
      openIMService.off('connectSuccess')
      openIMService.off('connectFailed')
      openIMService.off('newMessages')
      openIMService.off('conversationChanged')
    },
    async handleSelectConversation(conversation) {
      this.SetCurrentConversation(conversation)
      try {
        // 获取历史消息
        const history = await this.GetHistoryMessages({
          conversationID: conversation.conversationID,
          startClientMsgID: '',
          count: 20,
        })

        // 如果 Vuex store 没自动写入，可以手动推入
        if (Array.isArray(history)) {
          history.forEach(msg => {
            if (!msg.conversationID) msg.conversationID = conversation.conversationID
            this.AddMessage(msg)
          })
          console.log('历史消息:', history)
        }

        // 标记已读
        await openIMService.markConversationMessageAsRead(conversation.conversationID)

        this.$nextTick(() => {
          this.scrollToBottom()
        })
      } catch (error) {
        this.$message.error('获取消息失败: ' + error.message)
      }
    },
    async handleSendMessage() {
      if (!this.inputText.trim() || !this.currentConversation) {
        return
      }

      const peerID = this.getPeerID(this.currentConversation)
      if (!peerID) {
        this.$message.error('当前会话缺少对方 ID')
        return
      }

      try {
        const recvID =
          this.currentConversation.conversationType === 1 ? peerID : ''
        const groupID =
          this.currentConversation.conversationType === 2
            ? this.currentConversation.groupID
            : ''

        await this.SendMessage({
          recvID,
          groupID,
          text: this.inputText,
        })

        this.inputText = ''
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      } catch (error) {
        this.$message.error('发送消息失败: ' + error.message)
      }
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      if (diff < 60000) {
        return '刚刚'
      } else if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前'
      } else if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前'
      } else {
        return this.$options.filters.parseTime(date, '{y}-{m}-{d}')
      }
    },
    formatMessageTime(timestamp) {
      if (!timestamp) return ''
      return this.$options.filters.parseTime(new Date(timestamp), '{h}:{i}')
    },
  },
}
</script>

<style lang="scss" scoped>
.im-container {
  height: calc(100vh - 84px);
  padding: 0;
}

.im-layout {
  height: 100%;
}

.conversation-list-panel {
  height: 100%;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 16px;
  }
}

.connection-status {
  padding: 10px 15px;
  border-bottom: 1px solid #e4e7ed;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f5f7fa;
  }

  &.active {
    background-color: #e6f7ff;
  }
}

.conversation-avatar {
  margin-right: 12px;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-preview {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.conversation-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.unread-badge {
  background-color: #f56c6c;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 18px;
  text-align: center;
}

.empty-conversation {
  padding: 40px;
  text-align: center;
  color: #909399;
}

.chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-window {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
}

.chat-user-info {
  display: flex;
  align-items: center;

  .chat-user-name {
    margin-left: 10px;
    font-size: 16px;
    font-weight: 500;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f5f5;
}

.message-item {
  margin-bottom: 15px;
  display: flex;

  &.message-sent {
    justify-content: flex-end;

    .message-content {
      background-color: #409eff;
      color: white;
    }
  }

  &.message-received {
    justify-content: flex-start;

    .message-content {
      background-color: white;
      color: #303133;
    }
  }
}

.message-content {
  max-width: 60%;
  padding: 10px 15px;
  border-radius: 8px;
  word-wrap: break-word;
}

.message-text {
  margin-bottom: 5px;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
}

.empty-messages {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid #e4e7ed;
  background-color: white;
}

.input-actions {
  margin-top: 10px;
  text-align: right;
}

.empty-chat {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

