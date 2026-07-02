"""Static currency FX rates + conversion helpers.

Rates are relative to USD (base). They are static / illustrative on purpose;
no external network dependency needed for the MVP.
"""
from __future__ import annotations

# 1 USD = X target currency
RATES_TO_USD_INVERSE = {
    "USD": 1.0,
    "EUR": 0.92,
    "GBP": 0.79,
    "INR": 83.1,
    "JPY": 149.3,
}

SUPPORTED = list(RATES_TO_USD_INVERSE.keys())

CURRENCY_SYMBOLS = {
    "USD": "$",
    "EUR": "\u20ac",
    "GBP": "\u00a3",
    "INR": "\u20b9",
    "JPY": "\u00a5",
}


def convert(amount: float, from_ccy: str, to_ccy: str) -> float:
    """Convert `amount` from `from_ccy` to `to_ccy` using static rates."""
    if from_ccy == to_ccy:
        return round(amount, 2)
    fx = RATES_TO_USD_INVERSE.get(from_ccy)
    to = RATES_TO_USD_INVERSE.get(to_ccy)
    if fx is None or to is None:
        return round(amount, 2)
    usd = amount / fx
    return round(usd * to, 2)
