import React, { useEffect, useRef, useState } from 'react'
import { apiGet } from '../services/api'
import { Chart } from 'chart.js/auto'

export default function ProgressChart({ exercise }) {
  const [data, setData] = useState([]);
  const [runWeeks, setRunWeeks] = useState([]);
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!exercise) return;
    apiGet(`/api/progress/strength/${exercise.id}`).then(setData);
  }, [exercise]);

  useEffect(() => {
    apiGet('/api/progress/running/weekly').then(setRunWeeks);
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;

    const labels = exercise && data.length ? data.map(d => d.date) : runWeeks.map(w => w.week);
    const values = exercise && data.length ? data.map(d => Number(d.est_1rm)) : runWeeks.map(w => Number(w.minutes));

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: exercise ? `Est. 1RM • ${exercise.name}` : 'Weekly Running Minutes',
          data: values
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { ticks: { autoSkip: true, maxTicksLimit: 8 } }
        }
      }
    });

    return () => { chartRef.current?.destroy(); };
  }, [data, runWeeks, exercise]);

  return (
    <div className="card" style={{marginTop:12}}>
      <canvas ref={ref} height="120"></canvas>
    </div>
  );
}
