# Cine Match

**Cine Match** é uma aplicação desenvolvida como projeto final da disciplina  
**"Tópicos Avançados em SI 3 - Transformação Digital com IA: Utilizando Modelos de Linguagem no Ambiente de Negócios"**, disciplina oferecida pelo Centro de Informática (CIn) da Universidade Federal de Pernambuco (UFPE), ministrada pelo professor **Vinicius Cardoso Garcia**.

O objetivo do projeto é facilitar a escolha de filmes entre grupos de pessoas por meio de um agente de IA generativa. Através de uma interface simples, os usuários indicam suas preferências, e o sistema recomenda automaticamente os filmes mais compatíveis para todos os envolvidos, utilizando o modelo **Gemini 2.0 Flash (Google Generative AI)**.

## ✨ Funcionalidades
- Seleção personalizada de filmes para até 5 usuários
- Sugestões inteligentes com base nas escolhas do grupo
- IA integrada via LangChain para gerar recomendações contextuais
- Interface leve, intuitiva e responsiva

## 🛠️ Tecnologias
- **Next.js + React + TypeScript**
- **LangChain + Gemini 2.0 Flash**
- **TMDB API** como fonte de dados

## 🚀 Executando Localmente

### Requisitos
- Node.js (versão 18 ou superior)
- Yarn ou npm

### Passos

```bash
git clone https://github.com/seu-usuario/cine-match.git
cd cine-match
yarn install  # ou npm install
```

Crie um arquivo `.env` com base no `.env.example`:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_api_key
NEXT_PUBLIC_TMDB_API_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key
```

Execute o projeto:

```bash
yarn dev  # ou npm run dev
```

## 📎 Documentação

Esta é a versão oficial da documentação do Cine Match, disponível via Google Docs:  
👉 [Cine Match - Documentação Oficial](https://docs.google.com/document/d/1uS2Uky2c9RwAglfzjB7Sz99zHkBR0uFvVk9cy6rdE38/edit?usp=sharing)

## 👨‍💻 Equipe Responsável

Este projeto foi desenvolvido por:

- **Breno Santos** - `baas@cin.ufpe.br`
- **Gabriel Vieira** - `gqmv@cin.ufpe.br`
- **Ian Braga** - `igbt@cin.ufpe.br`
- **Luiz Schmalz** - `lefvs@cin.ufpe.br`
- **Philippe Menge** - `pmal@cin.ufpe.br`
