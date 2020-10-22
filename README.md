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
	"password": "1"
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

# Test Token get Users
```js
GET: "http://localhost:8080/users"
headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer ...token"
}
```

