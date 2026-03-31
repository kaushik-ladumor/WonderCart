import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";

export const useTopSellers = (category = "All", initialPage = 1) => {
  const [data, setData] = useState([]);
  const [rising, setRising] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  // Time remaining to next hour state in seconds
  const [nextRefresh, setNextRefresh] = useState(null);

  const fetchTopSellers = useCallback(async (pageNum = 1, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      else setLoadingMore(true);

      const res = await axios.get(`${API_URL}/api/top-sellers`, {
        params: { category: category !== "All" ? category : undefined, page: pageNum, limit: 20 },
      });

      if (res.data.success) {
        if (isLoadMore) {
          setData((prev) => [...prev, ...res.data.data]);
        } else {
          setData(res.data.data);
        }
        setHasMore(res.data.data.length === 20); // If less than limit, no more
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category]);

  const fetchRisingAndCategories = useCallback(async () => {
    try {
      const [risingRes, catRes] = await Promise.all([
        axios.get(`${API_URL}/api/top-sellers/rising`, {
           params: { category: category !== "All" ? category : undefined }
        }),
        axios.get(`${API_URL}/api/top-sellers/categories`),
      ]);

      if (risingRes.data.success) {
        setRising(risingRes.data.data);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching rising/categories:", err);
    }
  }, [category]);

  useEffect(() => {
    setPage(1);
    fetchTopSellers(1, false);
    fetchRisingAndCategories();
  }, [category, fetchTopSellers, fetchRisingAndCategories]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTopSellers(nextPage, true);
  }, [page, hasMore, loadingMore, fetchTopSellers]);

  // Handle auto-refresh every hour (at the top of the hour)
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const nextHour = new Date();
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      return Math.floor((nextHour - now) / 1000); // seconds
    };

    setNextRefresh(calculateTimeRemaining());

    const timer = setInterval(() => {
      setNextRefresh((prev) => {
        if (prev <= 1) {
          // Re-fetch data when timer hits 0
          fetchTopSellers(1, false);
          return calculateTimeRemaining();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchTopSellers]);

  return {
    data,
    rising,
    categories,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    nextRefresh,
  };
};
