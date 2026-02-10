import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../api/client';
import { useAuth } from '../store/authStore';

export const useAnalytics = (period = '30d') => {
    const { user } = useAuth();
    const [data, setData] = useState({
        metrics: {
            views: 0,
            sales: 0,
            revenue: 0,
            conversion: 0,
            freeDownloads: 0,
            reelsViews: 0
        },
        chartData: {
            labels: [],
            views: [],
            sales: []
        },
        topProducts: [],
        loading: true
    });

    const fetchAnalytics = useCallback(async () => {
        if (!user) return;
        setData(prev => ({ ...prev, loading: true }));

        const now = new Date();
        let startDate = null;

        if (period === '7d') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (period === '30d') {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        try {
            // 1. Fetch Page Views
            let viewsQuery = supabase
                .from('page_views')
                .select('viewed_at')
                .eq('user_id', user.id); // Assuming user_id here refers to the producer's content owner id

            if (startDate) viewsQuery = viewsQuery.gte('viewed_at', startDate.toISOString());
            const { data: rawViews, error: viewsError } = await viewsQuery;
            if (viewsError) throw viewsError;

            // 2. Fetch Orders
            let ordersQuery = supabase
                .from('orders')
                .select('id, amount, total_price, created_at')
                .eq('producer_id', user.id);

            if (startDate) ordersQuery = ordersQuery.gte('created_at', startDate.toISOString());
            const { data: rawOrders, error: ordersError } = await ordersQuery;
            if (ordersError) throw ordersError;

            // 3. Fetch Reels Views (Lifetime aggregate as per docs)
            const { data: rawReels, error: reelsError } = await supabase
                .from('reels')
                .select('views_count')
                .eq('user_id', user.id);
            if (reelsError) throw reelsError;

            const totalReelsViews = rawReels?.reduce((acc, curr) => acc + (curr.views_count || 0), 0) || 0;

            // 4. Process Chart Data (Time Bucketing)
            const processedChart = processChartData(rawViews, rawOrders, startDate, period);

            // 5. Calculate Metrics
            const totalViews = rawViews?.length || 0;
            const totalOrders = rawOrders?.length || 0;
            const totalRevenue = rawOrders?.reduce((acc, curr) => acc + (parseFloat(curr.amount || curr.total_price || 0)), 0) || 0;
            const freeDownloads = rawOrders?.filter(o => (parseFloat(o.amount || o.total_price || 0)) <= 0).length || 0;
            const conversion = totalViews > 0 ? ((totalOrders / totalViews) * 100).toFixed(1) : 0;

            // 6. Top Products Ranking (Multi-step)
            let topProducts = [];
            if (rawOrders?.length > 0) {
                const orderIds = rawOrders.map(o => o.id);
                const { data: items, error: itemsError } = await supabase
                    .from('order_items')
                    .select('product_id, price, products(name, image_url, cover_url)')
                    .in('order_id', orderIds);

                if (!itemsError && items) {
                    const stats = {};
                    items.forEach(item => {
                        if (!stats[item.product_id]) {
                            stats[item.product_id] = {
                                id: item.product_id,
                                name: item.products?.name || 'Producto Desconocido',
                                image: item.products?.cover_url || item.products?.image_url,
                                sales: 0,
                                revenue: 0
                            };
                        }
                        stats[item.product_id].sales += 1;
                        stats[item.product_id].revenue += parseFloat(item.price || 0);
                    });
                    topProducts = Object.values(stats)
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5);
                }
            }

            setData({
                metrics: {
                    views: totalViews,
                    sales: totalOrders,
                    revenue: totalRevenue,
                    conversion,
                    freeDownloads,
                    reelsViews: totalReelsViews
                },
                chartData: processedChart,
                topProducts,
                loading: false
            });

        } catch (err) {
            console.error("Error fetching analytics:", err);
            setData(prev => ({ ...prev, loading: false }));
        }
    }, [user, period]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return data;
};

// Helper function for time-based aggregation
function processChartData(views, orders, startDate, period) {
    const dataMap = {};
    const labels = [];
    const viewsData = [];
    const salesData = [];

    if (period === 'all') {
        // Aggregate by unique dates present
        const allDates = new Set([
            ...(views?.map(v => v.viewed_at.split('T')[0]) || []),
            ...(orders?.map(o => o.created_at.split('T')[0]) || [])
        ]);
        const sortedDates = Array.from(allDates).sort();

        sortedDates.forEach(date => {
            const vCount = views?.filter(v => v.viewed_at.startsWith(date)).length || 0;
            const sCount = orders?.filter(o => o.created_at.startsWith(date)).length || 0;

            const dateObj = new Date(date);
            labels.push(`${dateObj.getDate()}/${dateObj.getMonth() + 1}`);
            viewsData.push(vCount);
            salesData.push(sCount);
        });
    } else {
        // Fixed range (7d or 30d)
        const days = period === '7d' ? 7 : 30;
        for (let i = 0; i < days; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i + 1);
            const dateStr = d.toISOString().split('T')[0];

            const vCount = views?.filter(v => v.viewed_at.startsWith(dateStr)).length || 0;
            const sCount = orders?.filter(o => o.created_at.startsWith(dateStr)).length || 0;

            labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
            viewsData.push(vCount);
            salesData.push(sCount);
        }
    }

    return { labels, views: viewsData, sales: salesData };
}
