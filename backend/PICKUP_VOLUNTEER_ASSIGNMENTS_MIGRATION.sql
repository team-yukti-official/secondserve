-- Run this in the Supabase SQL editor once to enable NGO volunteer assignments.
CREATE TABLE IF NOT EXISTS pickup_volunteer_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pickup_request_id UUID NOT NULL UNIQUE REFERENCES pickup_requests(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE RESTRICT,
    assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pickup_volunteer_assignments_volunteer
    ON pickup_volunteer_assignments(volunteer_id);

ALTER TABLE pickup_volunteer_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "NGOs can manage their pickup volunteer assignments"
ON pickup_volunteer_assignments FOR ALL
USING (auth.uid() = assigned_by)
WITH CHECK (auth.uid() = assigned_by);
