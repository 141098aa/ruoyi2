import request from '@/utils/request'

// 查询充值记录列表
export function listRechargeRecord(query) {
  return request({
    url: '/facebook/rechargeRecord/list',
    method: 'get',
    params: query
  })
}

// 查询充值记录详细
export function getRechargeRecord(id) {
  return request({
    url: '/facebook/rechargeRecord/' + id,
    method: 'get'
  })
}

// 新增充值记录
export function addRechargeRecord(data) {
  return request({
    url: '/facebook/rechargeRecord',
    method: 'post',
    data: data
  })
}

// 修改充值记录
export function updateRechargeRecord(data) {
  return request({
    url: '/facebook/rechargeRecord',
    method: 'put',
    data: data
  })
}

// 删除充值记录
export function delRechargeRecord(id) {
  return request({
    url: '/facebook/rechargeRecord/' + id,
    method: 'delete'
  })
}
