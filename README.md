# Sayaka Discord Bot (Bun + discord.js v14)

기존 기능: `/핑`, `/notify_all`
추가 기능:
- `/공지 제목: 내용: [채널:]`: 관리자급 메시지 관리 권한으로 임베드 공지 (멘션 자동 허용 안 함)
- `/티켓설치 [카테고리:]`: 관리자용 티켓 패널 설치. 버튼으로 1인 1티켓 비공개 채널 생성/종료
- `/관리 경고 대상: 사유:`: 경고 누적 (data/warnings.json)
- `/관리 경고조회 대상:`: 경고 내역
- `/관리 차단 대상: [사유:]`: 유저 차단
- `/관리 청소 개수:`: 최근 메시지 1~100개 삭제 (14일 경과 메시지 제외)
- `/봇상태`: 메모리, 서버/프로세스 업타임, 평균 CPU 부하

## Debian 배포

기존 `.env`를 백업하고 ZIP 파일의 내용을 `~/sayaka`에 덮어쓰기. `.env`는 ZIP에 포함되지 않음.

```bash
cd ~/sayaka
bun install
bun deploy.ts
bun index.ts
```

`.env` (예시 `.env.example` 참조):

```
DISCORD_TOKEN=...
CLIENT_ID=...
GUILD_ID=...
```

PM2 사용 시:

```bash
pm2 restart sayaka --update-env
pm2 logs sayaka
```

봇 초대 스코프: `bot`, `applications.commands`.
권한: `View Channels`, `Send Messages`, `Embed Links`, `Manage Channels`(티켓), `Manage Messages`(청소), `Ban Members`(차단), `Read Message History`.
`/notify_all` 전체 DM 기능은 Discord Developer Portal에서 **Server Members Intent** 활성화 필요. Discord의 정책과 DM 속도 제한 준수.

## 유의사항
- `bun deploy.ts`는 **해당 GUILD_ID 서버의 슬래시 명령어 전체를 이 목록으로 동기화**하므로 등록된 다른 길드 명령어가 있다면 사라질 수 있음.
- 티켓 종료는 채널을 삭제하므로 대화 내역 보관이 필요하면 닫기 전에 별도 백업하세요.
- 티켓 채널은 기본적으로 생성자와 봇만 공개적으로 허용함. 관리자는 Discord 관리자 권한 등으로 접근 가능하며 운영자 역할에 별도 접근이 필요하면 권한 덮어쓰기를 확장해야 함.
- 경고 데이터는 서버 로컬 `data/warnings.json`에 저장. 서버 교체 시 이 파일을 반드시 백업하세요. 여러 봇 프로세스를 동시에 실행하면 경고 파일 갱신 충돌이 날 수 있으므로 봇은 한 프로세스만 실행하세요.
- 외부 인터넷이 차단된 작업 환경에서 의존성 설치/실제 Discord 로그인 테스트는 수행하지 못했음. 서버에서 `bun install`, `bunx tsc --noEmit`으로 점검하세요.
