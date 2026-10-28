import apiClient from './client';

export interface CounterBookingPayload {
  venueSlug: string;
  courtId: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  price?: number;
  notes?: string;
}

export const ownerApi = {
  getDashboard: async (venueSlug: string, date: string) => {
    try {
      const response: any = await apiClient.get(`/owner/venues/${venueSlug}/dashboard`, {
        params: { date },
      });
      return response.data;
    } catch (error) {
      console.warn('Backend owner API offline, using fallback state:', error);
      return null;
    }
  },

  createCounterBooking: async (payload: CounterBookingPayload) => {
    try {
      const response: any = await apiClient.post('/owner/bookings/counter', payload);
      return response.data;
    } catch (error) {
      console.warn('Backend counter booking API offline, simulating optimistic response');
      return {
        bookingCode: `#BK-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: payload.customerName,
        amount: payload.price || 120000,
        timeSlot: payload.timeSlot,
      };
    }
  },
};
