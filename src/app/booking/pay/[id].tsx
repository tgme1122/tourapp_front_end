import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/theme";
import { useAuth } from "@/store/auth";
import { useUser } from "@/store/user";
import { Booking } from "@/types/booking";
import { homeFor } from "@/utils/roles";
import BackHeader from "@/components/ui/BackHeader";
import BookingDone from "@/components/bookings/BookingDone";
import PaymentPanel from "@/components/bookings/PaymentPanel";

export default function BookingPayScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const token = useAuth((s) => s.token);
  const role = useUser((s) => s.user.role);
  const [paid, setPaid] = useState<Booking | null>(null);

  if (!token) return <Redirect href="/login" />;
  if (role !== "traveler") return <Redirect href={homeFor(role)} />;

  if (paid) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
        <BookingDone
          booking={paid}
          onViewBookings={() => router.navigate("/bookings")}
          onHome={() => router.navigate("/")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
      <BackHeader title="To'lov" />
      <PaymentPanel
        bookingId={id}
        onPaid={(b) => setPaid(b)}
        onClosed={() => router.back()}
      />
    </SafeAreaView>
  );
}
