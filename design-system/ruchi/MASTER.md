# RUCHI Design System Master File (UI UX Pro Max)

> **LOGIC:** Global Source of Truth for RUCHI – Food Sharing & Homemade Food Pre-Orders (Hyderabad Pilot).
> Conforms to UI UX Pro Max standards for accessibility, touch targets, contrast ratios, and interactive states.

---

**Project:** RUCHI  
**Domain:** Hyper-Local Food Sharing & Community Pre-Orders  
**Target Market:** Hyderabad, Telangana, India (Madhapur, Banjara Hills, Jubilee Hills, Gachibowli, Kondapur)  
**UI Style:** Modern Community & Warm Culinary (Accessible Block-Based)  

---

## 🎨 Brand Color Tokens (WCAG 2.1 AA Compliant)

| Role | Hex | Tailwind Token | Usage & Semantics |
| :--- | :--- | :--- | :--- |
| **Primary** | `#174D36` | `bg-ruchi-forest` | Forest Green: Trust, freshness, header, primary action buttons |
| **Primary Dark** | `#0F3826` | `bg-ruchi-forestDark` | Deep Forest: Notice strips, navigation backdrops, hero containers |
| **Secondary** | `#65A878` | `bg-ruchi-fresh` | Fresh Green: Free Food sharing badges (₹0), FSSAI verification badges |
| **Secondary Light**| `#E8F5EC` | `bg-ruchi-freshLight` | Soft Mint: Free food cards, badge background, active pills |
| **Accent / CTA** | `#F5A623` | `bg-ruchi-orange` | Warm Culinary Orange: Home-cook pre-order tags, urgent 30m cutoff indicators |
| **Accent Hover** | `#DE9319` | `bg-ruchi-orangeHover`| Deep Orange: Button hover feedback |
| **Background** | `#FFF9EE` | `bg-ruchi-cream` | Warm Cream: Soft, inviting community feel without harsh white glare |
| **Card Surface** | `#FFFFFF` | `bg-white` | Pure White: Card surfaces, interactive modals, dropdown drawers |
| **Text Primary** | `#1A2E24` | `text-gray-900` | Deep Pine/Charcoal: Contrast ratio > 7:1 against cream |
| **Text Muted** | `#607267` | `text-gray-500` | Muted Sage: Subtitles, timestamps, distance counters |

---

## ⚡ Server-Enforced Rules in UI

1. **The Four-Customer-Order Rule Visualizer**:
   - Visual slot grid: `[ Slot 1: Booked ]` `[ Slot 2: Booked ]` `[ Slot 3: Available ]` `[ Slot 4: Available ]`.
   - Accessible live region: `<span role="status" aria-atomic="true">X of 4 slots booked</span>`.
   - Disabled state with explanatory tooltip once 4 customer slots are occupied.

2. **Automatic 30-Minute Cutoff Indicator**:
   - `order_closes_at = cooking_starts_at - 30 minutes` (Asia/Kolkata IST).
   - High-contrast banner with countdown timer.
   - Turns red with warning icon when closed.

3. **Strict Separation of Dual Experiences**:
   - Free Surplus Food: Green badge `[ FREE SURPLUS SHARE - ₹0 ]`.
   - Paid Home-Cook Pre-Orders: Orange badge `[ HOME COOK PRE-ORDER ]` with price in INR (₹).

---

## 📐 UI UX Pro Max Pre-Delivery Checklist Verified

- [x] **No Emojis as Functional Icons**: Uses clean SVG icons from `lucide-react` with descriptive titles.
- [x] **Touch Targets**: All buttons, inputs, and selectors maintain a minimum touch target of $\ge 44 \times 44 \text{ px}$.
- [x] **Interactive Feedback**: All interactive elements have `cursor-pointer`, smooth transitions (150-250ms), and tactile active states (`active:scale-[0.98]`).
- [x] **Accessibility**: Minimum text contrast ratio of $\ge 4.5:1$ on all backgrounds.
- [x] **Keyboard Navigation**: Focus rings (`focus:ring-2 focus:ring-[#174D36]`) visible on all inputs and interactive triggers.
- [x] **Mobile Responsiveness**: Verified layouts on Mobile (375px), Tablet (768px), Laptop (1024px), and Desktop (1440px).
