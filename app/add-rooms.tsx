import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useAuth } from "@/provider/AuthProvider";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Clock,
  Users,
  BedDouble,
  AlignLeft,
  IndianRupee,
  Percent,
  Wifi,
  Image as ImageIcon,
  Building,
  ChevronDown,
  Plus,
  X,
  Check,
  Trash2,
} from "lucide-react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const COLORS = {
  primary: "#4F6EF7",
  primaryLight: "rgba(79, 110, 247, 0.1)",
  background: "#F8FAFC",
  card: "#FFFFFF",
  textActive: "#1E293B",
  textMuted: "#64748B",
  textLight: "#94A3B8",
  border: "#E2E8F0",
  danger: "#EF4444",
  dangerLight: "rgba(239, 68, 68, 0.1)",
  success: "#10B981",
  successLight: "#D1FAE5",
};

const TIME_OPTIONS = Array.from({ length: 48 }).map((_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

interface Property {
  id: string;
  property_name: string;
}

interface Category {
  id: string;
  category_name: string;
  description: string | null;
  image_url: string | null;
}

interface RoomEntry {
  id: string;
  room_category_id: string;
  room_description: string;
  bed_count: string;
  room_capacity: string;
  extra_bed_capacity: string;
  base_price: string;
  extra_bed_price: string;
  discount_percentage: string;
  amenities: string;
  check_in_time: string;
  check_out_time: string;
}

const INITIAL_ROOM: RoomEntry = {
  id: "1",
  room_category_id: "",
  room_description: "",
  bed_count: "",
  room_capacity: "",
  extra_bed_capacity: "",
  base_price: "",
  extra_bed_price: "",
  discount_percentage: "",
  amenities: "",
  check_in_time: "14:00",
  check_out_time: "11:00",
};

// ─── UI Components ────────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: any) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrapper}>
          <Icon size={18} color={COLORS.primary} strokeWidth={2.5} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  numeric = false,
  optional = false,
  multiline = false,
  icon: Icon,
}: any) {
  return (
    <View style={styles.fieldWrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional && <Text style={styles.optionalTag}>optional</Text>}
      </View>
      <View style={[styles.inputContainer, multiline && styles.inputContainerMultiline]}>
        {Icon && (
          <View style={styles.inputIcon}>
            <Icon size={18} color={COLORS.textLight} />
          </View>
        )}
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline, Icon && { paddingLeft: 40 }]}
          placeholder={placeholder ?? label}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChange}
          keyboardType={numeric ? "numeric" : "default"}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      </View>
    </View>
  );
}

