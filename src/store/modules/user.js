import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

// 添加获取和设置 OpenIM 信息的工具函数
const getImToken = () => {
  return localStorage.getItem('imToken') || ''
}

const setImToken = (token) => {
  if (token) {
    localStorage.setItem('imToken', token)
  } else {
    localStorage.removeItem('imToken')
  }
}

const getOpenimUserID = () => {
  return localStorage.getItem('openimUserID') || ''
}

const setOpenimUserID = (userID) => {
  if (userID) {
    localStorage.setItem('openimUserID', userID)
  } else {
    localStorage.removeItem('openimUserID')
  }
}
const user = {
  state: {
    token: getToken(),
    id: '',
    name: '',
    avatar: '',
    roles: [],
    permissions: [],
    imToken: getImToken(),        // 从 localStorage 读取
    openimUserID: getOpenimUserID()   // 从 localStorage 读取
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_ID: (state, id) => {
      state.id = id
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
    },
    // 添加 OpenIM 相关的 mutations
    SET_IM_TOKEN: (state, imToken) => {
      state.imToken = imToken
      setImToken(imToken)  // 同时保存到 localStorage
    },
    SET_OPENIM_USER_ID: (state, userID) => {
      state.openimUserID = userID
      setOpenimUserID(userID)  // 同时保存到 localStorage
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      return new Promise((resolve, reject) => {
        login(username, password, code, uuid).then(res => {
          //console.log('登录返回数据:', res.data)  
          setToken(res.data.token)
          commit('SET_TOKEN', res.data.token)
          // 保存 OpenIM 相关信息（会自动保存到 localStorage）
          if (res.data.imToken) {
            commit('SET_IM_TOKEN', res.data.imToken)
          }
          if (res.data.userID) {
            commit('SET_OPENIM_USER_ID', res.data.userID)
          }
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo().then(res => {
          const user = res.data.user
          const avatar = (user.avatar == "" || user.avatar == null) ? require("@/assets/images/profile.jpg") : user.avatar;
          if (res.data.roles && res.data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', res.data.roles)
            commit('SET_PERMISSIONS', res.data.permissions)
          } else {
            commit('SET_ROLES', ['ROLE_DEFAULT'])
          }
          commit('SET_ID', user.userId)
          commit('SET_NAME', user.userName)
          commit('SET_AVATAR', avatar)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 退出系统
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_PERMISSIONS', [])
          commit('SET_IM_TOKEN', '')      // 清除 OpenIM token
          commit('SET_OPENIM_USER_ID', '') // 清除 OpenIM userID
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        commit('SET_IM_TOKEN', '')      // 清除 OpenIM token
        commit('SET_OPENIM_USER_ID', '') // 清除 OpenIM userID
        removeToken()
        resolve()
      })
    }
  }
}

export default user
