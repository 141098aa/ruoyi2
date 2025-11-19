import request from '@/utils/request'

// 查询实名列表
export function listKyc(query) {
  return request({
    url: '/facebook/kyc/list',
    method: 'get',
    params: query
  })
}

// 查询实名详细
export function getKyc(id) {
  return request({
    url: '/facebook/kyc/' + id,
    method: 'get'
  })
}

// 新增实名
export function addKyc(data) {
  return request({
    url: '/facebook/kyc',
    method: 'post',
    data: data
  })
}

// 修改实名
export function updateKyc(data) {
  return request({
    url: '/facebook/kyc',
    method: 'put',
    data: data
  })
}

// 删除实名
export function delKyc(id) {
  return request({
    url: '/facebook/kyc/' + id,
    method: 'delete'
  })
}
