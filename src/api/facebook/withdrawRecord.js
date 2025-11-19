import request from '@/utils/request'

// 查询提现记录列表
export function listWithdrawRecord(query) {
  return request({
    url: '/facebook/withdrawRecord/list',
    method: 'get',
    params: query
  })
}

// 查询提现记录详细
export function getWithdrawRecord(id) {
  return request({
    url: '/facebook/withdrawRecord/' + id,
    method: 'get'
  })
}

// 新增提现记录
export function addWithdrawRecord(data) {
  return request({
    url: '/facebook/withdrawRecord',
    method: 'post',
    data: data
  })
}

// 修改提现记录
export function updateWithdrawRecord(data) {
  return request({
    url: '/facebook/withdrawRecord',
    method: 'put',
    data: data
  })
}

// 删除提现记录
export function delWithdrawRecord(id) {
  return request({
    url: '/facebook/withdrawRecord/' + id,
    method: 'delete'
  })
}


// 获取用户信息
export function getUserInfo(userId) {
  return request({
    url: '/facebook/user/' + userId,
    method: 'get'
  })
}

// 新增获取用户地址信息（按用户地址ID）
export function getAddressByUser(id) {
  return request({
    url: '/facebook/address/getInfoByUser/' + id,  // 将id直接拼接到URL路径中
    method: 'get'
  })
}
