export async function generateStaticParams() {
  // Return demo params for build time
  // Actual pages will be rendered client-side
  return [{ catalogId: 'catalog-001' }, { catalogId: 'catalog-002' }]
}
