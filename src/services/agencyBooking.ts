import { api } from "./api";
import { toBooking } from "./bookings";

import { asList, str } from "./mappers";
import { Booking, BookingStatus } from "@/types/booking";

export type AgencyTraveler = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  passportMask: string;
  passportNumber?: string;
  passportExpiry: string;
};

export type AgencyBooking = Booking & {
  customer: { name: string; phone: string; email: string };
  contactName: string;
  contactPhone: string;
  comment: string;
  createdAt: string;
  travelers: AgencyTraveler[];
};

const toTraveler = (raw: any): AgencyTraveler => ({
  id: str(raw?.id),
  firstName: str(raw?.first_name),
  lastName: str(raw?.last_name),
  birthDate: str(raw?.birth_date),
  passportMask: str(raw?.passport_mask),
  passportNumber: raw?.passport_number ? str(raw.passport_number) : undefined,
  passportExpiry: str(raw?.passport_expiry),
});

export const toAgencyBooking = (raw: any): AgencyBooking => {
  const c = raw.customer ?? raw.user ?? {};
  const name =
    str(c.name) || `${str(c.first_name)} ${str(c.last_name)}`.trim() || str(raw.customer_name);

  return {
    ...toBooking(raw),
    customer: {
      name,
      phone: str(c.phone ?? raw.customer_phone),
      email: str(c.email ?? raw.customer_email),
    },
    contactName: str(raw.contact_name),
    contactPhone: str(raw.contact_phone),
    comment: str(raw.comment),
    createdAt: str(raw.created_at),
    travelers: asList(raw?.travelers).map(toTraveler),
  };
};

export const listAgencyBookings = async (params: {
  status?: BookingStatus;
  limit: number;
  offset: number;
}): Promise<AgencyBooking[]> =>
  asList(await api("/bookings/agency", { query: params })).map(toAgencyBooking);

export const getAgencyBooking = async (id: string): Promise<AgencyBooking> => {
  const raw: any = await api(`/bookings/${id}`);
  return toAgencyBooking(raw?.booking ?? raw);
};

export const getBookingTravelers = async (id: string): Promise<AgencyTraveler[]> =>
  asList(await api(`/bookings/${id}/travelers`)).map(toTraveler);

export const cancelAgencyBooking = (id: string, reason?: string) =>
  api(`/bookings/${id}/cancel`, { method: "POST", body: { reason: reason || undefined } });