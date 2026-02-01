# 🔍 Hướng Dẫn Kiểm Tra Frontend

## Vấn Đề: Không bấm được gì trên trang web

## Các Bước Kiểm Tra:

### 1. Mở Browser Console
- Nhấn F12 hoặc Ctrl+Shift+I
- Chuyển sang tab "Console"
- **Kiểm tra** xem có lỗi màu đỏ không?

### 2. Test Trang Debug
Mở: **`http://localhost:5174/debug`**

Trang này có 3 nút test:
- **"Clicked X times"** - Test React state
- **"Go to Home"** - Test React Router
- **"Log to Console"** - Test console log

**Thử bấm từng nút** và xem có hoạt động không.

### 3. Test Trang Home
Mở: **`http://localhost:5174`**

- Bấm nút **"Bắt Đầu Ngay"**
- Xem console có log "Button clicked!" không
- Nên chuyển sang trang `/login`

### 4. Các Lỗi Thường Gặp

#### Lỗi A: "Uncaught Error: Minified React error"
**Nguyên nhân**: React/ReactDOM version không khớp
**Sửa**:
```bash
cd frontend
npm install react@18.2.0 react-dom@18.2.0
```

#### Lỗi B: "exports is not defined"
**Nguyên nhân**: Tailwind config sai format
**Sửa**: Đã sửa (dùng .cjs files)

#### Lỗi C: Blank white screen
**Nguyên nhân**: Lỗi trong component
**Kiểm tra**: Console có lỗi gì không

#### Lỗi D: Buttons show nhưng không click được
**Nguyên nhân**: CSS z-index hoặc pointer-events
**Sửa**: Thêm `cursor-pointer` class và kiểm tra CSS overlap

### 5. Thông Tin Debug

Khi mở console (F12), bạn sẽ thấy:
- `Button clicked!` - khi bấm nút Home
- `Console test button clicked!` - khi bấm nút debug

Nếu KHÔNG thấy log này → React không chạy hoặc có lỗi JavaScript

### 6. Làm Mới Hoàn Toàn

Nếu vẫn không được, thử:

```bash
# Tắt dev server (Ctrl+C)

# Xóa cache
cd frontend
rm -rf node_modules/.vite
rm -rf dist

# Chạy lại
npm run dev
```

Sau đó:
1. Mở http://localhost:5174 (hoặc port nào terminal hiện)
2. Hard refresh: Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac)

### 7. Screenshot Lỗi

Nếu vẫn lỗi, chụp màn hình:
1. Trang web (nếu hiển thị)
2. Browser Console (tab Console)
3. Terminal output (npm run dev)

Để tôi giúp debug tiếp!

---

## ✅ Expected Results

### Trang Debug (`/debug`):
- 3 nút màu xanh/vàng/xanh lá
- Bấm "Clicked X times" → số tăng
- Bấm "Go to Home" → chuyển về trang chủ
- Bấm "Log to Console" → thấy log trong F12

### Trang Home (`/`):
- Tiêu đề "LegalBot AI"
- Nút "Bắt Đầu Ngay"
- Bấm nút → chuyển sang `/login`

Nếu TẤT CẢ hoạt động → Frontend OK!
Nếu KHÔNG hoạt động → Cần debug thêm (xem console errors)
