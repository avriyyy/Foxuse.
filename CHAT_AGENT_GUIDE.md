# Chat Agent - Implementation Guide

## ✅ Yang Sudah Dibuat:

### 1. Backend API

**File:** `src/app/api/admin/agent/chat/route.ts`

**Endpoint:** `POST /api/admin/agent/chat`

**Request:**

```json
{
  "airdropNames": ["Incentiv", "LayerZero", "Starknet"]
}
```

**Response:**

```json
{
  "success": true,
  "results": [
    {
      "airdropName": "Incentiv",
      "found": true,
      "messageCount": 3,
      "messages": [...]
    }
  ],
  "summary": {
    "total": 3,
    "found": 2,
    "notFound": 1
  }
}
```

### 2. State Management

**File:** `src/app/admin/page.tsx` (lines 87-89)

```typescript
const [chatInput, setChatInput] = useState("");
const [chatSearching, setChatSearching] = useState(false);
const [chatResults, setChatResults] = useState<any>(null);
```

### 3. Navigation Tab

Tab "Chat Agent" sudah ditambahkan di navigation bar.

---

## 🔧 Yang Perlu Ditambahkan:

### Step 1: Add handleChatSearch Function

Tambahkan setelah function `handleSubmit` (sekitar line 247):

```typescript
const handleChatSearch = async () => {
  if (!chatInput.trim()) {
    showToast("❌ Please enter airdrop names", "error");
    return;
  }

  setChatSearching(true);
  setChatResults(null);

  try {
    const airdropNames = chatInput
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    const res = await fetch("/api/admin/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ airdropNames }),
    });

    if (res.ok) {
      const data = await res.json();
      setChatResults(data);
      showToast(
        `✅ Found ${data.summary.found}/${data.summary.total}`,
        "success"
      );
    } else {
      showToast("❌ Search failed", "error");
    }
  } catch (error) {
    showToast("❌ Error searching", "error");
  } finally {
    setChatSearching(false);
  }
};
```

### Step 2: Add Chat Agent UI

Tambahkan sebelum closing tag terakhir (sebelum `</main>`), setelah Agent tab UI:

```tsx
{
  activeTab === "chat" ? (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-black uppercase flex items-center gap-2">
          <Terminal className="h-5 w-5" /> Chat Agent - Search Airdrops
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">
              Enter Airdrop Names (comma separated)
            </label>
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Example: Incentiv, LayerZero, Starknet"
              className="w-full p-3 border-2 border-zinc-200 rounded-lg focus:border-primary focus:outline-none"
              rows={3}
            />
          </div>

          <Button
            onClick={handleChatSearch}
            disabled={chatSearching}
            className="w-full"
          >
            {chatSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Terminal className="h-4 w-4 mr-2" />
                Search in Telegram
              </>
            )}
          </Button>
        </div>

        {chatResults && (
          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h3 className="font-bold mb-2">📊 Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-black">
                    {chatResults.summary.total}
                  </div>
                  <div className="text-xs text-zinc-600">Total Searched</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-green-600">
                    {chatResults.summary.found}
                  </div>
                  <div className="text-xs text-zinc-600">Found</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-red-600">
                    {chatResults.summary.notFound}
                  </div>
                  <div className="text-xs text-zinc-600">Not Found</div>
                </div>
              </div>
            </div>

            {chatResults.results.map((result: any, idx: number) => (
              <Card key={idx} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-lg">{result.airdropName}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      result.found
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {result.found
                      ? `✅ ${result.messageCount} messages`
                      : "❌ Not Found"}
                  </span>
                </div>

                {result.found && result.messages.length > 0 && (
                  <div className="space-y-2">
                    {result.messages.map((msg: any, msgIdx: number) => (
                      <div
                        key={msgIdx}
                        className="bg-zinc-50 p-3 rounded border border-zinc-200"
                      >
                        <div className="flex items-center gap-2 mb-2 text-xs text-zinc-500">
                          <span>ID: {msg.id}</span>
                          <span>•</span>
                          <span>
                            {new Date(msg.date * 1000).toLocaleString("id-ID")}
                          </span>
                          {msg.hasReply && (
                            <span className="text-blue-600">↩️ Reply</span>
                          )}
                        </div>
                        <p className="text-sm">
                          {msg.text.substring(0, 200)}...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  ) : null;
}
```

---

## 🧪 Testing

1. Buka Admin Panel → Tab "Chat Agent"
2. Input: `Incentiv, LayerZero, Starknet`
3. Klik "Search in Telegram"
4. Lihat hasil pencarian

---

## 📝 Notes

- Search menggunakan keyword matching di Telegram messages
- Limit 100 messages per keyword (bisa diubah di API)
- Hasil menampilkan 5 message terbaru per airdrop
- Timestamp otomatis convert ke WIB

---

## 🚀 Deployment

Setelah menambahkan code di atas:

```bash
git add -A
git commit -m "feat: Add Chat Agent UI"
git push origin main
vercel --prod
```
