import axios from "axios";

import * as ImagePicker from "expo-image-picker";

import React, { useEffect, useState } from "react";

import Header from "../components/Header";
import AlertPopUp, { AlertType } from "@/components/AlertPopUp";

import * as Location from "expo-location";

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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface AlertState {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

const ALERT_HIDDEN: AlertState = {
  visible: false,
  type: "info",
  title: "",
  message: "",
};

interface Category {
  id: string;
  category_name: string;
  description: string | null;
  image_url: string | null;
}



interface PropertyForm {
  property_name: string;
  category_id: string;
  address_display: string;
  state: string;
  city: string;
  district: string;
  village: string;
  pincode: string;
  post_office: string;
  latitude: string;
  longitude: string;
}

type FormKey = keyof PropertyForm;

const INITIAL_FORM: PropertyForm = {
  property_name: "",
  category_id: "",
  address_display: "",
  state: "",
  city: "",
  district: "",
  village: "",
  pincode: "",
  post_office: "",
  latitude: "",
  longitude: "",
};

const REQUIRED_FIELDS: FormKey[] = [
  "property_name",
  "category_id",
  "state",
  "city",
  "district",
  "pincode",
  "latitude",
  "longitude",
];

function validate(form: PropertyForm, propertyImages: string[]): string | null {
  for (const key of REQUIRED_FIELDS) {
    const val = form[key] as any;
    if (!val || (typeof val === 'string' && val.trim() === "")) {
      return `${key.replace(/_/g, " ")} is required`;
    }
  }
  if (isNaN(Number(form.pincode))) return "Pincode must be a number";
  if (propertyImages.length === 0)
    return "At least one property image is required";
  return null;
}

function buildFormData(form: PropertyForm, propertyImages: string[]): FormData {
  const data = new FormData();

  (Object.keys(form) as FormKey[]).forEach((key) => {
    if (form[key]) {
      data.append(key, form[key] as string);
    }
  });



  propertyImages.forEach((uri, index) => {
    const filename = uri.split("/").pop() ?? `property_${index}.jpg`;
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const mime = ext === "png" ? "image/png" : "image/jpeg";
    data.append("property_images", {
      uri,
      name: filename,
      type: mime,
    } as unknown as Blob);
  });

  return data;
}



async function getCurrentLocation(): Promise<{
  lat: string;
  lng: string;
  error?: string;
} | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    return { lat: "", lng: "", error: "Allow location access to auto-fill coordinates." };
  }
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return {
    lat: location.coords.latitude.toFixed(6),
    lng: location.coords.longitude.toFixed(6),
  };
}

interface CategoryDropdownProps {
  categories: Category[];
  value: string; // selected category_id
  onChange: (id: string) => void;
  loading: boolean;
  label?: string;
}

