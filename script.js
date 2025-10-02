/* =============================================================================
   AGÊNCIA DE TURISMO — JAVASCRIPT SUPER DIDÁTICO
   -----------------------------------------------------------------------------
   OBJETIVO: Este arquivo ensina, passo a passo, como montar uma página que:
     1) Mostra PACOTES PRONTOS (para adicionar rapidamente ao carrinho).
     2) Permite MONTAR UM PACOTE (destino + noites + hotel + extras).
     3) Oferece VOO OPCIONAL.
     4) Exibe um CARRINHO com os itens escolhidos e o TOTAL.
   TUDO COM O MÍNIMO DE RECURSOS DE JS (bom para iniciantes).
=============================================================================*/

/* =============================================================================
   1) CATÁLOGO COMO VETORES DE OBJETOS
   -----------------------------------------------------------------------------
   - "vetorPacotesProntos": três pacotes básicos com nome e preço fixo.
   - "vetorDestinos": destinos possíveis, cada um com uma taxa base.
   - "vetorHoteis": opções de hotel com preço por NOITE.
   - "vetorExtras": extras opcionais (alguns por NOITE, outros por PACOTE).
   - "vetorVoos": voo opcional com preço por PESSOA (ou "Nenhum" por 0).
=============================================================================*/
var vetorPacotesProntos = [
  { id: 'rio',  nome: 'Rio 3 noites (hotel 3★, café)',          preco: 1200 },
  { id: 'foz',  nome: 'Foz 4 noites (hotel 4★, tour cataratas)', preco: 1950 },
  { id: 'gram', nome: 'Gramado 2 noites (pousada 3★)',           preco: 980  }
];

var vetorDestinos = [
  { id: 'd_rio',  nome: 'Rio de Janeiro', taxa: 300 },
  { id: 'd_foz',  nome: 'Foz do Iguaçu',  taxa: 350 },
  { id: 'd_gram', nome: 'Gramado',        taxa: 250 }
];

var vetorHoteis = [
  { id: 'h3',   nome: '3★',      precoNoite: 200 },
  { id: 'h4',   nome: '4★',      precoNoite: 320 },
  { id: 'pous', nome: 'Pousada', precoNoite: 150 }
];

var vetorExtras = [
  { id: 'cafe',     nome: 'Café da manhã',      preco: 30,  porNoite: true  },
  { id: 'citytour', nome: 'City tour',          preco: 120, porNoite: false },
  { id: 'traslado', nome: 'Traslado aeroporto', preco: 80,  porNoite: false }
];

var vetorVoos = [
  { id: 'n',   nome: 'Nenhum',        precoPessoa: 0   },
  { id: 'eco', nome: 'Voo econômico', precoPessoa: 650 },
  { id: 'fx',  nome: 'Voo flexível',  precoPessoa: 900 }
];

/* =============================================================================
   2) ESTADO DO CARRINHO
   -----------------------------------------------------------------------------
   - Guardamos os itens que o usuário adiciona numa lista "itensCarrinho".
   - Cada item tem: { nome, detalhes, valorUnitario, quantidade }.
=============================================================================*/
var itensCarrinho = [];

/* =============================================================================
   3) FUNÇÕES DE APOIO (UTILITÁRIAS)
   -----------------------------------------------------------------------------
   São pequenas funções que ajudam em tarefas repetitivas:
   - formatarReais: transforma número "123.45" em "R$ 123,45".
   - procurarPorId: localizar um objeto dentro de um vetor pelo seu "id".
=============================================================================*/

