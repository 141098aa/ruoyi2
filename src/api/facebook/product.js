import request from '@/utils/request'

// 查询产品库列表
export function listProduct(query) {
  return request({
    url: '/facebook/product/list',
    method: 'get',
    params: query
  })
}

// 查询产品库详细
export function getProduct(id) {
  return request({
    url: '/facebook/product/' + id,
    method: 'get'
  })
}

// 新增产品库
export function addProduct(data) {
  return request({
    url: '/facebook/product',
    method: 'post',
    data: data
  })
}

// 修改产品库
export function updateProduct(data) {
  return request({
    url: '/facebook/product',
    method: 'put',
    data: data
  })
}

// 删除产品库
export function delProduct(id) {
  return request({
    url: '/facebook/product/' + id,
    method: 'delete'
  })
}
