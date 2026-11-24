import { useState } from "react";
import { View, Text, TextInput, Pressable, Switch, StyleSheet } from "react-native";
import { colors, noFocusOutline } from "@/constants/theme";
import { categoryOptions } from "@/constants/filters";
import { ItineraryItem, NewDeparture, TourInput } from "@/services/agencyTours";
import { TourCategory } from "@/types/tour";
import { formatPrice } from "@/utils/format";
import { dmyToISO, todayISO } from "@/utils/validation";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import DepartureEditor, { DepartureDraft } from "./DepartureEditor";
import ItineraryEditor from "./ItineraryEditor";
import StringListEditor from "./StringListEditor";
import GuestStepper from "../bookings/GuestStepper";

type Props = {
  initial?: TourInput;
  withDepartures?: boolean; // faqat yangi tur yaratishda
  submitLabel: string;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (input: TourInput, departures: NewDeparture[]) => void;
};

type Errors = Partial<
  Record<"title" | "description" | "city" | "country" | "price" | "oldPrice" | "itinerary" | "departures", string>
>;

const digits = (t: string) => t.replace(/\D/g, "");

export default function TourForm({
  initial, withDepartures, submitLabel, submitting, error, onSubmit,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [country, setCountry] = useState(initial?.country ?? "");
  const [category, setCategory] = useState<TourCategory>(initial?.category ?? "sea");
  const [days, setDays] = useState(initial?.days ?? 3);
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [oldPrice, setOldPrice] = useState(initial?.oldPrice ? String(initial.oldPrice) : "");
  const [hotel, setHotel] = useState(initial?.hotel ?? "");
  const [meals, setMeals] = useState(initial?.meals ?? "");
  const [transport, setTransport] = useState(initial?.transport ?? "");
  const [groupSize, setGroupSize] = useState(initial?.groupSize ?? "");
  const [language, setLanguage] = useState(initial?.language ?? "");
  const [included, setIncluded] = useState<string[]>(initial?.included ?? []);
  const [excluded, setExcluded] = useState<string[]>(initial?.excluded ?? []);
  const [hot, setHot] = useState(initial?.hot ?? false);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(initial?.itinerary ?? []);
  const [drafts, setDrafts] = useState<DepartureDraft[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  const submit = () => {
    const e: Errors = {};
    const priceNum = Number(price);
    const oldNum = oldPrice ? Number(oldPrice) : null;

    if (title.trim().length < 3) e.title = "Sarlavhani kiriting (kamida 3 ta belgi)";
    if (description.trim().length < 10) e.description = "Kamida 10 ta belgi yozing";
    if (city.trim().length < 2) e.city = "Shahar nomini kiriting (kamida 2 ta belgi)";
    if (country.trim().length < 2) e.country = "Davlat nomini kiriting (kamida 2 ta belgi)";
    if (!priceNum || priceNum <= 0) e.price = "Narxni kiriting";
    if (oldNum !== null && oldNum <= priceNum) e.oldPrice = "Eski narx joriy narxdan katta bo'lishi kerak";

    if (itinerary.length > days) e.itinerary = `Dastur kunlari ${days} tadan oshmasligi kerak`;
    else if (itinerary.some((i) => !i.title.trim() || !i.text.trim())) {
      e.itinerary = "Har bir kun uchun sarlavha va tavsif kiriting";
    }

    const departures: NewDeparture[] = [];
    if (withDepartures) {
      let bad = false;
      for (const d of drafts) {
        const iso = dmyToISO(d.date);
        const seats = Number(d.seats);
        if (!iso || iso < todayISO() || !seats || seats < 1 || seats > 500) {
          bad = true;
          break;
        }
        departures.push({ startISO: iso, seatsTotal: seats });
      }
      if (bad) e.departures = "Sana kelajakda, joylar soni 1 dan 500 gacha bo'lishi kerak";
    }

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    onSubmit(
      {
        title, description, city, country, category, days,
        price: priceNum, oldPrice: oldNum,
        hotel, meals, transport, groupSize, language,
        included, excluded, hot, itinerary,
      },
      departures
    );
  };

  return (
    <View style={styles.form}>
      <Text style={styles.section}>Asosiy ma'lumot</Text>
      <FormField label="Sarlavha" value={title} onChangeText={setTitle} error={errors.title} placeholder="Masalan: Antalya, 7 kunlik dam olish" />

      <View style={{ gap: 6 }}>
        <Text style={styles.label}>Tavsif</Text>
        <TextInput
          style={[styles.area, !!errors.description && styles.areaError]}
          value={description}
          onChangeText={setDescription}
          placeholder="Tur haqida batafsil yozing (kamida 10 ta belgi)"
          placeholderTextColor={colors.muted}
          multiline
          textAlignVertical="top"
        />
        {errors.description ? <Text style={styles.error}>{errors.description}</Text> : null}
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <FormField label="Shahar" value={city} onChangeText={setCity} error={errors.city} />
        </View>
        <View style={{ flex: 1 }}>
          <FormField label="Davlat" value={country} onChangeText={setCountry} error={errors.country} />
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={styles.label}>Turkum</Text>
        <View style={styles.chips}>
          {categoryOptions.map((c) => {
            const on = c.key === category;
            return (
              <Pressable key={c.key} onPress={() => setCategory(c.key)} style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipText, on && { color: colors.white }]}>{c.label}</Text>
              </Pressable>
            );
          })}
          
        </View>
      </View>

      <GuestStepper label="Davomiyligi" hint="Kunlarda (1–60)" value={days} min={1} max={60} onChange={setDays} />

      <Text style={styles.section}>Narx</Text>
      <View style={{ gap: 6 }}>
        <FormField
          label="Narx (so'm, 1 kishi uchun)" value={price} onChangeText={(t) => setPrice(digits(t))}
          error={errors.price} keyboardType="number-pad" placeholder="6900000"
        />
        {!!price && <Text style={styles.hint}>{formatPrice(Number(price))}</Text>}
      </View>
      <View style={{ gap: 6 }}>
        <FormField
          label="Eski narx (ixtiyoriy, chegirma uchun)" value={oldPrice}
          onChangeText={(t) => setOldPrice(digits(t))} error={errors.oldPrice}
          keyboardType="number-pad" placeholder="7800000"
        />
        {!!oldPrice && <Text style={styles.hint}>{formatPrice(Number(oldPrice))}</Text>}
      </View>

      <Text style={styles.section}>Tafsilotlar</Text>
      <FormField label="Mehmonxona" value={hotel} onChangeText={setHotel} placeholder="Masalan: 5★ kurort" />
      <FormField label="Ovqatlanish" value={meals} onChangeText={setMeals} placeholder="Masalan: All-inclusive" />
      <FormField label="Transport" value={transport} onChangeText={setTransport} placeholder="Masalan: Aviareys" />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <FormField label="Guruh" value={groupSize} onChangeText={setGroupSize} placeholder="20 kishi" />
        </View>
        <View style={{ flex: 1 }}>
          <FormField label="Til" value={language} onChangeText={setLanguage} placeholder="O'zbek, Rus" />
        </View>
      </View>

      <StringListEditor label="Narxga kiritilgan" items={included} onChange={setIncluded} placeholder="Masalan: Transfer" />
      <StringListEditor label="Narxga kiritilmagan" items={excluded} onChange={setExcluded} placeholder="Masalan: Viza" />

      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Hot tur</Text>
          <Text style={styles.hint}>Qaynoq turlar ro'yxatida va hikoyalarda ko'rsatiladi</Text>
        </View>
        <Switch
          value={hot}
          onValueChange={setHot}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.teal}
        />
      </View>

      <Text style={styles.section}>Tur dasturi</Text>
      <ItineraryEditor items={itinerary} maxDays={days} onChange={setItinerary} error={errors.itinerary} />

      {withDepartures && (
        <>
          <Text style={styles.section}>Jo'nash sanalari</Text>
          <DepartureEditor items={drafts} onChange={setDrafts} error={errors.departures} />
        </>
      )}

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <PrimaryButton label={submitLabel} onPress={submit} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  section: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: 8 },
  label: { fontSize: 13, fontWeight: "700", color: colors.text },
  hint: { fontSize: 12, color: colors.muted },
  row: { flexDirection: "row", gap: 12 },
  area: {
    minHeight: 110, padding: 14, borderRadius: 14, fontSize: 15, color: colors.text,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    ...noFocusOutline,
  },
  areaError: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  error: { fontSize: 12, color: colors.danger },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16, height: 38, borderRadius: 19, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center",
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: "700", color: colors.text },
  switchRow: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16,
    backgroundColor: colors.surface,
  },
  errorBox: { padding: 12, borderRadius: 12, backgroundColor: colors.dangerSoft },
  errorText: { fontSize: 13, fontWeight: "600", color: colors.danger },
});

