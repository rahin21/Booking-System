'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, DollarSign } from 'lucide-react';

export type PaymentMethod = 'cash_on_delivery' | 'bkash' | 'bank';

export interface PaymentDetails {
  paymentMethod: PaymentMethod;
  bkashNumber?: string;
  bkashTrxId?: string;
  bankName?: string;
  bankRef?: string;
}

interface PaymentModalProps {
  open: boolean;
  amount?: number;
  currency?: string;
  initialMethod?: PaymentMethod;
  initialDetails?: Partial<PaymentDetails>;
  onClose: () => void;
  onConfirm: (details: PaymentDetails) => void;
}

export default function PaymentModal({ open, amount, currency = 'BDT', initialMethod, initialDetails, onClose, onConfirm }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>(initialMethod || 'cash_on_delivery');
  const [bkashNumber, setBkashNumber] = useState(initialDetails?.bkashNumber || '');
  const [bkashTrxId, setBkashTrxId] = useState(initialDetails?.bkashTrxId || '');
  const [bankName, setBankName] = useState(initialDetails?.bankName || '');
  const [bankRef, setBankRef] = useState(initialDetails?.bankRef || '');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      // Reset errors when modal opens
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!method) newErrors.method = 'Payment method is required';
    if (method === 'bkash') {
      if (!/^\d{11}$/.test(bkashNumber)) newErrors.bkashNumber = 'Valid bKash number (11 digits) required';
      if (!bkashTrxId || bkashTrxId.trim().length < 6) newErrors.bkashTrxId = 'bKash transaction ID is required';
    }
    if (method === 'bank') {
      if (!bankName || bankName.trim().length < 2) newErrors.bankName = 'Bank name is required';
      if (!bankRef || bankRef.trim().length < 4) newErrors.bankRef = 'Reference number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      onConfirm({
        paymentMethod: method,
        bkashNumber: method === 'bkash' ? bkashNumber : undefined,
        bkashTrxId: method === 'bkash' ? bkashTrxId : undefined,
        bankName: method === 'bank' ? bankName : undefined,
        bankRef: method === 'bank' ? bankRef : undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" /> Payment Details
              </CardTitle>
              <CardDescription>Confirm how you would like to pay</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>✕</Button>
          </CardHeader>
          <CardContent>
            {typeof amount === 'number' && (
              <div className="mb-4 text-sm text-gray-600">
                Amount: <span className="font-medium">{currency} {amount}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label>Payment Method</Label>
                <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue placeholder="Choose a payment method" />
                  </SelectTrigger>
                  <SelectContent>
                <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                {errors.method && <p className="text-sm text-red-500 mt-1">{errors.method}</p>}
              </div>

              {method === 'bkash' && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="pm-bkashNumber">bKash Number *</Label>
                    <Input id="pm-bkashNumber" value={bkashNumber} onChange={(e) => setBkashNumber(e.target.value)} />
                    {errors.bkashNumber && <p className="text-sm text-red-500 mt-1">{errors.bkashNumber}</p>}
                  </div>
                  <div>
                    <Label htmlFor="pm-bkashTrxId">Transaction ID *</Label>
                    <Input id="pm-bkashTrxId" value={bkashTrxId} onChange={(e) => setBkashTrxId(e.target.value)} />
                    {errors.bkashTrxId && <p className="text-sm text-red-500 mt-1">{errors.bkashTrxId}</p>}
                  </div>
                </div>
              )}

              {method === 'bank' && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="pm-bankName">Bank Name *</Label>
                    <Input id="pm-bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                    {errors.bankName && <p className="text-sm text-red-500 mt-1">{errors.bankName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="pm-bankRef">Reference Number *</Label>
                    <Input id="pm-bankRef" value={bankRef} onChange={(e) => setBankRef(e.target.value)} />
                    {errors.bankRef && <p className="text-sm text-red-500 mt-1">{errors.bankRef}</p>}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button className="flex-1" onClick={handleConfirm} disabled={submitting}>
                  {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : 'Confirm Payment Details'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}