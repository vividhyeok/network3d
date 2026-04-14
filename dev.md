# Network 3D Visualizer — Development Progress & Visualization Concepts

각 시각화 도구는 이론적 배경을 텍스트가 아닌, 상태 변화(State Machine)와 상호작용 가능한 시각적 은유(Visual Metaphors)로 설명하도록 설계되었습니다.

---

## 현재 구현 상태 (Screen / Tab Structure)

**최근 업데이트 사항 (UX/UI 개선):**
- **시각화 애니메이션 속도 증가:** 기본 애니메이션 속도 1.5배 부스트 (slow: 0.45, normal: 1.2, fast: 2.7) ★PATCHED
- **3D 카메라 인터랙션 안정화:** Drill-down 상태에서 3D 모델 뷰를 조작할 때 시점이 카메라 줌인 타겟으로 다시 강제 이동(Snap-back)되는 현상 제거 ★PATCHED

```
ApplicationScreen (탭 3개)
  ├─ HTTP         → HttpTimeline.jsx
  ├─ DNS          → DnsResolver.jsx
  └─ P2P ★NEW    → P2PvsCS.jsx

TransportScreen (탭 5개)
  ├─ Connection Setup ★NEW  → TcpHandshake.jsx
  ├─ RDT Evolution           → RdtAnimation.jsx  (Pipelining 탭 ★PATCHED)
  ├─ Mux / Demux ★NEW       → MultiplexingDemo.jsx
  ├─ Congestion Control      → CongestionGraph.jsx (Fast Retransmit 구분 ★PATCHED)
  └─ Flow Control            → FlowControlBuffer.jsx

NetworkScreen (탭 1개)
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

---

### 1-B. DNS Resolver (`DnsResolver.jsx`) ★PATCHED
**개념:** Iterative / Recursive DNS 질의 과정, 그리고 캐싱의 효과

**시각화 방식:**
- 5개 노드(PC, Local DNS, Root, TLD, Auth) 를 원형 배치하고, 패킷(황금 점)이 노드 간 SVG 선을 따라 이동.
- **Iterative:** Local DNS가 직접 Root → TLD → Auth를 차례로 왕복 방문하며 길을 물음.
- **Recursive:** 질문이 Root → TLD → Auth로 전달되고 답이 역방향으로 돌아옴.
- **▶ Query** 버튼으로 애니메이션 시작, `Step X/Y` 카운터로 진행 상황 표시.
- ★ **캐싱 연시:** 첫 질의 완료 후 "Query Again" 버튼 등장. 클릭 시 같은 도메인을 다시 질의하면 Local DNS만 방문하고 즉시 응답(Cache HIT — TTL: 47s). Local DNS 노드가 초록빛으로 강조.
- 하단 배너: "1st query: 4 hops → 2nd query: 1 hop (cached)" 비교 표시.

---

### 1-C. P2P vs Client-Server (`P2PvsCS.jsx`) ★NEW
**개념:** 클라이언트 수 증가에 따른 분산 시간 확장성 비교 — P2P의 자가 확장(Self-Scaling) 원리

**시각화 방식:**
- 좌우 2개 패널 비교 구조.
- **좌측 (Client-Server):** 서버 1대에서 N명에게 파일 배포. 슬라이더로 N 증가 시 서버 업로드 바틀넥이 붉게 하이라이팅. D_cs = max(NF/Us, F/dmin) 공식 실시간 표시.
- **우측 (P2P):** 피어가 늘어날수록 전체 업로드 용량(Us + N·Ui)도 비례 증가. 피어 간 선이 잔뜩 그어짐. D_p2p = max(F/Us, F/dmin, NF/(Us+ΣUi)) 공식 실시간 표시.
- 슬라이더/버튼으로 N 조절 시 두 패널의 배포 시간 바 길이가 즉각 변화.
- 핵심 문구: "P2P: every new peer brings new upload capacity"

---

## 2. Transport Layer (전송 계층)

### 2-A. TCP 3-Way Handshake (`TcpHandshake.jsx`) ★NEW
**개념:** TCP 연결 수립 비용 — 데이터 흐름 전 1 RTT가 소모되는 이유

**시각화 방식:**
- Client(좌) / Server(우) 수직 라인 + 시퀀스 다이어그램 방식.
- **▶ Play Setup** 클릭 시 단계별 화살표가 순서대로 렌더링:
  1. `SYN seq=x` (클라이언트 → 서버): 클라이언트 상태 CLOSED → SYN_SENT
  2. `SYN-ACK seq=y ack=x+1` (서버 → 클라이언트): 서버 상태 LISTEN → SYN_RCVD
  3. `ACK ack=y+1 [+HTTP GET]` (클라이언트 → 서버): 양측 ESTABLISHED. 첫 데이터가 ACK에 피기백.
- 우측 괄호 브라켓 "1 RTT before data can flow" 표시.
- **Show Teardown** 토글로 4-way FIN 과정(FIN/ACK/FIN/ACK) 추가 애니메이션, TIME_WAIT 상태 설명 포함.
- 핵심 문구: "TCP costs 1 RTT just to say hello — this is why HTTP persistent connections matter"

---

### 2-B. RDT Evolution (`RdtAnimation.jsx`) ★PATCHED
**개념:** 신뢰적 데이터 전송 프로토콜의 단계적 발전 (RDT 1.0 → 2.0 → 3.0 → Pipelining)

**시각화 방식:**
- Sender / Receiver 노드 사이를 패킷 `div`가 CSS transition으로 비행 (2000ms).
- **RDT 1.0:** 완벽 채널, 에러 없음.
- **RDT 2.0:** "Send Corrupt" 버튼으로 패킷 손상 주입 → 수신 측 NAK 발송 → 재전송 자동 실행.
- **RDT 3.0:** "Lose in Transit" 버튼으로 패킷 소실 → 타이머 카운다운 후 Timeout 재전송. 시퀀스 번호(0/1 토글)로 중복 감지 표시. "Send Corrupt"도 가능.
- ★ **Pipelining 탭 신규:**
  - **Go-Back-N / Selective Repeat** 서브 토글
  - 윈도우 크기 N=2/3/4 선택 가능
  - 패킷 큐 슬롯(#0~#7) 시각화: 색상으로 상태 구분 (미전송/윈도우내/ACK됨/드롭됨/버퍼됨)
  - "Drop Pkt #X" 버튼으로 패킷 소실 주입
  - **GBN:** 낙오 패킷부터 이후 모두 재전송 (빨간 표시)
  - **SR:** 낙오 패킷만 재전송, 나머지 수신 측 버퍼에 임시 저장 (주황 표시)
  - 슬라이딩 윈도우를 실선 브라켓으로 시각화 → ACK마다 우측으로 슬라이드

---

### 2-C. Mux / Demux (`MultiplexingDemo.jsx`) ★NEW
**개념:** 포트 번호를 통한 전송 계층의 다중화/역다중화, UDP vs TCP의 차이

**시각화 방식:**
- 단일 호스트 뷰. 상단에서 패킷이 내려와 Transport Layer 밴드를 통과해 정확한 소켓으로 라우팅.
- 3개 프로세스 소켓 (HTTP:80, DNS:53, Custom:12345) 하단에 배치.
- 각 패킷에 `[srcIP:srcPort → :dstPort]` 레이블 표시.
- **UDP 모드:** dst port만 보고 소켓 결정. 같은 dst port = 항상 같은 소켓.
- **TCP 모드:** 4-tuple 기반 — 같은 port 80으로 오는 서로 다른 클라이언트가 각각 별도 소켓으로 라우팅됨. port 80 소켓이 클라이언트별 2개로 분리되어 표시.
- "Simulate" 버튼으로 자동 애니메이션 실행, 우측 Demux Log에 라우팅 기록 표시.

---

### 2-D. TCP Congestion Control (`CongestionGraph.jsx`) ★PATCHED
**개념:** 혼잡 제어 알고리즘 — Slow Start / CA, 그리고 Fast Retransmit vs Timeout의 차이

**시각화 방식:**
- X축 = Round, Y축 = cwnd 크기의 실시간 SVG 꺾은선 그래프.
- **Slow Start:** 초록 선, cwnd ×2 exponential 증가.
- **Congestion Avoidance:** 파란 선, ssthresh 도달 후 cwnd +1 linear 증가.
- ★ **Fast Retransmit (3-Dup-ACK):** 주황 선. ssthresh = cwnd/2, cwnd = ssthresh → Slow Start 건너뛰고 CA 직진. "Fast Retransmit — cwnd halved, skip Slow Start" 레이블.
- ★ **Timeout:** 빨간 선. cwnd → 1, ssthresh = cwnd/2 → Slow Start 처음부터 재시작. "Timeout — cwnd → 1, full Slow Start restart" 레이블.
- 이벤트 발생 지점에 수직 점선 + cwnd 값 표시로 두 이벤트의 시각적 차이 명확화.
- 컨트롤 패널에 두 이벤트 버튼을 색상+설명으로 분리.

---

### 2-E. TCP Flow Control (`FlowControlBuffer.jsx`)
**개념:** 수신자 버퍼 용량에 따른 발신 속도 조절 (rwnd 광고)

**시각화 방식:**
- 수신자 쪽에 패킷이 쌓이는 버퍼 박스 시각화.
- 앱 계층 읽기 속도 조절(0/1/3 rate)로 버퍼 차오름/소진 시뮬레이션.
- 각 ACK에 남은 rwnd 값이 표시되어 발신자가 이를 준수해 전송량 동적 조절.

---

## 3. Network Layer (네트워크 계층)

### 3-A. Forwarding vs Routing (`ForwardingVsRouting.jsx`)
**개념:** Data Plane (패킷 전달 = 실행)과 Control Plane (경로 계산 = 계획)의 분리

**시각화 방식:**
- 좌우 분할 패널.
- **우측 (Routing):** 5개 라우터 그래프에서 Dijkstra 알고리즘이 edge weight를 비교하며 최단 경로를 단계별로 하이라이팅. 최종 경로가 확정되면 좌측 FIB에 기록.
- **좌측 (Forwarding):** 임의 패킷 도착 → 목적지 IP를 FIB 테이블과 대조 → 해당 출력 포트로 즉시 전달. 하드웨어 수준의 빠른 처리를 강조.
- 항상 표시: "Routing = plan. Forwarding = execute."
