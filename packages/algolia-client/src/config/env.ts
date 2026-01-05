export const config = {
  algolia: {
    app: {
      id: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    },
    api: {
      adminKey: process.env.ALGOLIA_ADMIN_API_KEY,
      searchKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
    },
  },
};
