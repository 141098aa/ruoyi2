import request from '@/utils/request'

// 查询用户列表列表
export function listUser(query) {
  return request({
    url: '/facebook/user/list',
    method: 'get',
    params: query
  })
}

// 查询用户列表详细
export function getUser(id) {
  return request({
    url: '/facebook/user/' + id,
    method: 'get'
  })
}

// 新增用户列表
export function addUser(data) {
  return request({
    url: '/facebook/user',
    method: 'post',
    data: data
  })
}

// 修改用户列表
export function updateUser(data) {
  return request({
    url: '/facebook/user',
    method: 'put',
    data: data
  })
}

// 删除用户列表
export function delUser(id) {
  return request({
    url: '/facebook/user/' + id,
    method: 'delete'
  })
}

// 派发优惠券
export function assignCoupon(data) {
  return request({
    url: '/facebook/userCoupon/assignCoupon',
    method: 'post',
    data: data
  })
}

// 用户充值
export function rechargeUser(data) {
  return request({
    url: '/facebook/user/recharge',
    method: 'post',
    data: data
  })
}

// 用户扣款
export function deductUser(data) {
  return request({
    url: '/facebook/user/deduct',
    method: 'post',
    data: data
  })
}

// 派单
export function assignOrder(data) {
  return request({
    url: '/facebook/user/assignOrder',
    method: 'post',
    data: data
  })
}
// 查询可发送站内信的客户列表（可加业务筛选）
export function listUserSimple(query) {
  return request({
    url: '/facebook/user/list',
    method: 'get',
    params: {
      pageNum: query.pageNum || 1,
      pageSize: query.pageSize || 20,
      fbNickname: query.fbNickname,
      businessStatus: '0' // 举例：只拿正常状态
    }
  })
}