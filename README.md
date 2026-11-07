# 💋 The Rocky Horror Party

Site da festa de Halloween em **Next.js 16 + React 19 + Tailwind CSS 4**, com
linguagem de divulgação de filme de terror: neblina em WebGL, lanterna que
segue o cursor, abertura em tela preta, som ambiente opcional e granulação de
película. Fontes Cormorant Garamond, IBM Plex Mono e Inter.

## Rodar

```bash
npm install     # pelo PowerShell/CMD do Windows, não pelo WSL
npm run dev     # http://localhost:3000
```

## ✏️ Onde editar o conteúdo

Tudo vive em **`src/config/party.ts`**:

| O que | Onde |
| --- | --- |
| Nome, data, horário, endereço, WhatsApp, e-mail, prazo do RSVP | `party` |
| Momentos da noite (23h, 00h…) | `night` |

A contagem regressiva lê `party.startsAt` (ISO com fuso `-03:00`).

> Endereço ("Mansão Cavalcante, Rua dos Corvos, 1313"), WhatsApp e e-mail
> ainda são **exemplos** — troque antes de mandar o link.

## Seções

1. **Abertura** — três frases em tela preta, uma vez por sessão (clique pula).
2. **Topo** — neblina vermelha em tempo real, a lanterna revela uma figura que
   muda de lugar e mensagens escondidas; título com falha de sinal; contagem
   regressiva.
3. **As portas se fecham** — cena presa na tela: a porta iluminada, com
   alguém parado nela, fecha conforme o scroll até restar um fio de luz.
4. **I — A casa** — texto (`party.manifesto`) que acende palavra por palavra.
5. **II — A noite** — os quatro atos (`night`), acendendo um a um com o scroll.
6. **III — O endereço** — local (o nome acende como letreiro com defeito) + bloco de classificação (`rating`, `advisory`).
7. **IV — A lista** — RSVP.

Durante todo o scroll: relógio "REC" no canto que vai de 23:00 a 05:00
(começa a andar depois da cena da porta), linha de progresso vermelha na borda
direita, faixas "Não há saída" / "Até o amanhecer" que deslizam, e uma queda
de luz com um lampejo da figura quando o relógio passa da meia-noite (uma vez
por visita). A peça que mede o scroll é `src/components/fx/ScrollVar.tsx`: ela
grava `--p` (0..1) e o CSS anima com `calc(var(--p))`.
Outras camadas: cursor próprio (ponto + anel; botões com `data-magnetic` são
puxados pelo ponteiro), olhos no escuro que seguem o cursor
(`WatchingEyes`), rótulos de seção que se decodificam (`Scramble`), faixa de
interferência VHS a cada ~24 s, nome digitado no RSVP ecoando no fundo, bordas
pulsando como coração, botão vermelho que sangra no hover, neblina com a
figura no rodapé, título da aba que chama o visitante de volta e, após 40 s
parado, a pergunta "Ainda está aí?" (no máximo duas vezes).

O botão **Som** no topo liga um zumbido grave, vento e batimentos gerados no
navegador (sem arquivos de áudio). Com `prefers-reduced-motion`, as animações
param.

## Convidados de honra e jumpscares

- **`#convidados`** (`src/components/sections/Lineup.tsx`): corredor
  horizontal preso na tela com Michael Myers, Jason, Freddy Krueger, Chucky e
  Ghostface — fotos em `public/killers/` com tratamento de cinema no CSS. Cada um acende ao
  chegar no centro (a câmera se aproxima do rosto, com falhas de sinal); no fim, o Ghostface pula na tela.
- **Jumpscares** (`src/components/fx/JumpScare.tsx`, função `scare()`):
  lanterna encostando na figura do topo; Ghostface no fim do corredor; voltar
  a rolar para cima depois dos atos ("Eu disse para não olhar para trás.").
  Cada um acontece uma vez por sessão, nunca com `prefers-reduced-motion`, e
  toca um estouro sonoro se o botão Som estiver ligado.
- ⚠️ Os personagens são propriedade dos respectivos estúdios — para uso
  comercial, confirme os direitos antes de publicar.

### Créditos das fotos (Unsplash — licença gratuita, uso comercial permitido)

| Arquivo | Foto |
| --- | --- |
| `michael.jpg` | https://unsplash.com/photos/7shoEPaVhnI |
| `jason.jpg` | https://unsplash.com/photos/y6zBVmZowGs |
| `freddy.jpg` | https://unsplash.com/photos/q9SYCQ0gImY |
| `chucky.jpg` | https://unsplash.com/photos/gDfpwQKq4DQ |
| `ghostface.jpg` | https://unsplash.com/photos/S6ikL0QoeJw (Nik) |

A licença do Unsplash cobre a foto, não os personagens: máscaras e figurinos
continuam sendo marcas dos estúdios.

## Confirmações de presença

- O formulário envia para **`POST /api/rsvp`** e grava em **`data/rsvps.json`**.
- **`/convidados`** mostra quem confirmou e quantas pessoas são esperadas.
- Quem confirma duas vezes com o mesmo nome **substitui** a resposta anterior.

⚠️ Como os dados moram num arquivo, isso funciona localmente ou num servidor
com disco persistente. Em hospedagem serverless (Vercel) o arquivo é apagado a
cada deploy — nesse caso troque `src/lib/rsvp.ts` por um banco de verdade.

`prefers-reduced-motion` desliga todas as animações.
