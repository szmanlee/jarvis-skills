# HEARTBEAT.md - Trading Agent

# Scheduled Market Analysis for Trading Agent

## Daily (9:00 AM) - Market Summary
- Fetch top 10 crypto prices
- Check major market indices
- Identify key support/resistance levels
- Generate daily brief

## Weekly (Monday 8:00 AM) - Weekly Analysis
- Technical analysis of top assets
- Weekly price charts and trends
- Update strategy performance
- Portfolio rebalancing suggestions

## Monthly (1st 9:00 AM) - Monthly Report
- Full portfolio analysis
- Strategy performance review
- Market outlook update
- Risk assessment review

---

**Note:** Trading agent manages its own cron jobs.
Edit this file to modify check schedules.

**Available checks:**
- `python fetch_data.py --symbol BTC --days 30` - Fetch data
- `python analysis.py --symbol BTC` - Technical analysis
- `python backtest.py --strategy sma_crossover` - Backtest strategy

**Commands Reference:**
- Price: CoinGecko API (free, no key needed)
- Charts: matplotlib visualization
- Reports: Markdown format in reports/

**Related Files:**
- Learnings: `.learnings/LEARNINGS.md`
- Daily Logs: `memory/YYYY-MM-DD.md`
- Strategies: `strategies/*.py`
- Data: `data/*.csv`
