// From http://mkweb.bcgsc.ca/circos/guide/tables/

//*/
// Returns an array of tick angles and labels, given a group.
function groupTicks(d) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, 50).map(function(v, i) {
    return {
      angle: v * k + d.startAngle,
      label: i % 5 ? null : v / 1
    }
  })
}
//*/

//*/
//Returns an event handler for fading a given chord group.
function fade(opacity,numPartidos) {
  return function(g, i) {
	  for (ano in dados){
    	  graficos[ano][numPartidos].selectAll("g.chord_caminho")
        	.filter(function(d) {
          return d.source.index == i || d.target.index == i;
        })
      .transition()
        .style("opacity", opacity)
  }}
}
//*/

function mouseSobre(ano, indice_partido, opacidade, numPartidos){
  	graficos[ano][numPartidos].selectAll("g.chord_caminho")
  		.filter(function(d) {
    		return d.source.index == indice_partido || d.target.index == indice_partido;
  	  	})
		.transition()
  	  	.style("opacity", opacidade)
	
		$("#cabeca_de_chapa").text(partidos[ano][indice_partido])
		$("#cabeca_de_chapa").removeClass()
		$("#cabeca_de_chapa").addClass(partidos[ano][indice_partido])
		for ( i=0 ; i<numPartidos ; i++ ){
			$("#apoios_partido" + i).text(dados[ano][numPartidos][indice_partido][i])
			$("#partido" + i).text(partidos[ano][i])
		}
}


//Calcula o total de coligações que o partido encabeça (soma da linha da matriz)
function cabeca_total(ano, indice_partido, numPartidos) {
	var retorno = 0
	for ( i=0 ; i<numPartidos ; i++ )
		retorno+=dados[ano][numPartidos][indice_partido][i]
	return retorno
}

function gera_legenda(numPartidos) {
	$("#legenda").append("<span id='cabeca_de_chapa' style=''>Partido</span><br/><br/>")
	$("#legenda").append("Apoios recebidos:<br/><br/>")
	for ( i=0 ; i<numPartidos ; i++) {
		$("#legenda").append("<span id='apoios_partido" + i + "'></span> do <span id='partido" + i + "' class='legenda_nome_partidos'></span><br/>")
	}
}

var numero_de_partidos = 10

/*************************************************************************************************************/

function gera_grafico(ano, numPartidos, div) {

	gera_legenda(numPartidos)
	
	var chord_partidos = d3.layout.chord()
		.padding(.05)
		.matrix(dados[ano][numPartidos])

	var svg = d3.select("#" + div)
		  .append("svg")
			.attr("id", ano + "_" + numPartidos)
		    .attr("width", width)
		    .attr("height", height)
		  .append("g")
		    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

	// BORDA LATERAL
	// Adiciona apenas um grupo (g) para cada borda que será desenhada mais abaixo
	svg.append("g")
		.attr("class","chord_bases")
	  .selectAll("path.chord")
	    .data(chord_partidos.groups)
	  .enter().append("g")
		.attr("class", "chord_base")

	// Seleciona cada uma dos grupos (g) de bordas criados acima
	var bordas = svg.selectAll("g.chord_base")
		    .on("mouseover", function(d) { return mouseSobre(ano, d.index , 1, numPartidos); })
		    .on("mouseout", fade(.05,numPartidos))

		// Adiciona a borda em si a cada um dos grupos
		bordas.append("path")
		    .style("fill", function(d) { return cor_partido[partidos[ano][d.index]]; })
			.attr("id", function(d) { return "borda-" + partidos[ano][d.index]; })
		    .style("stroke", function(d) { return cor_partido[partidos[ano][d.index]]; })
		    .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))

		// Adiciona o nome do respectivo partido a cada uma dos grupos
		bordas.append("svg:text")
			.attr("class", "nome_partido_borda")
			.attr("dx", 0)  // Deslocamento que o nome do partido fica da partir da borda esquerda da faixa externa
								// Deixar como zero, isso está definido automaticamente pelo rotate abaixo
			.attr("dy", 30) //Define a distância que o nome do partido fica da borda externa
				//O transform abaixo faz com que o nome do partido fique no centro da casca, no sentido "x".
			.attr("transform",function(d) { return "rotate(" + ((d.endAngle-d.startAngle) * 90 / Math.PI - 3) + ")" })

		  .append("svg:textPath")
		  	.attr("xlink:href", function(d){ return "#borda-" + partidos[ano][d.index]; })
			.text(function(d) { return partidos[ano][d.index]; })
			.style("letter-spacing",1)
			
		// Adiciona a quantidade de candidados do partido
		bordas.append("svg:text")
			.attr("class", "candidatos_partido_borda")
			.attr("dx", 0)  // Deslocamento que o nome do partido fica da partir da borda esquerda da faixa externa
								// Deixar como zero, isso está definido automaticamente pelo rotate abaixo
			.attr("dy", 43) //Define a distância que o nome do partido fica da borda externa
				//O transform abaixo faz com que o nome do partido fique no centro da casca, no sentido "x".
			.attr("transform",function(d) { return "rotate(" + ((d.endAngle-d.startAngle) * 90 / Math.PI - 3) + ")" })

		  .append("svg:textPath")
		  	.attr("xlink:href", function(d){ return "#borda-" + partidos[ano][d.index]; })
			.text(function(d) { 
				if (d.index)
					return "(" + total_candidatos[ano][d.index] + ")"
				return "(" + total_candidatos[ano][d.index] + " candidatos)"
				})
			.style("letter-spacing",1)
			.style("font-size",12)
			.style("fill","#000")
			.style("opacity",1)
	
	// CURVAS (PATHS) ENTRE OS partidos_2012

	// Cria as curvas (paths) entre os partidos_2012
	svg.append("g")
	    .attr("class", "chord")
	  .selectAll("path")
	    .data(chord_partidos.chords)
	  .enter().append("g")
		.attr("class", "chord_caminho")
	
	var caminho = svg.selectAll("g.chord_caminho")
			.style("opacity", .05)
		// Adicionaod Path entre dois partidos
		caminho.append("path")
	    	.style("fill", function(d) { return cor_partido[partidos[ano][d.target.subindex]]; })
	    	.attr("d", d3.svg.chord().radius(innerRadius))
			.attr("id",function(d){ return "caminho-" + partidos[ano][d.target.index] + "-" + partidos[ano][d.target.subindex];})

	return svg
}

