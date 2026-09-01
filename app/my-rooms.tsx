import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
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
import { useAuth } from "@/provider/AuthProvider";
import {
  BedDouble,
  Building2,
  Check,
  Clock,
  Edit2,
  Image as ImageIcon,
  IndianRupee,
  Plus,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react-native";
import Header from "../components/Header";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

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

const UnitsManagerModal = ({ room, token, onClose, showAlert }: any) => {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingUnit, setAddingUnit] = useState(false);
  const [newUnitData, setNewUnitData] = useState({
    room_number: "",
    floor: "",
    notes: "",
    status: "Available",
  });

  const handleApiError = (action: string, e: any) => {
    let msg = e.message;
    if (e.response) {
      console.error(
        `[${action}] Server Error ${e.response.status}:`,
        JSON.stringify(e.response.data, null, 2),
      );
      msg =
        e.response.data?.error ||
        e.response.data?.message ||
        `Server Error ${e.response.status}`;
    } else if (e.request) {
      console.error(`[${action}] Network Error (No response):`, e.request);
      msg = "Network error, could not reach server.";
    } else {
      console.error(`[${action}] Request Error:`, e.message);
    }
    showAlert({ type: "error", title: `${action} Failed`, message: msg });
  };

  useEffect(() => {
    fetchUnits();
  }, [room]);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/host/room-units/room-details/${room.id}/units`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUnits(res.data.data || []);
    } catch (e: any) {
      handleApiError("Fetch Units", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUnit = async (unitId: string, updatedData: any) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/host/room-units/${unitId}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUnits(
        units.map((u) => (u.id === unitId ? { ...u, ...updatedData } : u)),
      );
      showAlert({
        type: "success",
        title: "Updated",
        message: "Unit updated successfully.",
        primaryLabel: "OK",
      });
    } catch (e: any) {
      handleApiError("Update Unit", e);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/host/room-units/${unitId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnits(units.filter((u) => u.id !== unitId));
      showAlert({
        type: "success",
        title: "Deleted",
        message: "Unit deleted successfully.",
        primaryLabel: "OK",
      });
    } catch (e: any) {
      handleApiError("Delete Unit", e);
    }
  };

  const handleAddUnit = async () => {
    if (!newUnitData.room_number) {
      showAlert({
        type: "warning",
        title: "Required",
        message: "Room number is required.",
      });
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/host/room-units/room-details/${room.id}/units`,
        newUnitData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUnits([...units, res.data.data]);
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
    } catch (e: any) {
      handleApiError("Create Unit", e);
    }
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
          {loading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ color: COLORS.textMuted }}>Loading units...</Text>
            </View>
          ) : units.length === 0 ? (
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
  const { token } = useAuth();
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
  const [editLoading, setEditLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>(ALERT_HIDDEN);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const dismissAlert = () => setAlert((a) => ({ ...a, visible: false }));
  const showAlert = (config: Omit<AlertState, "visible">) =>
    setAlert({ ...config, visible: true });

  const fetchProperties = async () => {
    try {
      const [res, localRoomsStr] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/host/properties`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        AsyncStorage.getItem("local_rooms")
      ]);

      let localDrafts = [];
      if (localRoomsStr) {
        try {
          localDrafts = JSON.parse(localRoomsStr);
          setLocalRooms(localDrafts);
        } catch(e){}
      }

      if (res.data && Array.isArray(res.data.properties)) {
        setProperties(res.data.properties);
        if (res.data.properties.length > 0 && !selectedPropertyId) {
          setSelectedPropertyId(res.data.properties[0].id);
        } else if (localDrafts.length > 0 && !selectedPropertyId) {
          setSelectedPropertyId("local_drafts");
        }
      }
    } catch (e) {
      console.error("Failed to fetch properties:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProperties();
  }, [token]);

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

  const handleUpdateRoom = async () => {
    if (!editingRoom || !selectedPropertyId) return;

    const formData = new FormData();
    formData.append("base_price", editingRoom.base_price);
    formData.append("room_capacity", editingRoom.room_capacity);
    if (editingRoom.bed_count)
      formData.append("bed_count", editingRoom.bed_count);
    if (editingRoom.extra_bed_capacity)
      formData.append("extra_bed_capacity", editingRoom.extra_bed_capacity);
    if (editingRoom.extra_bed_price)
      formData.append("extra_bed_price", editingRoom.extra_bed_price);
    if (editingRoom.discount_percentage)
      formData.append("discount_percentage", editingRoom.discount_percentage);
    if (editingRoom.check_in_time)
      formData.append("check_in_time", editingRoom.check_in_time);
    if (editingRoom.check_out_time)
      formData.append("check_out_time", editingRoom.check_out_time);
    if (editingRoom.amenitiesStr)
      formData.append("amenities", editingRoom.amenitiesStr);

    imagesToDelete.forEach((img) => {
      formData.append("images_to_delete", img);
    });

    newImages.forEach((uri, index) => {
      const filename = uri.split("/").pop() ?? `room_${index}.jpg`;
      const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
      const mime = ext === "png" ? "image/png" : "image/jpeg";
      formData.append("room_images", {
        uri,
        name: filename,
        type: mime,
      } as any);
    });

    setEditLoading(true);
    try {
      await axios.patch(
        `${API_BASE_URL}/api/host/properties/${selectedPropertyId}/rooms/${editingRoom.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setEditingRoom(null);
      await fetchProperties();
      showAlert({
        type: "success",
        title: "Success",
        message: "Room updated successfully.",
        primaryLabel: "OK",
        onPrimary: dismissAlert,
      });
    } catch (error: any) {
      console.error(error.response?.data);
      showAlert({
        type: "error",
        title: "Error",
        message: error.response?.data?.error || "Failed to update room.",
        primaryLabel: "OK",
        onPrimary: dismissAlert,
      });
    } finally {
      setEditLoading(false);
    }
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
                source={{ uri: imgPath.startsWith("file://") || imgPath.startsWith("content://") ? imgPath : `${API_BASE_URL}${imgPath}` }}
                style={[styles.roomImage, { width: windowWidth - 40 }]}
              />
            )}
          />
        ) : (
          <View
            style={[styles.roomImagePlaceholder, { width: windowWidth - 40 }]}
          >
            <ImageIcon size={48} color={COLORS.textLight} opacity={0.5} />
            <Text
              style={{
                color: COLORS.textLight,
                marginTop: 8,
                fontSize: 13,
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
                <Sparkles size={12} color="#FFF" style={{ marginRight: 4 }} />
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
                <Edit2 size={16} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <View style={styles.priceRow}>
            <IndianRupee size={22} color={COLORS.primary} strokeWidth={2.5} />
            <Text style={styles.priceText}>{item.base_price}</Text>
            <Text style={styles.perNight}> / night</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={styles.statIconWrap}>
              <Users size={16} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>{item.room_capacity} Guests</Text>
              <Text style={styles.statLabel}>Max Capacity</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statIconWrap}>
              <BedDouble size={16} color={COLORS.primary} />
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
              <Clock size={16} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>
                {item.check_in_time || "14:00"}
              </Text>
              <Text style={styles.statLabel}>Check-in</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statIconWrap}>
              <Clock size={16} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>
                {item.check_out_time || "11:00"}
              </Text>
              <Text style={styles.statLabel}>Check-out</Text>
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
                    size={12}
                    color={COLORS.primary}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {!item.is_local && (
          <TouchableOpacity
            style={{
              marginTop: 16,
              paddingVertical: 12,
              backgroundColor: COLORS.primaryLight,
              borderRadius: 12,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(37, 99, 235, 0.2)",
            }}
            onPress={() => setManagingUnitsForRoom(item)}
          >
            <Text
              style={{ color: COLORS.primary, fontWeight: "700", fontSize: 14 }}
            >
              Edit Room Numbers
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <Header />

      <View style={styles.headerArea}>
        <Text style={styles.pageTitle}>Room Inventory</Text>
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
                              source={{ uri: `${API_BASE_URL}${img}` }}
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
          token={token}
          onClose={() => setManagingUnitsForRoom(null)}
          showAlert={showAlert}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.background },
  headerArea: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 10 },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
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

  propertyTabsContainer: { marginBottom: 16 },
  propertyTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
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

  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  roomCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 8,
  },
  cardMediaContainer: {
    height: 240,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    backgroundColor: COLORS.border,
  },
  roomImage: { height: 240 },
  roomImagePlaceholder: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
  },
  mediaGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: "flex-end",
    padding: 20,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  categoryBadgeText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  floatingEditBtn: {
    backgroundColor: "#FFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  cardContent: { padding: 20 },
  priceContainer: { marginBottom: 16 },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  priceRow: { flexDirection: "row", alignItems: "center" },
  priceText: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textMain,
    marginLeft: 2,
  },
  perNight: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "600",
    alignSelf: "flex-end",
    marginBottom: 6,
  },

  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 20 },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  statBox: {
    width: "46%",
    flexDirection: "row",
    alignItems: "center",
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  statValue: { fontSize: 14, fontWeight: "700", color: COLORS.textMain },
  statLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  amenitiesTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 12,
  },
  amenitiesContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  amenityPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amenityText: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted },

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
