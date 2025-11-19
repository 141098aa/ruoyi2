import request from '@/utils/request'

// 查询用户优惠券列表
export function listUserCoupon(query) {
  return request({
    url: '/facebook/userCoupon/list',
    method: 'get',
    params: query
  })
}

// 查询用户优惠券详细
export function getUserCoupon(id) {
  return request({
    url: '/facebook/userCoupon/' + id,
    method: 'get'
  })
}

// 新增用户优惠券
export function addUserCoupon(data) {
  return request({
    url: '/facebook/userCoupon',
    method: 'post',
    data: data
  })
}

// 修改用户优惠券
export function updateUserCoupon(data) {
  return request({
    url: '/facebook/userCoupon',
    method: 'put',
    data: data
  })
}

// 删除用户优惠券
export function delUserCoupon(id) {
  return request({
    url: '/facebook/userCoupon/' + id,
    method: 'delete'
  })
}
