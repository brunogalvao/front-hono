-- Migration 001: Enums
CREATE TYPE public.workspace_role AS ENUM ('administrador', 'operador', 'visualizador');
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'cancelled', 'expired');
CREATE TYPE public.transaction_type AS ENUM ('receita', 'despesa');
CREATE TYPE public.transaction_origin AS ENUM ('manual', 'recurring', 'installment');
CREATE TYPE public.category_type AS ENUM ('receita', 'despesa');
CREATE TYPE public.frequency_type AS ENUM ('monthly', 'weekly', 'yearly');
CREATE TYPE public.installment_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE public.insight_scope AS ENUM ('workspace', 'individual');
