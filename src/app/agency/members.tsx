import { useState } from "react";
import {
  View, Text, FlatList, Pressable, Modal, ScrollView, RefreshControl,
  KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { useAgency } from "@/hooks/useAgency";
import {
  useCreateManager, useDeleteMember, useMembers, useSetMemberActive, useUpdateMember,
} from "@/hooks/useAgencyApi";
import { AgencyMember } from "@/services/agency";
import { isApiError } from "@/services/api";
import { rawPhone } from "@/services/auth";
import { confirmAction, notify } from "@/utils/confirm";
import { formatPhone, isStrongPassword, isValidEmail, isValidPhone } from "@/utils/validation";
import PasswordChecklist from "@/components/auth/PasswordChecklist";
import BackHeader from "@/components/ui/BackHeader";
import EmptyState from "@/components/ui/EmptyState";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { ListRowSkeleton } from "@/components/ui/Skeleton";

type FormErrors = Partial<Record<"first_name" | "last_name" | "email" | "phone" | "password", string>>;

const MAX_MEMBERS = 10;

const initials = (m: AgencyMember) =>
  `${m.first_name[0] ?? ""}${m.last_name[0] ?? ""}`.toUpperCase() || "?";

export default function AgencyMembersScreen() {
  const insets = useSafeAreaInsets();
  const { agencyRole, isOwner, isApproved } = useAgency();
  const { data: members = [], isPending, isError, error, refetch, isRefetching } = useMembers(isOwner);

  const create = useCreateManager();
  const update = useUpdateMember();
  const remove = useDeleteMember();
  const toggleActive = useSetMemberActive();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<AgencyMember | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  if (agencyRole && !isOwner) return <Redirect href="/agency/tours" />;

  const resetForm = () => {
    setErrors({});
    setFormError(null);
    setShowPass(false);
  };

  const openCreate = () => {
    setEditing(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("+998 ");
    setPassword("");
    resetForm();
    setSheetOpen(true);
  };

  const openEdit = (m: AgencyMember) => {
    setEditing(m);
    setFirstName(m.first_name);
    setLastName(m.last_name);
    setEmail(m.email);
    setPhone(formatPhone(m.phone));
    setPassword("");
    resetForm();
    setSheetOpen(true);
  };

  const onSave = () => {
    setFormError(null);
    const next: FormErrors = {};
    if (firstName.trim().length < 2) next.first_name = "Ismni kiriting";
    if (lastName.trim().length < 2) next.last_name = "Familiyani kiriting";
    if (!isValidEmail(email)) next.email = "Email noto'g'ri";
    if (!isValidPhone(phone)) next.phone = "Telefon raqamini to'liq kiriting";
    if (!editing && !isStrongPassword(password)) {
      next.password = "Parol kamida 8 ta belgi, harf va raqamdan iborat bo'lsin";
    }
    if (editing && password.length > 0 && !isStrongPassword(password)) {
      next.password = "Parol talablarga javob bermaydi";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const onError = (e: unknown) => {
      if (isApiError(e) && Object.keys(e.fieldErrors).length > 0) {
        setErrors(e.fieldErrors as FormErrors);
      } else {
        setFormError(isApiError(e) ? e.message : "Xatolik yuz berdi. Qayta urinib ko'ring.");
      }
    };

    if (editing) {
      update.mutate(
        {
          userId: editing.user_id,
          input: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim().toLowerCase(),
            phone: rawPhone(phone),
            ...(password ? { password } : {}),
          },
        },
        {
          onSuccess: () => setSheetOpen(false),
          onError,
        }
      );
      return;
    }

    create.mutate(
      {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: rawPhone(phone),
        password,
      },
      {
        onSuccess: () => setSheetOpen(false),
        onError,
      }
    );
  };

  const onToggle = async (m: AgencyMember) => {
    const nextActive = !m.is_active;
    const ok = await confirmAction({
      title: nextActive ? "Xodimni faollashtirish" : "Xodimni nofaol qilish",
      message: nextActive
        ? `${m.first_name} ${m.last_name} tizimga qayta kira oladi.`
        : `${m.first_name} ${m.last_name} tizimga kira olmaydi va joriy sessiyasi to'xtatiladi.`,
      confirmText: nextActive ? "Faollashtirish" : "Nofaol qilish",
      destructive: !nextActive,
    });
    if (!ok) return;

    toggleActive.mutate(
      { userId: m.user_id, active: nextActive },
      { onError: (e) => notify("Bajarilmadi", isApiError(e) ? e.message : "Qayta urinib ko'ring.") }
    );
  };

  const onDelete = async (m: AgencyMember) => {
    const ok = await confirmAction({
      title: "Xodimni o'chirish",
      message: `${m.first_name} ${m.last_name} agentlik xodimlari ro'yxatidan o'chiriladi.`,
      confirmText: "O'chirish",
      destructive: true,
    });
    if (!ok) return;

    remove.mutate(m.user_id, {
      onError: (e) => notify("O'chirib bo'lmadi", isApiError(e) ? e.message : "Qayta urinib ko'ring."),
    });
  };

  const canAddMore = isApproved && members.length < MAX_MEMBERS;
  const saving = create.isPending || update.isPending;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <BackHeader
        title="Xodimlar"
        right={
          <View style={styles.countPill}>
            <Text style={styles.countText}>{members.length}/{MAX_MEMBERS}</Text>
          </View>
        }
      />

      {!isApproved && (
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
          <Text style={styles.noticeText}>
            Yangi menejer qo'shish uchun agentlik admin tomonidan tasdiqlangan bo'lishi kerak.
          </Text>
        </View>
      )}

      <FlatList
        data={members}
        keyExtractor={(m) => m.user_id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => {
          const isMemberOwner = item.role === "owner";
          const busy =
            (toggleActive.isPending && toggleActive.variables?.userId === item.user_id) ||
            (remove.isPending && remove.variables === item.user_id);

          return (
            <View style={[styles.card, !item.is_active && { opacity: 0.68 }]}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(item)}</Text>
                </View>

                <View style={{ flex: 1, gap: 3 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.first_name} {item.last_name}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: isMemberOwner ? colors.primarySoft : colors.surface },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: isMemberOwner ? colors.primary : colors.text },
                        ]}
                      >
                        {isMemberOwner ? "Egasi" : "Menejer"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.muted} numberOfLines={1}>{item.email}</Text>
                  <Text style={styles.muted}>{formatPhone(item.phone)}</Text>
                </View>

                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: item.is_active ? colors.success : colors.danger },
                  ]}
                />
              </View>

              {!isMemberOwner && (
                <View style={styles.cardActions}>
                  <Pressable style={styles.actionBtn} onPress={() => openEdit(item)} disabled={busy}>
                    <Ionicons name="create-outline" size={16} color={colors.text} />
                    <Text style={styles.actionText}>Tahrirlash</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.actionBtn,
                      { backgroundColor: item.is_active ? colors.warningSoft : colors.successSoft },
                    ]}
                    onPress={() => onToggle(item)}
                    disabled={busy}
                  >
                    <Ionicons
                      name={item.is_active ? "pause-circle-outline" : "play-circle-outline"}
                      size={16}
                      color={item.is_active ? colors.warning : colors.success}
                    />
                    <Text
                      style={[
                        styles.actionText,
                        { color: item.is_active ? colors.warning : colors.success },
                      ]}
                    >
                      {item.is_active ? "Nofaol qilish" : "Faollashtirish"}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[styles.iconDelete, { backgroundColor: colors.dangerSoft }]}
                    onPress={() => onDelete(item)}
                    disabled={busy}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </Pressable>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          isPending ? (
            <View>
              <ListRowSkeleton />
              <ListRowSkeleton />
              <ListRowSkeleton />
            </View>
          ) : isError ? (
            <View style={styles.empty}>
              <EmptyState
                icon="cloud-offline-outline"
                title="Yuklab bo'lmadi"
                text={isApiError(error) ? error.message : "Qayta urinib ko'ring."}
                actionLabel="Qayta urinish"
                onAction={() => refetch()}
              />
            </View>
          ) : (
            <View style={styles.empty}>
              <EmptyState
                icon="people-outline"
                title="Xodimlar yo'q"
                text="Turlar, bronlar va chatlarni boshqarish uchun menejer qo'shishingiz mumkin."
              />
            </View>
          )
        }
      />

      {canAddMore && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <PrimaryButton label="Menejer qo'shish" icon="person-add-outline" onPress={openCreate} />
        </View>
      )}

      {/* ---------- Qo'shish / Tahrirlash oynasi */}
      <Modal
        visible={sheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSheetOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>
                {editing ? "Xodimni tahrirlash" : "Yangi menejer"}
              </Text>
              <Pressable onPress={() => setSheetOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetForm}
            >
              <FormField
                label="Ism" icon="person-outline" value={firstName}
                onChangeText={setFirstName} error={errors.first_name}
                placeholder="Ism" autoCapitalize="words"
              />
              <FormField
                label="Familiya" icon="person-outline" value={lastName}
                onChangeText={setLastName} error={errors.last_name}
                placeholder="Familiya" autoCapitalize="words"
              />
              <FormField
                label="Email" icon="mail-outline" value={email}
                onChangeText={setEmail} error={errors.email}
                placeholder="manager@example.uz" keyboardType="email-address" autoCapitalize="none"
              />
              <FormField
                label="Telefon" icon="call-outline" value={phone}
                onChangeText={(t) => setPhone(formatPhone(t))} error={errors.phone}
                placeholder="+998 90 123 45 67" keyboardType="phone-pad"
              />
              <View style={{ gap: 8 }}>
                <FormField
                  label={editing ? "Yangi parol (ixtiyoriy)" : "Parol"}
                  icon="lock-closed-outline"
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                  placeholder={editing ? "O'zgartirish uchun kiriting" : "Kamida 8 ta belgi"}
                  secureTextEntry={!showPass}
                  right={
                    <Pressable onPress={() => setShowPass((v) => !v)} hitSlop={8}>
                      <Ionicons
                        name={showPass ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={colors.muted}
                      />
                    </Pressable>
                  }
                />
                {(!editing || password.length > 0) && <PasswordChecklist password={password} />}
              </View>

              {formError && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color={colors.danger} />
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              )}

              <PrimaryButton
                label={editing ? "Saqlash" : "Qo'shish"}
                onPress={onSave}
                loading={saving}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  countPill: {
    paddingHorizontal: 12, height: 28, borderRadius: radius.pill,
    backgroundColor: colors.primarySoft, justifyContent: "center",
  },
  countText: { fontSize: 13, fontWeight: "800", color: colors.primary },
  notice: {
    flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginTop: 12,
    padding: 12, borderRadius: radius.lg, backgroundColor: colors.warningSoft,
  },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.text, fontWeight: "600" },
  list: { padding: 16, paddingBottom: 24, flexGrow: 1 },
  empty: { flex: 1, justifyContent: "center", paddingVertical: 60 },
  card: {
    padding: 14, gap: 12, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background, ...shadows.soft,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "800", color: colors.primary },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 15, fontWeight: "800", color: colors.text, flexShrink: 1 },
  badge: { paddingHorizontal: 9, height: 22, borderRadius: radius.pill, justifyContent: "center" },
  badgeText: { fontSize: 11, fontWeight: "700" },
  muted: { fontSize: 12, color: colors.muted },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  cardActions: {
    flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
  },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    height: 38, borderRadius: radius.pill, backgroundColor: colors.surface,
  },
  actionText: { fontSize: 12, fontWeight: "700", color: colors.text },
  iconDelete: {
    width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center",
  },
  footer: {
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border, backgroundColor: colors.background,
  },
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    maxHeight: "88%", paddingHorizontal: 16, paddingTop: 10, gap: 12,
    borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background,
  },
  handle: { alignSelf: "center", width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border },
  sheetHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: colors.text },
  sheetForm: { gap: 14, paddingBottom: 12 },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8, padding: 12,
    borderRadius: radius.md, backgroundColor: colors.dangerSoft,
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.danger },
});
