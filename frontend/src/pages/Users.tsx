import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  user_type: string;
}

const fetchUsers = async () => {
  const { data } = await api.get<User[]>('/api/users');
  return data;
};

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery(['users'], fetchUsers);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', email: '', user_type: 'default' });

  const createMutation = useMutation(
    () => api.post('/api/users', form),
    {
      onSuccess: () => {
        toast.success('User created');
        setShowForm(false);
        setForm({ username: '', password: '', email: '', user_type: 'default' });
        queryClient.invalidateQueries(['users']);
      },
      onError: (e: any) => toast.error(e.response?.data?.detail ?? 'Failed'),
    }
  );

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">All Users</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded">
          {showForm ? 'Cancel' : 'New User'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="mb-6 grid grid-cols-4 gap-2 text-sm"
        >
          <input className="col-span-1 px-2 py-1 border rounded" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <input className="col-span-1 px-2 py-1 border rounded" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <input className="col-span-1 px-2 py-1 border rounded" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <select className="col-span-1 px-2 py-1 border rounded" value={form.user_type} onChange={(e) => setForm({ ...form, user_type: e.target.value })}>
            <option value="default">default</option>
            <option value="admin">admin</option>
          </select>
          <button disabled={createMutation.isLoading} className="col-span-4 mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded disabled:opacity-50" type="submit">
            {createMutation.isLoading ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
      <table className="min-w-full text-sm border divide-y divide-gray-200">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={u.id} className={`hover:bg-gray-100 ${idx % 2 ? 'bg-gray-50' : ''}`}>
              <td className="py-2 px-3">{u.id}</td>
              <td className="py-2 px-3">{u.username}</td>
              <td className="py-2 px-3">{u.email}</td>
              <td className="py-2 px-3">{u.user_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
};

export default UsersPage; 