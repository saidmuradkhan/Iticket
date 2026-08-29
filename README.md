# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Ödəniş sistemi (Payriff)

Kart ödənişləri [Payriff](https://docs.payriff.com) v3 API üzərindən aparılır.

### Quraşdırma

1. `.env.example` faylını `.env` kimi kopyalayın.
2. Payriff dashboard > **Applications** bölməsindən **secret key**-i götürüb `.env` faylına yazın:

```
PAYRIFF_SECRET_KEY=sizin_secret_key
```

> Secret key yalnız `backend/` qovluğunda oxunur və `VITE_` prefiksi olmadığı üçün
> frontend bundle-a düşmür. Onu heç vaxt React kodunda istifadə etməyin.

### İşə salmaq (3 terminal)

```bash
npm run server    # json-server  → :3001
npm run payment   # ödəniş API   → :3002
npm run dev       # frontend     → :5173
```

### Ödəniş axını

1. `Cart` → sifariş `json-server`-də `pending_payment` statusu ilə yaranır.
2. `Order` səhifəsində kart üsulu seçilir → `POST /api/payment/create`.
3. Server Payriff-də order açır, `paymentUrl` qaytarır, `payriffOrderId`-ni sifarişə yazır.
4. İstifadəçi Payriff-in ödəniş səhifəsində kartı daxil edir.
5. Payriff `callbackUrl` ilə geri qaytarır → `/payment/result?orderId=...`.
6. `PaymentResult` → `GET /api/payment/verify/:orderId`. Server statusu **Payriff API-dən**
   soruşur (brauzerdən gələn parametrlərə güvənmir) və sifarişi yeniləyir.

### API endpoint-ləri (`backend/index.js`)

| Metod | Yol | Təyinat |
| --- | --- | --- |
| `GET` | `/api/payment/health` | server və secret key vəziyyəti |
| `POST` | `/api/payment/create` | Payriff-də ödəniş açır, `paymentUrl` qaytarır |
| `GET` | `/api/payment/verify/:orderId` | statusu Payriff-dən yoxlayır və db-ni yeniləyir |
| `POST` | `/api/payment/callback` | Payriff-in server-to-server bildirişi |
| `POST` | `/api/payment/refund` | ödənişi geri qaytarır |

### Qeydlər

- `callback` endpoint-i **localhost-da işləmir** — Payriff serverləri `localhost`-a çata bilmir.
  Ona görə status redirect-dən sonra `verify` ilə yoxlanılır. Real domendə hər ikisi işləyəcək.
- Status uyğunlaşdırması: `APPROVED → confirmed`, `DECLINED → declined`,
  `CANCELED → canceled`, `REFUNDED → refunded`.
- `refund` sorğusunda məbləğ sahəsinin adı **`amount`**-dur. Bəzi hazır paketlərdə
  `refundAmount` yazılıb, amma v3 onu görmür və `"Request refund amount is null"` qaytarır.
- Test üçün Payriff-in test kartından istifadə edin. **0.01 AZN işləmir** — sifariş
  `CREATED` statusunda qalır; 1 AZN və yuxarı məbləğ seçin.
