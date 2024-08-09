$(document).ready(function () {
  const amenities = {};
  const states = {};
  const cities = {};

  // Listen to changes on each checkbox for amenities
  $('input[type="checkbox"]').change(function () {
    const id = $(this).attr('data-id');
    const name = $(this).attr('data-name');
    if ($(this).is(':checked')) {
      if ($(this).parent().parent().parent().hasClass('amenities')) {
        amenities[id] = name;
      } else if ($(this).parent().parent().parent().hasClass('locations')) {
        if ($(this).siblings('h2').length) { // State checkbox
          states[id] = name;
        } else { // City checkbox
          cities[id] = name;
        }
      }
    } else {
      if ($(this).parent().parent().parent().hasClass('amenities')) {
        delete amenities[id];
      } else if ($(this).parent().parent().parent().hasClass('locations')) {
        if ($(this).siblings('h2').length) { // State checkbox
          delete states[id];
        } else { // City checkbox
          delete cities[id];
        }
      }
    }
    updateLocations();
    updateAmenities();
  });

  // Update locations h4 tag
  function updateLocations () {
    const locationNames = Object.values(states).concat(Object.values(cities)).join(', ');
    $('div.locations h4').text(locationNames || '&nbsp;');
  }

  // Update amenities h4 tag
  function updateAmenities () {
    const amenityNames = Object.values(amenities).join(', ');
    $('div.amenities h4').text(amenityNames || '&nbsp;');
  }

  // Check API status
  $.get('http://0.0.0.0:5001/api/v1/status/', function (data) {
    if (data.status === 'OK') {
      $('#api_status').addClass('available');
    } else {
      $('#api_status').removeClass('available');
    }
  });

  // Load places
  $('button').click(function () {
    const filters = {
      amenities: Object.keys(amenities),
      states: Object.keys(states),
      cities: Object.keys(cities)
    };
    $.ajax({
      type: 'POST',
      url: 'http://0.0.0.0:5001/api/v1/places_search/',
      data: JSON.stringify(filters),
      contentType: 'application/json',
      success: function (data) {
        $('section.places').empty();
        for (const place of data) {
          const article = $('<article></article>');
          article.append('<div class="title_box"><h2>' + place.name + '</h2><div class="price_by_night">$' + place.price_by_night + '</div></div>');
          article.append('<div class="information"><div class="max_guest">' + place.max_guest + ' Guest' + (place.max_guest !== 1 ? 's' : '') + '</div>' +
            '<div class="number_rooms">' + place.number_rooms + ' Bedroom' + (place.number_rooms !== 1 ? 's' : '') + '</div>' +
            '<div class="number_bathrooms">' + place.number_bathrooms + ' Bathroom' + (place.number_bathrooms !== 1 ? 's' : '') + '</div></div>');
          article.append('<div class="description">' + place.description + '</div>');
          $('section.places').append(article);
        }
      }
    });
  });

  // Toggle reviews
  $('#toggle-reviews').click(function () {
    const action = $(this).attr('data-action');
    if (action === 'show') {
      $.get('http://0.0.0.0:5001/api/v1/reviews/', function (data) {
        $('#reviews-container').empty();
        const ul = $('<ul></ul>');
        for (const review of data) {
          const li = $('<li></li>');
          li.append('<h3>From ' + review.user.first_name + ' ' + review.user.last_name + ' the ' + new Date(review.date).toLocaleDateString() + '</h3>');
          li.append('<p>' + review.text + '</p>');
          ul.append(li);
        }
        $('#reviews-container').append(ul);
        $('#toggle-reviews').text('hide').attr('data-action', 'hide');
      });
    } else {
      $('#reviews-container').empty();
      $('#toggle-reviews').text('show').attr('data-action', 'show');
    }
  });
});
