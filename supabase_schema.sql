--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 16.8 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.transaction_type AS ENUM (
    'Income',
    'Expense'
);


--
-- Name: set_transaction_type(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_transaction_type() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  SELECT 
    CASE 
      WHEN c.type = 'income' THEN 'Income'::"transaction_type"
      ELSE 'Expense'::"transaction_type"
    END
  INTO NEW.type
  FROM "categories" c
  WHERE c.id = NEW.category_id;
  
  RETURN NEW;
END;
$$;


--
-- Name: update_month_on_transaction_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_month_on_transaction_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF OLD.type = 'Income' THEN
    UPDATE months
    SET 
      total_income = total_income - OLD.amount_cad,
      transaction_count = transaction_count - 1
    WHERE id = OLD.month_id;
  ELSE
    UPDATE months
    SET 
      total_expenses = total_expenses - OLD.amount_cad,
      transaction_count = transaction_count - 1
    WHERE id = OLD.month_id;
  END IF;
  
  RETURN OLD;
END;
$$;


--
-- Name: update_month_on_transaction_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_month_on_transaction_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.type = 'Income' THEN
    UPDATE months
    SET 
      total_income = total_income + NEW.amount_cad,
      transaction_count = transaction_count + 1
    WHERE id = NEW.month_id;
  ELSE
    UPDATE months
    SET 
      total_expenses = total_expenses + NEW.amount_cad,
      transaction_count = transaction_count + 1
    WHERE id = NEW.month_id;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: update_month_on_transaction_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_month_on_transaction_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Handle type changes (Income <-> Expense)
  IF OLD.type != NEW.type THEN
    IF OLD.type = 'Income' THEN
      -- Changed from Income to Expense
      UPDATE months
      SET 
        total_income = total_income - OLD.amount_cad,
        total_expenses = total_expenses + NEW.amount_cad
      WHERE id = NEW.month_id;
    ELSE
      -- Changed from Expense to Income
      UPDATE months
      SET 
        total_expenses = total_expenses - OLD.amount_cad,
        total_income = total_income + NEW.amount_cad
      WHERE id = NEW.month_id;
    END IF;
  ELSE
    -- No type change, just amount change
    IF NEW.type = 'Income' THEN
      UPDATE months
      SET 
        total_income = total_income - OLD.amount_cad + NEW.amount_cad
      WHERE id = NEW.month_id;
    ELSE
      UPDATE months
      SET 
        total_expenses = total_expenses - OLD.amount_cad + NEW.amount_cad
      WHERE id = NEW.month_id;
    END IF;
  END IF;
  
  -- If month_id changed, we need to update both months
  IF OLD.month_id != NEW.month_id THEN
    -- Decrement count in old month
    UPDATE months
    SET transaction_count = transaction_count - 1
    WHERE id = OLD.month_id;
    
    -- Increment count in new month
    UPDATE months
    SET transaction_count = transaction_count + 1
    WHERE id = NEW.month_id;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: validate_transaction_type(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_transaction_type() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  category_type TEXT;
BEGIN
  -- Get the category type
  SELECT type INTO category_type
  FROM "categories"
  WHERE id = NEW.category_id;
  
  -- Validate type consistency
  IF (category_type = 'income' AND NEW.type != 'Income') OR
     (category_type != 'income' AND NEW.type != 'Expense') THEN
    RAISE EXCEPTION 'Transaction type must match category type';
  END IF;
  
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_recurring boolean DEFAULT false NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: months; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.months (
    id integer NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    total_expenses numeric(10,2) DEFAULT 0 NOT NULL,
    total_income numeric(10,2) DEFAULT 0 NOT NULL,
    transaction_count integer DEFAULT 0 NOT NULL,
    recurring_expenses numeric(10,2) DEFAULT 0 NOT NULL
);


--
-- Name: months_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.months_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: months_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.months_id_seq OWNED BY public.months.id;


--
-- Name: recurring_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recurring_transactions (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    amount_cad numeric(10,2) NOT NULL,
    amount_usd numeric(10,2),
    category_id integer NOT NULL,
    notes text,
    day_of_month integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type public.transaction_type DEFAULT 'Expense'::public.transaction_type NOT NULL
);


--
-- Name: recurring_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recurring_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recurring_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recurring_transactions_id_seq OWNED BY public.recurring_transactions.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    month_id integer NOT NULL,
    name text NOT NULL,
    amount_cad numeric(10,2) NOT NULL,
    amount_usd numeric(10,2),
    category_id integer NOT NULL,
    notes text,
    date date NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type public.transaction_type DEFAULT 'Expense'::public.transaction_type NOT NULL
);


--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    password_hash text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: months id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.months ALTER COLUMN id SET DEFAULT nextval('public.months_id_seq'::regclass);


--
-- Name: recurring_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_transactions ALTER COLUMN id SET DEFAULT nextval('public.recurring_transactions_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: months months_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.months
    ADD CONSTRAINT months_pkey PRIMARY KEY (id);


--
-- Name: recurring_transactions recurring_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_transactions
    ADD CONSTRAINT recurring_transactions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: categories_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_name_idx ON public.categories USING btree (name);


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: months_month_year_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX months_month_year_idx ON public.months USING btree (month, year);


--
-- Name: months_month_year_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX months_month_year_key ON public.months USING btree (month, year);


--
-- Name: recurring_transactions_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recurring_transactions_category_id_idx ON public.recurring_transactions USING btree (category_id);


--
-- Name: recurring_transactions_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recurring_transactions_user_id_idx ON public.recurring_transactions USING btree (user_id);


--
-- Name: transactions_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_category_id_idx ON public.transactions USING btree (category_id);


--
-- Name: transactions_month_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_month_id_idx ON public.transactions USING btree (month_id);


--
-- Name: transactions_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_user_id_idx ON public.transactions USING btree (user_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: recurring_transactions recurring_transaction_type_insert_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER recurring_transaction_type_insert_trigger BEFORE INSERT ON public.recurring_transactions FOR EACH ROW EXECUTE FUNCTION public.set_transaction_type();


--
-- Name: recurring_transactions recurring_transaction_type_update_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER recurring_transaction_type_update_trigger BEFORE UPDATE OF category_id ON public.recurring_transactions FOR EACH ROW EXECUTE FUNCTION public.set_transaction_type();


--
-- Name: recurring_transactions recurring_transaction_type_validate_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER recurring_transaction_type_validate_trigger BEFORE UPDATE OF type ON public.recurring_transactions FOR EACH ROW EXECUTE FUNCTION public.validate_transaction_type();


--
-- Name: transactions transaction_delete_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transaction_delete_trigger AFTER DELETE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_month_on_transaction_delete();


--
-- Name: transactions transaction_insert_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transaction_insert_trigger AFTER INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_month_on_transaction_insert();


--
-- Name: transactions transaction_type_insert_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transaction_type_insert_trigger BEFORE INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.set_transaction_type();


--
-- Name: transactions transaction_type_update_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transaction_type_update_trigger BEFORE UPDATE OF category_id ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.set_transaction_type();


--
-- Name: transactions transaction_type_validate_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transaction_type_validate_trigger BEFORE UPDATE OF type ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.validate_transaction_type();


--
-- Name: transactions transaction_update_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transaction_update_trigger AFTER UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_month_on_transaction_update();


--
-- Name: recurring_transactions recurring_transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_transactions
    ADD CONSTRAINT recurring_transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recurring_transactions recurring_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_transactions
    ADD CONSTRAINT recurring_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_month_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_month_id_fkey FOREIGN KEY (month_id) REFERENCES public.months(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