/**************** MENUS ********************/
$(document).ready(function(){
  $("#choices").hide();
  $("#navegacao_topo a.drop").click(function(){
    if ($("#choices").is(":visible")) {
      $("#choices").hide();
    }else{
      var choices = $(this).attr("title").split(",");
      choices_parsed = "";
      for (var i = 0; i < choices.length; i++) {
        choices_parsed += "<div id='choice_"+choices[i]+"' class='"+((choices[i].indexOf("#") == -1)?"choices":"submenu")+"'>"+choices[i].replace(/_/g," ").replace(/#/g,"")+"</div>"
      };
      $("#choices").html(choices_parsed).css("left",$(this).position().left + "px").width($(this).outerWidth()).show().css("cursor", "pointer");
    };
  })

  $(".choices").die("click");
  $(".choices").live("click",function(){
    	$("#choices").hide();
		  escolha = $(this).attr("id")
		  if (/(Biomas2012)/.test(escolha)) {
	      window.location.href = "../../html/biomas2012"
		  } else if (/(Coligações)/.test(escolha)) {
		  	window.location.href="../../html/coligacoes"
		  } else if (/(Cotas)/.test(escolha)) {
		  	window.location.href="../../html/cotas"
		  } else if (/(Eleições_2012)/.test(escolha)) {
		  	window.location.href="../../html/eleicoes2012"
		  } else if (/(Fuvest_2013)/.test(escolha)) {
		  	window.location.href="../../html/fuvest2013"
		  } else if (/(IDEB)/.test(escolha)) {
		  	window.location.href="../../html/ideb"
		  } else if (/(Intenção_de_Voto)/.test(escolha)) {
		  	window.location.href="../../html/intencaodevoto"
		  } else if (/(Lista_ENEM_2011)/.test(escolha)) {
		  	window.location.href="../../html/listaenem2011"
		  } else if (/(Que_SP_vc_quer?)/.test(escolha)) {
		  	window.location.href="../../html/quespvcquer"
		  } else if (/(Religiões)/.test(escolha)) {
		  	window.location.href="../../html/religiao"
		  } else if (/(São_Paulo_que_balança)/.test(escolha)) {
		  	window.location.href="../../html/saopauloquebalanca"
      } else {
		  //  console.log(escolha)
		  novo_numero_de_partidos = escolha.replace("choice_","").replace("_Partidos","")
		  if(novo_numero_de_partidos != numero_de_partidos) {
			 	 numero_de_partidos = novo_numero_de_partidos
			 $("#chart_2012").empty()
			 $("#legenda").empty()
			 $("#titulo_chamada").text(titulos_chamada[2012][numero_de_partidos])
			 $("#texto_chamada").text(textos_chamada[2012][numero_de_partidos])
			 graficos['2012'][numero_de_partidos] = gera_grafico(2012, numero_de_partidos, "chart_2012") /* Gráfico com N partidos */
		}
  	}
  }).css("cursor", "pointer")
})
/**************** FIM DOS MENUS ********************/
/*************************************************************************************************************/

var width = 800,
    height = 800,
    innerRadius = Math.min(width, height) * .35,
    outerRadius = innerRadius * 1.22

var	cor_partido = {}
	cor_partido['PMDB'] = "#D9C52E"
	cor_partido['PT']   = "#E81518"
	cor_partido['PSDB'] = "#1518E8"
	cor_partido['PSD']  = "#59C43B"
	cor_partido['PP']  = "#7C2CF5"
	cor_partido['PSB']  = "#FFA200"
	cor_partido['PDT'] = "#34E0A4"
	cor_partido['PTB'] = "#E36432"
	cor_partido['DEM']  = "#62B5D1"
	cor_partido['PR'] = "#87E034"
	
/** Código do gráfico dos cabeças de chapa **/
var partidos = {}
	partidos['2012'] = ["PMDB","PT","PSDB","PSD","PSB","PP","PDT","PTB","DEM","PR"]
//	partidos['2008'] = ["PMDB","PT","PSDB","DEM","PSB"]

var total_candidatos = {}
	total_candidatos['2012']=["2.292", "1.789", "1.639", "1.094", "1.044", "1.079", "848", "832", "739", "714"]
//	total_candidatos['2012']=[2292, 1789, 1639, 1094, 1079,1044,848,832,739,714]

var dados = {}
	dados['2012']={}
	dados['2012']['5'] = [
		[145, 811, 594, 523, 509],
		[414, 301, 188, 321, 464],
		[429, 155, 86, 520, 385],
		[321, 317, 342, 49, 304],
		[272, 367, 258, 307, 64]
	]
	
	dados['2012']['10'] = [
		[145,811,594,523,509,611,597,627,564,545],
		[414,301,188,321,464,342,471,348,166,320],
		[429,155,86,520,385,548,394,519,640,414],
		[321,317,342,49,304,372,302,295,314,315],
		[272,367,258,307,64,275,301,274,226,246],
		[251,299,351,267,226,86,270,295,295,258],
		[217,276,216,179,194,214,83,214,172,171],
		[231,246,221,186,192,256,212,72,226,209],
		[193,88,271,195,174,209,167,181,70,211],
		[174,213,211,182,170,194,171,204,255,39],
	]

var titulos_chamada={}
	titulos_chamada[2012]={}
	titulos_chamada[2012][5]="PMDB domina coligações na eleição de 2012"
	titulos_chamada[2012][10]="PSDB costura mais alianças que o PT nas eleições para prefeito"
var textos_chamada={}
	textos_chamada[2012]={}
	textos_chamada[2012][5]="O PMDB é o partido que mais coligações fez nas eleições de prefeito em 2012. Suas conexões são mais largas porque envolvem mais candidatos. Como ele recebe mais apoios do que dá, suas conexões são todas da sua cor (amarelo). Já o PSD oferece mais apoios do que recebe, por isso suas conexões são das cores de seus aliados. Escolha um partido na roda e bom jogo."
	textos_chamada[2012][10]="O PSDB entra nas eleições para prefeito com menos candidatos que em 2008, mas ocupa o segundo lugar em apoios recebidos, atrás do PMDB e à frente do PT. Já DEM, PP, PDT, PTB e PR, que também perderam candidatos, são pequenos até em número de apoios e recebem menos do que oferecem. Escolha um partido na roda e bom jogo."

var graficos = {}
graficos['2012']={}
graficos['2012']['10'] = gera_grafico(2012, 10, "chart_2012") /* Gráfico com 10 partidos */
//graficos['2012']['10'] = gera_grafico(2012, 10, "chart_2012") /* Gráfico com 5 partidos */
//graficos['2008'] = gera_grafico(2008, "chart_2008")
