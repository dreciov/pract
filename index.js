// Show accomodations from a JSON file in a map.
// JSON file with accomodations is an adaption of the XML file
// with accomodations in Madrid from the open data portal of
// Ayuntamiento de Madrid (as of April 2016)
// Simple version. Doesn't work well if some of the fields are not defined.
// (for example, if there are no pictures)
//
var i = 0;
var z = 0;
var colecciones = [];
var coleccionesusuarios = [];
var texto;
var user = "dreciov";
var mostrarcol=false;
var mostrarusr = false;
function show_accomodation(){
  var accomodation = accomodations[$(this).attr('no')];
  var lat = accomodation.geoData.latitude;
  var lon = accomodation.geoData.longitude;
  var url = accomodation.basicData.web;
  var name = accomodation.basicData.name;
  var desc = accomodation.basicData.body;
  var img = accomodation.multimedia.media[0].url;
  var cat = accomodation.extradata.categorias.categoria.item[1]['#text'];
  var subcat = accomodation.extradata.categorias.categoria
   .subcategorias.subcategoria.item[1]['#text'];
   var marker = L.marker([lat, lon]).addTo(map)
	 .bindPopup('<a href="' + url + '">' + name + '</a><br/>')
	 .openPopup();
	marker.on("popupclose", function(){
		map.removeLayer(marker);
	})

  map.setView([lat, lon], 15);
  $('#info').html('<h2>' + name + '</h2>'
   + '<p>Type: ' + cat + ', subtype: ' + subcat + '</p>'
   + desc + '<img src="' + img + '"">');
};

function get_accomodations(){
  $.getJSON("alojamientos.json", function(data) {
    $('#get').html('');
    accomodations = data.serviceList.service
    //$('#list').after('<h1>' + accomodations.length + '</h1>');
    var list = '<p>Accomodations found: ' + accomodations.length
     + ' (click on any of them for details and location in the map)</p>'
    list = list + '<ul>'
    for (var i = 0; i < accomodations.length; i++) {
      list = list + '<li no=' + i + '>' + accomodations[i].basicData.title + '</li>';
    }
    list = list + '</ul>';
    $('#list').html(list);
    $("#listcolections").html(list);
    $("#listusers").html(list);
    $('#list li').click(show_accomodation);
    $("#listcolections li, #listusers li").draggable({
    	revert: 'invalid	',
        helper: 'clone',
        cursor: 'move'
    });
  });
};

