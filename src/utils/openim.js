const OpenIMSDKPkg = require('@openim/wasm-client-sdk/lib/index.js')
const { CbEvents, LogLevel, getSDK } = OpenIMSDKPkg
// 取到 SDK 实例（库内部是单例）
const OpenIMSDK = getSDK()

class OpenIMService {
  constructor() {
    this.instance = null
    this.isInitialized = false
    this.isLoggedIn = false
    this.listeners = new Map()
  }

  // 初始化 SDK（Web 环境）
  async initSDK(config) {
    try {
      const defaultConfig = {
        platformID: 5, // Web 平台
        apiAddr: config.apiAddr || 'http://your-server-ip:10002',
        wsAddr: config.wsAddr || 'ws://your-server-ip:10001',
        logLevel: LogLevel.Error,
        ...config
      }

      // 设置 WASM 文件路径
      if (typeof window !== 'undefined') {
        window.OPENIM_SDK_WASM_PATH = process.env.BASE_URL + 'static/wasm/'
      }

      this.instance = OpenIMSDK
      this.isInitialized = true

      // 设置事件监听
      this.setupEventListeners()

      return { errCode: 0, errMsg: 'success' }
    } catch (error) {
      console.error('OpenIM SDK 初始化失败:', error)
      return { errCode: -1, errMsg: error.message }
    }
  }

  // 登录
  async login(loginParams) {
    if (!this.isInitialized) {
      throw new Error('SDK 未初始化，请先调用 initSDK')
    }

    try {
      const params = {
        userID: loginParams.userID,
        token: loginParams.token,
        platformID: loginParams.platformID || 5,
        apiAddr: loginParams.apiAddr,
        wsAddr: loginParams.wsAddr,
        logLevel: loginParams.logLevel || LogLevel.Debug
      }

      const result = await this.instance.login(params)

      if (result.errCode === 0) {
        this.isLoggedIn = true
      }

      return result
    } catch (error) {
      console.error('OpenIM 登录失败:', error)
      return { errCode: -1, errMsg: error.message }
    }
  }

  // 登出
  async logout() {
    if (!this.instance) {
      return { errCode: 0, errMsg: 'success' }
    }

    try {
      const result = await this.instance.logout()
      this.isLoggedIn = false
      return result
    } catch (error) {
      console.error('OpenIM 登出失败:', error)
      return { errCode: -1, errMsg: error.message }
    }
  }

  // 设置事件监听
  setupEventListeners() {
    if (!this.instance) return

    // 连接中
    this.instance.on(CbEvents.OnConnecting, () => {
      this.emit('connecting')
    })

    // 连接成功
    this.instance.on(CbEvents.OnConnectSuccess, () => {
      this.emit('connectSuccess')
    })

    // 连接失败
    this.instance.on(CbEvents.OnConnectFailed, (data) => {
      this.emit('connectFailed', data)
    })

    // 接收新消息（正确）
    this.instance.on(CbEvents.OnRecvNewMessage, (data) => {
        console.log("收到新消息:", data);
        this.emit('newMessage', data);
    });


    // 会话变更
    this.instance.on(CbEvents.OnConversationChanged, (data) => {
      this.emit('conversationChanged', data)
    })

    // 消息已读回执
    this.instance.on(CbEvents.OnRecvC2CReadReceipt, (data) => {
      this.emit('readReceipt', data)
    })

    // 消息发送进度
    this.instance.on(CbEvents.OnRecvMessageRevoked, (data) => {
      this.emit('messageRevoked', data)
    })
  }

  // 事件订阅
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  // 事件取消订阅
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // 触发事件
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        callback(data)
      })
    }
  }

  // 获取所有会话列表
  async getAllConversationList() {
    if (!this.instance) {
      throw new Error('SDK 未初始化')
    }
    return await this.instance.getAllConversationList()
  }

  // 获取单个会话
  async getOneConversation(sourceID, sessionType) {
    if (!this.instance) {
      throw new Error('SDK 未初始化')
    }
    return await this.instance.getOneConversation({
      sourceID,
      sessionType
    })
  }

  // 创建文本消息
  async createTextMessage(text) {
    if (!this.instance) {
      throw new Error('SDK 未初始化')
    }
    return await this.instance.createTextMessage(text)
  }

  // 发送消息
  async sendMessage(params) {
    if (!this.instance) {
      throw new Error('SDK 未初始化')
    }
    return await this.instance.sendMessage(params)
  }

  // 获取历史消息
  async getAdvancedHistoryMessageList(params) {
    if (!this.instance) {
      throw new Error('SDK 未初始化')
    }
    return await this.instance.getAdvancedHistoryMessageList(params)
  }

  // 标记消息已读
  async markConversationMessageAsRead(conversationID) {
    if (!this.instance) {
      throw new Error('SDK 未初始化')
    }
    return await this.instance.markConversationMessageAsRead(conversationID)
  }

  // 设置会话草稿
  async setConversationDraft(conversationID, draftText) {
    if (!this.instance) {
      throw new Error('SDK 未初始化')
    }
    return await this.instance.setConversationDraft({
      conversationID,
      draftText
    })
  }

  // 删除会话
  async deleteConversation(conversationID) {
    if (!this.instance) {
      throw new Error('SDK 未初始化')
    }
    return await this.instance.deleteConversation(conversationID)
  }
}

// 导出单例
export default new OpenIMService()