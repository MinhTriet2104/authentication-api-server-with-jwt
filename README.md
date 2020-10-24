# Cài đặt

```js
npm install
```

# Mở Server

Chạy file start_server.bat

# Login
```js
POST: "http://localhost:8080/auth/login"
body: {
	"username": "minhtriet2104",
	"password": "1"
}

Response: {
  "accessToken": "...token",
  "refreshToken": "...token"
}
```

# Register
```js
POST: "http://localhost:8080/auth/register"
body: {
	"username": "minhtriet2104",
  "password": "1",
  [oauth2: true/false]
}

Response: {
  "accessToken": "...token",
  "refreshToken": "...token"
}
```


# Refresh Token
```js
POST: "http://localhost:8080/auth/refresh"
body: {
	"refreshToken": "...token",
}

Response: {
  "accessToken": "...token",
}
```

# Logout
```js
DELETE: "http://localhost:8080/auth/logout"
body: {
	"refreshToken": "...token",
}
```

# Test Token get Users
```js
GET: "http://localhost:8080/users"
headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer ...token"
}
```

