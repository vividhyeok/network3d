# Network 3D Visualizer — Development Progress & Visualization Concepts

각 시각화 도구는 이론적 배경을 텍스트가 아닌, 상태 변화(State Machine)와 상호작용 가능한 시각적 은유(Visual Metaphors)로 설명하도록 설계되었습니다.

---

## 현재 구현 상태 (Screen / Tab Structure)

**최근 업데이트 사항 (UX/UI 개선 & 주요 기능):**
- **전체 탭 Self-Check 연동:** 9개 애니메이션 탭 전체 하단에 하드코딩된 '자기 점검 (Self-Check)' 레이어를 추가. 맥락 중심의 질문과 '논리 확인(Reasoning)' 토글을 통해 단순 암기가 아닌 원리 이해도 체크 기능 탑재 ★NEW
- **3D 풀스택 패킷 여정 시각화:** Application에서 생성된 HTTP GET이 TCP, IP, Frame 껍질을 차례로 입고(Encap), 비트스트림(Bit streams) 상태로 변환되어 물리적 라우터를 거친 뒤 수신자에게 도착하여 역캡슐화(Decap)되는 전 과정을 역동적으로 구현 ★NEW
- **LayerSlab 상호작용성 강화:** 모든 애니메이션이 종료된 후 각 Layer 층이 은은하게 빛나며 `자세히 보기 →` 인디케이터가 생성됨. 클릭 시 상세 드릴다운 스크린으로 자동 연결 ★NEW
- **애니메이션 스크롤 & 클리핑 픽스:** Drill-down 패널 안의 탭이 늘어날 경우를 대비하여 `overflow-y-auto` 스크롤링과 `min-h-full` 반응형 높이를 도입, UI 잘림과 사라짐 등 실사용 문제 완벽 해결 ★PATCHED
- **3D 카메라 인터랙션 안정화:** Drill-down 상태에서 창을 닫을 시 카메라가 원상복구(Zoom-out)되도록 조치하였으며 3D 모델 뷰를 조작할 때 발생하는 Snap-back 현상 제거 ★PATCHED
- **시각화 애니메이션 속도 증가:** 기본 애니메이션 속도 1.5배 부스트 (slow: 0.45, normal: 1.2, fast: 2.7) ★PATCHED

```
ApplicationScreen (탭 3개 + Self-Check)
  ├─ HTTP         → HttpTimeline.jsx
  ├─ DNS          → DnsResolver.jsx
  └─ P2P          → P2PvsCS.jsx

TransportScreen (탭 5개 + Self-Check)
  ├─ Connection Setup → TcpHandshake.jsx
  ├─ RDT Evolution    → RdtAnimation.jsx  (Pipelining 탭 포함)
  ├─ Mux / Demux      → MultiplexingDemo.jsx
  ├─ Congestion Control → CongestionGraph.jsx
  └─ Flow Control     → FlowControlBuffer.jsx

NetworkScreen (탭 1개 + Self-Check)
  └─ Forwarding vs Routing   → ForwardingVsRouting.jsx
```

---

## 1. Application Layer (응용 계층)

### 1-A. HTTP Timeline (`HttpTimeline.jsx`)
**개념:** Non-Persistent HTTP vs Persistent (Pipelined) HTTP의 RTT 비용 차이

**시각화 방식:**
- 좌(Client) — 우(Server) 시퀀스 다이어그램 형태, 시간은 위→아래.
- **비지속 연결:** HTML + 이미지 2장 기준 매 파일마다 TCP SYN/SYN-ACK/GET/Response 4-way를 반복하는 과정을 화살표로 표현. 총 **6 RTT** 소요.
- **지속형 파이프라인:** 최초 연결 1번만 맺고, 이후 GET 요청들을 동시에 쏘아올려 응답도 동시에 수신. **~3 RTT** 소요.
- 토글 버튼으로 두 모드 전환 가능.
- 하단 부착: 상황 기반 **Self-Check 레이어** 제공.

---

### 1-B. DNS Resolver (`DnsResolver.jsx`)
**개념:** Iterative / Recursive DNS 질의 과정, 그리고 캐싱의 효과

**시각화 방식:**
- 5개 노드(PC, Local DNS, Root, TLD, Auth) 를 원형 배치하고, 패킷(황금 점)이 노드 간 SVG 선을 따라 이동.
- **Iterative:** Local DNS가 직접 Root → TLD → Auth를 차례로 왕복 방문하며 길을 물음.
- **Recursive:** 질문이 Root → TLD → Auth로 전달되고 답이 역방향으로 돌아옴.
- **캐싱 연시:** 첫 질의 완료 후 "Query Again" 버튼 클릭 시 같은 도메인 재질의. Local DNS만 방문하고 즉시 응답(Cache HIT). Local DNS 노드가 초록빛으로 강조.
- 하단 배너: "1st query: 4 hops → 2nd query: 1 hop (cached)" 비교 표시.
- 하단 부착: 상황 기반 **Self-Check 레이어** 제공.

---

### 1-C. P2P vs Client-Server (`P2PvsCS.jsx`)
**개념:** 클라이언트 수 증가에 따른 분산 시간 확장성 비교 — P2P의 자가 확장(Self-Scaling) 원리

