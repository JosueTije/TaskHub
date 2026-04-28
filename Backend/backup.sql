--
-- PostgreSQL database dump
--

\restrict aZdMMRK5dZz33UwdkYO9TCDTTkhzF2M3WaJRCoeQk9I06skPFg26ubYIPZL7L9F

-- Dumped from database version 18.3 (Homebrew)
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: OtpType; Type: TYPE; Schema: public; Owner: julieta3
--

CREATE TYPE public."OtpType" AS ENUM (
    'ACCOUNT_SETUP'
);


ALTER TYPE public."OtpType" OWNER TO julieta3;

--
-- Name: PriorityLevel; Type: TYPE; Schema: public; Owner: julieta3
--

CREATE TYPE public."PriorityLevel" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


ALTER TYPE public."PriorityLevel" OWNER TO julieta3;

--
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: julieta3
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'ACTIVE',
    'ON_HOLD',
    'COMPLETED',
    'ARCHIVED'
);


ALTER TYPE public."ProjectStatus" OWNER TO julieta3;

--
-- Name: RiskLevel; Type: TYPE; Schema: public; Owner: julieta3
--

CREATE TYPE public."RiskLevel" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


ALTER TYPE public."RiskLevel" OWNER TO julieta3;

--
-- Name: SprintStatus; Type: TYPE; Schema: public; Owner: julieta3
--

CREATE TYPE public."SprintStatus" AS ENUM (
    'PLANNING',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."SprintStatus" OWNER TO julieta3;

--
-- Name: TicketStatus; Type: TYPE; Schema: public; Owner: julieta3
--

CREATE TYPE public."TicketStatus" AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'IN_REVIEW',
    'BLOCKED',
    'DONE',
    'CANCELLED'
);


ALTER TYPE public."TicketStatus" OWNER TO julieta3;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: julieta3
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'PM',
    'DEVELOPER',
    'VIEWER'
);


ALTER TYPE public."UserRole" OWNER TO julieta3;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: julieta3
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'PENDING_SETUP'
);


ALTER TYPE public."UserStatus" OWNER TO julieta3;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Project; Type: TABLE; Schema: public; Owner: julieta3
--

CREATE TABLE public."Project" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    code text NOT NULL,
    status public."ProjectStatus" DEFAULT 'ACTIVE'::public."ProjectStatus" NOT NULL,
    "riskLevel" public."RiskLevel" DEFAULT 'LOW'::public."RiskLevel" NOT NULL,
    "createdById" text NOT NULL,
    "pmId" text,
    "startDate" timestamp(3) without time zone NOT NULL,
    "targetEndDate" timestamp(3) without time zone NOT NULL,
    "actualEndDate" timestamp(3) without time zone,
    budget double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "archivedAt" timestamp(3) without time zone
);


ALTER TABLE public."Project" OWNER TO julieta3;

--
-- Name: ProjectMember; Type: TABLE; Schema: public; Owner: julieta3
--

CREATE TABLE public."ProjectMember" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "userId" text NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "leftAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProjectMember" OWNER TO julieta3;

--
-- Name: Sprint; Type: TABLE; Schema: public; Owner: julieta3
--

CREATE TABLE public."Sprint" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    name text NOT NULL,
    goal text,
    status public."SprintStatus" DEFAULT 'PLANNING'::public."SprintStatus" NOT NULL,
    capacity integer DEFAULT 0 NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Sprint" OWNER TO julieta3;

--
-- Name: Ticket; Type: TABLE; Schema: public; Owner: julieta3
--

CREATE TABLE public."Ticket" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "sprintId" text NOT NULL,
    "parentTicketId" text,
    title text NOT NULL,
    description text,
    status public."TicketStatus" DEFAULT 'TODO'::public."TicketStatus" NOT NULL,
    priority public."PriorityLevel" DEFAULT 'MEDIUM'::public."PriorityLevel" NOT NULL,
    "storyPoints" integer,
    "assignedToId" text,
    "createdById" text NOT NULL,
    "startedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "estimatedHours" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Ticket" OWNER TO julieta3;

--
-- Name: User; Type: TABLE; Schema: public; Owner: julieta3
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "fullName" text NOT NULL,
    "avatarUrl" text,
    role public."UserRole" DEFAULT 'DEVELOPER'::public."UserRole" NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "mustChangePassword" boolean DEFAULT true NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."User" OWNER TO julieta3;

