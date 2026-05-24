const SHOP_ITEMS = [
    { id: "nectar", name: "Nectar do Café", price: 12, icon: "nectar", slot: "food", value: 18, consumable: true, shop: "cantina", note: "+fome" },
    { id: "pollen_cookie", name: "Biscoito de Pólen", price: 18, icon: "cookie", slot: "food", value: 26, consumable: true, shop: "cantina", note: "+fome" },
    { id: "fruit_study", name: "Natureza Morta", price: 30, icon: "stillLife", slot: "food", value: 38, consumable: true, shop: "cantina", level: 2, note: "+fome" },
    { id: "honey_sandwich", name: "Lanche de Mel", price: 48, icon: "sandwich", slot: "food", value: 55, consumable: true, shop: "cantina", level: 4, note: "+fome" },
    { id: "briefing_brownie", name: "Brownie do Briefing", price: 42, icon: "poster", slot: "food", value: 44, consumable: true, shop: "cantina", level: 3, note: "+fome" },
    { id: "deadline_coffee", name: "Café de Deadline", price: 36, icon: "nectar", slot: "food", value: 24, type: "energy_food", energyValue: 18, consumable: true, shop: "cantina", level: 3, note: "+fome e energia" },
    { id: "press_toast", name: "Torrada da Redação", price: 52, icon: "newspaper", slot: "food", value: 58, consumable: true, shop: "cantina", level: 4, note: "+fome" },

    { id: "soap", name: "Sabão de Ateliê", price: 0, icon: "soap", slot: "utility", shop: "care", note: "limpeza" },
    { id: "rest_tonic", name: "Tônico de Descanso", price: 55, icon: "tonic", slot: "potion", type: "energy", value: 34, consumable: true, shop: "care", note: "+energia" },
    { id: "varnish_cure", name: "Verniz Restaurador", price: 70, icon: "care", slot: "potion", type: "health", value: 36, consumable: true, shop: "care", note: "+saúde" },
    { id: "muse_pass", name: "Passe de Museu", price: 90, icon: "gallery", slot: "potion", type: "fun", value: 45, consumable: true, shop: "care", level: 3, note: "+inspiração" },
    { id: "portfolio_review", name: "Revisao de Portfolio", price: 115, icon: "laptop", slot: "potion", type: "fun", value: 52, consumable: true, shop: "care", level: 4, note: "+inspiração" },
    { id: "banca_blessing", name: "Elogio da Banca", price: 140, icon: "cap", slot: "potion", type: "health", value: 48, consumable: true, shop: "care", level: 5, note: "+saúde" },
    { id: "chaos_potion", name: "Poção do Caos", price: 30, icon: "care", slot: "potion", type: "drain_all", value: 18, consumable: true, shop: "care", level: 2, note: "-todos os status" },

    { id: "yellow_body", name: "Tinta Corporal Mel", price: 0, icon: "color", slot: "bodyColor", color: "#f4c434", shop: "style", note: "cor do corpo" },
    { id: "rose_body", name: "Tinta Corporal Rosa", price: 160, icon: "color", slot: "bodyColor", color: "#ed8a9a", shop: "style", level: 2, note: "cor do corpo" },
    { id: "lapis_body", name: "Tinta Corporal Azul", price: 190, icon: "color", slot: "bodyColor", color: "#58b7d8", shop: "style", level: 3, note: "cor do corpo" },
    { id: "charcoal_body", name: "Tinta Corporal Carvão", price: 280, icon: "color", slot: "bodyColor", color: "#34302b", shop: "style", level: 5, note: "cor do corpo" },
    { id: "carmim_body", name: "Tinta BA Carmim", price: 210, icon: "color", slot: "bodyColor", color: "#df4d5c", shop: "style", level: 3, note: "cor de cartaz" },
    { id: "verdigris_body", name: "Tinta Design Verde", price: 230, icon: "color", slot: "bodyColor", color: "#46aa80", shop: "style", level: 4, note: "cor de oficina" },
    { id: "violet_body", name: "Tinta Agencia Violeta", price: 260, icon: "color", slot: "bodyColor", color: "#7256a6", shop: "style", level: 5, note: "cor de campanha" },
    { id: "mint_body", name: "Tinta Vidro Atelier", price: 180, icon: "color", slot: "bodyColor", color: "#7bd8bc", shop: "style", level: 2, note: "cor translúcida" },
    { id: "cream_body", name: "Tinta Papel Algodao", price: 175, icon: "color", slot: "bodyColor", color: "#f6e7c8", shop: "style", level: 2, note: "cor editorial" },
    { id: "navy_body", name: "Tinta Noite de Banca", price: 295, icon: "color", slot: "bodyColor", color: "#27335f", shop: "style", level: 5, note: "cor profunda" },
    { id: "lime_body", name: "Tinta Marca Texto", price: 245, icon: "color", slot: "bodyColor", color: "#b8e04d", shop: "style", level: 4, note: "cor de destaque" },
    { id: "amber_stripes", name: "Padrão Ocre", price: 0, icon: "stripes", slot: "stripeColor", color: "#8b5831", shop: "style", note: "listras da abelha" },
    { id: "madder_stripes", name: "Padrão Carmim", price: 130, icon: "stripes", slot: "stripeColor", color: "#c8464a", shop: "style", note: "listras da abelha" },
    { id: "graphite_stripes", name: "Padrão Grafite", price: 210, icon: "stripes", slot: "stripeColor", color: "#34302b", shop: "style", level: 3, note: "listras da abelha" },
    { id: "cobalt_stripes", name: "Padrão Jornal Azul", price: 185, icon: "stripes", slot: "stripeColor", color: "#2167a8", shop: "style", level: 3, note: "listras editoriais" },
    { id: "green_stripes", name: "Padrão Economia", price: 205, icon: "stripes", slot: "stripeColor", color: "#2f8f63", shop: "style", level: 4, note: "listras de planilha" },
    { id: "rose_stripes", name: "Padrão Rosa Grafico", price: 170, icon: "stripes", slot: "stripeColor", color: "#e56f8c", shop: "style", level: 2, note: "listras de identidade" },
    { id: "violet_stripes", name: "Padrão Violeta", price: 210, icon: "stripes", slot: "stripeColor", color: "#7256a6", shop: "style", level: 3, note: "listras de campanha" },
    { id: "white_stripes", name: "Padrão Giz Branco", price: 230, icon: "stripes", slot: "stripeColor", color: "#fffaf0", shop: "style", level: 4, note: "listras de quadro" },
    { id: "blue_wings", name: "Asas Cianotipo", price: 0, icon: "wings", slot: "wingColor", color: "#b9eff6", shop: "style", note: "cor das asas" },
    { id: "violet_wings", name: "Asas Violeta", price: 150, icon: "wings", slot: "wingColor", color: "#d5c8ff", shop: "style", level: 2, note: "cor das asas" },
    { id: "amber_wings", name: "Asas Douradas", price: 240, icon: "wings", slot: "wingColor", color: "#ffe08a", shop: "style", level: 4, note: "cor das asas" },
    { id: "press_wings", name: "Asas Papel Jornal", price: 220, icon: "newspaper", slot: "wingColor", color: "#f5f0de", shop: "style", level: 3, note: "asas de pauta" },
    { id: "neon_wings", name: "Asas Mockup Neon", price: 310, icon: "wings", slot: "wingColor", color: "#a8f0ff", shop: "style", level: 5, note: "asas de protótipo" },
    { id: "glass_wings", name: "Asas Vidro Fosco", price: 195, icon: "wings", slot: "wingColor", color: "#dff9ff", shop: "style", level: 2, note: "asas suaves" },
    { id: "rose_wings", name: "Asas Cartaz Rosa", price: 220, icon: "wings", slot: "wingColor", color: "#ffd2df", shop: "style", level: 3, note: "asas de cartaz" },
    { id: "green_wings", name: "Asas Jardim BA", price: 250, icon: "wings", slot: "wingColor", color: "#bcefcf", shop: "style", level: 4, note: "asas verdes" },

    { id: "classic_marking", name: "Marca Clássica", price: 0, icon: "stripes", slot: "marking", shop: "style", note: "abdome tradicional" },
    { id: "poster_marking", name: "Marca Cartaz Lambe", price: 140, icon: "poster", slot: "marking", shop: "style", level: 2, note: "formas de cartaz" },
    { id: "press_marking", name: "Marca Pauta", price: 170, icon: "newspaper", slot: "marking", shop: "style", level: 3, note: "linhas de jornal" },
    { id: "campaign_marking", name: "Marca Campanha", price: 210, icon: "target", slot: "marking", shop: "style", level: 4, note: "alvo de publicidade" },
    { id: "economy_marking", name: "Marca Grafico", price: 230, icon: "chart", slot: "marking", shop: "style", level: 4, note: "linha de economia" },
    { id: "design_marking", name: "Marca Grid", price: 250, icon: "ruler", slot: "marking", shop: "style", level: 5, note: "grade de design" },

    { id: "classic_antenna", name: "Antena Clássica", price: 0, icon: "sparkle", slot: "antenna", shop: "style", note: "pontas amarelas" },
    { id: "neon_antenna", name: "Antena Neon BA", price: 120, icon: "sparkle", slot: "antenna", shop: "style", level: 2, note: "pontas luminosas" },
    { id: "press_antenna", name: "Antena Pauta", price: 150, icon: "newspaper", slot: "antenna", shop: "style", level: 2, note: "sinal de reportagem" },
    { id: "campus_antenna", name: "Antena Campus", price: 185, icon: "badge", slot: "antenna", shop: "style", level: 3, note: "bolinhas BA" },
    { id: "signal_antenna", name: "Antena Podcast", price: 220, icon: "microphone", slot: "antenna", shop: "style", level: 4, note: "ondas de audio" },
    { id: "gold_antenna", name: "Antena Ouro de Banca", price: 280, icon: "sparkle", slot: "antenna", shop: "style", level: 5, note: "acabamento premium" },

    { id: "no_cheeks", name: "Rosto Limpo", price: 0, icon: "eyes", slot: "cheeks", shop: "style", note: "sem detalhe no rosto" },
    { id: "rose_cheeks", name: "Bochecha Rosa", price: 90, icon: "color", slot: "cheeks", color: "#f08aa0", shop: "style", note: "toque delicado" },
    { id: "paint_splash_cheeks", name: "Respingo de Tinta", price: 140, icon: "palette", slot: "cheeks", shop: "style", level: 2, note: "rosto de ateliê" },
    { id: "freckle_cheeks", name: "Sardas de Grafite", price: 120, icon: "color", slot: "cheeks", shop: "style", level: 2, note: "pontinhos de desenho" },
    { id: "sticker_cheeks", name: "Adesivo BA", price: 175, icon: "badge", slot: "cheeks", shop: "style", level: 3, note: "adesivos de campus" },
    { id: "pixel_cheeks", name: "Pixels de Design", price: 205, icon: "ruler", slot: "cheeks", shop: "style", level: 4, note: "rosto digital" },

    { id: "no_aura", name: "Sem Aura", price: 0, icon: "sparkle", slot: "aura", shop: "style", note: "visual limpo" },
    { id: "spark_aura", name: "Aura Vernissage", price: 160, icon: "sparkle", slot: "aura", shop: "style", level: 2, note: "brilhos discretos" },
    { id: "briefing_aura", name: "Aura Briefing", price: 190, icon: "poster", slot: "aura", shop: "style", level: 3, note: "cartoes de campanha" },
    { id: "news_aura", name: "Aura Redação", price: 200, icon: "newspaper", slot: "aura", shop: "style", level: 3, note: "linhas de pauta" },
    { id: "data_aura", name: "Aura Dados", price: 230, icon: "chart", slot: "aura", shop: "style", level: 4, note: "gráficos ao redor" },
    { id: "design_aura", name: "Aura Grid", price: 245, icon: "ruler", slot: "aura", shop: "style", level: 4, note: "guias de layout" },
    { id: "pp_aura", name: "Aura Campanha PP", price: 285, icon: "target", slot: "aura", shop: "style", level: 5, note: "impacto publicitario" },

    { id: "no_badge", name: "Sem Emblema", price: 0, icon: "badge", slot: "badge", shop: "style", note: "corpo sem pin" },
    { id: "ba_badge", name: "Emblema BA", price: 110, icon: "badge", slot: "badge", shop: "style", note: "pin Belas Artes" },
    { id: "press_badge", name: "Emblema Jornalismo", price: 150, icon: "newspaper", slot: "badge", shop: "style", level: 2, note: "pin de pauta" },
    { id: "economy_badge", name: "Emblema Economia", price: 170, icon: "chart", slot: "badge", shop: "style", level: 3, note: "pin de dados" },
    { id: "design_badge", name: "Emblema Design", price: 185, icon: "ruler", slot: "badge", shop: "style", level: 3, note: "pin de grid" },
    { id: "pp_badge", name: "Emblema PP", price: 205, icon: "megaphone", slot: "badge", shop: "style", level: 4, note: "pin de campanha" },
    { id: "star_badge", name: "Emblema Estrela", price: 240, icon: "sparkle", slot: "badge", shop: "style", level: 5, note: "pin especial" },

    { id: "curious_eyes", name: "Olhar Curioso", price: 0, icon: "eyes", slot: "eyes", shop: "closet", note: "expressao" },
    { id: "sleepy_eyes", name: "Olhar de Aula 7h", price: 95, icon: "eyes", slot: "eyes", shop: "closet", note: "expressao" },
    { id: "spark_eyes", name: "Olhar Estrela", price: 180, icon: "sparkle", slot: "eyes", shop: "closet", level: 3, note: "expressao dos olhos" },
    { id: "reporter_eyes", name: "Olhar Reporter", price: 145, icon: "newspaper", slot: "eyes", shop: "closet", level: 2, note: "atento a pauta" },
    { id: "planner_eyes", name: "Olhar Planejamento", price: 180, icon: "target", slot: "eyes", shop: "closet", level: 3, note: "foco em campanha" },
    { id: "data_eyes", name: "Olhar Analítico", price: 210, icon: "chart", slot: "eyes", shop: "closet", level: 4, note: "olhar de numeros" },
    { id: "soft_smile", name: "Sorriso Leve", price: 0, icon: "mouth", slot: "mouth", shop: "closet", note: "boca" },
    { id: "proud_smile", name: "Sorriso de Banca", price: 110, icon: "mouth", slot: "mouth", shop: "closet", note: "boca" },
    { id: "focus_mouth", name: "Boca Concentrada", price: 95, icon: "mouth", slot: "mouth", shop: "closet", note: "boca" },
    { id: "pitch_mouth", name: "Boca de Pitch", price: 140, icon: "megaphone", slot: "mouth", shop: "closet", level: 2, note: "apresentação" },
    { id: "interview_mouth", name: "Boca Entrevista", price: 155, icon: "microphone", slot: "mouth", shop: "closet", level: 3, note: "fala de reportagem" },
    { id: "beret", name: "Boina de Pintura", price: 145, icon: "beret", slot: "hat", shop: "closet", note: "acessorio de cabeca" },
    { id: "halo_hat", name: "Auréola de Museu", price: 230, icon: "sparkle", slot: "hat", shop: "closet", level: 4, note: "acessorio de cabeca" },
    { id: "press_cap", name: "Boné de Reporter", price: 160, icon: "newspaper", slot: "hat", shop: "closet", level: 2, note: "jornalismo" },
    { id: "graduation_cap", name: "Capelo BA", price: 260, icon: "cap", slot: "hat", shop: "closet", level: 5, note: "formatura" },
    { id: "agency_headset", name: "Headset de Agencia", price: 220, icon: "microphone", slot: "hat", shop: "closet", level: 4, note: "atendimento" },
    { id: "visor_hat", name: "Viseira de Criacao", price: 150, icon: "cap", slot: "hat", shop: "closet", level: 2, note: "look de brainstorm" },
    { id: "paint_crown", name: "Coroa de Respingos", price: 240, icon: "palette", slot: "hat", shop: "closet", level: 4, note: "cabeca artistica" },
    { id: "planner_pin", name: "Presilha Planner", price: 175, icon: "target", slot: "hat", shop: "closet", level: 3, note: "detalhe de planejamento" },
    { id: "critique_glasses", name: "Óculos de Crítica", price: 155, icon: "glasses", slot: "glasses", shop: "closet", level: 2, note: "rosto" },
    { id: "round_glasses", name: "Óculos Redondo", price: 135, icon: "glasses", slot: "glasses", shop: "closet", level: 2, note: "visual de ateliê" },
    { id: "data_glasses", name: "Óculos de Dados", price: 210, icon: "chart", slot: "glasses", shop: "closet", level: 4, note: "economia" },
    { id: "design_specs", name: "Óculos de Design", price: 230, icon: "ruler", slot: "glasses", shop: "closet", level: 5, note: "grid e detalhe" },
    { id: "apron", name: "Avental de Ateliê", price: 180, icon: "apron", slot: "outfit", shop: "closet", level: 3, note: "traje de trabalho" },
    { id: "museum_cape", name: "Capa de Vernissage", price: 290, icon: "apron", slot: "outfit", shop: "closet", level: 5, note: "traje de exposicao" },
    { id: "ba_uniform", name: "Uniforme Belas Artes", price: 160, icon: "uniform", slot: "outfit", shop: "closet", level: 2, note: "uniforme de campus" },
    { id: "journalism_vest", name: "Colete Jornalismo", price: 210, icon: "vest", slot: "outfit", shop: "closet", level: 3, note: "pauta em campo" },
    { id: "economy_blazer", name: "Blazer Economia", price: 230, icon: "blazer", slot: "outfit", shop: "closet", level: 4, note: "apresentação de dados" },
    { id: "design_smock", name: "Jaleco de Design", price: 240, icon: "ruler", slot: "outfit", shop: "closet", level: 4, note: "prototipagem" },
    { id: "pp_blazer", name: "Blazer PP", price: 260, icon: "megaphone", slot: "outfit", shop: "closet", level: 5, note: "publicidade e propaganda" },
    { id: "agency_hoodie", name: "Moletom Agencia", price: 280, icon: "hoodie", slot: "outfit", shop: "closet", level: 5, note: "criação de campanha" },
    { id: "radio_jacket", name: "Jaqueta de Radio", price: 235, icon: "microphone", slot: "outfit", shop: "closet", level: 4, note: "podcast e entrevista" },
    { id: "startup_tee", name: "Camiseta Startup", price: 205, icon: "laptop", slot: "outfit", shop: "closet", level: 3, note: "pitch e produto" },
    { id: "photo_vest", name: "Colete Foto e Video", price: 225, icon: "camera", slot: "outfit", shop: "closet", level: 4, note: "captação em campo" },
    { id: "campus_cardigan", name: "Cardigan Campus", price: 190, icon: "uniform", slot: "outfit", shop: "closet", level: 3, note: "visual universitario" },
    { id: "brush_prop", name: "Pincel Fino", price: 0, icon: "brush", slot: "prop", shop: "closet", note: "ferramenta na mao" },
    { id: "chisel_prop", name: "Formão de Escultura", price: 170, icon: "chisel", slot: "prop", shop: "closet", level: 4, note: "ferramenta na mao" },
    { id: "palette_prop", name: "Paleta de Cor", price: 190, icon: "palette", slot: "prop", shop: "closet", level: 3, note: "ferramenta na mao" },
    { id: "mic_prop", name: "Microfone de Entrevista", price: 155, icon: "microphone", slot: "prop", shop: "closet", level: 2, note: "jornalismo" },
    { id: "camera_prop", name: "Camera de Making Of", price: 210, icon: "camera", slot: "prop", shop: "closet", level: 3, note: "captação" },
    { id: "megaphone_prop", name: "Megafone de Campanha", price: 230, icon: "megaphone", slot: "prop", shop: "closet", level: 4, note: "publicidade" },
    { id: "chart_prop", name: "Grafico de Economia", price: 220, icon: "chart", slot: "prop", shop: "closet", level: 4, note: "análise" },
    { id: "laptop_prop", name: "Notebook de Design", price: 260, icon: "laptop", slot: "prop", shop: "closet", level: 5, note: "protótipo" },
    { id: "tablet_prop", name: "Tablet de Layout", price: 210, icon: "laptop", slot: "prop", shop: "closet", level: 3, note: "wireframe na mao" },
    { id: "poster_prop", name: "Cartaz de Campanha", price: 180, icon: "poster", slot: "prop", shop: "closet", level: 2, note: "peça impressa" },
    { id: "notebook_prop", name: "Caderno de Pauta", price: 160, icon: "newspaper", slot: "prop", shop: "closet", level: 2, note: "anotações" },
    { id: "coffee_prop", name: "Café de Agencia", price: 135, icon: "nectar", slot: "prop", shop: "closet", note: "copo na mao" },
    { id: "pencil_prop", name: "Lapiseira de Croqui", price: 145, icon: "brush", slot: "prop", shop: "closet", note: "desenho rápido" },

    { id: "studio_wall", name: "Parede de Ateliê", price: 0, icon: "frame", slot: "bg", shop: "home", note: "ambiente" },
    { id: "gallery_wall", name: "Galeria Clara", price: 210, icon: "gallery", slot: "bg", shop: "home", level: 2, note: "ambiente" },
    { id: "print_wall", name: "Oficina de Gravura", price: 260, icon: "print", slot: "bg", shop: "home", level: 3, note: "ambiente" },
    { id: "mural_wall", name: "Mural Modernista", price: 330, icon: "mural", slot: "bg", shop: "home", level: 5, note: "ambiente" },
    { id: "campus_patio", name: "Patio Belas Artes", price: 190, icon: "gallery", slot: "bg", shop: "home", level: 2, note: "mosaico de campus" },
    { id: "newsroom_wall", name: "Redação Jornalismo", price: 240, icon: "newspaper", slot: "bg", shop: "home", level: 3, note: "pautas e mural" },
    { id: "agency_wall", name: "Agencia PP", price: 280, icon: "megaphone", slot: "bg", shop: "home", level: 4, note: "briefing e cartazes" },
    { id: "economy_room", name: "Sala Economia", price: 280, icon: "chart", slot: "bg", shop: "home", level: 4, note: "gráficos e quadro" },
    { id: "design_lab", name: "Lab Design", price: 310, icon: "laptop", slot: "bg", shop: "home", level: 5, note: "grid e protótipo" },
    { id: "radio_studio", name: "Estúdio de Podcast", price: 330, icon: "microphone", slot: "bg", shop: "home", level: 5, note: "audio e entrevista" },
    { id: "auditorium_wall", name: "Auditório de Banca", price: 360, icon: "cap", slot: "bg", shop: "home", level: 6, note: "apresentação final" },
    { id: "photo_studio", name: "Estúdio Foto e Video", price: 290, icon: "camera", slot: "bg", shop: "home", level: 4, note: "luz, tripes e set" },
    { id: "library_wall", name: "Biblioteca de Repertorio", price: 260, icon: "newspaper", slot: "bg", shop: "home", level: 3, note: "livros e referencias" },
    { id: "startup_room", name: "Sala de Pitch", price: 300, icon: "laptop", slot: "bg", shop: "home", level: 4, note: "produto e apresentação" },
    { id: "creative_board", name: "Board de Campanha", price: 340, icon: "target", slot: "bg", shop: "home", level: 5, note: "post-its e conceito" },
    { id: "rooftop_wall", name: "Terraço BA", price: 380, icon: "gallery", slot: "bg", shop: "home", level: 6, note: "fim de tarde no campus" },

    { id: "plaster_ball", name: "Bola de Gesso", price: 0, icon: "ball", slot: "toy", shop: "games", note: "brinquedo" },
    { id: "color_wheel", name: "Círculo Cromático", price: 180, icon: "palette", slot: "toy", shop: "games", level: 2, note: "brinquedo" },
    { id: "typography_cube", name: "Cubo Tipografico", price: 160, icon: "ruler", slot: "toy", shop: "games", level: 2, note: "brinquedo de design" },
    { id: "briefing_ball", name: "Bola Briefing", price: 210, icon: "target", slot: "toy", shop: "games", level: 3, note: "brinquedo de PP" },
    { id: "press_cards", name: "Cartas de Pauta", price: 190, icon: "newspaper", slot: "toy", shop: "games", level: 3, note: "brinquedo de jornalismo" }
];

