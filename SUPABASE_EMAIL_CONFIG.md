# 🔧 Hướng Dẫn Tắt Email Verification - Supabase

## Vấn Đề
Mặc định Supabase yêu cầu xác thực email trước khi user có thể login. Để dev/test nhanh, ta cần tắt tính năng này.

## Cách 1: Tắt trong Supabase Dashboard (Khuyến Nghị cho Dev)

### Bước 1: Vào Supabase Dashboard
1. Truy cập: https://supabase.com/dashboard
2. Chọn project của bạn

### Bước 2: Tắt Email Confirmation
1. Vào **Authentication** → **Settings** → **Email**
2. Tìm mục **"Enable email confirmations"**
3. **TẮT** option này
4. Click **Save**

### Bước 3: Test
- Đăng ký user mới → Không cần verify email → Login ngay được

---

## Cách 2: Sử dụng Code (Đã Implement)

File `Register.jsx` đã được cập nhật với:

```javascript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName },
    emailRedirectTo: window.location.origin, // Redirect về trang chủ
  }
});

// Tự động đăng nhập sau khi đăng ký
if (!error) {
  navigate('/chat');
}
```

**Lưu ý**: Cách này vẫn cần Supabase Dashboard setting được tắt.

---

## Cách 3: Auto-Confirm Emails (Development Only)

### Trong Supabase SQL Editor:

```sql
-- Tạo trigger tự động confirm mọi user mới
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION auto_confirm_user();
```

⚠️ **CẢNH BÁO**: Chỉ dùng cho development! Production nên có email verification.

---

## Kiểm Tra Trạng Thái

### Test Flow:
1. Mở `http://localhost:5174/register`
2. Điền email + password
3. Click "Đăng Ký"
4. **Kỳ vọng**: Tự động redirect về `/chat` và có thể dùng ngay

### Nếu vẫn bị yêu cầu verify:
→ Check Supabase Dashboard setting (Cách 1)

---

## Thông Báo Trên UI

File Register.jsx đã có thông báo:
```
✅ Không cần xác thực email - Đăng ký và sử dụng ngay!
```

User sẽ thấy ngay khi vào trang đăng ký.

---

## Kết Luận

**Làm theo thứ tự:**
1. ✅ Code đã update (auto navigate to /chat)
2. 🔧 Vào Supabase Dashboard → TẮT "Enable email confirmations"
3. 🎉 Test: Register → Login ngay không cần verify!
