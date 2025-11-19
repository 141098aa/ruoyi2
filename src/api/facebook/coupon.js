import request from '@/utils/request'

// 查询优惠券库列表
export function listCoupon(query) {
  return request({
    url: '/facebook/coupon/list',
    method: 'get',
    params: query
  })
}

// 查询优惠券库详细
export function getCoupon(id) {
  return request({
    url: '/facebook/coupon/' + id,
    method: 'get'
  })
}

// 新增优惠券库
export function addCoupon(data) {
  return request({
    url: '/facebook/coupon',
    method: 'post',
    data: data
  })
}

// 修改优惠券库
export function updateCoupon(data) {
  return request({
    url: '/facebook/coupon',
    method: 'put',
    data: data
  })
}

// 删除优惠券库
export function delCoupon(id) {
  return request({
    url: '/facebook/coupon/' + id,
    method: 'delete'
  })
}
