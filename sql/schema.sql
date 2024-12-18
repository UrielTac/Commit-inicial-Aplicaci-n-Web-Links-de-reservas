-- Primero creamos los tipos ENUM si no existen
DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('pending', 'partial', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('cash', 'stripe', 'transfer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Luego creamos las tablas que los utilizan
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  court_id uuid references public.courts(id) not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  title varchar(255),
  description text,
  total_price numeric(10,2) not null,
  payment_status payment_status_enum default 'pending',
  payment_method payment_method_enum,
  deposit_amount numeric(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.booking_rentals (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null,
  item_id uuid references public.items(id) not null,
  quantity integer not null check (quantity > 0),
  price_per_unit numeric(10,2) not null,
  total_price numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.booking_participants (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null,
  member_id uuid references public.members(id) not null,
  role participant_role_enum default 'player',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices para optimizar consultas frecuentes
create index bookings_court_id_date_idx on public.bookings(court_id, date);
create index bookings_date_idx on public.bookings(date);
create index booking_participants_booking_id_idx on public.booking_participants(booking_id);
create index booking_rentals_booking_id_idx on public.booking_rentals(booking_id);

-- Triggers para actualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_bookings_updated_at
  before update on public.bookings
  for each row
  execute function update_updated_at_column();

-- Función para validar superposición de reservas
create or replace function check_booking_overlap()
returns trigger as $$
begin
  if exists (
    select 1 from bookings
    where court_id = new.court_id
    and date = new.date
    and (
      (start_time, end_time) overlaps (new.start_time, new.end_time)
    )
    and id != new.id
  ) then
    raise exception 'La cancha ya está reservada en ese horario';
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger para validar superposición antes de insertar o actualizar
create trigger check_booking_overlap_trigger
  before insert or update on bookings
  for each row
  execute function check_booking_overlap();

-- Función para validar disponibilidad de items
create or replace function check_item_availability()
returns trigger as $$
declare
  available_quantity integer;
begin
  select stock into available_quantity
  from items
  where id = new.item_id;

  if available_quantity < new.quantity then
    raise exception 'No hay suficiente stock disponible para el item %', new.item_id;
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger para validar disponibilidad de items antes de insertar
create trigger check_item_availability_trigger
  before insert on booking_rentals
  for each row
  execute function check_item_availability();

-- Modificar la tabla bookings
ALTER TABLE public.bookings 
  ALTER COLUMN payment_status SET DEFAULT 'pending',
  ALTER COLUMN deposit_amount DROP DEFAULT,
  ADD CONSTRAINT check_payment_consistency 
    CHECK (
      (payment_status = 'completed' AND deposit_amount = total_price) OR
      (payment_status = 'partial' AND deposit_amount < total_price) OR
      (payment_status = 'pending')
    );

-- Agregar un trigger para mantener la consistencia
CREATE OR REPLACE FUNCTION ensure_payment_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el depósito es igual al total, forzar estado completed
  IF NEW.deposit_amount = NEW.total_price THEN
    NEW.payment_status := 'completed';
  -- Si el depósito es menor al total y mayor a 0, forzar estado partial
  ELSIF NEW.deposit_amount > 0 AND NEW.deposit_amount < NEW.total_price THEN
    NEW.payment_status := 'partial';
  -- Si no hay depósito, forzar estado pending
  ELSE
    NEW.payment_status := 'pending';
  END IF;

  -- Si el estado es completed, forzar depósito igual al total
  IF NEW.payment_status = 'completed' THEN
    NEW.deposit_amount := NEW.total_price;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS ensure_payment_consistency_trigger ON public.bookings;
CREATE TRIGGER ensure_payment_consistency_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION ensure_payment_consistency();

-- Crear tipo ENUM para los planes
DO $$ BEGIN
    CREATE TYPE plan_type_enum AS ENUM ('free', 'premium');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Crear tabla de clientes
create table public.clientes (
  id uuid default gen_random_uuid() primary key,
  email varchar(255) unique not null,
  nombre varchar(255) not null,
  password_hash text not null,
  plan_type plan_type_enum default 'free' not null,
  empresa_id uuid references public.empresas(id),
  is_onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices para optimizar consultas
create index clientes_email_idx on public.clientes(email);
create index clientes_empresa_id_idx on public.clientes(empresa_id);

-- Trigger para actualizar updated_at
create trigger update_clientes_updated_at
  before update on public.clientes
  for each row
  execute function update_updated_at_column();

-- Función para crear empresa automáticamente
CREATE OR REPLACE FUNCTION create_empresa_for_cliente()
RETURNS TRIGGER AS $$
DECLARE
    new_empresa_id uuid;
BEGIN
    -- Crear nueva empresa con datos mínimos
    INSERT INTO public.empresas (
        name,
        business_name,
        email,
        is_active
    ) VALUES (
        NEW.nombre, -- Usar el nombre del cliente como nombre inicial
        NEW.nombre, -- Usar el nombre del cliente como business_name inicial
        NEW.email,  -- Usar el email del cliente
        true       -- La empresa está activa por defecto
    ) RETURNING id INTO new_empresa_id;

    -- Asignar el ID de la empresa al cliente
    NEW.empresa_id := new_empresa_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para ejecutar la función antes de insertar
CREATE TRIGGER create_empresa_before_cliente_insert
    BEFORE INSERT ON public.clientes
    FOR EACH ROW
    EXECUTE FUNCTION create_empresa_for_cliente();
  

-- Crear enum para el estado del pago
create type payment_status_type as enum (
  'pending',    -- Pendiente
  'completed',  -- Completado
  'failed',     -- Fallido
  'refunded',   -- Reembolsado
  'partially_refunded' -- Reembolsado parcialmente
);

-- Crear enum para el tipo de pago
create type payment_type as enum (
  'booking',      -- Pago de reserva
  'deposit',      -- Seña
  'remaining',    -- Pago restante
  'refund'        -- Reembolso
);

-- Tabla de pagos
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) not null,
  amount numeric(10,2) not null,
  payment_type payment_type not null,
  payment_method payment_method_enum not null,
  payment_status payment_status_type default 'pending',
  transaction_id varchar(255),  -- ID externo (ej: ID de Stripe)
  receipt_url text,            -- URL del comprobante
  metadata jsonb,              -- Datos adicionales del pago
  notes text,                  -- Notas internas
  refund_reason text,          -- Razón del reembolso si aplica
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices
create index payments_booking_id_idx on public.payments(booking_id);
create index payments_created_at_idx on public.payments(created_at);
create index payments_payment_status_idx on public.payments(payment_status);

-- Trigger para updated_at
create trigger update_payments_updated_at
  before update on public.payments
  for each row
  execute function update_updated_at_column();

-- Función para calcular el total pagado de una reserva
create or replace function get_booking_total_paid(booking_id uuid)
returns numeric as $$
declare
  total_paid numeric;
begin
  select coalesce(sum(
    case 
      when payment_type = 'refund' then -amount
      else amount
    end
  ), 0)
  into total_paid
  from payments
  where booking_id = $1
  and payment_status = 'completed';
  
  return total_paid;
end;
$$ language plpgsql;

-- Función para validar que el total de pagos no exceda el precio de la reserva
create or replace function validate_payment_amount()
returns trigger as $$
declare
  booking_price numeric;
  total_paid numeric;
begin
  -- Obtener precio de la reserva
  select total_price into booking_price
  from bookings
  where id = new.booking_id;

  -- Calcular total pagado incluyendo el nuevo pago
  select get_booking_total_paid(new.booking_id) + 
    case 
      when new.payment_type = 'refund' then -new.amount
      else new.amount
    end
  into total_paid;

  -- Validar que no exceda el precio total
  if total_paid > booking_price then
    raise exception 'El total de pagos no puede exceder el precio de la reserva';
  end if;

  return new;
end;
$$ language plpgsql;

-- Trigger para validar montos
create trigger validate_payment_amount_trigger
  before insert or update on payments
  for each row
  execute function validate_payment_amount();


create or replace function create_booking(booking_data jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  new_booking_id uuid;
  participant record;
  rental record;
begin
  -- Insertar la reserva principal
  insert into bookings (
    court_id,
    date,
    start_time,
    end_time,
    title,
    description,
    total_price,
    payment_status,
    payment_method,
    deposit_amount,
    created_at,
    updated_at
  )
  values (
    (booking_data->>'court_id')::uuid,
    (booking_data->>'date')::date,
    (booking_data->>'start_time')::time,
    (booking_data->>'end_time')::time,
    booking_data->>'title',
    booking_data->>'description',
    (booking_data->>'total_price')::numeric,
    (booking_data->>'payment_status')::text,
    (booking_data->>'payment_method')::text,
    (booking_data->>'deposit_amount')::numeric,
    now(),
    now()
  )
  returning id into new_booking_id;

  -- Insertar participantes
  if booking_data ? 'participants' then
    for participant in select * from jsonb_array_elements(booking_data->'participants')
    loop
      insert into booking_participants (
        booking_id,
        member_id,
        role,
        created_at,
        updated_at
      )
      values (
        new_booking_id,
        (participant->>'member_id')::uuid,
        (participant->>'role')::text,
        now(),
        now()
      );
    end loop;
  end if;

  -- Insertar items rentados
  if booking_data ? 'rental_items' then
    for rental in select * from jsonb_array_elements(booking_data->'rental_items')
    loop
      insert into booking_rentals (
        booking_id,
        item_id,
        quantity,
        price_per_unit,
        total_price,
        created_at,
        updated_at
      )
      values (
        new_booking_id,
        (rental->>'item_id')::uuid,
        (rental->>'quantity')::int,
        (rental->>'price_per_unit')::numeric,
        (rental->>'quantity')::int * (rental->>'price_per_unit')::numeric,
        now(),
        now()
      );
    end loop;
  end if;

  return jsonb_build_object(
    'id', new_booking_id,
    'success', true
  );
end;
$$;


-- Primero creamos los tipos ENUM si no existen
DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('pending', 'partial', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('cash', 'stripe', 'transfer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- Modificar la tabla bookings
ALTER TABLE public.bookings 
  ALTER COLUMN payment_status SET DEFAULT 'pending',
  ALTER COLUMN deposit_amount DROP DEFAULT,
  ADD CONSTRAINT check_payment_consistency 
    CHECK (
      (payment_status = 'completed' AND deposit_amount = total_price) OR
      (payment_status = 'partial' AND deposit_amount < total_price) OR
      (payment_status = 'pending')
    );

-- Agregar un trigger para mantener la consistencia
CREATE OR REPLACE FUNCTION ensure_payment_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el depósito es igual al total, forzar estado completed
  IF NEW.deposit_amount = NEW.total_price THEN
    NEW.payment_status := 'completed';
  -- Si el depósito es menor al total y mayor a 0, forzar estado partial
  ELSIF NEW.deposit_amount > 0 AND NEW.deposit_amount < NEW.total_price THEN
    NEW.payment_status := 'partial';
  -- Si no hay depósito, forzar estado pending
  ELSE
    NEW.payment_status := 'pending';
  END IF;

  -- Si el estado es completed, forzar depósito igual al total
  IF NEW.payment_status = 'completed' THEN
    NEW.deposit_amount := NEW.total_price;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS ensure_payment_consistency_trigger ON public.bookings;
CREATE TRIGGER ensure_payment_consistency_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION ensure_payment_consistency();
  