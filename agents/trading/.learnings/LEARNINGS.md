# Trading Agent Learnings

## [LRN-20260224-001] Initial Setup

**Date**: 2026-02-24
**Status**: completed

### Context
Created Trading Analyst agent for market analysis, strategy backtesting, and data-driven investment decisions.

### What Worked
- Detailed SOUL.md with comprehensive trading workflow
- Risk management guidelines clearly defined
- Multiple data sources configured (CoinGecko, Yahoo Finance)

### Challenges
- API rate limits on free data sources
- Complex backtesting requires historical data

### Lessons Learned
- Always start with risk tolerance check
- Use multiple data sources for verification
- Document all assumptions for reproducibility

### Related
- Agent: /root/.openclaw/workspace/agents/trading/
- Data Sources: CoinGecko API, Yahoo Finance

---

## [LRN-20260224-002] API Configuration

**Date**: 2026-02-24
**Status**: best-practice

### Free APIs (No Key Required)
| API | Purpose | Rate Limit |
|-----|---------|------------|
| CoinGecko | Crypto prices | 10-50 calls/min |
| Yahoo Finance | Stock data | 100 calls/day |

### APIs Requiring Keys
| API | Purpose | Get Key At |
|-----|---------|------------|
| Alpha Vantage | Fundamentals | alphavantage.co |
| Binance | Trading | binance.com |
| Polygon.io | Market data | polygon.io |

### Rate Limit Handling
```python
import time

def safe_api_call(api_func, delay=1.0):
    try:
        return api_func()
    except RateLimitError:
        time.sleep(delay)
        return safe_api_call(api_func, delay * 2)
```

---

## [LRN-20260224-003] Indicator Calculations

**Date**: 2026-02-24
**Status**: reference

### Common Indicators

**RSI (Relative Strength Index)**
```python
import pandas as pd

def calculate_rsi(prices, period=14):
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))
```

**MACD (Moving Average Convergence Divergence)**
```python
def calculate_macd(prices, fast=12, slow=26, signal=9):
    ema_fast = prices.ewm(span=fast).mean()
    ema_slow = prices.ewm(span=slow).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal).mean()
    return macd_line, signal_line
```

**Bollinger Bands**
```python
def calculate_bollinger_bands(prices, window=20, std_dev=2):
    sma = prices.rolling(window=window).mean()
    std = prices.rolling(window=window).std()
    upper = sma + (std_dev * std)
    lower = sma - (std_dev * std)
    return upper, sma, lower
```

---

## [LRN-20260224-004] Backtesting Best Practices

**Date**: 2026-02-24
**Status**: guidelines

### Common Backtesting Pitfalls

| Pitfall | Description | Solution |
|---------|-------------|----------|
| Look-ahead bias | Using future data | Split train/test sets |
| Overfitting | Too many parameters | Simpler models, more data |
| Survivor bias | Only testing live assets | Include delisted data |
| Ignore costs | No slippage/fees | Include 0.1-0.5% per trade |
| Data mining | Random patterns | Out-of-sample testing |

### Backtest Metrics
```python
def calculate_metrics(returns):
    return {
        'total_return': (1 + returns).prod() - 1,
        'sharpe_ratio': returns.mean() / returns.std() * np.sqrt(252),
        'max_drawdown': (returns.cumsum() - returns.cumsum().cummax()).min(),
        'win_rate': (returns > 0).mean(),
        'profit_factor': returns[returns > 0].sum() / abs(returns[returns < 0].sum())
    }
```

### Walk-Forward Analysis
1. Split data into train (70%) and test (30%)
2. Optimize on train set
3. Validate on test set
4. Repeat with rolling windows

---

## [LRN-20260224-005] Risk Management

**Date**: 2026-02-24
**Status**: critical

### Position Sizing

**Kelly Criterion (Fractional)**
```python
def kelly_position(win_rate, avg_win, avg_loss, fraction=0.5):
    kelly = (win_rate * avg_win - (1 - win_rate) * avg_loss) / avg_win
    return max(0, kelly * fraction)  # Use fractional Kelly
```

**Fixed Fractional**
```python
def fixed_fractional_position(capital, risk_per_trade, stop_distance, entry):
    risk_amount = capital * risk_per_trade
    position_size = risk_amount / stop_distance
    shares = position_size / entry
    return shares
```

### Risk Limits
| Metric | Recommended |
|--------|-------------|
| Single position | ≤ 2% of portfolio |
| Sector allocation | ≤ 20% of portfolio |
| Total leverage | ≤ 2x |
| Daily loss limit | 5% (stop trading) |
| Weekly loss limit | 10% (review strategy) |

---

## [LRN-20260224-006] Chart Patterns

**Date**: 2026-02-24
**Status**: reference

### Common Patterns

| Pattern | Type | Signal |
|---------|------|--------|
| Head & Shoulders | Reversal | Bearish (top) / Bullish (inverted) |
| Double Top/Bottom | Reversal | Bearish / Bullish |
| Flag | Continuation | Same as prior trend |
| Triangle | Continuation | Breakout direction |
| Doji | Indecision | Wait for confirmation |

### Support/Resistance Identification
1. Look for price clusters
2. Use pivot points
3. Apply Fibonacci retracements
4. Check volume at levels

---

