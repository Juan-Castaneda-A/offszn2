import React, { useMemo, useRef, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function PerformanceChart({ labels, viewsData, salesData }) {
    const chartRef = useRef(null);

    const data = useMemo(() => ({
        labels,
        datasets: [
            {
                label: 'Visitas',
                data: viewsData,
                borderColor: '#8B5CF6',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
                    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                yAxisID: 'y',
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: '#8B5CF6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
            {
                label: 'Ventas',
                data: salesData,
                borderColor: '#10B981',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
                    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                yAxisID: 'y1',
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: '#10B981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            }
        ]
    }), [labels, viewsData, salesData]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#0a0a0a',
                titleColor: '#888',
                bodyColor: '#fff',
                bodyFont: { weight: 'bold', family: 'Inter' },
                padding: 12,
                borderRadius: 12,
                borderColor: 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                displayColors: true,
                usePointStyle: true,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#4a4a4a',
                    font: { size: 10, weight: 'bold' }
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: {
                    color: 'rgba(255,255,255,0.02)',
                },
                ticks: {
                    color: '#4a4a4a',
                    font: { size: 10, weight: 'bold' }
                },
                title: {
                    display: true,
                    text: 'Visitas',
                    color: '#8B5CF6',
                    font: { size: 10, weight: 'black', family: 'Inter' }
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
                ticks: {
                    color: '#4a4a4a',
                    font: { size: 10, weight: 'bold' }
                },
                title: {
                    display: true,
                    text: 'Ventas',
                    color: '#10B981',
                    font: { size: 10, weight: 'black', family: 'Inter' }
                }
            },
        },
    };

    return (
        <div className="w-full h-full min-h-[350px]">
            <Line data={data} options={options} />
        </div>
    );
}