if (window.CatalogValidation?.enforce) {
    window.CatalogValidation.enforce(SHOP_ITEMS);
}

const SHOPS = [
    { id: "cantina", name: "Café BA", icon: "canteen", note: "lanches para criar" },
    { id: "care", name: "Bem-estar", icon: "care", note: "energia, limpeza e saúde" },
    { id: "style", name: "Identidade", icon: "palette", note: "cores e marcas da abelha" },
    { id: "closet", name: "Looks", icon: "closet", note: "cursos, acessórios e objetos" },
    { id: "home", name: "Ambientes", icon: "gallery", note: "salas BA desenhadas em codigo" },
    { id: "games", name: "Jogos", icon: "game", note: "brinquedos e repertorio BA" }
];

const SHOP_ROOM_ORDER = {
    bedroom: ["closet", "style", "home", "care", "games", "cantina"],
    kitchen: ["cantina", "care", "style", "closet", "home", "games"],
    bathroom: ["care", "style", "closet", "home", "cantina", "games"],
    laboratory: ["care", "cantina", "style", "closet", "home", "games"],
    "game-room": ["games", "closet", "style", "home", "cantina", "care"]
};

const SHOP_SLOT_NAMES = {
    food: "Comidas",
    utility: "Banho",
    potion: "Poções",
    bodyColor: "Corpo",
    stripeColor: "Listras",
    wingColor: "Asas",
    marking: "Marcas",
    antenna: "Antenas",
    cheeks: "Rosto",
    aura: "Aura",
    badge: "Pins",
    eyes: "Olhar",
    mouth: "Boca",
    hat: "Cabeça",
    glasses: "Óculos",
    outfit: "Looks",
    prop: "Objetos",
    bg: "Fundos",
    toy: "Brinquedos"
};

