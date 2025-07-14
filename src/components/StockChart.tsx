import React, { useRef, useEffect } from "react";

type StockEntry = {
    date: string;
    close: number;
};

type Props = {
    data: StockEntry[];
    symbol: string;
    month: string;
};

const StockChart: React.FC<Props> = ({ data, symbol, month }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || data.length === 0) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const margin = 40;
        const width = canvas.width - 2 * margin;
        const height = canvas.height - 2 * margin;
        const closes = data.map(d => d.close);
        const max = Math.max(...closes);
        const min = Math.min(...closes);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Achsen
        ctx.strokeStyle = "#333";
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, margin + height);
        ctx.lineTo(margin + width, margin + height);
        ctx.stroke();

        // Linie
        ctx.strokeStyle = "#007bff";
        ctx.beginPath();
        data.forEach((d, i) => {
            const x = margin + (i / (data.length - 1)) * width;
            const y = margin + height - ((d.close - min) / (max - min)) * height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Beschriftung
        ctx.fillStyle = "#111";
        ctx.fillText(`Schlusskurs ${symbol} (${month})`, margin, margin - 10);
        ctx.fillText(max.toFixed(2), 5, margin + 10);
        ctx.fillText(min.toFixed(2), 5, margin + height);
    }, [data, symbol, month]);

    return (
        <div className="chart-container">
            <canvas ref={canvasRef} width={800} height={400}></canvas>
        </div>
    );
};

export default StockChart;
