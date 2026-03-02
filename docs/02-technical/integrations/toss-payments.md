# Toss Payments Integration

## Purpose
Ensure purchase flow validation and resilient payment status recovery.

## Flow
1. Start checkout
2. Verify `paymentKey`, `orderId`, `amount` on backend
3. Update wallet/entitlement on success
4. On failure, show clear recovery action and retry guidance

## Operational Checks
- Separate test and production keys
- Verify callback/webhook retry behavior
- Map failure codes to user-friendly messages

## Monitoring
- Re-validate amount/order/user state on every request
- Keep transaction ID, request/response payload, latency logs
- Alert if failure rate exceeds threshold

## References
- [API Reference](../api/README.md#payment--wallet)
- [Payment Guide](../../01-team/engineering/deployment-guide.md)
