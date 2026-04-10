export const BUILDING_CONSTANTS = {
  FLOOR_COUNT: 6,
  FLOOR_HEIGHT: 3.5,
  BUILDING_WIDTH: 20,
  BUILDING_DEPTH: 14,
  EXPLODE_SPACING: 3,
  CAMERA_INITIAL_RADIUS: 50,
  CAMERA_INITIAL_THETA: Math.PI / 4,
  CAMERA_INITIAL_PHI: Math.PI / 3,
};

export const FLOOR_CONFIGS = [
  {
    name: "大堂 & 前台",
    color: 0x8fbc8f,
    occupancy: 0.3,
    furnitureType: "lobby",
    rooms: [
      { x: 0, z: 0, w: 18, d: 12, label: "主大堂" },
      { x: -6, z: -4, w: 5, d: 4, label: "安保室" },
    ],
  },
  {
    name: "开放办公区 A",
    color: 0x87ceeb,
    occupancy: 0.85,
    furnitureType: "office",
    rooms: [
      { x: -5, z: 0, w: 8, d: 12, label: "Alpha 团队" },
      { x: 5, z: 0, w: 8, d: 12, label: "Beta 团队" },
    ],
  },
  {
    name: "开放办公区 B",
    color: 0x87ceeb,
    occupancy: 0.6,
    furnitureType: "office",
    rooms: [
      { x: -5, z: 0, w: 8, d: 12, label: "Gamma 团队" },
      { x: 5, z: 0, w: 8, d: 12, label: "Delta 团队" },
    ],
  },
  {
    name: "会议 & 研讨",
    color: 0xdda0dd,
    occupancy: 0.45,
    furnitureType: "meeting",
    rooms: [
      { x: -6, z: -3, w: 6, d: 5, label: "会议室 A" },
      { x: 6, z: -3, w: 6, d: 5, label: "会议室 B" },
      { x: -6, z: 3, w: 6, d: 5, label: "会议室 C" },
      { x: 6, z: 3, w: 6, d: 5, label: "董事会议室" },
    ],
  },
  {
    name: "机房 & IT",
    color: 0xf0e68c,
    occupancy: 0.15,
    furnitureType: "server",
    rooms: [
      { x: -4, z: 0, w: 10, d: 10, label: "服务器机房" },
      { x: 6, z: 0, w: 6, d: 10, label: "IT 办公室" },
    ],
  },
  {
    name: "屋顶花园",
    color: 0x90ee90,
    occupancy: 0.2,
    furnitureType: "garden",
    rooms: [{ x: 0, z: 0, w: 16, d: 10, label: "花园区域" }],
  },
];
