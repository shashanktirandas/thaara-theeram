-- Club requests no longer need a separately proposed Head.
-- The student who submits the request becomes the initial Head
-- if the request is approved.

ALTER TABLE public.club_requests
DROP COLUMN IF EXISTS proposed_head;