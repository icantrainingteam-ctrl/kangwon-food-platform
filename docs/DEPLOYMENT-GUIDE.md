# 강원푸드 플랫폼 배포 가이드

> Supabase (PostgreSQL) + Render.com (API) + Vercel (프론트엔드 3개)

---

## 1단계: Supabase — PostgreSQL 데이터베이스

### 1.1 프로젝트 생성
1. https://supabase.com 에 로그인
2. **New Project** 클릭
3. 설정:
   - Name: `kangwon-food`
   - Database Password: 안전한 비밀번호 설정 (메모해두세요)
   - Region: **Southeast Asia (Singapore)** ← 필리핀에 가장 가까움
4. **Create new project** 클릭 (2-3분 소요)

### 1.2 DATABASE_URL 복사
1. 프로젝트 대시보드 → **Settings** → **Database**
2. **Connection string** → **URI** 탭
3. `postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` 복사
4. 이 URL을 메모해두세요

### 1.3 DB 마이그레이션 & 시드
로컬에서 실행:
```bash
# .env 파일에 Supabase URL 설정
echo "DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" > .env

# 마이그레이션 실행
npm run db:generate
npm run db:migrate

# 초기 데이터 (메뉴 26개, 직원 7명, 테이블 12개, OKR)
npm run db:seed
```

---

## 2단계: Render.com — API 서버

### 2.1 프로젝트 연결
1. https://render.com 에 로그인
2. **New** → **Web Service**
3. **GitHub 연결** → `icantrainingteam-ctrl/kangwon-food-platform` 선택
4. 설정:
   - Name: `kangwon-api`
   - Region: **Singapore**
   - Branch: `main`
   - Root Directory: (비워두기 - 모노레포 루트)
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `npx tsx apps/api/src/index.ts`
   - Plan: **Free**

### 2.2 환경변수 설정
Render 대시보드 → Environment:
```
DATABASE_URL = (Supabase에서 복사한 URL)
PORT = 4000
NODE_ENV = production
GEMINI_API_KEY = (Google AI Studio에서 발급)
CLAUDE_API_KEY = (Anthropic Console에서 발급)
```

### 2.3 배포 확인
- 자동 빌드 시작 (2-3분)
- Health check: `https://kangwon-api.onrender.com/health`
- 응답: `{"status":"ok","service":"kangwon-api"}`

---

## 3단계: Vercel — 프론트엔드 3개

### 3.1 매니저 대시보드 (이미 완료)
- URL: https://kangwon-web.vercel.app
- 환경변수 추가: `NEXT_PUBLIC_API_URL = https://kangwon-api.onrender.com`

### 3.2 태블릿 주문 앱
1. Vercel 대시보드 → **Add New** → **Project**
2. GitHub repo 선택 → `kangwon-food-platform`
3. 설정:
   - Project Name: `kangwon-tablet`
   - Framework: **Next.js**
   - Root Directory: `apps/tablet`
   - Build Command: `cd ../.. && npx turbo build --filter=@kangwon/tablet`
   - Output Directory: `apps/tablet/.next`
4. 환경변수:
   ```
   NEXT_PUBLIC_API_URL = https://kangwon-api.onrender.com
   ```

### 3.3 주방 KDS
1. 같은 방식으로 새 프로젝트
2. 설정:
   - Project Name: `kangwon-kitchen`
   - Root Directory: `apps/kitchen`
   - Build Command: `cd ../.. && npx turbo build --filter=@kangwon/kitchen`
   - Output Directory: `apps/kitchen/.next`
3. 환경변수:
   ```
   NEXT_PUBLIC_API_URL = https://kangwon-api.onrender.com
   ```

---

## 4단계: 환경변수 연결 (최종)

Vercel 매니저 대시보드 환경변수 업데이트:
1. Vercel 대시보드 → `kangwon-web` → Settings → Environment Variables
2. 추가:
   ```
   NEXT_PUBLIC_API_URL = https://kangwon-api.onrender.com
   ```
3. **Redeploy** 클릭

---

## 최종 배포 URL 맵

| 서비스 | URL | 용도 |
|--------|-----|------|
| 매니저 대시보드 | kangwon-web.vercel.app | 점장/경영진 |
| 태블릿 주문 | kangwon-tablet.vercel.app | 고객 테이블 |
| 주방 KDS | kangwon-kitchen.vercel.app | 주방 디스플레이 |
| API 서버 | kangwon-api.onrender.com | 백엔드 |
| PostgreSQL | Supabase 대시보드 | 데이터베이스 |

---

## 비용 (월)

| 서비스 | 플랜 | 비용 |
|--------|------|------|
| Supabase | Free | $0 (500MB, 2 CPU) |
| Render.com | Free | $0 (750h/월, 15분 슬립) |
| Vercel | Free (3 프로젝트) | $0 |
| **합계** | | **$0/월** |

> 참고: Render Free tier는 15분 비활성 시 슬립합니다.
> 첫 요청 시 ~30초 콜드스타트가 있습니다.
> 유료 플랜($7/월)으로 업그레이드하면 항상 깨어있습니다.

---

## 트러블슈팅

### API가 응답하지 않을 때
- Render 대시보드에서 로그 확인
- `DATABASE_URL` 환경변수가 올바른지 확인
- Supabase 대시보드에서 DB가 활성 상태인지 확인

### 프론트엔드에 데이터가 안 나올 때
- 브라우저 콘솔에서 API 호출 URL 확인
- `NEXT_PUBLIC_API_URL`이 올바른지 확인
- CORS 설정: API에서 Vercel 도메인 허용 필요

### DB 마이그레이션 실패 시
- Supabase Connection Pooler → **Session mode** URL 사용 (포트 5432)
- Pooler mode (포트 6543)는 마이그레이션에 적합하지 않을 수 있음
