import request from '@/utils/request'

// 查询资金明细列表
export function listFundDetail(query) {
  return request({
    url: '/facebook/fundDetail/list',
    method: 'get',
    params: query
  })
}

// 查询资金明细详细
export function getFundDetail(id) {
  return request({
    url: '/facebook/fundDetail/' + id,
    method: 'get'
  })
}

// 新增资金明细
export function addFundDetail(data) {
  return request({
    url: '/facebook/fundDetail',
    method: 'post',
    data: data
  })
}

// 修改资金明细
export function updateFundDetail(data) {
  return request({
    url: '/facebook/fundDetail',
    method: 'put',
    data: data
  })
}

// 删除资金明细
export function delFundDetail(id) {
  return request({
    url: '/facebook/fundDetail/' + id,
    method: 'delete'
  })
}
