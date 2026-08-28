'use client';

import { useState, useTransition } from 'react';
import { Truck, Package, CheckCircle2, XCircle, Loader2, QrCode, Plus, X } from 'lucide-react';
import {
  updateFulfillmentStatus,
  assignCodeToOrderItem,
  unassignCodeFromOrderItem,
} from '@/lib/order-actions';
import { getAccessToken } from '@/lib/supabase/access-token';

interface OrderItemInfo {
  id: string;
  productName: string;
  quantity: number;
  assignedCount: number;
}

export function AdminOrderActions({
  orderId,
  orderItems,
  currentStatus,
  trackingCarrier,
  trackingNumber,
  trackingUrl,
}: {
  orderId: string;
  orderItems: OrderItemInfo[];
  currentStatus: string;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [carrier, setCarrier] = useState(trackingCarrier ?? '');
  const [tracking, setTracking] = useState(trackingNumber ?? '');
  const [trackingUrlState, setTrackingUrlState] = useState(trackingUrl ?? '');
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [assigningItemId, setAssigningItemId] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState('');

  function handleSaveStatus() {
    setMessage(null);
    startTransition(async () => {
      const accessToken = await getAccessToken();
      const result = await updateFulfillmentStatus(
        accessToken,
        orderId,
        status as 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
        carrier,
        tracking,
        trackingUrlState
      );
      if (result.success) {
        setMessage({ type: 'success', text: 'Fulfillment updated.' });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    });
  }

  function handleAssignCode(itemId: string) {
    if (!codeInput.trim()) return;
    setMessage(null);
    startTransition(async () => {
      const accessToken = await getAccessToken();
      const result = await assignCodeToOrderItem(accessToken, codeInput.trim(), itemId);
      if (result.success) {
        setMessage({ type: 'success', text: 'Code assigned.' });
        setCodeInput('');
        setAssigningItemId(null);
        // Refresh to show the new code
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    });
  }

  return (
    <div className="space-y-4">
      {message ? (
        <div
          className={`rounded-lg p-3 text-sm font-semibold ${
            message.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border border-destructive/30 bg-destructive/10 text-destructive'
          }`}
          role={message.type === 'error' ? 'alert' : 'status'}
        >
          {message.text}
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Fulfillment</h2>

        <div className="mt-4 space-y-4">
          {/* Code assignment per item */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Code Assignment</p>
            {orderItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.assignedCount}/{item.quantity} codes assigned
                    </p>
                  </div>
                  {item.assignedCount < item.quantity ? (
                    <button
                      type="button"
                      onClick={() => setAssigningItemId(assigningItemId === item.id ? null : item.id)}
                      className="btn-secondary-np h-8 px-3 text-xs"
                    >
                      <Plus className="mr-1 h-3 w-3" /> Assign code
                    </button>
                  ) : (
                    <span className="badge-np bg-emerald-50 text-emerald-700">Complete</span>
                  )}
                </div>
                {assigningItemId === item.id ? (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      placeholder="Enter code (e.g. ABCD-EFGH)"
                      className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm font-mono placeholder:font-sans placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    />
                    <button
                      type="button"
                      onClick={() => handleAssignCode(item.id)}
                      disabled={pending || !codeInput.trim()}
                      className="btn-primary-np h-9 px-3 text-xs disabled:opacity-60"
                    >
                      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Assign'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAssigningItemId(null); setCodeInput(''); }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Status + tracking */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="status" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fulfillment status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <option value="unfulfilled">Unfulfilled</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label htmlFor="carrier" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Carrier
              </label>
              <input
                id="carrier"
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="USPS, UPS, FedEx"
                className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </div>
            <div>
              <label htmlFor="tracking" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tracking number
              </label>
              <input
                id="tracking"
                type="text"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="Tracking number"
                className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </div>
            <div>
              <label htmlFor="trackingUrl" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tracking URL
              </label>
              <input
                id="trackingUrl"
                type="url"
                value={trackingUrlState}
                onChange={(e) => setTrackingUrlState(e.target.value)}
                placeholder="https://..."
                className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveStatus}
            disabled={pending}
            className="btn-primary-np w-full disabled:opacity-60"
          >
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save fulfillment
          </button>
        </div>
      </div>
    </div>
  );
}
