# Hướng dẫn cài đặt Google OAuth

## 1. Cài đặt dependencies

```bash
npm install google-auth-library passport-google-oauth20
npm install -D @types/passport-google-oauth20
```

## 2. Tạo Google OAuth Credentials

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Vào **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Chọn **Web application**
6. Thêm **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/v1/auth/google/callback`
   - Production: `https://yourdomain.com/api/v1/auth/google/callback`
7. Copy **Client ID** và **Client Secret**

## 3. Cấu hình Environment Variables

Thêm vào file `.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
```

## 4. API Endpoint

### POST /api/v1/auth/google

Đăng nhập/đăng ký bằng Google ID Token

**Request Body:**

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE..."
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "fullName": "User Name",
    "avatar": "https://...",
    "role": "user",
    "verified": true,
    "loginType": "google"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Google authentication successful"
}
```

## 5. Frontend Integration

### React Example với Google Sign-In Button

```bash
npm install @react-oauth/google
```

```tsx
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function App() {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      // Lưu access token
      localStorage.setItem('accessToken', data.accessToken);

      // Redirect hoặc update UI
      console.log('Login successful:', data.user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Login Failed')} />
    </GoogleOAuthProvider>
  );
}
```

### Vanilla JavaScript Example

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
  </head>
  <body>
    <div
      id="g_id_onload"
      data-client_id="YOUR_GOOGLE_CLIENT_ID"
      data-callback="handleCredentialResponse"
    ></div>
    <div class="g_id_signin" data-type="standard"></div>

    <script>
      function handleCredentialResponse(response) {
        fetch('http://localhost:3000/api/v1/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: response.credential,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            localStorage.setItem('accessToken', data.accessToken);
            console.log('Login successful:', data.user);
          })
          .catch((error) => console.error('Login failed:', error));
      }
    </script>
  </body>
</html>
```

## 6. Cách hoạt động

1. User click vào Google Sign-In button trên frontend
2. Google hiển thị popup để user chọn tài khoản
3. Sau khi user đồng ý, Google trả về ID Token
4. Frontend gửi ID Token đến backend endpoint `/auth/google`
5. Backend verify ID Token với Google
6. Nếu user chưa tồn tại, tạo user mới với `loginType: GOOGLE`
7. Nếu user đã tồn tại, cập nhật `loginType` nếu cần
8. Trả về access token và refresh token cho frontend

## 7. Lưu ý

- Google accounts được tự động verify (`verified: true`)
- User có thể đăng nhập bằng cả email/password và Google
- Refresh token được lưu trong httpOnly cookie
- Access token có thời hạn ngắn (15 phút mặc định)
