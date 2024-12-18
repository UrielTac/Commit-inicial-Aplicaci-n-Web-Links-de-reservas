-- 1. Limpiar tipos existentes
DO $$ 
BEGIN
    DROP TYPE IF EXISTS payment_status_type CASCADE;
    DROP TYPE IF EXISTS payment_type CASCADE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. Crear tipos ENUM
DO $$ 
BEGIN
    CREATE TYPE payment_status_type AS ENUM (
        'pending',
        'partial',
        'completed',
        'refunded',
        'partially_refunded'
    );

    CREATE TYPE payment_type AS ENUM (
        'booking',
        'deposit',
        'remaining',
        'refund'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Eliminar tabla si existe
DROP TABLE IF EXISTS public.payments CASCADE;

-- 4. Crear tabla payments
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    payment_type payment_type NOT NULL,
    payment_method payment_method_enum NOT NULL,
    payment_status payment_status_type DEFAULT 'pending',
    transaction_id VARCHAR(255),
    receipt_url TEXT,
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    refund_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Crear índices
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);

-- 6. Función para el trigger de pago inicial
CREATE OR REPLACE FUNCTION create_initial_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.deposit_amount > 0 OR NEW.payment_status = 'completed') THEN
        INSERT INTO public.payments (
            booking_id,
            amount,
            payment_type,
            payment_method,
            payment_status,
            created_at
        ) VALUES (
            NEW.id,
            CASE 
                WHEN NEW.payment_status = 'completed' THEN NEW.total_price
                ELSE NEW.deposit_amount
            END,
            CASE 
                WHEN NEW.payment_status = 'completed' THEN 'booking'::payment_type
                ELSE 'deposit'::payment_type
            END,
            NEW.payment_method::payment_method_enum,
            CASE 
                WHEN NEW.payment_status::text = 'completed' THEN 'completed'::payment_status_type
                WHEN NEW.payment_status::text = 'partial' THEN 'partial'::payment_status_type
                ELSE 'pending'::payment_status_type
            END,
            NEW.created_at
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear trigger
DROP TRIGGER IF EXISTS create_initial_payment_trigger ON public.bookings;
CREATE TRIGGER create_initial_payment_trigger
    AFTER INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION create_initial_payment();

-- 8. Función para actualizar bookings después de un nuevo pago
CREATE OR REPLACE FUNCTION update_booking_after_payment()
RETURNS TRIGGER AS $$
DECLARE
    total_paid NUMERIC;
    booking_total NUMERIC;
BEGIN
    -- Calcular el total pagado para esta reserva
    SELECT COALESCE(SUM(
        CASE 
            WHEN payment_type = 'refund' THEN -amount 
            ELSE amount 
        END
    ), 0)
    INTO total_paid
    FROM payments
    WHERE booking_id = NEW.booking_id
    AND payment_status = 'completed';

    -- Obtener el precio total de la reserva
    SELECT total_price INTO booking_total
    FROM bookings
    WHERE id = NEW.booking_id;

    -- Actualizar el estado de la reserva basado en el total pagado
    UPDATE bookings
    SET 
        payment_status = CASE 
            WHEN total_paid >= booking_total THEN 'completed'
            WHEN total_paid > 0 THEN 'partial'
            ELSE 'pending'
        END,
        deposit_amount = total_paid,
        updated_at = NOW()
    WHERE id = NEW.booking_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Crear trigger para actualizar bookings
DROP TRIGGER IF EXISTS update_booking_after_payment_trigger ON public.payments;
CREATE TRIGGER update_booking_after_payment_trigger
    AFTER INSERT OR UPDATE ON public.payments
    FOR EACH ROW
    WHEN (NEW.payment_status = 'completed')
    EXECUTE FUNCTION update_booking_after_payment();