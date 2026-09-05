import * as ImagePicker from "expo-image-picker";

import { LinearGradient } from "expo-linear-gradient";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useEffect, useState } from "react";

import DateTimePicker from "@react-native-community/datetimepicker";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import AlertPopUp, { AlertType } from "@/components/AlertPopUp";

import {
  BedDouble,
  Building2,
  Check,
  Edit2,
  Flame,
  Image as ImageIcon,
  IndianRupee,
  Plus,
  ShowerHead,
  Sparkles,
  Trash2,
  Users,
  X
} from "lucide-react-native";

import Header from "../components/Header";

const COLORS = {
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  primaryDark: "#1E3A8A",
  background: "#F8FAFC",
  card: "#FFFFFF",
  textMain: "#0F172A",
  textMuted: "#64748B",
  textLight: "#94A3B8",
  border: "#E2E8F0",
  success: "#10B981",
  successLight: "#D1FAE5",
  danger: "#EF4444",
  dangerLight: "rgba(239, 68, 68, 0.1)",
};

interface AlertState {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

const ALERT_HIDDEN: AlertState = {
  visible: false,
  type: "info",
  title: "",
  message: "",
};

// ---- Static mock data (no backend calls) ----

const MOCK_UNITS_BY_ROOM: Record<string, any[]> = {
  room_1: [
    { id: "unit_1a", room_number: "101", floor: "1st", notes: "Near elevator", status: "Available" },
    { id: "unit_1b", room_number: "102", floor: "1st", notes: "", status: "Booked" },
    { id: "unit_1c", room_number: "103", floor: "1st", notes: "Corner room", status: "Available" },
  ],
  room_2: [
    { id: "unit_2a", room_number: "201", floor: "2nd", notes: "", status: "Available" },
    { id: "unit_2b", room_number: "202", floor: "2nd", notes: "Under maintenance", status: "Booked" },
  ],
  room_3: [
    { id: "unit_3a", room_number: "C1", floor: "Ground", notes: "Best view", status: "Available" },
  ],
};

const DEFAULT_UNITS = [
  { id: "unit_default_1", room_number: "01", floor: "Ground", notes: "", status: "Available" },
];

const UnitsManagerModal = ({ room, onClose, showAlert }: any) => {
  const [units, setUnits] = useState<any[]>(
    MOCK_UNITS_BY_ROOM[room.id] || DEFAULT_UNITS,
  );
  const [addingUnit, setAddingUnit] = useState(false);
  const [newUnitData, setNewUnitData] = useState({
    room_number: "",
    floor: "",
    notes: "",
    status: "Available",
  });

  const handleUpdateUnit = (unitId: string, updatedData: any) => {
    setUnits(
      units.map((u) => (u.id === unitId ? { ...u, ...updatedData } : u)),
    );
    showAlert({
      type: "success",
      title: "Updated",
      message: "Unit updated successfully.",
      primaryLabel: "OK",
    });
  };

  const handleDeleteUnit = (unitId: string) => {
    setUnits(units.filter((u) => u.id !== unitId));
    showAlert({
      type: "success",
      title: "Deleted",
      message: "Unit deleted successfully.",
      primaryLabel: "OK",
    });
  };

  const handleAddUnit = () => {
    if (!newUnitData.room_number) {
      showAlert({
        type: "warning",
        title: "Required",
        message: "Room number is required.",
      });
      return;
    }
    const createdUnit = {
      id: `unit_${Date.now()}`,
      ...newUnitData,
    };
    setUnits([...units, createdUnit]);
    setAddingUnit(false);
    setNewUnitData({
      room_number: "",
      floor: "",
      notes: "",
      status: "Available",
    });
    showAlert({
      type: "success",
      title: "Created",
      message: "New unit added.",
      primaryLabel: "OK",
    });
  };

  return (
    <Modal
      visible={!!room}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: COLORS.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
            backgroundColor: COLORS.card,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: COLORS.textMain,
              }}
            >
              Edit Room Numbers
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.textMuted }}>
              Room ID: {room.id.split("-")[0]}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              padding: 8,
              backgroundColor: COLORS.background,
              borderRadius: 20,
            }}
          >
            <X size={20} color={COLORS.textMain} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {units.length === 0 ? (
            <View
              style={{
                padding: 40,
                alignItems: "center",
                backgroundColor: COLORS.card,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: COLORS.border,
                marginBottom: 20,
              }}
            >
              <BedDouble size={40} color={COLORS.textLight} />
              <Text
                style={{
                  color: COLORS.textMain,
                  fontWeight: "700",
                  marginTop: 12,
                }}
              >
                No Units Found
              </Text>
              <Text
                style={{
                  color: COLORS.textMuted,
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                Add physical room units below.
              </Text>
            </View>
          ) : (
            units.map((u, idx) => (
              <UnitRow
                key={u.id || idx}
                unit={u}
                onUpdate={(data: any) => handleUpdateUnit(u.id, data)}
                onDelete={() => handleDeleteUnit(u.id)}
                showAlert={showAlert}
              />
            ))
          )}

          {addingUnit ? (
            <View
              style={{
                backgroundColor: COLORS.card,
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: COLORS.primaryLight,
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: COLORS.textMain,
                  marginBottom: 12,
                }}
              >
                Add New Unit
              </Text>
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: COLORS.textMuted,
                      marginBottom: 6,
                      fontWeight: "600",
                    }}
                  >
                    Room No. *
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: COLORS.border,
                      borderRadius: 10,
                      padding: 12,
                      backgroundColor: COLORS.background,
                    }}
                    value={newUnitData.room_number}
                    onChangeText={(v) =>
                      setNewUnitData({ ...newUnitData, room_number: v })
                    }
                    placeholder="e.g. 101"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: COLORS.textMuted,
                      marginBottom: 6,
                      fontWeight: "600",
                    }}
                  >
                    Floor
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: COLORS.border,
                      borderRadius: 10,
                      padding: 12,
                      backgroundColor: COLORS.background,
                    }}
                    value={newUnitData.floor}
                    onChangeText={(v) =>
                      setNewUnitData({ ...newUnitData, floor: v })
                    }
                    placeholder="e.g. 1st"
                  />
                </View>
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.textMuted,
                    marginBottom: 6,
                    fontWeight: "600",
                  }}
                >
                  Notes
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 10,
                    padding: 12,
                    backgroundColor: COLORS.background,
                  }}
                  value={newUnitData.notes}
                  onChangeText={(v) =>
                    setNewUnitData({ ...newUnitData, notes: v })
                  }
                  placeholder="Optional notes"
                />
              </View>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                  onPress={() => setAddingUnit(false)}
                >
                  <Text style={{ color: COLORS.textMain, fontWeight: "600" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    backgroundColor: COLORS.primary,
                  }}
                  onPress={handleAddUnit}
                >
                  <Text style={{ color: "#FFF", fontWeight: "600" }}>
                    Save Unit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                backgroundColor: COLORS.primaryLight,
                borderRadius: 16,
                marginTop: 10,
                borderWidth: 1,
                borderColor: "rgba(37,99,235,0.2)",
              }}
              onPress={() => setAddingUnit(true)}
            >
              <Plus
                size={18}
                color={COLORS.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
                Add New Unit
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const UnitRow = ({ unit, onUpdate, onDelete, showAlert }: any) => {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState({
    room_number: unit.room_number,
    floor: unit.floor,
    notes: unit.notes,
  });

  if (editing) {
    return (
      <View
        style={{
          backgroundColor: COLORS.card,
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: COLORS.primary,
          marginBottom: 12,
          shadowColor: COLORS.primary,
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 12,
                color: COLORS.textMuted,
                marginBottom: 6,
                fontWeight: "600",
              }}
            >
              Room No.
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 10,
                padding: 10,
                backgroundColor: COLORS.background,
              }}
              value={data.room_number}
              onChangeText={(v) => setData({ ...data, room_number: v })}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 12,
                color: COLORS.textMuted,
                marginBottom: 6,
                fontWeight: "600",
              }}
            >
              Floor
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 10,
                padding: 10,
                backgroundColor: COLORS.background,
              }}
              value={data.floor}
              onChangeText={(v) => setData({ ...data, floor: v })}
            />
          </View>
        </View>
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 12,
              color: COLORS.textMuted,
              marginBottom: 6,
              fontWeight: "600",
            }}
          >
            Notes
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 10,
              padding: 10,
              backgroundColor: COLORS.background,
            }}
            value={data.notes}
            onChangeText={(v) => setData({ ...data, notes: v })}
          />
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              alignItems: "center",
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
            onPress={() => {
              setEditing(false);
              setData({
                room_number: unit.room_number,
                floor: unit.floor,
                notes: unit.notes,
              });
            }}
          >
            <Text style={{ color: COLORS.textMain, fontWeight: "600" }}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              alignItems: "center",
              backgroundColor: COLORS.primary,
            }}
            onPress={() => {
              onUpdate(data);
              setEditing(false);
            }}
          >
            <Text style={{ color: "#FFF", fontWeight: "600" }}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: COLORS.card,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: COLORS.textMain,
              marginRight: 8,
            }}
          >
            {unit.room_number}
          </Text>
          <View
            style={{
              backgroundColor:
                unit.status === "Available"
                  ? COLORS.successLight
                  : COLORS.dangerLight,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color:
                  unit.status === "Available" ? COLORS.success : COLORS.danger,
              }}
            >
              {unit.status || "Available"}
            </Text>
          </View>
        </View>
        {(unit.floor || unit.notes) && (
          <Text style={{ fontSize: 13, color: COLORS.textMuted }}>
            {unit.floor ? `Floor: ${unit.floor}` : ""}{" "}
            {unit.floor && unit.notes ? " • " : ""} {unit.notes}
          </Text>
        )}
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity
          style={{
            padding: 8,
            backgroundColor: COLORS.background,
            borderRadius: 10,
          }}
          onPress={() => setEditing(true)}
        >
          <Edit2 size={16} color={COLORS.textMain} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            padding: 8,
            backgroundColor: COLORS.dangerLight,
            borderRadius: 10,
          }}
          onPress={() => {
            showAlert({
              type: "warning",
              title: "Delete Unit",
              message: `Are you sure you want to delete Unit ${unit.room_number}?`,
              primaryLabel: "Delete",
              onPrimary: () => {
                onDelete();
              },
              secondaryLabel: "Cancel",
            });
          }}
        >
          <Trash2 size={16} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function MyRooms() {
  const { width: windowWidth } = useWindowDimensions();

  const [properties, setProperties] = useState<any[]>([]);
  const [localRooms, setLocalRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );

  // Modal State
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [managingUnitsForRoom, setManagingUnitsForRoom] = useState<any>(null);

  const [blockingRoomFor, setBlockingRoomFor] = useState<any>(null);
  const [blockStartDate, setBlockStartDate] = useState(new Date());
  const [blockEndDate, setBlockEndDate] = useState(new Date());
  const [showBlockStartPicker, setShowBlockStartPicker] = useState(false);
  const [showBlockEndPicker, setShowBlockEndPicker] = useState(false);

  const [editLoading, setEditLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>(ALERT_HIDDEN);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const dismissAlert = () => setAlert((a) => ({ ...a, visible: false }));
  const showAlert = (config: Omit<AlertState, "visible">) =>
    setAlert({ ...config, visible: true });

  const MOCK_STATIC_PROPERTIES = [
    {
      id: "static_prop_1",
      property_name: "Ocean View Resort",
      room_details: [
        {
          id: "room_1",
          is_local: false,
          room_category: { category_name: "Deluxe Suite" },
          base_price: "4500",
          room_capacity: 4,
          bed_count: 2,
          check_in_time: "14:00",
          check_out_time: "11:00",
          amenities: ["Wi-Fi", "AC", "Sea View", "Mini Bar"],
          room_images_url: [
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
          ],
        },
        {
          id: "room_2",
          is_local: false,
          room_category: { category_name: "Standard Room" },
          base_price: "2500",
          room_capacity: 2,
          bed_count: 1,
          check_in_time: "14:00",
          check_out_time: "11:00",
          amenities: ["Wi-Fi", "AC"],
          room_images_url: [
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
          ],
        }
      ]
    },
    {
      id: "static_prop_2",
      property_name: "Mountain Retreat",
      room_details: [
        {
          id: "room_3",
          is_local: false,
          room_category: { category_name: "Cabin" },
          base_price: "3500",
          room_capacity: 3,
          bed_count: 2,
          check_in_time: "15:00",
          check_out_time: "10:00",
          amenities: ["Fireplace", "Mountain View"],
          room_images_url: [
            "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800",
          ],
        }
      ]
    }
  ];

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const localRoomsStr = await AsyncStorage.getItem("local_rooms");

      let localDrafts: any[] = [];
      if (localRoomsStr) {
        try {
          localDrafts = JSON.parse(localRoomsStr);
          setLocalRooms(localDrafts);
        } catch (e) { }
      }

      setProperties(MOCK_STATIC_PROPERTIES);

      if (MOCK_STATIC_PROPERTIES.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(MOCK_STATIC_PROPERTIES[0].id);
      } else if (localDrafts.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId("local_drafts");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProperties();
    setRefreshing(false);
  };

  const mappedLocalRooms = localRooms.map(r => ({
    id: r.id,
    is_local: true,
    room_images_url: r.images,
    room_category: { category_name: r.roomName || r.roomConfigs?.[0]?.roomCategory || "Local Draft" },
    base_price: r.roomConfigs?.[0]?.tariff || "0",
    room_capacity: r.maxPersons,
    bed_count: r.roomConfigs?.[0]?.beds?.reduce((acc: number, bed: any) => acc + (bed.bedCount || 1), 0) || 1,
    check_in_time: "14:00",
    check_out_time: "11:00",
    amenities: r.amenities || [],
    originalData: r
  }));

  const combinedProperties = [
    ...properties,
    ...(localRooms.length > 0 ? [{ id: "local_drafts", property_name: "Local Drafts (Unsaved)", room_details: mappedLocalRooms }] : [])
  ];

  const selectedProperty = combinedProperties.find((p) => p.id === selectedPropertyId);
  const rooms = selectedProperty?.room_details || [];

  const handleEditClick = (room: any) => {
    setEditingRoom({
      ...room,
      amenitiesStr: room.amenities ? room.amenities.join(", ") : "",
      bed_count: room.bed_count ? room.bed_count.toString() : "",
      room_capacity: room.room_capacity ? room.room_capacity.toString() : "",
      extra_bed_capacity: room.extra_bed_capacity
        ? room.extra_bed_capacity.toString()
        : "",
      base_price: room.base_price ? room.base_price.toString() : "",
      extra_bed_price: room.extra_bed_price
        ? room.extra_bed_price.toString()
        : "",
      discount_percentage: room.discount_percentage
        ? room.discount_percentage.toString()
        : "",
    });
    setNewImages([]);
    setImagesToDelete([]);
  };

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert({
        type: "warning",
        title: "Permission Denied",
        message: "Allow access to photos.",
        primaryLabel: "OK",
        onPrimary: dismissAlert,
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setNewImages([...newImages, ...result.assets.map((a) => a.uri)]);
    }
  };

  const removeNewImage = (uri: string) => {
    setNewImages(newImages.filter((i) => i !== uri));
  };

  const markImageForDeletion = (uri: string) => {
    if (imagesToDelete.includes(uri)) {
      setImagesToDelete(imagesToDelete.filter((i) => i !== uri));
    } else {
      setImagesToDelete([...imagesToDelete, uri]);
    }
  };

  const handleUpdateRoom = () => {
    if (!editingRoom || !selectedPropertyId) return;

    setEditLoading(true);

    const parsedAmenities = editingRoom.amenitiesStr
      ? editingRoom.amenitiesStr
        .split(",")
        .map((a: string) => a.trim())
        .filter(Boolean)
      : [];

    const remainingImages = (editingRoom.room_images_url || []).filter(
      (img: string) => !imagesToDelete.includes(img),
    );

    const updatedRoom = {
      ...editingRoom,
      amenities: parsedAmenities,
      room_images_url: [...remainingImages, ...newImages],
    };

    // Simulate a brief save delay so the "Saving..." state is visible,
    // then commit the change to local static state.
    setTimeout(() => {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === selectedPropertyId
            ? {
              ...p,
              room_details: p.room_details.map((r: any) =>
                r.id === editingRoom.id ? { ...r, ...updatedRoom } : r,
              ),
            }
            : p,
        ),
      );

      setEditLoading(false);
      setEditingRoom(null);
      showAlert({
        type: "success",
        title: "Success",
        message: "Room updated successfully.",
        primaryLabel: "OK",
        onPrimary: dismissAlert,
      });
    }, 400);
  };

  const renderPropertyTab = ({ item }: { item: any }) => {
    const isSelected = item.id === selectedPropertyId;
    return (
      <TouchableOpacity
        style={[styles.propertyTab, isSelected && styles.propertyTabSelected]}
        onPress={() => setSelectedPropertyId(item.id)}
        activeOpacity={0.8}
      >
        {isSelected && (
          <Building2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
        )}
        <Text
          style={[
            styles.propertyTabText,
            isSelected && styles.propertyTabTextSelected,
          ]}
        >
          {item.property_name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRoomCard = ({ item }: { item: any }) => (
    <View style={styles.roomCard}>
      <View style={styles.cardMediaContainer}>
        {item.room_images_url && item.room_images_url.length > 0 ? (
          <FlatList
            data={item.room_images_url}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(img, index) => index.toString()}
            renderItem={({ item: imgPath }) => (
              <Image
                source={{ uri: imgPath }}
                style={[styles.roomImage, { width: windowWidth - 40 }]}
              />
            )}
          />
        ) : (
          <View
            style={[styles.roomImagePlaceholder, { width: windowWidth - 40 }]}
          >
            <ImageIcon size={28} color={COLORS.textLight} opacity={0.5} />
            <Text
              style={{
                color: COLORS.textLight,
                marginTop: 4,
                fontSize: 11,
                fontWeight: "500",
              }}
            >
              No photos available
            </Text>
          </View>
        )}

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.mediaGradient}
        >
          <View style={styles.mediaOverlayRow}>
            {item.room_category?.category_name ? (
              <View style={styles.categoryBadge}>
                <Sparkles size={10} color="#FFF" style={{ marginRight: 3 }} />
                <Text style={styles.categoryBadgeText}>
                  {item.room_category.category_name}
                </Text>
              </View>
            ) : (
              <View />
            )}

            {!item.is_local && (
              <TouchableOpacity
                style={styles.floatingEditBtn}
                onPress={() => handleEditClick(item)}
                activeOpacity={0.9}
              >
                <Edit2 size={13} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <View style={styles.priceRow}>
            <IndianRupee size={16} color={COLORS.primary} strokeWidth={2.5} />
            <Text style={styles.priceText}>{item.base_price}</Text>
            <Text style={styles.perNight}> / night</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={styles.statIconWrap}>
              <Users size={13} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>{item.room_capacity} Guests</Text>
              <Text style={styles.statLabel}>Max Capacity</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statIconWrap}>
              <BedDouble size={13} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>
                {item.bed_count || 1} Bed{item.bed_count > 1 ? "s" : ""}
              </Text>
              <Text style={styles.statLabel}>Provided</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statIconWrap}>
              <ShowerHead size={13} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>
                {item.toilet_type || "Western"}
              </Text>
              <Text style={styles.statLabel}>Toilet</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statIconWrap}>
              <Flame size={13} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>
                {item.room_heating ? "Yes" : "No"}
              </Text>
              <Text style={styles.statLabel}>Heating</Text>
            </View>
          </View>
        </View>

        {item.amenities && item.amenities.length > 0 && (
          <>
            <Text style={styles.amenitiesTitle}>Included Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {item.amenities.map((amenity: string, idx: number) => (
                <View key={idx} style={styles.amenityPill}>
                  <Check
                    size={10}
                    color={COLORS.primary}
                    style={{ marginRight: 3 }}
                  />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {!item.is_local && (
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 9,
                backgroundColor: COLORS.primaryLight,
                borderRadius: 10,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(37, 99, 235, 0.2)",
              }}
              onPress={() => setManagingUnitsForRoom(item)}
            >
              <Text style={{ color: COLORS.primary, fontWeight: "700", fontSize: 11 }}>
                Edit Room Numbers
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 9,
                backgroundColor: "#FEF2F2",
                borderRadius: 10,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#FECACA",
              }}
              onPress={() => setBlockingRoomFor(item)}
            >
              <Text style={{ color: "#EF4444", fontWeight: "700", fontSize: 11 }}>
                Block / Unblock
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <Header />

      <View style={styles.headerArea}>
        <Text style={styles.pageTitle}>My Rooms</Text>
        <Text style={styles.pageSubtitle}>
          Manage your premium listings and spaces
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerFill}>
          <Text style={styles.loadingText}>Fetching your inventory...</Text>
        </View>
      ) : properties.length === 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.centerFill}
        >
          <View style={styles.emptyIconWrap}>
            <Building2 size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyStateText}>No Properties Yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Add a property first to start adding rooms.
          </Text>
        </ScrollView>
      ) : (
        <>
          <View style={styles.propertyTabsContainer}>
            <FlatList
              data={combinedProperties}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={renderPropertyTab}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            />
          </View>

          {rooms.length === 0 ? (
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={styles.centerFill}
            >
              <View style={styles.emptyIconWrap}>
                <BedDouble size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyStateText}>No Rooms Available</Text>
              <Text style={styles.emptyStateSubtext}>
                This property doesnt have any rooms yet.
              </Text>
            </ScrollView>
          ) : (
            <FlatList
              data={rooms}
              keyExtractor={(item, index) => item.id || `local-${index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              renderItem={renderRoomCard}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
        </>
      )}

      {/* Edit Room Modal */}
      <Modal
        visible={!!editingRoom}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setEditingRoom(null)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: COLORS.background }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Room</Text>
            <TouchableOpacity
              onPress={() => setEditingRoom(null)}
              style={styles.closeBtn}
            >
              <X size={20} color={COLORS.textMain} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {editingRoom && (
              <>
                <Text style={styles.sectionLabel}>Pricing</Text>
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Base Price</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={editingRoom.base_price}
                      onChangeText={(v) =>
                        setEditingRoom({ ...editingRoom, base_price: v })
                      }
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Discount %</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={editingRoom.discount_percentage}
                      onChangeText={(v) =>
                        setEditingRoom({
                          ...editingRoom,
                          discount_percentage: v,
                        })
                      }
                    />
                  </View>
                </View>

                <Text style={styles.sectionLabel}>Capacity & Beds</Text>
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Max Capacity</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={editingRoom.room_capacity}
                      onChangeText={(v) =>
                        setEditingRoom({ ...editingRoom, room_capacity: v })
                      }
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Bed Count</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={editingRoom.bed_count}
                      onChangeText={(v) =>
                        setEditingRoom({ ...editingRoom, bed_count: v })
                      }
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Extra Bed Cap.</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={editingRoom.extra_bed_capacity}
                      onChangeText={(v) =>
                        setEditingRoom({
                          ...editingRoom,
                          extra_bed_capacity: v,
                        })
                      }
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Extra Bed Price</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={editingRoom.extra_bed_price}
                      onChangeText={(v) =>
                        setEditingRoom({ ...editingRoom, extra_bed_price: v })
                      }
                    />
                  </View>
                </View>

                <Text style={styles.sectionLabel}>Times</Text>
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Check-in (e.g. 14:00)</Text>
                    <TextInput
                      style={styles.input}
                      value={editingRoom.check_in_time}
                      onChangeText={(v) =>
                        setEditingRoom({ ...editingRoom, check_in_time: v })
                      }
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Check-out (e.g. 11:00)
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={editingRoom.check_out_time}
                      onChangeText={(v) =>
                        setEditingRoom({ ...editingRoom, check_out_time: v })
                      }
                    />
                  </View>
                </View>

                <Text style={styles.sectionLabel}>Amenities</Text>
                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.input, { height: 80 }]}
                    multiline
                    placeholder="Wifi, TV, AC (comma separated)"
                    value={editingRoom.amenitiesStr}
                    onChangeText={(v) =>
                      setEditingRoom({ ...editingRoom, amenitiesStr: v })
                    }
                  />
                </View>

                <Text style={styles.sectionLabel}>Current Images</Text>
                {editingRoom.room_images_url &&
                  editingRoom.room_images_url.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 16 }}
                  >
                    {editingRoom.room_images_url.map(
                      (img: string, idx: number) => {
                        const isDeleted = imagesToDelete.includes(img);
                        return (
                          <TouchableOpacity
                            key={idx}
                            activeOpacity={0.8}
                            onPress={() => markImageForDeletion(img)}
                            style={{ marginRight: 10 }}
                          >
                            <Image
                              source={{ uri: img }}
                              style={{
                                width: 80,
                                height: 80,
                                borderRadius: 10,
                                opacity: isDeleted ? 0.3 : 1,
                              }}
                            />
                            {isDeleted && (
                              <View
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Trash2 color={COLORS.danger} size={24} />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      },
                    )}
                  </ScrollView>
                ) : (
                  <Text style={{ color: COLORS.textMuted, marginBottom: 16 }}>
                    No images for this room.
                  </Text>
                )}

                <Text style={styles.sectionLabel}>New Images</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 24 }}
                >
                  <TouchableOpacity
                    style={styles.addImageBtn}
                    onPress={pickImages}
                  >
                    <Plus color={COLORS.primary} size={24} />
                  </TouchableOpacity>
                  {newImages.map((uri, idx) => (
                    <View key={idx} style={{ marginRight: 10 }}>
                      <Image
                        source={{ uri }}
                        style={{ width: 80, height: 80, borderRadius: 10 }}
                      />
                      <TouchableOpacity
                        style={styles.removeNewImgBtn}
                        onPress={() => removeNewImage(uri)}
                      >
                        <X size={12} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.saveBtn, editLoading && { opacity: 0.7 }]}
              onPress={handleUpdateRoom}
              disabled={editLoading}
            >
              <Text style={styles.saveBtnText}>
                {editLoading ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <AlertPopUp
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        primaryLabel={alert.primaryLabel}
        onPrimary={alert.onPrimary}
        secondaryLabel={alert.secondaryLabel}
        onSecondary={alert.onSecondary || dismissAlert}
        onDismiss={dismissAlert}
      />

      {managingUnitsForRoom && (
        <UnitsManagerModal
          room={managingUnitsForRoom}
          onClose={() => setManagingUnitsForRoom(null)}
          showAlert={showAlert}
        />
      )}

      <Modal visible={!!blockingRoomFor} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: "85%", backgroundColor: "#FFF", borderRadius: 16, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 16, color: "#0F172A" }}>
              Block / Unblock Dates
            </Text>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 8 }}>Start Date</Text>
            <TouchableOpacity
              style={{ borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, padding: 12, marginBottom: 16 }}
              onPress={() => setShowBlockStartPicker(true)}
            >
              <Text style={{ color: "#0F172A" }}>{blockStartDate.toDateString()}</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 8 }}>End Date</Text>
            <TouchableOpacity
              style={{ borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, padding: 12, marginBottom: 24 }}
              onPress={() => setShowBlockEndPicker(true)}
            >
              <Text style={{ color: "#0F172A" }}>{blockEndDate.toDateString()}</Text>
            </TouchableOpacity>

            {showBlockStartPicker && (
              <DateTimePicker
                value={blockStartDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowBlockStartPicker(false);
                  if (date) setBlockStartDate(date);
                }}
              />
            )}

            {showBlockEndPicker && (
              <DateTimePicker
                value={blockEndDate}
                mode="date"
                display="default"
                minimumDate={blockStartDate}
                onChange={(event, date) => {
                  setShowBlockEndPicker(false);
                  if (date) setBlockEndDate(date);
                }}
              />
            )}

            <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: "#FEF2F2", alignItems: "center", borderWidth: 1, borderColor: "#FECACA" }}
                onPress={() => {
                  setBlockingRoomFor(null);
                  showAlert({ type: "success", title: "Dates Blocked", message: "Successfully blocked the selected dates statically." });
                }}
              >
                <Text style={{ fontWeight: "600", color: "#EF4444" }}>Block Dates</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: "#F0FDF4", alignItems: "center", borderWidth: 1, borderColor: "#BBF7D0" }}
                onPress={() => {
                  setBlockingRoomFor(null);
                  showAlert({ type: "success", title: "Dates Unblocked", message: "Successfully unblocked the selected dates statically." });
                }}
              >
                <Text style={{ fontWeight: "600", color: "#16A34A" }}>Unblock Dates</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: "#F8FAFC", alignItems: "center", marginTop: 8 }}
              onPress={() => setBlockingRoomFor(null)}
            >
              <Text style={{ fontWeight: "600", color: "#64748B" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.background },
  headerArea: { paddingHorizontal: 20, paddingBottom: 10, paddingTop: 6 },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: "500",
  },

  centerFill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 80,
  },
  loadingText: { fontSize: 15, color: COLORS.textMuted, fontWeight: "500" },

  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },

  propertyTabsContainer: { marginBottom: 10 },
  propertyTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyTabSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  propertyTabText: { fontSize: 14, fontWeight: "600", color: COLORS.textMuted },
  propertyTabTextSelected: { color: "#fff" },

  listContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  roomCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  cardMediaContainer: {
    height: 140,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
    backgroundColor: COLORS.border,
  },
  roomImage: { height: 140 },
  roomImagePlaceholder: {
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
  },
  mediaGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: "flex-end",
    padding: 12,
  },
  mediaOverlayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  categoryBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  floatingEditBtn: {
    backgroundColor: "#FFF",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  cardContent: { padding: 12 },
  priceContainer: { marginBottom: 8 },
  priceLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  priceRow: { flexDirection: "row", alignItems: "center" },
  priceText: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textMain,
    marginLeft: 2,
  },
  perNight: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
    alignSelf: "flex-end",
    marginBottom: 3,
  },

  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 10 },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  statBox: {
    width: "46%",
    flexDirection: "row",
    alignItems: "center",
  },
  statIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 7,
  },
  statValue: { fontSize: 12, fontWeight: "700", color: COLORS.textMain },
  statLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },

  amenitiesTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 6,
  },
  amenitiesContainer: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  amenityPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amenityText: { fontSize: 11, fontWeight: "600", color: COLORS.textMuted },

  // Modal styles
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: COLORS.textMain },
  closeBtn: { padding: 8 },
  modalContent: { padding: 20, paddingBottom: 60 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
    marginTop: 10,
    marginBottom: 12,
  },
  inputRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  inputGroup: { flex: 1, marginBottom: 16 },
  inputLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textMain,
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
  },
  removeNewImgBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: COLORS.danger,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  modalFooter: {
    padding: 20,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});