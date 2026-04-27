import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../utils/constants';

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/seller/dashboard`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token') || '';
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Session expired - clear local storage and redirect
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("Users");
    window.location.href = "/";
  }
  
  return result;
};

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['DashboardStats'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: (period) => `/stats?period=${period}`,
      providesTags: ['DashboardStats'],
      pollingInterval: 30000,
    }),
    getSellerEarnings: builder.query({
      query: (period) => `/earnings?period=${period}`,
      providesTags: ['DashboardStats'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetSellerEarningsQuery,
} = dashboardApi;
