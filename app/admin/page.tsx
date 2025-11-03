'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Users, Calendar, DollarSign, MapPin, Settings, Loader2 } from 'lucide-react';
import BookingForm, { BookingFormData } from '@/components/BookingForm';
import { toast } from 'sonner';
import LazyImage from '@/components/LazyImage';
import AnimateIn from '@/components/AnimateIn';
  import { 
    getServices, 
    getServicesByAdmin,
    getReservations, 
    getCustomers, 
    getDashboardStats,
    createService,
    createCustomer,
    createReservation,
    createPayment,
    updateService,
    updateCustomer,
    updateReservation,
    deleteService,
    deleteCustomer,
    deleteReservation,
    getCurrentAdmin,
    type Service,
    type Reservation,
    type Customer,
    type Admin
  } from '@/lib/database';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddService, setShowAddService] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showEditService, setShowEditService] = useState(false);
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [showEditReservation, setShowEditReservation] = useState(false);
  const [newService, setNewService] = useState({ s_name: '', s_type: '', location: '', price: '', images: [] as string[] });
  const [addingService, setAddingService] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ c_name: '', c_email: '', c_phone: '', c_address: '' });
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [updatingService, setUpdatingService] = useState(false);
  const [updatingCustomer, setUpdatingCustomer] = useState(false);
  const [updatingReservation, setUpdatingReservation] = useState(false);
  const [deletingService, setDeletingService] = useState<number | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<number | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingReservation, setDeletingReservation] = useState<number | null>(null);
  const [showDeleteServiceConfirm, setShowDeleteServiceConfirm] = useState<Service | null>(null);
  const [showDeleteCustomerConfirm, setShowDeleteCustomerConfirm] = useState<Customer | null>(null);
  const [showDeleteReservationConfirm, setShowDeleteReservationConfirm] = useState<Reservation | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(0);
  
  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
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

  // Ensure selected service is valid after services load/update
  useEffect(() => {
    if (services.length > 0) {
      setSelectedServiceId(prev => {
        const exists = services.some(s => s.s_id === prev);
        return prev && exists ? prev : services[0].s_id;
      });
    } else {
      setSelectedServiceId(0);
    }
  }, [services]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch current admin first, then filter services by ownership
      const adminData = await getCurrentAdmin();
      setCurrentAdmin(adminData);

      if (adminData) {
        const [servicesData, reservationsData, customersData, statsData] = await Promise.all([
          getServicesByAdmin(adminData.a_id),
          getReservations(),
          getCustomers(),
          getDashboardStats(),
        ]);

        setServices(servicesData);
        setReservations(reservationsData);
        setCustomers(customersData);
        setDashboardStats(statsData);
      } else {
        // No admin session: hide services list and load other data minimally
        setServices([]);
        const [reservationsData, customersData, statsData] = await Promise.all([
          getReservations(),
          getCustomers(),
          getDashboardStats(),
        ]);
        setReservations(reservationsData);
        setCustomers(customersData);
        setDashboardStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    try {
      // Prevent submitting while image uploads are in progress
      if (uploadingImages) {
        toast.warning('Please wait until images finish uploading');
        return;
      }
      setAddingService(true);
      if (!newService.s_name || !newService.s_type || !newService.location || !newService.price) {
        toast.warning('Please fill in all required fields');
        return;
      }
      
      if (!currentAdmin) {
        toast.error('Admin authentication required to create services');
        return;
      }
      
      const payload = {
        s_name: newService.s_name,
        s_type: newService.s_type,
        location: newService.location,
        price: Number(newService.price),
        status: 'available',
        images: newService.images,
        admin_id: currentAdmin.a_id,
      } as Omit<Service, 's_id' | 'created_at' | 'updated_at'>;
      const created = await createService(payload);
      setServices((prev) => [created, ...prev]);
      setShowAddService(false);
      setNewService({ s_name: '', s_type: '', location: '', price: '', images: [] });
      toast.success('Service added successfully');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to add service');
    } finally {
      setAddingService(false);
    }
  };

  const handleAddCustomer = async () => {
    try {
      setAddingCustomer(true);
      if (!newCustomer.c_name || !newCustomer.c_email) {
      toast.warning('Name and email are required');
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
      toast.error(e.message || 'Failed to add customer');
    } finally {
      setAddingCustomer(false);
    }
  };

  const handleEditService = (service: Service) => {
    if (!currentAdmin) {
      toast.error('Admin authentication required');
      return;
    }
    
    if (service.admin_id !== currentAdmin.a_id) {
      toast.error('You can only edit services you created');
      return;
    }
    
    setEditingService(service);
    setShowEditService(true);
  };

  const handleUpdateService = async () => {
    if (!editingService) return;
    
    try {
      // Prevent updating while image uploads are in progress
      if (uploadingImages) {
        toast.warning('Please wait until images finish uploading');
        return;
      }
      setUpdatingService(true);
      const updated = await updateService(editingService.s_id, {
        s_name: editingService.s_name,
        s_type: editingService.s_type,
        location: editingService.location,
        price: editingService.price,
        images: editingService.images,
      });
      
      setServices((prev) => prev.map(s => s.s_id === updated.s_id ? updated : s));
      setShowEditService(false);
      setEditingService(null);
      toast.success('Service updated successfully');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to update service');
    } finally {
      setUpdatingService(false);
    }
  };

  const handleDeleteService = (service: Service) => {
    if (!currentAdmin) {
      toast.error('Admin authentication required');
      return;
    }
    
    if (service.admin_id !== currentAdmin.a_id) {
      toast.error('You can only delete services you created');
      return;
    }
    
    setShowDeleteServiceConfirm(service);
  };

  const confirmDeleteService = async () => {
    if (!showDeleteServiceConfirm) return;
    
    try {
      setDeletingService(showDeleteServiceConfirm.s_id);
      await deleteService(showDeleteServiceConfirm.s_id);
      setServices((prev) => prev.filter(s => s.s_id !== showDeleteServiceConfirm.s_id));
      setShowDeleteServiceConfirm(null);
      toast.success('Service deleted');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to delete service');
    } finally {
      setDeletingService(null);
    }
  };

  const handleUploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setUploadingImages(true);
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Image upload failed');
        }
        const data = await res.json();
        if (data?.url) {
          uploadedUrls.push(data.url);
        }
      }
      if (uploadedUrls.length) {
        setNewService((s) => ({ ...s, images: [...(s.images || []), ...uploadedUrls] }));
        toast.success(`Uploaded ${uploadedUrls.length} image(s)`);
      }
    } catch (e: any) {
      console.error('Upload error:', e);
      toast.error(e?.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImageAtIndex = async (index: number) => {
    const url = newService.images?.[index];
    try {
      if (url) {
        const res = await fetch('/api/delete-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to delete image from Cloudinary');
        }
      }
      setNewService((s) => ({
        ...s,
        images: (s.images || []).filter((_, i) => i !== index),
      }));
      toast.success('Image removed');
    } catch (e: any) {
      console.error('Delete image error:', e);
      toast.error(e?.message || 'Failed to remove image');
    }
  };

  // Edit modal image handlers
  const handleUploadImagesEdit = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setUploadingImages(true);
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Image upload failed');
        }
        const data = await res.json();
        if (data?.url) {
          uploadedUrls.push(data.url);
        }
      }
      if (uploadedUrls.length) {
        setEditingService((s) => s ? ({ ...s, images: [ ...(s.images || []), ...uploadedUrls ] }) : s);
        toast.success(`Uploaded ${uploadedUrls.length} image(s)`);
      }
    } catch (e: any) {
      console.error('Upload error:', e);
      toast.error(e?.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeEditImageAtIndex = async (index: number) => {
    const url = editingService?.images?.[index];
    try {
      if (url) {
        const res = await fetch('/api/delete-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to delete image from Cloudinary');
        }
      }
      setEditingService((s) => s ? ({
        ...s,
        images: (s.images || []).filter((_, i) => i !== index),
      }) : s);
      toast.success('Image removed');
    } catch (e: any) {
      console.error('Delete image error:', e);
      toast.error(e?.message || 'Failed to remove image');
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowEditCustomer(true);
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;
    
    try {
      setUpdatingCustomer(true);
      const updated = await updateCustomer(editingCustomer.c_id, {
        c_name: editingCustomer.c_name,
        c_email: editingCustomer.c_email,
        c_phone: editingCustomer.c_phone,
        c_address: editingCustomer.c_address,
      });
      
      setCustomers((prev) => prev.map(c => c.c_id === updated.c_id ? updated : c));
      setShowEditCustomer(false);
      setEditingCustomer(null);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to update customer');
    } finally {
      setUpdatingCustomer(false);
    }
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setShowDeleteCustomerConfirm(customer);
  };

  const confirmDeleteCustomer = async () => {
    if (!showDeleteCustomerConfirm) return;
    
    try {
      setDeletingCustomer(showDeleteCustomerConfirm.c_id);
      await deleteCustomer(showDeleteCustomerConfirm.c_id);
      setCustomers((prev) => prev.filter(c => c.c_id !== showDeleteCustomerConfirm.c_id));
      setShowDeleteCustomerConfirm(null);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to delete customer');
    } finally {
      setDeletingCustomer(null);
    }
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setShowEditReservation(true);
  };

  const handleUpdateReservation = async () => {
    if (!editingReservation) return;
    
    try {
      setUpdatingReservation(true);
      const updated = await updateReservation(editingReservation.reservation_id, {
        payment_status: editingReservation.payment_status,
        check_in_date: editingReservation.check_in_date,
        check_out_date: editingReservation.check_out_date,
        price: editingReservation.price,
      });
      
      setReservations((prev) => prev.map(r => r.reservation_id === updated.reservation_id ? updated : r));
      setShowEditReservation(false);
      setEditingReservation(null);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to update reservation');
    } finally {
      setUpdatingReservation(false);
    }
  };

  const handleDeleteReservation = (reservation: Reservation) => {
    setShowDeleteReservationConfirm(reservation);
  };

  const confirmDeleteReservation = async () => {
    if (!showDeleteReservationConfirm) return;
    
    try {
      setDeletingReservation(showDeleteReservationConfirm.reservation_id);
      await deleteReservation(showDeleteReservationConfirm.reservation_id);
      setReservations((prev) => prev.filter(r => r.reservation_id !== showDeleteReservationConfirm.reservation_id));
      setShowDeleteReservationConfirm(null);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to delete reservation');
    } finally {
      setDeletingReservation(null);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Settings },
    { id: 'services', label: 'Services', icon: MapPin },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'booking', label: 'New Booking', icon: Plus },
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
                          reservation.payment_status?.toLowerCase() === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : reservation.payment_status?.toLowerCase() === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
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
            {services.map((service, idx) => (
              <AnimateIn key={service.s_id} delay={idx * 0.05}>
              <Card>
                {service.images && service.images.length > 0 && (
                  <div className="w-full h-40 overflow-hidden rounded-t">
                    <LazyImage src={service.images[0]} alt={service.s_name} className="w-full h-full object-cover" />
                  </div>
                )}
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
                    <span className="text-2xl font-bold text-green-600"><b className='text-xl'>৳</b>{service.price.toLocaleString('en-IN')}</span>
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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDeleteService(service)}
                      disabled={deletingService === service.s_id}
                    >
                      {deletingService === service.s_id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </AnimateIn>
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
                          {new Date(reservation.check_in_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ৳{reservation.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            reservation.payment_status?.toLowerCase() === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : reservation.payment_status?.toLowerCase() === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {reservation.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mr-2"
                            onClick={() => handleEditReservation(reservation)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteReservation(reservation)}
                             disabled={deletingReservation === reservation.reservation_id}
                          >
                            {deletingReservation === reservation.reservation_id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-1" />
                            )}
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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEditCustomer(customer)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDeleteCustomer(customer)}
                       disabled={deletingCustomer === customer.c_id}
                    >
                      {deletingCustomer === customer.c_id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
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

  const renderBooking = () => {
    const selectedService = services.find(s => s.s_id === selectedServiceId) || null;

    const handleBookingSubmit = async (bookingData: BookingFormData) => {
      try {
        if (!selectedService) {
          throw new Error('Please select a service to book');
        }

        // Validate booking data
        if (!bookingData.customerName || !bookingData.customerEmail) {
          throw new Error('Customer name and email are required');
        }
        if (!bookingData.checkInDate || !bookingData.checkOutDate) {
          throw new Error('Check-in and check-out dates are required');
        }

        // Create or get customer
        const customer = await createCustomer({
          c_name: bookingData.customerName,
          c_email: bookingData.customerEmail,
          c_phone: bookingData.customerPhone,
          c_address: bookingData.customerAddress || ''
        });

        // Calculate total price from selected service and number of days
        const checkIn = new Date(bookingData.checkInDate);
        const checkOut = new Date(bookingData.checkOutDate);
        const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = (selectedService.price || 0) * days;

        // Create reservation
        const reservation = await createReservation({
          c_id: customer.c_id,
          s_id: selectedService.s_id,
          check_in_date: bookingData.checkInDate,
          check_out_date: bookingData.checkOutDate,
          price: totalPrice,
          payment_status: 'pending',
          service_type: selectedService.s_type,
          guest_count: bookingData.guestCount,
          special_requests: bookingData.specialRequests
        });

        // Create dummy payment record
        try {
          await createPayment({
            payment_method: bookingData.paymentMethod,
            amount: totalPrice,
            reservation_id: reservation.reservation_id,
          });
        } catch (payErr) {
          console.warn('Payment record creation failed in admin (dummy).', payErr);
        }

        toast.success(`Booking created successfully (ID: ${reservation.reservation_id}). Payment: ${bookingData.paymentMethod.replace('_', ' ')}`);
        await fetchAllData();
      } catch (error: any) {
        console.error('Error creating booking:', error);
        const message = error?.message || 'Failed to create booking. Please try again.';
        toast.error(message);
      }
    };

    const handleBookingClose = () => {
      // In admin panel context, we don't need to close anything
      // This could be used to reset form or navigate away
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>New Booking</CardTitle>
          <CardDescription>Create a new reservation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="admin-booking-service">Select Service</Label>
            <select
              id="admin-booking-service"
              className="mt-2 w-full border rounded px-3 py-2"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(Number(e.target.value))}
            >
              {services.map((svc) => (
                <option key={svc.s_id} value={svc.s_id}>
                  {svc.s_name} — {svc.location} — ৳{svc.price}
                </option>
              ))}
            </select>
          </div>
          <BookingForm 
            resortId={selectedService?.s_id ?? 0}
            resortName={selectedService?.s_name ?? 'Admin Booking'}
            resortPrice={selectedService?.price ?? 0}
            onClose={handleBookingClose}
            onSubmit={handleBookingSubmit}
          />
        </CardContent>
      </Card>
    );
  };

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
      case 'booking':
        return renderBooking();
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
              <div className="space-y-2">
                <Label htmlFor="images">Images</Label>
                <Input id="images" type="file" accept="image/*" multiple onChange={(e) => handleUploadImages(e.target.files)} />
                {uploadingImages && (
                  <div className="text-sm text-gray-600 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</div>
                )}
                {newService.images && newService.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {newService.images.map((url, idx) => (
                      <div key={idx} className="relative group border rounded overflow-hidden">
                        <div className="w-full h-20">
                          <LazyImage src={url} alt={`Image ${idx + 1}`} className="w-full h-full" />
                        </div>
                        <button type="button" className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100" onClick={() => removeImageAtIndex(idx)}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddService(false)} className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddService} disabled={addingService || uploadingImages}>
                  {addingService ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : uploadingImages ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading images...</>
                  ) : (
                    'Add Service'
                  )}
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

      {/* Edit Service Modal */}
      {showEditService && editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Service</CardTitle>
              <CardDescription>Update service information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editServiceName">Service Name</Label>
                <Input 
                  id="editServiceName" 
                  placeholder="Enter service name" 
                  value={editingService.s_name} 
                  onChange={(e) => setEditingService(s => s ? ({ ...s, s_name: e.target.value }) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editServiceType">Service Type</Label>
                <Select 
                  value={editingService.s_type} 
                  onValueChange={(v) => setEditingService(s => s ? ({ ...s, s_type: v }) : null)}
                >
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
                <Label htmlFor="editLocation">Location</Label>
                <Input 
                  id="editLocation" 
                  placeholder="Enter location" 
                  value={editingService.location} 
                  onChange={(e) => setEditingService(s => s ? ({ ...s, location: e.target.value }) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPrice">Price</Label>
                <Input 
                  id="editPrice" 
                  type="number" 
                  placeholder="Enter price" 
                  value={editingService.price} 
                  onChange={(e) => setEditingService(s => s ? ({ ...s, price: parseFloat(e.target.value) || 0 }) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editImages">Images</Label>
                <Input 
                  id="editImages" 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={(e) => handleUploadImagesEdit(e.target.files)}
                />
                {uploadingImages && (
                  <div className="text-sm text-gray-600 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</div>
                )}
                {editingService.images && editingService.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {editingService.images.map((url, idx) => (
                      <div key={idx} className="relative group border rounded overflow-hidden">
                        <div className="w-full h-20">
                          <LazyImage src={url} alt={`Image ${idx + 1}`} className="w-full h-full" />
                        </div>
                        <button 
                          type="button" 
                          className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100" 
                          onClick={() => removeEditImageAtIndex(idx)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditService(false);
                    setEditingService(null);
                  }} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleUpdateService} 
                  disabled={updatingService || uploadingImages}
                >
                  {updatingService ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                  ) : (
                    'Update Service'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditCustomer && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Customer</CardTitle>
              <CardDescription>Update customer information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editCustomerName">Customer Name</Label>
                <Input 
                  id="editCustomerName" 
                  placeholder="Enter customer name" 
                  value={editingCustomer.c_name} 
                  onChange={(e) => setEditingCustomer(c => c ? ({ ...c, c_name: e.target.value }) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCustomerEmail">Email</Label>
                <Input 
                  id="editCustomerEmail" 
                  type="email" 
                  placeholder="Enter email" 
                  value={editingCustomer.c_email} 
                  onChange={(e) => setEditingCustomer(c => c ? ({ ...c, c_email: e.target.value }) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCustomerPhone">Phone</Label>
                <Input 
                  id="editCustomerPhone" 
                  placeholder="Enter phone number" 
                  value={editingCustomer.c_phone || ''} 
                  onChange={(e) => setEditingCustomer(c => c ? ({ ...c, c_phone: e.target.value }) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCustomerAddress">Address</Label>
                <Input 
                  id="editCustomerAddress" 
                  placeholder="Enter address" 
                  value={editingCustomer.c_address || ''} 
                  onChange={(e) => setEditingCustomer(c => c ? ({ ...c, c_address: e.target.value }) : null)}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditCustomer(false);
                    setEditingCustomer(null);
                  }} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleUpdateCustomer} 
                  disabled={updatingCustomer}
                >
                  {updatingCustomer ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                  ) : (
                    'Update Customer'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Reservation Modal */}
      {showEditReservation && editingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Reservation</CardTitle>
              <CardDescription>Update reservation information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editReservationDate">Date</Label>
                <Input 
                  id="editReservationDate" 
                  type="date" 
                  value={editingReservation.check_in_date} 
                  onChange={(e) => setEditingReservation(r => r ? ({ ...r, check_in_date: e.target.value }) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editReservationPrice">Price</Label>
                <Input 
                  id="editReservationPrice" 
                  type="number" 
                  placeholder="Enter price" 
                  value={editingReservation.price} 
                  onChange={(e) => setEditingReservation(r => r ? ({ ...r, price: parseFloat(e.target.value) || 0 }) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPaymentStatus">Payment Status</Label>
                <Select 
                  value={editingReservation.payment_status} 
                  onValueChange={(v) => setEditingReservation(r => r ? ({ ...r, payment_status: v }) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditReservation(false);
                    setEditingReservation(null);
                  }} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleUpdateReservation} 
                  disabled={updatingReservation}
                >
                  {updatingReservation ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                  ) : (
                    'Update Reservation'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Service Confirmation Modal */}
      {showDeleteServiceConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Service</CardTitle>
              <CardDescription>Are you sure you want to delete this service?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold">{showDeleteServiceConfirm.s_name}</h4>
                <p className="text-sm text-gray-600">{showDeleteServiceConfirm.s_type} - {showDeleteServiceConfirm.location}</p>
                <p className="text-sm font-medium">${showDeleteServiceConfirm.price}</p>
              </div>
              <p className="text-sm text-red-600">This action cannot be undone.</p>
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteServiceConfirm(null)} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1" 
                  onClick={confirmDeleteService} 
                  disabled={deletingService === showDeleteServiceConfirm.s_id}
                >
                  {deletingService === showDeleteServiceConfirm.s_id ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                  ) : (
                    'Delete Service'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {showDeleteCustomerConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Customer</CardTitle>
              <CardDescription>Are you sure you want to delete this customer?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold">{showDeleteCustomerConfirm.c_name}</h4>
                <p className="text-sm text-gray-600">{showDeleteCustomerConfirm.c_email}</p>
                <p className="text-sm text-gray-600">{showDeleteCustomerConfirm.c_phone}</p>
              </div>
              <p className="text-sm text-red-600">This action cannot be undone.</p>
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteCustomerConfirm(null)} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1" 
                  onClick={confirmDeleteCustomer} 
                  disabled={deletingCustomer === showDeleteCustomerConfirm.c_id}
                >
                  {deletingCustomer === showDeleteCustomerConfirm.c_id ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                  ) : (
                    'Delete Customer'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Reservation Confirmation Modal */}
      {showDeleteReservationConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Reservation</CardTitle>
              <CardDescription>Are you sure you want to delete this reservation?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold">Reservation #{showDeleteReservationConfirm.reservation_id}</h4>
                <p className="text-sm text-gray-600">Date: {new Date(showDeleteReservationConfirm.check_in_date).toLocaleDateString()}</p>
                <p className="text-sm font-medium">Price: ${showDeleteReservationConfirm.price}</p>
                <p className="text-sm text-gray-600">Status: {showDeleteReservationConfirm.payment_status}</p>
              </div>
              <p className="text-sm text-red-600">This action cannot be undone.</p>
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteReservationConfirm(null)} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1" 
                  onClick={confirmDeleteReservation} 
                  disabled={deletingReservation === showDeleteReservationConfirm.reservation_id}
                >
                  {deletingReservation === showDeleteReservationConfirm.reservation_id ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                  ) : (
                    'Delete Reservation'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}