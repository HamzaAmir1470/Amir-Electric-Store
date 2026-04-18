import React, { useState } from "react";

const Khata = () => {
    const [customers, setCustomers] = useState([
        {
            id: 1,
            name: "Ali Ahmed",
            phone: "03001234567",
            balance: 2500
        },
        {
            id: 2,
            name: "Usman Khan",
            phone: "03111234567",
            balance: -1500
        }
    ]);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        balance: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const addCustomer = (e) => {
        e.preventDefault();

        const newCustomer = {
            id: Date.now(),
            name: form.name,
            phone: form.phone,
            balance: Number(form.balance)
        };

        setCustomers([...customers, newCustomer]);

        setForm({
            name: "",
            phone: "",
            balance: ""
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    📒 Khata Management
                </h1>

                {/* Add Customer Form */}
                <div className="bg-white p-6 rounded-xl shadow mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        ➕ Add Customer Khata
                    </h2>

                    <form onSubmit={addCustomer} className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <input
                            type="text"
                            name="name"
                            placeholder="Customer Name"
                            value={form.name}
                            onChange={handleChange}
                            className="p-5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                            required
                        />

                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone Number"
                            value={form.phone}
                            onChange={handleChange}
                            className="p-5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                            required
                        />

                        <input
                            type="number"
                            name="balance"
                            placeholder="Opening Balance (+/-)"
                            value={form.balance}
                            onChange={handleChange}
                            className="p-5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                            required
                        />

                        <button
                            type="submit"
                            className="md:col-span-3 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            💾 Add Khata
                        </button>

                    </form>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow overflow-hidden">

                    <table className="w-full text-left">
                        <thead className="bg-gray-200 text-gray-700">
                            <tr>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">Balance</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {customers.map((c) => (
                                <tr key={c.id} className="border-t">

                                    <td className="p-4 font-semibold">
                                        {c.name}
                                    </td>

                                    <td className="p-4 text-gray-600">
                                        {c.phone}
                                    </td>

                                    <td className={`p-4 font-bold ${c.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        Rs. {c.balance}
                                    </td>

                                    <td className="p-4">
                                        {c.balance >= 0 ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                                You will Receive
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                                                You will Pay
                                            </span>
                                        )}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>

            </div>
        </div>
    );
};

export default Khata;