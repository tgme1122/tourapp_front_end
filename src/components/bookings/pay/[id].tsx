import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/theme";
import { Booking } from "@/types/booking";
import BackHeader from "@/components/ui/BackHeader";
import BookingDone from "../BookingDone";
import PaymentPanel from "../PaymentPanel";


export default function PayScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const [paid, setPaid] = useState<Booking | null>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
      <BackHeader title="To'lov" />
      {paid ? (
        <BookingDone
          booking={paid}
          onViewBookings={() => router.navigate("/bookings")}
          onHome={() => router.navigate("/")}
        />
      ) : (
        <PaymentPanel bookingId={id} onPaid={setPaid} onClosed={() => router.back()} />
      )}
    </SafeAreaView>
  );
}