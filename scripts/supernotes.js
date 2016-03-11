function showSupernote(supernote, number, volume, issue) {
  var supernoteId = 'sn-' + supernote['type'] + '-' + number;

  if ($('#' + supernoteId).length === 0) {
    var paragraphPack = $('#paragraph-' + number).parent('.paragraph-pack');
    var supernoteContainer = $('<div/>')
                                .attr('id', supernoteId)
                                .addClass('supernote-container');
    var supernoteList = $('<ul/>')
                            .addClass('supernote-' + supernote['type']);

    for (var i = 0; i < supernote['notes'].length; i++) {
      var note = buildNote(
                  supernote['type'], supernote['notes'][i],
                  number, volume, issue, supernote['notes'].length);
      $(supernoteList).append(note);

    }

    $(supernoteContainer).append(supernoteList);
    $(paragraphPack).append(supernoteContainer);

    if (supernote['type'] == 'map') {
      for (var i = 0; i < supernote['notes'].length; i++) {
        activateMap(supernote['notes'][i], number);
      }
    }
  }
}

function buildNote(type, note, number, volume, issue, noteCount) {
  switch (type) {
    case 'commentary':
      return buildCommentary(note);
      break;
    case 'citation':
      return buildCitation(note);
      break;
    case 'image':
      if (noteCount > 1) {
        return buildGalleryImage(note, number, volume, issue);
      } else {
        return buildImage(note, volume, issue);
      }
      break;
    case 'video':
      return buildVideo(note);
      break;
    case 'link':
      return buildLink(note);
      break;
    case 'map':
      return buildMap(note, number);
      break;
  }
}

function buildCommentary(note) {
  return $('<li/>').append($('<div/>').addClass('contents').html(note));
}

function buildCitation(note) {
  return $('<li/>').append($('<div/>').addClass('contents').html(note));
}

function buildLink(note) {
  var link = $('<a/>')
                .attr('href', note['url'])
                .attr('target', '_blank')
                .html(note['label']);

  return $('<li/>').append(link);
}

function buildMap(note, number) {
  var mapContainer = $('<div/>')
                        .attr('id', 'map-supernote-' + number)
                        .addClass('inline-leaflet-map');

  return mapContainer;
}

function activateMap(note, number) {
  var layer = new L.StamenTileLayer(note['tileset']);
  var map = L.map('map-supernote-' + number, {
    center: 
      new L.LatLng(note['center']['latitude'], note['center']['longitude']),
    zoom: parseInt(note['zoom']),
    minZoom: parseInt(note['minZoom']),
    maxZoom: parseInt(note['maxZoom'])
  });

  map.setView([note['center']['latitude'], note['center']['longitude']],
              parseInt(note['zoom']));

  map.attributionControl.addAttribution('Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.');
  map.addLayer(layer);

  for (var i = 0; i < note['markers'].length; i++) {
    var marker = note['markers'][i];

    L.marker([marker['position']['latitude'], marker['position']['longitude']])
     .addTo(map)
     .bindPopup(marker['message']);
  }
}

function buildImageLink(note, volume, issue, thumb) {
  if (thumb) {
    var prefix = 'thumb-';
  } else {
    var prefix = 'medium-';
  }
  var imageDirectory = 
        '/images/issues/' + volume + '/' + issue + '/supernotes/';
  var link = $('<a/>')
                .attr('href', imageDirectory + 'large-' + note['url'])
                .addClass('fancybox');
  var image = $('<img/>')
                .attr('src', imageDirectory + prefix + note['url']);

  return $(link).append(image);
}

function buildGalleryImage(note, number, volume, issue) {
  var link = buildImageLink(note, volume, issue, true);

  if ((note['caption'].length > 0) || (note['credit'].length > 0)) {
    var titleString = '';
    if (note['caption'].length > 0) {
      titleString += note['caption'];
    }
    if (note['credit'].length > 0) {
      titleString += '<span class="credit">' + note['credit'] + '</span>';
    }

    $(link).attr('title', titleString);
  }

  $(link).attr('rel', 'gallery-' + number);

  return $('<li/>').addClass('gallery').append(link);
}

function buildImage(note, volume, issue) {
  var link = buildImageLink(note, volume, issue, false);
  var result = $('<li/>').append(link);

  if ((note['caption'].length > 0) || (note['credit'].length > 0)) {
    var caption = $('<p/>').addClass('caption');
    if (note['caption'].length > 0) {
      $(caption).html(note['caption']);
    }
    if (note['credit'].length > 0) {
      $(caption).append($('<span/>').addClass('credit').html(note['credit']));
    }

    $(result).append(caption);
  }

  return result;
}

function buildVideo(note) {
  var result = $('<li/>');
  var embed = $('<iframe/>')
                .attr('src', 
                  'https://youtube.com/embed/' + 
                  note['id'] + '?rel=0&showinfo=0')
                .attr('allowfullscreen', 'allowfullscreen')
                .attr('width', note['width'])
                .attr('height', note['height'])
                .attr('frameborder', 0);

  $(result).append(embed);
  if (note['caption'].length > 0) {
    $(result).append($('<p/>').html(note['caption']));
  }

  return result;
}

function supernoteLinkTitle(type, count, number) {
  var label;
  var plural = count > 1;

  switch (type) {
    case 'commentary':
      label = (plural) ? 'Commentaries' : 'Commentary';
      break;
    case 'citation':
      label = (plural) ? 'Citations' : 'Citation';
      break;
    case 'image':
      label = (plural) ? 'Images' : 'Image';
      break;
    case 'video':
      label = (plural) ? 'Videos' : 'Video';
      break;
    case 'map':
      label = (plural) ? 'Maps' : 'Map';
      break;
    case 'link':
      label = (plural) ? 'Links' : 'Link';
      break;
  }

  return label + ' for paragraph ' + number;
}

function buildSupernoteLink(supernote, number, volume, issue) {
  link = $('<a>')
            .attr('href', '#paragraph-' + number)
            .attr('id', supernote['type'] + '-' + number + '-supernote')
            .attr('title', 
              supernoteLinkTitle(
                supernote['type'], supernote['notes'].length, number))
            .addClass('supernote-icon')
            .addClass('icon-' + supernote['type']);
  $('#paragraph-' + number).append(link);

  (function(supernote, paragraph) {
    var linkId = '#' + supernote['type'] + '-' + paragraph + '-supernote';
    $(linkId).on('click', function(e) {
      e.preventDefault();
      showSupernote(supernote, paragraph, volume, issue);
    });
  })(supernote, number);
}

function buildSupernotes(data, volume, issue) {
  for (var i = 0; i < data.length; i++) {
    var number = parseInt(data[i]['paragraph']);

    for (var j = 0; j < data[i]['notes'].length; j++) {
      var supernote = data[i]['notes'][j];

      buildSupernoteLink(supernote, number, volume, issue);
    }
  }
}