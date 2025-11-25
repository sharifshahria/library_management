"use client"

import React, { useEffect, useState } from 'react';

interface Reservation {
  _id: string;
  userEmail: string;
  bookId: { _id: string; title: string; author: string };
  reservedAt: string;
  returned: boolean;
  returnedAt?: string;
}

export default function Dashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    const res = await fetch('/api/reservation');
    const data = await res.json();
    setReservations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleReturn = async (id: string) => {
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId: id }),
    });
    const data = await res.json();
    setMessage(data.message);
    fetchReservations();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Reservation & Return Dashboard</h1>
      {message && <p className="mb-4 text-blue-600 text-center text-sm">{message}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reservations.map(reservation => (
          <div key={reservation._id} className="bg-white p-6 rounded shadow mb-4 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">{reservation.bookId.title}</h2>
              <p className="mb-1">by {reservation.bookId.author}</p>
              <p className="mb-1">Reserved by: <span className="font-semibold">{reservation.userEmail}</span></p>
              <p className="mb-1">Reserved At: {new Date(reservation.reservedAt).toLocaleString()}</p>
              {reservation.returned ? (
                <p className="text-green-600">Returned at {reservation.returnedAt ? new Date(reservation.returnedAt).toLocaleString() : ''}</p>
              ) : (
                <button
                  className="mt-2 bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
                  onClick={() => handleReturn(reservation._id)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Mark as Returned'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