--
-- Name: UserOtp; Type: TABLE; Schema: public; Owner: julieta3
--

CREATE TABLE public."UserOtp" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."OtpType" NOT NULL,
    "codeHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UserOtp" OWNER TO julieta3;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: julieta3
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


ALTER TABLE public._prisma_migrations OWNER TO julieta3;

--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: julieta3
--

COPY public."Project" (id, name, description, code, status, "riskLevel", "createdById", "pmId", "startDate", "targetEndDate", "actualEndDate", budget, "createdAt", "updatedAt", "archivedAt") FROM stdin;
3904df4f-e6b5-400a-815c-f95b4392bc62	Proyecto Alpha	Proyecto interno de TaskHub	ALPHA	ACTIVE	MEDIUM	cfe3172c-7f75-490c-9f59-ccfa2bac159a	5c023d1e-5904-4c8a-833a-54d816045fce	2026-04-10 00:00:00	2026-06-30 00:00:00	\N	50000	2026-04-09 21:47:45.368	2026-04-09 21:47:45.368	\N
22b9353f-082f-4efc-bdbc-06a6c4d6d695	Proyecto Alpha	Proyecto interno de TaskHub	ALPHAAAA	ACTIVE	MEDIUM	cfe3172c-7f75-490c-9f59-ccfa2bac159a	5c023d1e-5904-4c8a-833a-54d816045fce	2026-04-10 00:00:00	2026-06-30 00:00:00	\N	50000	2026-04-09 21:50:28.164	2026-04-09 21:50:28.164	\N
5bb2555e-1bef-4344-9d6e-2ffac14398a5	Proyecto Alpha	Proyecto interno de TaskHub	ALPHAAAAAAA	ACTIVE	MEDIUM	cfe3172c-7f75-490c-9f59-ccfa2bac159a	5c023d1e-5904-4c8a-833a-54d816045fce	2026-04-10 00:00:00	2026-06-30 00:00:00	\N	50000	2026-04-09 21:52:23.508	2026-04-09 21:52:23.508	\N
211632e2-0eba-451f-88e9-8673f94b0c97	dsc	sdf	DSC	ACTIVE	MEDIUM	cfe3172c-7f75-490c-9f59-ccfa2bac159a	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-09 00:00:00	2026-04-10 00:00:00	\N	12	2026-04-09 22:44:47.663	2026-04-09 22:44:47.663	\N
3f5ceb55-999d-4878-ae2f-67e9e1074e57	proyecto prueba 1 wuu	holiii	PP1W	ACTIVE	LOW	cfe3172c-7f75-490c-9f59-ccfa2bac159a	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-09 00:00:00	2026-04-11 00:00:00	\N	9998	2026-04-09 23:34:49.061	2026-04-09 23:34:49.061	\N
5624f506-4bf2-47aa-b1a0-693a9e9997fb	andud	daijsdas	ANDUD	ACTIVE	MEDIUM	cfe3172c-7f75-490c-9f59-ccfa2bac159a	5c023d1e-5904-4c8a-833a-54d816045fce	2026-04-10 00:00:00	2026-04-23 00:00:00	\N	999997	2026-04-10 00:01:46.941	2026-04-10 00:01:46.941	\N
25483b2f-0d8a-4bb8-a85d-c3d2d06b579f	asd	asd	ASD	ACTIVE	LOW	cfe3172c-7f75-490c-9f59-ccfa2bac159a	\N	2026-04-09 00:00:00	2026-04-18 00:00:00	\N	100	2026-04-09 22:59:31.278	2026-04-09 22:59:31.278	\N
d2e4478e-bf61-4411-b206-d385a7ba241e	e	e	E	ACTIVE	HIGH	cfe3172c-7f75-490c-9f59-ccfa2bac159a	\N	2026-04-10 00:00:00	2026-04-23 00:00:00	\N	100000	2026-04-10 00:00:46.79	2026-04-10 00:00:46.79	\N
9d8d95dc-2e9c-4c04-98d8-039f8b9d4783	lasnd	laskdas	LASND	ACTIVE	LOW	cfe3172c-7f75-490c-9f59-ccfa2bac159a	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-13 00:00:00	2026-04-16 00:00:00	\N	10000	2026-04-14 01:08:04.732	2026-04-14 01:08:04.732	\N
688d01bf-74fa-4a12-9513-1edb7930d425	TaskHub	Plataforma de organización de proyectos	TASKHU	ACTIVE	MEDIUM	cfe3172c-7f75-490c-9f59-ccfa2bac159a	5c023d1e-5904-4c8a-833a-54d816045fce	2026-04-16 00:00:00	2026-08-19 00:00:00	\N	10000	2026-04-15 16:17:12.138	2026-04-15 16:17:12.138	\N
344ef41b-c6ad-483c-beb4-9e6b1a7becf4	x	x	X	ACTIVE	HIGH	cfe3172c-7f75-490c-9f59-ccfa2bac159a	5c023d1e-5904-4c8a-833a-54d816045fce	2026-04-15 00:00:00	2026-04-22 00:00:00	\N	9998	2026-04-15 16:18:31.288	2026-04-15 16:18:31.288	\N
500a207c-c72f-47f8-9fe7-d74e61493d37	xy	x	XY	ACTIVE	LOW	cfe3172c-7f75-490c-9f59-ccfa2bac159a	5c023d1e-5904-4c8a-833a-54d816045fce	2026-04-16 00:00:00	2026-04-17 00:00:00	\N	9998	2026-04-15 16:20:39.377	2026-04-15 16:20:39.377	\N
4ec84bce-ca51-41ab-b8a8-436b0e8ecdab	Proyecto 1	...	P1	ACTIVE	LOW	cfe3172c-7f75-490c-9f59-ccfa2bac159a	be68600a-d717-417d-8a87-5b43676a0705	2026-04-16 00:00:00	2026-04-30 00:00:00	\N	100000	2026-04-15 22:08:39.188	2026-04-15 22:08:39.188	\N
d4dfe160-f66d-4120-b8dc-2fc95fd6ca52	c	c	C	ACTIVE	LOW	cfe3172c-7f75-490c-9f59-ccfa2bac159a	5c023d1e-5904-4c8a-833a-54d816045fce	2026-04-23 00:00:00	2026-04-29 00:00:00	\N	10000	2026-04-17 00:57:20.745	2026-04-17 00:57:20.745	\N
a2a2b3a0-df32-4241-a531-b6e5a2719ffc	proyecto prueba 1	...	PP1	ACTIVE	LOW	cfe3172c-7f75-490c-9f59-ccfa2bac159a	be68600a-d717-417d-8a87-5b43676a0705	2026-04-16 00:00:00	2026-05-07 00:00:00	\N	9996	2026-04-17 01:21:36.561	2026-04-17 01:21:36.561	\N
a656a209-422a-4634-b146-61a182a085bb	Prueba Jixology	\N	PJ	ACTIVE	HIGH	cfe3172c-7f75-490c-9f59-ccfa2bac159a	ca3958c5-7d40-4bc0-b0e1-d22b801dbe81	1800-01-20 00:00:00	1899-02-13 00:00:00	\N	8e+66	2026-04-20 21:40:12.964	2026-04-20 21:40:12.964	\N
838e8976-2ab0-4692-8fcd-ab8b2ebb799c	prueba devcore	prueba de interfaz	PD	ACTIVE	MEDIUM	cfe3172c-7f75-490c-9f59-ccfa2bac159a	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2024-10-05 00:00:00	2026-07-06 00:00:00	\N	5000	2026-04-27 22:34:12.867	2026-04-27 22:34:12.867	\N
\.


