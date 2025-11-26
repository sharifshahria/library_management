
"use client"

import React, { useEffect, useMemo, useState } from 'react';

interface Loan {
  _id: string;
  userEmail: string;
  bookId: { _id: string; title: string; author: string };
  borrowedAt: string;
  dueDate?: string;
  returned: boolean;
  returnedAt?: string;
}

interface Book {
  _id: string;
  title: string;
  author: string;
}

const emptyBook = { title: '', author: '' };

export default function Dashboard() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [newBook, setNewBook] = useState(emptyBook);
  const [editValues, setEditValues] = useState(emptyBook);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLoans = async () => {
    setLoadingLoans(true);
    try {
      const res = await fetch('/api/borrowedbooks?status=all');
      const data = await res.json();
      setLoans(data);
    } finally {
      setLoadingLoans(false);
    }
  };

  const fetchBooks = async (query: string = '') => {
    setLoadingBooks(true);
    try {
      const param = query ? `?q=${encodeURIComponent(query)}` : '';
      const res = await fetch(`/api/books${param}`);
      const data = await res.json();
      setBooks(data);
    } finally {
      setLoadingBooks(false);
    }
  };

  useEffect(() => {
    fetchLoans();
    fetchBooks();
  }, []);

  const handleReturn = async (id: string) => {
    setActionLoading(true);
    setMessage('');
    const res = await fetch('/api/borrowedbooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ borrowId: id }),
    });
    const data = await res.json();
    setMessage(data.message || 'Loan updated.');
    await fetchLoans();
    setActionLoading(false);
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title.trim() || !newBook.author.trim()) {
      setMessage('Book title and author are required.');
      return;
    }
    setActionLoading(true);
    setMessage('');
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBook),
    });
    const data = await res.json();
    setMessage(data.message || 'Book added.');
    setNewBook(emptyBook);
    await fetchBooks(searchQuery);
    setActionLoading(false);
  };

  const startEditing = (book: Book) => {
    setEditingId(book._id);
    setEditValues({ title: book.title, author: book.author });
  };

  const handleUpdateBook = async () => {
    if (!editingId) return;
    setActionLoading(true);
    setMessage('');
    const res = await fetch(`/api/books/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editValues),
    });
    const data = await res.json();
    setMessage(data.message || 'Book updated.');
    setEditingId(null);
    setEditValues(emptyBook);
    await fetchBooks(searchQuery);
    setActionLoading(false);
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Delete this book?')) return;
    setActionLoading(true);
    setMessage('');
    const res = await fetch(`/api/books/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    setMessage(data.message || 'Book deleted.');
    await fetchBooks(searchQuery);
    setActionLoading(false);
  };

  const dashboardStats = useMemo(() => {
    const totalBooks = books.length;
    const totalLoans = loans.length;
    const activeLoans = loans.filter(r => !r.returned).length;
    const completedReturns = loans.filter(r => r.returned).length;
    const overdue = loans.filter(r => {
      if (r.returned || !r.dueDate) return false;
      return new Date(r.dueDate).getTime() < Date.now();
    }).length;
    return [
      { label: 'Total Books', value: totalBooks },
      { label: 'Active Loans', value: activeLoans },
      { label: 'Completed Returns', value: completedReturns },
      { label: 'All Loans', value: totalLoans },
      { label: 'Overdue Items', value: overdue },
    ];
  }, [books, loans]);

  const dateFormatter = (value?: string) =>
    value ? new Date(value).toLocaleString() : '—';

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">Admin Console</p>
          <h1 className="text-3xl font-bold text-slate-900">Library Management Dashboard</h1>
          <p className="text-slate-600">Monitor circulation and curate your catalog in one place.</p>
        </div>
        <button
          onClick={fetchLoans}
          className="self-start rounded-md border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
          disabled={loadingLoans}
        >
          {loadingLoans ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </header>

      {message && (
        <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {message}
        </div>
      )}

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {dashboardStats.map(stat => (
          <div key={stat.label} className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Add new book</h2>
          <p className="mb-5 text-sm text-slate-600">Keep the catalog up to date with new arrivals.</p>
          <form className="space-y-4" onSubmit={handleAddBook}>
            <div>
              <label className="text-sm font-medium text-slate-700">Title</label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                value={newBook.title}
                onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                placeholder="Book title"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Author</label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                value={newBook.author}
                onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                placeholder="Author name"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving...' : 'Add book'}
            </button>
          </form>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Manage catalog</h2>
              <p className="text-sm text-slate-600">Edit book metadata or remove stale entries.</p>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-72">
              <input
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="Search title or author"
                value={searchQuery}
                onChange={e => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  fetchBooks(value);
                }}
              />
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => fetchBooks(searchQuery)}
                disabled={loadingBooks}
              >
                {loadingBooks ? '...' : 'Go'}
              </button>
            </div>
          </div>

          <div className="max-h-[380px] space-y-3 overflow-auto pr-1">
            {loadingBooks && <p className="text-sm text-slate-500">Loading books...</p>}
            {!loadingBooks && books.length === 0 && (
              <p className="text-sm text-slate-500">No books found.</p>
            )}
            {books.map(book => (
              <div
                key={book._id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-base font-semibold text-slate-900">{book.title}</p>
                  <p className="text-sm text-slate-600">by {book.author}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-md border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => startEditing(book)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-md border border-red-200 px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteBook(book._id)}
                    disabled={actionLoading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingId && (
            <div className="mt-5 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
              <p className="mb-3 text-sm font-semibold text-indigo-700">Update book</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  value={editValues.title}
                  onChange={e => setEditValues({ ...editValues, title: e.target.value })}
                  placeholder="Title"
                />
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  value={editValues.author}
                  onChange={e => setEditValues({ ...editValues, author: e.target.value })}
                  placeholder="Author"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                  onClick={handleUpdateBook}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Updating...' : 'Save changes'}
                </button>
                <button
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                  onClick={() => {
                    setEditingId(null);
                    setEditValues(emptyBook);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Loan history</h2>
            <p className="text-sm text-slate-600">
              Track every checkout, highlight overdue items, and close the loop on returns.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Book</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Borrower</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Borrowed at</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Due date</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loadingLoans && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-slate-500">
                    Loading loans...
                  </td>
                </tr>
              )}
              {!loadingLoans && loans.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-slate-500">
                    No loan records yet.
                  </td>
                </tr>
              )}
              {loans.map(loan => (
                <tr key={loan._id}>
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {loan.bookId?.title}
                    <p className="text-xs text-slate-500">{loan.bookId?.author}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{loan.userEmail}</td>
                  <td className="px-4 py-4 text-slate-600">{dateFormatter(loan.borrowedAt)}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {loan.dueDate ? dateFormatter(loan.dueDate) : '—'}
                    {!loan.returned &&
                      loan.dueDate &&
                      new Date(loan.dueDate).getTime() < Date.now() && (
                        <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                          Overdue
                        </span>
                      )}
                  </td>
                  <td className="px-4 py-4">
                    {loan.returned ? (
                      <>
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                          Returned
                        </span>
                        {loan.returnedAt && (
                          <p className="mt-1 text-xs text-slate-500">
                            {dateFormatter(loan.returnedAt)}
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                        Borrowed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {!loan.returned && (
                      <button
                        className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-emerald-500 disabled:opacity-60"
                        onClick={() => handleReturn(loan._id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Updating...' : 'Mark returned'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
