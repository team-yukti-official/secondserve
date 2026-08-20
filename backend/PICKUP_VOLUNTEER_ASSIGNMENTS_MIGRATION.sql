-- Run this in the Supabase SQL editor once to enable NGO volunteer assignments.
CREATE TABLE IF NOT EXISTS pickup_volunteer_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pickup_request_id UUID NOT NULL UNIQUE REFERENCES pickup_requests(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE RESTRICT,
    assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pickup_address TEXT,
    delivery_address TEXT,
    pickup_latitude NUMERIC,
    pickup_longitude NUMERIC,
    delivery_latitude NUMERIC,
    delivery_longitude NUMERIC,
    assignment_message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'received', 'delivered', 'cancelled')),
    assigned_at TIMESTAMP NOT NULL DEFAULT now(),
8    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    received_at TIMESTAMP,
    delivered_at TIMESTAMP,
    volunteer_rating INTEGER CHECK (volunteer_rating BETWEEN 1 AND 5),
    volunteer_feedback TEXT,
    volunteer_video_url TEXT
);

ALTER TABLE pickup_volunteer_assignments ADD COLUMN IF NOT EXISTS pickup_address TEXT;
ALTER TABLE pickup_volunteer_assignments ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE pickup_volunteer_assignments ADD COLUMN IF NOT EXISTS pickup_latitude NUMERIC;
ALTER TABLE pickup_volunteer_assignments ADD COLUMN IF NOT EXISTS pickup_longitude NUMERIC;
ALTER TABLE pickup_volunteer_assignments ADD COLUMN IF NOT EXISTS delivery_latitude NUMERIC;
ALTER TABLE pickup_volunteer_assignments ADD COLUMN IF NOT EXISTS delivery_longitude NUMERIC;
ALTER TABLE pickup_volunteer_assignments ADD COLUMN IF NOT EXISTS assignment_message TEXT;
ALTER TABLE pickup_volunteer_assignments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'assigned';
ALTER TABLE pickup_volunteer_assignments ADD COLUMN IF NOT EXISTS received_at TIMESTAMP;
ALTER TABLE pickup_volunteer_assignments ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
ALTER TABLE pickup_volunteer_assignments ADD COLUMN IF NOT EXISTS volunteer_rating INTEGER;
ALTER TABLE pickup_volunteer_assignments ADD COLUMN IF NOT EXISTS volunteer_feedback TEXT;
ALTER TABLE pickup_volunteer_assignments ADD COLUMN IF NOT EXISTS volunteer_video_url TEXT;

ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Existing databases created from database-schema.sql may need this constraint refreshed.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;
ALTER TABLE users ADD CONSTRAINT users_user_type_check CHECK (user_type IN ('donor', 'ngo', 'volunteer', 'admin'));

CREATE INDEX IF NOT EXISTS idx_pickup_volunteer_assignments_volunteer
    ON pickup_volunteer_assignments(volunteer_id);

ALTER TABLE pickup_volunteer_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "NGOs can manage their pickup volunteer assignments"
ON pickup_volunteer_assignments FOR ALL
USING (auth.uid() = assigned_by)
WITH CHECK (auth.uid() = assigned_by);
