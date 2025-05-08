import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';

interface Order {
  id: number;
  address: string;
  item: string;
  created_by: number;
  created_at: string;
}

const fetchOrders = async () => {
  const { data } = await api.get<Order[]>('/api/orders');
  return data;
};

const createOrder = async (payload: { address: string; item: string }) => {
  const { data } = await api.post<Order>('/api/orders', payload);
  return data;
};

const OrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useQuery(['orders'], fetchOrders);
  const mutation = useMutation(createOrder, {
    onSuccess: () => {
      toast.success('Order created');
      queryClient.invalidateQueries(['orders']);
    },
    onError: () => toast.error('Failed to create order'),
  });

  const [address, setAddress] = useState('');
  const [item, setItem] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ address, item });
    setAddress('');
    setItem('');
  };

  return (
    <div className="max-w-xl mx-auto mt-8 space-y-6">
      <h2 className="text-xl font-semibold">Your Orders</h2>
      {isLoading ? (
        <Spinner />
      ) : (
        <table className="min-w-full text-sm border divide-y divide-gray-200">
          <thead>
            <tr className="text-left bg-gray-50">
              <th className="py-2 px-3">Item</th>
              <th className="py-2 px-3">Address</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, idx) => (
              <tr key={o.id} className={idx % 2 ? 'bg-gray-50' : ''}>
                <td className="py-2 px-3">{o.item}</td>
                <td className="py-2 px-3">{o.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 className="font-medium">Create Order</h3>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input className="flex-1 px-2 py-1 border rounded" value={item} onChange={(e) => setItem(e.target.value)} placeholder="Item" required />
        <input className="flex-1 px-2 py-1 border rounded" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" required />
        <button disabled={mutation.isLoading} className="bg-green-600 text-white px-4 rounded disabled:opacity-50" type="submit">{mutation.isLoading ? 'Adding...' : 'Add'}</button>
      </form>
    </div>
  );
};

export default OrdersPage; 