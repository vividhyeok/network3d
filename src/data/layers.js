export const layers = [
  {
    id: "application",
    name: "Application",
    role: "사용자 서비스 정의",
    protocols: ["HTTP", "DNS", "SMTP"],
    pdu: "Message",
    concept: "어떤 데이터를 보낼지 정의한다",
    yPos: 2.5,
    color: "#1e3a8a", // dark blue
    opacity: 0.85
  },
  {
    id: "transport",
    name: "Transport",
    role: "프로세스 간 신뢰성/다중화",
    protocols: ["TCP", "UDP"],
    pdu: "Segment",
    concept: "포트 번호로 프로세스를 구분하고, TCP는 신뢰성을 보장한다",
    yPos: 1.25,
    color: "#2563eb", // blue
    opacity: 0.85
  },
  {
    id: "network",
    name: "Network",
    role: "호스트 간 경로 결정",
    protocols: ["IP", "OSPF", "BGP"],
    pdu: "Packet",
    concept: "IP 주소로 목적지를 찾고, 라우터가 경로를 결정한다",
    yPos: 0,
    color: "#3b82f6", // light blue
    opacity: 0.85
  },
  {
    id: "link",
    name: "Link",
    role: "인접 노드 간 프레임 전달",
    protocols: ["Ethernet", "Wi-Fi"],
    pdu: "Frame",
    concept: "MAC 주소로 같은 네트워크 내 기기를 구분한다",
    yPos: -1.25,
    color: "#06b6d4", // cyan
    opacity: 0.85
  },
  {
    id: "physical",
    name: "Physical",
    role: "비트를 신호로 변환",
    protocols: ["DSL", "광섬유"],
    pdu: "Bits",
    concept: "0과 1을 전기/빛/전파로 바꿔 물리 매체로 내보낸다",
    yPos: -2.5,
    color: "#0d9488", // teal
    opacity: 0.85
  }
];
