import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        products: 0,
        stock: 0,
        sales: 0,
        invoices: 0
    });

    // 🔥 Simulated data (replace with API later)
    useEffect(() => {
        const dummyData = {
            products: 120,
            stock: 540,
            sales: 125000,
            invoices: 86
        };
        setStats(dummyData);
    }, []);

    const Card = ({ title, value, icon, color }) => (
        <div className={`p-6 rounded-xl shadow-lg bg-gradient-to-r ${color} text-white`}>
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <p className="text-2xl font-bold mt-2">{value}</p>
                </div>
                <div className="text-3xl">{icon}</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* Title */}
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                Admin Dashboard
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                <Card
                    title="Total Products"
                    value={stats.products}
                    icon="📦"
                    color="from-blue-500 to-blue-700"
                />

                <Card
                    title="Total Stock"
                    value={stats.stock}
                    icon="📊"
                    color="from-green-500 to-green-700"
                />

                <Card
                    title="Total Sales"
                    value={`Rs. ${stats.sales}`}
                    icon="💰"
                    color="from-purple-500 to-purple-700"
                />

                <Card
                    title="Invoices"
                    value={stats.invoices}
                    icon="🧾"
                    color="from-orange-500 to-orange-700"
                />

            </div>

            {/* Recent Activity */}
            <div className="mt-10 bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

                <ul className="space-y-3 text-gray-600">
                    <li>✅ Product "LED Bulb" added</li>
                    <li>💰 Sale of Rs. 5,000 recorded</li>
                    <li>📦 Stock updated for "Wires"</li>
                    <li>🧾 Invoice #102 generated</li>
                </ul>
            </div>

        </div>
    );
};

export default AdminDashboard;