import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/constants';

const useDeals = ({ category, dealType, sort, page: initialPage = 1, limit = 20 }) => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(false);

    const fetchDeals = useCallback(async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            
            const params = {
                category: category === 'All' ? undefined : category,
                dealType,
                sort,
                page: isRefresh ? 1 : page,
                limit
            };

            // Use API_URL from constants for consistency across portals
            const response = await axios.get(`${API_URL}/api/deals`, { params });
            
            // Backend returns { success: true, data: deals, total, page, totalPages }
            const result = response.data;
            const fetchedData = result.data || [];
            const totalDeals = result.total || 0;
            const totalPages = result.totalPages || 0;

            if (isRefresh || page === 1) {
                setDeals(fetchedData);
            } else {
                setDeals(prev => [...prev, ...fetchedData]);
            }

            setTotal(totalDeals);
            setHasMore(page < totalPages);
            setError(null);
        } catch (err) {
            console.error('useDeals Error:', err.response?.data || err.message);
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, [category, dealType, sort, page, limit]);

    // Reset pagination when search params change
    useEffect(() => {
        setPage(1);
    }, [category, dealType, sort]);

    // Normal fetch when page dependencies change
    useEffect(() => {
        fetchDeals();
    }, [category, dealType, sort, page]); // Removed fetchDeals from here to prevent infinite loop, manually handle page

    // Auto-refresh every 60 seconds to keep timers/stock fresh
    useEffect(() => {
        const interval = setInterval(() => {
            fetchDeals(true);
        }, 60000);
        return () => clearInterval(interval);
    }, [category, dealType, sort]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    }, [loading, hasMore]);

    return { 
        deals, 
        loading, 
        error, 
        total, 
        hasMore, 
        loadMore, 
        refresh: () => fetchDeals(true) 
    };
};

export default useDeals;