--
-- Data for Name: ProjectMember; Type: TABLE DATA; Schema: public; Owner: julieta3
--

COPY public."ProjectMember" (id, "projectId", "userId", "joinedAt", "leftAt", "createdAt") FROM stdin;
ad4564f7-ccb9-4456-bffc-89a26692dce9	3904df4f-e6b5-400a-815c-f95b4392bc62	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-09 21:47:45.383	\N	2026-04-09 21:47:45.383
ad60fc55-1183-4dc7-a6b8-106dc1a9ac52	3904df4f-e6b5-400a-815c-f95b4392bc62	5c023d1e-5904-4c8a-833a-54d816045fce	2026-04-09 21:47:45.383	\N	2026-04-09 21:47:45.383
dfde37b6-1f4f-4f90-bd7d-5cd5c612c02b	3904df4f-e6b5-400a-815c-f95b4392bc62	6c760374-9e6e-4246-820a-b91f94725e8b	2026-04-09 21:47:45.383	\N	2026-04-09 21:47:45.383
99185308-3de2-421f-b20a-fc0901c037cb	22b9353f-082f-4efc-bdbc-06a6c4d6d695	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-09 21:50:28.17	\N	2026-04-09 21:50:28.17
84e8d2b3-4799-4c29-8d05-16ccb6c83bfb	22b9353f-082f-4efc-bdbc-06a6c4d6d695	5c023d1e-5904-4c8a-833a-54d816045fce	2026-04-09 21:50:28.17	\N	2026-04-09 21:50:28.17
32cb8f1a-46b5-43b1-a8d5-e0653597b214	22b9353f-082f-4efc-bdbc-06a6c4d6d695	6c760374-9e6e-4246-820a-b91f94725e8b	2026-04-09 21:50:28.17	\N	2026-04-09 21:50:28.17
c3d14224-9778-471d-b437-b2da692d2fe1	5bb2555e-1bef-4344-9d6e-2ffac14398a5	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-09 21:52:23.513	\N	2026-04-09 21:52:23.513
b5efb0ad-d875-439a-896e-5259f5d25e66	5bb2555e-1bef-4344-9d6e-2ffac14398a5	5c023d1e-5904-4c8a-833a-54d816045fce	2026-04-09 21:52:23.513	\N	2026-04-09 21:52:23.513
9fed3ab6-6597-41d0-9527-02629ac8fe85	5bb2555e-1bef-4344-9d6e-2ffac14398a5	6c760374-9e6e-4246-820a-b91f94725e8b	2026-04-09 21:52:23.513	\N	2026-04-09 21:52:23.513
d49199b1-347d-4944-9e89-21c8ae455aae	211632e2-0eba-451f-88e9-8673f94b0c97	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-09 22:44:47.673	\N	2026-04-09 22:44:47.673
aeaf113c-0587-40f2-ae83-ee4bd2fa17be	25483b2f-0d8a-4bb8-a85d-c3d2d06b579f	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-09 22:59:31.294	\N	2026-04-09 22:59:31.294
296d3efd-4c02-4f8d-ab9a-7a15eca1a047	3f5ceb55-999d-4878-ae2f-67e9e1074e57	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-09 23:34:49.067	\N	2026-04-09 23:34:49.067
8785de9b-a5ba-45f7-bcd7-86979fb1e9ac	d2e4478e-bf61-4411-b206-d385a7ba241e	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-10 00:00:46.797	\N	2026-04-10 00:00:46.797
58d33e45-cdee-4612-bdc7-9ea2bc4b5458	5624f506-4bf2-47aa-b1a0-693a9e9997fb	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-10 00:01:46.945	\N	2026-04-10 00:01:46.945
2964d50e-6daf-4d28-9f75-5a237921ec54	5624f506-4bf2-47aa-b1a0-693a9e9997fb	5c023d1e-5904-4c8a-833a-54d816045fce	2026-04-10 00:01:46.945	\N	2026-04-10 00:01:46.945
a10ebb63-33c2-4aae-9d6a-d56cd2b43537	9d8d95dc-2e9c-4c04-98d8-039f8b9d4783	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-14 01:08:04.738	\N	2026-04-14 01:08:04.738
a9a2bfc0-431f-42a3-8be1-83cc542b6ca7	688d01bf-74fa-4a12-9513-1edb7930d425	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-15 16:17:12.145	\N	2026-04-15 16:17:12.145
c8a69b7b-7f46-483f-bfc4-af3617cdcea4	688d01bf-74fa-4a12-9513-1edb7930d425	5c023d1e-5904-4c8a-833a-54d816045fce	2026-04-15 16:17:12.145	\N	2026-04-15 16:17:12.145
0be12ae5-78e1-475a-8678-bb3df7cfa04b	344ef41b-c6ad-483c-beb4-9e6b1a7becf4	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-15 16:18:31.292	\N	2026-04-15 16:18:31.292
27e22962-9a76-4777-9b35-f18eb946fe8e	344ef41b-c6ad-483c-beb4-9e6b1a7becf4	5c023d1e-5904-4c8a-833a-54d816045fce	2026-04-15 16:18:31.292	\N	2026-04-15 16:18:31.292
09c41ccc-070e-4f61-b452-9f5c608670a7	500a207c-c72f-47f8-9fe7-d74e61493d37	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-15 16:20:39.381	\N	2026-04-15 16:20:39.381
057be72a-cf74-4f4c-96d6-acf78dba523e	500a207c-c72f-47f8-9fe7-d74e61493d37	5c023d1e-5904-4c8a-833a-54d816045fce	2026-04-15 16:20:39.381	\N	2026-04-15 16:20:39.381
727e3bba-ae9f-4905-8711-ffa7f13ef325	4ec84bce-ca51-41ab-b8a8-436b0e8ecdab	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-15 22:08:39.192	\N	2026-04-15 22:08:39.192
8672f339-510f-492a-9100-2e216a378a58	4ec84bce-ca51-41ab-b8a8-436b0e8ecdab	be68600a-d717-417d-8a87-5b43676a0705	2026-04-15 22:08:39.192	\N	2026-04-15 22:08:39.192
0b3160c3-f2b0-418f-ae35-9cc0e0ab5dbf	d4dfe160-f66d-4120-b8dc-2fc95fd6ca52	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-17 00:57:20.753	\N	2026-04-17 00:57:20.753
23f1730a-7e82-4b49-a27a-5bc137d18b5a	d4dfe160-f66d-4120-b8dc-2fc95fd6ca52	5c023d1e-5904-4c8a-833a-54d816045fce	2026-04-17 00:57:20.753	\N	2026-04-17 00:57:20.753
e949a58c-d4f0-491d-b69d-fa94800af56c	a2a2b3a0-df32-4241-a531-b6e5a2719ffc	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-17 01:21:36.566	\N	2026-04-17 01:21:36.566
ad53cab7-9bcd-455f-befe-deacc31ae773	a2a2b3a0-df32-4241-a531-b6e5a2719ffc	be68600a-d717-417d-8a87-5b43676a0705	2026-04-17 01:21:36.566	\N	2026-04-17 01:21:36.566
2abbeb33-56bb-44d9-9f2b-5ef76aca8a71	a656a209-422a-4634-b146-61a182a085bb	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-20 21:40:12.972	\N	2026-04-20 21:40:12.972
ce239fc5-0d2d-418c-9cca-d80a85fb4b70	a656a209-422a-4634-b146-61a182a085bb	ca3958c5-7d40-4bc0-b0e1-d22b801dbe81	2026-04-20 21:40:12.972	\N	2026-04-20 21:40:12.972
0c59c117-f671-451d-8f88-aa348c473990	838e8976-2ab0-4692-8fcd-ab8b2ebb799c	cfe3172c-7f75-490c-9f59-ccfa2bac159a	2026-04-27 22:34:12.874	\N	2026-04-27 22:34:12.874
\.