function TimePickerField({ label, value, onChange, icon: Icon }: any) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldWrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
      </View>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        {Icon && (
          <View style={styles.inputIcon}>
            <Icon size={18} color={COLORS.textLight} />
          </View>
        )}
        <Text style={[styles.input, { lineHeight: 46 }, Icon && { paddingLeft: 40 }]}>
          {value || "Select Time"}
        </Text>
        <View style={styles.dropdownIcon}>
          <ChevronDown size={18} color={COLORS.textLight} />
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Select {label}</Text>
          <FlatList
            data={TIME_OPTIONS}
            keyExtractor={(item) => item}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
            renderItem={({ item }) => {
              const isSelected = item === value;
              return (
                <TouchableOpacity
                  style={[styles.timeOption, isSelected && styles.timeOptionSelected]}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.timeOptionText, isSelected && styles.timeOptionTextSelected]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

function ImagePickerField({ label, images, onChange, optional }: any) {
  const pick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      onChange([...images, ...result.assets.map((a) => a.uri)]);
    }
  };
  const remove = (uri: string) => onChange(images.filter((i: string) => i !== uri));

  return (
    <View style={styles.fieldWrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional && <Text style={styles.optionalTag}>optional</Text>}
        <Text style={styles.imageCount}>{images.length} selected</Text>
      </View>

      {images.length > 0 && (
        <FlatList
          data={images}
          horizontal
          keyExtractor={(uri) => uri}
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailList}
          renderItem={({ item }) => (
            <View style={styles.thumbnailWrapper}>
              <Image source={{ uri: item }} style={styles.thumbnail} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => remove(item)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <X size={12} color="#FFF" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      <TouchableOpacity style={styles.pickButton} onPress={pick} activeOpacity={0.7}>
        <Plus size={18} color={COLORS.primary} />
        <Text style={styles.pickButtonText}>Add Photos</Text>
      </TouchableOpacity>
    </View>
  );
}

function CustomDropdown({ items, value, onChange, loading, label, icon: Icon, placeholder }: any) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i: any) => i.id === value);

  return (
    <View style={styles.fieldWrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
      </View>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        disabled={loading}
      >
        {Icon && (
          <View style={styles.inputIcon}>
            <Icon size={18} color={COLORS.textLight} />
          </View>
        )}
        <View style={[styles.dropdownSelected, Icon && { paddingLeft: 40 }]}>
          {loading ? (
            <Text style={styles.dropdownPlaceholder}>Loading...</Text>
          ) : selected ? (
            <>
              {selected.image_url && (
                <Image source={{ uri: `${API_BASE_URL}${selected.image_url}` }} style={styles.dropdownCategoryThumb} />
              )}
              <Text style={styles.dropdownSelectedText}>
                {selected.category_name || selected.property_name}
              </Text>
            </>
          ) : (
            <Text style={styles.dropdownPlaceholder}>{placeholder}</Text>
          )}
        </View>
        <View style={styles.dropdownIcon}>
          <ChevronDown size={18} color={COLORS.textLight} />
        </View>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Select {label}</Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
            {items.map((item: any) => {
              const isSelected = item.id === value;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.categoryRow, isSelected && styles.categoryRowSelected]}
                  onPress={() => { onChange(item.id); setOpen(false); }}
                  activeOpacity={0.7}
                >
                  {item.image_url && <Image source={{ uri: `${API_BASE_URL}${item.image_url}` }} style={styles.categoryRowThumb} />}
                  <View style={styles.categoryRowText}>
                    <Text style={[styles.categoryRowName, isSelected && styles.categoryRowNameSelected]}>
                      {item.category_name || item.property_name}
                    </Text>
                  </View>
                  {isSelected && <Check size={20} color={COLORS.primary} strokeWidth={3} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AddRooms() {
  const { token } = useAuth();
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [propertyId, setPropertyId] = useState<string>("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  const [rooms, setRooms] = useState<RoomEntry[]>([{ ...INITIAL_ROOM }]);
  const [roomImages, setRoomImages] = useState<string[]>([]);
  
  const [roomCategories, setRoomCategories] = useState<Category[]>([]);
  const [roomCategoriesLoading, setRoomCategoriesLoading] = useState(true);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/host/properties`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && Array.isArray(res.data.properties)) {
          setProperties(res.data.properties);
        }
      } catch (e) {
        console.error("Failed to fetch properties:", e);
      } finally {
        setPropertiesLoading(false);
      }
    };
    if (token) fetchProperties();
  }, [token]);

  useEffect(() => {
    const fetchRoomCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/public/categories/rooms`);
        if (res.data && res.data.categories) {
          setRoomCategories(res.data.categories);
        }
      } catch (e) {
        console.error("Failed to fetch room categories", e);
      } finally {
        setRoomCategoriesLoading(false);
      }
    };
    fetchRoomCategories();
  }, []);

  const addRoom = () => setRooms(prev => [...prev, { ...INITIAL_ROOM, id: Date.now().toString() }]);
  const updateRoom = (id: string, field: keyof RoomEntry, value: string) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };
  const removeRoom = (id: string) => setRooms(prev => prev.filter(r => r.id !== id));

  const handleSubmit = async () => {
    if (!propertyId) {
      Alert.alert("Validation Error", "Please select a property first.");
      return;
    }

    const roomsData = rooms
      .filter((r) => r.room_category_id && r.room_capacity && r.base_price)
      .map((r) => ({
        room_category_id: r.room_category_id,
        room_description: r.room_description || null,
        bed_count: r.bed_count ? Number(r.bed_count) : null,
        room_capacity: Number(r.room_capacity),
        extra_bed_capacity: r.extra_bed_capacity ? Number(r.extra_bed_capacity) : null,
        base_price: Number(r.base_price),
        extra_bed_price: r.extra_bed_price ? Number(r.extra_bed_price) : null,
        discount_percentage: r.discount_percentage ? Number(r.discount_percentage) : null,
        tax_percentage: 12,
        admin_commission: 10,
        payment_gateway_commission: 5,
        check_in_time: r.check_in_time,
        check_out_time: r.check_out_time,
        amenities: r.amenities ? r.amenities.split(",").map((a) => a.trim()).filter(Boolean) : [],
      }));

    if (roomsData.length === 0) {
      Alert.alert("Validation Error", "Please fill out at least one room (Category, Capacity, Base Price).");
      return;
    }

    if (roomImages.length === 0) {
      Alert.alert("Validation Error", "Please provide at least one room image.");
      return;
    }

    const formData = new FormData();
    formData.append("rooms", JSON.stringify(roomsData));

    roomImages.forEach((uri, index) => {
      const filename = uri.split("/").pop() ?? `room_${index}.jpg`;
      const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
      const mime = ext === "png" ? "image/png" : "image/jpeg";
      formData.append("room_images", { uri, name: filename, type: mime } as any);
    });

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/host/properties/${propertyId}/rooms`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setShowSuccess(true);
      setRooms([{ ...INITIAL_ROOM }]);
      setRoomImages([]);
      setPropertyId("");
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.error || error?.response?.data?.message || error?.message || "Failed to add rooms.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Add Rooms</Text>
        <Text style={styles.pageSubtitle}>Expand your property with new room listings.</Text>

        <Section title="Property Details" icon={Building}>
          <CustomDropdown
            items={properties}
            value={propertyId}
            onChange={setPropertyId}
            loading={propertiesLoading}
            label="Target Property"
            icon={Building}
            placeholder="Select a property"
          />
        </Section>

        <Section title="Global Gallery" icon={ImageIcon}>
          <ImagePickerField
            label="Room Images (Applies to all)"
            images={roomImages}
            onChange={setRoomImages}
          />
        </Section>

        {rooms.map((room, index) => (
          <View key={room.id} style={styles.roomCard}>
            <View style={styles.roomCardHeader}>
              <View style={styles.roomBadge}>
                <Text style={styles.roomBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.roomCardTitle}>Room Details</Text>
              {rooms.length > 1 && (
                <TouchableOpacity style={styles.roomCardRemoveBtn} onPress={() => removeRoom(room.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Trash2 size={16} color={COLORS.danger} />
                </TouchableOpacity>
              )}
            </View>

            <CustomDropdown
              items={roomCategories}
              value={room.room_category_id}
              onChange={(id: string) => updateRoom(room.id, "room_category_id", id)}
              loading={roomCategoriesLoading}
              label="Room Category"
              icon={AlignLeft}
              placeholder="Select category"
            />

            <Field
              label="Description"
              value={room.room_description}
              onChange={(val: string) => updateRoom(room.id, "room_description", val)}
              optional
              multiline
              icon={AlignLeft}
            />

            <View style={styles.roomRow}>
              <View style={styles.roomRowField}>
                <Field label="Capacity" value={room.room_capacity} onChange={(val: string) => updateRoom(room.id, "room_capacity", val)} numeric icon={Users} />
              </View>
              <View style={styles.roomRowField}>
                <Field label="Bed Count" value={room.bed_count} onChange={(val: string) => updateRoom(room.id, "bed_count", val)} numeric optional icon={BedDouble} />
              </View>
            </View>

            <View style={styles.roomRow}>
              <View style={styles.roomRowField}>
                <Field label="Base Price" value={room.base_price} onChange={(val: string) => updateRoom(room.id, "base_price", val)} numeric icon={IndianRupee} />
              </View>
              <View style={styles.roomRowField}>
                <Field label="Discount %" value={room.discount_percentage} onChange={(val: string) => updateRoom(room.id, "discount_percentage", val)} numeric optional icon={Percent} />
              </View>
            </View>

            <View style={styles.roomRow}>
              <View style={styles.roomRowField}>
                <Field label="Extra Bed Cap." value={room.extra_bed_capacity} onChange={(val: string) => updateRoom(room.id, "extra_bed_capacity", val)} numeric optional icon={Users} />
              </View>
              <View style={styles.roomRowField}>
                <Field label="Extra Bed Price" value={room.extra_bed_price} onChange={(val: string) => updateRoom(room.id, "extra_bed_price", val)} numeric optional icon={IndianRupee} />
              </View>
            </View>

            <Field
              label="Amenities"
              placeholder="Wifi, AC, TV (comma separated)"
              value={room.amenities}
              onChange={(val: string) => updateRoom(room.id, "amenities", val)}
              icon={Wifi}
            />

            <View style={styles.roomRow}>
              <View style={styles.roomRowField}>
                <TimePickerField label="Check-in Time" value={room.check_in_time} onChange={(val: string) => updateRoom(room.id, "check_in_time", val)} icon={Clock} />
              </View>
              <View style={styles.roomRowField}>
                <TimePickerField label="Check-out Time" value={room.check_out_time} onChange={(val: string) => updateRoom(room.id, "check_out_time", val)} icon={Clock} />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addRoomBtn} onPress={addRoom} activeOpacity={0.7}>
          <Plus size={20} color={COLORS.primary} strokeWidth={2.5} />
          <Text style={styles.addRoomBtnText}>Add Another Room</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
          <Text style={styles.submitText}>{loading ? "Submitting..." : "Save Rooms"}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconWrapper}>
              <Check size={32} color={COLORS.success} strokeWidth={3} />
            </View>
            <Text style={styles.successTitle}>Rooms Added!</Text>
            <Text style={styles.successMessage}>
              Your rooms have been successfully configured and added to the property.
            </Text>
            <TouchableOpacity style={styles.successButton} onPress={() => setShowSuccess(false)} activeOpacity={0.8}>
              <Text style={styles.successButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 60 },
  pageTitle: { fontSize: 26, fontWeight: "800", color: COLORS.textActive, marginBottom: 4 },
  pageSubtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 24 },

  section: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  sectionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textActive },

  fieldWrapper: { marginBottom: 18 },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.textActive },
  optionalTag: { marginLeft: 8, fontSize: 11, color: COLORS.textLight, fontWeight: "500", backgroundColor: "#F1F5F9", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  imageCount: { marginLeft: "auto", fontSize: 11, color: COLORS.primary, fontWeight: "600", backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  
  inputContainer: { position: "relative", justifyContent: "center" },
  inputContainerMultiline: { height: 100 },
  inputIcon: { position: "absolute", left: 14, zIndex: 1 },
  dropdownIcon: { position: "absolute", right: 14, zIndex: 1 },
  
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textActive,
    backgroundColor: "#F8FAFC",
    fontWeight: "500",
  },
  inputMultiline: { height: "100%", textAlignVertical: "top", paddingTop: 14 },
  
  dropdownSelected: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F8FAFC",
  },
  dropdownSelectedText: { fontSize: 15, color: COLORS.textActive, fontWeight: "500", marginLeft: 8 },
  dropdownPlaceholder: { fontSize: 15, color: COLORS.textLight, fontWeight: "500" },
  dropdownCategoryThumb: { width: 24, height: 24, borderRadius: 6, backgroundColor: "#E2E8F0" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.4)" },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHandle: { width: 40, height: 5, backgroundColor: "#CBD5E1", borderRadius: 3, alignSelf: "center", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textActive, marginBottom: 20 },
  
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryRowSelected: { backgroundColor: COLORS.primaryLight, borderColor: "rgba(79, 110, 247, 0.2)" },
  categoryRowThumb: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#E2E8F0", marginRight: 12 },
  categoryRowText: { flex: 1 },
  categoryRowName: { fontSize: 15, fontWeight: "600", color: COLORS.textActive },
  categoryRowNameSelected: { color: COLORS.primary },

  timeOption: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeOptionSelected: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  timeOptionText: { fontSize: 14, fontWeight: "600", color: COLORS.textMuted },
  timeOptionTextSelected: { color: COLORS.primary },

  thumbnailList: { marginBottom: 12 },
  thumbnailWrapper: { position: "relative", marginRight: 12 },
  thumbnail: { width: 80, height: 80, borderRadius: 14, backgroundColor: "#E2E8F0" },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  pickButton: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    borderRadius: 14,
    borderStyle: "dashed",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
    gap: 8,
  },
  pickButtonText: { fontSize: 14, color: COLORS.primary, fontWeight: "600" },

  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonDisabled: { backgroundColor: COLORS.textLight, shadowOpacity: 0 },
  submitText: { color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },

  roomCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  roomCardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  roomBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.textActive,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  roomBadgeText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  roomCardTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textActive, flex: 1 },
  roomCardRemoveBtn: { padding: 6, backgroundColor: COLORS.dangerLight, borderRadius: 8 },
  roomRow: { flexDirection: "row", gap: 14 },
  roomRowField: { flex: 1 },

  addRoomBtn: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    borderRadius: 16,
    borderStyle: "dashed",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(79, 110, 247, 0.02)",
    marginBottom: 24,
    gap: 10,
  },
  addRoomBtnText: { fontSize: 15, color: COLORS.primary, fontWeight: "700" },

  successModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  successModalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 28,
    padding: 32,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
  },
  successIconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.successLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: { fontSize: 22, fontWeight: "800", color: COLORS.textActive, marginBottom: 12 },
  successMessage: { fontSize: 15, color: COLORS.textMuted, textAlign: "center", marginBottom: 30, lineHeight: 22 },
  successButton: { backgroundColor: COLORS.success, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 14, width: "100%" },
  successButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", textAlign: "center" },
});
