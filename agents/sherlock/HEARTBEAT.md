# HEARTBEAT.md - Sherlock 🕵️

## Memory System

**Your memory lives in:** `/root/.openclaw/workspace/agents/sherlock/memory/`

Each session, read:
- **Today + yesterday:** `memory/YYYY-MM-DD.md` files for recent context
- **Shared memory (optional):** Read from shared workspace if applicable

Update your memory as you work:
- Log decisions, discoveries, and important context
- Keep it organized by date
- Write as you go, not just at end of day

## Heartbeat Instructions

When polled by cron or heartbeat:

1. **Check for your assigned tasks:**
   - Review any notifications or mentions
   - Check your task management system
   
2. **Memory maintenance:**
   - Review recent activity
   - Update today's memory file if needed
   
3. **Proactive work:**
   - [Add agent-specific checks here]
   
4. **When to stay quiet:**
   - Nothing needs attention → reply `HEARTBEAT_OK`
   - Late night hours (unless urgent)
   - You just checked recently

## Cron Jobs

[Document any cron jobs assigned to this agent]

---

Customize this file as your role evolves.
