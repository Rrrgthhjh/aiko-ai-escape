# Botão de créditos: status real da IA

## O que foi verificado

- A cota que o chat da Aiko consome é a do gateway de IA: 4 créditos concedidos no ciclo atual (1 ago - 1 set) e 0 restantes. Ela é **mensal**, não diária.
- Os 5 créditos diários da workspace não são gastáveis pelo gateway de IA no plano atual.
- O gateway de IA **não expõe** nenhum endpoint de saldo (`/v1/credits`, `/v1/balance`, `/v1/usage`, `/v1/account`, `/v1/me` retornam 404).

Consequência: não existe forma de o jogo mostrar o número exato de créditos restantes da workspace. O que dá para mostrar de forma confiável é o **status real** (a IA está respondendo ou está sem créditos) e a **data real de renovação mensal**, em vez do cronômetro diário incorreto que está lá hoje.

## O que será construído

Um botão de status da IA no HUD, que mostra:

1. **Status ao vivo**: "IA disponível", "Sem créditos" ou "Limite de velocidade", verificado no backend sem gerar resposta paga.
2. **Renovação**: data e contagem regressiva até o dia 1 do próximo mês (fim do ciclo de cobrança), no lugar do "próxima recarga" diário.
3. **Uso local**: quantas respostas foram geradas e quantas vieram do cache (já existe hoje).
4. **Aviso claro** quando sem créditos, explicando que voltam na renovação mensal ou ao adicionar créditos na workspace.

## Detalhes técnicos

- Nova edge function `ai-status`: faz uma chamada mínima ao gateway (`max_tokens: 1`, prompt de um caractere) e devolve apenas `{ status: "ok" | "no_credits" | "rate_limited" | "error" }` a partir do código HTTP. O resultado é guardado em cache na memória da função por 5 minutos, para que a sondagem custe praticamente nada e não seja repetida a cada abertura do painel.
- `src/game/credits.ts`: trocar `nextRefillAt` (00:00 UTC diário) por `nextCycleResetAt` (dia 1 do próximo mês, UTC) e ajustar o reset do contador local para ser mensal em vez de diário.
- `src/game/components/CreditIndicator.tsx`: consultar `ai-status` ao montar e ao abrir o painel, exibir o selo de status (verde/âmbar/vermelho), a contagem regressiva mensal e corrigir os textos.
- `src/game/components/ChatPanel.tsx`: ao receber 402, marcar o status como "sem créditos" imediatamente para o botão refletir sem esperar a próxima sondagem.

## Limitação honesta

O número exato de créditos restantes continuará indisponível dentro do jogo — nenhuma API acessível pelo app entrega esse valor. O painel indicará que o saldo detalhado fica em Settings -> Plans & credits.
