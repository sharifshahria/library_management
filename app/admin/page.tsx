"use client"

import React, { useEffect, useState } from 'react';

interface Book {
  _id: string;
  title: string;
  author: string;
  available: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function AdminPanel() {
  // Book inventory state
  const [books, setBooks] = useState<Book[]>([]);
  const [newBook, setNewBook] = useState({ title: '', author: '' });
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [bookMessage, setBookMessage] = useState('');

  // User management state
  const [users, setUsers] = useState<User[]>([]);
  const [userMessage, setUserMessage] = useState('');

  // Fetch books
  const fetchBooks = async () => {
    const res = await fetch('/api/books');
    const data = await res.json();
    setBooks(data);
  };

  // Fetch users
  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchBooks();
    fetchUsers();
  }, []);

  // Add book
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBook),
    });
    const data = await res.json();
    setBookMessage(data.message);
    setNewBook({ title: '', author: '' });
    fetchBooks();
  };

  // Edit book
  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBook) return;
    const res = await fetch(`/api/books/${editBook._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editBook),
    });
    const data = await res.json();
    setBookMessage(data.message);
    setEditBook(null);
    fetchBooks();
  };

  // Delete book
  const handleDeleteBook = async (id: string) => {
    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
    const data = await res.json();
    setBookMessage(data.message);
    fetchBooks();
  };

  // Delete user
  const handleDeleteUser = async (id: string) => {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    setUserMessage(data.message);
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Book Inventory */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Book Inventory</h2>
          <form onSubmit={handleAddBook} className="mb-4 flex gap-2">
            <input type="text" placeholder="Title" className="px-2 py-1 border rounded" value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} required />
            <input type="text" placeholder="Author" className="px-2 py-1 border rounded" value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} required />
            <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded font-semibold hover:bg-blue-700 transition">Add</button>
          </form>
          {bookMessage && <p className="mb-2 text-blue-600 text-sm">{bookMessage}</p>}
          <ul>
            {books.map(book => (
              <li key={book._id} className="border rounded p-2 mb-2 flex justify-between items-center">
                <span>
                  <span className="font-semibold">{book.title}</span> by {book.author} {book.available ? '' : <span className="text-xs text-red-500">(Borrowed)</span>}
                </span>
                <div className="flex gap-2">
                  <button className="bg-yellow-500 text-white px-2 py-1 rounded font-semibold hover:bg-yellow-600 transition" onClick={() => setEditBook(book)}>Edit</button>
                  <button className="bg-red-600 text-white px-2 py-1 rounded font-semibold hover:bg-red-700 transition" onClick={() => handleDeleteBook(book._id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
          {editBook && (
            <form onSubmit={handleEditBook} className="mt-4 flex gap-2">
              <input type="text" placeholder="Title" className="px-2 py-1 border rounded" value={editBook.title} onChange={e => setEditBook({ ...editBook, title: e.target.value })} required />
              <input type="text" placeholder="Author" className="px-2 py-1 border rounded" value={editBook.author} onChange={e => setEditBook({ ...editBook, author: e.target.value })} required />
              <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded font-semibold hover:bg-green-700 transition">Save</button>
              <button type="button" className="bg-gray-300 text-gray-800 px-4 py-1 rounded font-semibold hover:bg-gray-400 transition" onClick={() => setEditBook(null)}>Cancel</button>
            </form>
          )}
        </div>
        {/* User Management */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">User Management</h2>
          {userMessage && <p className="mb-2 text-blue-600 text-sm">{userMessage}</p>}
          <ul>
            {users.map(user => (
              <li key={user._id} className="border rounded p-2 mb-2 flex justify-between items-center">
                <span>
                  <span className="font-semibold">{user.name}</span> ({user.email})
                </span>
                <button className="bg-red-600 text-white px-2 py-1 rounded font-semibold hover:bg-red-700 transition" onClick={() => handleDeleteUser(user._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