function CategoryDropdown({
  categories,
  value,
  onChange,
  loading,
  label = "Category",
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);

  const selected = categories.find((c) => c.id === value);

  return (
    <View style={styles.fieldWrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
      </View>

      {/* Trigger */}
      <TouchableOpacity
        style={[styles.input, styles.dropdownTrigger]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        disabled={loading}
      >
        {loading ? (
          <Text style={styles.dropdownPlaceholder}>Loading categories...</Text>
        ) : selected ? (
          <View style={styles.dropdownSelected}>
            {selected.image_url && (
              <Image
                source={{ uri: `${API_BASE_URL}${selected.image_url}` }}
                style={styles.dropdownCategoryThumb}
              />
            )}
            <Text style={styles.dropdownSelectedText}>
              {selected.category_name}
            </Text>
          </View>
        ) : (
          <Text style={styles.dropdownPlaceholder}>Select a category</Text>
        )}
        <Text style={styles.dropdownChevron}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Modal Sheet */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Select Category</Text>

          {categories.map((cat) => {
            const isSelected = cat.id === value;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryRow,
                  isSelected && styles.categoryRowSelected,
                ]}
                onPress={() => {
                  onChange(cat.id);
                  setOpen(false);
                }}
                activeOpacity={0.7}
              >
                {cat.image_url && (
                  <Image
                    source={{ uri: `${API_BASE_URL}${cat.image_url}` }}
                    style={styles.categoryRowThumb}
                  />
                )}
                <View style={styles.categoryRowText}>
                  <Text
                    style={[
                      styles.categoryRowName,
                      isSelected && styles.categoryRowNameSelected,
                    ]}
                  >
                    {cat.category_name}
                  </Text>
                  {cat.description && (
                    <Text style={styles.categoryRowDesc} numberOfLines={1}>
                      {cat.description}
                    </Text>
                  )}
                </View>
                {isSelected && <Text style={styles.categoryRowCheck}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>
    </View>
  );
}

interface ImagePickerFieldProps {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  optional?: boolean;
  onError?: (msg: string) => void;
}

function ImagePickerField({
  label,
  images,
  onChange,
  optional,
  onError,
}: ImagePickerFieldProps) {
  const pick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      if (onError) onError("Allow access to your photo library.");
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

  const remove = (uri: string) => onChange(images.filter((i) => i !== uri));

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
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => remove(item)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.pickButton}
        onPress={pick}
        activeOpacity={0.7}
      >
        <Text style={styles.pickButtonText}>+ Add Photos</Text>
      </TouchableOpacity>
    </View>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  numeric?: boolean;
  optional?: boolean;
  multiline?: boolean;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  numeric = false,
  optional = false,
  multiline = false,
}: FieldProps) {
  return (
    <View style={styles.fieldWrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional && <Text style={styles.optionalTag}>optional</Text>}
      </View>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholder={placeholder ?? label}
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={onChange}
        keyboardType={numeric ? "numeric" : "default"}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionDivider} />
      {children}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AddProperty() {

  const [alert, setAlert] = useState<AlertState>(ALERT_HIDDEN);
  const dismissAlert = () => setAlert((a) => ({ ...a, visible: false }));
  const showAlert = (config: Omit<AlertState, "visible">) =>
    setAlert({ ...config, visible: true });

  const [form, setForm] = useState<PropertyForm>(INITIAL_FORM);

  const [propertyImages, setPropertyImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);

  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const { token } = useAuth();


  const [locationLoading, setLocationLoading] = useState(false);

  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const coords = await getCurrentLocation();
      if (coords?.error) {
        showAlert({
          type: "error",
          title: "Permission Denied",
          message: coords.error,
          primaryLabel: "OK",
          onPrimary: dismissAlert,
        });
      } else if (coords) {
        setForm((prev) => ({
          ...prev,
          latitude: coords.lat,
          longitude: coords.lng,
        }));
      }
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/public/categories`);
        if (res.data && res.data.categories) {
          setCategories(res.data.categories);
        }
      } catch {
        showAlert({
          type: "error",
          title: "Error",
          message: "Failed to load categories.",
          primaryLabel: "OK",
          onPrimary: dismissAlert,
        });
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);



  const set = (key: FormKey) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));



  const handleSubmit = async () => {
    const error = validate(form, propertyImages);

    if (error) {
      showAlert({
        type: "warning",
        title: "Validation Error",
        message: error,
        primaryLabel: "Got it",
        onPrimary: dismissAlert,
      });
      return;
    }

    setLoading(true);

    try {
      const formData = buildFormData(form, propertyImages);

      const response = await axios.post(
        `${API_BASE_URL}/api/host/properties/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("Property Created:", response.data);

      showAlert({
        type: "success",
        title: "Success",
        message: "Property created successfully!",
        primaryLabel: "OK",
        onPrimary: () => {
          setForm(INITIAL_FORM);
          setPropertyImages([]);
          dismissAlert();
        },
      });
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.log("🚨 Axios Error");
        console.log("Message:", error.message);

        if (error.response) {
          console.log("Status:", error.response.status);

          console.log(
            "Response:",
            JSON.stringify(error.response.data, null, 2),
          );
        }

        if (error.request) {
          console.log("Request made but no response received");
          console.log(error.request);
        }

        console.log(
          "Config:",
          JSON.stringify(
            {
              url: error.config?.url,
              method: error.config?.method,
              headers: error.config?.headers,
            },
            null,
            2,
          ),
        );
      } else {
        console.log("Unexpected Error:", error);
      }

      showAlert({
        type: "error",
        title: "Error",
        message: error?.response?.data?.message || error?.message || "Something went wrong.",
        primaryLabel: "Retry",
        onPrimary: dismissAlert,
      });
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
        {/* ── Property Info ── */}
        <Section title="Property Info">
          <Field
            label="Property Name"
            value={form.property_name}
            onChange={set("property_name")}
            placeholder="e.g. Sunset Villa"
          />

          <CategoryDropdown
            categories={categories}
            value={form.category_id}
            onChange={(id) => setForm((prev) => ({ ...prev, category_id: id }))}
            loading={categoriesLoading}
          />

          <Field
            label="Display Address"
            value={form.address_display}
            onChange={set("address_display")}
            optional
          />

          <ImagePickerField
            label="Property Images"
            images={propertyImages}
            onChange={setPropertyImages}
            onError={(msg) => showAlert({
              type: "warning",
              title: "Permission required",
              message: msg,
              primaryLabel: "OK",
              onPrimary: dismissAlert,
            })}
          />
        </Section>

        <Section title="Location">
          <Field label="State" value={form.state} onChange={set("state")} />
          <Field label="City" value={form.city} onChange={set("city")} />
          <Field
            label="District"
            value={form.district}
            onChange={set("district")}
          />
          <Field
            label="Village"
            value={form.village}
            onChange={set("village")}
            optional
          />
          <Field
            label="Pincode"
            value={form.pincode}
            onChange={set("pincode")}
            numeric
          />
          <Field
            label="Post Office"
            value={form.post_office}
            onChange={set("post_office")}
            optional
          />

          {/* ── Coordinates ── */}
          <View style={styles.fieldWrapper}>
            {/* Label row with GPS button */}
            <View style={styles.labelRow}>
              <Text style={styles.label}>Coordinates</Text>
              <TouchableOpacity
                style={[
                  styles.locationBtn,
                  locationLoading && styles.locationBtnDisabled,
                ]}
                onPress={handleGetLocation}
                disabled={locationLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.locationBtnText}>
                  {locationLoading ? "Fetching..." : "📍 Use Current Location"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Side-by-side lat/lng inputs */}
            <View style={styles.coordRow}>
              <View style={styles.coordField}>
                <Text style={styles.coordLabel}>Latitude</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 26.748819"
                  placeholderTextColor="#aaa"
                  value={form.latitude}
                  onChangeText={set("latitude")}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.coordField}>
                <Text style={styles.coordLabel}>Longitude</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 94.209869"
                  placeholderTextColor="#aaa"
                  value={form.longitude}
                  onChangeText={set("longitude")}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </Section>



        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.submitText}>
            {loading ? "Creating..." : "Create Property"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <AlertPopUp
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        primaryLabel={alert.primaryLabel}
        secondaryLabel={alert.secondaryLabel}
        onPrimary={alert.onPrimary}
        onSecondary={alert.onSecondary}
        onDismiss={dismissAlert}
      />
    </KeyboardAvoidingView>
  );
}


