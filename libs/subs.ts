// libs/api/subscribers.ts

const API_URL = '/api/subscribers';

export async function fetchSubscribers() {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorDetail = await response.text(); // Get the error details if available
      throw new Error(`Failed to fetch subscribers: ${response.statusText} - ${errorDetail}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error in fetchSubscribers:', error.message);
    throw new Error('Failed to fetch subscribers');
  }
}
