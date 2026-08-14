# Sistema de ícones em traço — especificação visual

## Objetivo

Melhorar a leitura rápida do portfólio com ícones semânticos em traço, preservando a identidade terminal/cyber já estabelecida. Os ícones devem ajudar o visitante a reconhecer categorias e tipos de conteúdo; não devem funcionar como decoração genérica nem competir com títulos, badges ou textos.

## Direção aprovada

- Usar principalmente ícones em traço.
- Aplicar ícones apenas onde eles identificam conteúdo: categorias de skills, tipos de projeto, credenciais compactas e canais de contato.
- Manter sem ícones os títulos principais das seções, o hero, a experiência profissional e os chips individuais de tecnologias.
- Usar Lucide como fonte principal e Tabler Icons somente quando nenhum símbolo Lucide representar adequadamente o conceito.
- Incorporar os vetores localmente, sem chamadas de rede em tempo de execução.

## Fonte, licença e distribuição

### Biblioteca principal

Lucide será a fonte principal. Seus ícones são SVGs leves, personalizáveis e publicados sob licença ISC:

- Site oficial: <https://lucide.dev/>
- Licença: <https://lucide.dev/license>

Os símbolos usados serão armazenados em um sprite SVG no próprio `index.html`. A implementação incluirá `assets/icons/LICENSE-lucide.txt` com o aviso de licença e autoria exigido pela licença ISC.

### Fallback

Tabler Icons poderá fornecer no máximo um símbolo quando a busca em Lucide não produzir um conceito adequado:

- Catálogo oficial: <https://tabler.io/icons>
- Licença MIT: <https://tabler.io/license>

Caso seja usado, o vetor deverá ser normalizado para `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.75"`, `stroke-linecap="round"` e `stroke-linejoin="round"`. A implementação também adicionará o aviso de licença correspondente. Se todos os conceitos forem cobertos por Lucide, nenhum ativo Tabler será adicionado.

## Sistema visual

### Tokens

- Grid: `24 × 24`.
- Tamanho em títulos de categorias: `18px`.
- Tamanho em projetos: `20px`.
- Tamanho em credenciais e contato: `17–18px`.
- Espessura de traço: `1.75px`.
- Preenchimento: nenhum.
- Cor: `currentColor`, herdando a cor semântica do contexto.
- Alinhamento: centralizado opticamente com o texto, não apenas pela linha de base tipográfica.
- Área de clique: o ícone não cria um novo alvo; ele pertence ao card ou link existente.

### Movimento

- No hover de cards e links, o ícone poderá mover-se no máximo `-1px` no eixo vertical e receber um brilho sutil da cor atual.
- A transição terá entre `140ms` e `180ms`, usando a curva já adotada pelo site.
- Com `prefers-reduced-motion: reduce`, a transformação será desativada.

### Acessibilidade

- Ícones acompanhados por texto serão decorativos: `aria-hidden="true"` e `focusable="false"`.
- Nenhum texto, rótulo ou nome acessível será substituído por um ícone.
- Links de contato continuarão exibindo seus nomes por escrito.
- Contraste e foco visível permanecerão definidos pelo componente que contém o ícone.
- O site continuará utilizável se o CSS não carregar; o texto será suficiente para compreender cada item.

## Posicionamento e mapeamento semântico

### Categorias de skills

O ícone substituirá o caractere `$` antes de cada título. Os chips continuam exclusivamente textuais.

| Categoria | Ícone primário | Palavras-chave de busca | Cor existente |
|---|---|---|---|
| Segurança ofensiva | `crosshair` | `crosshair`, `scan`, `target`, `shield alert` | vermelho |
| Defesa & detecção | `shield-check` | `shield check`, `radar`, `eye`, `scan search` | verde |
| DevOps & cloud | `cloud-cog` | `cloud cog`, `server cog`, `workflow`, `container` | lilás |
| Desenvolvimento | `code-xml` | `code xml`, `braces`, `terminal`, `blocks` | amarelo |
| IA aplicada ao desenvolvimento | `brain-circuit` | `brain circuit`, `bot`, `network`, `workflow` | roxo claro |

### Projetos em destaque

Cada card terá um marcador de tipo no canto superior direito da linha de caminho `~/projects/...`. O marcador terá menor contraste em repouso e ganhará a cor do projeto no hover do card. Ele não substituirá nenhum link ou CTA.

