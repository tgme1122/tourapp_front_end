import ConversationListScreen from "@/components/messages/ConversationListScreen";

export default function AgencyMessagesScreen() {
  return (
    <ConversationListScreen
      emptyText="Mijozlar yozganda suhbatlar shu yerda ko'rinadi. Suhbatni mijoz boshlaydi."
      searchPlaceholder="Mijoz yoki tur bo'yicha qidiring"
    />
  );
}