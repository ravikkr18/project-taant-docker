-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Suppliers policies
CREATE POLICY "Suppliers can view all suppliers" ON public.suppliers
    FOR SELECT USING (true);

CREATE POLICY "Suppliers can update their own supplier info" ON public.suppliers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = user_id
            AND profiles.id = auth.uid()
        )
    );

CREATE POLICY "Users can create supplier profile for themselves" ON public.suppliers
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Products policies
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (status = 'active');

CREATE POLICY "Suppliers can view their own products" ON public.products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.suppliers
            WHERE suppliers.id = supplier_id
            AND suppliers.user_id = auth.uid()
        )
    );

CREATE POLICY "Suppliers can create products" ON public.products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.suppliers
            WHERE suppliers.id = supplier_id
            AND suppliers.user_id = auth.uid()
        )
    );

CREATE POLICY "Suppliers can update their own products" ON public.products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.suppliers
            WHERE suppliers.id = supplier_id
            AND suppliers.user_id = auth.uid()
        )
    );

CREATE POLICY "Suppliers can delete their own products" ON public.products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.suppliers
            WHERE suppliers.id = supplier_id
            AND suppliers.user_id = auth.uid()
        )
    );

-- Product variants policies
CREATE POLICY "Anyone can view variants of active products" ON public.product_variants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products
            WHERE products.id = product_id
            AND products.status = 'active'
        )
    );

CREATE POLICY "Suppliers can manage their own product variants" ON public.product_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products
            WHERE products.id = product_id
            AND EXISTS (
                SELECT 1 FROM public.suppliers
                WHERE suppliers.id = products.supplier_id
                AND suppliers.user_id = auth.uid()
            )
        )
    );

-- Orders policies
CREATE POLICY "Customers can view their own orders" ON public.orders
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can create their own orders" ON public.orders
    FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Suppliers can view orders for their products" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.order_items
            JOIN public.product_variants ON order_items.variant_id = product_variants.id
            JOIN public.products ON product_variants.product_id = products.id
            JOIN public.suppliers ON products.supplier_id = suppliers.id
            WHERE order_items.order_id = orders.id
            AND suppliers.user_id = auth.uid()
        )
    );

-- Order items policies
CREATE POLICY "Customers can view their own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_id
            AND orders.customer_id = auth.uid()
        )
    );

CREATE POLICY "Suppliers can view order items for their products" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.product_variants
            JOIN public.products ON product_variants.product_id = products.id
            JOIN public.suppliers ON products.supplier_id = suppliers.id
            WHERE product_variants.id = variant_id
            AND suppliers.user_id = auth.uid()
        )
    );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews for their purchases" ON public.reviews
    FOR INSERT WITH CHECK (
        customer_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_id
            AND orders.customer_id = auth.uid()
        )
    );

CREATE POLICY "Customers can update their own reviews" ON public.reviews
    FOR UPDATE USING (customer_id = auth.uid());

CREATE POLICY "Suppliers can view reviews for their products" ON public.reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products
            WHERE products.id = product_id
            AND EXISTS (
                SELECT 1 FROM public.suppliers
                WHERE suppliers.id = products.supplier_id
                AND suppliers.user_id = auth.uid()
            )
        )
    );