| Projeto | Ícone primário | Palavras-chave de busca |
|---|---|---|
| TCC sobre phishing | `graduation-cap` | `graduation cap`, `book open`, `file search`, `microscope` |
| Nerdz | `smartphone` | `smartphone`, `users`, `book open`, `messages square` |
| Migração VoIP | `phone-call` | `phone call`, `refresh cw`, `workflow`, `network` |
| Portal UTFPR | `panels-top-left` | `panels top left`, `globe`, `landmark`, `layout dashboard` |
| VESPAS | `flag` | `flag`, `bug`, `shield alert`, `scan` |

### Credenciais verificáveis

- Os quatro cards Cisco manterão seus badges oficiais e não receberão um segundo ícone.
- Os cards compactos usarão um ícone ao lado do caminho `~/credentials/...`.

| Credencial | Ícone primário | Palavras-chave de busca |
|---|---|---|
| Ada Back-End | `code-xml` | `code`, `server`, `database` |
| Fundamentos em Cibersegurança | `shield-check` | `shield`, `lock keyhole`, `badge check` |
| Inteligência Emocional 2.0 | `brain` | `brain`, `heart handshake`, `sparkles` |
| Produtividade e Gestão do Tempo | `timer` | `timer`, `clock`, `list checks`, `target` |

### Contato

Os ícones aparecerão antes do texto nos quatro itens existentes, sem remover os nomes dos canais:

| Canal | Ícone primário | Palavras-chave de busca |
|---|---|---|
| E-mail | `mail` | `mail`, `send` |
| LinkedIn | `linkedin` | `linkedin`, `briefcase business` |
| GitHub | `github` | `github`, `git-branch` |
| Discord | `message-circle` | `message circle`, `messages square`, `headset` |

Se Lucide não disponibilizar um ícone de marca adequado para LinkedIn ou GitHub, serão usados os conceitos neutros indicados na segunda palavra-chave; não serão buscados logotipos em fontes aleatórias.

## Arquitetura de implementação

O site continuará estático e sem etapa de build.

1. Um sprite SVG oculto será incluído uma vez no `index.html`, contendo apenas os símbolos efetivamente usados.
2. Cada ocorrência reutilizará um símbolo com `<svg class="line-icon" ...><use href="#icon-nome"></use></svg>`.
3. Uma classe base definirá geometria, traço e comportamento; modificadores de contexto controlarão apenas tamanho e cor.
4. Nenhuma biblioteca JavaScript, webfont ou CDN de ícones será adicionada.
5. Os metadados `data-icon` e `data-icon-context` permitirão validar presença, mapeamento e quantidade no teste end-to-end.

## Responsividade

- Os ícones conservarão o mesmo tamanho no desktop e no mobile; não serão ampliados para preencher espaços vazios.
- Nos títulos de skills, o ícone e o texto permanecerão na mesma linha sempre que houver largura suficiente.
- Em telas estreitas, o marcador de projeto não poderá colidir com o caminho ou CTA.
- Em credenciais, títulos longos poderão quebrar linha sem deslocar o selo “verificável”.
- Nenhum ícone poderá causar overflow horizontal.

## Testes e validação

O teste `verify.mjs` será ampliado antes da implementação para verificar:

- cinco ícones de categorias de skills, substituindo os cinco caracteres `$` visuais;
- cinco marcadores de tipo nos projetos;
- quatro ícones nas credenciais compactas e nenhum ícone extra nos cards Cisco;
- quatro ícones nos canais de contato;
- `aria-hidden="true"` e `focusable="false"` em todos os ícones decorativos;
- uso exclusivo de referências locais do sprite, sem requisições externas de ícones;
- manutenção dos textos e nomes acessíveis dos links;
- ausência de overflow horizontal no viewport móvel;
- tradução PT/EN sem alteração dos símbolos ou perda de alinhamento.

A inspeção visual será feita nas capturas existentes de desktop e mobile, com recortes adicionais de Skills, Projetos, Credenciais e Contato. Também será verificado o estado de foco por teclado e o comportamento com movimento reduzido.

## Critérios de aceitação

1. O visitante reconhece visualmente cada categoria sem perder a leitura textual.
2. O conjunto parece parte da identidade terminal existente, não uma camada de ícones genéricos.
3. Há uma única linguagem de traço em toda a página.
4. Títulos principais, experiência, hero e chips permanecem sem ícones.
5. O carregamento do site não depende de um serviço externo de ícones.
6. Licenças dos vetores copiados ficam preservadas no repositório.
7. Desktop e mobile passam na verificação automatizada e na inspeção visual.

## Fora de escopo

- Ilustração grande no hero.
- Ícones em cada tecnologia ou habilidade.
- Animações contínuas ou decorativas.
- Redesenho de layout, tipografia ou paleta.
- Alteração do conteúdo profissional, currículos ou descrições dos projetos.
- Substituição dos badges oficiais da Cisco.
