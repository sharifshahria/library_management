"use client"

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
interface Borrow {
  _id: string;
  bookId: { _id: string; title: string; author: string };
  borrowedAt: string;
  dueDate?: string;
  returned: boolean;
}

export default function ReturnPage() {
  const router = useRouter();
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUserEmail(parsed.email || '');
        } catch {
          setUserEmail('');
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const fetchBorrows = async (email: string) => {
    if (!email) return;
    setLoadingList(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch(`/api/borrowedbooks?userEmail=${encodeURIComponent(email)}`);
      const data = await res.json();
      setBorrows(data);
    } catch {
      setError('Failed to load borrowed books.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchBorrows(userEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  const handleReturn = async (id: string) => {
    setProcessingId(id);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/borrowedbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ borrowId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Book returned successfully.');
        if (userEmail) {
          fetchBorrows(userEmail);
        }
      } else {
        setError(data.message || 'Unable to process return.');
      }
    } catch {
      setError('Unable to process return.');
    } finally {
      setProcessingId(null);
    }
  };

  const stats = useMemo(() => {
    const active = borrows.length;
    const overdue = borrows.filter(b => b.dueDate && new Date(b.dueDate).getTime() < Date.now()).length;
    const nextDue = borrows
      .filter(b => b.dueDate)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0]?.dueDate;
    return {
      active,
      overdue,
      nextDue: nextDue ? new Date(nextDue).toLocaleDateString() : '—',
    };
  }, [borrows]);

  const dueCountdown = (dueDate?: string) => {
    if (!dueDate) return null;
    const diff = new Date(dueDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
    if (days === 0) return 'Due today';
    return `Due in ${days} day${days === 1 ? '' : 's'}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex justify-end">
          <button
            className="text-sm font-semibold text-rose-600 hover:text-rose-500"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        <header className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-wide text-slate-500">Returns</p>
          <h1 className="text-3xl font-bold text-slate-900">Manage borrowed books</h1>
          <p className="text-slate-600">
            Review your checked-out titles, monitor due dates, and return items in one click.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Active loans</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.active}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Overdue</p>
            <p className="mt-2 text-2xl font-semibold text-rose-600">{stats.overdue}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Next due date</p>
            <p className="mt-2 text-2xl font-semibold text-amber-600">{stats.nextDue}</p>
          </div>
        </section>

        {(message || error) && (
          <p className={`text-center text-sm ${error ? 'text-rose-600' : 'text-emerald-600'}`}>
            {error || message}
          </p>
        )}

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Your borrowed books</h2>
              <p className="text-sm text-slate-600">
                {loadingList ? 'Loading loans…' : `${borrows.length} item(s) checked out`}
              </p>
            </div>
            <button
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-60"
              onClick={() => userEmail && fetchBorrows(userEmail)}
              disabled={loadingList}
            >
              {loadingList ? 'Refreshing…' : 'Refresh list'}
            </button>
          </div>

          {!loadingList && borrows.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No borrowed books to return right now.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {borrows.map(borrow => {
              const isOverdue =
                borrow.dueDate && new Date(borrow.dueDate).getTime() < Date.now();
              return (
                <article
                  key={borrow._id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    #{borrow.bookId._id.slice(-4)}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{borrow.bookId.title}</h3>
                  <p className="text-sm text-slate-600">by {borrow.bookId.author}</p>
                  <dl className="mt-4 space-y-1 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <dt>Borrowed</dt>
                      <dd>{new Date(borrow.borrowedAt).toLocaleDateString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Due date</dt>
                      <dd className={isOverdue ? 'font-semibold text-rose-600' : ''}>
                        {borrow.dueDate
                          ? new Date(borrow.dueDate).toLocaleDateString()
                          : '—'}
                      </dd>
                    </div>
                    {borrow.dueDate && (
                      <div className="flex justify-between">
                        <dt>Status</dt>
                        <dd className={isOverdue ? 'text-rose-600' : 'text-emerald-600'}>
                          {dueCountdown(borrow.dueDate)}
                        </dd>
                      </div>
                    )}
                  </dl>
                  <button
                    className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                    onClick={() => handleReturn(borrow._id)}
                    disabled={processingId === borrow._id}
                  >
                    {processingId === borrow._id ? 'Processing…' : 'Return book'}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
