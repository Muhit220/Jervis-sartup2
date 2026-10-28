# JERVIS AI Starter (Android-friendly PWA)

এটি JERVIS-এর প্রথম প্রোটোটাইপ। এটি ফোনের ব্রাউজারে চলে এবং PWA হিসেবে Home Screen-এ যোগ করা যায়।

## এই সংস্করণে আছে
- Claude API-এর জন্য সার্ভার API route
- মোবাইল-ফ্রেন্ডলি chat UI
- Research / Content / Coding / Automation / Data কাজের দ্রুত বাটন
- ব্রাউজারে লোকাল মেমোরি ও সাম্প্রতিক চ্যাট সংরক্ষণ
- সমর্থিত ব্রাউজারে বাংলা ভয়েস ইনপুট
- API key frontend-এ প্রকাশ না করে server environment variable-এ রাখার ব্যবস্থা

## এখনও যা নেই
- বাস্তব web-search tool integration
- সত্যিকারের স্বাধীন sub-agent execution
- Telegram / email / calendar action integrations
- Cloud-synced memory, speech output, native Android APK
- পূর্ণ audit log এবং user authentication

## Android দিয়ে সেটআপের সহজ পথ
1. GitHub-এ লগইন করে `jervis-ai-starter` নামে একটি **private repository** বানাও।
2. এই ZIP unzip করে সব ফাইল repository-তে upload করো (folder structure একই রাখতে হবে)।
3. Vercel-এ লগইন করে GitHub repository import করো। Next.js project হিসেবে deploy করো।
4. Vercel Project → Settings → Environment Variables-এ `ANTHROPIC_API_KEY` যোগ করো। Value হিসেবে নিজের Anthropic Console API key দাও। এটি কারও সঙ্গে শেয়ার করবে না।
5. `CLAUDE_MODEL` variable হিসেবে তোমার Console-এ উপলব্ধ মডেলের সঠিক ID দাও। `claude-sonnet-4-5` মডেল ID অ্যাকাউন্টে উপলব্ধ না হলে Console-এর বর্তমান model ID ব্যবহার করো।
6. Redeploy করো। এরপর deployment URL খুলে chat পরীক্ষা করো।
7. Android Chrome-এর menu থেকে “Add to Home screen” বা “Install app” নির্বাচন করো।

## গুরুত্বপূর্ণ খরচ সতর্কতা
- Claude API usage সাধারণত paid/prepaid credits লাগে।
- Vercel-এর plan limits এবং availability সময়ের সঙ্গে বদলাতে পারে।
- API key ছাড়া UI দেখা যাবে, কিন্তু live Claude response কাজ করবে না।
- কোনো API key বা password কখনও GitHub repository-তে commit কোরো না।

## Local run (যদি কম্পিউটার পাওয়া যায়)
```bash
npm install
cp .env.example .env.local
# .env.local-এ key বসাও
npm run dev
```

এই প্রোটোটাইপের API route এখন Claude-কে মেসেজ পাঠায়। Research-এর জন্য live web search এবং automation-এর জন্য আলাদা অনুমোদিত tool integration পরের ধাপে যোগ করতে হবে।