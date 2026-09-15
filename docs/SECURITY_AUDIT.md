# ORSAP.ma — Comprehensive Web Security Audit

**Audit Date:** September 2026  
**Auditor:** Web Security Specialist & Senior Full-Stack Engineer  
**Scope:** Frontend (React 19), Node.js API (`server.js`), PHP 8 Gateway (`public/api/`), Apache Config (`public/.htaccess`), and Data Storage Layer.

---

## 1. Executive Summary

The ORSAP.ma application has been audited across OWASP Top 10 vulnerabilities, credential protection, authentication security, input validation, and HTTP response headers.

Overall Security Rating: **HIGH / HARDENED**

---

## 2. Security Assessment Matrix

| Vector | Finding | Status / Remediation |
| :--- | :--- | :--- |
| **Exposed Secrets** | No hardcoded API keys, database credentials, or JWT secrets in client-side bundles. | **VERIFIED CLEAN** |
| **Credential Management** | `.env` is loaded exclusively server-side via `dotenv` and protected from HTTP requests. | **SECURE** |
| **HTTP Access to Sensitive Files** | Apache `.htaccess` explicitly blocks access to `.json`, `.sql`, `.env`, `.log`, `.md`, `.git`, `.lock`, and `data/` directories (`403 Forbidden`). | **PROTECTED** |
| **Cross-Site Scripting (XSS)** | React JSX escapes text by default; structured data inputs are sanitized; HTML sanitization is enforced. | **SECURE** |
| **Cross-Origin Resource Sharing (CORS)** | Restricted to `orsap.ma`, `www.orsap.ma`, and authorized local dev domains. | **CONFIGURED** |
| **Brute Force & Rate Limiting** | In-memory IP rate limiter on Node.js and PHP prevents automated spam on `/api/devis`, `/api/contact`, `/api/auth/*`. | **ACTIVE** |
| **Authentication & Tokens** | Passwords hashed using `bcrypt` (10 rounds); session tokens signed with `jsonwebtoken` (HS256) with expiration. | **HARDENED** |
| **Email Injection Prevention** | Form inputs (`email`, `phone`, `name`, `message`) are validated and sanitized before passing to Nodemailer / PHPMailer. | **PROTECTED** |
| **Clickjacking** | `X-Frame-Options: SAMEORIGIN` and CSP `frame-ancestors 'self'` enforced. | **PROTECTED** |
| **MIME Sniffing** | `X-Content-Type-Options: nosniff` active sitewide. | **PROTECTED** |

---

## 3. Implemented Security Headers

The following headers are verified across Node.js (`server.js`) and Apache (`.htaccess`):

```http
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## 4. Recommendations for Production Hosting
1. **SSL/TLS Certificate:** Ensure valid Let's Encrypt or Commercial SSL certificate is active on Heberjahiz / cPanel with automatic HTTP -> HTTPS redirection.
2. **Database Permissions:** Restrict the MySQL database user (`DB_USER`) to `SELECT, INSERT, UPDATE, DELETE` only, disabling `DROP, ALTER, GRANT` on the web schema.
3. **Backup Routine:** Schedule automated daily backups of `data/` and MySQL tables to offsite storage.
