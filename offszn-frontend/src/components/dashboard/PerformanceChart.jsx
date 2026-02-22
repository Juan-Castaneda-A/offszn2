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
                borderWidth: 3,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
                    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
                    return gradient;
                },
                fill: true,
                tension: 0.45,
                yAxisID: 'y',
                pointRadius: 0,
                pointHoverRadius: 8,
                pointBackgroundColor: '#8B5CF6',
                pointBorderColor: '#fff',
                pointBorderWidth: 3,
                hoverBorderWidth: 4,
            },
            {
                label: 'Ventas',
                data: salesData,
                borderColor: '#10B981',
                borderWidth: 3,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
                    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
                    return gradient;
                },
                fill: true,
                tension: 0.45,
                yAxisID: 'y1',
                pointRadius: 0,
                pointHoverRadius: 8,
                pointBackgroundColor: '#10B981',
                pointBorderColor: '#fff',
                pointBorderWidth: 3,
                hoverBorderWidth: 4,
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
                backgroundColor: 'rgba(10, 10, 10, 0.8)',
                backdropBlur: 10,
                titleColor: 'rgba(255, 255, 255, 0.5)',
                titleFont: { size: 10, weight: 'black', family: 'Inter', textTransform: 'uppercase' },
                bodyColor: '#fff',
                bodyFont: { size: 13, weight: 'black', family: 'Inter' },
                padding: 16,
                borderRadius: 24,
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                displayColors: true,
                usePointStyle: true,
                boxWidth: 8,
                boxHeight: 8,
                boxPadding: 6,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toLocaleString();
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
                    color: '#333',
                    font: { size: 10, weight: 'black', family: 'Inter' },
                    padding: 10
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: {
                    color: 'rgba(255,255,255,0.02)',
                    drawBorder: false
                },
                ticks: {
                    color: '#333',
                    font: { size: 10, weight: 'black', family: 'Inter' },
                    callback: (value) => value.toLocaleString(),
                    padding: 10
                },
                title: {
                    display: false
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                    drawBorder: false
                },
                ticks: {
                    color: '#333',
                    font: { size: 10, weight: 'black', family: 'Inter' },
                    callback: (value) => value.toLocaleString(),
                    padding: 10
                },
                title: {
                    display: false
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
