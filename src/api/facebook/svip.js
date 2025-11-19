import request from '@/utils/request'

// 查询svip列表
export function listVip(query) {
  return request({
    url: '/facebook/vip/list',
    method: 'get',
    params: query
  })
}

// 查询svip详细
export function getVip(id) {
  return request({
    url: '/facebook/vip/' + id,
    method: 'get'
  })
}

// 新增svip
export function addVip(data) {
  return request({
    url: '/facebook/vip',
    method: 'post',
    data: data
  })
}

// 修改svip
export function updateVip(data) {
  return request({
    url: '/facebook/vip',
    method: 'put',
    data: data
  })
}

// 删除svip
export function delVip(id) {
  return request({
    url: '/facebook/vip/' + id,
    method: 'delete'
  })
}
