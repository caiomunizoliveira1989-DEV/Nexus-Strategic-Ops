/* Explicação curta do problema, por alerta.
   Separado do dataset para não inflar o arquivo de dados
   e permitir editar o texto sem tocar nas coordenadas. */

export const PROBLEMA_POR_ALERTA: Record<string, string> = {
  hormuz:
    'Bloqueio naval dos EUA e ataques a petroleiros tiram o estreito da rota normal. Navios passam sem sinal AIS, o que encarece o seguro e trava a carga.',
  mandeb:
    'Ataques houthis tornam a travessia insegura. Armadores desviam pelo Cabo da Boa Esperança, somando até 14 dias ao trajeto Ásia-Europa.',
  suez:
    'O canal voltou a receber navios. O risco agora é a chegada simultânea das frotas que estavam no Cabo, concentrando escalas e congestionando os portos.',
  panama:
    'A seca reduz a água das eclusas. A autoridade limita vagas e calado, o que corta a carga por navio e alonga a fila de espera.',
  'congestao-global':
    'Frotas inteiras presas em filas de atracação. Navio parado é capacidade perdida: a carga atrasa e o frete sobe por falta de equipamento.',
  conacri:
    'Congestão severa, com atracação por ordem de chegada e um navio por armador. A carga espera em média dez dias antes de ser movimentada.',
  ningbo:
    'Acúmulo de navios na aproximação, agravado pela dragagem suspensa do terminal. Cada escala atrasa e a fila se propaga para os serviços seguintes.',
  tema:
    'Volume alto e pátio acima do normal travam a saída de carga. Falta caminhão e reefer, então o contêiner chega mas não sai do terminal.',
  abidjan:
    'Pátio denso, berço atrasado e pouca capacidade de caminhão. A carga entra devagar e demora a sair, reduzindo a produtividade do terminal.',
  'pacifico-tufoes':
    'Tufões consecutivos desorganizaram as escalas no Pacífico Ocidental. As frotas se reagrupam com atraso e o backlog nos portos ainda não foi absorvido.',
  'boa-esperanca':
    'Ainda há navios contornando a África por causa do desvio do Mar Vermelho. O trajeto mais longo consome capacidade e encarece a rota.',
  'norte-europa':
    'Navios que voltam ao Suez chegam junto com os que completam a rota do Cabo. As escalas se concentram e o tempo de espera em berço aumenta.',
}
