Conceito do Jogo:
"Black or Black" é um jogo de plataforma side-scroller onde o jogador controla um personagem. É necessiário desviar de inimigos enquanto corre através de um cenário sombrio e desafiador. O objetivo principal é sobreviver o máximo de tempo possível e alcançar a maior pontuação, evitando os inimigos.

Como Jogar:

Teclado: Utiliza-se as teclas de seta (←↑→) para mover o personagem. A seta para cima (↑) faz o personagem saltar enquanto a tecla ← move o personagem para a esquerda e a tecla → irá mover o personagem para a direita.
Dispositivos Móveis: Um simples toque no ecrã fará o jogador saltar. Esta abordagem mais simplista advém do facto do jogo ter sido concebido primeiro para desktop, sendo que fica dificil manter o aspect ratio para outros dispositivos. Logo, a melhor abordagem já que os ecrãs são pequenos, foi apenas saltar para evitar inimigos.
Pontuação:
A pontuação é baseada na distância percorrida, a mesma só aumenta se existirem inimigos visiveis no ecrã.
A pontuação máxima é armazenada localmente e pode ser vista no menu de fim de jogo.

Funcionalidades Implementadas:

Personagem Principal:

Um personagem jogável com animações por sprites de corrida e salto.
Estado de invencibilidade temporária após sofrer dano, indicado por um efeito de transparência (opacidade).

Inimigos:

Inimigos Genéricos: Correm na direção do personagem e causam dano no contacto com o mesmo. (Worms)
Fantasma (Ghost): Movimenta-se de forma ondulada e torna-se invisivel gradualmente, após desaparecer completamente, o mesmo não tira dano.
Aranha (Spider): Desce do topo da tela em uma linha de teia e causa dano ao jogador.

Ambiente:

Cenário de Fundo: Uma imagem de fundo que se move na horizontal para criar a sensação de movimento contínuo.

Obstáculos: Inimigos que aparecem aleatoriamente no caminho do jogador.

Interface do Usuário:

Pontuação em Jogo: Mostra a pontuação atual durante o jogo, localizada no canto superior esquerdo.
Menu de Fim de Jogo: Exibe a pontuação atual e a pontuação máxima, com botões para recomeçar ou sair do jogo. (Aconselho a sair pelo menos uma vez :D)
Tutorial: Uma mensagem inicial que instrui o jogador sobre como jogar, a mesma varia de desktop para telémovel.

Sons:
BGM, Efeitos sonoros (sfx) para salto, dano, morte e navegação no menu.

Compatibilidade com Dispositivos:
O jogo detecta automaticamente se o jogador está a usar um dispositivo móvel ou um computador e ajusta os controles e a interface de acordo.
Em dispositivos móveis, são exibidas mensagens de orientação e ajustes para controles de toque.
