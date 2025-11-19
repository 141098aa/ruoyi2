import openIMService from '@/utils/openim'

const getCurrentConversationID = () => {
  return localStorage.getItem('currentConversationID') || null
}

const setCurrentConversationID = (conversationID) => {
  if (conversationID) {
    localStorage.setItem('currentConversationID', conversationID)
  } else {
    localStorage.removeItem('currentConversationID')
  }
}

const im = {
  state: {
    // 连接状态: connecting, connected, disconnected, failed
    connectionStatus: 'disconnected',
    // 是否已登录
    isLoggedIn: false,
    // 会话列表
    conversations: [],
    // 当前选中的会话
    currentConversation: null,
    // 当前会话的消息列表
    messages: [],
    // OpenIM 配置
    config: {
      apiAddr: '',
      wsAddr: '',
      platformID: 5
    }
  },

  mutations: {
    SET_CONNECTION_STATUS(state, status) {
      state.connectionStatus = status
    },
    SET_LOGGED_IN(state, isLoggedIn) {
      state.isLoggedIn = isLoggedIn
    },
    SET_CONVERSATIONS(state, conversations) {
      state.conversations = conversations || []
    },
    SET_CURRENT_CONVERSATION(state, conversation) {
      state.currentConversation = conversation
      // 持久化当前会话 ID
      setCurrentConversationID(conversation ? conversation.conversationID : null)
    },
    SET_MESSAGES(state, messages) {
      state.messages = messages || []
    },
    ADD_MESSAGE(state, message) {
      state.messages.push(message)
    },
    UPDATE_MESSAGE(state, message) {
      const index = state.messages.findIndex(msg => msg.clientMsgID === message.clientMsgID)
      if (index > -1) {
        state.messages.splice(index, 1, message)
      }
    },
    SET_CONFIG(state, config) {
      state.config = { ...state.config, ...config }
    },
    // 更新会话
    UPDATE_CONVERSATION(state, conversation) {
      const index = state.conversations.findIndex(
        conv => conv.conversationID === conversation.conversationID
      )
      if (index > -1) {
        state.conversations.splice(index, 1, conversation)
      } else {
        state.conversations.unshift(conversation)
      }
    },
    // 删除会话
    REMOVE_CONVERSATION(state, conversationID) {
      const index = state.conversations.findIndex(
        conv => conv.conversationID === conversationID
      )
      if (index > -1) {
        state.conversations.splice(index, 1)
      }
    }
  },

  actions: {
    // 初始化 OpenIM
    async InitOpenIM({ commit, state }, config) {
      try {
        commit('SET_CONFIG', config)
        const result = await openIMService.initSDK(config)
        if (result.errCode === 0) {
          commit('SET_CONNECTION_STATUS', 'connecting')
          return result
        } else {
          commit('SET_CONNECTION_STATUS', 'failed')
          throw new Error(result.errMsg)
        }
      } catch (error) {
        commit('SET_CONNECTION_STATUS', 'failed')
        throw error
      }
    },
    // 设置当前会话
    SetCurrentConversation({ commit, state }, conversation) {
      commit('SET_CURRENT_CONVERSATION', conversation)
      commit('SET_MESSAGES', [])  // 切换会话时清空消息
    },

    // 登录 OpenIM
    async LoginOpenIM({ commit, state }, { userID, token }) {
      try {
        const loginParams = {
          userID,
          token,
          platformID: state.config.platformID,
          apiAddr: state.config.apiAddr,
          wsAddr: state.config.wsAddr
        }

        const result = await openIMService.login(loginParams)
        if (result.errCode === 0) {
          commit('SET_LOGGED_IN', true)
        }
        return result
      } catch (error) {
        commit('SET_LOGGED_IN', false)
        throw error
      }
    },

    // 登出 OpenIM
    async LogoutOpenIM({ commit }) {
      try {
        const result = await openIMService.logout()
        commit('SET_LOGGED_IN', false)
        commit('SET_CONNECTION_STATUS', 'disconnected')
        commit('SET_CONVERSATIONS', [])
        commit('SET_CURRENT_CONVERSATION', null)
        commit('SET_MESSAGES', [])
        return result
      } catch (error) {
        throw error
      }
    },

    // 获取会话列表
    async GetConversationList({ commit }) {
      try {
        const result = await openIMService.getAllConversationList()
        if (result.errCode === 0 && result.data) {
          commit('SET_CONVERSATIONS', result.data)
        }
        return result
      } catch (error) {
        throw error
      }
    },

    // 发送消息
    async SendMessage({ commit, state }, { recvID, groupID, text }) {
      try {
        // 创建文本消息
        const messageResult = await openIMService.createTextMessage(text)
        if (messageResult.errCode !== 0) {
          throw new Error(messageResult.errMsg)
        }

        // 发送消息
        const sendResult = await openIMService.sendMessage({
          recvID,
          groupID,
          message: messageResult.data
        })

        // 发送成功后，如果是当前会话的消息，立即添加到消息列表
        if (sendResult.errCode === 0 && state.currentConversation) {
          const currentConvID = state.currentConversation.conversationID
          const message = messageResult.data

          // 设置消息的会话 ID
          if (!message.conversationID) {
            message.conversationID = currentConvID
          }

          // 添加到消息列表（发送的消息）
          if (message.conversationID === currentConvID) {
            commit('ADD_MESSAGE', message)
          }
        }

        return sendResult
      } catch (error) {
        throw error
      }
    },

    // 获取历史消息
    async GetHistoryMessages({ commit }, params) {
      try {
        const result = await openIMService.getAdvancedHistoryMessageList(params)
        if (result.errCode === 0 && result.data) {
          commit('SET_MESSAGES', result.data)
        }
        return result
      } catch (error) {
        throw error
      }
    },

    // 标记消息已读
    async MarkMessageAsRead({ commit }, conversationID) {
      try {
        return await openIMService.markConversationMessageAsRead(conversationID)
      } catch (error) {
        throw error
      }
    },

    // 设置当前会话
    SetCurrentConversation({ commit }, conversation) {
      commit('SET_CURRENT_CONVERSATION', conversation)
      commit('SET_MESSAGES', [])
    },

    // 添加新消息
    AddMessage({ commit, state }, message) {
      const currentConvID = state.currentConversation?.conversationID
      if (!currentConvID) return

      // 先尝试直接匹配 conversationID
      if (message.conversationID === currentConvID) {
        pushIfNotExists(message)
        return
      }

      // 没匹配上时，根据 sendID/recvID 判断
      const otherUserID =
        message.sendID === state.currentConversation.userID
          ? message.recvID
          : message.sendID
      if (
        otherUserID &&
        otherUserID ===
        (state.currentConversation.userID ||
          state.currentConversation.recvID ||
          state.currentConversation.showUserID)
      ) {
        message.conversationID = currentConvID
        pushIfNotExists(message)
      }

      function pushIfNotExists(msg) {
        const exists = state.messages.some(
          (item) =>
            (item.clientMsgID && item.clientMsgID === msg.clientMsgID) ||
            (item.serverMsgID && item.serverMsgID === msg.serverMsgID)
        )
        if (!exists) {
          commit('ADD_MESSAGE', msg)
        }
      }
    },

    // 更新连接状态
    UpdateConnectionStatus({ commit }, status) {
      commit('SET_CONNECTION_STATUS', status)
    },

    // 更新会话
    UpdateConversation({ commit }, conversation) {
      commit('UPDATE_CONVERSATION', conversation)
    }
  }
}

export default im