# Password Recovery Implementation

Implemented using the Redis + OTP pattern from the attached reference authentication system.

## Endpoints

### Forgot password
1. `POST /api/auth/forgot-password`
   ```json
   {"username":"admin01"}
   ```
   The backend looks up the user's registered email and sends a 6-digit OTP.

2. `POST /api/auth/forgot-password/verify`
   ```json
   {
     "username":"admin01",
     "otp":"123456",
     "newPassword":"NewPass@123",
     "confirmPassword":"NewPass@123"
   }
   ```

3. `POST /api/auth/forgot-password/resend-otp`
   ```json
   {"username":"admin01"}
   ```

Forgot-password recovery is enabled for `SUPER_ADMIN`, `ADMIN`, and `TEACHER`.
The OTP is stored in Redis for 2 minutes. Three incorrect OTP attempts cause a 5-minute block.

### Change password
Authenticated endpoint:

`POST /api/auth/change-password`

```json
{
  "currentPassword":"OldPass@123",
  "newPassword":"NewPass@123",
  "confirmPassword":"NewPass@123"
}
```

The username comes from the authenticated JWT; it is never accepted from the request body.

## Redis

Defaults:
- host: `localhost`
- port: `6379`

Environment variables:
- `REDIS_HOST`
- `REDIS_PORT`

## Important

`spring.jpa.hibernate.ddl-auto` is set to `update` in this prepared copy so restarting the application does not recreate/drop the existing database schema.

Make sure Redis is running before using forgot-password or resend-OTP.
