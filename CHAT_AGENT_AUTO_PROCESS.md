# Chat Agent Auto-Process Feature

## 🎯 Objective

Setelah Chat Agent menemukan messages, otomatis analyze dengan LLM dan create/update airdrops.

## ✅ Current Status

- ✅ Chat Agent API - Search messages by name
- ✅ Chat Agent UI - Display search results
- 🔄 **Auto-Process** - Need to implement

## 📋 Implementation Plan

### Step 1: Add LLM Analysis Function

Di file `src/app/api/admin/agent/chat/route.ts`, tambahkan function (copy dari main agent):

````typescript
async function analyzeWithLLM(text: string, config: any) {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.llmApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "x-ai/grok-beta",
          messages: [
            {
              role: "system",
              content: `You are an expert airdrop hunter agent...`, // Same as main agent
            },
            {
              role: "user",
              content: text,
            },
          ],
        }),
      }
    );

    const data = await response.json();
    if (!data.choices || !data.choices[0]) return null;

    const content = data.choices[0].message.content;
    const jsonStr = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(jsonStr);

    if (parsed.type === "IRRELEVANT") return null;
    return parsed;
  } catch (e: any) {
    await log(`[LLM ERROR] ${e.message}`, "ERROR");
    return null;
  }
}
````

### Step 2: Update Search Loop

Replace bagian yang map messages dengan logic ini:

```typescript
const processedMessages: any[] = [];
let createdCount = 0;
let updatedCount = 0;
let skippedCount = 0;

// Analyze each message with LLM
for (const msg of matchedMessages) {
  await log(`Analyzing message ID: ${msg.id}`);

  const analysis = await analyzeWithLLM(msg.message, config);

  let action = "SKIPPED";
  let reason = "IRRELEVANT";

  if (analysis) {
    if (analysis.type === "NEW_AIRDROP") {
      const targetName = analysis.data.name.trim();
      const existing = await prisma.airdrop.findFirst({
        where: { name: { equals: targetName, mode: "insensitive" } },
      });

      if (!existing) {
        await prisma.airdrop.create({
          data: {
            name: targetName,
            description: analysis.data.description,
            category: analysis.data.category,
            difficulty: analysis.data.difficulty,
            potential: analysis.data.potential,
            tasks: analysis.data.tasks || [],
          },
        });
        await log(`✅ Created airdrop: ${targetName}`, "SUCCESS");
        action = "CREATED";
        reason = "NEW_AIRDROP";
        createdCount++;
      } else {
        action = "SKIPPED";
        reason = "ALREADY_EXISTS";
        skippedCount++;
      }
    } else if (analysis.type === "NEW_TASK") {
      const targetName = analysis.data.targetAirdropName.trim();
      const existing = await prisma.airdrop.findFirst({
        where: { name: { equals: targetName, mode: "insensitive" } },
      });

      if (existing) {
        const currentTasks = (existing.tasks as any[]) || [];
        const newTasks = analysis.data.tasks || [];
        const uniqueNewTasks = newTasks.filter(
          (nt: any) =>
            !currentTasks.some(
              (ct: any) => ct.url === nt.url || ct.title === nt.title
            )
        );

        if (uniqueNewTasks.length > 0) {
          await prisma.airdrop.update({
            where: { id: existing.id },
            data: { tasks: [...currentTasks, ...uniqueNewTasks] },
          });
          await log(`✅ Added ${uniqueNewTasks.length} tasks`, "SUCCESS");
          action = "UPDATED";
          reason = "NEW_TASKS";
          updatedCount++;
        } else {
          action = "SKIPPED";
          reason = "NO_NEW_TASKS";
          skippedCount++;
        }
      } else {
        action = "SKIPPED";
        reason = "AIRDROP_NOT_FOUND";
        skippedCount++;
      }
    }
  } else {
    skippedCount++;
  }

  processedMessages.push({
    id: msg.id,
    date: msg.date,
    text: msg.message,
    hasReply: !!msg.replyTo,
    action, // CREATED, UPDATED, SKIPPED
    reason, // NEW_AIRDROP, NEW_TASKS, IRRELEVANT, etc
  });
}

results.push({
  airdropName,
  found: matchedMessages.length > 0,
  messageCount: matchedMessages.length,
  messages: processedMessages,
  stats: {
    created: createdCount,
    updated: updatedCount,
    skipped: skippedCount,
  },
});
```

### Step 3: Update UI to Show Actions

Di `src/app/admin/page.tsx`, update message display:

```tsx
{
  result.messages.map((msg: any, msgIdx: number) => (
    <div key={msgIdx} className="bg-zinc-50 p-3 rounded border border-zinc-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>ID: {msg.id}</span>
          <span>•</span>
          <span>{new Date(msg.date * 1000).toLocaleString("id-ID")}</span>
          {msg.hasReply && <span className="text-blue-600">↩️ Reply</span>}
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-bold ${
            msg.action === "CREATED"
              ? "bg-green-100 text-green-700"
              : msg.action === "UPDATED"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {msg.action === "CREATED" && "✅ Created"}
          {msg.action === "UPDATED" && "🔄 Updated"}
          {msg.action === "SKIPPED" && `⏭️ ${msg.reason}`}
        </span>
      </div>
      <p className="text-sm">{msg.text.substring(0, 200)}...</p>
    </div>
  ));
}
```

### Step 4: Add Stats Display

Tambahkan summary per airdrop:

```tsx
{
  result.stats && (
    <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
      <div className="bg-green-50 p-2 rounded text-center">
        <div className="font-bold text-green-700">{result.stats.created}</div>
        <div className="text-green-600">Created</div>
      </div>
      <div className="bg-blue-50 p-2 rounded text-center">
        <div className="font-bold text-blue-700">{result.stats.updated}</div>
        <div className="text-blue-600">Updated</div>
      </div>
      <div className="bg-gray-50 p-2 rounded text-center">
        <div className="font-bold text-gray-700">{result.stats.skipped}</div>
        <div className="text-gray-600">Skipped</div>
      </div>
    </div>
  );
}
```

## 🧪 Testing Flow

1. **Input:** `Incentiv, LayerZero`
2. **Search:** Find messages containing keywords
3. **Analyze:** LLM classify each message
4. **Process:**
   - NEW_AIRDROP → Create if not exists
   - NEW_TASK → Update existing airdrop
   - IRRELEVANT → Skip
5. **Display:** Show action badges and stats

## 📊 Expected Results

```
Incentiv:
- ✅ Created (NEW_AIRDROP)
- 🔄 Updated (NEW_TASKS)
- ⏭️ IRRELEVANT

Stats: 1 Created, 1 Updated, 1 Skipped
```

## 🚀 Deployment

After implementing:

```bash
git add -A
git commit -m "feat: Add auto-process to Chat Agent"
git push origin main
vercel --prod
```

## ⚠️ Notes

- LLM analysis bisa lambat (5-10s per message)
- Limit 5 messages per keyword untuk avoid timeout
- Logs tersimpan di Agent Logs untuk tracking
- Stats membantu monitor effectiveness

---

**Status:** Ready to implement
**Priority:** High
**Estimated Time:** 30 minutes
