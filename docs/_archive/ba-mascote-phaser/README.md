# BA Mascote (Phaser + TypeScript) - Fase 1 Hibrida

Base nova para migracao do jogo com foco em **Personalizacao + Loja**, mantendo save local e compatibilidade com o estado antigo.

## Stack
- Phaser 3
- TypeScript
- Vite

## Arquitetura
- `src/core`: tipos, estado, catalogo, validacao e migracao de save
- `src/systems`: economia, inventario e progressao
- `src/features/main`: cena principal com closet/loja e preview ao vivo
- `src/ui`: tema base de interface

## O que esta implementado
1. Estrutura de engine para web/mobile.
2. `GameState` tipado com `version = 2`.
3. Migracao automatica de `ba_mascote_state` (legado) para `ba_mascote_state_v2`.
4. Catalogo unificado com schema `ItemDefinition`.
5. Validacao de catalogo (slot, id, preview, unlockRule, preco e metadados visuais).
6. Contratos visuais e de UX:
   - `VisualTheme`
   - `ItemVisualMeta`
   - `UIState`
   - `AudioBusConfig`
   - `AssetRegistry`
7. Loja com status:
   - compravel
   - bloqueado por nivel
   - ja possuido
   - consumivel com estoque
8. Closet com:
   - categorias
   - preview ao vivo no hover/toque
   - comparacao antes/depois
   - equipar/desequipar por camada
   - aviso amigavel para conflito de camada
9. HUD mobile-first com blocos maiores e leitura rapida.
10. Audio discreto por canal (UI/acao/ambiente) com variacao de pitch.
11. Pos-compra de item equipavel com aplicacao imediata.

## Packs de referencia (CC0/Open Source)
- Kenney UI Pack (CC0): https://kenney.nl/assets/ui-pack
- Phaser repository (open-source): https://github.com/phaserjs/phaser

Os registros ficam em `src/core/assets.ts` para facilitar pipeline de assets.

## Rodar local
```bash
npm install
npm run dev
```

## Criterios de aceite cobertos
- Save/load do estado moderno.
- Migracao de save legado sem perda de moedas, nivel, inventario e equipados.
- Compra reduz moedas e respeita bloqueio por nivel.
- Consumivel aumenta estoque.
- Equipar atualiza personagem imediatamente.
- Preview ao vivo para itens de personalizacao.
