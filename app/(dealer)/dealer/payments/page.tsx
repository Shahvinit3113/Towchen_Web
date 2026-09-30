"use client";

import React, { useState, useEffect } from "react";
import { paymentsApi } from "@/lib/api/payments";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Landmark, CheckCircle2, Receipt, ArrowUpRight } from "lucide-react";

export default function DealerPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await paymentsApi.getPaymentHistory();
      setPayments(data);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Payment Methods & Invoicing
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configured dealership billing methods, GST invoices, and automated settlement accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Linked Settlement Bank */}
        <Card className="p-6 border border-slate-200/90 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Primary Settlement Account
            </span>
            <Badge variant="success">Verified & Active</Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">HDFC Bank Ltd</h3>
              <p className="font-mono text-xs text-slate-500">
                A/C: ••••••••••••1234 • IFSC: HDFC0001234
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
            All dealer package commissions and bonus payouts are routed via direct NEFT/RTGS to this account.
          </p>
        </Card>

        {/* GST & Tax Invoicing */}
        <Card className="p-6 border border-slate-200/90 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              GSTIN & Compliance
            </span>
            <Badge variant="primary">GST Registered</Badge>
          </div>

          <div>
            <span className="text-xs text-slate-400 block font-mono">Tax Identifier (GSTIN)</span>
            <p className="text-lg font-black text-slate-900 font-mono">
              07AAACA1234F1Z5
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
            Monthly tax invoices with input tax credit (ITC) are automatically generated on the 1st of every month.
          </p>
        </Card>
      </div>

      {/* Payment History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Package Settlement Invoices
        </h2>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {p.id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {formatDate(p.date)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {p.method}
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 font-medium">
                    {p.purpose}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="success">{p.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                    {formatCurrency(p.amount)}
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
