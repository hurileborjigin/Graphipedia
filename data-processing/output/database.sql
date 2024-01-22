--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1
-- Dumped by pg_dump version 16.1

-- Started on 2023-11-30 22:51:53

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
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- TOC entry 217 (class 1259 OID 683247)
-- Name: pagelinks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pagelinks (
    page_id integer NOT NULL,
    page_title character varying(255),
    page_children text[]
);


--
-- TOC entry 218 (class 1259 OID 683255)
-- Name: pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages (
    page_id numeric NOT NULL,
    page_title character varying(255) NOT NULL,
    children_count numeric DEFAULT 0
);


--
-- TOC entry 4695 (class 2606 OID 683254)
-- Name: pagelinks Pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagelinks
    ADD CONSTRAINT "Pages_pkey" PRIMARY KEY (page_id);


--
-- TOC entry 4698 (class 2606 OID 683269)
-- Name: pages Pages_pkey1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT "Pages_pkey1" PRIMARY KEY (page_id);


--
-- TOC entry 4696 (class 1259 OID 1181323)
-- Name: idx_pagelinks_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pagelinks_page_id ON public.pagelinks USING btree (page_id);


--
-- TOC entry 4699 (class 1259 OID 1181324)
-- Name: idx_pages_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_page_id ON public.pages USING btree (page_id);


--
-- TOC entry 4700 (class 2606 OID 683270)
-- Name: pagelinks page_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagelinks
    ADD CONSTRAINT page_id FOREIGN KEY (page_id) REFERENCES public.pages(page_id) NOT VALID;


-- Completed on 2023-11-30 22:51:53

--
-- PostgreSQL database dump complete
--

