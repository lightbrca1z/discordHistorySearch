'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function Home() {
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [forecast, setForecast] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/forecast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                }),
            });
            const data = await response.json();
            setForecast(data.forecast);
        }
        catch (error) {
            console.error('Error:', error);
            setForecast('エラーが発生しました');
        }
    };
    return (_jsxs("div", { className: "p-8 max-w-2xl mx-auto", children: [_jsx("h1", { className: "text-2xl font-bold mb-6", children: "\u5929\u6C17\u4E88\u5831\u30A2\u30D7\u30EA" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block mb-2", children: "\u7DEF\u5EA6:" }), _jsx("input", { type: "number", value: latitude, onChange: (e) => setLatitude(e.target.value), className: "w-full p-2 border rounded", step: "any", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block mb-2", children: "\u7D4C\u5EA6:" }), _jsx("input", { type: "number", value: longitude, onChange: (e) => setLongitude(e.target.value), className: "w-full p-2 border rounded", step: "any", required: true })] }), _jsx("button", { type: "submit", className: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600", children: "\u5929\u6C17\u4E88\u5831\u3092\u53D6\u5F97" })] }), forecast && (_jsxs("div", { className: "mt-6 p-4 bg-gray-100 rounded", children: [_jsx("h2", { className: "font-bold mb-2", children: "\u5929\u6C17\u4E88\u5831:" }), _jsx("p", { children: forecast })] }))] }));
}