$(document).ready(function() {
  map = L.map('map').setView([40.4175, -3.708], 11);
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
   $(function() {
   		 $( "#general" ).tabs();
 	 });
   $(function() {
 	 	$("#button").button();
 	 });

    $("#cargarguardarcol *").hide();
     $("#cargarguardarusuarios *").hide();

   $("#mostrarguardarcol").click(function(){
    if(mostrarcol===false){
     $("#cargarguardarcol *").show();
      mostrarcol = true;
    }else if(mostrarcol===true){
      $("#cargarguardarcol *").hide();
      mostrarcol = false;
    }

   })

   $("#mostrarguardarusuarios").click(function(){
    if(mostrarusr===false){
     $("#cargarguardarusuarios *").show();
      mostrarusr = true;
    }else if(mostrarusr===true){
      $("#cargarguardarusuarios *").hide();
      mostrarusr = false;
    }

   })

//colecciones de usuarios
    $("#users").droppable({
      accept: "#listusers li",
    drop: function(event,ui){
      var valor = $(ui.draggable).text();
      var y = $("<div id=listausuario"+z+" style = width:200px></div>");
      y.droppable({ 
        drop: function(ev, ui){
        $(this).append($(ui.draggable).clone());
      }
      })
      //$(this).append($(ui.draggable).clone());
      $(this).append("<h3 id =nombrelistausuario"+z+" style=width:200px>"+valor+"</h3>");
      $(this).append(y);
      $("#users").accordion({collapsible: true, active:true, heightStyle: "content"})
  .accordion("refresh");
    z = z + 1;
    }
  })

  $("#get").click(get_accomodations);
 
 //CREAR COLECCIONES DE HOTELES
  $("#botoncoleccion").click(function(){
	var val = $("#display").val();
	if(val!=""){
	var x = $("<div id=lista"+i+" style=height: 800px;></div>");
	$("#colections").append("<h3 id =coleccion"+i+">"+val+"</h3>");
	$("#colections").append(x);
	x.droppable({
		drop: function(ev, ui){
 			$(this).append($(ui.draggable).clone());
 		}
	})
	$("#colections").accordion({collapsible: true, active:true, heightStyle: "content"})
	.accordion("refresh");
  i = i+1;
	}
})
  $("#botonusers").click(function(){
	var val = $("#display2").val();
	if(val!=""){
    $("#usuarios").append("<li>"+val+"</li>");
    $("#usuarios li").draggable({
        revert: 'invalid  ',
        helper: 'clone',
        cursor: 'move'
    });
	/*var x = $("<div style=height: 800px;></div>");
	$("#users").append("<div>"+val+"</div>");
	$("#users").append(x);
	x.droppable({
		drop: function(ev, ui){
 			$(this).append($(ui.draggable).clone());
 		}
	})
	$("#users").accordion({collapsible: true, active:true, heightStyle: "content"})
	.accordion("refresh");*/
	}
})

$("#guardar").click(function(){
  var token = $("#token").val();
  var repositorio = $("#repo").val();
  var fichero = $("#fich").val();
  var github = new Github({token:token,auth: "oauth"});
  for(var j=0; j<=i-1;j++){
    var hoteles = [];
    var col = $("#coleccion"+j).text();
    colecciones[col] = [];
    var lista = $("#lista"+j+" li");
    for(var k=0; k<= lista.length-1;k++){
      hoteles[k]=($(lista[k]).text());
  }
  var objeto ={
    nombre: col,
    lista: hoteles,
  }
  colecciones.push(objeto);
  //colecciones[col]=hoteles;
  };
  console.log(i);
  var texto = JSON.stringify(colecciones);
  var repositorio_git = github.getRepo(user, repositorio);
  repositorio_git.write("gh-pages",fichero,texto,"fichero",function(err){});
  repositorio_git.write("master",fichero,texto,"fichero",function(err){});

})

$("#cargar").click(function(){
var url = $("#ficherocolecciones").val();
  $.getJSON(url, {
    format: "json"
  })
  .done(function(data){
    for(var j=0; j<= data.length-1;j++){
      $("#colections").append("<h3 id=coleccion"+i+">"+data[j].nombre+"</h3>");
      var x = $("<div id=lista"+i+" style=height: 800px;></div>");
      $("#colections").append(x);
      x.droppable({
        drop: function(ev,ui){
          $(this).append($(ui.draggable).clone());
        }
      })

      for(var k=0; k<=data[j].lista.length-1;k++){
        $("#lista"+i).append("<li>"+data[j].lista[k]+"</li>");
      }
      $("#colections").accordion({collapsible: true, active:true, heightStyle: "content"})
      .accordion("refresh");
      i = i+1;
    }

  })
});

///usuarios
$("#guardar2").click(function(){
  var token = $("#token2").val();
  var repositorio = $("#repo2").val();
  var fichero = $("#fich2").val();
  var github = new Github({token:token,auth: "oauth"});
  for(var j=0; j<=z-1;j++){
    var hoteles = [];
    var col = $("#nombrelistausuario"+j).text();
    coleccionesusuarios[col] = [];
    var lista = $("#listausuario"+j+" li");
    for(var k=0; k<= lista.length-1;k++){
      hoteles[k]=($(lista[k]).text());
  }
  var objeto ={
    nombre: col,
    lista: hoteles,
  }
  coleccionesusuarios.push(objeto);
  };
  var texto = JSON.stringify(coleccionesusuarios);
  var repositorio_git = github.getRepo(user, repositorio);
  repositorio_git.write("gh-pages",fichero,texto,"fichero",function(err){});
  repositorio_git.write("master",fichero,texto,"fichero",function(err){});

})

$("#cargar2").click(function(){
var url = $("#ficherousuarios").val();
  $.getJSON(url, {
    format: "json"
  })
  .done(function(data){
    for(var j=0; j<= data.length-1;j++){
      $("#users").append("<h3 id=nombrelistausuario"+z+">"+data[j].nombre+"</h3>");
      var x = $("<div id=listausuario"+z+" style=height: 800px;></div>");
      $("#users").append(x);
      x.droppable({
        drop: function(ev,ui){
          $(this).append($(ui.draggable).clone());
        }
      })

      for(var k=0; k<=data[j].lista.length-1;k++){
        $("#lista"+i).append("<li>"+data[j].lista[k]+"</li>");
      }
      $("#users").accordion({collapsible: true, active:true, heightStyle: "content"})
      .accordion("refresh");
      z = z+1;
    }

  })
});
});