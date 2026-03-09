# User Verification Checklist

User-facing E2E checks for non-admin flows.

## Scenario 1: Main Flow

- [ ] Open `/`
- [ ] Enter birth date, time, and gender
- [ ] Submit and confirm result rendering
- [ ] Confirm recommendation sections render
- [ ] Confirm the page remains stable on reload

## Scenario 2: Share and Unlock Flow

- [ ] Reach the share section on the result page
- [ ] Trigger share or copy
- [ ] Confirm unlock-related messaging appears as expected
- [ ] Confirm the result card remains usable after the action

## Scenario 3: Payment CTA Flow

- [ ] Reach the premium CTA section
- [ ] Open the payment modal or payment entry CTA
- [ ] Close the modal and confirm the page recovers cleanly
- [ ] Confirm retry CTA behavior is clear

## Scenario 4: Validation Errors

- [ ] Missing required input shows a clear validation message
- [ ] Invalid date shows a clear validation message
- [ ] Future date is rejected
- [ ] Non-numeric date parts are rejected

## Scenario 5: Route Access

- [ ] `/payment/success` shows a clear recovery path
- [ ] `/payment/fail` shows a clear retry path
- [ ] `/gift` loads expected copy
- [ ] Unknown routes show the 404 page

## Regression Focus

- [ ] Auth callback errors use the correct Korean copy
- [ ] Payment success/fail pages show the correct mapped message
- [ ] Redirect and CTA buttons go to the intended route
- [ ] Query-param based state handling does not crash the page

## Reference

- Error mapping reference: [ERROR_CATALOG.md](../../02-technical/ERROR_CATALOG.md)
- Route and screen contract reference: [execution-backlog-ko.md](../../00-overview/execution-backlog-ko.md)
