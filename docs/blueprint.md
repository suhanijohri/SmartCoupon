# **App Name**: SmartCoupon Hub

## Core Features:

- SMS Coupon Extraction & Parsing: Utilize OpenAI API as a tool to extract coupon codes, brands, discount values, types, and expiry dates from promotional SMS messages (P-SMS), storing the structured data in Firestore.
- Internet Coupon Aggregation: Fetch and consolidate additional coupon data from online sources (APIs or scraping layer), intelligently normalizing and merging them with SMS coupons while avoiding duplicates.
- Smart Recommendation Engine: Calculate effective savings and rank coupons by niche (food, travel, shopping). The engine will use its reasoning to highlight 'Best Coupon' and 'Expiring Soon' categories, offering context-aware suggestions during purchase.
- Real-Time Notification System: Leverage Firebase Cloud Messaging (FCM) to trigger push notifications, delivering the most relevant coupon recommendations at the precise moment of purchase context.
- Coupon Search & Filtering: Allow users to search for coupons by brand, category, or discount type to quickly find desired savings.
- User Account & Preferences: Provide basic account management via Firebase Auth and allow users to set preferences for their favorite brands or categories to personalize recommendations.
- Offline Mode for SMS Coupons: Enable users to access SMS-extracted coupons even without an internet connection, with automatic syncing and merging when connectivity is restored.

## Style Guidelines:

- Primary color: Energetic Orange (#FF6A00). This vibrant hue will serve as the app's main interactive and highlight color, reflecting the excitement of savings and urgent actions.
- Background color: Deep Ember (#161211). A very dark, subtly orange-tinted background, offering a premium and sophisticated feel, while ensuring high contrast for the primary orange accents.
- Accent color: Rich Crimson (#87232C). This complementary, deeper tone provides visual interest and helps differentiate secondary interactive elements, ensuring design hierarchy.
- Headlines and Body text: 'Inter', a grotesque sans-serif. Its modern, machined, and objective look perfectly aligns with the app's 'smart' and analytical core, ensuring high readability for coupon details and recommendations.
- Utilize a set of minimal and modern icons, ensuring consistency in style and clear visual communication for coupon categories, actions, and navigation elements.
- The home screen will feature a highly interactive and scrollable layout with distinct sections for 'Best Coupons,' 'Expiring Soon,' and 'Categorized Coupons'. Each coupon will be presented in a card format, displaying brand, discount details, expiry, and 'Apply'/'Copy Code' actions.
- Implement smooth animations and transitions throughout the app, enhancing the premium feel and user experience, especially during navigation and when revealing new content.