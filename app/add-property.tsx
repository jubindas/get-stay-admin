import axios from "axios";

import * as ImagePicker from "expo-image-picker";

import React, { useEffect, useRef, useState } from "react";

import AlertPopUp, { AlertType } from "@/components/AlertPopUp";

import Header from "../components/Header";

import * as Location from "expo-location";

import { useAuth } from "@/provider/AuthProvider";

import { useRouter } from "expo-router";

import {
  Bed,
  Building,
  CarFront,
  Cigarette,
  Dog,
  Dumbbell,
  Flame,
  MapPin,
  Pencil,
  Plus,
  Settings,
  Shirt,
  Utensils,
  Wifi,
  X,
  Zap,
} from "lucide-react-native";

import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const PREDEFINED_AMENITIES = [
  { id: "wifi", label: "Wifi", icon: Wifi },
  { id: "power_backup", label: "Power Backup", icon: Zap },
  { id: "dg_set", label: "DG set", icon: Settings },
  { id: "smoking_allowed", label: "Smoking allowed in room", icon: Cigarette },
  { id: "jain_food", label: "Jain food", icon: Utensils },
  { id: "laundry", label: "Laundry", icon: Shirt },
  { id: "pet_friendly", label: "Pet friendly", icon: Dog },
  { id: "bonfire", label: "Bonfire", icon: Flame },
  { id: "parking_free", label: "Parking(Free)", icon: CarFront },
  { id: "parking_paid", label: "Parking(Paid)", icon: CarFront },
  { id: "restaurant", label: "Restaurant", icon: Utensils },
  { id: "barbeque", label: "Barbeque/Roasting", icon: Flame },
  { id: "mini_gym", label: "Mini gym", icon: Dumbbell },
];

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
  amenities: string;
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
  amenities: "",
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



const COLORS = {
  primary: "#4F6EF7",
  primaryLight: "#EEF1FE",
  activeBg: "#F1F5F9",
  activeText: "#4F6EF7",
  inactiveText: "#475569",
  mutedText: "#94A3B8",
  border: "#E2E8F0",
  danger: "#EF4444",
  textPrimary: "#0F172A",
  surfaceBg: "#F8FAFC",
};



