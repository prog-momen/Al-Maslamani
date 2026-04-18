-- Add latitude and longitude to addresses table for Google Maps support
alter table public.addresses 
add column if not exists latitude double precision,
add column if not exists longitude double precision;

-- Add live delivery tracking coordinates to orders table
alter table public.orders
add column if not exists delivery_lat double precision,
add column if not exists delivery_lng double precision;
