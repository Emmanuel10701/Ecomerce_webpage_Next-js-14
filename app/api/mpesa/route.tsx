// pages/api/mpesa-checkout.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const SHORTCODE = 'your_shortcode';
const LIPA_NG_KEY = 'your_lipa_na_mpesa_online_key';
const LIPA_NG_SECRET = 'your_lipa_na_mpesa_online_secret';
const LIPA_NG_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'; // Update to live URL when in production

const getAccessToken = async () => {
  const auth = Buffer.from(`${LIPA_NG_KEY}:${LIPA_NG_SECRET}`).toString('base64');
  const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  return response.data.access_token;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { phoneNumber, amount } = req.body;

      if (!phoneNumber || !amount) {
        return res.status(400).json({ error: 'Phone number and amount are required' });
      }

      const accessToken = await getAccessToken();
      
      const response = await axios.post(LIPA_NG_URL, {
        BusinessShortCode: SHORTCODE,
        Password: Buffer.from(`${SHORTCODE}${LIPA_NG_SECRET}${new Date().toISOString().replace(/[-:.]/g, '')}`).toString('base64'),
        Timestamp: new Date().toISOString().replace(/[-:.]/g, ''),
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: 'https://yourdomain.com/callback', // Replace with your callback URL
        AccountNumber: '123456',
        TransactionDesc: 'Payment for goods',
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      res.status(200).json(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific errors
        res.status(error.response?.status || 500).json({
          error: error.response?.data?.error || 'An error occurred while processing the request.',
        });
      } else if (error instanceof Error) {
        // Handle general errors
        res.status(500).json({ error: error.message });
      } else {
        // Handle unexpected errors
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