function validate(form: PropertyForm, propertyImages: string[]): string | null {
  for (const key of REQUIRED_FIELDS) {
    const val = form[key] as any;
    if (!val || (typeof val === "string" && val.trim() === "")) {
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

  const newImages = propertyImages.filter((uri) => !uri.startsWith("/"));
  newImages.forEach((uri, index) => {
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

const INDIA_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

async function getCurrentLocation(): Promise<{
  lat: string;
  lng: string;
  error?: string;
} | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    return {
      lat: "",
      lng: "",
      error: "Allow location access to auto-fill coordinates.",
    };
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

      <Modal
        visible={open}
        transparent
        animationType="fade"
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

interface SearchableStateDropdownProps {
  value: string;
  onChange: (val: string) => void;
}

function SearchableStateDropdown({
  value,
  onChange,
}: SearchableStateDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredStates = INDIA_STATES.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.fieldWrapperHalf}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>State</Text>
      </View>

      <TouchableOpacity
        style={[styles.input, styles.dropdownTrigger]}
        onPress={() => {
          setOpen(true);
          setSearch("");
        }}
        activeOpacity={0.7}
      >
        <Text
          style={
            value ? styles.dropdownSelectedText : styles.dropdownPlaceholder
          }
          numberOfLines={1}
        >
          {value || "Select"}
        </Text>
        <Text style={styles.dropdownChevron}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />
        <View style={[styles.modalSheet, { height: "70%" }]}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Select State</Text>

          <TextInput
            style={[styles.input, { marginBottom: 14 }]}
            placeholder="Search state..."
            placeholderTextColor={COLORS.mutedText}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />

          <FlatList
            data={filteredStates}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = item === value;
              return (
                <TouchableOpacity
                  style={[
                    styles.categoryRow,
                    isSelected && styles.categoryRowSelected,
                  ]}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryRowText}>
                    <Text
                      style={[
                        styles.categoryRowName,
                        isSelected && styles.categoryRowNameSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                  {isSelected && <Text style={styles.categoryRowCheck}>✓</Text>}
                </TouchableOpacity>
              );
            }}
          />
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

      <View style={styles.imageGridWrap}>
        {images.map((item) => (
          <View key={item} style={styles.thumbnailWrapper}>
            <Image
              source={{
                uri: item.startsWith("/") ? `${API_BASE_URL}${item}` : item,
              }}
              style={styles.thumbnail}
            />
            <TouchableOpacity
              style={styles.removeImgBtn}
              onPress={() => remove(item)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <X size={11} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.pickTile}
          onPress={pick}
          activeOpacity={0.7}
        >
          <Plus size={20} color={COLORS.primary} />
          <Text style={styles.pickTileText}>Add</Text>
        </TouchableOpacity>
      </View>
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
  half?: boolean;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  numeric = false,
  optional = false,
  multiline = false,
  half = false,
}: FieldProps) {
  return (
    <View style={half ? styles.fieldWrapperHalf : styles.fieldWrapper}>
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
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      {children}
    </View>
  );
}

interface AmenitiesGridProps {
  selectedAmenities: string;
  onChange: (amenities: string) => void;
}

function AmenitiesGrid({ selectedAmenities, onChange }: AmenitiesGridProps) {
  const selectedList = selectedAmenities
    ? selectedAmenities
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    : [];

  const toggleAmenity = (label: string) => {
    let newList = [...selectedList];
    if (newList.includes(label)) {
      newList = newList.filter((item) => item !== label);
    } else {
      newList.push(label);
    }
    onChange(newList.join(", "));
  };

  return (
    <View style={styles.amenitiesGrid}>
      {PREDEFINED_AMENITIES.map((amenity) => {
        const isSelected = selectedList.includes(amenity.label);
        const Icon = amenity.icon;
        return (
          <TouchableOpacity
            key={amenity.id}
            style={[
              styles.amenityChip,
              isSelected && styles.amenityChipSelected,
            ]}
            onPress={() => toggleAmenity(amenity.label)}
            activeOpacity={0.7}
          >
            <Icon size={14} color={isSelected ? "#fff" : COLORS.inactiveText} />
            <Text
              style={[
                styles.amenityChipLabel,
                isSelected && styles.amenityChipLabelSelected,
              ]}
              numberOfLines={1}
            >
              {amenity.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AddProperty() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(
    null,
  );
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [properties, setProperties] = useState<any[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scaleAnim]);

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
    const fetchProperties = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/host/properties`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("the properties are", JSON.stringify(res.data, null, 2));

        if (res.data && Array.isArray(res.data.properties)) {
          setProperties(res.data.properties);
        }
      } catch (e) {
        console.error("Failed to fetch properties:", e);
      } finally {
        setPropertiesLoading(false);
      }
    };
    if (token && !showForm) {
      fetchProperties();
    }
  }, [token, showForm]);

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

      if (editingPropertyId) {
        const originalImages =
          properties.find((p) => p.id === editingPropertyId)?.property_images ||
          [];
        const keptExistingImages = propertyImages.filter((uri) =>
          uri.startsWith("/"),
        );
        const imagesToDelete = originalImages.filter(
          (uri: string) => !keptExistingImages.includes(uri),
        );
        imagesToDelete.forEach((img: string) =>
          formData.append("images_to_delete", img),
        );
      }

      const endpoint = editingPropertyId
        ? `${API_BASE_URL}/api/host/properties/${editingPropertyId}`
        : `${API_BASE_URL}/api/host/properties/create`;
      const method = editingPropertyId ? axios.patch : axios.post;

      const response = await method(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Property Saved:", response.data);

      showAlert({
        type: "success",
        title: "Success",
        message: `Property ${editingPropertyId ? "updated" : "created"} successfully!`,
        primaryLabel: "OK",
        onPrimary: () => {
          setForm(INITIAL_FORM);
          setPropertyImages([]);
          setEditingPropertyId(null);
          setShowForm(false);
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
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong.",
        primaryLabel: "Retry",
        onPrimary: dismissAlert,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View style={styles.mainContainer}>
        <Header />
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.pageTitle}>My Properties</Text>
              <Text style={styles.pageSubtitle}>
                Manage your listed Properties
              </Text>
            </View>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  setEditingPropertyId(null);
                  setForm(INITIAL_FORM);
                  setPropertyImages([]);
                  setCurrentStep(1);
                  setShowForm(true);
                }}
                activeOpacity={0.8}
              >
                <Plus size={18} color="#fff" strokeWidth={3} />
                <Text style={styles.addBtnText}>Add Property</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {propertiesLoading ? (
            <Text style={styles.loadingText}>Loading properties...</Text>
          ) : properties.length === 0 ? (
            <View style={styles.emptyState}>
              <Building size={48} color={COLORS.inactiveText} />
              <Text style={styles.emptyStateText}>No properties found</Text>
              <Text style={styles.emptyStateSubtext}>
                Add your first property to get started
              </Text>
            </View>
          ) : (
            <FlatList
              data={properties}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, 48) }]}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.propertyCard}>
                  {item.property_images && item.property_images.length > 0 ? (
                    <FlatList
                      data={item.property_images}
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(_, index) => index.toString()}
                      renderItem={({ item: imgPath }) => (
                        <Image
                          source={{ uri: `${API_BASE_URL}${imgPath}` }}
                          style={[
                            styles.propertyCardImage,
                            { width: windowWidth - 42 },
                          ]}
                        />
                      )}
                    />
                  ) : (
                    <View style={styles.propertyCardImagePlaceholder}>
                      <Building
                        size={48}
                        color={COLORS.inactiveText}
                        opacity={0.5}
                      />
                    </View>
                  )}
                  {item.category?.category_name && (
                    <View style={styles.propertyCategoryBadge}>
                      <Text style={styles.propertyCategoryText}>
                        {item.category.category_name}
                      </Text>
                    </View>
                  )}
                  <View style={styles.propertyCardInfo}>
                    <Text style={styles.propertyCardTitle} numberOfLines={1}>
                      {item.property_name}
                    </Text>
                    <View style={styles.propertyCardLocation}>
                      <MapPin size={16} color={COLORS.inactiveText} />
                      <Text
                        style={styles.propertyCardLocationText}
                        numberOfLines={1}
                      >
                        {item.address_display ||
                          `${item.city || ""}${item.city && item.state ? ", " : ""}${item.state || ""}`}
                      </Text>
                    </View>

                    <View style={styles.propertyStatsRow}>
                      <View style={styles.propertyStat}>
                        <Bed size={16} color={COLORS.primary} />
                        <Text style={styles.propertyStatText}>
                          {item.room_details?.length
                            ? `${item.room_details.length} Room${item.room_details.length > 1 ? "s" : ""}`
                            : "No Rooms"}
                        </Text>
                      </View>

                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity
                          style={styles.editBtnOnCard}
                          onPress={() => {
                            setEditingPropertyId(item.id);
                            setForm({
                              property_name: item.property_name || "",
                              category_id: item.category_id || "",
                              address_display: item.address_display || "",
                              state: item.state || "",
                              city: item.city || "",
                              district: item.district || "",
                              village: item.village || "",
                              pincode: item.pincode?.toString() || "",
                              post_office: item.post_office || "",
                              latitude: item.latitude || "",
                              longitude: item.longitude || "",
                              amenities: item.amenities
                                ? Array.isArray(item.amenities)
                                  ? item.amenities.join(", ")
                                  : item.amenities
                                : "",

                            });
                            setPropertyImages(item.property_images || []);
                            setCurrentStep(1);
                            setShowForm(true);
                          }}
                        >
                          <Pencil size={14} color="#000000" />
                          <Text style={styles.addRoomBtnOnCardText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.addRoomBtnOnCard}
                          onPress={() =>
                            router.push({
                              pathname: "/add-rooms-temp",
                              params: { propertyId: item.id },
                            })
                          }
                        >
                          <Plus size={14} color="#000000" />
                          <Text style={styles.addRoomBtnOnCardText}>
                            Add Room
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>

      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowForm(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBg}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[styles.formHeaderRow, { paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : Math.max(insets.top, 14) }]}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setShowForm(false)}
            >
              <X size={20} color={COLORS.inactiveText} />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.formHeaderText}>
                {editingPropertyId ? "Edit Property" : "Create Property"}
              </Text>
              <Text style={styles.formHeaderSub}>Step {currentStep} of 4</Text>
            </View>
          </View>

          <View style={styles.premiumStepContainer}>
            {[1, 2, 3, 4].map((step) => (
              <View key={step} style={styles.premiumStepWrapper}>
                <View
                  style={[
                    styles.premiumStepDot,
                    currentStep >= step && styles.premiumStepDotActive,
                  ]}
                />
                {step < 4 && (
                  <View
                    style={[
                      styles.premiumStepLine,
                      currentStep > step && styles.premiumStepLineActive,
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          <View style={styles.content}>
            {currentStep === 1 && (
              <Section
                title="1. Property Info"
                subtitle="Property details to show in listing"
              >
                <Field
                  label="Property Name"
                  value={form.property_name}
                  onChange={set("property_name")}
                  placeholder="e.g. Sunset Villa"
                />

                <CategoryDropdown
                  categories={categories}
                  value={form.category_id}
                  onChange={(id) =>
                    setForm((prev) => ({ ...prev, category_id: id }))
                  }
                  loading={categoriesLoading}
                />

                <Field
                  label="Display Address"
                  value={form.address_display}
                  onChange={set("address_display")}
                  optional
                />


              </Section>
            )}

            {currentStep === 2 && (
              <Section
                title="2. Location"
                subtitle="Tell guests exactly where to find your property."
              >
                <View style={styles.row2}>
                  <Field
                    label="Nearest Town / City"
                    value={form.city}
                    onChange={set("city")}
                    half
                  />
                  <Field
                    label="District"
                    value={form.district}
                    onChange={set("district")}
                    half
                  />
                </View>

                <View style={styles.row2}>
                  <Field
                    label="Village"
                    value={form.village}
                    onChange={set("village")}
                    optional
                    half
                  />

                  <SearchableStateDropdown
                    value={form.state}
                    onChange={set("state")}
                  />
                </View>

                <View style={styles.row2}>
                  <Field
                    label="Pincode"
                    value={form.pincode}
                    onChange={set("pincode")}
                    numeric
                    half
                  />
                  <Field
                    label="Post Office"
                    value={form.post_office}
                    onChange={set("post_office")}
                    optional
                    half
                  />
                </View>

                <View style={styles.coordCard}>
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
                      <MapPin size={12} color="#fff" />
                      <Text style={styles.locationBtnText}>
                        {locationLoading ? "Fetching..." : "Use Current"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.coordRow}>
                    <View style={styles.coordField}>
                      <Text style={styles.coordLabel}>Latitude</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="26.748819"
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
                        placeholder="94.209869"
                        placeholderTextColor="#aaa"
                        value={form.longitude}
                        onChangeText={set("longitude")}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              </Section>
            )}

            {currentStep === 3 && (
              <Section
                title="3. Property Amenities"
                subtitle="Select the facilities and features your property offers."
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  <AmenitiesGrid
                    selectedAmenities={form.amenities}
                    onChange={set("amenities")}
                  />
                </ScrollView>
              </Section>
            )}

            {currentStep === 4 && (
              <Section
                title="4. Property Images"
                subtitle="Upload clear, high-quality photos to attract more bookings."
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  <ImagePickerField
                    label="Upload Photos"
                    images={propertyImages}
                    onChange={setPropertyImages}
                    onError={(msg) =>
                      showAlert({
                        type: "warning",
                        title: "Permission required",
                        message: msg,
                        primaryLabel: "OK",
                        onPrimary: dismissAlert,
                      })
                    }
                  />
                </ScrollView>
              </Section>
            )}
          </View>

          <View style={[styles.pinnedFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.footerRow}>
              {currentStep > 1 && (
                <TouchableOpacity
                  style={[styles.footerBtn, styles.prevBtn]}
                  onPress={() => setCurrentStep((prev) => prev - 1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.prevBtnText}>Previous</Text>
                </TouchableOpacity>
              )}
              {currentStep < 4 ? (
                <TouchableOpacity
                  style={[styles.footerBtn, styles.nextBtn]}
                  onPress={() => setCurrentStep((prev) => prev + 1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.nextBtnText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.footerBtn,
                    styles.nextBtn,
                    loading && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.nextBtnText}>
                    {loading
                      ? "Saving..."
                      : editingPropertyId
                        ? "Update"
                        : "Create"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

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
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.mutedText,
    fontWeight: "500",
    marginBottom: 14,
    lineHeight: 16,
  },
  // ── Root ──
  mainContainer: { flex: 1, backgroundColor: COLORS.surfaceBg },
  modalBg: { flex: 1, backgroundColor: COLORS.surfaceBg },
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },

  // ── List Page ──
  listContainer: { flex: 1, padding: 20 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginTop: 3,
    fontWeight: "400",
  },
  listContent: { paddingBottom: 48 },

  // ── Add Button ──
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // ── States ──
  loadingText: {
    textAlign: "center",
    marginTop: 48,
    color: COLORS.mutedText,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginTop: 5,
  },

  // ── Property Card ──
  propertyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  propertyCardImage: {
    width: "100%",
    height: 190,
    backgroundColor: COLORS.primaryLight,
  },
  propertyCardImagePlaceholder: {
    width: "100%",
    height: 190,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  propertyCategoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 8,
  },
  propertyCategoryText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  propertyCardInfo: { padding: 16 },
  propertyCardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  propertyCardLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  propertyCardLocationText: {
    fontSize: 12,
    color: COLORS.inactiveText,
    fontWeight: "500",
    flexShrink: 1,
  },
  propertyStatsRow: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  propertyStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  propertyStatText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  addRoomBtnOnCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  editBtnOnCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.activeBg,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  addRoomBtnOnCardText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#000000",
  },

  // ── Form Header ──
  formHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 14 : 12,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.activeBg,
    borderRadius: 10,
  },
  formHeaderText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  formHeaderSub: {
    fontSize: 11,
    color: COLORS.mutedText,
    marginTop: 1,
    fontWeight: "600",
  },

  // ── Step Bar ──
  premiumStepContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  premiumStepWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  premiumStepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  premiumStepDotActive: {
    backgroundColor: COLORS.primary,
  },
  premiumStepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  premiumStepLineActive: {
    backgroundColor: COLORS.primary,
  },

  // ── Section Card ──
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 3,
  },

  // ── Fields ──
  fieldWrapper: { marginBottom: 10 },
  fieldWrapperHalf: { flex: 1, marginBottom: 10 },
  row2: { flexDirection: "row", gap: 10 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.inactiveText,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  optionalTag: {
    marginLeft: 6,
    fontSize: 9,
    color: COLORS.mutedText,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  imageCount: {
    marginLeft: "auto",
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "700",
  },
  input: {
    backgroundColor: COLORS.activeBg,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputMultiline: {
    height: 72,
    textAlignVertical: "top",
    paddingTop: 10,
  },

  // ── Dropdown ──
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownSelected: { flexDirection: "row", alignItems: "center", gap: 8 },
  dropdownSelectedText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  dropdownPlaceholder: { fontSize: 14, color: COLORS.mutedText },
  dropdownChevron: { fontSize: 9, color: COLORS.mutedText },
  dropdownCategoryThumb: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: COLORS.primaryLight,
  },

  // ── Category Modal ──
  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)" },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 3,
    gap: 10,
  },
  categoryRowSelected: { backgroundColor: COLORS.primaryLight },
  categoryRowThumb: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
  },
  categoryRowText: { flex: 1 },
  categoryRowName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.inactiveText,
  },
  categoryRowNameSelected: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  categoryRowDesc: {
    fontSize: 11,
    color: COLORS.mutedText,
    marginTop: 2,
  },
  categoryRowCheck: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "800",
  },

  // ── Image Picker ──

  imageGridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  thumbnailWrapper: { position: "relative" },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: COLORS.activeBg,
  },
  removeImgBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.danger,
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  pickTile: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  pickTileText: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: "700",
  },

  // ── Amenities ──
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.activeBg,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  amenityChipSelected: {
    backgroundColor: COLORS.primary,
  },
  amenityChipLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.inactiveText,
  },
  amenityChipLabelSelected: {
    color: "#fff",
    fontWeight: "700",
  },

  // ── Coordinates ──
  coordCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 12,
    marginTop: 2,
  },
  locationBtn: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  locationBtnDisabled: { backgroundColor: COLORS.mutedText },
  locationBtnText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  coordRow: { flexDirection: "row", gap: 10 },
  coordField: { flex: 1 },
  coordLabel: {
    fontSize: 10,
    color: COLORS.mutedText,
    marginBottom: 5,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  // ── Pinned Footer ──
  pinnedFooter: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  prevBtn: {
    backgroundColor: COLORS.activeBg,
  },
  prevBtnText: {
    color: COLORS.inactiveText,
    fontSize: 14,
    fontWeight: "700",
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
  },
  nextBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  submitButtonDisabled: {
    backgroundColor: COLORS.mutedText,
  },

  // ── Unused but kept for compatibility ──
  heading: {},
  propertyDetailsGrid: {},
  propertyDetailItem: {},
  propertyDetailLabelRow: {},
  propertyDetailLabel: {},
  propertyDetailValue: {},
  submitButton: {},
  submitText: {},
  roomCard: {},
  roomCardHeader: {},
  roomCardTitle: {},
  roomCardRemove: {},
  roomRow: {},
  roomRowField: {},
  addRoomBtn: {},
  addRoomBtnText: {},
  stepIndicatorContainer: {},
  stepDot: {},
  stepDotActive: {},
});