**시각화 방식:**
- 좌우 2개 패널 비교 구조.
- **좌측 (Client-Server):** 서버 1대에서 N명에게 파일 배포. 슬라이더로 N 증가 시 서버 업로드 바틀넥 붉게 강조.
- **우측 (P2P):** 피어가 늘어날수록 전체 업로드 용량 비례 증가 구현. 피어 네트워크 연출 제공.
- 핵심 문구: "P2P: every new peer brings new upload capacity"
- 하단 부착: 상황 기반 **Self-Check 레이어** 제공.

---

## 2. Transport Layer (전송 계층)

### 2-A. TCP 3-Way Handshake (`TcpHandshake.jsx`)
**개념:** TCP 연결 수립 비용 — 데이터 흐름 전 1 RTT가 소모되는 이유

**시각화 방식:**
- Client(좌) / Server(우) 수직 라인 + 시퀀스 다이어그램 방식.
- **▶ Play Setup** 클릭 시 단계별 화살표가 순서대로 렌더링.
- **Show Teardown** 토글로 4-way FIN 과정(FIN/ACK/FIN/ACK) 및 TIME_WAIT 시각 애니메이션 포함.
- 핵심 문구: "TCP costs 1 RTT just to say hello — this is why HTTP persistent connections matter"
- 하단 부착: 상황 기반 **Self-Check 레이어** 제공.

---

### 2-B. RDT Evolution (`RdtAnimation.jsx`)
**개념:** 신뢰적 데이터 전송 프로토콜의 단계적 발전 (RDT 1.0 → 2.0 → 3.0 → Pipelining)

**시각화 방식:**
- **RDT 1.0:** 완벽 채널, 에러 없음.
- **RDT 2.0:** 패킷 손상 주입 → 수신 측 NAK 발송 → 자동 재전송 표현.
- **RDT 3.0:** 패킷 소실 → 타이머 카운트다운 후 Timeout 재전송 시뮬레이션. 
- **Pipelining 탭:**
  - 윈도우 크기 선택 및 GBN / Selective Repeat 서브 토글
  - 패킷 큐 슬롯 시각화 및 낙오 패킷별 재전송 정책 분리 묘사
- 하단 부착: 상황 기반 **Self-Check 레이어** 제공.

---

### 2-C. Mux / Demux (`MultiplexingDemo.jsx`) 
**개념:** 포트 번호를 통한 전송 계층의 다중화/역다중화, UDP vs TCP의 차이

**시각화 방식:**
- **UDP 모드:** dst port만 보고 소켓 결정. 같은 dst port = 항상 같은 소켓.
- **TCP 모드:** 4-tuple 기반. 같은 port 80으로 오는 서로 다른 클라이언트 연결이 각각 독립 소켓 분배됨을 표현.
- "Simulate" 버튼 애니메이션 / Demux Log 라우팅 기록 실시간 표시.
- 하단 부착: 상황 기반 **Self-Check 레이어** 제공.

---

### 2-D. TCP Congestion Control (`CongestionGraph.jsx`)
**개념:** 혼잡 제어 알고리즘 — Fast Retransmit vs Timeout의 차이

**시각화 방식:**
- **Fast Retransmit (3-Dup-ACK):** 주황색 그래프 효과. ssthresh = cwnd/2, cwnd = ssthresh → Slow Start 건너뛰고 CA 직진.
- **Timeout:** 빨간색 그래프 효과. cwnd → 1, ssthresh = cwnd/2 → Full Slow Start 처음부터 재시작.
- 두 이벤트에 대해 시각적 차이를 두어 보수적 혼잡 윈도우 대응 전략 묘사.
- 하단 부착: 상황 기반 **Self-Check 레이어** 제공.

---

### 2-E. TCP Flow Control (`FlowControlBuffer.jsx`)
**개념:** 수신자 버퍼 용량에 따른 발신 속도 조절 (rwnd 광고)

**시각화 방식:**
- 앱 계층 읽기 속도 조절(0/1/3 rate)로 수신 버퍼 찰흙 그래픽 차오름/경고 시뮬레이션.
- ACK 당 rwnd 값 인디케이터 표시.
- 하단 부착: 상황 기반 **Self-Check 레이어** 제공.

---

## 3. Network Layer (네트워크 계층)

### 3-A. Forwarding vs Routing (`ForwardingVsRouting.jsx`)
**개념:** Data Plane (패킷 전달 = 하드웨어 수준 실행)과 Control Plane (경로 계산 = 소프트웨어 수준 계획)의 분리

**시각화 방식:**
- **우측 (Routing):** 소프트웨어 계산 과정인 최단 경로 알고리즘(Dijkstra/OSPF) 하이라이팅 표출. 계산 결과를 FIB로 전달.
- **좌측 (Forwarding):** 패킷 도착 → 라우터 내부 FIB 테이블과 대조 → 지정 출력 포트로 즉시 전달 묘사. 하드웨어 포워딩 표현.
- 하단 부착: 상황 기반 **Self-Check 레이어** 제공.
