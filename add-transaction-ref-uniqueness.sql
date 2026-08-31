-- Run this once on your existing project. Prevents the same payment
-- transaction reference from ever being used on more than one certificate
-- request -- across ALL learners and courses, not just per-person -- so a
-- single payment can't be reused to claim multiple certificates.
create unique index if not exists certificate_requests_transaction_ref_unique
  on certificate_requests (transaction_ref)
  where transaction_ref is not null;
