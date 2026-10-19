# Limpezimea

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · **Português** · [Deutsch](README.de.md) · [Magyar](README.hu.md)

**Versão:** 1.2.1 · **Última atualização:** 2026-10-19

Idiomas da interface: **Română, English, Français, Italiano, Español, Português (PT), Deutsch, Magyar**

Romance de ficção científica de Alexandru-Ionuț Chiuță, edição de leitura num único ficheiro HTML, em sete idiomas (RO · EN · FR · IT · ES · PT · DE).

**Aplicação online:** https://chiuta.github.io/Limpezimea/

![Captura de ecrã](screenshot.pt.png)

## O que é

*Limpezimea* é um romance de ficção científica (a descrição na página: um lago glaciar («tău») dos montes Retezat que devora o som, a ordem e a memória). O ficheiro `index.html` contém o texto completo em romeno e traduções para inglês, francês, italiano, espanhol, português e alemão, além de um aparato crítico (crónica, «Tăul Mut», estudo). Segundo a nota do cólofon, o aparato crítico foi escrito com a assistência de IA (Claude). A aplicação indica 43.359 palavras, aproximadamente 241 minutos de leitura.

## Funcionalidades

- Alternância entre os 8 idiomas (botões RO / EN / FR / IT / ES / PT / DE / HU; o romance está traduzido nos sete primeiros, em húngaro apenas a interface está traduzida e o texto é apresentado em inglês); opção para mostrar vários idiomas em paralelo (botão «Número de idiomas»).
- Índice por partes e capítulos, navegação com setas, paleta de comandos.
- Temas: escuro, claro, sépia, «lago»; tamanho do texto em 5 níveis (A− / A+).
- Pesquisa no texto (lista de resultados com contexto, salto para a ocorrência; se o termo não aparecer no idioma ativo, botões para mudar para os idiomas em que aparece), concordância, glossário de «intraduzíveis», minimapa, modo foco.
- Marcadores e notas pessoais (com exportação das glosas marginais).
- Citação recortável, textura de «grão» sobre o texto, paisagem sonora generativa (Web Audio), deslocamento automático, «Ouvir» (síntese de voz do navegador).
- Barreira antispoiler diante do aparato crítico («gate»), com desbloqueio memorizado.
- Suporte de acessibilidade: ligação «Saltar para o texto», região ARIA live, respeito pela preferência de movimento reduzido.

## Manual de utilização

1. Abra a página; escolha o idioma com os botões RO … HU (as teclas `1`–`8` escolhem o idioma; `Shift` ou `Ctrl`/`Cmd` + clique, ou um toque prolongado, alterna a apresentação em paralelo).
2. Abra «Índice» para saltar para um capítulo. `←` / `→` ou `k` / `j` passam ao capítulo anterior/seguinte; `Home`, `End`, `PageUp`, `PageDown` deslocam o texto.
3. `/` abre a pesquisa; `Ctrl+K` / `Cmd+K` abre a paleta de comandos; `Esc` fecha os painéis.
4. `B` adiciona/remove um marcador na posição atual; `N` adiciona uma nota; `F` ativa o modo foco; `P` altera o número de idiomas apresentados.
5. O botão de tema percorre os temas ciclicamente; A− / A+ alteram o tamanho do texto (um clique em «2/5» repõe-no).
6. Os botões da barra inferior: Comandos, Intraduzíveis (glossário), Concordância, Modo foco, Minimapa, Campo sonoro, Grão, Reprodução (deslocamento automático), Ouvir.
7. A posição de leitura, os marcadores e as notas são conservados automaticamente no navegador.

## Privacidade e rede

- A aplicação não faz chamadas de rede (sem `fetch`, CDN ou recursos externos); o cólofon afirma «sem rastreamento, sem contas».
- **Armazenamento local (`localStorage`, chaves com o prefixo `limp.`):** idioma, tema, tamanho do texto, posição de leitura, marcadores, notas, preferências (foco, minimapa, grão, volume do som, velocidade de deslocamento), estado de desbloqueio do aparato crítico.
- «Ouvir» usa a síntese de voz do navegador/do sistema; o comportamento depende destes.

## Execução local / offline

Descarregue `index.html` (cerca de 2,6 MB) e abra-o no navegador; não requer internet.

## Licença

MIT — ver o ficheiro LICENSE

## Auditoria

2026-10-10: verificado no navegador (0 erros de JS, 0 pedidos de rede; armazenamento apenas `limp.*` em localStorage). Corrigido o contraste das entradas bloqueadas do índice. O texto literário e as traduções (incluindo as assistidas por IA) não foram objeto de revisão editorial nesta auditoria. (A política CSP foi adicionada em 2026-10-11, ver Histórico.)

## Histórico / Changelog

- 1.1.0 — 2026-10-14: Cópia de segurança e etiquetagem de dados (fff-kit).

- 1.0.0 — 2026-10-12: a versão e a data da última atualização são apresentadas na aplicação (primeira versão numerada; no cólofon do rodapé, com etiqueta nos 7 idiomas).

Ronda 7:
- **Corrigido (reproduzido antes, verificado depois):** escolhia-se um idioma (p. ex. EN), premia-se o botão «Idiomas apresentados» para acrescentar um segundo idioma, e a interface (mensagens de estado como «Marcador adicionado», `lang` em `<html>`, pesquisa no idioma ativo) passava para romeno, porque o RO é sempre o primeiro na ordem das colunas. O idioma escolhido pelo leitor mantém-se agora como o principal também no modo comparativo (a ordem das colunas não mudou) e é conservado ao recarregar. Hashes CSP recalculados; axe-core = 0 violações a 1280 e 360 px.
- O texto literário e as traduções não foram modificados; o tamanho do ficheiro (~2,6 MB) deve-se ao texto em sete idiomas, não a recursos incorporados, pelo que não pode ser reduzido sem perder conteúdo.

Ronda 6:
- Pesquisa: lista de resultados com contexto (os primeiros 100, clique = salto para a ocorrência) e, com 0 resultados no idioma ativo, botões que mudam diretamente para o idioma em que o termo aparece; o deslocamento tem em conta a altura do painel. Hashes CSP recalculados.
- Pesquisa no texto: quando não há resultados no idioma ativo, a barra mostra agora em que outros idiomas o termo aparece (p. ex. «0 · RO: 70, DE: 30» para «tău» em francês), em vez de um simples «0».
- Acessibilidade: a capa, a barra de progresso e a barra de ferramentas estão agora em pontos de referência ARIA; axe-core = 0 violações (incluindo `region`) a 1280 e 360 px.
- Adicionada uma política CSP (`<meta>`: scripts apenas por hash, `connect-src 'none'`).
- O texto literário e as traduções não foram modificados.

## Autor

Alexio — Alexandru-Ionuț Chiuță. Contacto: alexio@trom.tf

## Resumo
Limpezimea («Limpidez») é um romance de ficção científica de Alexandru-Ionuț Chiuță, apresentado como edição de leitura offline num único ficheiro HTML, em sete idiomas (RO, EN, FR, IT, ES, PT, DE), com um aparato crítico escrito em parte com a assistência de IA (Claude). Funcionalidades: idiomas em paralelo, temas, pesquisa, marcadores e notas, paisagem sonora, modo foco. Sem pedidos de rede; preferências guardadas em localStorage (`limp.*`). Licença MIT.
