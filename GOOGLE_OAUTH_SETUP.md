# 🔐 HƯỚNG DẪN TẠO GOOGLE OAUTH CLIENT ID

## BƯỚC 1: TẠO PROJECT

1. **Truy cập Google Cloud Console:**
   ```
   https://console.cloud.google.com/
   ```

2. **Đăng nhập** bằng Gmail: 

3. **Tạo Project mới:**
   - Click vào dropdown "Select a project" ở góc trên
   - Click **"NEW PROJECT"**
   - Project name: `BakeDelights-Bakery`
   - Location: No organization
   - Click **"CREATE"**
   - Đợi vài giây để project được tạo

---

## BƯỚC 2: BẬT GOOGLE+ API

1. **Trong project vừa tạo**, mở menu bên trái
2. Chọn **"APIs & Services"** → **"Library"**
3. Tìm kiếm: `Google+ API`
4. Click vào **"Google+ API"**
5. Click **"ENABLE"**

---

## BƯỚC 3: TẠO OAUTH CONSENT SCREEN

1. Menu bên trái → **"APIs & Services"** → **"OAuth consent screen"**

2. **Chọn User Type:**
   - Chọn **"External"**
   - Click **"CREATE"**

3. **App information:**
   - App name: `BakeDelights`
   - User support email: 
   - App logo: (Có thể bỏ qua)

4. **App domain:** (Có thể bỏ qua cho development)

5. **Developer contact information:**
   - Email: 

6. Click **"SAVE AND CONTINUE"**

7. **Scopes:** Click **"SAVE AND CONTINUE"** (không cần thêm gì)

8. **Test users:**
   - Click **"ADD USERS"**
   - Thêm email: 
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

9. **Summary:** Click **"BACK TO DASHBOARD"**

---

## BƯỚC 4: TẠO OAUTH CLIENT ID

1. Menu bên trái → **"APIs & Services"** → **"Credentials"**

2. Click **"CREATE CREDENTIALS"** → Chọn **"OAuth client ID"**

3. **Application type:**
   - Chọn **"Web application"**

4. **Name:**
   - Nhập: `BakeDelights Web Client`

5. **Authorized JavaScript origins:**
   - Click **"ADD URI"**
   - Nhập: `http://localhost:3000`
   - Click **"ADD URI"** một lần nữa
   - Nhập: `http://localhost:8080`

6. **Authorized redirect URIs:**
   - Click **"ADD URI"**
   - Nhập: `http://localhost:8080/login/oauth2/code/google`

7. Click **"CREATE"**

8. **Popup hiện ra với Client ID và Client Secret:**
   - **COPY Client ID** (dạng: xxx-xxx.apps.googleusercontent.com)
   - **COPY Client Secret** (dạng: GOCSPX-xxxx)
   - Click **"OK"**

---

## BƯỚC 5: CẬP NHẬT VÀO PROJECT

### File .env (Backend)

Mở file: `ecspring/.env`

Thay thế dòng:
```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

Bằng Client ID và Secret vừa copy.

### Restart Backend

```powershell
# Dừng Backend cũ (đóng cửa sổ PowerShell đang chạy)
# Chạy lại Backend:
cd ecspring
.\mvnw.cmd spring-boot:run
```

---

## ✅ TEST GOOGLE LOGIN

1. Mở: http://localhost:3000
2. Click **Login**
3. Click **Sign in with Google**
4. Chọn account: `nguyenduongoffcial@gmail.com`
5. Click **Allow**

**→ Đăng nhập thành công!** 🎉

---

## 📸 HÌNH ẢNH MINH HỌA

### Bước 1: Tạo Project
```
Google Cloud Console
└── Select a project
    └── NEW PROJECT
        └── Project name: BakeDelights-Bakery
        └── CREATE
```

### Bước 2: OAuth Consent Screen
```
APIs & Services
└── OAuth consent screen
    └── User Type: External
    └── CREATE
    └── Fill in app information
    └── SAVE AND CONTINUE
```

### Bước 3: Create Credentials
```
APIs & Services
└── Credentials
    └── CREATE CREDENTIALS
    └── OAuth client ID
    └── Web application
    └── Add Redirect URI: http://localhost:8080/login/oauth2/code/google
    └── CREATE
```

---

## ⚠️ LƯU Ý

1. **Test users:** Trong development mode, chỉ các email được thêm vào "Test users" mới đăng nhập được
2. **Credentials:** KHÔNG BAO GIỜ commit Client Secret lên GitHub
3. **Environment file:** File `.env` đã được gitignore, an toàn để lưu credentials

---

## 🔧 TROUBLESHOOTING

**Lỗi: Access blocked**
- Kiểm tra email có trong "Test users" chưa

**Lỗi: redirect_uri_mismatch**
- Kiểm tra Redirect URI chính xác: `http://localhost:8080/login/oauth2/code/google`

**Lỗi: App not verified**
- Bình thường trong development mode
- Click "Advanced" → "Go to BakeDelights (unsafe)" để tiếp tục

---

**DONE! Giờ bạn có thể đăng nhập bằng Google!** 🎊