--
-- Data for Name: Sprint; Type: TABLE DATA; Schema: public; Owner: julieta3
--

COPY public."Sprint" (id, "projectId", name, goal, status, capacity, "startDate", "endDate", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Ticket; Type: TABLE DATA; Schema: public; Owner: julieta3
--

COPY public."Ticket" (id, "projectId", "sprintId", "parentTicketId", title, description, status, priority, "storyPoints", "assignedToId", "createdById", "startedAt", "completedAt", "estimatedHours", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: julieta3
--

COPY public."User" (id, email, "passwordHash", "fullName", "avatarUrl", role, status, "mustChangePassword", "lastLoginAt", "createdAt", "updatedAt", "deletedAt") FROM stdin;
cfe3172c-7f75-490c-9f59-ccfa2bac159a	admin@taskhub.com	$2b$10$B5RNmqEEptIPwjVB2ckOYu6tlXwZyFTlDCprdNab.ECQFRRtwfeSu	Admin TaskHub	\N	ADMIN	ACTIVE	f	\N	2026-04-07 22:11:43.713	2026-04-07 22:11:43.713	\N
5c023d1e-5904-4c8a-833a-54d816045fce	pm@taskhub.com	$2b$10$VbVwiFybIP.V3bAkQUz0keSh9vTST4aE.PqfsaKvH3Y3Gq8mKQZim	PM TaskHub	\N	PM	ACTIVE	f	\N	2026-04-07 22:11:43.728	2026-04-07 22:11:43.728	\N
54f7c3f4-991b-48b4-8f20-901f8ae5dbc8	dev@taskhub.com	$2b$10$0NncmYdYqJdFxXaZXOaGj.UaKe5lrkXxzNWj5Z169y7EpCvilrbGi	Developer TaskHub	\N	DEVELOPER	ACTIVE	f	\N	2026-04-07 22:11:43.733	2026-04-07 22:11:43.733	\N
72ebed37-b619-412b-81bb-f9db48b79cf4	nuevo@taskhub.com	$2b$10$LElP4nX3s.n7uF27gHmq0uH.ylUHqjVfGa32kV0NL0CmyY26Yqgc.	Nuevo Usuario	\N	DEVELOPER	PENDING_SETUP	t	\N	2026-04-07 22:41:49.76	2026-04-07 22:41:49.76	\N
7fcd6f01-1ad5-4413-a77f-73c214de612f	samirahazimr@gmail.com	$2b$10$7Q7AzW4W9c4gXVs48Ys7sOJhL.APCrj6RyF7ZskVVnJi5xhnqiNCm	angela	\N	DEVELOPER	ACTIVE	f	\N	2026-04-27 22:38:30.467	2026-04-27 22:39:43.236	\N
6c760374-9e6e-4246-820a-b91f94725e8b	julietalozano1310@gmail.com	$2b$10$P4AwdrEzgscfDFq.Z9cUY.4VyapQ2Tc13YIlGosegA3f7iOKdu/6S	Nuevo Usuario	\N	DEVELOPER	ACTIVE	f	\N	2026-04-08 00:41:27.459	2026-04-08 00:42:36.951	\N
6e4a50fc-e0c9-40fb-a980-d72ac6a46fcd	julieta.sandovall13@gmail.com	$2b$10$q2W92L0.kpD6m5RzizthQeiMwWh34qK1TYEdwJneh5JqrqgoroxQ2	julieta lozano	\N	DEVELOPER	PENDING_SETUP	t	\N	2026-04-08 21:58:35.954	2026-04-08 21:58:35.954	\N
bc0a689c-8697-4f1c-a096-ddb973ce55ca	josue.tijerina@outlook.com	$2b$10$AA7wHrGNdrO5T4eM2L8X1edpWDqLzSUBhWAd5kHczHUus//12Z2TC	Josue	\N	DEVELOPER	ACTIVE	f	\N	2026-04-08 22:55:29.713	2026-04-08 22:57:45.98	\N
be68600a-d717-417d-8a87-5b43676a0705	julietaa.lozanoo@gmail.com	$2b$10$R51lvhnEoHxVh5sQXkpcwe2vFN15KoaKtWg3BND1HXZgjFRerhEii	Julieta Sandoval Lozano	\N	PM	ACTIVE	f	\N	2026-04-15 22:07:14.412	2026-04-15 22:07:53.711	\N
af8359f3-1afa-4d37-beef-78eba39d0478	julieta.lozano1310@gmail.com	$2b$10$yfEfOnWeyK3Vq3mVF9.KTu7uxE4koMd.3NMsqwBgsPoBW/Ol5eOk6	julieta lozano	\N	DEVELOPER	ACTIVE	f	\N	2026-04-17 01:19:37.509	2026-04-17 01:20:46.527	\N
ca3958c5-7d40-4bc0-b0e1-d22b801dbe81	a00838292@tec.mx	$2b$10$Inc/3BC8Go3adoqP.uQMVuPJUI2Xv.hUO3F3A21B17cw8yNc1I9j6	Ernesto Ortiz	\N	PM	ACTIVE	f	\N	2026-04-20 21:35:48.602	2026-04-20 21:38:09.316	\N
fe7d969d-b47a-4c75-b95a-11481f31b9ac	s@gmail.com	$2b$10$X/G9N7u9vv/9CBULz3AJDO/hQKBJXZ4z0/wkabcRTH.4Krlp2jvMW	s	\N	DEVELOPER	PENDING_SETUP	t	\N	2026-04-27 21:49:18.634	2026-04-27 21:49:18.634	\N
52120ce7-8f44-46e8-ae4b-0a62e481b2ba	samira@gmail.com	$2b$10$IsnirSZV4aV7Bd7bx0XntuTOG0iFJqeut.MXOnk9DWT254O1eZFou	samira hazim	\N	PM	PENDING_SETUP	t	\N	2026-04-27 22:34:53.829	2026-04-27 22:34:53.829	\N
01634eea-10bf-460b-b236-c159c9c473b2	samirah@gmail.com	$2b$10$RFhW36b2FeW25BA46d7JKu2vNRgGBOvQ3nmmJ0/AJyEkES/Hn7HPS	samira	\N	PM	PENDING_SETUP	t	\N	2026-04-27 22:36:29.177	2026-04-27 22:36:29.177	\N
\.


--
-- Data for Name: UserOtp; Type: TABLE DATA; Schema: public; Owner: julieta3
--

COPY public."UserOtp" (id, "userId", type, "codeHash", "expiresAt", "usedAt", "createdAt") FROM stdin;
8180b8d5-8237-463f-8ad5-cbaffd99fe65	72ebed37-b619-412b-81bb-f9db48b79cf4	ACCOUNT_SETUP	$2b$10$8N50ESqHEv3CjHMtvygYBeSeECC4xCl3maOpyJUP1i4bIee76KRTi	2026-04-10 22:41:49.753	\N	2026-04-07 22:41:49.765
fada57ce-f192-454e-9846-277413b1782b	6c760374-9e6e-4246-820a-b91f94725e8b	ACCOUNT_SETUP	$2b$10$4DHp2RGSZwYp0RsFzSadTegZ1yw0K.RxGWS3S.8c0qwcEQyRuPHFa	2026-04-11 00:41:27.451	2026-04-08 00:42:36.955	2026-04-08 00:41:27.462
7d6ce318-ba17-4b54-8d09-6a003a8402e1	6e4a50fc-e0c9-40fb-a980-d72ac6a46fcd	ACCOUNT_SETUP	$2b$10$dLQbzG74DiIx0xOAtxJH4eImcVCkrLjlJ6NIF8wRJDT5JKJ89D246	2026-04-11 21:58:35.948	\N	2026-04-08 21:58:35.959
b9562839-4408-4637-bbc8-299047841248	bc0a689c-8697-4f1c-a096-ddb973ce55ca	ACCOUNT_SETUP	$2b$10$s6de2SRtB7R9z5i2gEdeHOcf4p/GpENU72GZb.52WfOCRVVnCUgkS	2026-04-08 23:05:29.709	2026-04-08 22:57:45.983	2026-04-08 22:55:29.718
f7b62859-948e-42b4-a40c-ea0104661a44	be68600a-d717-417d-8a87-5b43676a0705	ACCOUNT_SETUP	$2b$10$Ct6gLNDJcFc.hk/FbIs.dugYiGH98iEps0W628hu/ahD/a4AVomgO	2026-04-15 22:17:14.404	2026-04-15 22:07:53.713	2026-04-15 22:07:14.422
52f9c69e-ae41-4bb0-9e07-574eb71f7756	af8359f3-1afa-4d37-beef-78eba39d0478	ACCOUNT_SETUP	$2b$10$HWeNCHIwJ9fVIZ.Xhw.lLeAsRHhOTfLHQawryPp30.Gi9gTMsirAq	2026-04-17 01:29:37.506	2026-04-17 01:20:46.529	2026-04-17 01:19:37.521
fece47b3-6a4e-4b24-b761-127fe75f8c17	ca3958c5-7d40-4bc0-b0e1-d22b801dbe81	ACCOUNT_SETUP	$2b$10$o3amsmEb.fOMo/see4X.geT1lh9NWC4.OZRjZgP3PRs6xIHr5DO4O	2026-04-20 21:45:48.593	2026-04-20 21:38:09.318	2026-04-20 21:35:48.615
3338dce0-ab19-4339-8064-17e43d61e314	fe7d969d-b47a-4c75-b95a-11481f31b9ac	ACCOUNT_SETUP	$2b$10$/Bte1c8D3CFAlczoWV2y.ugdoDJh8GX6mYOSsqdQistrMJFa8sFdW	2026-04-27 21:59:18.628	\N	2026-04-27 21:49:18.648
3ec5ec42-ec39-4093-92ba-19c234f5d862	52120ce7-8f44-46e8-ae4b-0a62e481b2ba	ACCOUNT_SETUP	$2b$10$xxr1rStLDynHrfI75kuSKeS8MJXF6TPTNPe2UizVYaO.7elTztjWi	2026-04-27 22:44:53.827	\N	2026-04-27 22:34:53.842
1010ff48-6c2d-458d-9345-2d89540bc94d	01634eea-10bf-460b-b236-c159c9c473b2	ACCOUNT_SETUP	$2b$10$RGxoTu5SLS8xdPOd/0lj0uzwed9Jc0kNJqoO6BhyG.4EI/yCSVjkK	2026-04-27 22:46:29.176	\N	2026-04-27 22:36:29.179
b76b9374-4f16-4ee9-8ed0-d64059bf8664	7fcd6f01-1ad5-4413-a77f-73c214de612f	ACCOUNT_SETUP	$2b$10$VBLsrdOvnf1B8re758Ge1uUkZLtW.SxPVBv8XKZv4xV2fBys6OYGq	2026-04-27 22:48:30.467	2026-04-27 22:39:43.24	2026-04-27 22:38:30.47
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: julieta3
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ce465a5b-fd7c-4448-81d4-3d75c6b57142	77e0a0e2722774c6a427e850b67d7e711177801b87dbe937280b6b4450928072	2026-04-06 18:50:59.658555-06	20260407005059_init	\N	\N	2026-04-06 18:50:59.625242-06	1
eced0540-645f-4b85-8216-69889623e2cc	bb0a180837d06f6202d0afae36e93fa080bb3a2c82af12e40b1c177c6700deb8	2026-04-07 16:25:51.869989-06	20260407222551_add_user_otp_flow	\N	\N	2026-04-07 16:25:51.830047-06	1
\.


--
-- Name: ProjectMember ProjectMember_pkey; Type: CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public."ProjectMember"
    ADD CONSTRAINT "ProjectMember_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: Sprint Sprint_pkey; Type: CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public."Sprint"
    ADD CONSTRAINT "Sprint_pkey" PRIMARY KEY (id);


--
-- Name: Ticket Ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_pkey" PRIMARY KEY (id);


--
-- Name: UserOtp UserOtp_pkey; Type: CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public."UserOtp"
    ADD CONSTRAINT "UserOtp_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ProjectMember_projectId_idx; Type: INDEX; Schema: public; Owner: julieta3
--

CREATE INDEX "ProjectMember_projectId_idx" ON public."ProjectMember" USING btree ("projectId");


--
-- Name: ProjectMember_userId_idx; Type: INDEX; Schema: public; Owner: julieta3
--

CREATE INDEX "ProjectMember_userId_idx" ON public."ProjectMember" USING btree ("userId");


--
-- Name: Project_code_key; Type: INDEX; Schema: public; Owner: julieta3
--

CREATE UNIQUE INDEX "Project_code_key" ON public."Project" USING btree (code);


--
-- Name: Sprint_projectId_idx; Type: INDEX; Schema: public; Owner: julieta3
--

CREATE INDEX "Sprint_projectId_idx" ON public."Sprint" USING btree ("projectId");


--
-- Name: Ticket_assignedToId_idx; Type: INDEX; Schema: public; Owner: julieta3
--

CREATE INDEX "Ticket_assignedToId_idx" ON public."Ticket" USING btree ("assignedToId");


--
-- Name: Ticket_projectId_idx; Type: INDEX; Schema: public; Owner: julieta3
--

CREATE INDEX "Ticket_projectId_idx" ON public."Ticket" USING btree ("projectId");


--
-- Name: Ticket_sprintId_idx; Type: INDEX; Schema: public; Owner: julieta3
--

CREATE INDEX "Ticket_sprintId_idx" ON public."Ticket" USING btree ("sprintId");


--
-- Name: UserOtp_expiresAt_idx; Type: INDEX; Schema: public; Owner: julieta3
--

CREATE INDEX "UserOtp_expiresAt_idx" ON public."UserOtp" USING btree ("expiresAt");


--
-- Name: UserOtp_userId_type_idx; Type: INDEX; Schema: public; Owner: julieta3
--

CREATE INDEX "UserOtp_userId_type_idx" ON public."UserOtp" USING btree ("userId", type);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: julieta3
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: ProjectMember ProjectMember_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public."ProjectMember"
    ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectMember ProjectMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public."ProjectMember"
    ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Project Project_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Project Project_pmId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pmId_fkey" FOREIGN KEY ("pmId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Sprint Sprint_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public."Sprint"
    ADD CONSTRAINT "Sprint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Ticket Ticket_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Ticket Ticket_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ticket Ticket_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Ticket Ticket_sprintId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES public."Sprint"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserOtp UserOtp_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: julieta3
--

ALTER TABLE ONLY public."UserOtp"
    ADD CONSTRAINT "UserOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict aZdMMRK5dZz33UwdkYO9TCDTTkhzF2M3WaJRCoeQk9I06skPFg26ubYIPZL7L9F