/* Transforma um número em dinheiro no formato do Brasil (ex.: R$ 1.234,56) */
function formatarReais(valor){
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* Percorre um vetor e devolve o objeto cujo "id" é igual ao "idProcurado".
   Se não encontrar, devolve "null". */
function procurarPorId(vetor, idProcurado){
  var i;
  for(i = 0; i < vetor.length; i++){
    if(vetor[i].id === idProcurado){
      return vetor[i];
    }
  }
  return null;
}

/* =============================================================================
   4) CRIAR A TELA A PARTIR DOS VETORES (FUNÇÕES ESPECIALIZADAS)
   -----------------------------------------------------------------------------
   Estas funções "pintam" a interface:
   - preencherPacotesProntos   → cria linhas com botões (adicionar/remover).
   - preencherDestinos         → cria rádios (um por destino).
   - preencherListaHoteis      → cria <option> do select de hotéis.
   - preencherListaExtras      → cria checkboxes de extras.
   - preencherListaVoos        → cria <option> do select de voos.
=============================================================================*/

/* Cria a lista de pacotes prontos dentro da DIV "area_pacotes_prontos" */
function preencherPacotesProntos(){
  // 1) Pegamos a div onde iremos colocar os pacotes
  var area = document.getElementById('area_pacotes_prontos');

  // 2) Limpamos a área (caso esta função seja chamada novamente)
  area.innerHTML = '';

  // 3) Para cada pacote do vetor, criamos uma linha com:
  //    nome + preço + input de quantidade + botões
  var i, pacote, linha;
  for(i = 0; i < vetorPacotesProntos.length; i++){
    pacote = vetorPacotesProntos[i];

    linha  = '<label>';
    linha += pacote.nome + ' — <strong>' + formatarReais(pacote.preco) + '</strong> ';
    linha += '<input id="q_' + pacote.id + '" type="number" min="1" value="1" style="width:80px"> ';
    linha += '<button class="no-print" onclick="adicionarPacoteProntoPorId(\'' + pacote.id + '\')">Adicionar</button> ';
    linha += '<button class="no-print" onclick="removerPacoteProntoPorId(\'' + pacote.id + '\')">Remover 1</button>';
    linha += '</label>';

    // 4) Acrescentamos a linha criada ao conteúdo da div
    area.innerHTML += linha;
  }
}

/* Cria os rádios de destinos dentro da DIV "area_destinos" */
function preencherDestinos(){
  var area = document.getElementById('area_destinos');
  area.innerHTML = '';

  var i, destino, linha;
  for(i = 0; i < vetorDestinos.length; i++){
    destino = vetorDestinos[i];

    // O primeiro destino vem marcado com "checked" para facilitar
    linha  = '<label>';
    linha += '<input type="radio" name="destino" value="' + destino.nome + '|' + destino.taxa + '" ' + (i === 0 ? 'checked' : '') + '>';
    linha += ' ' + destino.nome + ' (taxa base ' + formatarReais(destino.taxa) + ')';
    linha += '</label>';

    area.innerHTML += linha;
  }
}

/* Preenche o SELECT de hotéis com as opções do vetor "vetorHoteis" */
function preencherListaHoteis(){
  var selecaoHoteis = document.getElementById('lista_hoteis');
  selecaoHoteis.innerHTML = '';

  var i, hotel, opcao;
  for(i = 0; i < vetorHoteis.length; i++){
    hotel = vetorHoteis[i];

    // Criamos uma <option>
    opcao = document.createElement('option');

    // No "value" guardamos "NOME|PREÇO", pois fica fácil de ler depois
    opcao.value = hotel.nome + '|' + hotel.precoNoite;

    // No "text" guardamos apenas o que é mostrado para o usuário
    opcao.text  = hotel.nome + ' (' + formatarReais(hotel.precoNoite) + '/noite)';

    // Colocamos a opção dentro do select
    selecaoHoteis.appendChild(opcao);
  }
}

/* Cria as caixas de seleção de EXTRAS dentro da DIV "area_extras" */
function preencherListaExtras(){
  var area = document.getElementById('area_extras');
  area.innerHTML = '';

  var i, extra, linha;
  for(i = 0; i < vetorExtras.length; i++){
    extra = vetorExtras[i];

    // Cada extra vira um checkbox com seu nome e preço
    linha  = '<label>';
    linha += '<input type="checkbox" class="extra" value="' + extra.nome + '|' + extra.preco + '"> ';
    linha += extra.nome + ' ' + formatarReais(extra.preco) + (extra.porNoite ? '/noite' : '');
    linha += '</label>';

    area.innerHTML += linha;
  }
}

/* Preenche o SELECT de voos com o vetor "vetorVoos" */
function preencherListaVoos(){
  var selecaoVoos = document.getElementById('lista_voos');
  selecaoVoos.innerHTML = '';

  var i, voo, opcao;
  for(i = 0; i < vetorVoos.length; i++){
    voo = vetorVoos[i];

    opcao = document.createElement('option');
    opcao.value = voo.nome + '|' + voo.precoPessoa; // Ex.: "Voo econômico|650"
    // Mostramos “(R$ X / pessoa)” apenas quando o preço é maior que 0 (não é “Nenhum”)
    opcao.text  = voo.nome + (voo.precoPessoa > 0 ? ' (' + formatarReais(voo.precoPessoa) + '/pessoa)' : '');

    selecaoVoos.appendChild(opcao);
  }
}

/* =============================================================================
   5) CARRINHO — MOSTRAR TABELA, ALTERAR QUANTIDADE, REMOVER, LIMPAR
   -----------------------------------------------------------------------------
   - atualizarTabelaCarrinho: redesenha a tabela toda vez que algo muda.
   - alterarQuantidadeItem: aumenta/diminui a quantidade de 1 item específico.
   - removerItemDoCarrinho: remove um item de vez (independente da quantidade).
   - limparCarrinho: esvazia tudo.
=============================================================================*/

/* Desenha a tabela do carrinho e recalcula o total geral */
function atualizarTabelaCarrinho(){
  // 1) Pegamos o TBODY da tabela (onde ficam as linhas dos itens)
  var tabela = document.getElementById('tabela_carrinho');
  var corpo  = tabela.getElementsByTagName('tbody')[0];

  // 2) Limpamos o conteúdo anterior
  corpo.innerHTML = '';

  // 3) Criamos uma linha da tabela para cada item do carrinho
  var i, item, subtotal, linha, total;
  total = 0;

  for(i = 0; i < itensCarrinho.length; i++){
    item     = itensCarrinho[i];
    subtotal = item.valorUnitario * item.quantidade;
    total    = total + subtotal;

    // Criamos um <tr> com as células
    linha  = document.createElement('tr');
    linha.innerHTML =
      '<td>' + item.nome + '</td>' +
      '<td>' + (item.detalhes || '-') + '</td>' +
      '<td>' + formatarReais(item.valorUnitario) + '</td>' +
      '<td>' + item.quantidade + '</td>' +
      '<td>' + formatarReais(subtotal) + '</td>' +
      '<td class="no-print">' +
        // Botões que chamam funções para alterar/remover este item
        '<button onclick="alterarQuantidadeItem(' + i + ', -1)">-1</button> ' +
        '<button onclick="alterarQuantidadeItem(' + i + ',  1)">+1</button> ' +
        '<button onclick="removerItemDoCarrinho(' + i + ')">Remover</button>' +
      '</td>';

    // Inserimos a linha na tabela
    corpo.appendChild(linha);
  }

  // 4) Atualizamos o valor total mostrado no rodapé do carrinho
  document.getElementById('valor_total').textContent = formatarReais(total);

  // 5) Mantemos o preço do pacote personalizado atualizado (caso esteja montando)
  calcularPrecoDoPacotePersonalizado();
}

/* Aumenta ou diminui a quantidade de um item do carrinho
   - "indice" diz qual item alterar
   - "diferenca" é +1 (para somar) ou -1 (para subtrair) */
function alterarQuantidadeItem(indice, diferenca){
  // 1) Mudamos a quantidade do item selecionado
  itensCarrinho[indice].quantidade = itensCarrinho[indice].quantidade + diferenca;

  // 2) Se a quantidade zerar ou ficar negativa, removemos o item
  if(itensCarrinho[indice].quantidade <= 0){
    itensCarrinho.splice(indice, 1);
  }

  // 3) Redesenhamos a tabela para o usuário ver a mudança
  atualizarTabelaCarrinho();
}

/* Remove completamente um item do carrinho (não importa a quantidade) */
function removerItemDoCarrinho(indice){
  itensCarrinho.splice(indice, 1);
  atualizarTabelaCarrinho();
}

/* Limpa o carrinho inteiro (fica vazio) */
function limparCarrinho(){
  itensCarrinho = [];
  atualizarTabelaCarrinho();
}

/* =============================================================================
   6) PACOTES PRONTOS — ADICIONAR / REMOVER 1
   -----------------------------------------------------------------------------
   - adicionarPacoteProntoPorId: lê a quantidade do input daquele pacote
     e coloca no carrinho.
   - removerPacoteProntoPorId: procura o item pelo nome e subtrai 1.
=============================================================================*/

/* Adiciona um pacote pronto (a partir do seu "id") */
function adicionarPacoteProntoPorId(idPacote){
  // 1) Localizamos os dados do pacote pelo ID no vetor
  var pacote = procurarPorId(vetorPacotesProntos, idPacote);
  if(!pacote){ return; }

  // 2) Lemos a QUANTIDADE do campo numérico que tem id "q_<idPacote>"
  var campoQuantidade = document.getElementById('q_' + idPacote);
  var quantidade = parseInt(campoQuantidade.value) || 1;

  // 3) Montamos o item do carrinho com nome, preço e quantidade
  itensCarrinho.push({
    nome: pacote.nome,
    detalhes: '',
    valorUnitario: pacote.preco,
    quantidade: quantidade
  });

  // 4) Atualizamos a tabela para aparecer na tela
  atualizarTabelaCarrinho();
}

/* Remove 1 unidade do pacote informado (se ele existir dentro do carrinho) */
function removerPacoteProntoPorId(idPacote){
  // 1) Pegamos o pacote (apenas para descobrir seu nome)
  var pacote = procurarPorId(vetorPacotesProntos, idPacote);
  if(!pacote){ return; }

  // 2) Procuramos no carrinho UM item com esse nome
  var i;
  for(i = 0; i < itensCarrinho.length; i++){
    if(itensCarrinho[i].nome === pacote.nome){
      // Achou? então subtrai 1 da quantidade
      alterarQuantidadeItem(i, -1);
      return; // saímos da função
    }
  }
  // Se não encontrou, não fazemos nada
}

/* =============================================================================
   7) PACOTE PERSONALIZADO — CALCULAR E ADICIONAR AO CARRINHO
   -----------------------------------------------------------------------------
   - obterDestinoMarcado: lê qual "rádio" de destino está marcado.
   - obterExtrasSelecionados: devolve uma lista com os extras marcados.
   - calcularPrecoDoPacotePersonalizado: aplica a regra de preço e mostra o total.
   - adicionarPacotePersonalizado: coloca esse pacote no carrinho.
=============================================================================*/

/* Lê qual DESTINO está selecionado (rádio) e devolve { nome, taxa } */
function obterDestinoMarcado(){
  var radios = document.getElementsByName('destino');
  var i, partes;

  for(i = 0; i < radios.length; i++){
    if(radios[i].checked){
      partes = radios[i].value.split('|'); // formato "Nome|taxa"
      return { nome: partes[0], taxa: Number(partes[1]) };
    }
  }
  return { nome: '', taxa: 0 };
}

/* Lê os EXTRAS marcados (checkboxes) e devolve uma lista de { nome, preco } */
function obterExtrasSelecionados(){
  var caixas = document.getElementsByClassName('extra');
  var lista = [];
  var i, partes;

  for(i = 0; i < caixas.length; i++){
    if(caixas[i].checked){
      partes = caixas[i].value.split('|'); // formato "Nome|preco"
      lista.push({ nome: partes[0], preco: Number(partes[1]) });
    }
  }
  return lista;
}

/* Calcula o PREÇO ESTIMADO do pacote personalizado e mostra na tela.
   Também devolve um objeto com todos os dados para facilitar na hora de adicionar. */
function calcularPrecoDoPacotePersonalizado(){
  // 1) Ler todas as escolhas atuais do usuário
  var destinoEscolhido = obterDestinoMarcado(); // ex.: { nome: "Rio de Janeiro", taxa: 300 }
  var numeroDeNoites  = parseInt(document.getElementById('campo_noites').value) || 1;

  // O select de hotel guarda no "value" algo como "4★|320"
  var dadosHotel = document.getElementById('lista_hoteis').value.split('|');
  var nomeHotel  = dadosHotel[0];          // "4★"
  var precoHotel = Number(dadosHotel[1]);  // 320 (por noite)

  var extrasEscolhidos = obterExtrasSelecionados();

  // 2) REGRA DE CÁLCULO:
  //    preço = taxaDestino + (noites * preçoHotel) + SOMA(dos extras)
  var soma = destinoEscolhido.taxa + (numeroDeNoites * precoHotel);

  // Vamos percorrer os extras e somar.
  // OBS: "Café da manhã" é cobrado por noite. Os demais são por pacote.
  var i;
  for(i = 0; i < extrasEscolhidos.length; i++){
    if(extrasEscolhidos[i].nome === 'Café da manhã'){
      soma = soma + (numeroDeNoites * extrasEscolhidos[i].preco);
    } else {
      soma = soma + extrasEscolhidos[i].preco;
    }
  }

  // 3) Mostramos o valor na tela para o usuário visualizar
  document.getElementById('preco_estimado').innerHTML =
    '<em>Preço estimado: ' + formatarReais(soma) + '</em>';

  // 4) Devolvemos os dados para a próxima função poder usar
  return {
    precoTotal: soma,
    destino: destinoEscolhido,
    noites: numeroDeNoites,
    nomeHotel: nomeHotel,
    extras: extrasEscolhidos
  };
}

/* Quando o usuário clica em "Adicionar pacote personalizado" */
function adicionarPacotePersonalizado(){
  // 1) Garante que o preço está atualizado e pega todos os dados atuais
  var calculo = calcularPrecoDoPacotePersonalizado();

  // 2) Lê observações e quantidade digitadas pelo usuário
  var observacoes = document.getElementById('campo_observacoes').value || '';
  var quantidade  = parseInt(document.getElementById('campo_qtd_personalizado').value) || 1;

  // 3) Monta um texto simples com as informações escolhidas
  var detalhes = calculo.destino.nome + ' | ' + calculo.noites + ' noites | Hotel: ' + calculo.nomeHotel;

  // 4) Acrescenta a lista de extras (se houver)
  var i;
  for(i = 0; i < calculo.extras.length; i++){
    detalhes = detalhes + ' | ' + calculo.extras[i].nome;
  }

  // 5) Se existir algum comentário, adiciona também
  if(observacoes.trim() !== ''){
    detalhes = detalhes + ' | Obs.: ' + observacoes.trim();
  }

  // 6) Finalmente, colocamos o item no carrinho
  itensCarrinho.push({
    nome: 'Pacote personalizado',
    detalhes: detalhes,
    valorUnitario: calculo.precoTotal,
    quantidade: quantidade
  });

  // 7) E redesenhamos a tabela para o usuário ver o item novo
  atualizarTabelaCarrinho();
}

/* =============================================================================
   8) VOO OPCIONAL — ADICIONAR AO CARRINHO
   -----------------------------------------------------------------------------
   Lê o voo escolhido no select, pega a quantidade e adiciona.
   Caso o usuário tenha deixado "Nenhum", não faz nada.
=============================================================================*/
function adicionarVoo(){
  // 1) O "value" do select é algo como "Voo econômico|650"
  var partesVoo = document.getElementById('lista_voos').value.split('|');
  var nomeVoo   = partesVoo[0];
  var precoVoo  = Number(partesVoo[1]);

  // 2) Quantas passagens serão adicionadas
  var quantidadeVoo = parseInt(document.getElementById('campo_qtd_voo').value) || 1;

  // 3) Se for "Nenhum" (preço 0), não adicionamos
  if(precoVoo === 0){
    return;
  }

  // 4) Adicionamos o voo ao carrinho
  itensCarrinho.push({
    nome: nomeVoo,
    detalhes: '',
    valorUnitario: precoVoo,
    quantidade: quantidadeVoo
  });

  // 5) Atualizamos a tabela
  atualizarTabelaCarrinho();
}

/* =============================================================================
   9) ATUALIZAÇÃO AUTOMÁTICA DO PREÇO ESTIMADO
   -----------------------------------------------------------------------------
   Quando o usuário muda qualquer coisa que influencia o preço do pacote
   personalizado (destino, noites, hotel, extras), recalculamos o valor
   e mostramos de novo.
=============================================================================*/
function ligarEventosDePreco(){
  // 1) Quando a quantidade de noites muda → recalcular
  document.getElementById('campo_noites').onchange = calcularPrecoDoPacotePersonalizado;

  // 2) Quando o hotel muda → recalcular
  document.getElementById('lista_hoteis').onchange = calcularPrecoDoPacotePersonalizado;

  // 3) Quando o destino muda (rádios) → recalcular
  var radiosDestino = document.getElementsByName('destino');
  var i;
  for(i = 0; i < radiosDestino.length; i++){
    radiosDestino[i].onchange = calcularPrecoDoPacotePersonalizado;
  }

  // 4) Quando marca/desmarca um extra → recalcular
  var caixasExtras = document.getElementsByClassName('extra');
  var j;
  for(j = 0; j < caixasExtras.length; j++){
    caixasExtras[j].onchange = calcularPrecoDoPacotePersonalizado;
  }
}

/* =============================================================================
   10) INICIALIZAÇÃO DA PÁGINA (executa quando a página carrega)
   -----------------------------------------------------------------------------
   Esta função monta toda a tela a partir dos vetores e liga os eventos.
=============================================================================*/
function iniciarAplicacao(){
  // 1) Criamos a interface lendo os vetores
  preencherPacotesProntos();
  preencherDestinos();
  preencherListaHoteis();
  preencherListaExtras();
  preencherListaVoos();

  // 2) Ligamos os eventos que recalculam o preço do pacote personalizado
  ligarEventosDePreco();

  // 3) Mostramos valores iniciais (preço do pacote + carrinho vazio)
  calcularPrecoDoPacotePersonalizado();
  atualizarTabelaCarrinho();
}

/* Chamamos a inicialização logo que o script é carregado */
iniciarAplicacao();

