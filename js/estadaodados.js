var Main = (function() {
    /*************************************************************************************************************/

    var width = 800,
        height = 800,
        innerRadius = Math.min(width, height) * .35,
        outerRadius = innerRadius * 1.22;

    var cor_partido = {};
      cor_partido['PMDB'] = "#D9C52E";
      cor_partido['PT']   = "#E81518";
      cor_partido['PSDB'] = "#1518E8";
      cor_partido['PSD']  = "#59C43B";
      cor_partido['PP']   = "#7C2CF5";
      cor_partido['PSB']  = "#FFA200";
      cor_partido['PDT']  = "#34E0A4";
      cor_partido['PTB']  = "#E36432";
      cor_partido['DEM']  = "#62B5D1";
      cor_partido['PR']   = "#87E034";

    /** Código do gráfico dos cabeças de chapa **/
    var partidos = {};
        partidos['2012'] = ["PMDB","PT","PSDB","PSD","PSB","PP","PDT","PTB","DEM","PR"];
        partidos['2014'] = ["PMDB","PT","PSDB","PSD","PSB","PP","PDT","PTB","DEM","PR"];

    var total_candidatos = {};
        total_candidatos['2012']=["2.292", "1.789", "1.639", "1.094", "1.044", "1.079", "848", "832", "739", "714"];
        total_candidatos['2014']=["2.292", "1.789", "1.639", "1.094", "1.044", "1.079", "848", "832", "739", "714"];

    var full_dados = {
        '2012': [
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
        ],
        '2014': [
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
    },
    dados = null,
    grafico = null,
    _basicos = {
        'anos': [2012, 2014],
        'max_partidos': 10
    },
    _default = {'ano':2012,'partidos':10},
    _currentRoute = {
        'ano': "2012",
        'partidos': "10"
    };

    //
    //From http://mkweb.bcgsc.ca/circos/guide/tables/

    //*/
    // Returns an array of tick angles and labels, given a group.
    function _group_ticks(d) {
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
    function _fade(opacity) {
      return function(g, i) {
            grafico.selectAll("g.chord_caminho")
              .filter(function(d) {
              return d.source.index == i || d.target.index == i;
            })
            .transition()
              .style("opacity", opacity);
      }
    }
    //*/

    function _mouse_sobre(ano, indice_partido, opacidade, numPartidos){
        grafico.selectAll("g.chord_caminho")
          .filter(function(d) {
            return d.source.index == indice_partido || d.target.index == indice_partido;
            })
        .transition()
            .style("opacity", opacidade);

        $("#cabeca_de_chapa").text(partidos[ano][indice_partido]);
        $("#cabeca_de_chapa").removeClass();
        $("#cabeca_de_chapa").addClass(partidos[ano][indice_partido]);
        for ( i=0 ; i<numPartidos ; i++ ){
          $("#apoios_partido" + i).text(dados[indice_partido][i]);
          $("#partido" + i).text(partidos[ano][i]);
        }
    }

    //Calcula o total de coligações que o partido encabeça (soma da linha da matriz)
    function _cabeca_total(ano, indice_partido, numPartidos) {
      var retorno = 0;
      for ( i=0 ; i<numPartidos ; i++ )
        retorno+=dados[ano][numPartidos][indice_partido][i];
      return retorno;
    }

    function _gera_legenda(numPartidos) {
      $("#legenda").append("<span id='cabeca_de_chapa' style=''>Partido</span><br/><br/>");
      $("#legenda").append("Apoios recebidos:<br/><br/>");
      for ( i=0 ; i<numPartidos ; i++) {
        $("#legenda").append("<span id='apoios_partido" + i + "'></span> do <span id='partido" + i + "' class='legenda_nome_partidos'></span><br/>");
      }
    }

    /*************************************************************************************************************/

    function _filtra_dados(ano, numPartidos){
        var retorno = []
        for (i=0; i< numPartidos; i++){
            retorno[i] = [];
            for (j=0; j<numPartidos; j++){
                retorno[i][j] = full_dados[ano][i][j];
            }
        }
        return retorno;
    }

    function _gera_grafico(ano, numPartidos, div) {

        dados = _filtra_dados(ano,numPartidos);

        _gera_legenda(numPartidos);
        var chord_partidos = d3.layout.chord()
          .padding(.05)
          .matrix(dados);

        var svg = d3.select("#" + div)
            .append("svg")
            .attr("id", "chordChart")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox","0 " + "0 " + width + " " + height)
            .attr("preserveAspectRatio","xMidYMid")
            .append("g")
              .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // BORDA LATERAL
        // Adiciona apenas um grupo (g) para cada borda que será desenhada mais abaixo
        svg.append("g")
          .attr("class","chord_bases")
          .selectAll("path.chord")
            .data(chord_partidos.groups)
          .enter().append("g")
          .attr("class", "chord_base");

        // Seleciona cada uma dos grupos (g) de bordas criados acima
        var bordas = svg.selectAll("g.chord_base")
              .on("mouseover", function(d) { return _mouse_sobre(ano, d.index , 1, numPartidos); })
              .on("mouseout", _fade(.05,numPartidos));

          // Adiciona a borda em si a cada um dos grupos
          bordas.append("path")
              .style("fill", function(d) { return cor_partido[partidos[ano][d.index]]; })
            .attr("id", function(d) { return "borda-" + partidos[ano][d.index]; })
              .style("stroke", function(d) { return cor_partido[partidos[ano][d.index]]; })
              .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius));

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
            .style("letter-spacing",1);

          // Adiciona a quantidade de candidatos do partido
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
            .style("opacity",1);

        // CURVAS (PATHS) ENTRE OS partidos_2012

        // Cria as curvas (paths) entre os partidos_2012
        svg.append("g")
            .attr("class", "chord")
          .selectAll("path")
            .data(chord_partidos.chords)
          .enter().append("g")
          .attr("class", "chord_caminho");

        var caminho = svg.selectAll("g.chord_caminho")
            .style("opacity", .05)
          // Adicionaod Path entre dois partidos
          caminho.append("path")
              .style("fill", function(d) { return cor_partido[partidos[ano][d.target.subindex]]; })
              .attr("d", d3.svg.chord().radius(innerRadius))
            .attr("id",function(d){ return "caminho-" + partidos[ano][d.target.index] + "-" + partidos[ano][d.target.subindex];});

        var aspect = width / height,
            chart = $("#chordChart");
        $(window).on("resize", function() {
            var targetWidth = chart.parent().width();
            chart.attr("width", targetWidth);
            chart.attr("height", targetWidth / aspect);
        });

        return svg;
    }

    function _atualiza_seletores(){
        $(".botao-ano")[0].innerHTML = _currentRoute["ano"];
        $(".input-partidos")[0].value = _currentRoute["partidos"];
    }

    function atualiza_num_partidos(el){
        crossroads.parse('/partidos/' + el.value);
    }

    function inicializa(){
        crossroads.addRoute('/ano/{anoe}/partidos/{part}', function(anoe, part){
            anoe = parseInt(anoe);
            _currentRoute["ano"] = _basicos["anos"].indexOf(anoe) >= 0 ? anoe : _default['ano'];
            part = parseInt(part);
            _currentRoute["partidos"] = part <= _basicos["max_partidos"] ? part : _default['partidos'];
        });

        crossroads.addRoute('/partidos/{part}/ano/{anoe}', function(part, anoe){
            anoe = parseInt(anoe);
            _currentRoute["ano"] = _basicos["anos"].indexOf(anoe) >= 0 ? anoe : _default['ano'];
            part = parseInt(part);
            _currentRoute["partidos"] = part <= _basicos["max_partidos"] ? part : _default['partidos'];
        });

        crossroads.addRoute('/ano/{anoe}', function(anoe){
            anoe = parseInt(anoe);
            _currentRoute["ano"] = _basicos["anos"].indexOf(anoe) >= 0 ? anoe : _default['ano'];
        });

        crossroads.addRoute('/partidos/{part}', function(part){
            part = parseInt(part);
            _currentRoute["partidos"] = part <= _basicos["max_partidos"] ? part : _default['partidos'];
        });

        crossroads.routed.add(function(request, data){
            window.location.hash = "#ano/" + _currentRoute["ano"] + "/partidos/" + _currentRoute["partidos"];
            novo_grafico();
            _atualiza_seletores();
        });

        var a = $('.link-ano');
        for (var i=0; i<a.length; i++){
            a[i].onclick=function(e){
                e.preventDefault();
                crossroads.parse('/ano/' + this.href.split("#ano/").pop());
            }
        };

        var a = $('.link-partidos');
        for (var i=0; i<a.length; i++){
            a[i].onchange=function(e){
                e.preventDefault();
                crossroads.parse('/partidos/' + this.value);
            }
        };
        grafico = _gera_grafico(_currentRoute['ano'], _currentRoute['partidos'], "chart")

        if (window.location.hash) {
            crossroads.parse("/" + window.location.hash.split("#").pop());
        } else {
            crossroads.parse('/ano/2012/partidos/10');
        }
    }

    function novo_grafico(){
        $("#legenda").empty();
        $("#chart").empty();
        grafico = _gera_grafico(_currentRoute['ano'], _currentRoute['partidos'], "chart")
    }

    return {
        inicializa: inicializa,
        novoGrafico: novo_grafico,
        atualiza_num_partidos: atualiza_num_partidos
    };

})();


$(document).ready(function(){
    Main.inicializa();
});