const COLORS = {
  primary: "#4F6EF7",
  activeBg: "#F1F5F9",
  activeText: "#4F6EF7",
  inactiveText: "#475569",
  border: "#F1F5F9",
  danger: "#EF4444",
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 48 },
  // Add these to your StyleSheet
  locationBtn: {
    marginLeft: "auto",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  locationBtnDisabled: {
    backgroundColor: COLORS.inactiveText,
  },
  locationBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
  },
  coordRow: {
    flexDirection: "row",
    gap: 10,
  },
  coordField: {
    flex: 1,
  },
  coordLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 5,
    fontWeight: "400",
  },
  heading: {
    // Deprecated
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.inactiveText,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  sectionDivider: { height: 1, backgroundColor: COLORS.activeBg, marginBottom: 16 },

  fieldWrapper: { marginBottom: 16 },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.inactiveText },
  optionalTag: {
    marginLeft: 6,
    fontSize: 11,
    color: COLORS.inactiveText,
    fontWeight: "400",
  },
  imageCount: { marginLeft: "auto", fontSize: 11, color: COLORS.inactiveText },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.inactiveText,
    backgroundColor: COLORS.activeBg,
  },
  inputMultiline: { height: 80, textAlignVertical: "top" },

  // Dropdown
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownSelected: { flexDirection: "row", alignItems: "center", gap: 8 },
  dropdownSelectedText: { fontSize: 15, color: COLORS.activeText, fontWeight: "500" },
  dropdownPlaceholder: { fontSize: 15, color: COLORS.inactiveText },
  dropdownChevron: { fontSize: 11, color: COLORS.inactiveText },
  dropdownCategoryThumb: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#eee",
  },

  // Modal Sheet
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.inactiveText,
    marginBottom: 16,
  },

  // Category rows in modal
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
    gap: 12,
  },
  categoryRowSelected: { backgroundColor: COLORS.activeBg },
  categoryRowThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.activeBg,
  },
  categoryRowText: { flex: 1 },
  categoryRowName: { fontSize: 15, fontWeight: "500", color: COLORS.inactiveText },
  categoryRowNameSelected: { color: COLORS.activeText, fontWeight: "600" },
  categoryRowDesc: { fontSize: 12, color: COLORS.inactiveText, marginTop: 2 },
  categoryRowCheck: { fontSize: 16, color: COLORS.primary, fontWeight: "700" },

  // Image picker
  thumbnailList: { marginBottom: 10 },
  thumbnailWrapper: { position: "relative", marginRight: 8 },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  pickButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderStyle: "dashed",
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: COLORS.activeBg,
  },
  pickButtonText: { fontSize: 13, color: COLORS.primary, fontWeight: "500" },

  // Submit
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonDisabled: { backgroundColor: COLORS.inactiveText },
  submitText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // Dynamic Rooms
  roomCard: {
    backgroundColor: COLORS.activeBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  roomCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  roomCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.activeText,
  },
  roomCardRemove: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: "500",
  },
  roomRow: {
    flexDirection: "row",
    gap: 12,
  },
  roomRowField: {
    flex: 1,
  },
  addRoomBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderStyle: "dashed",
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: COLORS.activeBg,
    marginBottom: 16,
  },
  addRoomBtnText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
  },
});
