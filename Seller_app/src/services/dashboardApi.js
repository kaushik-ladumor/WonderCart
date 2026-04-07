import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../utils/constants';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/seller/dashboard`, // Pointing to the specific API route in backend
    prepareHeaders: (headers, { getState }) => {
      // Existing token logic
      const token = getState()?.auth?.token || localStorage.getItem('token') || '';
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['DashboardStats'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: (period) => `/stats?period=${period}`,
      providesTags: ['DashboardStats'],
      pollingInterval: 30000,
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
} = dashboardApi;