class Shop {
    constructor() {
        this.modal = document.getElementById("shop-modal");
        this.title = document.getElementById("shop-title");
        this.categoriesGrid = document.getElementById("shop-categories");
        this.itemsList = document.getElementById("shop-items");
        this.closeBtn = document.getElementById("close-shop");
        this.backBtn = document.getElementById("back-shop");
        this.currentShop = null;
        this.currentSlot = null;

        this.closeBtn.onclick = () => this.hide();
        this.backBtn.onclick = () => this.showShops();
        State.subscribe(() => {
            if (!this.modal.classList.contains("hidden") && this.currentShop) this.renderItems();
        });
    }

    show() {
        this.modal.classList.remove("hidden");
        Utils.audio.play("open");
        Utils.animate(this.modal, { opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "scale(1)" }, { duration: 180 });
        this.showShops();
    }

    openItems(shopId) {
        this.modal.classList.remove("hidden");
        Utils.audio.play("open");
        Utils.animate(this.modal, { opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "scale(1)" }, { duration: 180 });
        this.showItems(shopId);
    }

    hide() {
        Utils.animate(this.modal, { opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.96)" }, {
            duration: 150,
            onFinish: () => this.modal.classList.add("hidden")
        });
    }

    showShops() {
        this.currentShop = null;
        this.currentSlot = null;
        this.title.textContent = "Loja";
        this.backBtn.classList.add("hidden");
        this.categoriesGrid.classList.remove("hidden");
        this.itemsList.classList.add("hidden");
        this.categoriesGrid.innerHTML = "";
        this.categoriesGrid.classList.add("shop-home-grid");

        this.orderedShops().forEach(shop => {
            const shopItems = SHOP_ITEMS.filter(item => item.shop === shop.id);
            const owned = shopItems.filter(item => State.state.inventory.includes(item.id) || item.price === 0).length;
            const card = document.createElement("button");
            card.className = "category-card shop-category-tile";
            card.type = "button";
            card.innerHTML = `
                <div class="category-icon">${Utils.icon(shop.icon)}</div>
                <div>
                    <div class="category-name">${shop.name}</div>
                    <span class="category-note">${owned}/${shopItems.length} itens</span>
                </div>
                <strong>${shop.note}</strong>
            `;
            card.onclick = () => this.showItems(shop.id);
            this.categoriesGrid.appendChild(card);
        });
    }

    showItems(shopId) {
        this.currentShop = shopId;
        const shop = SHOPS.find(entry => entry.id === shopId);
        this.title.textContent = shop ? shop.name : "Itens";
        this.currentSlot = this.slotsForShop(shopId)[0] || null;
        this.backBtn.classList.remove("hidden");
        this.categoriesGrid.classList.remove("shop-home-grid");
        this.categoriesGrid.classList.add("hidden");
        this.itemsList.classList.remove("hidden");
        this.itemsList.scrollTop = 0;
        this.renderItems();
    }

    renderItems() {
        this.itemsList.innerHTML = "";
        this.itemsList.classList.add("shop-shelf");
        const state = State.state;
        const slots = this.slotsForShop(this.currentShop);
        if (!this.currentSlot || !slots.includes(this.currentSlot)) this.currentSlot = slots[0] || null;

        if (slots.length > 1) this.itemsList.appendChild(this.createSlotTabs(slots));

        const grid = document.createElement("div");
        grid.className = "shop-items-grid";
        const allItems = SHOP_ITEMS
            .filter(item =>
                item.shop === this.currentShop &&
                !(this.currentShop === "care" && item.slot === "utility") &&
                (!this.currentSlot || item.slot === this.currentSlot)
            )
            .sort((a, b) => this.compareItems(a, b, state));
        const items = allItems.filter(item => item.consumable || !this.itemOwned(item, state));
        if (!items.length) {
            const empty = document.createElement("div");
            empty.className = "shop-empty-note";
            empty.textContent = "Nao ha mais itens para comprar nessa aba.";
            grid.appendChild(empty);
        } else {
            items.forEach(item => grid.appendChild(this.createTile(item, state)));
        }
        this.itemsList.appendChild(grid);
    }

    compareItems(a, b, state) {
        const aLocked = State.isLocked(a) ? 1 : 0;
        const bLocked = State.isLocked(b) ? 1 : 0;
        if (aLocked !== bLocked) return aLocked - bLocked;
        const aOwned = this.itemOwned(a, state) ? 1 : 0;
        const bOwned = this.itemOwned(b, state) ? 1 : 0;
        if (aOwned !== bOwned) return bOwned - aOwned;
        return (a.price || 0) - (b.price || 0);
    }

    itemOwned(item, state) {
        return state.inventory.includes(item.id) || item.price === 0;
    }

    createTile(item, state) {
        const owned = this.itemOwned(item, state);
        const count = State.getItemCount(item.id);
        const equipped = state.equipped[item.slot] === item.id;
        const locked = State.isLocked(item);
        const rarity = item.visualMeta?.rarity || "common";
        const badge = this.tileBadge(item, owned, equipped, locked, count);
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = `shop-item-tile rarity-${rarity} ${owned && !item.consumable ? "owned" : ""} ${item.consumable ? "consumable" : ""} ${equipped ? "equipped" : ""} ${locked ? "locked" : ""}`;

        let actionText = "Obter";
        if (locked) {
            actionText = `Nv ${item.level}`;
        } else if (equipped) {
            actionText = "Em uso";
        } else if (owned && !item.consumable) {
            actionText = "Usar";
        } else if (item.consumable && count > 0) {
            actionText = "Comprar +";
        }

        tile.innerHTML = `
            <div class="shop-tile-preview" style="${item.color ? `background:${item.color}` : ""}">
                ${Utils.icon(item.icon, { accent: item.color || "var(--honey)" })}
                ${badge ? `<span class="shop-item-badge">${badge}</span>` : ""}
                ${count > 0 && item.consumable ? `<span class="shop-count">${count}</span>` : ""}
                ${equipped ? `<span class="shop-equipped">OK</span>` : ""}
            </div>
            <strong>${item.name}</strong>
            <span>${this.shortNote(item, owned, equipped, locked, count)}</span>
            <div class="shop-tile-footer">
                <span class="shop-price">${this.priceLine(item, owned, locked, count)}</span>
                <em>${actionText}</em>
            </div>
        `;

        tile.onclick = () => {
            if (locked) return;
            if (!owned || item.consumable) {
                if (!State.buyItem(item.id)) {
                    Utils.showToast("Faltam moedas.");
                    return;
                }
                if (!item.consumable) {
                    State.equipItem(item.slot, item.id);
                    Utils.audio.play("buy");
                    Utils.showToast(`${item.name} liberado e equipado.`);
                } else {
                    Utils.audio.play("buy");
                    Utils.showToast(`${item.name} foi para a mochila.`);
                }
                window.Application?.onItemPurchased?.(item);
            } else {
                State.equipItem(item.slot, item.id);
                Utils.audio.play("equip");
                window.Application?.onItemPurchased?.(item);
            }
        };
        return tile;
    }

    tileBadge(item, owned, equipped, locked, count) {
        if (locked) return "Nv";
        if (equipped) return "Em uso";
        if (item.visualMeta?.badge === "new") return "Novo";
        if (item.visualMeta?.badge === "meta") return "Meta";
        if (item.consumable && count > 0) return "Estoque";
        if (owned) return "Seu";
        return "";
    }

    createSlotTabs(slots) {
        const tabs = document.createElement("div");
        tabs.className = "shop-slot-tabs";
        slots.forEach(slot => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = slot === this.currentSlot ? "active" : "";
            const amount = SHOP_ITEMS.filter(item => item.shop === this.currentShop && item.slot === slot).length;
            button.innerHTML = `<span>${SHOP_SLOT_NAMES[slot] || slot}</span><small>${amount}</small>`;
            button.onclick = () => {
                this.currentSlot = slot;
                Utils.audio.play("tap");
                this.renderItems();
            };
            tabs.appendChild(button);
        });
        return tabs;
    }

    slotsForShop(shopId) {
        const items = SHOP_ITEMS.filter(item => item.shop === shopId && !(shopId === "care" && item.slot === "utility"));
        return [...new Set(items.map(item => item.slot))];
    }

    orderedShops() {
        const roomId = window.Application?.room?.id || State.state.room || "bedroom";
        const order = SHOP_ROOM_ORDER[roomId] || SHOP_ROOM_ORDER.bedroom;
        return order.map(id => SHOPS.find(shop => shop.id === id)).filter(Boolean);
    }

    priceLine(item, owned, locked, count) {
        if (locked) return `Nv ${item.level}`;
        if (owned && !item.consumable) return "Coleção";
        return `${item.price || 0}`;
    }

    shortNote(item, owned, equipped, locked, count) {
        if (locked) return `${item.note || "item"} liberado no nível ${item.level}`;
        if (equipped) return "em uso agora";
        if (owned && !item.consumable) return "toque em usar para aplicar";
        if (item.consumable) return count > 0 ? `mochila: ${count}` : item.note || "consumivel";
        return item.note || "customizacao";
    }
}

window.ShopLogic = Shop;

