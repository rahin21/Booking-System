'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Users, Calendar, DollarSign, MapPin, Settings, Loader2 } from 'lucide-react';
import { 
  getServices, 
  getReservations, 
  getCustomers, 
  getDashboardStats,
  createService,
  createCustomer,
  type Service,
  type Reservation,
  type Customer
} from '@/lib/database';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddService, setShowAddService] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newService, setNewService] = useState({ s_name: '', s_type: '', location: '', price: '' });
  const [addingService, setAddingService] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ c_name: '', c_email: '', c_phone: '', c_address: '' });
  const [addingCustomer, setAddingCustomer] = useState(false);
  
  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalServices: 0,
    totalReservations: 0,
    totalCustomers: 0
  });
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [servicesData, reservationsData, customersData, statsData] = await Promise.all([
        getServices(),
        getReservations(),
        getCustomers(),
        getDashboardStats()
      ]);
      
      setServices(servicesData);
      setReservations(reservationsData);
      setCustomers(customersData);
      setDashboardStats(statsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    try {
      setAddingService(true);
      if (!newService.s_name || !newService.s_type || !newService.location || !newService.price) {
        alert('Please fill in all required fields');
        return;
      }
      const payload = {
        s_name: newService.s_name,
        s_type: newService.s_type,
        location: newService.location,
        price: Number(newService.price),
        status: 'available',
      } as Omit<Service, 's_id' | 'created_at' | 'updated_at'>;
      const created = await createService(payload);
      setServices((prev) => [created, ...prev]);
      setShowAddService(false);
      setNewService({ s_name: '', s_type: '', location: '', price: '' });
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to add service');
    } finally {
      setAddingService(false);
    }
  };

  const handleAddCustomer = async () => {
    try {
      setAddingCustomer(true);
      if (!newCustomer.c_name || !newCustomer.c_email) {
        alert('Name and email are required');
        return;
      }
      const created = await createCustomer({
        c_name: newCustomer.c_name,
        c_email: newCustomer.c_email,
        c_phone: newCustomer.c_phone || undefined,
        c_address: newCustomer.c_address || undefined,
      });
      if (created) {
        setCustomers((prev) => [created, ...prev]);
        setShowAddCustomer(false);
        setNewCustomer({ c_name: '', c_email: '', c_phone: '', c_address: '' });
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to add customer');
    } finally {
      setAddingCustomer(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Settings },
    { id: 'services', label: 'Services', icon: MapPin },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'payments', label: 'Payments', icon: DollarSign }
  ];

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchAllData}>Try Again</Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalServices}</div>
              <p className="text-xs text-muted-foreground">Active services</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalReservations}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ৳{reservations.reduce((total, res) => total + (res.price || 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total revenue</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reservations.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No reservations found</p>
                ) : (
                  reservations.slice(0, 5).map((reservation) => (
                    <div key={reservation.reservation_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{reservation.customer?.c_name || 'Unknown Customer'}</p>
                        <p className="text-sm text-gray-600">{reservation.service?.s_name || 'Unknown Service'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${reservation.price}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          reservation.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reservation.payment_status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => setShowAddService(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Service
              </Button>
              <Button className="w-full" variant="outline" onClick={() => setShowAddCustomer(true)}>
                <Users className="h-4 w-4 mr-2" />
                Add New Customer
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                View All Reservations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderServices = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading services...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Manage Services</h2>
          <Button onClick={() => setShowAddService(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>

        {services.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">No services found</p>
              <Button onClick={() => setShowAddService(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.s_id}>
                <CardHeader>
                  <CardTitle className="text-lg">{service.s_name}</CardTitle>
                  <CardDescription className="capitalize">{service.s_type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{service.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600"><b className='text-xl'>৳</b>{service.price}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      service.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Check-in: {new Date(service.check_in).toLocaleDateString()}</p>
                    <p>Check-out: {new Date(service.check_out).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderReservations = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading reservations...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Reservations</h2>
        
        {reservations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">No reservations found</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reservations.map((reservation) => (
                      <tr key={reservation.reservation_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.customer?.c_name || 'Unknown Customer'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reservation.customer?.c_email || ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {reservation.service?.s_name || 'Unknown Service'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.service?.s_type || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(reservation.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ৳{reservation.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            reservation.payment_status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {reservation.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button size="sm" variant="outline" className="mr-2">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderCustomers = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading customers...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Customers</h2>
          <Button onClick={() => setShowAddCustomer(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {customers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">No customers found</p>
              <Button onClick={() => setShowAddCustomer(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Customer
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <Card key={customer.c_id}>
                <CardHeader>
                  <CardTitle className="text-lg">{customer.c_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Email:</span>
                      <span className="truncate">{customer.c_email}</span>
                    </div>
                    {customer.c_phone && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Phone:</span>
                        <span>{customer.c_phone}</span>
                      </div>
                    )}
                    {customer.c_address && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Address:</span>
                        <span className="truncate">{customer.c_address}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                       <Trash2 className="h-4 w-4 mr-1" />
                       Delete
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         )}
       </div>
     );
   };

  const renderPayments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Payment Management</h2>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Payment management features coming soon</p>
            <p className="text-sm">Track payments, generate invoices, and manage financial reports</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'services':
        return renderServices();
      case 'reservations':
        return renderReservations();
      case 'customers':
        return renderCustomers();
      case 'payments':
        return renderPayments();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Service</CardTitle>
              <CardDescription>Create a new service offering</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name</Label>
                <Input id="serviceName" placeholder="Enter service name" value={newService.s_name} onChange={(e) => setNewService((s) => ({ ...s, s_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select value={newService.s_type} onValueChange={(v) => setNewService((s) => ({ ...s, s_type: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resort">Resort</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="cabin">Cabin</SelectItem>
                    <SelectItem value="conference">Conference Hall</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Enter location" value={newService.location} onChange={(e) => setNewService((s) => ({ ...s, location: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" placeholder="Enter price" value={newService.price} onChange={(e) => setNewService((s) => ({ ...s, price: e.target.value }))} />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddService(false)} className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddService} disabled={addingService}>
                  {addingService ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : 'Add Service'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Customer</CardTitle>
              <CardDescription>Register a new customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input id="customerName" placeholder="Enter customer name" value={newCustomer.c_name} onChange={(e) => setNewCustomer((s) => ({ ...s, c_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input id="customerEmail" type="email" placeholder="Enter email" value={newCustomer.c_email} onChange={(e) => setNewCustomer((s) => ({ ...s, c_email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input id="customerPhone" placeholder="Enter phone number" value={newCustomer.c_phone} onChange={(e) => setNewCustomer((s) => ({ ...s, c_phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerAddress">Address</Label>
                <Input id="customerAddress" placeholder="Enter address" value={newCustomer.c_address} onChange={(e) => setNewCustomer((s) => ({ ...s, c_address: e.target.value }))} />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddCustomer(false)} className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddCustomer} disabled={addingCustomer}>
                  {addingCustomer ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : 'Add Customer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}