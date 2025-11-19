import request from '@/utils/request'

// 获取 OpenIM 用户 token（需要后端提供接口）
export function getOpenIMToken(userID) {
  return request({
    url: '/openim/token',
    method: 'get',
    params: { userID }
  })
}

// 获取 OpenIM 配置信息
export function getOpenIMConfig() {
  return request({
    url: '/openim/config',
    method: 'get'
  })
}