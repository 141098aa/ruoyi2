const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  dict: state => state.dict.dict,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  permissions: state => state.user.permissions,
  permission_routes: state => state.permission.routes,
  topbarRouters: state => state.permission.topbarRouters,
  defaultRoutes: state => state.permission.defaultRoutes,
  sidebarRouters: state => state.permission.sidebarRouters,
  // 添加 OpenIM 相关的 getters
  imConnectionStatus: state => state.im.connectionStatus,
  imIsLoggedIn: state => state.im.isLoggedIn,
  imConversations: state => state.im.conversations,  
  imCurrentConversation: state => state.im.currentConversation,
  imMessages: state => state.im.messages,
  id: state => state.user.id,
  imToken: state => state.user.imToken,
  openimUserID: state => state.user.openimUserID
}
export default getters
