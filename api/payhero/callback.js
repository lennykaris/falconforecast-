import { getSupabaseAdmin } from './_lib/payhero.js';
import { resolvePayment } from './_lib/resolvePayment.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const body = req.body || {};
  const responseData = body.response || body;

  const externalReference =
    responseData.ExternalReference ||
    responseData.external_reference ||
    body.ExternalReference ||
    body.external_reference ||
    body.reference;

  const checkoutRequestId =
    responseData.CheckoutRequestID ||
    responseData.checkout_request_id ||
    body.CheckoutRequestID;

  if (!externalReference && !checkoutRequestId) {
    console.warn('PayHero callback received with no identifiable reference:', body);
    res.status(200).json({ status: 'ok', message: 'No reference' });
    return;
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error('PayHero callback: Supabase admin client unavailable:', err);
    res.status(500).json({ error: 'Server not configured' });
    return;
  }

  try {
    // Find payment by externalReference first, or fallback to cloud_packet_id matching CheckoutRequestID
    let paymentQuery = supabase.from('payments').select('*');
    if (externalReference) {
      paymentQuery = paymentQuery.eq('reference', externalReference);
    } else {
      paymentQuery = paymentQuery.eq('cloud_packet_id', checkoutRequestId);
    }

    const { data: payment, error: findErr } = await paymentQuery.maybeSingle();

    if (findErr) throw findErr;

    if (!payment) {
      console.warn('PayHero callback: payment not found for reference:', externalReference || checkoutRequestId);
      res.status(200).json({ status: 'ok', message: 'Payment not found' });
      return;
    }

    if (payment.status !== 'PENDING') {
      // Idempotent no-op
      res.status(200).json({ status: 'ok', message: 'Already resolved' });
      return;
    }

    const resultCode = responseData.ResultCode !== undefined ? Number(responseData.ResultCode) : null;
    const statusField = responseData.Status || body.status;
    const isSuccess =
      resultCode === 0 ||
      (statusField === true || statusField === 'Success' || statusField === 'SUCCESS');

    const receiptNumber = responseData.MpesaReceiptNumber || responseData.mpesa_receipt_number || null;
    const failureMessage = responseData.ResultDesc || responseData.result_desc || 'Payment failed';

    await resolvePayment(supabase, payment, {
      success: isSuccess,
      receiptNumber,
      failureMessage,
    });

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('POST /api/payhero/callback failed:', err);
    res.status(500).json({ error: 'Internal error' });
  }
}
