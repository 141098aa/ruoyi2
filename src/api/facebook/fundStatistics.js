import request from '@/utils/request'

// 查询充值提现统计列表
export function listFundStatistics(query) {
  return request({
    url: '/facebook/fundStatistics/list',
    method: 'get',
    params: query
  })
}

// 查询充值提现统计详细
export function getFundStatistics(id) {
  return request({
    url: '/facebook/fundStatistics/' + id,
    method: 'get'
  })
}

// 新增充值提现统计
export function addFundStatistics(data) {
  return request({
    url: '/facebook/fundStatistics',
    method: 'post',
    data: data
  })
}

// 修改充值提现统计
export function updateFundStatistics(data) {
  return request({
    url: '/facebook/fundStatistics',
    method: 'put',
    data: data
  })
}

// 删除充值提现统计
export function delFundStatistics(id) {
  return request({
    url: '/facebook/fundStatistics/' + id,
    method: 'delete'
  })
}
