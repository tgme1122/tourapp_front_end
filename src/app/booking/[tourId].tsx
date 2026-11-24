import { useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, ScrollView, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import { router, useLocalSearchParams } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { useTour } from "@/hooks/useToursApi";
import { useBookingOptions, useQuote, useSubmitBooking } from "@/hooks/useBookingFlowApi";
import { useUser } from "@/store/user";
import { isApiError } from "@/services/api";
import { SubmitInput } from "@/services/bookingFlow";
import { Booking } from "@/types/booking";
import { formatDateRange, formatPrice } from "@/utils/format";
import {
  addDaysISO, addMonthsISO, ageOn, dmyToISO, formatPhone, isValidEmail, isValidPassport,
  isValidPhone, todayISO,
} from "@/utils/validation";
import EmptyState from "@/components/ui/EmptyState";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PassengerForm, { TravelerErrors, TravelerForm } from "@/components/bookings/PassengerForm";
import BookingDone from "@/components/bookings/BookingDone";
import StepBar from "@/components/bookings/StepBar";
import PaymentPanel from "@/components/bookings/PaymentPanel";
import GuestStepper from "@/components/bookings/GuestStepper";
import QuoteSummary from "@/components/bookings/QuoteSummary";


type Step = "options" | "travelers" | "review" | "payment" | "done";
const STEP_INDEX: Record<Step, number> = { options: 0, travelers: 1, review: 2, payment: 3, done: 3 };

const emptyTraveler = (type: "adult" | "child", age?: number): TravelerForm => ({
  type, age, firstName: "", lastName: "", series: "", number: "", expiry: "", birth: "",
});

export default function BookingScreen() {
  const { tourId = "", departureId } = useLocalSearchParams<{ tourId: string; departureId?: string }>();
  const insets = useSafeAreaInsets();
  const user = useUser((s) => s.user);

  const { data, isPending, isError, error, refetch } = useTour(tourId);
  const tour = data?.tour;
  const departures = data?.details.departures ?? [];
  const departure =
    departures.find((d) => d.id === departureId) ?? departures.find((d) => d.seatsLeft > 0);

  const options = useBookingOptions(tourId, departure?.id);
  const submit = useSubmitBooking(tourId);

  const [step, setStep] = useState<Step>("options");
  const [adults, setAdults] = useState(1);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [roomId, setRoomId] = useState<string | undefined>();
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [travelers, setTravelers] = useState<TravelerForm[]>([]);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [errors, setErrors] = useState<Record<number, TravelerErrors>>({});
  const [contactErrors, setContactErrors] = useState<{ phone?: string; email?: string }>({});
  const [accept, setAccept] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [paid, setPaid] = useState<Booking | null>(null);

  // Bir xil so'rovni qayta yuborishda bir xil kalit, so'rov o'zgarsa yangi kalit
  const lastKey = useRef<{ hash: string; key: string } | null>(null);
  const keyFor = (payload: unknown) => {
    const hash = JSON.stringify(payload);
    if (!lastKey.current || lastKey.current.hash !== hash) {
      lastKey.current = { hash, key: Crypto.randomUUID() };
    }
    return lastKey.current.key;
  };

  const opt = options.data;
  const rooms = opt?.rooms ?? [];
  const extras = opt?.extras ?? [];
  const childMaxAge = opt?.childMaxAge ?? 17;

  const maxGuests = Math.max(
    1,
    Math.min(opt?.maxGuests ?? 10, departure?.seatsLeft ?? 10, 20)
  );

  // Birinchi xona turi avtomatik tanlanadi
  useEffect(() => {
    if (!roomId && rooms.length > 0) setRoomId(rooms[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms.length]);

  // Sayohatchilar formalari soni mehmonlar soniga moslashadi
  useEffect(() => {
    setTravelers((prev) => {
      const prevAdults = prev.filter((t) => t.type === "adult");
      const prevChildren = prev.filter((t) => t.type === "child");
      const adultList = Array.from({ length: adults }, (_, i) =>
        prevAdults[i] ??
        (i === 0
          ? { ...emptyTraveler("adult"), firstName: user.firstName.toUpperCase(), lastName: user.lastName.toUpperCase() }
          : emptyTraveler("adult"))
      );
      const childList = childAges.map((age, i) => ({
        ...(prevChildren[i] ?? emptyTraveler("child")),
        age,
      }));
      return [...adultList, ...childList];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adults, childAges]);

  const quoteInput = useMemo(
    () =>
      departure
        ? { departureId: departure.id, adults, childAges, roomId, extraIds }
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [departure?.id, adults, childAges, roomId, extraIds]
  );
  const quote = useQuote(tourId, quoteInput);
  const quoteError = quote.isError
    ? isApiError(quote.error) ? quote.error.message : "Narxni hisoblab bo'lmadi"
    : null;

  const dateText =
    tour && departure
      ? `${formatDateRange(departure.startISO, tour.days)} ${departure.startISO.slice(0, 4)}`
      : "";

  const updateTraveler = (index: number, patch: Partial<TravelerForm>) =>
    setTravelers((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));

  // ------------------------------------------------------------ tekshiruvlar
  const validateTravelers = () => {
    if (!tour || !departure) return false;
    const tripEnd = addDaysISO(departure.startISO, tour.days - 1);
    const international = tour.country !== "O'zbekiston";
    const minExpiry = international ? addMonthsISO(tripEnd, 6) : tripEnd;

    const all: Record<number, TravelerErrors> = {};
    travelers.forEach((t, i) => {
      const e: TravelerErrors = {};
      if (t.firstName.trim().length < 2) e.firstName = "Ismni kiriting";
      if (t.lastName.trim().length < 2) e.lastName = "Familiyani kiriting";
      if (!isValidPassport(t.series, t.number)) e.passport = "Seriya (2 harf) va 7 ta raqam";

      const expiry = dmyToISO(t.expiry);
      if (!expiry) e.expiry = "Sanani to'liq kiriting";
      else if (expiry <= minExpiry) {
        e.expiry = international
          ? "Sayohat tugagandan keyin kamida 6 oy amal qilishi kerak"
          : "Pasport sayohatdan oldin tugaydi";
      }

      const birth = dmyToISO(t.birth);
      if (!birth || birth > todayISO()) e.birth = "Sanani to'g'ri kiriting";
      else if (t.type === "child" && ageOn(birth, departure.startISO) !== t.age) {
        e.birth = `Sayohat kuni ${t.age} yosh bo'lishi kerak`;
      } else if (t.type === "adult" && ageOn(birth, departure.startISO) < 18) {
        e.birth = "Katta yoshdagi sayohatchi kamida 18 yoshda bo'lishi kerak";
      }

      if (Object.keys(e).length > 0) all[i] = e;
    });

    const c: { phone?: string; email?: string } = {};
    if (!isValidPhone(phone)) c.phone = "Telefon raqamini to'liq kiriting";
    if (!isValidEmail(email)) c.email = "Email manzili noto'g'ri";

    setErrors(all);
    setContactErrors(c);
    return Object.keys(all).length === 0 && Object.keys(c).length === 0;
  };

  const goNext = () => {
    if (step === "options") setStep("travelers");
    else if (step === "travelers" && validateTravelers()) setStep("review");
  };

  const goBack = () => {
    if (step === "travelers") setStep("options");
    else if (step === "review") setStep("travelers");
    else if (step === "done") router.navigate("/");
    else router.back();
  };

  const createBooking = () => {
    if (!departure || !accept) return;
    setFormError(null);

    const payload: SubmitInput = {
      departureId: departure.id,
      adults,
      childAges,
      roomId,
      extraIds,
      contactPhone: phone,
      contactEmail: email.trim().toLowerCase(),
      travelers: travelers.map((t) => ({
        type: t.type,
        firstName: t.firstName.trim().toUpperCase(),
        lastName: t.lastName.trim().toUpperCase(),
        passportSeries: t.series,
        passportNumber: t.number,
        passportExpiry: dmyToISO(t.expiry) ?? "",
        birthDate: dmyToISO(t.birth) ?? "",
      })),
    };

    submit.mutate(
      { input: payload, key: keyFor(payload) },
      {
        onSuccess: (b) => {
          setBooking(b);
          setStep("payment");
        },
        onError: (e) =>
          setFormError(isApiError(e) ? e.message : "Bronni yaratib bo'lmadi. Qayta urinib ko'ring."),
      }
    );
  };

  // ------------------------------------------------------------ yuklanish / xato
  if (isPending) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError || !tour || !departure) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <EmptyState
          icon="calendar-outline"
          title={isError ? "Yuklab bo'lmadi" : "Bo'sh jo'nash yo'q"}
          text={
            isError && isApiError(error)
              ? error.message
              : "Bu tur uchun hozircha bron qilish mumkin bo'lgan sana yo'q."
          }
          actionLabel={isError ? "Qayta urinish" : "Orqaga"}
          onAction={() => (isError ? refetch() : router.back())}
        />
      </SafeAreaView>
    );
  }

  // ------------------------------------------------------------ tasdiq
  if (step === "done" && paid) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <BookingDone
          booking={paid}
          onViewBookings={() => router.navigate("/bookings")}
          onHome={() => router.navigate("/")}
        />
      </SafeAreaView>
    );
  }

  const total = quote.data?.total;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={goBack} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{tour.title}</Text>
          <Text style={styles.headerSub}>{dateText}</Text>
        </View>
      </View>

      <StepBar current={STEP_INDEX[step]} />

      {step === "payment" && booking ? (
        <PaymentPanel
          bookingId={booking.id}
          onPaid={(b) => {
            setPaid(b);
            setStep("done");
          }}
          onClosed={() => router.back()}
        />
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {/* ---------- 1. Parametrlar */}
            {step === "options" && (
              <>
                <View style={styles.block}>
                  <Text style={styles.blockTitle}>Mehmonlar</Text>
                  <GuestStepper
                    label="Kattalar" hint="18 yosh va undan katta" value={adults} min={1}
                    max={Math.max(1, maxGuests - childAges.length)} onChange={setAdults}
                  />
                  <GuestStepper
                    label="Bolalar" hint={`0–${childMaxAge} yosh`} value={childAges.length} min={0}
                    max={Math.max(0, maxGuests - adults)}
                    onChange={(n) =>
                      setChildAges((prev) =>
                        n > prev.length
                          ? [...prev, ...Array<number>(n - prev.length).fill(5)]
                          : prev.slice(0, n)
                      )
                    }
                  />
                  <Text style={styles.hint}>Bo'sh joy: {departure.seatsLeft}</Text>

                  {childAges.map((age, i) => (
                    <View key={i} style={{ gap: 8 }}>
                      <Text style={styles.label}>{i + 1}-bolaning yoshi</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {Array.from({ length: childMaxAge + 1 }, (_, a) => (
                          <Pressable
                            key={a}
                            onPress={() => setChildAges((prev) => prev.map((v, j) => (j === i ? a : v)))}
                            style={[styles.ageChip, age === a && styles.ageChipOn]}
                          >
                            <Text style={[styles.ageText, age === a && { color: colors.white }]}>{a}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  ))}
                </View>

                {options.isPending && (
                  <ActivityIndicator color={colors.primary} />
                )}

                {rooms.length > 0 && (
                  <View style={styles.block}>
                    <Text style={styles.blockTitle}>Xona turi</Text>
                    {rooms.map((r) => {
                      const on = r.id === roomId;
                      return (
                        <Pressable
                          key={r.id}
                          onPress={() => setRoomId(r.id)}
                          style={[styles.option, on && styles.optionOn]}
                        >
                          <Ionicons
                            name={on ? "radio-button-on" : "radio-button-off"}
                            size={22}
                            color={on ? colors.primary : colors.muted}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.optionTitle}>{r.label}</Text>
                            {!!r.description && <Text style={styles.hint}>{r.description}</Text>}
                          </View>
                          {r.price > 0 && <Text style={styles.optionPrice}>+{formatPrice(r.price)}</Text>}
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                {extras.length > 0 && (
                  <View style={styles.block}>
                    <Text style={styles.blockTitle}>Qo'shimcha xizmatlar</Text>
                    {extras.map((x) => {
                      const on = extraIds.includes(x.id);
                      return (
                        <Pressable
                          key={x.id}
                          onPress={() =>
                            setExtraIds((prev) =>
                              on ? prev.filter((id) => id !== x.id) : [...prev, x.id]
                            )
                          }
                          style={[styles.option, on && styles.optionOn]}
                        >
                          <Ionicons
                            name={on ? "checkbox" : "square-outline"}
                            size={22}
                            color={on ? colors.primary : colors.muted}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.optionTitle}>{x.label}</Text>
                            {!!x.description && <Text style={styles.hint}>{x.description}</Text>}
                          </View>
                          {x.price > 0 && <Text style={styles.optionPrice}>+{formatPrice(x.price)}</Text>}
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </>
            )}

            {/* ---------- 2. Sayohatchilar */}
            {step === "travelers" && (
              <>
                {travelers.map((t, i) => (
                  <PassengerForm
                    key={i}
                    index={i}
                    traveler={t}
                    errors={errors[i]}
                    onChange={(patch) => updateTraveler(i, patch)}
                  />
                ))}

                <View style={styles.block}>
                  <Text style={styles.blockTitle}>Buyurtmachi aloqasi</Text>
                  <FormField
                    label="Telefon" icon="call-outline" value={phone}
                    onChangeText={(t) => setPhone(formatPhone(t))} error={contactErrors.phone}
                    placeholder="+998 90 123 45 67" keyboardType="phone-pad"
                  />
                  <FormField
                    label="Email" icon="mail-outline" value={email}
                    onChangeText={setEmail} error={contactErrors.email}
                    placeholder="email@misol.uz" keyboardType="email-address"
                    autoCapitalize="none" autoCorrect={false}
                  />
                </View>
              </>
            )}

            {/* ---------- 3. Tasdiqlash */}
            {step === "review" && (
              <>
                <View style={styles.summary}>
                  <View style={styles.sumRow}>
                    <Text style={styles.sumLabel}>Sana</Text>
                    <Text style={styles.sumValue}>{dateText}</Text>
                  </View>
                  <View style={styles.sumRow}>
                    <Text style={styles.sumLabel}>Mehmonlar</Text>
                    <Text style={styles.sumValue}>
                      {adults} katta{childAges.length ? `, ${childAges.length} bola` : ""}
                    </Text>
                  </View>
                  {!!roomId && rooms.length > 0 && (
                    <View style={styles.sumRow}>
                      <Text style={styles.sumLabel}>Xona</Text>
                      <Text style={styles.sumValue}>{rooms.find((r) => r.id === roomId)?.label}</Text>
                    </View>
                  )}
                  {extraIds.length > 0 && (
                    <View style={styles.sumRow}>
                      <Text style={styles.sumLabel}>Xizmatlar</Text>
                      <Text style={styles.sumValue}>
                        {extras.filter((x) => extraIds.includes(x.id)).map((x) => x.label).join(", ")}
                      </Text>
                    </View>
                  )}
                  <View style={styles.sumRow}>
                    <Text style={styles.sumLabel}>Aloqa</Text>
                    <Text style={styles.sumValue}>{phone}</Text>
                  </View>
                </View>

                <View style={styles.block}>
                  <Text style={styles.blockTitle}>Sayohatchilar</Text>
                  {travelers.map((t, i) => (
                    <View key={i} style={styles.person}>
                      <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
                      <Text style={styles.personName}>{t.firstName} {t.lastName}</Text>
                      <Text style={styles.hint}>{t.series}{t.number.slice(0, 2)}•••••</Text>
                    </View>
                  ))}
                </View>

                <QuoteSummary quote={quote.data} loading={quote.isFetching} error={quoteError} />

                <View style={styles.block}>
                  <Text style={styles.blockTitle}>Bekor qilish va qaytarish shartlari</Text>
                  <Text style={styles.policy}>
                    {opt?.policy || "Bekor qilish va qaytarish shartlari agentlik tomonidan belgilanadi."}
                  </Text>
                  <Pressable style={styles.agreeRow} onPress={() => setAccept((v) => !v)}>
                    <View style={[styles.checkbox, accept && styles.checkboxOn]}>
                      {accept && <Ionicons name="checkmark" size={16} color={colors.white} />}
                    </View>
                    <Text style={styles.agreeText}>
                      Bekor qilish va qaytarish shartlari bilan tanishdim va roziman
                    </Text>
                  </Pressable>
                </View>

                {formError && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={18} color={colors.danger} />
                    <Text style={styles.errorText}>{formError}</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Pastki panel */}
          <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View>
              <Text style={styles.barLabel}>Jami</Text>
              <Text style={styles.barTotal}>
                {total !== undefined ? formatPrice(total) : quoteError ? "—" : "..."}
              </Text>
            </View>
            <View style={{ flex: 1, maxWidth: 220 }}>
              {step === "review" ? (
                <PrimaryButton
                  label="Bron qilish"
                  onPress={createBooking}
                  loading={submit.isPending}
                  disabled={!accept}
                />
              ) : (
                <PrimaryButton label="Davom etish" onPress={goNext} />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  back: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  headerSub: { fontSize: 12, color: colors.muted, marginTop: 1 },
  content: { padding: 16, gap: 20 },
  block: { gap: 12 },
  blockTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  label: { fontSize: 13, fontWeight: "700", color: colors.text },
  hint: { fontSize: 12, color: colors.muted },
  ageChip: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center",
  },
  ageChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  ageText: { fontSize: 14, fontWeight: "700", color: colors.text },
  option: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.xl,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background,
    ...shadows.soft,
  },
  optionOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optionTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  optionPrice: { fontSize: 13, fontWeight: "800", color: colors.primary },
  summary: {
    padding: 15, gap: 10, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background, ...shadows.soft,
  },
  sumRow: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  sumLabel: { fontSize: 14, color: colors.muted },
  sumValue: { flex: 1, textAlign: "right", fontSize: 14, fontWeight: "700", color: colors.text },
  person: { flexDirection: "row", alignItems: "center", gap: 8 },
  personName: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.text },
  policy: { fontSize: 13, lineHeight: 19, color: colors.muted },
  agreeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: {
    width: 24, height: 24, borderRadius: 8, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.background, alignItems: "center", justifyContent: "center",
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  agreeText: { flex: 1, fontSize: 13, lineHeight: 18, color: colors.text },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12,
    backgroundColor: colors.dangerSoft,
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.danger },
  bar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16,
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  barLabel: { fontSize: 11, color: colors.muted },
  barTotal: { fontSize: 20, fontWeight: "800", color: colors.text },
});