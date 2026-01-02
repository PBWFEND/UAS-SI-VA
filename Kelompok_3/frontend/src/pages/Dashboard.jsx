import { useEffect, useState } from "react";
import { getLoans, createLoan, deleteLoan, updateLoan } from "../services/api";


export default function Dashboard() {
  const [loans, setLoans] = useState([]);
  const [toolName, setToolName] = useState("");
  const [quantity, setQuantity] = useState("");

  const token = localStorage.getItem("token");

  const fetchLoans = async () => {
    const res = await getLoans(token);
    setLoans(res.data || []);
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createLoan(token, {
      toolName,
      quantity,
      borrowDate: new Date().toISOString().split("T")[0],
    });
    setToolName("");
    setQuantity("");
    fetchLoans();
  };

  const handleReturn = async (id) => {
    await updateLoan(token, id, {
        status: "dikembalikan",
        returnDate: new Date().toISOString().split("T")[0],
    });
  fetchLoans();
  };




  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl p-8 animate-fade-in">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 text-center flex-1">
            📋 Dashboard Peminjaman
          </h1>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            🚪 Logout
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 p-6 rounded-xl shadow mb-10"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            ➕ Tambah Peminjaman
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nama Alat"
              className="border rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Jumlah"
              className="border rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-3 rounded-lg font-semibold"
          >
            Tambah Peminjaman
          </button>
        </form>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border rounded-xl overflow-hidden">
            <thead className="bg-indigo-200 text-indigo-800">
              <tr>
                <th className="p-3 text-left">Alat</th>
                <th className="p-3 text-center">Jumlah</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loans.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-6 text-gray-500">
                    Belum ada data peminjaman
                  </td>
                </tr>
              )}

              {loans.map((loan) => (
                <tr
                  key={loan.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{loan.toolName}</td>
                  <td className="p-3 text-center">{loan.quantity}</td>
                  <td className="p-3 text-center">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                      {loan.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() =>
                        deleteLoan(token, loan.id).then(fetchLoans)
                      }
                      className="bg-red-500 hover:bg-red-600 transition text-white px-3 py-1 rounded-lg"
                    >
                      🗑 Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
