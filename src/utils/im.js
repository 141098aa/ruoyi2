// src/utils/im.js
import { getSDK, CbEvents } from '@openim/wasm-client-sdk/lib/index.js'

// 初始化 SDK，指向 public 下的 wasm 资源
const IMSDK = getSDK({
  coreWasmPath: '/openIM.wasm',
  sqlWasmPath: '/sql-wasm.wasm',
  debug: false        // 生产环境可改为 false
})

// 连接状态
let connectionStatus = 'disconnected'

// 注册基础事件
IMSDK.on(CbEvents.OnConnecting, () => {
  connectionStatus = 'connecting'
  console.log('[IM] 连接中...')
})
IMSDK.on(CbEvents.OnConnectSuccess, () => {
  connectionStatus = 'connected'
  console.log('[IM] 连接成功')
})
IMSDK.on(CbEvents.OnConnectFailed, ({ errMsg }) => {
  connectionStatus = 'failed'
  console.error('[IM] 连接失败:', errMsg)
})
IMSDK.on(CbEvents.OnUserTokenExpired, () => {
  connectionStatus = 'tokenExpired'
  console.warn('[IM] Token 已过期')
})

// 登录封装
export function loginIM({ userID, token, apiAddr, wsAddr, platformID = 5 }) {
  return IMSDK.login({ userID, token, platformID, apiAddr, wsAddr })
}

// 发送文本消息
export async function sendTextMessage({ recvID = '', groupID = '', text }) {
  const { data: message } = await IMSDK.createTextMessage(text)
  return IMSDK.sendMessage({ recvID, groupID, message })
}

// 对外暴露 SDK、本地状态和事件枚举
export { IMSDK, CbEvents, connectionStatus }