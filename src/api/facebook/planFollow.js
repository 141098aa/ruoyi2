import request from '@/utils/request'

// 查询计划跟随记录列表
export function listPlanFollow(query) {
  return request({
    url: '/facebook/planFollow/list',
    method: 'get',
    params: query
  })
}

// 查询计划跟随记录详细
export function getPlanFollow(id) {
  return request({
    url: '/facebook/planFollow/' + id,
    method: 'get'
  })
}

// 新增计划跟随记录
export function addPlanFollow(data) {
  return request({
    url: '/facebook/planFollow',
    method: 'post',
    data: data
  })
}

// 修改计划跟随记录
export function updatePlanFollow(data) {
  return request({
    url: '/facebook/planFollow',
    method: 'put',
    data: data
  })
}

// 删除计划跟随记录
export function delPlanFollow(id) {
  return request({
    url: '/facebook/planFollow/' + id,
    method: 'delete'
  })
}
