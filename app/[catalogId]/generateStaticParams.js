export async function generateStaticParams() {
  // 返回空数组意味着这些页面会在客户端动态加载
  // 这样可以让静态导出成功，同时保持客户端动态渲染能力
  return []
}
