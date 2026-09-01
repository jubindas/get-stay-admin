import Header from "@/components/Header";

import React, { useState } from "react";

import * as ImagePicker from "expo-image-picker";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useRouter } from "expo-router";

import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

const C = {
  primary: "#4F6EF7",
  primaryLight: "#EEF1FE",
  bg: "#F5F6FA",
  card: "#FFFFFF",
  border: "#E4E8F0",
  text: "#1A1D2E",
  sub: "#64748B",
  placeholder: "#94A3B8",
  badge: "#DCFCE7",
  badgeText: "#166534",
};

function Card({
  title,
  subheader,
  sub,
  children,
}: {
  title: string;
  subheader?: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title}</Text>
      {subheader ? <Text style={s.cardSub}>{subheader}</Text> : null}
      {sub ? <Text style={s.cardSub}>{sub}</Text> : null}
      <View style={s.cardBody}>{children}</View>
    </View>
  );
}

function Counter({
  label,
  value,
  onChange,
  min = 0,
}: {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <View style={s.ctrWrap}>
      {label ? <Text style={s.fieldLbl}>{label}</Text> : null}
      <View style={s.ctrRow}>
        <TouchableOpacity
          style={[s.ctrBtn, value <= min && s.ctrBtnDisabled]}
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          activeOpacity={0.7}
        >
          <Text style={s.ctrBtnTxt}>−</Text>
        </TouchableOpacity>
        <View style={s.ctrVal}>
          <Text style={s.ctrValTxt}>{value}</Text>
        </View>
        <TouchableOpacity
          style={s.ctrBtn}
          onPress={() => onChange(value + 1)}
          activeOpacity={0.7}
        >
          <Text style={s.ctrBtnTxt}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Dropdown({
  placeholder,
  options,
  selectedValue,
  onSelect,
}: {
  placeholder: string;
  options: string[];
  selectedValue: string;
  onSelect: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <>=99
      <TouchableOpacity
        style={s.dd}
        activeOpacity={0.7}
        onPress={() => setVisible(true)}
      >
        <Text style={[s.ddTxt, selectedValue ? { color: C.text } : null]}>
          {selectedValue || placeholder}
        </Text>
        <Text style={s.ddChev}>▾</Text>
      </TouchableOpacity>
      <Modal transparent visible={visible} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={s.overlay}>
            <View style={s.modalBox}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[s.modalItem, selectedValue === opt && s.modalItemOn]}
                  onPress={() => {
                    onSelect(opt);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      s.modalItemTxt,
                      selectedValue === opt && s.modalItemTxtOn,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

function RupeInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={s.rupeWrap}>
      <Text style={s.rupeSym}>₹</Text>
      <TextInput
        style={s.rupeField}
        placeholder={placeholder}
        placeholderTextColor={C.placeholder}
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

const AMENITIES = [
  { icon: "🏡", label: "Private balcony" },
  { icon: "📺", label: "Smart TV" },
  { icon: "❄️", label: "AC" },
  { icon: "🚰", label: "RO Water Purifier" },
  { icon: "🚿", label: "Geyser" },
  { icon: "☕", label: "Tea/Coffee Maker" },
  { icon: "🔋", label: "Power Backup" },
  { icon: "🛜", label: "Free Wi-Fi" },
];

const ROOM_CATEGORIES = [
  "Standard Room (Single Bed)",
  "Deluxe Room (Double Bed)",
  "Premium Suite (King Bed)",
  "Family Suite (2 Double Beds)"
];
const BED_TYPES = ["Single Bed", "Double Bed", "Queen Bed", "King Bed", "Bunk Bed", "Twin Bed"];
const EXTRA_BED_TYPES = ["Single Bed", "Floor Mattress", "Folding Bed"];
const TOILET_TYPES = ["Attached Western", "Attached Indian", "Shared Indian", "Shared Western"];
const HEATING_TYPES = ["Room Heater", "Central Heating", "No Heating"];

// ── Pages ─────────────────────────────────────────────────────────────────────

function PageOne({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <Card title="Room Details" sub="Give your room a clear, descriptive name">
        <Text style={s.fieldLbl}>Room name</Text>
        <TextInput
          style={s.input}
          placeholder="e.g. Deluxe Mountain View"
          placeholderTextColor={C.placeholder}
          value={form.roomName}
          onChangeText={(v) => setForm({ ...form, roomName: v })}
        />
      </Card>

      <Card title="Guest Capacity" sub="Maximum number of guests allowed">
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
          <Counter
            label="Capacity"
            value={form.maxPersons}
            onChange={(v) => setForm({ ...form, maxPersons: v })}
            min={1}
          />
          <Counter
            label="Adults"
            value={form.maxAdults}
            onChange={(v) => setForm({ ...form, maxAdults: v })}
            min={1}
          />
          <Counter
            label="Children"
            value={form.maxChildren}
            onChange={(v) => setForm({ ...form, maxChildren: v })}
          />
        </View>
      </Card>

      <Card title="Rooms" sub="Specify total rooms and numbers">
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text style={[s.fieldLbl, { marginBottom: 0 }]}>Total Rooms</Text>
          <TextInput
            style={[s.input, { flex: 1, paddingVertical: 7 }]}
            placeholder="e.g. 3"
            keyboardType="numeric"
            placeholderTextColor={C.placeholder}
            value={form.totalRooms}
            onChangeText={(v) => {
              const numStr = v.replace(/[^0-9]/g, '');
              const num = parseInt(numStr, 10) || 0;
              const newRoomNumbers = [...(form.roomNumbers || [])];
              if (num > newRoomNumbers.length) {
                for (let i = newRoomNumbers.length; i < num; i++) {
                  newRoomNumbers.push("");
                }
              } else if (num < newRoomNumbers.length) {
                newRoomNumbers.length = num;
              }
              setForm({ ...form, totalRooms: numStr, roomNumbers: newRoomNumbers });
            }}
          />
        </View>

        {form.roomNumbers && form.roomNumbers.length > 0 && (
          <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {form.roomNumbers.map((roomNo: string, index: number) => (
              <TextInput
                key={index}
                style={[s.input, { width: "31%", paddingVertical: 7, paddingHorizontal: 8 }]}
                placeholder={`Room ${index + 1}`}
                placeholderTextColor={C.placeholder}
                value={roomNo}
                onChangeText={(val) => {
                  const newRoomNumbers = [...form.roomNumbers];
                  newRoomNumbers[index] = val;
                  setForm({ ...form, roomNumbers: newRoomNumbers });
                }}
              />
            ))}
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

function PageTwo({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setForm({ ...form, customCategories: [...(form.customCategories || []), newCategory.trim()] });
      setNewCategory("");
      setCategoryModalVisible(false);
    }
  };

  const allCategories = [...ROOM_CATEGORIES, ...(form.customCategories || [])];

  // Use roomConfigs, fallback to initializing it if not present
  const configs = form.roomConfigs || [
    { room: "", roomCategory: "", beds: [{ bedType: "", bedCount: 1 }], extraBedType: "", extraBedPrice: "", tariff: "" }
  ];

  const addConfig = () => {
    setForm({
      ...form,
      roomConfigs: [
        ...configs,
        { room: "", roomCategory: "", beds: [{ bedType: "", bedCount: 1 }], extraBedType: "", extraBedPrice: "", tariff: "" },
      ],
    });
  };

  const updateConfig = (index: number, field: string, value: any) => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setForm({ ...form, roomConfigs: newConfigs });
  };

  const removeConfig = (index: number) => {
    const newConfigs = configs.filter((_: any, i: number) => i !== index);
    setForm({ ...form, roomConfigs: newConfigs });
  };

  const addBed = (configIndex: number) => {
    const newConfigs = [...configs];
    newConfigs[configIndex].beds = [...(newConfigs[configIndex].beds || []), { bedType: "", bedCount: 1 }];
    setForm({ ...form, roomConfigs: newConfigs });
  };

  const updateBed = (configIndex: number, bedIndex: number, field: string, value: any) => {
    const newConfigs = [...configs];
    const updatedBeds = [...(newConfigs[configIndex].beds || [])];
    updatedBeds[bedIndex] = { ...updatedBeds[bedIndex], [field]: value };
    newConfigs[configIndex].beds = updatedBeds;
    setForm({ ...form, roomConfigs: newConfigs });
  };

  const removeBed = (configIndex: number, bedIndex: number) => {
    const newConfigs = [...configs];
    newConfigs[configIndex].beds = (newConfigs[configIndex].beds || []).filter((_: any, i: number) => i !== bedIndex);
    setForm({ ...form, roomConfigs: newConfigs });
  };

  const roomOptions = (form.roomNumbers || []).filter(Boolean);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      {configs.map((config: any, cIndex: number) => (
        <Card key={cIndex} title={`Room Configuration ${cIndex + 1}`} sub="Configure category and pricing for a specific room">
          {configs.length > 1 && (
            <TouchableOpacity onPress={() => removeConfig(cIndex)} style={{ position: 'absolute', right: 14, top: 14, padding: 4 }}>
              <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: "600" }}>Remove Config</Text>
            </TouchableOpacity>
          )}



          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <Text style={[s.fieldLbl, { marginBottom: 0 }]}>Room Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(true)} style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: C.primary, fontSize: 11, fontWeight: "600" }}>＋ Add Category</Text>
              </TouchableOpacity>
            </View>
            <Dropdown
              placeholder="Select room category (e.g. Deluxe Room)"
              options={allCategories}
              selectedValue={config.roomCategory}
              onSelect={(v) => updateConfig(cIndex, 'roomCategory', v)}
            />
          </View>

          <View style={{ marginTop: 20, marginBottom: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: C.text }}>Beds in this Category</Text>
          </View>

          {(config.beds || []).map((bed: any, bIndex: number) => (
            <View key={bIndex} style={{ backgroundColor: C.primaryLight + '30', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: C.border }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: C.text }}>Bed {bIndex + 1}</Text>
                {(config.beds || []).length > 1 && (
                  <TouchableOpacity onPress={() => removeBed(cIndex, bIndex)} style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: "600" }}>Remove Bed</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={s.fieldLbl}>Type of Bed</Text>
              <Dropdown
                placeholder="Select bed type"
                options={BED_TYPES}
                selectedValue={bed.bedType}
                onSelect={(v) => updateBed(cIndex, bIndex, 'bedType', v)}
              />

              <View style={[s.row, { marginTop: 14, alignItems: "center" }]}>
                <Text style={[s.fieldLbl, { marginBottom: 0, flex: 1 }]}>
                  Number of this bed type
                </Text>
                <Counter
                  value={bed.bedCount}
                  onChange={(v) => updateBed(cIndex, bIndex, 'bedCount', v)}
                  min={1}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={{ marginBottom: 20, alignSelf: "flex-start", paddingVertical: 6 }}
            activeOpacity={0.7}
            onPress={() => addBed(cIndex)}
          >
            <Text style={{ color: C.primary, fontWeight: "600", fontSize: 13 }}>＋ Add another Bed to this Category</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 6, marginBottom: 12, borderTopWidth: 1, borderColor: C.border, paddingTop: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: C.text, marginBottom: 4 }}>Tariffs & Extra Beds</Text>
          </View>

          <Text style={s.fieldLbl}>Extra Bed Type (Optional)</Text>
          <Dropdown
            placeholder="Select extra bed type"
            options={EXTRA_BED_TYPES}
            selectedValue={config.extraBedType}
            onSelect={(v) => updateConfig(cIndex, 'extraBedType', v)}
          />

          <View style={[s.row, { marginTop: 14 }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={s.fieldLbl}>Room Tariff</Text>
              <RupeInput
                placeholder="0"
                value={config.tariff}
                onChange={(v) => updateConfig(cIndex, 'tariff', v)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLbl}>Extra Bed Price</Text>
              <RupeInput
                placeholder="0"
                value={config.extraBedPrice}
                onChange={(v) => updateConfig(cIndex, 'extraBedPrice', v)}
              />
            </View>
          </View>
        </Card>
      ))}

      <TouchableOpacity style={s.addRoomBtn} activeOpacity={0.7} onPress={addConfig}>
        <Text style={s.addRoomBtnTxt}>＋ Add another Room Config</Text>
      </TouchableOpacity>

      <Modal transparent visible={isCategoryModalVisible} animationType="fade">
        <View style={s.overlay}>
          <View style={[s.modalBox, { padding: 16 }]}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: C.text, marginBottom: 12 }}>Add New Category</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Super Deluxe Room"
              placeholderTextColor={C.placeholder}
              value={newCategory}
              onChangeText={setNewCategory}
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)} style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
                <Text style={{ color: C.sub, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddCategory} style={{ backgroundColor: C.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 }}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function PageThree({
  form,
  setForm,
}: {
  form: any;
  setForm: (f: any) => void;
}) {
  const toggle = (label: string) => {
    const cur: string[] = form.amenities || [];
    setForm({
      ...form,
      amenities: cur.includes(label)
        ? cur.filter((a) => a !== label)
        : [...cur, label],
    });
  };
  const active = (label: string) => (form.amenities || []).includes(label);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setForm({ ...form, images: [...(form.images || []), ...newImages] });
    }
  };

  const removeImage = (uri: string) => {
    setForm({
      ...form,
      images: (form.images || []).filter((img: string) => img !== uri),
    });
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <Card title="Toilet And Room Heater">
        <View style={[s.row, { marginTop: 0 }]}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={s.fieldLbl}>Toilet type</Text>
            <Dropdown
              placeholder="Select"
              options={TOILET_TYPES}
              selectedValue={form.toiletType}
              onSelect={(v) => setForm({ ...form, toiletType: v })}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.fieldLbl}>Room heating</Text>
            <Dropdown
              placeholder="Select"
              options={HEATING_TYPES}
              selectedValue={form.heatingType}
              onSelect={(v) => setForm({ ...form, heatingType: v })}
            />
          </View>
        </View>
      </Card>

      <Card title="Amenities" subheader="Amenities we provide in our Rooms">
        <View style={s.chipGrid}>
          {AMENITIES.map(({ icon, label }) => (
            <TouchableOpacity
              key={label}
              style={[s.chip, active(label) && s.chipOn]}
              onPress={() => toggle(label)}
              activeOpacity={0.75}
            >
              <Text style={s.chipIcon}>{icon}</Text>
              <Text
                style={[s.chipLbl, active(label) && s.chipLblOn]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card title="Room Photos" sub="Upload high quality images">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {(form.images || []).map((uri: string, idx: number) => (
            <View key={idx} style={{ marginRight: 10, position: "relative" }}>
              <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
              <TouchableOpacity
                style={{
                  position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 12, width: 24, height: 24, justifyContent: "center", alignItems: "center"
                }}
                onPress={() => removeImage(uri)}
              >
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity style={s.photoBtn} activeOpacity={0.7} onPress={pickImages}>
          <Text style={s.photoBtnTxt}>＋ Add Photos</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function AddRoomsTemp() {
  const router = useRouter();
  const [page, setPage] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    roomName: "",
    maxPersons: 2,
    maxAdults: 2,
    maxChildren: 0,
    totalRooms: "",
    roomNumbers: [] as string[],
    roomConfigs: [
      {
        room: "",
        roomCategory: "",
        beds: [{ bedType: "", bedCount: 1 }],
        extraBedType: "",
        extraBedPrice: "",
        tariff: "",
      }
    ],
    toiletType: "",
    heatingType: "",
    amenities: [] as string[],
    customCategories: [] as string[],
    images: [] as string[],
  });

  const saveToLocal = async () => {
    try {
      const existingRoomsStr = await AsyncStorage.getItem("local_rooms");
      const existingRooms = existingRoomsStr ? JSON.parse(existingRoomsStr) : [];

      const newRoom = {
        id: Date.now().toString(),
        ...form,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem("local_rooms", JSON.stringify([newRoom, ...existingRooms]));
      alert("Rooms saved locally!");
      router.push("/my-rooms");
    } catch (e) {
      console.error("Failed to save room locally", e);
      alert("Failed to save room");
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Header />

        {/* Property strip */}
        <View style={s.propStrip}>
          <View style={s.propThumb}>
            <Text style={{ fontSize: 18 }}>🏨</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.propName}>Taj Aravali Resort & Spa</Text>
            <Text style={s.propSub}>Udaipur, Rajasthan</Text>
          </View>
          <View style={s.selBadge}>
            <Text style={s.selTxt}>SELECTED</Text>
          </View>
        </View>

        {/* Page content */}
        <View style={{ flex: 1 }}>
          {page === 1 && <PageOne form={form} setForm={setForm} />}
          {page === 2 && <PageTwo form={form} setForm={setForm} />}
          {page === 3 && <PageThree form={form} setForm={setForm} />}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          {page > 1 && (
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => setPage((p) => (p - 1) as any)}
              activeOpacity={0.8}
            >
              <Text style={s.backTxt}>← Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={s.cta}
            onPress={() =>
              page < 3 ? setPage((p) => (p + 1) as any) : saveToLocal()
            }
            activeOpacity={0.85}
          >
            <Text style={s.ctaTxt}>{page === 3 ? "Save Rooms" : "Next →"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  iconBtn: { width: 32, alignItems: "center" },
  iconTxt: { fontSize: 16, color: C.text },
  headerLogo: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
  },

  propStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  propThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: C.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  propName: { fontSize: 13, fontWeight: "700", color: C.text },
  propSub: { fontSize: 11, color: C.sub, marginTop: 1 },
  selBadge: {
    backgroundColor: C.badge,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selTxt: { fontSize: 9, fontWeight: "700", color: C.badgeText },

  stepHeader: { paddingHorizontal: 16, marginTop: 14, marginBottom: 2 },
  stepLabelRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 8,
  },
  stepTitle: { fontSize: 15, fontWeight: "800", color: C.text },
  stepOf: { fontSize: 13, color: C.sub, fontWeight: "500" },
  progressContainer: { flexDirection: "row", gap: 6 },
  progressSeg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
  },
  progressSegFill: { backgroundColor: C.primary },
  stepPageLabel: {
    fontSize: 12,
    color: C.sub,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 2,
  },

  page: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20, gap: 10 },

  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#1A1D2E",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: C.text },
  cardSub: { fontSize: 11, color: C.sub, marginTop: 2 },
  cardBody: { marginTop: 12 },

  fieldLbl: { fontSize: 11, fontWeight: "600", color: C.sub, marginBottom: 5 },

  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: C.text,
    backgroundColor: C.bg,
  },

  row: { flexDirection: "row", marginTop: 10 },

  ctrWrap: { marginBottom: 2 },
  ctrRow: { flexDirection: "row", alignItems: "center" },
  ctrBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  ctrBtnDisabled: { opacity: 0.35 },
  ctrBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "600", lineHeight: 18 },
  ctrVal: {
    minWidth: 32,
    height: 28,
    marginHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    backgroundColor: C.bg,
  },
  ctrValTxt: { fontSize: 14, fontWeight: "700", color: C.text },

  dd: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: C.bg,
  },
  ddTxt: { flex: 1, fontSize: 13, color: C.placeholder },
  ddChev: { fontSize: 11, color: C.sub },

  rupeWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    backgroundColor: C.bg,
    paddingLeft: 10,
  },
  rupeSym: { fontSize: 13, fontWeight: "600", color: C.text, marginRight: 3 },
  rupeField: { flex: 1, fontSize: 13, color: C.text, paddingVertical: 9 },

  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.bg,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipOn: { backgroundColor: C.primary },
  chipIcon: { fontSize: 12 },
  chipLbl: { fontSize: 12, color: C.sub, fontWeight: "600" },
  chipLblOn: { color: "#fff", fontWeight: "700" },

  photoBtn: {
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.primary,
    borderRadius: 8,
    borderStyle: "dashed",
    backgroundColor: C.primaryLight + "50",
  },

  photoBtnTxt: { color: C.primary, fontWeight: "600", fontSize: 13 },

  addRoomBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.primary,
    borderRadius: 8,
    borderStyle: "dashed",
    backgroundColor: C.primaryLight + "50",
  },
  addRoomBtnTxt: { color: C.primary, fontWeight: "600", fontSize: 13 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: C.card,
    borderRadius: 12,
    width: "78%",
    padding: 6,
  },
  modalItem: { padding: 12, borderRadius: 8 },
  modalItemOn: { backgroundColor: C.primaryLight },
  modalItemTxt: { fontSize: 13, color: C.text },
  modalItemTxtOn: { color: C.primary, fontWeight: "600" },

  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderColor: C.border,
    marginBottom: 35,
  },
  backBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: "center",
    alignItems: "center",
  },
  backTxt: { fontSize: 13, fontWeight: "600", color: C.sub },
  cta: {
    flex: 1,
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  ctaTxt: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
